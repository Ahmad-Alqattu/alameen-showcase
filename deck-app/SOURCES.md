# Where the company deck's content comes from

Every word, figure, logo and screenshot in `/showcase` is taken from material Al-Ameen already
publishes. Nothing here is written from memory, estimated, or rounded up.

## The source of record

`alameen-showcase/` — the company's standalone offline product showcase (`index.html` + `data.js`
+ `assets/`), itself compiled from the official **Company Profile Presentation** and the
**Al-Ameen-Technology-LEAP** decks. That folder, not the PowerPoints, is the source used here: per
its own README it carries the deck content *and more*.

| What | Where it came from | Where it lives now |
|---|---|---|
| Company description, vision (4 points), milestones | `data.js` → `company.about`, `company.vision`, `company.milestones` | `showcase.slides.company.*` in `locales/{ar,en}.json` |
| Client counts and groupings | `data.js` → `clients[]` — 5 groups, 86 organizations, counted from the itemized register | `showcase.slides.reach.*`, `showcase.slides.clients.*` |
| Flagship projects and their funders | `data.js` → `company.projects` | `showcase.slides.projects.*` |
| Technology partners | `data.js` → `partners` | `showcase.slides.partners.*` |
| Address, phone, email, web | `data.js` → `company.contact` | `showcase.slides.contact.*`, and `QR_TARGET` in `slides.ts` |
| Product name, sector, tagline, reference client, features | `data.js` → `products[]` — **verbatim**, not paraphrased | one slide each, `showcase.slides.<id>.*` |
| Product screenshots (240) | `assets/products/<slug>/` | `public/showcase/products/<slug>/`, indexed by `PRODUCT_SHOTS` |
| Client logos (80) | `assets/clients/` | `public/showcase/clients/`, listed in `CLIENT_LOGOS` |
| Governorate outlines (16) and deployment sites (57) | `data.js` → `map.paths`, `map.points` | `GOVERNORATES`, `DEPLOYMENTS` in `mapData.ts` |
| Company mark | `assets/logo-alameen-white.svg` | `public/logo-alameen-white.svg` |

## The exception: the three AI slides

`ai`, `aiSafety` and `aiReports` are **not** from the marketing decks — they describe this
platform's assistant, and their claims are checked against
[`docs/ai-assistant.md`](../../../../../docs/ai-assistant.md) and the code it documents. The
`aiSafety` slide in particular states things that must stay true of the implementation:

- the model holds no connection string, no SQL and no table name;
- every tool call runs through the module reporting API with the **asking user's** JWT;
- tenant isolation and row-level scoping apply on the same path a human report run takes;
- result size is capped by us (`DISPLAY_ROWS` / `MAX_ROWS` / `MAX_GROUPED_ROWS`), not by the model;
- the envelope carries filters, column units and the true row count.

**If any of that changes in the code, this slide is wrong and must change with it.**

## Two numbers that disagree in the source

`company.beneficiaries` and the itemized `clients[]` register do not agree on two counts:

| | `beneficiaries` says | `clients[]` itemizes |
|---|---|---|
| Ministries & authorities | 12 | **13** |
| Universities | 6 | **4** |

The deck uses the **itemized** figures, because each one is backed by a named organization and a
logo file. Worth settling with whoever maintains the Company Profile deck.

## Regenerating after the source changes

The locale content and `mapData.ts` were generated from `data.js`, not typed by hand. When the
company showcase is updated, regenerate rather than editing the JSON: re-run the extraction against
the new `data.js`, re-copy `assets/clients/` and `assets/products/` into `public/showcase/`, and
diff the result.
