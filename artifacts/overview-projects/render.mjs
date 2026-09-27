/**
 * Render the scenes `slides.py` wrote into 1920x1080 PNGs next to them.
 *
 *   node artifacts/overview-projects/render.mjs OUT_DIR
 *
 * Set CHROMIUM to a browser binary to use one other than Playwright's own.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = resolve(process.argv[2] || 'out');
const names = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const name of names) {
  await page.goto(pathToFileURL(join(OUT, `${name}.html`)).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  console.log(name);
}
await browser.close();
