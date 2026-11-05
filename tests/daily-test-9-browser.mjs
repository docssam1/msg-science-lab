import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/daily-test-9';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const MEMO=/검수 메모|정답이 인쇄돼|도출|근거 문장이 없|공식 정답이 아닙니다|글자 인식/;
// choice는 보기 번호(0부터), text는 글
const answers={79:[['j1','choice',0],['j2','choice',0],['j3','text','12cm/s'],['j4','choice',4],['j5','choice',1]],80:[['j6','text','2'],['j7','choice',3],['j8','choice',0],['j9','choice',4],['j10','choice',3]]};
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 for(const n of [79,80]){
  await page.goto(`${base}student.html?page=${n}`);
  await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  for(const [i,[id,kind,value]] of answers[n].entries()){
   if(i>0)await page.locator('#lesson-stage [data-stage-question="next"]').click();
   const paper=page.locator('#lesson-stage .stage-question-paper');
   if(kind==='choice')await paper.locator(`input[name="${id}"][value="${value}"]`).check({force:true});
   else await paper.locator(`input[name="${id}"]`).fill(value);
   if(['j4','j5','j6','j9','j10'].includes(id))assert(await page.locator('#lesson-stage table').count()>0,`${id} shows its table`);
  }
  assert.match(await page.locator('#lesson-stage [data-stage-grade]').innerText(),/다섯 문항 채점하기/);
  await page.locator('#lesson-stage [data-stage-grade]').click();
  await page.locator('.dt-report').waitFor();
  const status=async id=>(await page.locator(`.dt-card[data-dt-item="${id}"]`).getAttribute('class')).split(' ').pop();
  if(n===79){
   for(const id of ['j1','j3','j4','j5'])assert.equal(await status(id),'correct',id);
   assert.equal(await status('j2'),'wrong','가까울수록 is the opposite of the book sentence');
  }else{
   for(const id of ['j7','j8','j9','j10'])assert.equal(await status(id),'correct',id);
   assert.equal(await status('j6'),'review');assert.match(await page.locator('.dt-card[data-dt-item="j6"]').innerText(),/공식 정답·해설을 확인하고 있는 문항/);
  }
  assert.doesNotMatch(await page.locator('.dt-report').innerText(),MEMO,'no review memo is shown to the student');
  assert.equal(await page.locator('[data-dt-advanced]').count(),0,'no invented advanced worksheet for lesson 9');
  assert.match(await page.locator('#activity-title').innerText(),/9차시 Daily Test/);
  await page.screenshot({path:join(out,`daily-test-9-${n}.png`)});
 }
 assert.deepEqual(errors,[]);
 console.log('daily test 9: 1·3·4·5·7·8·9·10 scored from pp.64–67 and the tables, 2 marked wrong, the stone count (6) locked, no memo in the report');
}finally{await browser.close();}
