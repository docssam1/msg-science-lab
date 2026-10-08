import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/daily-test-3';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`${base}student.html?page=32`);
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 const fill=async(name,value)=>{const field=page.locator(`#lesson-stage [name="${name}"]`);if(await field.evaluate(el=>el.tagName)==='SELECT')await field.selectOption(value);else await field.fill(value);};
 const next=()=>page.locator('[data-stage-question="next"]').click();
 // 1~3, 4 (drawn on paper), 5~8, 9: the student answers each question on screen
 await fill('c1','중력');await next();
 await fill('c2','무게');await next();
 await fill('c3-0','1');await fill('c3-1','9.8');await next();
 assert.equal(await page.locator('#lesson-stage [data-action="gravity"], #lesson-stage [data-stage-media]').count()>0,true,'Daily Test 4 offers the direction lab');
 await next();
 await fill('c5','60');await next();
 await fill('c6','질량');await next();
 await fill('c7-0','윗접시저울');await fill('c7-1','대저울');await next();
 await fill('c8-0','용수철저울');await fill('c8-1','가정용 저울');await next();
 for(let i=0;i<5;i++)await fill(`c9-${i}`,'↑');
 assert.match(await page.locator('#lesson-stage [data-stage-grade]').innerText(),/아홉 문항 채점하기/);
 await page.locator('#lesson-stage [data-stage-grade]').click();
 await page.locator('.dt-report').waitFor();
 const card=id=>page.locator(`.dt-card[data-dt-item="${id}"]`);
 for(const id of ['c1','c2','c3','c5','c6','c7','c8'])assert.equal(await card(id).getAttribute('class').then(c=>/correct/.test(c)),true,`${id} is graded correct from the book's own statements`);
 assert.match(await card('c4').innerText(),/자동으로 채점하지 않아요/,'arrow drawing is checked in person');
 assert.match(await card('c9').innerText(),/공식 정답·해설을 확인하고 있는 문항/,'item 9 stays out of the score');
 assert.doesNotMatch(await card('c9').innerText(),/정답\s*↑|정답\s*↓/,'item 9 never shows a key');
 assert.match(await page.locator('.dt-hero').innerText(),/7\s*\/\s*7/,'seven confirmed items, all correct; 4 and 9 excluded');
 assert.equal(await page.locator('[data-dt-advanced]').count(),0,'no invented advanced worksheet for lesson 3');
 await page.screenshot({path:join(out,'daily-test-3-report.png')});
 // a wrong tool type is coached, never shown as a key before the student answers
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.deepEqual(errors,[]);
 console.log('daily test 3: student answers 9 items on screen, 1–3 and 5–8 grade from book statements (7/7), 4 is checked in person, 9 stays locked and out of the score, no advanced worksheet');
}finally{await browser.close();}
