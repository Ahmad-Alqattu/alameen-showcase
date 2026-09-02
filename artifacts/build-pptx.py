"""Build a PowerPoint from a captured cut.

One full-bleed 16:9 picture per slide. The deck is a running web page whose type, colour and
Arabic shaping are the point; re-typesetting it into PowerPoint text boxes would lose the
shaping and gain nothing, since nobody edits a leave-behind. What this file is for is the
laptop with no browser and the email attachment.

Where a scene plays a recording of the product, the real MP4 goes into the slide on top of
the still, positioned exactly where the film sits on the page (`films.json`, written by the
capture). A recording of software working is the strongest thing in the deck, and a
photograph of it is not the same claim — so in PowerPoint it stays a film you press.

Whatever is in the chosen folder goes in, in filename order, so re-capturing a longer or
shorter cut needs no edit here.

    python3 artifacts/build-pptx.py [short|full]
"""
import json
import sys
from pathlib import Path

from pptx import Presentation
from pptx.util import Inches

HERE = Path(__file__).resolve().parent
PUBLIC = HERE.parent / "deck-app" / "public"
CUT = (sys.argv[1] if len(sys.argv) > 1 else "short").lower()

FOLDER = HERE / ("slides-full" if CUT == "full" else "slides-short")
OUT = HERE / (
    "Alameen-Technologies-Deck.pptx" if CUT == "full" else "Alameen-Technologies-Short.pptx"
)

frames = sorted(FOLDER.glob("slide-*.png"))
if not frames:
    raise SystemExit(f"no frames in {FOLDER.name} — run: node artifacts/capture-slides.mjs {CUT}")

films_file = FOLDER / "films.json"
films = {f["slide"]: f for f in json.loads(films_file.read_text())} if films_file.exists() else {}

# The capture is 1920 wide and the slide is 13.333in, so a page pixel is exactly 1/144 inch.
PX = Inches(1 / 144)

deck = Presentation()
deck.slide_width = Inches(13.333333)
deck.slide_height = Inches(7.5)
blank = deck.slide_layouts[6]

embedded = 0
for index, frame in enumerate(frames, start=1):
    slide = deck.slides.add_slide(blank)
    slide.shapes.add_picture(str(frame), 0, 0, width=deck.slide_width, height=deck.slide_height)

    film = films.get(index)
    if not film:
        continue

    # `src` and `poster` come back as the page saw them — "demos/<name>.mp4" under public/.
    mp4 = PUBLIC / film["src"].lstrip("./")
    poster = PUBLIC / film["poster"].lstrip("./")
    if not mp4.exists():
        print(f"  ! تخطّي الفيديو، غير موجود: {mp4}")
        continue

    slide.shapes.add_movie(
        str(mp4),
        PX * film["x"],
        PX * film["y"],
        PX * film["w"],
        PX * film["h"],
        poster_frame_image=str(poster) if poster.exists() else None,
        mime_type="video/mp4",
    )
    embedded += 1

deck.core_properties.title = "الأمين للتقنيات — منظومة واحدة"
deck.core_properties.author = "Al-Ameen Technologies"
deck.core_properties.subject = "Bilingual Arabic/English company and platform presentation"
deck.core_properties.comments = (
    "A static export of the running presentation, with the product recordings embedded as "
    "playable video. The live web deck additionally carries the rotating client register."
)

deck.save(OUT)
print(f"{OUT.name}  —  {len(frames)} شريحة، {embedded} فيديو مضمّن")
