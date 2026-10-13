import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/daily-test-7';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const MEMO=/검수 메모|정답이 인쇄돼|도출|근거 문장이 없|공식 정답이 아닙니다/;
// 화면에서 한 문항씩 답한다. choice는 보기 번호, text는 글, parts는 칸마다 글, essay는 글.
const answers={65:[['h1','text','v'],['h2','choice',0],['h3','choice',0],['h4','parts',['이동 거리','시간']],['h5','text','80 m/s']],66:[['h6','text','미터 퍼 세크'],['h7','text','미터 퍼 세크'],['h8','essay','1초에 5m를 가요.'],['h9','essay','1시간에 5km를 가요.'],['h10','essay','B가 더 빨라요.']]};
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 for(const n of [65,66]){
  await page.goto(`${base}student.html?page=${n}`);
  await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  for(const [i,[id,kind,value]] of answers[n].entries()){
   if(i>0)await page.locator('#lesson-stage [data-stage-question="next"]').click();
   const paper=page.locator('#lesson-stage .stage-question-paper');
   if(kind==='choice')await paper.locator(`input[name="${id}"][value="${value}"]`).check({force:true});
   else if(kind==='parts')for(const [k,v] of value.entries())await paper.locator(`input[name="${id}-${k}"]`).fill(v);
   else if(kind==='essay')await paper.locator(`textarea[name="${id}"]`).fill(value);
   else await paper.locator(`input[name="${id}"]`).fill(value);
  }
  assert.match(await page.locator('#lesson-stage [data-stage-grade]').innerText(),/다섯 문항 채점하기/);
  await page.locator('#lesson-stage [data-stage-grade]').click();
  await page.locator('.dt-report').waitFor();
  const status=async id=>(await page.locator(`.dt-card[data-dt-item="${id}"]`).getAttribute('class')).split(' ').pop();
  if(n===65){
   for(const id of ['h2','h4','h5'])assert.equal(await status(id),'correct',id);
   assert.equal(await status('h3'),'wrong','정지 is not the state with a travelled distance');
   assert.equal(await status('h1'),'review');
   assert.match(await page.locator('.dt-card[data-dt-item="h1"]').innerText(),/공식 정답·해설을 확인하고 있는 문항/);
  }else{
   assert.equal(await status('h6'),'correct');
   assert.equal(await status('h7'),'wrong','미터 퍼 세크 is the reading of a different unit');
   for(const id of ['h8','h9','h10'])assert.equal(await status(id),'review',id);
   const essay=await page.locator('.dt-card[data-dt-item="h8"]').innerText();
   assert.match(essay,/교재 근거/);assert.match(essay,/1초당 5m를 이동하는 빠르기/);assert.match(essay,/서술형은 자동으로 채점하지 않아요/);
  }
  assert.doesNotMatch(await page.locator('.dt-report').innerText(),MEMO,'no review memo is shown to the student');
  assert.equal(await page.locator('[data-dt-advanced]').count(),0,'no invented advanced worksheet for lesson 7');
  assert.match(await page.locator('#activity-title').innerText(),/7차시 Daily Test/);
  await page.screenshot({path:join(out,`daily-test-7-${n}.png`)});
 }
 assert.deepEqual(errors,[]);
 console.log('daily test 7: 2·4·5·6 scored from pp.50–56, 3 and 7 marked wrong with book words, symbol item 1 locked, essays 8–10 show only the book basis, no memo in the report');
}finally{await browser.close();}
