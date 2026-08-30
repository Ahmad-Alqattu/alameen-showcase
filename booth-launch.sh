#!/bin/sh
# Al-Ameen Booth — one click: make sure the local server is up, then open Chrome
# on it in full screen. No internet needed.
#
# The server is a systemd user service (alameen-booth.service), not a background
# process started here: it survives this script exiting, comes back on its own if
# it crashes, and is already running after a reboot. Starting an already-running
# service is a no-op, so double-clicking twice is safe.

URL="http://localhost:4173/?mode=kiosk"

systemctl --user start alameen-booth.service 2>/dev/null

# Open the browser only once the server actually answers — never before.
i=0
while ! curl -sf -o /dev/null http://localhost:4173/; do
  i=$((i + 1))
  [ "$i" -ge 40 ] && break        # ~20s cap
  sleep 0.5
done

# A dedicated Chrome profile: no session-restore bubbles, no extensions, and the
# STOP launcher can close THIS window without touching normal browsing.
# --start-fullscreen, not --kiosk: full screen for the stand, but F11 and Esc
# still get you out without knowing any special key.
exec google-chrome \
  --user-data-dir="$HOME/.alameen-booth-chrome" \
  --no-first-run --no-default-browser-check \
  --start-fullscreen --new-window "$URL"
