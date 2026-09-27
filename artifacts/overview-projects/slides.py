"""The flagship-projects section of the General Overview deck, as HTML scenes.

The Overview deck is a run of 1920x1080 stills. Its projects slide was a list of five lines
with the funder beside each; the ask was for the projects themselves, with screenshots and the
organisations they run for, and without the funders. This writes one index scene and one scene
per project, typeset to match the stills around them, from the same content this repo already
carries (`src/data/showcase.json`, `public/assets/`).

    python3 artifacts/overview-projects/slides.py OUT_DIR

writes OUT_DIR/p-00.html … and OUT_DIR/manifest.json. `render.mjs` turns them into PNGs and
`build.py` splices them into the Overview pptx.
"""
import html
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "public" / "assets"
HERE = Path(__file__).resolve().parent
FONTS = HERE / "fonts"

DATA = json.loads((ROOT / "src" / "data" / "showcase.json").read_text())
PRODUCTS = {p["slug"]: p for p in DATA["products"]}
ESERVICES = PRODUCTS["eservices"]

# Where the new section sits in the deck, and the deck's length once it is in.
FIRST_PAGE = 4
TOTAL_PAGES = 29


def a(path: str) -> str:
    return (ASSETS / path).as_uri()


def e(text: str) -> str:
    return html.escape(text, quote=True)


# ── icons (stroke, 24 grid) ────────────────────────────────────────────────────────────────
ICONS = {
    "landmark": '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
    "building": '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "phone": '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    "droplet": '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    "map": '<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15"/>',
    "receipt": '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    "book": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
}


def icon(name: str, color: str, size: int = 20) -> str:
    return (
        f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="#{color}" '
        f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>'
    )


CSS = f"""
@font-face {{ font-family: NSA; src: url({(FONTS / 'noto-sans-arabic-arabic-400-normal.woff2').as_uri()}); font-weight: 400; }}
@font-face {{ font-family: NSA; src: url({(FONTS / 'noto-sans-arabic-arabic-500-normal.woff2').as_uri()}); font-weight: 500; }}
@font-face {{ font-family: NSA; src: url({(FONTS / 'noto-sans-arabic-arabic-600-normal.woff2').as_uri()}); font-weight: 600; }}
@font-face {{ font-family: NSA; src: url({(FONTS / 'noto-sans-arabic-arabic-700-normal.woff2').as_uri()}); font-weight: 700; }}
@font-face {{ font-family: NS; src: url({(FONTS / 'noto-sans-latin-400-normal.woff2').as_uri()}); font-weight: 400; }}
@font-face {{ font-family: NS; src: url({(FONTS / 'noto-sans-latin-600-normal.woff2').as_uri()}); font-weight: 600; }}
@font-face {{ font-family: NS; src: url({(FONTS / 'noto-sans-latin-700-normal.woff2').as_uri()}); font-weight: 700; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: 1920px; height: 1080px; overflow: hidden; }}
body {{ background: #F7F8FA; font-family: NS, NSA, sans-serif; color: #0F172A; position: relative; }}
.ar {{ font-family: NS, NSA; direction: rtl; }}
.head {{ position: absolute; top: 52px; left: 0; right: 0; text-align: center; }}
.eyebrow {{ display: inline-flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 700;
  letter-spacing: .14em; height: 40px; }}
.eyebrow .dot {{ opacity: .6; }}
.eyebrow .ar {{ letter-spacing: 0; font-weight: 500; font-size: 17px; }}
h1 {{ font-family: NS, NSA; font-weight: 600; font-size: 60px; line-height: 1.1; direction: rtl; margin-top: 0; }}
h2 {{ font-weight: 600; font-size: 30px; color: #64748B; line-height: 1.2; margin-top: 10px; }}
.d-ar {{ font-size: 19px; color: #64748B; margin-top: 12px; direction: rtl; }}
.d-en {{ font-size: 17px; color: #94A3B8; margin-top: 2px; }}
.foot {{ position: absolute; left: 80px; right: 80px; top: 1007px; border-top: 1px solid #E2E8F0; }}
.pnum {{ position: absolute; left: 80px; top: 1026px; font-size: 13px; font-weight: 700; color: #94A3B8; }}
.fright {{ position: absolute; left: 1560px; top: 1008px; }}
.card {{ background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; }}
.pt {{ direction: rtl; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 22px;
  font-size: 21px; font-weight: 500; line-height: 1.6; color: #1E293B; border-right-width: 4px; }}
.shot {{ position: absolute; background: #fff; border-radius: 10px; overflow: hidden;
  box-shadow: 0 24px 48px -12px rgba(15,23,42,.22), 0 0 0 1px rgba(15,23,42,.08); }}
.shot .bar {{ height: 26px; background: #EEF1F5; display: flex; gap: 7px; align-items: center; padding: 0 12px; }}
.shot .bar i {{ width: 10px; height: 10px; border-radius: 50%; display: block; }}
.shot img {{ display: block; width: 100%; }}
.cap {{ position: absolute; text-align: center; font-size: 19px; font-weight: 600; color: #334155; direction: rtl; }}
.who {{ direction: rtl; display: flex; align-items: center; gap: 16px; padding: 14px 20px; }}
.who .lbl {{ font-size: 14px; font-weight: 700; letter-spacing: .02em; }}
.who .nm {{ font-size: 19px; font-weight: 600; color: #0F172A; line-height: 1.45; }}
.who img {{ height: 58px; width: 58px; object-fit: contain; }}
.phone {{ position: absolute; border-radius: 26px; background: #0F172A; padding: 9px;
  box-shadow: 0 24px 40px -14px rgba(15,23,42,.35); }}
.phone img {{ display: block; border-radius: 18px; width: 100%; }}
"""


