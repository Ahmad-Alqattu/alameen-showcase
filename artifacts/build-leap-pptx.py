from pathlib import Path

from pptx import Presentation
from pptx.util import Inches

artifacts = Path(__file__).resolve().parent
output = artifacts / "Alameen-SABR-LEAP-2026-Ar-En.pptx"

deck = Presentation()
deck.slide_width = Inches(13.333333)
deck.slide_height = Inches(7.5)
blank = deck.slide_layouts[6]

for number in range(1, 8):
    slide = deck.slides.add_slide(blank)
    slide.shapes.add_picture(
        str(artifacts / f"leap-slide-{number}.png"),
        0,
        0,
        width=deck.slide_width,
        height=deck.slide_height,
    )

deck.core_properties.title = "Alameen Technologies × SABR — LEAP 2026"
deck.core_properties.subject = "Seven-scene bilingual Arabic/English presentation"
deck.core_properties.author = "Alameen Technologies"
deck.core_properties.comments = (
    "High-fidelity static export of the interactive presentation. "
    "Use the standalone web deck for the two live product recordings."
)
deck.save(output)
print(output)
