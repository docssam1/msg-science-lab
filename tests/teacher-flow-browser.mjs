import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/teacher-flow';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const stage=async(tab,expected)=>{if(expected)await tab.waitForFunction(id=>document.querySelector('#lesson-stage .teacher-deck')?.dataset.stagePage===id,expected,{timeout:5000}).catch(()=>{});return tab.locator('#lesson-stage .teacher-deck').getAttribute('data-stage-page');};
const state=tab=>tab.evaluate(()=>({answer:!document.querySelector('#lesson-stage .stage-answer')?.hidden,explain:!document.querySelector('#lesson-stage .stage-explanation')?.hidden,label:document.querySelector('[data-stage-advance]')?.textContent}));
async function open(width,height,n){
 const tab=await browser.newPage({viewport:{width,height}});
 tab.on('pageerror',error=>errors.push(error.message));
 await tab.goto(`${base}teacher.html?page=${n}`);
 await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 return tab;
}
try{
 for(const [w,h] of [[1366,768],[1920,1080]]){
  const t=await open(w,h,14);
  // one gesture at a time: click empty space → answer, click → explanation, key → next scene
  assert.deepEqual(await state(t),{answer:false,explain:false,label:'답 확인 ▶'});
  await t.locator('#lesson-stage .lesson-stage-foot').click();
  assert.deepEqual(await state(t),{answer:true,explain:false,label:'추가 설명 ▶'});
  await t.locator('#lesson-stage .lesson-stage-head').click();
  assert.deepEqual(await state(t),{answer:true,explain:true,label:'다음 장면 ▶'});
  const h2=await t.locator('#lesson-stage .lesson-stage-content h2').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  const ans=await t.locator('#lesson-stage .stage-answer p').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  assert(h2>=Math.min(66,w*0.031,h*0.048)*0.8&&ans>=Math.min(44,w*0.02,h*0.032)*0.8,`${w}px type is projection sized (auto-fit may shrink at most 20%): h2 ${h2}, answer ${ans}`);
  const box=await t.locator('#lesson-stage .stage-explanation').boundingBox();
  assert(box.y+box.height<=h+1,`${w}px explanation fits without scrolling`);
  if(w===1920)await t.screenshot({path:join(out,'p14-1920-open.png')});
  await t.keyboard.press('Space');
  assert.equal(await stage(t,'P15'),'P15');
  assert.equal((await state(t)).answer,false,'new scene starts hidden');
  // back key hides what was revealed before leaving the scene
  await t.keyboard.press('ArrowRight');await t.keyboard.press('PageDown');
  assert.deepEqual(await state(t),{answer:true,explain:true,label:'다음 장면 ▶'});
  await t.keyboard.press('ArrowLeft');
  assert.deepEqual(await state(t),{answer:true,explain:false,label:'추가 설명 ▶'});
  await t.keyboard.press('PageUp');await t.keyboard.press('ArrowLeft');
  assert.equal(await stage(t,'P14'),'P14');
  await t.close();
 }
 // internal review memos never appear on the projected explanation; each scene shows its own note
 for(const [n,pattern,banned] of [[14,/교재 17쪽 ④/,/검토 필요|역비례|반비례/],[15,/2 cm/,null],[17,/하나|조건/,/쥐덫/],[18,/제품|구조/,/굵기와 재질/]]){
  const e=await open(1366,768,n);await e.keyboard.press('Space');await e.keyboard.press('Space');
  const text=await e.locator('#lesson-stage .stage-explanation p').innerText();
  assert.match(text,pattern,`P${n} explanation matches its own scene: ${text}`);
  if(banned)assert.doesNotMatch(text,banned,`P${n} explanation has no foreign/internal text`);
  await e.close();
 }
 // experiment opens with one click on the picture and one key closes it; the slide keeps working beside it
 const t=await open(1366,768,15);
 await t.locator('#lesson-stage [data-stage-media]').click();
 await t.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));
 await t.keyboard.press('e');
 await t.waitForFunction(()=>!document.querySelector('#workspace').classList.contains('split'));
 await t.keyboard.press('E');
 await t.waitForFunction(()=>document.querySelector('#workspace').classList.contains('split'));
 await t.locator('#lesson-stage [data-stage-advance]').click();
 assert.equal((await state(t)).answer,true,'answer opens even while the experiment is beside the slide');
 await t.close();
 // Daily Test: locked 9–11 (questions 3–5 of page 21) are skipped by "next", never revealed
 const d=await open(1366,768,20);
 const counter=()=>d.locator('.lesson-stage-head strong').innerText();
 for(let q=1;q<=6;q++){
  assert.match(await counter(),new RegExp(`${q}/6번`));
  const locked=q>=3&&q<=5;
  assert.equal(await d.locator('#lesson-stage [data-stage-reveal]').isDisabled(),locked);
  if(locked){
   await d.keyboard.press('Space');
   assert.equal((await state(d)).answer,false,`Q${q}: locked answer never opens`);
  }else{
   await d.keyboard.press('Space');assert.equal((await state(d)).answer,true,`Q${q}: answer opens`);
   await d.keyboard.press('Space');assert.equal((await state(d)).explain,true,`Q${q}: explanation opens`);
   if(q<6)await d.keyboard.press('Space');
  }
  if(q<6)assert.match(await counter(),new RegExp(`${q+1}/6번`),`Q${q}: moved on`);
 }
 await d.close();
 assert.deepEqual(errors,[]);
 console.log('teacher flow: one-gesture click/Space/arrows, back, E for experiment, projection type size, locked items skipped passed');
}finally{await browser.close();}
