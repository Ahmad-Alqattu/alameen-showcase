import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});
page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

for (let slide = 1; slide <= 7; slide += 1) {
  await page.goto(`http://127.0.0.1:4174/?slide=${slide}&paused=1&static=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1');
  await page.waitForTimeout(1200);
  const title = await page.locator('h1').innerText();
  const englishTitle = await page.locator('header p[dir="ltr"]').first().innerText();
  if (!title.trim() || !englishTitle.trim()) throw new Error(`Slide ${slide} is missing bilingual titles`);
  const [arabicSize, englishSize] = await page.locator('header').evaluate((header) => {
    const arabic = header.querySelector('h1');
    const english = header.querySelector('p[dir="ltr"]');
    return [getComputedStyle(arabic).fontSize, getComputedStyle(english).fontSize];
  });
  if (arabicSize !== englishSize) throw new Error(`Slide ${slide} title sizes differ: ${arabicSize} / ${englishSize}`);
  await page.screenshot({ path: `artifacts/leap-slide-${slide}.png`, fullPage: true });
  console.log(`${slide}: ${title} / ${englishTitle}`);
}

const counter = await page.locator('footer span[dir="ltr"]').innerText();
if (counter.trim() !== '7 / 7') throw new Error(`Expected short deck counter 7 / 7, got ${counter}`);
if (await page.getByText('المعروض الآن', { exact: true }).count()) throw new Error('Short deck still renders the now-showing rail');

await page.goto('http://127.0.0.1:4174/?slide=2&paused=1&static=1', { waitUntil: 'networkidle' });
for (const capability of ['E-Services', 'GIS & Map Reports', 'HR', 'Documents', 'Workflow', 'Dynamic Forms', 'AI Reports', 'AI Dashboards', 'Smart Notifications', 'Unified Permissions', 'API First', 'SABR AI']) {
  if (!(await page.getByText(capability, { exact: true }).count())) throw new Error(`Missing ecosystem capability: ${capability}`);
}
for (const differentiator of ['Heatmaps & clusters', 'Adaptive data capture', 'Ask. Build. Verify.', 'Across every service']) {
  if (!(await page.getByText(differentiator, { exact: true }).count())) throw new Error(`Missing ecosystem differentiator: ${differentiator}`);
}
if (!(await page.getByText('12 capabilities. One core. One assistant.', { exact: true }).count())) {
  throw new Error('Missing the shared ecosystem core');
}

await page.goto('http://127.0.0.1:4174/?slide=4&paused=1&static=1', { waitUntil: 'networkidle' });
const insightImage = await page.locator('.showcase-stage img').getAttribute('src');
if (!insightImage?.endsWith('/showcase/products/dwp/05.jpg')) {
  throw new Error(`Insight slide did not replace the licensing screenshot: ${insightImage}`);
}

await page.goto('http://127.0.0.1:4174/?slide=7&paused=1&static=1', { waitUntil: 'networkidle' });
const closingImages = await page.locator('.showcase-stage img').evaluateAll(images => images.map(image => image.getAttribute('src') ?? ''));
if (closingImages.some(src => /madeenati|eservices|wsdis|pwa-app|atlas/.test(src))) {
  throw new Error(`Closing montage still contains a legacy product capture: ${closingImages.join(', ')}`);
}

await page.goto('http://127.0.0.1:4174/?deck=full&slide=32&paused=1', { waitUntil: 'networkidle' });
const fullCounter = await page.locator('footer span[dir="ltr"]').innerText();
if (fullCounter.trim() !== '32 / 32') throw new Error(`Expected full deck counter 32 / 32, got ${fullCounter}`);

for (const [slide, minimumDuration] of [[5, 25], [6, 22]]) {
  await page.goto(`http://127.0.0.1:4174/?slide=${slide}&paused=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const video = document.querySelector('video');
    return video && video.readyState >= 2;
  });
  const duration = await page.locator('video').evaluate(video => video.duration);
  if (duration < minimumDuration) throw new Error(`Slide ${slide} recording is unexpectedly short: ${duration}s`);
  const before = await page.locator('video').evaluate(video => video.currentTime);
  await page.waitForTimeout(900);
  const after = await page.locator('video').evaluate(video => video.currentTime);
  if (after <= before) throw new Error(`Slide ${slide} recording did not play`);
  await page.locator('video').locator('..').click();
  const paused = await page.locator('video').evaluate(video => video.paused);
  if (!paused) throw new Error(`Slide ${slide} recording did not pause on interaction`);
  console.log(`video ${slide}: ${duration.toFixed(2)}s, played ${before.toFixed(2)}s → ${after.toFixed(2)}s and paused`);
}

await browser.close();
if (errors.length) throw new Error(errors.join('\n'));
console.log(`full: ${fullCounter}`);
