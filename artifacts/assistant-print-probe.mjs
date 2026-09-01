import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: 'ar', viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
page.on('console', message => console.log(`[browser:${message.type()}] ${message.text()}`));
page.on('requestfailed', request => console.log(`[request-failed] ${request.url()} ${request.failure()?.errorText}`));

await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
await page.getByPlaceholder('admin').fill('admin');
await page.locator('input[type="password"]').fill('Admin@123');
await page.getByRole('button', { name: 'دخول' }).click();
await page.waitForURL('**/dashboard');
await page.goto('http://127.0.0.1:5173/wrms/dashboard', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'سَبْر', exact: true }).click();
await page.getByPlaceholder('اكتب سؤالك…').waitFor({ timeout: 30_000 });
await page.getByPlaceholder('اكتب سؤالك…').fill('كم عدد الآبار المسجلة في كل محافظة؟ اعرض النتيجة كمخطط أعمدة.');
await page.getByRole('button', { name: 'إرسال', exact: true }).click();
await page.waitForTimeout(30_000);
console.log((await page.locator('body').innerText()).slice(-12_000));
const print = page.locator('button[aria-label="طباعة"]');
console.log(`[print-buttons] ${await print.count()}`);
await page.evaluate(() => {
  const append = HTMLBodyElement.prototype.appendChild;
  HTMLBodyElement.prototype.appendChild = function patchedAppend(node) {
    const result = append.call(this, node);
    if (node instanceof HTMLIFrameElement && node.style.visibility === 'hidden') {
      node.dataset.reportPrint = 'true';
      Object.defineProperty(node.contentWindow, 'print', { configurable: true, value: () => undefined });
    }
    return result;
  };
});
await print.click();
await page.locator('iframe[data-report-print="true"]').waitFor({ state: 'attached', timeout: 10_000 });
await page.waitForTimeout(600);
const printHtml = await page.locator('iframe[data-report-print="true"]').evaluate(frame => frame.contentDocument?.documentElement.outerHTML ?? '');
console.log(`[print-html] ${printHtml.slice(0, 200)}`);
await page.screenshot({ path: 'artifacts/assistant-print-probe.png', fullPage: true });
await browser.close();
