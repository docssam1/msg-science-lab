import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/unit-test-6';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
// 해설 PDF 정답(보기 번호 1부터). 3번만 일부러 틀리게 답해 채점이 정답표를 쓰는지 확인한다.
const OFFICIAL=[1,5,2,2,3,2,3,2,3,5,1,2,4,3,1,2,5,2,4,4];
const groups={53:[1,6],54:[7,12],55:[13,17],56:[18,20]};
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 for(const [p,[from,to]] of Object.entries(groups)){
  await page.goto(`${base}student.html?page=${p}`);
  await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  for(let n=from;n<=to;n++){
   if(n>from)await page.locator('#lesson-stage [data-stage-question="next"]').click();
   const choice=n===3?0:OFFICIAL[n-1]-1;
   await page.locator(`#lesson-stage .stage-question-paper input[name="g${n}"][value="${choice}"]`).check({force:true});
  }
  await page.locator('#lesson-stage [data-stage-grade]').click();
  await page.locator('.dt-report').waitFor();
  assert.match(await page.locator('#activity-title').innerText(),/단원 평가 · 1\. 무게 재기/);
  for(let n=from;n<=to;n++){
   const cls=await page.locator(`.dt-card[data-dt-item="g${n}"]`).getAttribute('class');
   assert.match(cls,n===3?/wrong/:/correct/,`g${n}`);
  }
  if(p==='53'){const card=await page.locator('.dt-card[data-dt-item="g3"]').textContent();assert.match(card,/물체의 무게를 정확하게 측정할 수 없다/,'the key comes from the official answer');}
  await page.screenshot({path:join(out,`unit-test-6-${p}.png`)});
 }
 assert.deepEqual(errors,[]);
 console.log('unit test 6: all 20 items graded with the official key (해설 PDF), wrong answer to 3 flagged, report titled 단원 평가');
}finally{await browser.close();}
