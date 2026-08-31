/**
 * Where the deck's images live, relative to wherever the deck itself is served from.
 *
 * The screenshots, client marks and logo were written as absolute paths (`/showcase/…`),
 * which is correct inside the platform — it is served from the domain root — but wrong
 * the moment the standalone build sits in a subfolder: `/showcase/…` resolves against
 * the domain, not against `…/alameen-showcase/deck/`, and every image 404s.
 *
 * `BASE_URL` is what Vite already knows about that: `/` for the platform build, `./` for
 * the standalone one (`vite.showcase.config.ts` sets `base: './'`). So both builds keep
 * working and neither needs to know where the other is deployed.
 */
const BASE = import.meta.env.BASE_URL;

export const asset = (path: string) => `${BASE}${path.replace(/^\//, '')}`;
