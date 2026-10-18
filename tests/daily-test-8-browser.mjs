import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/daily-test-8';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const MEMO=/검수 메모|정답이 인쇄돼|도출|근거 문장이 없|공식 정답이 아닙니다/;
const answers={73:[['i1','parts',['s','m','h']],['i2','text','d'],['i3','text','1'],['i4','essay','처음 위치에서 나중 위치까지의 변화']],74:[['i5','text','4m/s'],['i6','text','5 m/s'],['i7','text','2m/s'],['i8','text','50']]};
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 for(const n of [73,74]){
  await page.goto(`${base}student.html?page=${n}`);
  await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  for(const [i,[id,kind,value]] of answers[n].entries()){
   if(i>0)await page.locator('#lesson-stage [data-stage-question="next"]').click();
   const paper=page.locator('#lesson-stage .stage-question-paper');
   if(kind==='parts')for(const [k,v] of value.entries())await paper.locator(`input[name="${id}-${k}"]`).fill(v);
   else if(kind==='essay')await paper.locator(`textarea[name="${id}"]`).fill(value);
   else await paper.locator(`input[name="${id}"]`).fill(value);
  }
  assert.match(await page.locator('#lesson-stage [data-stage-grade]').innerText(),/네 문항 채점하기/);
  await page.locator('#lesson-stage [data-stage-grade]').click();
  await page.locator('.dt-report').waitFor();
  const status=async id=>(await page.locator(`.dt-card[data-dt-item="${id}"]`).getAttribute('class')).split(' ').pop();
  if(n===73){
   assert.equal(await status('i1'),'correct');
   for(const id of ['i2','i3','i4']){assert.equal(await status(id),'review',id);assert.match(await page.locator(`.dt-card[data-dt-item="${id}"]`).innerText(),/공식 정답·해설을 확인하고 있는 문항/);}
  }else{
   for(const id of ['i5','i6','i8'])assert.equal(await status(id),'correct',id);
   assert.equal(await status('i7'),'review','an unknown number is left for the teacher');
  }
  assert.doesNotMatch(await page.locator('.dt-report').innerText(),MEMO,'no review memo is shown to the student');
  assert.equal(await page.locator('[data-dt-advanced]').count(),0,'no invented advanced worksheet for lesson 8');
  assert.match(await page.locator('#activity-title').innerText(),/8차시 Daily Test/);
  await page.screenshot({path:join(out,`daily-test-8-${n}.png`)});
 }
 assert.deepEqual(errors,[]);
 console.log('daily test 8: 1 (s·m·h) and 5·6·8 scored, 2–4 locked, an unrecognised 7 goes to review, no memo in the report');
}finally{await browser.close();}
