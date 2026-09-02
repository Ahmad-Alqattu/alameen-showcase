/**
 * Export every scene of the long cut as a 1920x1080 frame, for the PowerPoint build.
 *
 * Two things make the frame match what the room actually sees. `?slide=N&paused=1` opens one
 * scene and holds it, so the capture is deterministic rather than a race against the loop.
 * And ArrowDown steps the point cards in by hand — paused at zero none of them have arrived,
 * so a naive capture would export every slide with its claims missing.
 *
 * Usage: node artifacts/capture-slides.mjs [http://localhost:4174] [count]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://localhost:4174';
const COUNT = Number(process.argv[3] || 33);
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'slides');

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

for (let n = 1; n <= COUNT; n++) {
  await page.goto(`${BASE}/?deck=full&slide=${n}&paused=1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1000);
  const file = join(OUT, `slide-${String(n).padStart(2, '0')}.png`);
  await page.screenshot({ path: file });
  process.stdout.write(`${n} `);
}

console.log('\nخلص');
await browser.close();
