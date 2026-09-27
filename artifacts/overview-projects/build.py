"""Splice the flagship-projects section into the General Overview deck.

    python3 artifacts/overview-projects/build.py OVERVIEW.pptx [OUT.pptx]

The Overview deck is one full-bleed 1920x1080 still per slide, with two slides carrying a
product recording on top. Its slide 4 (five projects, each beside its funder) is replaced by
the scenes in `slides.py`: an index of eight projects with who each one runs for, then a
slide per project with its screens.

The stills carry their page number ("7 / 21") in the picture, so every kept slide is
re-stamped with its new number in the deck's own type before it goes back in. The recordings
go back as films, at the same place on the same slide they sat on before.
"""
import io
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from pptx import Presentation
from pptx.util import Emu

import slides

HERE = Path(__file__).resolve().parent
REPLACED = 4  # the old one-list projects slide
R_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def restamp(still: Path, n: int, out: Path) -> str:
    """A page that is the old still with its page number painted over and reset."""
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{slides.CSS}
body {{ background: url({still.as_uri()}) 0 0 / 1920px 1080px no-repeat; }}
.mask {{ position: absolute; left: 70px; top: 1018px; width: 150px; height: 36px; background: #F7F8FA; }}
</style></head><body><div class="mask"></div><div class="pnum">{n} / {slides.TOTAL_PAGES}</div></body></html>"""
    out.write_text(html, encoding="utf-8")
    return out.stem


def main():
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_name(src.stem + "-Projects.pptx")
    deck = Presentation(str(src))
    old = list(deck.slides)
    assert slides.TOTAL_PAGES == len(old) - 1 + len(slides.SCENES), "TOTAL_PAGES is stale"

    work = Path(tempfile.mkdtemp(prefix="overview-"))
    order = []   # (render name, films) in final order
    names = []

    def keep(i, slide):
        pic = next(s for s in slide.shapes if s.shape_type == 13)
        still = work / f"old-{i:02d}.png"
        still.write_bytes(pic.image.blob)
        films = []
        for sh in slide.shapes:
            if sh.shape_type != 16:  # MEDIA
                continue
            part = slide.part
            poster_rid = sh._element.xpath(".//a:blip/@r:embed")[0]
            video_rid = sh._element.xpath(".//a:videoFile/@r:link")[0]
            poster = work / f"poster-{i}-{len(films)}.jpg"
            video = work / f"film-{i}-{len(films)}.mp4"
            poster.write_bytes(part.related_part(poster_rid).blob)
            video.write_bytes(part.related_part(video_rid).blob)
            films.append((video, poster, sh.left, sh.top, sh.width, sh.height))
        name = restamp(still, len(order) + 1, work / f"old-{i:02d}.html")
        names.append(name)
        order.append((name, films))

    for i, slide in enumerate(old, start=1):
        if i == REPLACED:
            assert len(order) + 1 == slides.FIRST_PAGE
            for k, scene in enumerate(slides.SCENES):
                name = f"p-{k:02d}"
                (work / f"{name}.html").write_text(scene(len(order) + 1), encoding="utf-8")
                names.append(name)
                order.append((name, []))
        else:
            keep(i, slide)

    (work / "manifest.json").write_text(json.dumps(names))
    subprocess.run(["node", str(HERE / "render.mjs"), str(work)], check=True, cwd=HERE)

    out = Presentation()
    out.slide_width, out.slide_height = deck.slide_width, deck.slide_height
    blank = out.slide_layouts[6]
    for name, films in order:
        s = out.slides.add_slide(blank)
        s.shapes.add_picture(str(work / f"{name}.png"), 0, 0, out.slide_width, out.slide_height)
        for video, poster, x, y, w, h in films:
            s.shapes.add_movie(str(video), x, y, w, h, poster_frame_image=str(poster), mime_type="video/mp4")
    out.core_properties.title = deck.core_properties.title or "Alameen Technologies — General Overview"
    out.core_properties.author = "Al-Ameen Technologies"
    out.save(str(dst))
    print(f"{len(order)} slides → {dst}")


if __name__ == "__main__":
    main()
