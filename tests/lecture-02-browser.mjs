import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-02';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={12:'관찰 · 힘과 모양 변화',13:'개념 · 탄성',14:'개념 · 누르기와 길이 구분',15:'실험 · 추 개수와 늘어난 길이',16:'표현 · 표를 그래프로',17:'탐구 설계 · 한 번에 한 조건',18:'적용 · 생활 속 용수철',19:'마무리 · 일일 테스트 1~6',20:'마무리 · 일일 테스트 7~12'};
// Everything the teacher needs while presenting must be inside the viewport without scrolling.
const inView=async(tab,selector,label)=>{
 const box=await tab.locator(selector).first().boundingBox();
 const size=tab.viewportSize();
 assert(box,`${label} is rendered`);
 assert(box.x>=-1&&box.y>=-1&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,`${label} fits ${size.width}x${size.height}: ${JSON.stringify(box)}`);
};
async function run(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 const teacher=await context.newPage();
 teacher.on('pageerror',error=>errors.push(error.message));
 await teacher.goto(`${base}teacher.html?page=12`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');
 await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=12;n<=20;n++){
  await teacher.locator('#page-select').selectOption(String(n));
  await notes.waitForFunction(phase=>document.querySelector('#lecture-phase')?.textContent===phase,phases[n]);
  assert.equal(await notes.locator('#lecture-steps li').count()>=3,true,`P${n} notes carry a sequence`);
  assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 \d+쪽/);
  await teacher.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,`P${n}`);
  const questions=n>=19?6:1;
  for(let q=0;q<questions;q++){
   const tag=`${width}px P${n}${n>=19?` Q${q+1}`:''}`;
   assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false,`${tag}: answer starts hidden`);
   await inView(teacher,'#lesson-stage .lesson-stage-content h2',`${tag} question`);
   await inView(teacher,'#lesson-stage [data-stage-reveal]',`${tag} reveal button`);
   await inView(teacher,'#lesson-stage .lesson-stage-visual',`${tag} visual`);
   const locked=n===20&&[2,3,4].includes(q);   // Daily Test 9–11
   assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),locked,`${tag}: lock state`);
   if(!locked){
    await teacher.locator('#lesson-stage [data-stage-reveal]').click();
    await inView(teacher,'#lesson-stage .stage-answer',`${tag} answer`);
    await teacher.locator('#lesson-stage [data-stage-explain]').click();
    await inView(teacher,'#lesson-stage .stage-explanation',`${tag} explanation`);
   }else{
    assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false,`${tag}: locked answer is never shown`);
    assert.match(await teacher.locator('#lesson-stage [data-stage-reveal]').innerText(),/공식 해설 검토 중/);
   }
   if(q===0&&n===16)await teacher.screenshot({path:join(out,`p16-${width}.png`)});
   if(q<questions-1)await teacher.locator('[data-stage-question="next"]').click();
  }
  if(await teacher.locator('#lesson-stage [data-stage-media]').count()&&n<19){
   await teacher.locator('#lesson-stage [data-stage-media]').first().click();
   await teacher.waitForFunction(()=>{const s=document.querySelector('#lesson-stage').getBoundingClientRect().width,m=document.querySelector('#activity').getBoundingClientRect().width;return s>300&&m>s;});
   assert.equal(await teacher.evaluate(()=>document.querySelector('#workspace').classList.contains('split')),true,`P${n} media opens beside the slide`);
   await teacher.screenshot({path:join(out,`p${n}-split-${width}.png`)});
   await teacher.locator('#close-activity').click().catch(()=>{});
  }
 }
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 2 lecture: P12–P20 notes sync, answer/explanation fit 1366x768 and 1920x1080, Daily Test 9–11 locked, media split passed');
}finally{await browser.close();}
