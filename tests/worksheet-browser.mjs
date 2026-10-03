import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const base=process.env.MSG_BASE_URL||'http://127.0.0.1:4317';
const out=process.env.MSG_QA_OUT;
if(!out)throw new Error('MSG_QA_OUT must be an E: QA directory');
await mkdir(out,{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('msg-source-sample-v2:learner:remedy-log',JSON.stringify([
  {item:'a2',ok:false,m:'M02',src:'test',answerKey:'dt-2026-09-26'},
  {item:'d02',ok:false,m:'M02',src:'probe',answerKey:'dt-2026-09-26'},
  {item:'b1',ok:false,m:'M05',src:'test',answerKey:'dt-2026-09-26'},
  {item:'b2',ok:false,m:'M05',src:'test',answerKey:'dt-2026-09-26'},
 ])));
 await page.goto(`${base}/sample-v2/index.html?edition=student&page=11`);
 await page.waitForFunction(()=>Boolean(window.__sample));
 await page.evaluate(()=>window.__sample.report(1));
 await page.locator('[data-dt-remedy]').click();
 assert.match(await page.locator('#activity-title').innerText(),/유사문제 워크지/);
 const remedyPopupPromise=page.waitForEvent('popup');
 await page.locator('[data-rx-print]').click();
 const remedyPopup=await remedyPopupPromise;
 await remedyPopup.waitForLoadState();
 const remedyText=await remedyPopup.locator('main').innerText();
 assert.match(remedyText,/빈 용수철저울/);
 assert.doesNotMatch(remedyText,/측정 전에 영점을 맞춰야/);
 assert.equal(await remedyPopup.locator('.question').count(),2);
 await remedyPopup.pdf({path:`${out}/similar-worksheet-qa.pdf`,format:'A4',preferCSSPageSize:true,printBackground:true});
 await remedyPopup.close();
 await page.locator('[data-rx="s03"] [data-rx-opt="1"]').click();
 const reducedRemedyPromise=page.waitForEvent('popup');
 await page.locator('[data-rx-print]').click();
 const reducedRemedy=await reducedRemedyPromise;
 await reducedRemedy.waitForLoadState();
 assert.equal(await reducedRemedy.locator('.question').count(),1,'answered variant is absent from a later print');
 assert.doesNotMatch(await reducedRemedy.locator('main').innerText(),/빈 용수철저울의 표시자가 0보다/);
 await reducedRemedy.close();

 await page.evaluate(()=>window.__sample.report(1));
 await page.locator('[data-dt-advanced]').click();
 assert.match(await page.locator('#activity-title').innerText(),/심화 워크지/);
 assert.deepEqual(await page.locator('[data-advanced]').evaluateAll(cards=>cards.map(card=>card.dataset.advanced)),['ad03']);
 const firstPopupPromise=page.waitForEvent('popup');
 await page.locator('[data-advanced-print]').click();
 const firstPopup=await firstPopupPromise;
 await firstPopup.waitForLoadState();
 assert.equal(await firstPopup.locator('.question').count(),1);
 assert.doesNotMatch(await firstPopup.locator('main').innerText(),/가상 실험 A/);
 await firstPopup.close();

 await page.evaluate(()=>window.__sample.report(2));
 await page.locator('[data-dt-advanced]').click();
 assert.deepEqual(await page.locator('[data-advanced]').evaluateAll(cards=>cards.map(card=>card.dataset.advanced)),['ad01','ad02']);
 const advancedPopupPromise=page.waitForEvent('popup');
 await page.locator('[data-advanced-print]').click();
 const advancedPopup=await advancedPopupPromise;
 await advancedPopup.waitForLoadState();
 const advancedText=await advancedPopup.locator('main').innerText();
 assert.match(advancedText,/30 g/);
 assert.doesNotMatch(advancedText,/3 cm × 3 = 9 cm/);
 assert.equal(await advancedPopup.locator('.question').count(),2);
 await advancedPopup.pdf({path:`${out}/advanced-worksheet-qa.pdf`,format:'A4',preferCSSPageSize:true,printBackground:true});
 await advancedPopup.close();
 await page.locator('[data-advanced="ad01"] [data-advanced-answer]').fill('9');
 await page.locator('[data-advanced="ad01"] [data-advanced-submit]').click();
 const reducedAdvancedPromise=page.waitForEvent('popup');
 await page.locator('[data-advanced-print]').click();
 const reducedAdvanced=await reducedAdvancedPromise;
 await reducedAdvanced.waitForLoadState();
 assert.equal(await reducedAdvanced.locator('.question').count(),1,'answered advanced variant is absent from a later print');
 assert.doesNotMatch(await reducedAdvanced.locator('main').innerText(),/가상 실험 A에서는/);
 await reducedAdvanced.close();
 await context.close();

 const teacher=await browser.newPage();
 await teacher.goto(`${base}/sample-v2/index.html?edition=teacher&page=11`);
 await teacher.waitForFunction(()=>Boolean(window.__sample));
 await teacher.evaluate(()=>window.__sample.report(1));
 assert.equal(await teacher.locator('[data-dt-advanced],[data-dt-remedy]').count(),0);
 await teacher.close();
 console.log('PASS printed test-linked similar and advanced sheets; no solution text in worksheet; teacher controls separated');
}finally{await browser.close();}
