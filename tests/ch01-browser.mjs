import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const out=new URL('../.proofs/ch01/',import.meta.url);await mkdir(out,{recursive:true});
const file=n=>new URL(n,out).pathname.replace(/^\/(\w:)/,'$1');
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1365,height:1000}});
const page=await context.newPage(),errors=[],uploads=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))uploads.push(r.url());});
const pass=n=>{checks.push(n);console.log('PASS',n);};const go=async n=>page.locator(`[data-stage="${n}"]`).click();
await page.goto('http://127.0.0.1:4317/student.html');
await page.locator('.brand img').evaluate(img=>img.decode());
assert.match(await page.title(),/초과심_물리/);assert.equal(await page.locator('[data-stage]').count(),8);
assert.equal(await page.locator('.board-tools').isVisible(),false);pass('correct title, eight stages, distinct student controls');
await go(1);await page.locator('button[data-part="zero"]').click();assert.equal(await page.locator('#part-name').innerText(),'영점조절나사');
await page.locator('g[data-part="hook"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#part-name').innerText(),'고리');pass('pointer and keyboard accessible part exploration');
await go(2);assert.equal(await page.locator('#zero-value').innerText(),'4 N');await page.locator('#check-zero').click();assert.match(await page.locator('#lab-status').innerText(),/아직/);
await page.locator('[data-zero="-2"]').click({clickCount:1});await page.locator('[data-zero="-2"]').click();await page.locator('#check-zero').click();assert.match(await page.locator('#lab-status').innerText(),/영점이 맞/);pass('manual zero calibration and feedback');
await go(3);await page.locator('[data-load="20"]').click();assert(await page.locator('#read-value').isDisabled());await page.waitForTimeout(2100);assert.equal(await page.locator('#reading').innerText(),'20 N');
const before=await page.locator('#pointer').getAttribute('transform');await page.locator('[data-load="40"]').click();assert.equal(await page.locator('#pointer').getAttribute('transform'),before);assert.match(await page.locator('#lab-status').innerText(),/넘어요/);pass('settling lock and overload rejection');
await page.locator('#demo').click();await page.waitForTimeout(300);await go(4);await page.waitForTimeout(2400);assert.equal(await page.locator('#stage-title').innerText(),'보는 높이가 바뀌면 눈금도 달라 보여요');pass('demo timer teardown during navigation');
await page.locator('[data-eye="1"]').click();assert.equal(await page.locator('#eye-reading').innerText(),'22 N');await page.locator('[data-eye="-1"]').click();assert.equal(await page.locator('#eye-reading').innerText(),'18 N');await page.locator('[data-eye="0"]').click();assert.equal(await page.locator('#eye-reading').innerText(),'20 N');pass('eye projection matches scale direction');
await go(7);assert.equal(await page.locator('fieldset').count(),6);assert.equal(await page.locator('.question-feedback:visible').count(),0);
await page.locator('button[type=submit]').click();assert.match(await page.locator('#daily-status').innerText(),/빈 답/);
for(const [i,a]of ['영점조절나사','용수철','표시자','고리'].entries())await page.locator(`[name="d1-${i}"]`).fill(a);
await page.locator('[name=d2][value="2"]').check();await page.locator('[name=d3]').fill('표시자');await page.locator('[name=d4]').fill('ㄴ');await page.locator('[name=d5][value="0"]').check();await page.locator('[name=d6][value="0"]').check();
await page.locator('button[type=submit]').click();assert.match(await page.locator('#daily-status').innerText(),/6 \/ 6/);const first=await page.evaluate(()=>localStorage.getItem('msg-ch01-daily-first-attempt-v1'));assert(first);
await page.locator('[name=d3]').fill('눈금');assert.equal(await page.locator('.question-feedback:visible').count(),0);await page.locator('button[type=submit]').click();assert.match(await page.locator('#daily-status').innerText(),/5 \/ 6/);assert.equal(await page.evaluate(()=>localStorage.getItem('msg-ch01-daily-first-attempt-v1')),first);pass('original six questions, written answers, submission gate and first-attempt preservation');
await page.emulateMedia({media:'print'});assert.equal(await page.locator('.question-feedback').first().isVisible(),false);await page.screenshot({path:file('daily-print.png'),fullPage:true});await page.pdf({path:file('daily-a4.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});pass('A4 print never leaks revealed explanations');
for(const width of [1920,1365,390,320]){await page.setViewportSize({width,height:1000});for(const n of [0,1,2,3,4,5,6,7]){await go(n);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`horizontal overflow ${width}, stage ${n}`);}await go(1);await page.screenshot({path:file(`student-${width}.png`),fullPage:true});await go(7);await page.screenshot({path:file(`daily-${width}.png`),fullPage:true});}pass('all eight stages at desktop 1920/1365 and mobile 390/320');
await page.setViewportSize({width:1920,height:1080});await page.goto('http://127.0.0.1:4317/lecture.html?stage=parts');assert(await page.locator('.board-tools').isVisible());await page.locator('#reveal').click();assert(await page.locator('#explanation').isVisible());await go(2);assert.equal(await page.locator('#explanation').isVisible(),false);pass('teacher reveal resets on stage change');
await page.locator('#pen').click();const box=await page.locator('#ink').boundingBox();await page.mouse.move(box.x+50,box.y+100);await page.mouse.down();await page.mouse.move(box.x+150,box.y+140,{steps:8});await page.mouse.up();assert.equal(await page.locator('#ink polyline').count(),1);await page.locator('#undo').click();assert.equal(await page.locator('#ink polyline').count(),0);await page.locator('#pen').click();pass('pen mode and stroke undo');
await go(7);assert.equal(await page.locator('fieldset:visible').count(),1);await page.locator('button[type=submit]').click();assert.equal(await page.locator('.question-feedback:visible').count(),1);await page.locator('[data-question-index="3"]').click();assert.equal(await page.locator('.question-feedback:visible').count(),0);assert.equal(await page.locator('fieldset:visible').getAttribute('data-question'),'d4');await page.screenshot({path:file('lecture-question.png'),fullPage:true});assert.equal(await page.evaluate(()=>localStorage.getItem('msg-ch01-daily-first-attempt-v1')),first);await go(1);await page.screenshot({path:file('lecture-1920.png'),fullPage:true});pass('one-question lecture display, explicit reveal and no student record writes');
const screenFits=[];
for(const [width,height]of [[1920,1080],[1365,900]]){
 await page.setViewportSize({width,height});
 for(let n=0;n<8;n++){
  await go(n);await page.evaluate(()=>scrollTo(0,0));
  const capture=async(question=null)=>screenFits.push(await page.evaluate(({width,height,n,question})=>({width,height,stage:n,question,stageBottom:document.querySelector('#stage').getBoundingClientRect().bottom,footerBottom:document.querySelector('.lesson-controls').getBoundingClientRect().bottom,documentHeight:document.documentElement.scrollHeight}),{width,height,n,question}));
  if(n===7){for(let q=0;q<6;q++){await page.locator(`[data-question-index="${q}"]`).click();await page.evaluate(()=>scrollTo(0,0));await capture(q+1);}}
  else await capture();
  if(n>=1&&n<=4){const clipped=await page.evaluate(()=>{const outer=document.querySelector('#content').getBoundingClientRect();return [...document.querySelectorAll('.lab-controls button')].filter(el=>{const r=el.getBoundingClientRect();return r.bottom>Math.min(outer.bottom,innerHeight)+1||r.top<outer.top-1;}).map(el=>el.textContent);});assert.deepEqual(clipped,[],`lecture experiment controls clipped at ${width}x${height}, stage ${n}`);}
 }
 await go(1);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:file(`lecture-fit-${width}.png`)});
 await go(3);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:file(`lecture-measure-${width}.png`)});
}
await writeFile(new URL('screen-fit.json',out),JSON.stringify(screenFits,null,2));
assert.deepEqual(screenFits.filter(s=>s.footerBottom>s.height+1),[],'lecture essential navigation must fit without vertical scrolling');pass('all lecture stages and six question states fit 1920x1080 and 1365x900');
await page.emulateMedia({reducedMotion:'reduce'});await go(3);await page.locator('[data-load="20"]').click();assert.equal(await page.locator('#read-value').isDisabled(),false);assert.equal(await page.locator('#reading').innerText(),'20 N');pass('reduced-motion measurement remains usable');
const mechanism=[];
for(const force of [0,10,20,30]){
 await page.locator(`[data-load="${force}"]`).click();
 mechanism.push(await page.evaluate(force=>{const svg=document.querySelector('.scale-art'),pointer=document.querySelector('#pointer'),load=document.querySelector('#load'),bar=pointer.children[0],coil=document.querySelector('#coil');const p=pointer.transform.baseVal.consolidate().matrix.f,l=load.transform.baseVal.consolidate().matrix.f;const ticks=[...svg.querySelectorAll(':scope > path')].filter(e=>/^M326 /.test(e.getAttribute('d')));return {force,p,l,rod:pointer.children[1].getAttribute('d'),hook:pointer.children[2].getAttribute('d'),top:bar.getBBox().y-Number(bar.getAttribute('stroke-width'))/2+p,tick:ticks[force/2].getPointAtLength(0).y,coilEnd:coil.getPointAtLength(coil.getTotalLength()).y,loadBottom:load.getBBox().y+load.getBBox().height+l,viewBottom:svg.viewBox.baseVal.height};},force));
}
for(const state of mechanism){assert.equal(state.top,state.tick);assert(Math.abs(state.coilEnd-state.top)<0.01);assert.equal(state.rod,mechanism[0].rod);assert.equal(state.hook,mechanism[0].hook);assert.equal(state.p-mechanism[0].p,state.l-mechanism[0].l);assert(state.loadBottom<state.viewBottom);}
await go(4);for(const eye of [-1,0,1]){await page.locator(`[data-eye="${eye}"]`).click();const ray=await page.evaluate(()=>{const bar=document.querySelector('#eye-pointer'),line=document.querySelector('#sightline'),a=line.getPointAtLength(0),b=line.getPointAtLength(line.getTotalLength());return {top:bar.getBBox().y-Number(bar.getAttribute('stroke-width'))/2,rayAtPointer:a.y+(b.y-a.y)*(348-a.x)/(b.x-a.x)};});assert(Math.abs(ray.top-ray.rayAtPointer)<0.01);}
pass('rigid pointer rod hook and weight motion, top-edge reading and sightline geometry');
const touch=await browser.newContext({viewport:{width:1365,height:1024},hasTouch:true});const tp=await touch.newPage();await tp.goto('http://127.0.0.1:4317/lecture.html?stage=zero');await tp.locator('[data-zero="-2"]').tap();await tp.locator('[data-zero="-2"]').tap();assert.equal(await tp.locator('#zero-value').innerText(),'0 N');await touch.close();pass('touch input simulation');
assert.deepEqual(errors,[]);assert.deepEqual(uploads,[]);pass('zero JavaScript errors and zero uploads');await writeFile(new URL('report.json',out),JSON.stringify({checks,errors,uploads,screenFits,at:new Date().toISOString()},null,2));await context.close();await browser.close();
