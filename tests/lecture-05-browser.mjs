import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-05';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={41:'도입 · 앉은뱅이저울의 속 구조',42:'개념 · 가정용 저울의 사용방법',43:'개념 · 윗접시저울의 구조',44:'탐구 · 윗접시저울을 사용하는 방법',45:'정리 · 분동의 이용',46:'생각 · Speed Question',47:'마무리 · 일일 테스트 1~6',48:'마무리 · 일일 테스트 7~12'};
const locked=new Set(['47:4','48:0','48:4']);   // 5번 · 7번 · 11번
const MEMO=/검수 메모|정답이 인쇄돼|도출한 답|근거 문장이 없|고치지 않았습니다/;
const silent=()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};};
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
 await teacher.goto(`${base}teacher.html?page=41`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');
 await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=41;n<=48;n++){
  await teacher.locator('#page-select').selectOption(String(n));
  await notes.waitForFunction(phase=>document.querySelector('#lecture-phase')?.textContent===phase,phases[n]);
  assert.equal(await notes.locator('#lecture-steps li').count()>=3,true,`P${n} notes carry a sequence`);
  assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 \d+쪽/);
  await teacher.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,`P${n}`);
  const count=n>=47?6:1;
  for(let q=0;q<count;q++){
   const tag=`${width}px P${n}#${q+1}`;
   if(q>0){await teacher.locator('#lesson-stage [data-stage-question="next"]').click();await teacher.waitForFunction(i=>document.querySelector('#lesson-stage .stage-question-nav span')?.textContent.startsWith(`${i} /`),q+1);}
   assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false,`${tag}: answer starts hidden`);
   await inView(teacher,'#lesson-stage .lesson-stage-content h2',`${tag} question`);
   await inView(teacher,'#lesson-stage [data-stage-reveal]',`${tag} reveal button`);
   await inView(teacher,'#lesson-stage .lesson-stage-visual',`${tag} visual`);
   const isLocked=locked.has(`${n}:${q}`);
   assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),isLocked,`${tag}: lock state`);
   if(!isLocked){
    await teacher.locator('#lesson-stage [data-stage-reveal]').click();
    await inView(teacher,'#lesson-stage .stage-answer',`${tag} answer`);
    await teacher.locator('#lesson-stage [data-stage-explain]').click();
    await inView(teacher,'#lesson-stage .stage-explanation',`${tag} explanation`);
   }
   assert.doesNotMatch(await teacher.locator('#lesson-stage').innerText(),MEMO,`${tag}: no review memo on the projected scene`);
  }
  assert.match(await notes.locator('#lecture-check').innerText(),/확인할 점/);
 }
 await context.close();
}
async function labs(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(silent);
 const open=async n=>{const tab=await context.newPage();tab.on('pageerror',error=>errors.push(error.message));await tab.goto(`${base}teacher.html?page=${n}`);await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');await tab.locator('#lesson-stage [data-stage-media]').first().click();await tab.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));await tab.locator('#activity-content canvas').waitFor();await tab.waitForTimeout(1200);return tab;};
 const ds=(tab,key)=>tab.locator('#activity-content canvas').getAttribute(`data-${key}`);
 const note=tab=>tab.locator('.lab5-note').innerText();
 // 1) 가정용 저울: 사용방법 ①②③의 순서와 관찰①
 let tab=await open(41);const k=tab.locator('#activity-content');
 assert.equal(await ds(tab,'flat'),'false','starts on a slope');
 await k.locator('[data-do="flat"]').click();
 await k.locator('[data-do="zero"]').click();
 assert.match(await note(tab),/0이 아니에요/,'② refuses while the needle is off zero');
 for(let i=0;i<4;i++)await k.locator('[data-turn="-10"]').click();
 assert.equal(await ds(tab,'zero'),'0');
 await k.locator('[data-do="zero"]').click();
 await k.locator('[data-object="apple"]').click();
 await tab.waitForTimeout(800);
 assert.equal(await ds(tab,'reading'),'230');
 await k.locator('[data-read-input]').fill('230');await k.locator('[data-do="read"]').click();
 assert.match(await note(tab),/230 g!/);
 await k.locator('[data-view="in"]').click();
 assert.equal(await ds(tab,'open'),'true','the shell opens to show the spring');
 await tab.screenshot({path:join(out,`kitchen-${width}.png`)});
 await tab.close();
 // 2) 윗접시저울: 영점 → 무거운 분동부터 → 가벼운 분동부터 내리기
 tab=await open(43);const t=tab.locator('#activity-content');
 await t.locator('[data-part="영점조절나사"]').click();
 assert.match(await t.locator('.lab5-book').innerText(),/바늘이 0점에 오도록 조정하는 나사이다/);
 await t.locator('[data-tab="zero"]').click();
 for(let i=0;i<3;i++)await t.locator('[data-nut="right"][data-step="-1"]').click();
 assert.equal(await ds(tab,'zero'),'0');
 await t.locator('[data-tab="weigh"]').click();
 await t.locator('[data-tobj="glue"]').click();
 await t.locator('[data-brass="w20"]').click();
 assert.equal(await ds(tab,'mistakes'),'1','skipping heavier weights is flagged');
 await t.locator('[data-tobj="glue"]').click();
 const brass=id=>t.locator(`[data-brass="${id}"]`).click();
 for(const id of ['w100','w50']){await brass(id);await brass(id);}
 for(const id of ['w20','w10a','w10b'])await brass(id);
 await brass('w10b');
 for(const id of ['w5','w2a'])await brass(id);
 assert.equal(await ds(tab,'balanced'),'true','37 g = 20 + 10 + 5 + 2');
 assert.match(await note(tab),/수평이에요! 분동의 무게 합 37 g/);
 await tab.waitForTimeout(800);await tab.screenshot({path:join(out,`toppan-${width}.png`)});
 for(const id of ['w2a','w5','w10a','w20'])await brass(id);
 assert.match(await note(tab),/잘했어요/,'in-order loading and unloading completes');
 await tab.close();
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 await labs(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 5 lecture: P41–P48 notes sync, answers fit 1366x768 and 1920x1080, 5·7·11 locked, no memo on projected scenes, kitchen scale steps ①②③ and top-pan weighing order verified');
}finally{await browser.close();}
