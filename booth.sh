#!/bin/sh
# The booth laptop, offline: serve the SAME dist/ that is published, over
# localhost. No internet needed — the build only needs an HTTP origin,
# because browsers refuse module scripts over file://.
cd "$(dirname "$0")/dist" || exit 1
echo ""
echo "  المتصفح:  http://localhost:4173/?mode=kiosk"
echo "  للخروج من وضع المعرض:  http://localhost:4173/?mode=web"
echo ""
python3 -m http.server 4173
