import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.MSG_PLAYWRIGHT_URL || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.addInitScript(() => {
  localStorage.setItem('msg-source-sample-v2:learner:remedy-log', JSON.stringify([
    { item: 'a2', ok: false, m: 'M02', src: 'test', answerKey: 'dt-2026-09-26' },
  ]));
});
try {
  const base = process.env.MSG_BASE_URL || 'http://127.0.0.1:4317';
  await page.goto(`${base}/sample-v2/index.html?edition=student&page=11`);
  await page.waitForFunction(() => Boolean(window.__sample));
  await page.evaluate(() => window.__sample.report(1));
  await page.locator('[data-dt-probe]').click();
  assert.equal(await page.locator('[data-probe="d02"]').count(), 1);
  await page.locator('[data-probe="d02"] [data-probe-opt="0"]').click();
  assert.equal(await page.evaluate(() => window.__sample.remedyLog().filter((r) => r.item === 'd02').length), 1);
  await page.locator('[data-probe-back]').click();
  assert.match(await page.locator('[data-dt-remedy]').innerText(), /2문제/);
  await page.locator('[data-dt-remedy]').click();
  await page.locator('[data-rx="s03"] [data-rx-opt="0"]').click();
  await page.locator('[data-rx-back]').click();
  assert.match(await page.locator('[data-dt-remedy]').innerText(), /1문제/);
  await page.locator('[data-dt-remedy]').click();
  assert.equal(await page.locator('[data-rx="s03"]').count(), 0, 'a previously attempted variant reappeared');
  assert.equal(await page.locator('[data-rx="s04"]').count(), 1);
  await page.locator('[data-rx="s04"] [data-rx-opt="0"]').click();
  await page.locator('[data-rx-back]').click();
  assert.equal(await page.locator('[data-dt-remedy]').count(), 0);
  assert.match(await page.locator('.dt-recommend').innerText(), /고정 문항을 다시 뽑지 않아요/);
  assert.equal(await page.evaluate(() => window.__sample.remedyLog().filter((r) => r.src === 'bank').length), 2);
  for (const width of [1024, 1365, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${width}px overflow`);
    assert.equal(await page.locator('.dt-recommend').isVisible(), true, `${width}px recommendation hidden`);
  }
  assert.deepEqual(errors, []);
  if (process.env.MSG_QA_OUT) {
    await mkdir(process.env.MSG_QA_OUT, { recursive: true });
    await page.screenshot({ path: `${process.env.MSG_QA_OUT}/question-bank-exhausted.png`, fullPage: true });
  }
  console.log('PASS browser probe → distinct remedies → no-repeat exhaustion at 1024/1365/1920px');
} finally {
  await browser.close();
}
