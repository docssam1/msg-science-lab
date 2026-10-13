import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-07';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={57:'도입 · 운동과 정지',58:'생각 · Speed Question',59:'개념 · 위치 표현의 3요소',60:'탐구 · Speed Question',61:'개념 · 운동이란? 장소와 위치',62:'탐구 · 곰 인형과 배경',63:'개념 · 속력의 공식과 속력 표현하기',64:'정리 · 속력의 단위',65:'마무리 · 일일 테스트 1~5',66:'마무리 · 일일 테스트 6~10'};
const counts={65:5,66:5};
const MEMO=/검수 메모|고치지 않았습니다|공식 정답이 아닙니다|편집 보완/;
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
 await teacher.goto(`${base}teacher.html?page=57`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=57;n<=66;n++){
  await teacher.locator('#page-select').selectOption(String(n));
  await notes.waitForFunction(phase=>document.querySelector('#lecture-phase')?.textContent===phase,phases[n]);
  assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 \d+쪽/);
  await teacher.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,`P${n}`);
  for(let q=0;q<(counts[n]||1);q++){
   const tag=`${width}px P${n}#${q+1}`;
   if(q>0){await teacher.locator('#lesson-stage [data-stage-question="next"]').click();await teacher.waitForFunction(i=>document.querySelector('#lesson-stage .stage-question-nav span')?.textContent.startsWith(`${i} /`),q+1);}
   await inView(teacher,'#lesson-stage .lesson-stage-content h2',`${tag} question`);
   await inView(teacher,'#lesson-stage .lesson-stage-visual',`${tag} visual`);
   const locked=n===65&&q===0;
   assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),locked,`${tag}: only the symbol item (1번) stays locked`);
   if(!locked){
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
 const open=async n=>{const tab=await context.newPage();tab.on('pageerror',error=>errors.push(error.message));await tab.goto(`${base}teacher.html?page=${n}`);await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');await tab.locator('#lesson-stage [data-stage-media]').first().click();await tab.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));await tab.locator('#activity-content canvas').waitFor();await tab.waitForTimeout(1200);return tab;};
 const ds=(tab,key)=>tab.locator('#activity-content canvas').getAttribute(`data-lab-${key}`);
 const note=tab=>tab.locator('.lab5-note').innerText();
 // 애니메이션은 느린 렌더러에서 천천히 흐르므로 끝난 값을 기다린다
 const until=(tab,key,value)=>tab.waitForFunction(([k,v])=>document.querySelector('#activity-content canvas')?.dataset[k]===v,['lab'+key[0].toUpperCase()+key.slice(1),value],{timeout:60000});
 // 1) 운동과 정지: 정지는 위치가 그대로, 운동은 위치가 변한다
 let tab=await open(57);const m=tab.locator('#activity-content');
 await m.locator('[data-case="stop"]').click();await m.locator('[data-play]').click();await until(tab,'t','2.00');
 assert.equal(await ds(tab,'x'),'-4.20','the standing person keeps the 0초 position');
 await m.locator('[data-judge="moved"]').click();assert.match(await note(tab),/다시 비교/,'a wrong judgement is not accepted');
 await m.locator('[data-judge="same"]').click();assert.match(await note(tab),/‘정지’/);
 await m.locator('[data-case="move"]').click();await m.locator('[data-play]').click();await until(tab,'t','2.00');
 assert.equal(await ds(tab,'x'),'4.20','the walking person reaches the 2초 position');
 await m.locator('[data-judge="moved"]').click();assert.match(await note(tab),/‘운동’/);
 await m.locator('[data-case="q2"]').click();await m.locator('[data-t="3"]').click();
 assert.equal(await ds(tab,'x'),String((-5.2+2.6*3).toFixed(2)),'Speed Question 2 moves one mark per second');
 assert.equal(await ds(tab,'judged'),'move,stop');
 await tab.screenshot({path:join(out,`motion-${width}.png`)});
 await tab.close();
 // 2) 위치 표현: 52쪽 3요소와 53쪽 다섯 문장
 tab=await open(60);const p=tab.locator('#activity-content');
 await p.locator('[data-tab="example"]').click();
 await p.locator('[data-step="dist"]').click();assert.match(await note(tab),/③ 거리: 3km/);
 await p.locator('[data-tryref]').selectOption('대치엠에스지');await p.locator('[data-trydir]').selectOption('동쪽');await p.locator('[data-trykm]').fill('7');await p.locator('[data-trycheck]').click();
 assert.match(await note(tab),/동쪽으로 7km/);assert.equal(await ds(tab,'try'),'true');
 await p.locator('[data-tab="speedq"]').click();
 const fill=async rows=>{for(const [i,[dir,km]] of rows.entries()){const li=p.locator(`[data-row="${i}"]`);await li.locator('[data-dir]').selectOption(dir);await li.locator('[data-km]').fill(String(km));}await p.locator('[data-check]').click();};
 await fill([['동쪽',4],['동쪽',13],['동쪽',9],['동쪽',5],['서쪽',9]]);
 assert.match(await note(tab),/②을 다시/,'집은 회사에서 서쪽 — a wrong direction is caught');assert.equal(await ds(tab,'solved'),'0,2,3,4');
 await fill([['동쪽',4],['서쪽',13],['동쪽',9],['동쪽',5],['서쪽',9]]);
 assert.match(await note(tab),/다섯 문장 모두 맞아요/);assert.equal(await ds(tab,'solved'),'0,1,2,3,4');
 await tab.screenshot({path:join(out,`position-${width}.png`)});
 await tab.close();
 // 3) 곰 인형: 〈방법1〉은 인형이, 〈방법2〉는 배경이 움직인다
 tab=await open(62);const r=tab.locator('#activity-content');
 const bx0=Number(await ds(tab,'bear-x'));
 await r.locator('[data-play]').click();await until(tab,'seen','1');
 assert(Number(await ds(tab,'bear-x'))>bx0+3,'method 1 moves the bear forward');assert.equal(await ds(tab,'bg-x'),'0.00');
 await r.locator('[data-method="2"]').click();const bx2=await ds(tab,'bear-x');await r.locator('[data-play]').click();await until(tab,'seen','1,2');
 assert.equal(await ds(tab,'bear-x'),bx2,'method 2 keeps the bear still');assert(Number(await ds(tab,'bg-x'))<-3,'method 2 moves the background back');
 assert.match(await note(tab),/두 방법 모두/);
 await r.locator('[data-follow]').check();assert.equal(await ds(tab,'follow'),'true');
 await tab.screenshot({path:join(out,`bear-${width}.png`)});
 await tab.close();
 // 4) 속력 그래프: B·C·D의 시간·이동거리·빠르기
 tab=await open(63);const g=tab.locator('#activity-content');
 await g.locator('[data-play]').click();await until(tab,'t','4.00');
 const row=n=>g.locator(`[data-row="${n}"]`);
 await row('B').locator('[data-d]').fill('2');await row('B').locator('[data-t]').fill('2');await row('B').locator('[data-v]').fill('2');await row('B').locator('[data-check]').click();
 assert.match(await note(tab),/A처럼 계산/,'a wrong speed is not accepted');
 for(const [n,k] of [['B',2],['C',3],['D',4]]){await row(n).locator('[data-d]').fill(String(k));await row(n).locator('[data-t]').fill(String(k));await row(n).locator('[data-v]').fill('1');await row(n).locator('[data-check]').click();}
 assert.match(await note(tab),/모두 같은 빠르기/);assert.equal(await ds(tab,'done'),'B,C,D');
 await tab.screenshot({path:join(out,`speed-${width}.png`)});
 await tab.close();
 // 5) 속력의 단위: 시계 한 바퀴와 Speed Question 읽기
 tab=await open(64);const u=tab.locator('#activity-content');
 await u.locator('[data-unit="2"]').click();await u.locator('[data-play]').click();await until(tab,'seen','2');
 assert.match(await note(tab),/1시간 동안 1 km를 이동했어요/);assert.equal(await ds(tab,'seen'),'2');
 const reads=['백 미터 퍼 세크','천 킬로미터 퍼 아워','오 미터 퍼 세크'];
 for(const [i,v] of reads.entries())await u.locator(`[data-read="${i}"] [data-text]`).fill(v);
 await u.locator('[data-check]').click();assert.match(await note(tab),/센티미터/);assert.equal(await ds(tab,'ok'),'0,1');
 await u.locator('[data-read="2"] [data-text]').fill('오 센티미터 퍼 세크');await u.locator('[data-check]').click();
 assert.match(await note(tab),/세 가지 모두/);assert.equal(await ds(tab,'ok'),'0,1,2');
 await tab.screenshot({path:join(out,`units-${width}.png`)});
 await tab.close();
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 await labs(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 7 lecture: P57–P66 notes sync, item 1 locked and the rest reveal their keys, answers fit 1366x768 and 1920x1080, no memo on projected scenes, motion/position/bear/speed-graph/units labs verified');
}finally{await browser.close();}
