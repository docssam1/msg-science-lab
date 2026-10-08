import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-03';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={21:'도입 · 만유인력',22:'개념 · 중력의 뜻·방향·크기',23:'체험 · 떨어지는 방향',24:'쉬어가기 · 중력의 이용',25:'개념 · 무게의 뜻과 단위',26:'개념 · 측정과 장소',27:'탐구 · 높이에 따른 변화',28:'개념 · 질량',29:'정리 · 무게와 질량 비교',30:'표현 · 질량과 무게 그래프',31:'정리 · 어림과 기준물체',32:'마무리 · 일일 테스트 1~9'};
const silent=()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};};
// everything the teacher needs while presenting must be inside the viewport and not clipped by its column
const inView=async(tab,selector,label)=>{
 const box=await tab.locator(selector).first().boundingBox();
 const size=tab.viewportSize();
 assert(box,`${label} is rendered`);
 assert(box.x>=-1&&box.y>=-1&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,`${label} fits ${size.width}x${size.height}: ${JSON.stringify(box)}`);
 const clip=await tab.locator(selector).first().evaluate(el=>{const c=el.closest('.lesson-stage-content,.lesson-stage-visual');if(!c)return true;const r=el.getBoundingClientRect(),k=c.getBoundingClientRect();return r.bottom<=k.bottom+1&&r.top>=k.top-1;});
 assert(clip,`${label} is not clipped by its column`);
};
async function run(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(silent);
 const teacher=await context.newPage();
 teacher.on('pageerror',error=>errors.push(error.message));
 await teacher.goto(`${base}teacher.html?page=21`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');
 await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=21;n<=32;n++){
  await teacher.locator('#page-select').selectOption(String(n));
  await notes.waitForFunction(phase=>document.querySelector('#lecture-phase')?.textContent===phase,phases[n]);
  assert.equal(await notes.locator('#lecture-steps li').count()>=3,true,`P${n} notes carry a sequence`);
  assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 \d+쪽/);
  await teacher.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,`P${n}`);
  const questions=n===32?9:1;
  for(let q=0;q<questions;q++){
   const tag=`${width}px P${n}${n===32?` Q${q+1}`:''}`;
   assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false,`${tag}: answer starts hidden`);
   await inView(teacher,'#lesson-stage .lesson-stage-content h2',`${tag} question`);
   await inView(teacher,'#lesson-stage [data-stage-reveal]',`${tag} reveal button`);
   await inView(teacher,'#lesson-stage .lesson-stage-visual',`${tag} visual`);
   const locked=n===32&&q===8;   // Daily Test 9 has no official key
   assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),locked,`${tag}: lock state`);
   if(!locked){
    await teacher.locator('#lesson-stage [data-stage-reveal]').click();
    await inView(teacher,'#lesson-stage .stage-answer',`${tag} answer`);
    await teacher.locator('#lesson-stage [data-stage-explain]').click();
    await inView(teacher,'#lesson-stage .stage-explanation',`${tag} explanation`);
   }else{
    assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false,`${tag}: locked answer is never shown`);
    assert.match(await teacher.locator('#lesson-stage [data-stage-reveal]').innerText(),/공식 해설 검토 중/);
    assert.equal(await teacher.locator('#lesson-stage .stage-slots li').count(),5,'item 9 shows its five blanks as the question, not as an answer');
    assert.equal(await teacher.locator('#lesson-stage .stage-explanation').isVisible(),false,`${tag}: no explanation either`);
   }
   if(n===32&&q===3){assert.equal(await teacher.locator('#lesson-stage [data-stage-media]').count(),1,'Daily Test 4 opens the direction lab');}
   if(q<questions-1)await teacher.locator('[data-stage-question="next"]').click();
  }
 }
 await context.close();
}
async function labs(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(silent);
 const open=async(n,kind)=>{const tab=await context.newPage();tab.on('pageerror',error=>errors.push(error.message));await tab.goto(`${base}teacher.html?page=${n}`);await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');await tab.locator('#lesson-stage [data-stage-media]').first().click();await tab.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));await tab.locator('#activity').waitFor();return tab;};
 // 1) 중력 방향: a wrong direction is neutral, every right one draws an arrow, four rights finish the lab
 let tab=await open(23);
 await tab.locator('[data-spot="1"][data-dir="up"]').click();
 assert.doesNotMatch(await tab.locator('.gravity-note').innerText(),/지구 중심 쪽으로 떨어져요/,'wrong choice does not reveal the answer');
 assert.equal(await tab.locator('.gravity-earth path[stroke="#d13a35"]').count(),0,'no arrow for a wrong choice');
 for(const [n,dir] of [[1,'down'],[2,'right'],[3,'up'],[4,'left']])await tab.locator(`[data-spot="${n}"][data-dir="${dir}"]`).click();
 assert.equal(await tab.locator('.gravity-earth path[stroke="#d13a35"]').count(),4,'four arrows toward the center');
 assert.match(await tab.locator('.gravity-note').innerText(),/네 위치 모두/);
 await tab.close();
 // 2) 지구/달: only the book's values appear
 tab=await open(26,'moon-weight');
 assert.match(await tab.locator('.weight-read').innerText(),/58\.8 N/);
 await tab.locator('[data-place="moon"]').click();
 assert.match(await tab.locator('.weight-read').innerText(),/9\.8 N/);
 await tab.close();
 tab=await open(29,'weight-mass');
 assert.match(await tab.locator('.weight-read').innerText(),/588 N[\s\S]*질량 60 kg/);
 await tab.locator('[data-place="moon"]').click();
 assert.match(await tab.locator('.weight-read').innerText(),/98 N[\s\S]*질량 60 kg/);
 await tab.locator('[data-q="mass"][data-a="diff"]').click();
 assert.match(await tab.locator('.weight-feedback').innerText(),/고유한 양/,'wrong answer is coached with the book definition');
 await tab.locator('[data-q="mass"][data-a="same"]').click();
 assert.match(await tab.locator('.weight-feedback').innerText(),/질량은 어느 곳에서나 같아요/);
 await tab.close();
 // 3) 질량-무게 그래프
 tab=await open(30,'mass-weight-graph');
 await tab.locator('[data-x]').selectOption('1');await tab.locator('[data-y]').fill('9.8');await tab.locator('[data-add]').click();
 await tab.locator('[data-check]').click();
 assert.doesNotMatch(await tab.locator('#activity-status').innerText(),/교재의 값과 같아요/,'one point is not enough');
 await tab.locator('[data-x]').selectOption('6');await tab.locator('[data-y]').fill('58.8');await tab.locator('[data-add]').click();
 await tab.locator('[data-check]').click();
 assert.match(await tab.locator('#activity-status').innerText(),/교재의 값과 같아요/);
 await tab.screenshot({path:join(out,`graph-${width}.png`)});
 await tab.close();
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 await labs(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 3 lecture: P21–P32 notes sync, answer/explanation fit 1366x768 and 1920x1080, Daily Test 9 locked, gravity/moon/weight-mass/graph labs behave and show only book values');
}finally{await browser.close();}
