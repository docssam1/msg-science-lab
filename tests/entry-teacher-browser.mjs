import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/entry-teacher';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:768}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'index.html');
 await page.waitForURL(/start\.html$/);
 assert.equal(await page.locator('.card').count(),3);
 assert.equal(await page.locator('.print-links a').count(),2);
 for(const file of ['student.pdf','teacher.pdf']){
  const response=await context.request.get(base+'print/'+file);
  assert.equal(response.status(),200,`${file} should open from the first screen`);
  assert.match(response.headers()['content-type']||'',/pdf/);
 }
 await page.screenshot({path:join(out,'entry-1366.png')});
 await page.getByRole('link',{name:'학생 화면 열기'}).click();
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await page.locator('body').getAttribute('data-edition'),'student');

 await page.goto(base+'teacher.html?page=20');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await page.locator('#teacher-notes').isVisible(),true);
 const popupPromise=page.waitForEvent('popup');
 await page.locator('#teacher-notes').click();
 const notes=await popupPromise;await notes.waitForLoadState('domcontentloaded');
 await notes.waitForFunction(()=>document.querySelector('#page')?.textContent.includes('장면'));
 assert.equal(await notes.locator('#answer-section').isVisible(),true);
 assert.equal(await notes.locator('#answers').isVisible(),false);
 await notes.locator('#show-answer').click();
 assert.equal(await notes.locator('#answers li').count(),6);
 assert.match(await notes.locator('#answers').innerText(),/9번 · 공식 해설 대조 필요/);
 assert.doesNotMatch(await notes.locator('#answers').innerText(),/9번 · 크다/);
 await notes.locator('#memo').fill('오늘은 추의 무게와 변형량을 구분해 질문하기');
 await notes.reload();
 assert.equal(await notes.locator('#memo').inputValue(),'오늘은 추의 무게와 변형량을 구분해 질문하기');
 await notes.screenshot({path:join(out,'teacher-notes-1366.png')});
 await page.locator('#page-select').selectOption('11');
 await notes.waitForFunction(()=>document.querySelector('#page')?.textContent.includes('12/21'));
 assert.equal(await notes.locator('#memo').inputValue(),'');
 await page.locator('#page-select').selectOption('16');
 await notes.waitForFunction(()=>document.querySelector('#page')?.textContent.includes('17/21'));
 assert.match(await notes.locator('#source-cue').innerText(),/2 cm/);
 assert.match(await notes.locator('#source-cue').innerText(),/3·6·9 cm/);
 assert.deepEqual(errors,[]);

 const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});
 await mobile.goto(base+'start.html');
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mobile.screenshot({path:join(out,'entry-390.png')});
 console.log('entry and teacher notes: first-screen roles/PDFs, teacher memo persistence, locked explanations, 390px width passed');
}finally{await browser.close();}
