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
 assert.equal(await page.locator('.card').count(),4);
 assert.equal(await page.locator('.card a[href$=".pdf"]').count(),2);
 for(const file of ['student.pdf','teacher.pdf']){
  const response=await context.request.get(base+'print/'+file);
  assert.equal(response.status(),200,`${file} should open from the first screen`);
  assert.match(response.headers()['content-type']||'',/pdf/);
 }
 await page.screenshot({path:join(out,'entry-1366.png')});
 await page.getByRole('link',{name:'우루사쌤 수업 열기'}).click();
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await page.locator('body').getAttribute('data-edition'),'student');

 await page.goto(base+'teacher.html?page=20');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await page.locator('.lesson-tools summary').click();
 assert.equal(await page.locator('#teacher-notes').isVisible(),true);
 const popupPromise=page.waitForEvent('popup');
 await page.locator('#teacher-notes').click();
 const notes=await popupPromise;await notes.waitForLoadState('domcontentloaded');
 await notes.waitForFunction(()=>document.querySelector('#page')?.textContent.includes('장면'));
 assert.equal(await notes.locator('#lecture-section').isVisible(),true,'second-lesson notes now carry the lecture run of show');
 assert.match(await notes.locator('#lecture-steps').innerText(),/9~11번은 공식 해설과 원문 대조가 끝나기 전까지/);
 assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 21쪽/);
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
 assert.equal(await notes.locator('#lecture-section').isVisible(),true);
 assert.match(await notes.locator('#lecture-steps').innerText(),/일일 테스트 1~6번/);
 assert.equal(await notes.locator('#memo').inputValue(),'');
 await page.locator('#page-select').selectOption('5');
 await notes.waitForFunction(()=>document.querySelector('#lecture-phase')?.textContent.includes('직접 측정'));
 assert.match(await notes.locator('#lecture-check').innerText(),/실험 방법에 오류가 있어요/);
 assert.match(await notes.locator('#lecture-origin').innerText(),/추가 탐구/);
 await notes.evaluate(()=>scrollTo(0,0));
 await notes.screenshot({path:join(out,'teacher-lecture-p5.png')});
 await page.locator('#page-select').selectOption('15');
 await notes.waitForFunction(()=>document.querySelector('#page')?.textContent.includes('16/21'));
 assert.match(await notes.locator('#source-cue').innerText(),/2 cm/);
 assert.match(await notes.locator('#source-cue').innerText(),/3·6·9 cm/);
 assert.deepEqual(errors,[]);

 const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});
 await mobile.goto(base+'start.html');
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mobile.screenshot({path:join(out,'entry-390.png')});
 console.log('entry and teacher notes: first-screen roles/PDFs, teacher memo persistence, locked explanations, 390px width passed');
}finally{await browser.close();}