def page(n: int, body: str, *, eyebrow_en: str, eyebrow_ar: str, icon_name: str, color: str,
         title: str, sub: str, d_ar: str, d_en: str) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="head">
  <div class="eyebrow" style="color:#{color}"><span>{e(eyebrow_en)}</span><span class="dot">·</span>
    <span class="ar">{e(eyebrow_ar)}</span>{icon(icon_name, color)}</div>
  <h1>{e(title)}</h1>
  <h2>{e(sub)}</h2>
  <div class="d-ar">{e(d_ar)}</div>
  <div class="d-en">{e(d_en)}</div>
</div>
{body}
<div class="foot"></div>
<div class="pnum">{n} / {TOTAL_PAGES}</div>
<img class="fright" src="{(HERE / 'footer-right.png').as_uri()}" width="290" height="54">
</body></html>"""


def shot(src: str, x: int, y: int, w: int, *, chrome: bool = True, z: int = 1) -> str:
    bar = '<div class="bar"><i style="background:#F87171"></i><i style="background:#FBBF24"></i><i style="background:#34D399"></i></div>' if chrome else ""
    return f'<div class="shot" style="left:{x}px;top:{y}px;width:{w}px;z-index:{z}">{bar}<img src="{a(src)}"></div>'


def points(items: list[str], color: str, x: int, y: int, w: int, gap: int = 14) -> str:
    cards = "".join(f'<div class="pt" style="border-right-color:#{color}">{e(t)}</div>' for t in items)
    return f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;display:flex;flex-direction:column;gap:{gap}px">{cards}</div>'


def left_column(items, whom, logos, color):
    """The claims, then who it runs for, in one flow down the left."""
    return (f'<div style="position:absolute;left:150px;top:330px;width:560px;display:flex;flex-direction:column;gap:34px">'
            + points(items, color, 0, 0, 560).replace("position:absolute;left:0px;top:0px;", "")
            + who("لمن", whom, logos, color, 0, 0, 560).replace("position:absolute;left:0px;top:0px;", "")
            + "</div>")


def who(label: str, names: str, logos: list[str], color: str, x: int, y: int, w: int) -> str:
    imgs = "".join(f'<img src="{a("clients/" + l)}">' for l in logos)
    return (f'<div class="card who" style="position:absolute;left:{x}px;top:{y}px;width:{w}px">'
            f'<div style="flex:1"><div class="lbl" style="color:#{color}">{e(label)}</div>'
            f'<div class="nm">{e(names)}</div></div><div style="display:flex;gap:10px">{imgs}</div></div>')


def height(src: str, w: int) -> int:
    with Image.open(ASSETS / src) as im:
        return round(w * im.height / im.width)


def split(n, spec, main, second=None, second_w=330):
    """Points on the left, the product on the right, the client under the points.

    `main` is (image, caption); `second` is a smaller, chrome-less view laid over the main
    one's bottom-left corner — a second screen of the same system.
    """
    c = spec["color"]
    body = left_column(spec["points"], spec["who"], spec.get("logos", []), c)
    main_w = 1000
    main_h = 26 + height(main[0], main_w)
    top = 322 if main_h < 600 else 310
    main_h = min(main_h, 640)
    body += shot(main[0], 780, top, main_w).replace('<div class="shot"', f'<div class="shot" data-h="{main_h}"', 1)
    body = body.replace(f'left:780px;top:{top}px;width:{main_w}px', f'left:780px;top:{top}px;width:{main_w}px;height:{main_h}px')
    body += f'<div class="cap" style="left:1180px;width:600px;top:{top + main_h + 16}px">{e(main[1])}</div>'
    if second:
        sh = min(height(second, second_w), 400)
        y = min(top + main_h - sh + 40, 975 - sh)
        body += shot(second, 740, y, second_w, chrome=False, z=2).replace(
            f'width:{second_w}px', f'width:{second_w}px;height:{sh}px')
    return page(n, body, **spec["head"])


# ── the scenes ─────────────────────────────────────────────────────────────────────────────
INDEX = [
    ("54", "بلدية وهيئة محلية", "الخدمات الإلكترونية ومراكز خدمات الجمهور", "بلديات وهيئات محلية في الضفة وغزة", ["bireh.png", "jericho.png"], "0891B2"),
    ("19", "بوابة مواطن", "بوابات المواطن الإلكترونية", "طولكرم، يعبد، جيوس، الزبابدة، كوبر…", ["tulkarem.png", "yaabad.png"], "E11D48"),
    ("7", "تطبيقات جوال", "تطبيقات البلديات للهواتف الذكية", "طولكرم، يعبد، عزون، حوارة، الكوم…", ["azzun.png", "howwara.png"], "7C3AED"),
    ("WSDIS", "", "نظام معلومات التزويد المائي", "سلطة المياه الفلسطينية", ["pwa-auth.png"], "2563EB"),
    ("iOS", "Android", "تطبيق مياه فلسطين", "سلطة المياه الفلسطينية", ["pwa-auth.png"], "0284C7"),
    ("GIS", "", "مدينتي — نظام GIS للبلديات", "بلديات بيت لحم ودورا ويطا", ["dura.png"], "C2410C"),
    ("3,711+", "سجل", "رقمنة سجلات ضريبة الأملاك", "الإدارة العامة لضريبة الأملاك", ["ptax-dir.png"], "059669"),
    ("1,000+", "مدرسة", "الأطلس التعليمي التفاعلي", "وزارة التربية والتعليم", ["moe.png"], "D97706"),
]


def index_page(n: int) -> str:
    cards = []
    for i, (big, small, title, whom, logos, color) in enumerate(INDEX):
        col, row = i % 2, i // 2
        x = 1000 if col == 0 else 150  # RTL: first item on the right
        y = 330 + row * 146
        imgs = "".join(f'<img src="{a("clients/" + l)}" style="height:48px;width:48px;object-fit:contain">' for l in logos)
        cards.append(f"""
