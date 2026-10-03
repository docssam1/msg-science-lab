import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const base=process.env.MSG_BASE_URL||'http://127.0.0.1:4317';
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`${base}/sample-v2/index.html?edition=student&page=11`);
 await page.waitForFunction(()=>Boolean(window.__sample));
 await page.evaluate(()=>window.__sample.report(1));
 await page.locator('[data-dt-advanced]').click();
 assert.deepEqual(await page.locator('[data-advanced]').evaluateAll(cards=>cards.map(card=>card.dataset.advanced)),['ad03']);
 assert.equal(await page.locator('[data-advanced="ad03"] .dt-why').count(),0,'answer shown before attempt');
 for(const width of [1024,1365,1920]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${width}px active-card overflow`);
  assert.equal(await page.locator('[data-advanced="ad03"] textarea').count(),1);
 }
 await page.setViewportSize({width:1365,height:900});
 await page.locator('[data-advanced="ad03"] [data-advanced-answer]').fill('크기만으로 알 수 없습니다. 빈 저울을 확인하고 표시자가 멈춘 뒤 눈높이를 맞춰 읽습니다.');
 await page.locator('[data-advanced="ad03"] [data-advanced-submit]').click();
 assert.match(await page.locator('[data-advanced="ad03"] .dt-why').innerText(),/자동 점수 없음/);
 await page.locator('[data-advanced="ad03"] [data-advanced-self="teacher"]').click();
 await page.locator('[data-advanced-back]').click();
 await page.locator('[data-dt-advanced]').click();
 assert.equal(await page.locator('[data-advanced]').count(),0,'fixed variants selected again');

 await page.evaluate(()=>window.__sample.report(2));
 await page.locator('[data-dt-advanced]').click();
 assert.deepEqual(await page.locator('[data-advanced]').evaluateAll(cards=>cards.map(card=>card.dataset.advanced)),['ad01','ad02']);
 assert.equal(await page.locator('[data-advanced="ad01"] .dt-why').count(),0,'answer shown before attempt');
 await page.locator('[data-advanced="ad01"] [data-advanced-answer]').fill('6');
 await page.locator('[data-advanced="ad01"] [data-advanced-submit]').click();
 assert.match(await page.locator('[data-advanced="ad01"] .dt-why').innerText(),/다시 생각/);
 await page.locator('[data-advanced="ad02"] input[value="1"]').check();
 await page.locator('[data-advanced="ad02"] [data-advanced-submit]').click();
 if(process.env.MSG_QA_OUT){await mkdir(process.env.MSG_QA_OUT,{recursive:true});await page.screenshot({path:`${process.env.MSG_QA_OUT}/advanced-two-lesson.png`,fullPage:true});}
 const log=await page.evaluate(()=>JSON.parse(localStorage.getItem('msg-source-sample-v2:learner:advanced-log')));
 assert.deepEqual(log.map(row=>row.status),['review','wrong','correct']);
 assert.equal(log[0].selfCheck,'teacher');
 await page.locator('[data-advanced-back]').click();
 await page.locator('[data-dt-advanced]').click();
 assert.equal(await page.locator('[data-advanced]').count(),0,'second-lesson variants selected again');
 for(const width of [1024,1365,1920]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${width}px overflow`);}
 await context.close();
 const teacher=await browser.newPage();
 await teacher.goto(`${base}/sample-v2/index.html?edition=teacher&page=11`);
 await teacher.waitForFunction(()=>Boolean(window.__sample));
 await teacher.evaluate(()=>window.__sample.report(1));
 assert.equal(await teacher.locator('[data-dt-advanced]').count(),0,'student practice opened in teacher mode');
 await teacher.close();
 assert.deepEqual(errors,[]);
 console.log('PASS advanced mini-set first attempts, numeric/choice/open review, self-check, no-repeat, teacher separation and 1024/1365/1920px fit');
}finally{await browser.close();}
