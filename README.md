# Alameen Showcase — معرض منتجات الأمين للتقنيات

Bilingual (ar/en, RTL-aware) marketing & exhibition site: product cards with
captioned live-screen slideshows, company profile, 86 client organizations with
real logos, and an interactive pin-map of 57 municipalities/authorities.

**Stack:** React 19 · Vite 7 · Tailwind CSS 4 · TypeScript. No backend — all
content lives in `src/data/showcase.json`; all images under `public/assets/`.

## Commands

```bash
npm install     # first run
npm run dev     # dev server
npm run build   # type-check + production build into dist/
npm run preview # serve the production build locally
```

## Deploy

The site is fully static. Upload the contents of `dist/` to any web server
(e.g. `products.alameentech.com`, or a sub-folder of alameentech.com). It is
also a **PWA**: served over HTTPS it is installable ("Add to Home Screen") and
works offline after the first visit (`public/sw.js`, cache-first).

To embed in an existing page, host `dist/` on the same domain and:

```html
<iframe src="/showcase/" style="width:100%;height:100vh;border:0"
        allow="fullscreen" title="Al-Ameen products"></iframe>
```

## Updating content

- **Products / clients / map data** — edit `src/data/showcase.json`
  (see `src/types.ts` for the shape; every label is a `[arabic, english]` pair).
- **Product screenshots** — drop images in `public/assets/products/<slug>/`
  and reference them in the product's `imgs` array (`w`/`h` = pixel size).
- **Client logos** — `public/assets/clients/<slug>.png`, referenced by the
  `l` field of the client / map point / product user.
- **UI strings** — `src/i18n.tsx`.
- **Map** — governorate shapes were generated from the PWA platform's
  `governorate-boundaries.geojson`; municipality pins carry `lat`/`lon`
  (approximate, for presentation) and a service key
  (`csc` | `mad` | `both` | `water`).

## Notes

- Gotcha, documented in `src/App.tsx`: Chromium's `window.scrollTo` now
  returns a Promise — never use it as a concise-arrow `useEffect` body.
- Two municipality portals were unreachable when logos were collected
  (باقة الشرقية، سيلة الظهر) — they render as name tiles; drop their
  `nm9.png` / `nm19.png` into `public/assets/clients/` when available.
