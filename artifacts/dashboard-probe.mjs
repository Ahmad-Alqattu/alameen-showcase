import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  locale: 'ar',
  viewport: { width: 1600, height: 1000 },
});
const page = await context.newPage();

page.on('console', message => console.log(`[browser:${message.type()}] ${message.text()}`));
page.on('requestfailed', request => console.log(`[request-failed] ${request.url()} ${request.failure()?.errorText}`));

await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
await page.getByPlaceholder('admin').fill('admin');
await page.locator('input[type="password"]').fill('Admin@123');
await page.getByRole('button', { name: 'دخول' }).click();
await page.waitForURL('**/dashboard', { timeout: 30_000 });

await page.goto('http://127.0.0.1:5173/wrms/dashboard', { waitUntil: 'networkidle' });
await page.waitForTimeout(2_000);
console.log(`[url] ${page.url()}`);
console.log((await page.locator('body').innerText()).slice(0, 8_000));
await page.screenshot({ path: 'artifacts/dashboard-probe.png', fullPage: true });

await browser.close();
