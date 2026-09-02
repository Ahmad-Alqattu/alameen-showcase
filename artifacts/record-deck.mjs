/**
 * Record the deck playing itself, once through, as a shareable film.
 *
 * The elevator cut, not the long one: it is the loop the stand actually runs, and it is the
 * length a client will watch. Recorded at the booth screen's own size so the frame a viewer
 * gets is the frame the room gets — including the side rail, whose client register rotates
 * on its own clock and so appears in the film as it appears on the stand.
 *
 * Usage: node artifacts/record-deck.mjs [seconds] [http://localhost:4174]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SECONDS = Number(process.argv[2] || 105);
const BASE = process.argv[3] || 'http://localhost:4174';
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'video');

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

await page.goto(BASE, { waitUntil: 'networkidle' });
// A beat before the clock starts, so the film does not open mid-entrance.
await page.waitForTimeout(1200);

for (let s = 0; s < SECONDS; s += 5) {
  await page.waitForTimeout(5000);
  process.stdout.write(`${s + 5}s `);
}

console.log('\nيحفظ…');
await context.close();
await browser.close();
console.log('خلص —', OUT);
