/**
 * Export a cut of the deck as 1920x1080 frames, for the PowerPoint build.
 *
 * Three things make an exported frame match what the room actually sees:
 *
 *   `?slide=N` opens one scene, so the capture is deterministic rather than a race against
 *   the loop, and Space freezes it once it is showing what it should.
 *
 *   ArrowDown steps the point cards in by hand. At the moment a scene opens none of them
 *   have arrived, so a naive capture exports every slide with its claims missing.
 *
 *   A scene that plays a recording is left running until the film has nearly finished, and
 *   only then frozen. Seeking the element instead looks equivalent and is not: the browser
 *   reports the seek complete before it has painted, and the export comes back a white box
 *   where the product should be. Held at its first frame the dashboard scene is an empty
 *   board anyway — the thing worth exporting is the board after it has been built.
 *
 * Usage:
 *   node artifacts/capture-slides.mjs [short|overview|full] [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CUT = (process.argv[2] || 'short').toLowerCase();
const BASE = process.argv[3] || 'http://localhost:4174';
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, CUT === 'full' ? 'slides-full' : CUT === 'overview' ? 'slides-overview' : 'slides-short');
const QUERY = CUT === 'full' ? 'deck=full&' : CUT === 'overview' ? 'deck=overview&' : '';

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

/** Scenes that play a recording, and where on the 1920x1080 frame the film sits. */
const films = [];

/** How many scenes this cut holds — asked of the deck rather than assumed. */
await page.goto(`${BASE}/?${QUERY}slide=1&paused=1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const total = await page.evaluate(() => {
  const el = [...document.querySelectorAll('footer *, footer')].find((n) =>
    /^\s*\d+\s*\/\s*\d+\s*$/.test(n.textContent || ''),
  );
  return el ? Number(el.textContent.split('/')[1].trim()) : 0;
});
if (!total) throw new Error('could not read the scene count from the deck');
console.log(`${CUT}: ${total} مشهد`);

for (let n = 1; n <= total; n += 1) {
  // Playing, not paused: a film has to actually run to have painted anything.
  await page.goto(`${BASE}/?${QUERY}slide=${n}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const filmed = await page.locator('video').count() > 0;
  if (filmed) {
    await page.waitForFunction(
      () => {
        const v = document.querySelector('video');
        return v && v.duration && v.currentTime >= v.duration * 0.78;
      },
      { timeout: 60_000 },
    );
  }

  // Space freezes the deck and the film together.
  await page.keyboard.press(' ');
  await page.waitForTimeout(300);
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(80);
  }

  await page.waitForTimeout(900);
  await page.screenshot({ path: join(OUT, `slide-${String(n).padStart(2, '0')}.png`) });
  // Where the film sits on the page, so the PowerPoint build can drop the real MP4 on top
  // of the still at exactly that spot — a recording of the product working is the strongest
  // thing in the deck, and a photograph of it is not the same claim.
  if (filmed) {
    films.push({ slide: n, ...(await page.evaluate(() => {
      const v = document.querySelector('video');
      const r = v.getBoundingClientRect();
      return {
        src: v.getAttribute('src'),
        poster: v.getAttribute('poster'),
        x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height),
      };
    })) });
  }
  process.stdout.write(`${n}${filmed ? '🎬' : ''} `);
}

writeFileSync(join(OUT, 'films.json'), JSON.stringify(films, null, 2));
console.log(`\nخلص → ${OUT}  (أفلام: ${films.length})`);
await browser.close();
