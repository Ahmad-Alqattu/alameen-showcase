#!/usr/bin/env python3
"""PreToolUse guard for this repository's sessions (Bash, Read, Edit, Write, Grep, Glob).

Refuses, before they cost a round trip or do damage:
- destructive or bulk git commands (other sessions share this working tree);
- the full checks in the foreground (they take minutes; run them in the background through `heavy`);
- anything that opens the secret parts of the old Laravel copy, or runs code from it;
- any touch of ~/dev/alameen-municipal (another team's repository).
Everything else passes untouched. Settings live in guard.json beside this file.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
try:
    with open(os.path.join(HERE, "guard.json"), encoding="utf-8") as f:
        CFG = json.load(f)
except Exception:
    CFG = {}

data = json.load(sys.stdin)
tool = data.get("tool_name", "")
inp = data.get("tool_input") or {}


def deny(reason):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }}))
    sys.exit(0)


def norm(p):
    return os.path.normpath(os.path.expanduser(p)) if p else ""


# Paths no session may read or change. `forbidden` entries are folders; `secret_under` names, under a
# folder in `secret_roots`, the parts that hold live data or keys.
forbidden = [norm(p) for p in CFG.get("forbidden", [])]
secret_roots = [norm(p) for p in CFG.get("secret_roots", [])]
secret_parts = CFG.get("secret_under", [])


def path_problem(text):
    for root in forbidden:
        if root and root in text:
            return f"Blocked: {root} is out of bounds for this work (owner's rule). Do not read or change it."
    for root in secret_roots:
        if root and root in text:
            for part in secret_parts:
                if re.search(re.escape(root) + r"/" + part, text):
                    return (f"Blocked: {root} holds live personal data and keys in '{part}'. "
                            "Read only its views/controllers/routes for structure; never these parts.")
    return None


if tool in ("Read", "Edit", "Write", "NotebookEdit", "Grep", "Glob"):
    target = norm(inp.get("file_path") or inp.get("path") or inp.get("notebook_path") or "")
    problem = path_problem(target)
    if problem:
        deny(problem)
    sys.exit(0)

if tool != "Bash":
    sys.exit(0)

raw = inp.get("command", "")
# Heredoc bodies (commit messages) may mention these commands in prose; only judge what runs.
cmd = re.sub(r"<<-?['\"]?(\w+)['\"]?\n.*?\n\s*\1\b", "<<'HEREDOC'", raw, flags=re.S)
expanded = cmd.replace("~/", os.path.expanduser("~") + "/").replace("$HOME/", os.path.expanduser("~") + "/")

problem = path_problem(expanded)
if problem:
    deny(problem)
for root in secret_roots:
    if root and root in expanded and re.search(r"\b(php|artisan|composer|npm|node|python3?|bash|sh)\b", expanded):
        if not re.search(r"\bpython3?\s+-I\b", expanded):
            deny(f"Blocked: never run code from or inside {root}; read its files as data only.")

if re.search(r"\bgit\s+add\s+(-A\b|--all\b|\.(\s|$))", cmd):
    deny("Blocked: other sessions share this tree. Stage your own files by name, never `git add -A` / `git add .`.")
if re.search(r"\bgit\s+(reset\b.*--hard|clean\s+-\w*f|checkout\s+(--\s+)?\.(\s|$)|stash\b(?!\s+list))", cmd):
    deny("Blocked: this discards work, possibly another session's. Target specific files, or ask the owner first.")
if re.search(r"\bgit\s+(switch|checkout\s+-b|checkout\s+(?!--)\S+\s*$)", cmd):
    deny("Blocked: never switch branches in a shared working tree.")
if re.search(r"\bgit\s+push\b", cmd) and re.search(r"(\s--force(?!-with-lease)|\s-f\b)", cmd):
    deny("Blocked: force push. Ask the owner first.")
if re.search(r"\bgit\s+commit\b.*--no-verify", cmd):
    deny("Blocked: --no-verify. Fix the failing hook's cause instead.")

if not inp.get("run_in_background"):
    for pattern in CFG.get("background_only", []):
        if re.search(pattern, cmd):
            deny("This check takes minutes. Run it with run_in_background=true through "
                 "`~/.claude/bin/heavy -n NAME -t 15 -- COMMAND` (or a background `checker` agent) and keep "
                 "working; while iterating, run only the narrow check (see the review-change skill).")

sys.exit(0)
