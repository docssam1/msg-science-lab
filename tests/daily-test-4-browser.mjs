import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/daily-test-4';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`${base}student.html?page=40`);
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 // the paper shows the thirteen empty balances; only the book's 1 g example is drawn
 assert.equal(await page.locator('#lesson-stage .stage-question-paper .student-graphic .weights-sheet figure').count(),13);
 assert.equal(await page.locator('#lesson-stage .stage-question-paper .student-graphic .weights-sheet svg g rect').count(),1,'only the book example (1 g on the right pan) is drawn for the student');
 assert.equal(await page.locator('#lesson-stage [data-action="weights"]').count()>0,true,'the balance lab is offered');
 assert.match(await page.locator('#lesson-stage [data-stage-grade]').innerText(),/내 기록 확인하기/);
 await page.locator('#lesson-stage [data-stage-grade]').click();
 await page.locator('.dt-report').waitFor();
 const card=page.locator('.dt-card[data-dt-item="e1"]');
 assert.match(await card.getAttribute('class'),/review/,'a drawing is checked in person, never scored automatically');
 assert.match(await card.innerText(),/자동으로 채점하지 않아요/);
 assert.match(await page.locator('.dt-hero').innerText(),/채점할 수 있는 문항이 아직 없어요/);
 assert.doesNotMatch(await page.locator('.dt-report').innerText(),/정답 미인쇄/,'no key and no review memo is shown to the student');
 assert.equal(await page.locator('[data-dt-advanced]').count(),0,'no invented advanced worksheet for lesson 4');
 await page.screenshot({path:join(out,'daily-test-4-report.png')});
 await card.locator('[data-dt-lab="weights"]').click();
 await page.locator('.pans-activity').waitFor();
 assert.match(await page.locator('#activity-title').innerText(),/양팔저울/);
 assert.deepEqual(errors,[]);
 console.log('daily test 4: one drawing item, thirteen empty balances for the student, no automatic score, no key shown, balance lab opens from the report');
}finally{await browser.close();}
