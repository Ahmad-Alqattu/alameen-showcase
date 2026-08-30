#!/bin/sh
# Al-Ameen Booth — stop: close the booth Chrome (its own profile only, a normal
# browsing session is untouched) and stop the local server.
pkill -f "alameen-booth-chrome" 2>/dev/null
systemctl --user stop alameen-booth.service 2>/dev/null
echo "booth stopped"
