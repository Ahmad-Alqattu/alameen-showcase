import { mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:5173';
const outputDir = 'artifacts/demos';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function signInState() {
  const context = await browser.newContext({ locale: 'ar', viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.getByPlaceholder('admin').fill('admin');
  await page.locator('input[type="password"]').fill('Admin@123');
  await page.getByRole('button', { name: 'دخول', exact: true }).click();
  await page.waitForURL('**/dashboard', { timeout: 30_000 });
  const state = await context.storageState();
  await context.close();
  return state;
}

async function finishVideo(page, context, destination) {
  const video = page.video();
  await page.close();
  await context.close();
  if (!video) throw new Error(`Video was not created: ${destination}`);
  await rename(await video.path(), destination);
}

async function recordDashboard(state) {
  const context = await browser.newContext({
    locale: 'ar',
    viewport: { width: 1920, height: 1080 },
    storageState: state,
    recordVideo: { dir: outputDir, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') console.error(`[dashboard-browser] ${message.text()}`);
  });

  await page.goto(`${baseUrl}/wrms/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1_200);

  await page.locator('button:has(svg)').filter({ hasText: 'لوحة جديدة' }).last().click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'توليد بالذكاء الاصطناعي', exact: true }).click();
  await page.waitForTimeout(700);

  await page.locator('input[type="number"][min="1"][max="12"]').fill('6');
  const prompt = 'أنشئ بالضبط 6 بطاقات مرتبة للموارد المائية: في الصف الأول 4 بطاقات رقمية بعرض عمود واحد لكل منها: إجمالي الآبار، متوسط عمق الآبار، عدد الآبار التي لها عداد مياه، وإجمالي الينابيع. وفي الصف الثاني مخططان بعرض عمودين لكل منهما: توزيع الآبار حسب المحافظة بالأعمدة، وتوزيع الآبار حسب الحالة بالدائري. لا تستخدم حالة الترخيص ولا تترك فراغات في الشبكة.';
  await page.getByPlaceholder(/لوحة لمتابعة تشغيل/).pressSequentially(prompt, { delay: 20 });
  await page.waitForTimeout(500);

  const draftResponse = page.waitForResponse(response =>
    response.url().includes('/ai-draft-dashboard') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'اقترح البطاقات', exact: true }).click();
  const response = await draftResponse;
  if (!response.ok()) throw new Error(`AI dashboard draft failed: ${response.status()}`);
  const draft = await response.json();
  if (!Array.isArray(draft.tiles) || draft.tiles.length !== 6) {
    throw new Error(`Expected 6 dashboard tiles, received ${draft.tiles?.length ?? 0}: ${JSON.stringify(draft.warnings ?? [])}`);
  }
  const spans = draft.tiles.map(tile => Number(tile.w));
  if (spans.slice(0, 4).some(width => width !== 1) || spans.slice(4).some(width => width !== 2)) {
    throw new Error(`Dashboard grid was not 1+1+1+1 then 2+2: ${spans.join(',')}`);
  }

  await page.getByText('إجمالي الآبار', { exact: true }).waitFor({ timeout: 45_000 });
  await page.waitForTimeout(2_000);

  await page.getByLabel('اسم اللوحة (عربي)').fill('لوحة متابعة الآبار الذكية');
  await page.getByLabel('اسم اللوحة (إنجليزي)').fill('Smart Wells Dashboard');
  await page.waitForTimeout(800);

  const saveResponse = page.waitForResponse(response =>
    /\/api\/dashboards\/\d+$/.test(new URL(response.url()).pathname) && response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'حفظ', exact: true }).click();
  const saved = await saveResponse;
  if (!saved.ok()) throw new Error(`Dashboard save failed: ${saved.status()}`);
  await page.getByRole('button', { name: 'تحرير', exact: true }).waitFor({ timeout: 15_000 });
  await page.waitForTimeout(3_000);

  await finishVideo(page, context, join(outputDir, 'dynamic-dashboard-ai.webm'));
}

async function recordAssistantPrint(state) {
  const context = await browser.newContext({
    locale: 'ar',
    viewport: { width: 1920, height: 1080 },
    storageState: state,
    recordVideo: { dir: outputDir, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') console.error(`[assistant-browser] ${message.text()}`);
  });

  await page.goto(`${baseUrl}/wrms/reports`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1_000);
  await page.getByRole('button', { name: 'سَبْر', exact: true }).click();
  const question = page.getByPlaceholder('اكتب سؤالك…');
  await question.waitFor({ timeout: 30_000 });
  await page.waitForTimeout(500);
  await question.pressSequentially('كم عدد الآبار المسجلة في كل محافظة؟', { delay: 25 });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'إرسال', exact: true }).click();

  const printButton = page.locator('button[aria-label="طباعة"]');
  await printButton.waitFor({ timeout: 75_000 });
  await page.waitForTimeout(1_500);

  // One governed result, several presentation choices — no new assistant request.
  for (const view of ['دائري', 'أعمدة', 'خطي', 'مساحي', 'أعمدة']) {
    await page.locator(`button[title="${view}"]`).last().click();
    await page.waitForTimeout(1_150);
  }
  await printButton.hover();
  await page.waitForTimeout(800);

  // Keep the actual A4 iframe alive long enough for the recording to show what the user prints.
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

  await printButton.click();
  const documentFrame = page.locator('iframe[data-report-print="true"]');
  await documentFrame.waitFor({ state: 'attached', timeout: 15_000 });
  await page.waitForTimeout(700);
  const printHtml = await documentFrame.evaluate(frame => frame.contentDocument?.documentElement.outerHTML ?? '');
  if (!printHtml) throw new Error('The official print document was empty.');

  // This is the exact HTML generated by printReportDocument; it is surfaced as a readable preview
  // because native OS print dialogs are not captured in browser video.
  await page.setContent(printHtml, { waitUntil: 'load' });
  await page.addStyleTag({ content: `
    html { background: #e2e8f0 !important; }
    body {
      width: min(1220px, calc(100vw - 220px)) !important;
      min-height: calc(100vh - 110px) !important;
      margin: 55px auto !important;
      padding: 44px 54px 72px !important;
      background: #fff !important;
      box-shadow: 0 20px 60px rgb(15 23 42 / .22) !important;
    }
  ` });
  await page.waitForTimeout(3_500);

  await finishVideo(page, context, join(outputDir, 'assistant-chart-print.webm'));
}

try {
  const state = await signInState();
  await recordDashboard(state);
  await recordAssistantPrint(state);
} finally {
  await browser.close();
}
