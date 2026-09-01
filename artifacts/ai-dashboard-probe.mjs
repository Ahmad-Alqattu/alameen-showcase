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
await page.locator('button:has(svg)').filter({ hasText: 'لوحة جديدة' }).last().click();
await page.getByRole('button', { name: 'توليد بالذكاء الاصطناعي', exact: true }).waitFor({ timeout: 30_000 });
await page.getByRole('button', { name: 'توليد بالذكاء الاصطناعي', exact: true }).click();
await page.locator('input[type="number"][min="1"][max="12"]').fill('6');
await page.getByPlaceholder(/لوحة لمتابعة تشغيل/).fill('أنشئ بالضبط 6 بطاقات مرتبة للموارد المائية: في الصف الأول 4 بطاقات رقمية بعرض عمود واحد لكل منها: إجمالي الآبار، متوسط عمق الآبار، عدد الآبار التي لها عداد مياه، وإجمالي الينابيع. وفي الصف الثاني مخططان بعرض عمودين لكل منهما: توزيع الآبار حسب المحافظة بالأعمدة، وتوزيع الآبار حسب الحالة بالدائري. لا تستخدم حالة الترخيص ولا تترك فراغات في الشبكة.');
const responsePromise = page.waitForResponse(response => response.url().includes('/ai-draft-dashboard') && response.request().method() === 'POST');
await page.getByRole('button', { name: 'اقترح البطاقات', exact: true }).click();
const response = await responsePromise;
console.log(JSON.stringify(await response.json(), null, 2));
await page.waitForTimeout(3_000);
console.log((await page.locator('body').innerText()).slice(-10_000));
await page.screenshot({ path: 'artifacts/ai-dashboard-probe.png', fullPage: true });
await browser.close();
