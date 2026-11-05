import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-09';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={75:'개념 · 일정한 시간에 이동한 거리',76:'탐구 · Speed Question 종목',77:'개념 · 일정한 거리를 이동한 시간',78:'탐구 · Speed Question 달리기시합',79:'마무리 · 일일 테스트 1~5',80:'마무리 · 일일 테스트 6~10'};
const counts={79:5,80:5};
const locked={80:[0]};
const MEMO=/검수 메모|고치지 않았습니다|공식 정답이 아닙니다|글자 인식|바로잡았습니다/;
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
 await teacher.goto(`${base}teacher.html?page=75`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=75;n<=80;n++){
  await teacher.locator('#page-select').selectOption(String(n));
  await notes.waitForFunction(phase=>document.querySelector('#lecture-phase')?.textContent===phase,phases[n]);
  assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 \d+/);
  await teacher.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,`P${n}`);
  for(let q=0;q<(counts[n]||1);q++){
   const tag=`${width}px P${n}#${q+1}`;
   if(q>0){await teacher.locator('#lesson-stage [data-stage-question="next"]').click();await teacher.waitForFunction(i=>document.querySelector('#lesson-stage .stage-question-nav span')?.textContent.startsWith(`${i} /`),q+1);}
   await inView(teacher,'#lesson-stage .lesson-stage-content h2',`${tag} question`);
   await inView(teacher,'#lesson-stage .lesson-stage-visual',`${tag} visual`);
   const isLocked=(locked[n]||[]).includes(q);
   assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),isLocked,`${tag}: only item 6 stays locked`);
   if(!isLocked){
    await teacher.locator('#lesson-stage [data-stage-reveal]').click();
    await inView(teacher,'#lesson-stage .stage-answer',`${tag} answer`);
    await teacher.locator('#lesson-stage [data-stage-explain]').click();
    await inView(teacher,'#lesson-stage .stage-explanation',`${tag} explanation`);
   }
   assert.doesNotMatch(await teacher.locator('#lesson-stage').innerText(),MEMO,`${tag}: no review memo on the projected scene`);
  }
 }
 await context.close();
}
async function labs(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(silent);
 const open=async(n,q=0)=>{const tab=await context.newPage();tab.on('pageerror',error=>errors.push(error.message));await tab.goto(`${base}teacher.html?page=${n}`);await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');for(let i=0;i<q;i++)await tab.locator('#lesson-stage [data-stage-question="next"]').click();await tab.locator('#lesson-stage [data-stage-media]').first().click();await tab.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));await tab.locator('#activity-content canvas').waitFor();await tab.waitForTimeout(1200);return tab;};
 const ds=(tab,key)=>tab.locator('#activity-content canvas').getAttribute(`data-lab-${key}`);
 const note=tab=>tab.locator('.lab5-note').innerText();
 const until=(tab,key,value)=>tab.waitForFunction(([k,v])=>document.querySelector('#activity-content canvas')?.dataset[k]===v,['lab'+key[0].toUpperCase()+key.slice(1),value],{timeout:60000});
 // 1) 같은 시간: 10초 달리기 → A자동차, 종목 속력 1 · 1.5 · 3
 let tab=await open(75);const a=tab.locator('#activity-content');
 await a.locator('[data-play]').click();await until(tab,'t','10.0');
 await a.locator('[data-pick="B자동차"]').click();assert.match(await note(tab),/거리 표시를 다시/);
 await a.locator('[data-pick="A자동차"]').click();assert.match(await note(tab),/A자동차 〉 B자동차/);
 await a.locator('[data-tab="event"]').click();
 for(const [i,v] of ['1','1.5','3'].entries())await a.locator(`[data-row="${i}"] [data-v]`).fill(v);
 await a.locator('[data-check]').click();assert.match(await note(tab),/뒤로 걷기한 사람이 가장 빨라요/);assert.equal(await ds(tab,'done'),'event,time');
 await tab.screenshot({path:join(out,`time-${width}.png`)});await tab.close();
 // 2) 같은 거리: 500m → A자동차, 달리기 순서
 tab=await open(77);const b=tab.locator('#activity-content');
 await b.locator('[data-play]').click();await until(tab,'t','20.0');
 await b.locator('[data-pick="A자동차"]').click();assert.match(await note(tab),/이동시간이 적게 걸린 A자동차/);
 await b.locator('[data-tab="race"]').click();
 for(const [i,v] of ['5.6','6.3','10','4.2','5'].entries())await b.locator(`[data-row="${i}"] [data-v]`).fill(v);
 const order=['순희','영수','진홍','주홍','지영'];
 for(const [i,n] of [...order].reverse().entries())await b.locator(`[data-rank="${i}"]`).selectOption(n);
 await b.locator('[data-check]').click();assert.match(await note(tab),/짧은 사람부터 순서대로/,'a wrong order is not accepted');
 for(const [i,n] of order.entries())await b.locator(`[data-rank="${i}"]`).selectOption(n);
 await b.locator('[data-check]').click();assert.match(await note(tab),/순희 → 영수 → 진홍 → 주홍 → 지영/);assert.equal(await ds(tab,'done'),'dist,race');
 await tab.screenshot({path:join(out,`dist-${width}.png`)});await tab.close();
 // 3) 1초마다 놓은 빨대: 12cm/s
 tab=await open(79,2);const m=tab.locator('#activity-content');
 await m.locator('[data-play]').click();await until(tab,'t','5.0');
 await m.locator('[data-v]').fill('12');await m.locator('[data-check]').click();assert.match(await note(tab),/12cm\/s/);
 await m.locator('[data-pick="fast"]').click();assert.equal(await ds(tab,'done'),'marks,marks-compare');
 await tab.screenshot({path:join(out,`marks-${width}.png`)});await tab.close();
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 await labs(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 9 lecture: P75–P80 notes sync, item 6 locked and the rest reveal their keys, answers fit 1366x768 and 1920x1080, no memo on projected scenes, time/distance/race/marks labs verified');
}finally{await browser.close();}