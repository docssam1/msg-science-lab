import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-06';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={49:'만들기 · 용수철저울',50:'확인 · 용수철저울',51:'만들기 · 양팔저울',52:'탐구 · 양팔저울의 특징',53:'단원 평가 · 01~06',54:'단원 평가 · 07~12',55:'단원 평가 · 13~17',56:'단원 평가 · 18~20'};
const counts={53:6,54:6,55:5,56:3};
const MEMO=/검수 메모|서로 반대|고치지 않았습니다/;
const silent=()=>{window.Audio=class{play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};};
const inView=async(tab,selector,label)=>{
 const box=await tab.locator(selector).first().boundingBox(),size=tab.viewportSize();
 assert(box,`${label} is rendered`);
 assert(box.x>=-1&&box.y>=-1&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,`${label} fits ${size.width}x${size.height}: ${JSON.stringify(box)}`);
 const clip=await tab.locator(selector).first().evaluate(el=>{const c=el.closest('.lesson-stage-content,.lesson-stage-visual');if(!c)return true;const r=el.getBoundingClientRect(),k=c.getBoundingClientRect();return r.bottom<=k.bottom+1&&r.top>=k.top-1;});
 assert(clip,`${label} is not clipped by its column`);
};
async function run(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(silent);
 const teacher=await context.newPage();teacher.on('pageerror',error=>errors.push(error.message));
 await teacher.goto(`${base}teacher.html?page=49`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=49;n<=56;n++){
  await teacher.locator('#page-select').selectOption(String(n));
  await notes.waitForFunction(phase=>document.querySelector('#lecture-phase')?.textContent===phase,phases[n]);
  assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 \d+쪽/);
  await teacher.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,`P${n}`);
  for(let q=0;q<(counts[n]||1);q++){
   const tag=`${width}px P${n}#${q+1}`;
   if(q>0){await teacher.locator('#lesson-stage [data-stage-question="next"]').click();await teacher.waitForFunction(i=>document.querySelector('#lesson-stage .stage-question-nav span')?.textContent.startsWith(`${i} /`),q+1);}
   await inView(teacher,'#lesson-stage .lesson-stage-content h2',`${tag} question`);
   await inView(teacher,'#lesson-stage .lesson-stage-visual',`${tag} visual`);
   assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),false,`${tag}: every lesson-6 item has a key`);
   await teacher.locator('#lesson-stage [data-stage-reveal]').click();
   await inView(teacher,'#lesson-stage .stage-answer',`${tag} answer`);
   await teacher.locator('#lesson-stage [data-stage-explain]').click();
   await inView(teacher,'#lesson-stage .stage-explanation',`${tag} explanation`);
   assert.doesNotMatch(await teacher.locator('#lesson-stage').innerText(),MEMO,`${tag}: no review memo on the projected scene`);
  }
 }
 await context.close();
}
async function labs(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(silent);
 const open=async n=>{const tab=await context.newPage();tab.on('pageerror',error=>errors.push(error.message));await tab.goto(`${base}teacher.html?page=${n}`);await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');await tab.locator('#lesson-stage [data-stage-media]').first().click();await tab.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));await tab.locator('#activity-content canvas').waitFor();await tab.waitForTimeout(1200);return tab;};
 const ds=(tab,key)=>tab.locator('#activity-content canvas').getAttribute(`data-${key}`);
 const note=tab=>tab.locator('.lab5-note').innerText();
 // 1) 용수철저울 만들기: 멈춘 뒤 표시한 눈금은 확인을 통과하고, 흔들릴 때 표시한 눈금은 어긋난다
 let tab=await open(49);const k=tab.locator('#activity-content');
 await k.locator('[data-mark]').click();
 for(let n=1;n<=4;n++){await k.locator('[data-add="1"]').click();await tab.waitForTimeout(1200);await k.locator('[data-mark]').click();}
 await tab.evaluate(()=>{document.querySelector('#activity-content [data-add="1"]').click();document.querySelector('#activity-content [data-mark]').click();});   // 추를 올리자마자(흔들리는 동안) 표시
 assert.match(await note(tab),/흔들리는 동안/,'marking while the spring still swings is called out');
 for(let n=0;n<5;n++)await k.locator('[data-add="-1"]').click();
 await tab.waitForTimeout(1300);
 await k.locator('[data-check="zero"]').click();
 assert.match(await note(tab),/‘0’을 가리켜요/);
 for(let n=1;n<=5;n++){await k.locator('[data-add="1"]').click();await tab.waitForTimeout(1300);await k.locator('[data-check="match"]').click();if(n<5)assert.match(await note(tab),new RegExp(`추 ${n}개와 눈금 ${n}이 일치`),`mark ${n} matches`);}
 assert.match(await note(tab),/어긋나요/,'the 5 mark made while swinging does not match');
 await tab.screenshot({path:join(out,`spring-${width}.png`)});
 await tab.close();
 // 2) 양팔저울 만들기: 고무 찰흙으로 수평 → 기준물체와 비교해 가벼운 것과 무거운 것으로 구분
 tab=await open(51);const b=tab.locator('#activity-content');
 assert.equal(await ds(tab,'level'),'false');
 await b.locator('[data-tab="compare"]').click();
 assert.match(await note(tab),/먼저 ③/,'comparison waits for levelling');
 await b.locator('[data-clay="L"][data-step="1"]').click();await b.locator('[data-clay="L"][data-step="1"]').click();
 assert.equal(await ds(tab,'level'),'true','two pieces of clay level the ruler');
 await b.locator('[data-tab="compare"]').click();
 const expected={clips:'light',glue:'heavy',coin:'heavy',crayon:'light'};
 await b.locator('[data-item="glue"]').click();await b.locator('[data-sort="light"]').click();
 assert.match(await note(tab),/다시 보세요/,'a wrong sort is not accepted');
 for(const [item,way] of Object.entries(expected)){await b.locator(`[data-item="${item}"]`).click();await b.locator(`[data-sort="${way}"]`).click();}
 assert.match(await note(tab),/모든 물체를/);
 assert.equal(await b.locator('[data-ref]').count(),0,'the reference side is fixed (right), no side picker');
 await b.locator('[data-item="clips"]').click();await tab.waitForTimeout(900);
 assert(Number(await ds(tab,'diff'))>0,'reference (20 g) on the right outweighs the clips (8 g) on the left');
 await tab.screenshot({path:join(out,`balance-${width}.png`)});
 await tab.close();
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 await labs(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 6 lecture: P49–P56 notes sync, every unit-test item reveals its official key, answers fit 1366x768 and 1920x1080, no memo on projected scenes, spring-scale marks and balance comparison verified');
}finally{await browser.close();}
