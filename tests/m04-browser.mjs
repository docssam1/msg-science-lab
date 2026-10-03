import assert from 'node:assert/strict';
const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1365,height:900},reducedMotion:'reduce'});
 const base=process.env.MSG_BASE_URL||'http://127.0.0.1:4317';
 await page.goto(`${base}/sample-v2/index.html?edition=student&page=5`);
 await page.waitForFunction(()=>Boolean(window.__sample));
 await page.evaluate(()=>window.__sample.open('inquiry'));
 await page.locator('[data-prediction-reason]').fill('크기와 재료가 달라서 저울로 비교해야 해요.');
 await page.locator('[data-prediction-done]').click();
 await page.waitForFunction(()=>Boolean(window.__lab));
 await page.locator('[data-confirm-empty]').click();
 await page.evaluate(()=>{document.querySelector('[data-object="shoe"]').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));document.querySelector('[data-inquiry-record]').click();});
 const log=await page.evaluate(()=>window.__sample.remedyLog());
 assert.equal(log.filter(row=>row.item==='inquiry-motion').length,1);
 assert.match(await page.locator('[data-inquiry-feedback]').innerText(),/표시자가 멈춘 뒤/);
 await page.evaluate(()=>document.querySelector('[data-inquiry-record]').click());
 assert.equal((await page.evaluate(()=>window.__sample.remedyLog())).filter(row=>row.item==='inquiry-motion').length,1,'same activity event cannot count twice');
 await page.evaluate(()=>window.__sample.report(1));
 assert.equal(await page.locator('[data-dt-probe]').count(),1);
 await page.locator('[data-dt-probe]').click();
 assert.equal(await page.locator('[data-probe="d04"]').count(),1);
 console.log('PASS observed moving-pointer click → one M04 suspicion → distinct d04 probe');
}finally{await browser.close();}