<div class="card" style="position:absolute;left:{x}px;top:{y}px;width:770px;height:128px;direction:rtl;display:flex;align-items:center;gap:22px;padding:0 26px">
  <div style="font-size:18px;font-weight:700;color:#CBD5E1;width:28px">{i + 1:02d}</div>
  <div style="flex:1;min-width:0;white-space:nowrap">
    <div style="font-size:22px;font-weight:600;line-height:1.45">{e(title)}</div>
    <div style="font-size:16px;color:#64748B;margin-top:4px"><b style="color:#{color};font-weight:700">لمن: </b>{e(whom)}</div>
  </div>
  <div style="display:flex;gap:6px">{imgs}</div>
  <div style="width:118px;text-align:center;border-right:1px solid #E2E8F0;padding-right:14px">
    <div style="font-size:30px;font-weight:700;color:#{color};line-height:1.1;direction:ltr">{e(big)}</div>
    <div style="font-size:14px;color:#64748B">{e(small)}</div>
  </div>
</div>""")
    body = "".join(cards)
    body += ('<div style="position:absolute;left:150px;right:150px;top:930px;text-align:center;font-size:17px;color:#64748B;direction:rtl">'
             'وأيضاً: نظام GIS ويب متكامل لسلطة الأراضي · نظام إدارة برنامج إحياء البلدة القديمة في القدس</div>')
    return page(n, body, eyebrow_en="TRACK RECORD", eyebrow_ar="السجل", icon_name="landmark", color="6E7A8A",
                title="مشاريع بارزة", sub="Flagship projects",
                d_ar="أنظمة مُنجَزة ومُشغَّلة لوزارات وسلطات وبلديات في أنحاء فلسطين.",
                d_en="Systems delivered and running for ministries, authorities and municipalities across Palestine.")


def csc_page(n):
    spec = dict(
        color="0891B2",
        head=dict(eyebrow_en="PROJECT 01", eyebrow_ar="مراكز خدمات الجمهور", icon_name="building", color="0891B2",
                  title="مراكز خدمات الجمهور في 54 بلدية", sub="Citizen service centers in 54 municipalities",
                  d_ar="الطلب يُستقبَل في مركز الخدمة أو من البيت، ويمشي في مسار مُعرَّف بين الدوائر حتى إصدار الشهادة.",
                  d_en="Requests are taken at the counter or from home, and travel a defined path between departments to the certificate."),
        points=["كل طلب بحالته ولونه: جديد، قيد الإنجاز، مُنجَز.",
                "مسارات وموافقات بين الدوائر تُهيَّأ بلا برمجة.",
                "قوالب شهادات ووثائق رسمية تحمل شعار البلدية.",
                "جلسات المجلس وقراراته، وأرشيف رقمي قابل للبحث."],
        who="54 بلدية وهيئة محلية في الضفة الغربية وقطاع غزة",
        logos=["bireh.png", "jericho.png", "khuzaa.png"],
    )
    return split(n, spec, ("products/eservices/11.jpg", "سجل الطلبات في مركز خدمات الجمهور"),
                 "products/eservices/25.jpg", second_w=250)


def portals_page(n):
    c = "E11D48"
    portals = ESERVICES["portals"]
    shown = ["tulkarem.jpg", "yabad.jpg", "nm14.jpg", "nm16.jpg", "nm8.jpg", "nm18.jpg"]
    by_shot = {p["shot"]: p for p in portals}
    tiles = []
    for i, s in enumerate(shown):
        p = by_shot[s]
        col, row = i % 3, i // 3
        x = 1430 - col * 360
        y = 330 + row * 316
        tiles.append(shot("portals/" + s, x, y, 340))
        tiles.append(f'<div class="cap" style="left:{x}px;width:340px;top:{y + 252}px;font-size:17px">{e(p["n"][0])} · {e(p["gov"])}</div>')
    names = "، ".join(p["n"][0].replace("بلدية ", "") for p in portals)
    side = f"""
