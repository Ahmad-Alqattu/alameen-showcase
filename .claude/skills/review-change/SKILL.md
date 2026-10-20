---
name: review-change
description: Use before saying a change to alameen-showcase is done or committing — the narrow checks per area and the slow ones to run once, in the background.
---
# review-change

1. `git status --short`. Other sessions may share this tree: stage your files by name only.
2. Narrow checks (the Stop hook already runs them at the end of each turn; don't repeat):
   `src/` → `npx tsc -b --noEmit` and `npx vitest run --reporter=dot`; `deck-app/src/` → `npx tsc -b --noEmit` in `deck-app`.
3. Slow ones once, in the background through `~/.claude/bin/heavy -n NAME -t 15 -- …`:
   `npm run build`, `npm run test:e2e`. Keep working meanwhile.
4. Look at the result once in the browser (one screenshot, console errors only); stop servers you started.
5. Report to the owner in short Arabic. Push only when he asks.
