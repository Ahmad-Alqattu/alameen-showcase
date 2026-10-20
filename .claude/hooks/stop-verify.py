#!/usr/bin/env python3
"""Stop hook: once per turn, run only the fast checks for the kinds of files that are changed in the tree.

Checks are listed in checks.json beside this file: a regex over changed paths, the command, a timeout. A
check runs only when the set of matching files or their contents changed since its last clean run, so a
turn that edits nothing costs nothing. Failures go back to the model as a blocking Stop, cut to the first
lines, so a fix starts without a separate test run. The same report is never blocked twice in a row (an
error that belongs to another session would otherwise loop).
"""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, ".stop-verify-state.json")
MAX_LINES = 40


def run(cmd, cwd, timeout):
    try:
        p = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, timeout=timeout)
        return p.returncode == 0, (p.stdout + p.stderr)
    except subprocess.TimeoutExpired:
        return True, ""  # a slow machine is not a finding


try:
    hook_input = json.load(sys.stdin)
except Exception:
    hook_input = {}

ok, root = run("git rev-parse --show-toplevel", os.getcwd(), 10)
root = root.strip()
if not ok or not root:
    sys.exit(0)

try:
    with open(os.path.join(HERE, "checks.json"), encoding="utf-8") as f:
        checks = json.load(f)
except Exception:
    sys.exit(0)

ok, status = run("git status --porcelain=v1 --no-renames -uall", root, 20)
if not ok:
    sys.exit(0)
changed = [l[3:].strip() for l in status.splitlines() if len(l) > 3 and not l.startswith(" D") and not l.startswith("D ")]
if not changed:
    sys.exit(0)

try:
    with open(STATE, encoding="utf-8") as f:
        state = json.load(f)
except Exception:
    state = {}


def fingerprint(files):
    h = hashlib.sha256()
    for name in sorted(files):
        try:
            st = os.stat(os.path.join(root, name))
            h.update(f"{name}:{st.st_mtime_ns}:{st.st_size};".encode())
        except OSError:
            pass
    return h.hexdigest()


findings = []
for check in checks:
    files = [f for f in changed if re.search(check["paths"], f)]
    if not files:
        continue
    fp = fingerprint(files)
    if state.get("clean", {}).get(check["name"]) == fp:
        continue
    ok, out = run(check["command"], os.path.join(root, check.get("cwd", ".")), check.get("timeout", 120))
    if ok:
        state.setdefault("clean", {})[check["name"]] = fp
        continue
    lines = [l for l in out.splitlines() if l.strip()]
    head = "\n".join(lines[:MAX_LINES]) + (f"\n… {len(lines) - MAX_LINES} more lines" if len(lines) > MAX_LINES else "")
    findings.append(f"{check['name']} failed (`{check['command']}`):\n{head}")

report = "\n\n---\n\n".join(findings)
digest = hashlib.sha256(report.encode()).hexdigest() if report else None
repeat = digest is not None and digest == state.get("last_report")
state["last_report"] = digest
try:
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump(state, f)
except OSError:
    pass

if report and not repeat and not hook_input.get("stop_hook_active"):
    print(json.dumps({
        "decision": "block",
        "reason": "Fast checks on the files changed in the tree failed. Fix them at their cause (they may be "
                  "another session's work in progress — if so, say so and leave them):\n\n" + report,
    }))
sys.exit(0)