<div class="card" style="position:absolute;left:150px;top:330px;width:540px;height:600px;padding:30px 32px;direction:rtl">
  <div style="font-size:84px;font-weight:700;color:#{c};line-height:1">19</div>
  <div style="font-size:22px;font-weight:600;margin-top:10px">بوابة مواطن مُشغَّلة لبلديات فلسطينية</div>
  <div style="font-size:17px;color:#64748B;margin-top:4px">كل بوابة باسم البلدية وشعارها، على منصة واحدة.</div>
  <div style="font-size:14px;font-weight:700;color:#{c};margin-top:26px">لمن</div>
  <div style="font-size:18px;line-height:1.85;color:#334155;margin-top:4px">{e(names)}</div>
</div>"""
    return page(n, side + "".join(tiles), eyebrow_en="PROJECT 02", eyebrow_ar="بوابات المواطن", icon_name="globe", color=c,
                title="بوابة إلكترونية لكل بلدية", sub="A citizen portal for every municipality",
                d_ar="المواطن يقدّم طلبه ويتابعه من بيته، على بوابة تحمل اسم بلديته وشعارها.",
                d_en="Citizens file and track requests from home, on a portal carrying their own municipality's name and crest.")


def apps_page(n):
    c = "7C3AED"
    apps = ESERVICES["apps"]
    body = []
    w, gap = 196, 44
    total = len(apps) * w + (len(apps) - 1) * gap
    x0 = (1920 + total) // 2 - w  # RTL: first app on the right
    for i, ap in enumerate(apps):
        x = x0 - i * (w + gap)
        s = ap["shots"][0]
        body.append(f'<div class="phone" style="left:{x}px;top:350px;width:{w}px"><img src="{a("apps/" + s["f"])}" style="height:392px;object-fit:cover;object-position:top"></div>')
        body.append(f'<div style="position:absolute;left:{x - 10}px;width:{w + 20}px;top:{350 + 410 + 26}px;'
                    f'display:flex;flex-direction:column;align-items:center;gap:8px">'
                    f'<img src="{a("apps/" + ap["icon"])}" style="width:44px;height:44px;border-radius:10px">'
                    f'<div style="font-size:18px;font-weight:600;direction:rtl">{e(ap["n"][0])}</div></div>')
    return page(n, "".join(body), eyebrow_en="PROJECT 03", eyebrow_ar="تطبيقات الجوال", icon_name="phone", color=c,
                title="البلدية في هاتف المواطن", sub="The municipality on the citizen's phone",
                d_ar="تطبيقات منشورة على Google Play لسبع بلديات: الخدمات والطلبات والإشعارات في مكان واحد.",
                d_en="Apps published on Google Play for seven municipalities — services, requests and notifications in one place.")


def wsdis_page(n):
    spec = dict(
        color="2563EB",
        head=dict(eyebrow_en="PROJECT 04", eyebrow_ar="قطاع المياه", icon_name="droplet", color="2563EB",
                  title="شبكة المياه على الخريطة وفي الأرقام", sub="WSDIS — Water Supply & Distribution Information System",
                  d_ar="نظام معلومات التزويد المائي لسلطة المياه الفلسطينية، مربوط بأنظمة الفوترة والتحكم.",
                  d_en="The water supply information system for the Palestinian Water Authority, linked to billing and control."),
        points=["خريطة تفاعلية لعناصر الشبكة ومساراتها ومصادرها وخزاناتها.",
                "قاعدة بيانات للتجمّعات السكانية ومزوّدي الخدمة.",
                "نموذج التخصيص العادل: الطلب والحصة والفاقد لكل تجمّع.",
                "تقارير متعددة المستويات للتخطيط والصيانة."],
        who="سلطة المياه الفلسطينية",
        logos=["pwa-auth.png"],
    )
    return split(n, spec, ("products/wsdis/02.jpg", "خط التزويد ومعلوماته على الخريطة"),
                 "products/wsdis/01.jpg", second_w=420)


def water_app_page(n):
    c = "0284C7"
    body = left_column(["طلب صهريج مياه ومعرفة أقرب مزوّد.",
                        "تقديم شكوى أو بلاغ عطل ومتابعة مساره.",
                        "خريطة لمصادر المياه والمرافق.",
                        "أخبار وعطاءات ومؤشرات أداء وحملات توعية."],
                       "سلطة المياه الفلسطينية، للمواطن على Android وiOS", ["pwa-auth.png"], c)
    shots = ["14.jpg", "07.jpg", "13.jpg", "11.jpg"]
    for i, s in enumerate(shots):
        x = 1560 - i * 250
        body += f'<div class="phone" style="left:{x}px;top:330px;width:220px"><img src="{a("products/pwa-app/" + s)}" style="height:560px;object-fit:cover;object-position:top"></div>'
    return page(n, body, eyebrow_en="PROJECT 05", eyebrow_ar="تطبيق الجوال", icon_name="droplet", color=c,
                title="تطبيق مياه فلسطين", sub="Palestine Water — Android & iOS",
                d_ar="قناة مباشرة بين سلطة المياه والمواطن: صهاريج وشكاوى وأخبار ومؤشرات.",
                d_en="A direct channel between the Water Authority and citizens — tankers, complaints, news and indicators.")


def madeenati_page(n):
    spec = dict(
        color="C2410C",
        head=dict(eyebrow_en="PROJECT 06", eyebrow_ar="نظم المعلومات الجغرافية", icon_name="map", color="C2410C",
                  title="مدينتي — المدينة على خريطة واحدة", sub="Madeenati — municipal GIS",
                  d_ar="قطع الأراضي والأبنية والشوارع والإنارة والصرف الصحي، وكل طبقة مربوطة بسجلّها.",
                  d_en="Parcels, buildings, streets, lighting and sewage — every layer tied to its record."),
        points=["إدارة الأراضي: القطع والملكيات والمعاملات.",
                "الأبنية والشقق وترقيمها، والشوارع وربطها بالقطع.",
                "الإنارة وشبكة الصرف الصحي ومحطات الضخ.",
                "تقارير مخطط الموقع والتنظيم من البيانات نفسها."],
        who="بلديات بيت لحم ودورا ويطا",
        logos=["dura.png"],
    )
    return split(n, spec, ("products/madeenati/02.jpg", "طبقات المدينة فوق الصورة الجوية"),
                 "products/madeenati/11.jpg", second_w=380)


def ptax_page(n):
    spec = dict(
        color="059669",
        head=dict(eyebrow_en="PROJECT 07", eyebrow_ar="المالية والإيرادات", icon_name="receipt", color="059669",
                  title="أكثر من 3,711 سجل ضريبة أملاك، رقمياً", sub="3,711+ property-tax registers, digitized",
                  d_ar="سجل المكلّفين والعقارات والتقييم والتحصيل، للإدارة العامة لضريبة الأملاك.",
                  d_en="Taxpayer and property registers, assessment and collection — for the General Directorate of Property Tax."),
        points=["سجل منظَّم للمكلّفين والعقارات والأراضي والأبنية.",
                "تقييم العقار والاعتراض والطعن بعدالة ومساءلة.",
                "إيصالات وتحصيل فوري ومتابعة للمتأخرات.",
                "تكامل مع نظام PTAX المركزي."],
        who="الإدارة العامة لضريبة الأملاك — وزارة المالية",
        logos=["ptax-dir.png"],
    )
    return split(n, spec, ("products/ptax/08.jpg", "تخمين الأرض والبناء لكل قطعة"),
                 "products/ptax/07.jpg", second_w=400)


def atlas_page(n):
    spec = dict(
        color="D97706",
        head=dict(eyebrow_en="PROJECT 08", eyebrow_ar="التعليم", icon_name="book", color="D97706",
                  title="الأطلس التعليمي التفاعلي لفلسطين", sub="Interactive educational atlas of Palestine",
                  d_ar="خرائط متعددة الطبقات ومحتوى جغرافي وتاريخي، يخدم أكثر من 1,000 مدرسة.",
                  d_en="Layered maps and geo-historical content, serving more than 1,000 schools."),
        points=["موقع كل مدرسة على الخريطة مع بياناتها.",
                "مؤشرات الطلبة والمعلمين حسب المديرية والمدرسة.",
                "تقارير وخرائط قابلة للطباعة والتصدير.",
                "ربط المنهاج بالأرض والتاريخ والهوية."],
        who="وزارة التربية والتعليم — أكثر من 1,000 مدرسة",
        logos=["moe.png"],
    )
    return split(n, spec, ("products/atlas/03.jpg", "المدرسة وموقعها وبياناتها على الأطلس"),
                 "products/atlas/09.jpg", second_w=440)


SCENES = [index_page, csc_page, portals_page, apps_page, wsdis_page, water_app_page,
          madeenati_page, ptax_page, atlas_page]


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else HERE / "out")
    out.mkdir(parents=True, exist_ok=True)
    names = []
    for i, scene in enumerate(SCENES):
        name = f"p-{i:02d}"
        (out / f"{name}.html").write_text(scene(FIRST_PAGE + i), encoding="utf-8")
        names.append(name)
    (out / "manifest.json").write_text(json.dumps(names))
    print(f"{len(names)} scenes → {out}")


if __name__ == "__main__":
    main()
