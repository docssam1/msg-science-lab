import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/daily-test-5';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const MEMO=/검수 메모|정답이 인쇄돼|도출한 답|근거 문장이 없/;
// 화면에서 한 문항씩 답한다. choice는 보기 번호, essay는 글.
const answers={47:[['f1',0],['f2',3],['f3',3],['f4',1],['f5','두 용수철이 늘어난 길이가 달라요.'],['f6',1]],48:[['f7','클립이 너무 가벼워요.'],['f8',1],['f9',1],['f10',0],['f11','정확하게 재려고요.'],['f12','양쪽 팔 길이가 같아서 수평이면 무게가 같아요.']]};
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 for(const n of [47,48]){
  await page.goto(`${base}student.html?page=${n}`);
  await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  for(const [i,[id,value]] of answers[n].entries()){
   if(i>0)await page.locator('#lesson-stage [data-stage-question="next"]').click();
   const paper=page.locator('#lesson-stage .stage-question-paper');
   if(typeof value==='number')await paper.locator(`input[name="${id}"][value="${value}"]`).check({force:true});
   else await paper.locator(`textarea[name="${id}"]`).fill(value);
   if(id==='f2'||id==='f5')assert.equal(await page.locator('#lesson-stage img.stage-question-image').count(),1,`${id} shows its 3D figure`);
  }
  assert.match(await page.locator('#lesson-stage [data-stage-grade]').innerText(),/여섯 문항 채점하기/);
  await page.locator('#lesson-stage [data-stage-grade]').click();
  await page.locator('.dt-report').waitFor();
  const status=async id=>(await page.locator(`.dt-card[data-dt-item="${id}"]`).getAttribute('class')).split(' ').pop();
  if(n===47){
   for(const id of ['f1','f2','f3','f6'])assert.equal(await status(id),'correct',id);
   assert.equal(await status('f4'),'wrong','팔걸이 is not the book part name');
   assert.equal(await status('f5'),'review');
   assert.match(await page.locator('.dt-card[data-dt-item="f5"]').innerText(),/공식 정답·해설을 확인하고 있는 문항/);
  }else{
   for(const id of ['f8','f9','f10'])assert.equal(await status(id),'correct',id);
   for(const id of ['f7','f11','f12'])assert.equal(await status(id),'review',id);
   const essay=await page.locator('.dt-card[data-dt-item="f12"]').innerText();
   assert.match(essay,/교재 근거/);assert.match(essay,/서술형은 자동으로 채점하지 않아요/);
   assert.doesNotMatch(await page.locator('.dt-card[data-dt-item="f11"]').innerText(),/교재 근거/,'locked essays show no key');
  }
  assert.doesNotMatch(await page.locator('.dt-report').innerText(),MEMO,'no review memo is shown to the student');
  assert.equal(await page.locator('[data-dt-advanced]').count(),0,'no invented advanced worksheet for lesson 5');
  assert.match(await page.locator('#activity-title').innerText(),/5차시 Daily Test/);
  await page.screenshot({path:join(out,`daily-test-5-${n}.png`)});
 }
 assert.deepEqual(errors,[]);
 console.log('daily test 5: choices 1·2·3·6·8·9·10 scored from the book, 4 marks the non-book word wrong, essays 5·7·11 locked, essay 12 shows only the book basis, no memo in the report');
}finally{await browser.close();}
