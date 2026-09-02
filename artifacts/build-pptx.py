"""Build the PowerPoint from the captured scenes.

One full-bleed 16:9 picture per slide. The deck is a running web page whose type, colour and
Arabic shaping are the point; re-typesetting it into PowerPoint text boxes would lose the
shaping and gain nothing, since nobody edits a leave-behind. What this file is for is the
laptop with no browser and the email attachment.

Whatever is in `slides/` goes in, in filename order, so re-capturing a longer or shorter cut
needs no edit here.

    artifacts/pptx-venv/bin/python artifacts/build-pptx.py
"""
from pathlib import Path

from pptx import Presentation
from pptx.util import Inches

HERE = Path(__file__).resolve().parent
FRAMES = sorted((HERE / "slides").glob("slide-*.png"))
if not FRAMES:
    raise SystemExit("no frames in slides/ — run: node artifacts/capture-slides.mjs")

deck = Presentation()
deck.slide_width = Inches(13.333333)
deck.slide_height = Inches(7.5)
blank = deck.slide_layouts[6]

for frame in FRAMES:
    slide = deck.slides.add_slide(blank)
    slide.shapes.add_picture(
        str(frame), 0, 0, width=deck.slide_width, height=deck.slide_height
    )

deck.core_properties.title = "الأمين للتقنيات — منظومة واحدة"
deck.core_properties.author = "Al-Ameen Technologies"
deck.core_properties.subject = "Bilingual Arabic/English company and platform presentation"
deck.core_properties.comments = (
    "A static export of the running presentation. The live web deck carries the product "
    "recordings and the rotating client register, which a static file cannot."
)

out = HERE / "Alameen-Technologies-Deck.pptx"
deck.save(out)
print(f"{out}  —  {len(FRAMES)} شريحة")
