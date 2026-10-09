import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lecture-04';
mkdirSync(out,{recursive:true});
const {weightPlans}=await import('../sample-v2/physics.js');
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const phases={33:'도입 · 수평',34:'개념 · 수평 잡기의 원리',35:'개념 · 수평잡기 공식',36:'탐구 · 기울어지는 이유',37:'탐구 · 다른 거리에서의 수평',38:'읽을거리 · 바퀴와 무게중심',39:'실험 · 비탈길 오르는 바퀴',40:'마무리 · 일일 테스트 1'};
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
 await teacher.goto(`${base}teacher.html?page=33`);
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('.lesson-tools summary').click();
 const popup=teacher.waitForEvent('popup');
 await teacher.locator('#teacher-notes').click();
 const notes=await popup;await notes.waitForLoadState('domcontentloaded');
 for(let n=33;n<=40;n++){
  await teacher.locator('#page-select').selectOption(String(n));
  await notes.waitForFunction(phase=>document.querySelector('#lecture-phase')?.textContent===phase,phases[n]);
  assert.equal(await notes.locator('#lecture-steps li').count()>=3,true,`P${n} notes carry a sequence`);
  assert.match(await notes.locator('#lecture-origin').innerText(),/원본 본책 \d+쪽/);
  await teacher.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,`P${n}`);
  const tag=`${width}px P${n}`;
  assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false,`${tag}: answer starts hidden`);
  await inView(teacher,'#lesson-stage .lesson-stage-content h2',`${tag} question`);
  await inView(teacher,'#lesson-stage [data-stage-reveal]',`${tag} reveal button`);
  await inView(teacher,'#lesson-stage .lesson-stage-visual',`${tag} visual`);
  assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),false,`${tag}: nothing is locked in lesson 4`);
  await teacher.locator('#lesson-stage [data-stage-reveal]').click();
  await inView(teacher,'#lesson-stage .stage-answer',`${tag} answer`);
  await teacher.locator('#lesson-stage [data-stage-explain]').click();
  await inView(teacher,'#lesson-stage .stage-explanation',`${tag} explanation`);
  const text=await teacher.locator('#lesson-stage').innerText();
  assert.doesNotMatch(text,/검수 메모|도면 1·2|정답 미인쇄|수메르/,`${tag}: no review memo on the projected scene`);
 }
 await context.close();
}
async function labs(width,height){
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(silent);
 const open=async(n)=>{const tab=await context.newPage();tab.on('pageerror',error=>errors.push(error.message));await tab.goto(`${base}teacher.html?page=${n}`);await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');await tab.locator('#lesson-stage [data-stage-media]').first().click();await tab.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));await tab.locator('#activity').waitFor();return tab;};
 const angle=tab=>tab.locator('.balance3d-canvas').getAttribute('data-angle').then(Number);
 // 1) 수평잡기: book setups ⑤ ⑥ ⑦ and one free choice
 let tab=await open(36);
 assert.match(await tab.locator('.lever-formula').innerText(),/4칸 = 4\s*=\s*오른쪽 1개 × 4칸 = 4/,'starts at the book figure: 4칸 and 4칸');
 assert.equal(await angle(tab),0);
 await tab.locator('[data-preset="1"]').click();
 await tab.waitForTimeout(600);
 assert.match(await tab.locator('.lever-note').innerText(),/오른쪽으로 기울어져요/,'⑥: 2칸 vs 4칸 tilts right');
 assert((await angle(tab))>0,'beam is tilted clockwise');
 assert.match(await tab.locator('.lever-formula').innerText(),/2\s*<\s*오른쪽 1개 × 4칸 = 4/);
 await tab.locator('[data-preset="2"]').click();
 await tab.waitForTimeout(600);
 assert.match(await tab.locator('.lever-note').innerText(),/수평이에요/,'⑦: 2개 × 2칸 = 1개 × 4칸');
 assert.equal(await angle(tab),0);
 await tab.locator('[data-side="left"][data-field="n"][data-value="3"]').click();
 await tab.waitForTimeout(600);
 assert.match(await tab.locator('.lever-note').innerText(),/왼쪽으로 기울어져요/,'3개 × 2칸 = 6 beats 1개 × 4칸');
 assert((await angle(tab))<0);
 await tab.locator('[data-side="left"][data-field="a"][data-value="4"]').click();
 await tab.locator('[data-side="right"][data-field="n"][data-value="3"]').click();
 await tab.waitForTimeout(600);
 assert.match(await tab.locator('.lever-note').innerText(),/수평이에요/,'3개 × 4칸 = 3개 × 4칸');
 await tab.screenshot({path:join(out,`lever-${width}.png`)});
 await tab.close();
 // 2) 양팔저울: only a balanced arrangement counts, and all 13 weights can be found
 tab=await open(40);
 await tab.locator('[data-target="5"]').click();
 await tab.locator('[data-weight="9"][data-side="right"]').click();
 assert.match(await tab.locator('.pans-note').innerText(),/오른쪽이 더 무거워요/,'9 g alone is too heavy for 5 g');
 assert.equal(await tab.locator('.pans-targets button.done').count(),0,'no ✓ before a balance');
 await tab.locator('[data-weight="3"][data-side="left"]').click();
 await tab.locator('[data-weight="1"][data-side="left"]').click();
 assert.match(await tab.locator('.pans-note').innerText(),/수평이에요! 5 g \+ 1 g \+ 3 g = 9 g/);
 assert.match(await tab.locator('.pans-progress').innerText(),/1 \/ 13/);
 await tab.screenshot({path:join(out,`weights-${width}.png`)});
 for(let t=1;t<=13;t++){
  const plan=weightPlans(t)[0];
  await tab.locator(`[data-target="${t}"]`).click();
  for(const w of [1,3,9])await tab.locator(`[data-weight="${w}"][data-side="off"]`).click();
  for(const w of plan.left)await tab.locator(`[data-weight="${w}"][data-side="left"]`).click();
  for(const w of plan.right)await tab.locator(`[data-weight="${w}"][data-side="right"]`).click();
  assert.match(await tab.locator('.pans-note').innerText(),/수평이에요/,`${t} g balances with ${JSON.stringify(plan)}`);
 }
 assert.match(await tab.locator('.pans-progress').innerText(),/13 \/ 13개 · 모두 찾았어요/);
 await tab.close();
 await context.close();
}
try{
 await run(1366,768);
 await run(1920,1080);
 await labs(1920,1080);
 assert.deepEqual(errors,[]);
 console.log('lesson 4 lecture: P33–P40 notes sync, answer/explanation fit 1366x768 and 1920x1080, no memo on projected scenes, lever and balance labs follow weight × distance and the balance rule');
}finally{await browser.close();}
