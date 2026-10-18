import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-08';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={67:'쉬어가기 · 교통안전표지판',68:'과학 이야기 · 하이퍼튜브',69:'탐구 · A에서 B까지',70:'개념 · 속도의 정의',71:'개념 · 스칼라량과 벡터량',72:'생각 · Speed Question',73:'마무리 · 일일 테스트 1~4',74:'마무리 · 일일 테스트 5~8'};
const counts={73:4,74:4};
const locked={73:[1,2,3]};
const MEMO=/검수 메모|고치지 않았습니다|공식 정답이 아닙니다|편집 보완|검증하지 않았습니다/;
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
 await teacher.goto(`${base}teacher.html?page=67`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=67;n<=74;n++){
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
   assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),isLocked,`${tag}: only items 2–4 stay locked`);
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
 const open=async n=>{const tab=await context.newPage();tab.on('pageerror',error=>errors.push(error.message));await tab.goto(`${base}teacher.html?page=${n}`);await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');await tab.locator('#lesson-stage [data-stage-media]').first().click();await tab.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));await tab.locator('#activity-content canvas').waitFor();await tab.waitForTimeout(1200);return tab;};
 const ds=(tab,key)=>tab.locator('#activity-content canvas').getAttribute(`data-lab-${key}`);
 const note=tab=>tab.locator('.lab5-note').innerText();
 const until=(tab,key,value)=>tab.waitForFunction(([k,v])=>document.querySelector('#activity-content canvas')?.dataset[k]===v,['lab'+key[0].toUpperCase()+key.slice(1),value],{timeout:60000});
 // 1) 표지판: 번호로 고르면 이름이 나오고, 속력 관련 표지판 다섯 개를 찾는다
 let tab=await open(67);const s=tab.locator('#activity-content');
 await s.locator('[data-sign="0"]').click();assert.match(await note(tab),/^통행금지$/);assert.equal(await ds(tab,'found'),'0');
 for(const i of [19,20,21,22,23])await s.locator(`[data-sign="${i}"]`).click();
 assert.match(await note(tab),/모두 찾았어요/);assert.equal(await ds(tab,'found'),'5');
 await tab.screenshot({path:join(out,`signs-${width}.png`)});await tab.close();
 // 2) 하이퍼튜브: 20분 달리기와 400km 계산
 tab=await open(68);const h=tab.locator('#activity-content');
 await h.locator('[data-play]').click();await until(tab,'u','1.00');
 await h.locator('[data-km]').fill('600');await h.locator('[data-check]').click();assert.match(await note(tab),/몇 분의 1/);
 await h.locator('[data-km]').fill('400');await h.locator('[data-check]').click();assert.match(await note(tab),/400km/);assert.equal(await ds(tab,'ok'),'true');
 await tab.screenshot({path:join(out,`hypertube-${width}.png`)});await tab.close();
 // 3) 경로: 세 경로를 따라가고 곧은 화살표를 켠다
 tab=await open(69);const r=tab.locator('#activity-content');
 for(const [i,seen] of [[0,'0'],[1,'0,1'],[2,'0,1,2']]){await r.locator(`[data-route="${i}"]`).click();await until(tab,'seen',seen);}
 assert.equal(await ds(tab,'seen'),'0,1,2');assert.match(await note(tab),/세 경로 모두/);
 await r.locator('[data-straight]').check();assert.equal(await ds(tab,'straight'),'true');assert.match(await r.locator('[data-read]').innerText(),/곧게 약 \d+ m/);
 await tab.screenshot({path:join(out,`routes-${width}.png`)});await tab.close();
 // 4) 민정이: 50초 여행, 속력 24 · 속도 12
 tab=await open(72);const t=tab.locator('#activity-content');
 await t.locator('[data-play]').click();await until(tab,'t','50.0');
 assert.match(await t.locator('[data-read]').innerText(),/이동거리 1200m · A에서의 위치 600m/);
 const row=k=>t.locator(`[data-row="${k}"]`);
 await row('speed').locator('[data-v]').fill('12');await row('speed').locator('[data-check]').click();assert.match(await note(tab),/길이를 모두 더하고/);
 await row('speed').locator('[data-v]').fill('24');await row('speed').locator('[data-check]').click();
 await row('velocity').locator('[data-v]').fill('12');await row('velocity').locator('[data-check]').click();
 assert.match(await note(tab),/12m\/s/);assert.equal(await ds(tab,'done'),'speed,velocity');
 await tab.screenshot({path:join(out,`trip-${width}.png`)});await tab.close();
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 await labs(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 8 lecture: P67–P74 notes sync, items 2–4 locked and the rest reveal their keys, answers fit 1366x768 and 1920x1080, no memo on projected scenes, signs/hypertube/routes/trip labs verified');
}finally{await browser.close();}
