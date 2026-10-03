import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/lesson-stage';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
const page=async(mode,number,width=1366,height=768)=>{
 const tab=await browser.newPage({viewport:{width,height}});
 tab.on('pageerror',error=>errors.push(error.message));
 await tab.addInitScript(()=>{
  window.__stageAudio=[];
  window.Audio=class{constructor(url){window.__stageAudio.push(url);}play(){return Promise.resolve();}pause(){}removeAttribute(){}load(){}};
 });
 await tab.goto(`${base}${mode}.html?page=${number}`);
 await tab.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 return tab;
};
try{
 const teacher=await page('teacher',1);
 assert.equal(await teacher.locator('#lesson-stage .teacher-deck').isVisible(),true);
 assert.equal(await teacher.locator('#book-space').isVisible(),false,'the classroom scene is not a scaled PDF');
 assert.equal(await teacher.locator('.teacher-dock').isVisible(),false);
 assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false);
 await teacher.locator('#lesson-stage [data-stage-reveal]').click();
 assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),true);
 await teacher.locator('#lesson-stage [data-stage-explain]').click();
 assert.equal(await teacher.locator('#lesson-stage .stage-explanation').isVisible(),true);
 await teacher.locator('#lesson-stage [data-stage-media]').first().click();
 assert.equal(await teacher.evaluate(()=>window.__stageAudio.length),0,'teacher activities stay silent');
 await teacher.goto(base+'teacher.html?page=9');
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('#lesson-stage [data-stage-media="watch"]').first().click();
 await teacher.locator('#activity video').first().waitFor();
 await teacher.waitForFunction(()=>{const slide=document.querySelector('#lesson-stage').getBoundingClientRect().width,media=document.querySelector('#activity').getBoundingClientRect().width;return slide>300&&media>slide&&document.querySelector('#workspace').classList.contains('split');});
 const split=await teacher.evaluate(()=>({slide:document.querySelector('#lesson-stage').getBoundingClientRect().width,media:document.querySelector('#activity').getBoundingClientRect().width,active:document.querySelector('#workspace').classList.contains('split')}));
 assert(split.active&&split.slide>300&&split.media>split.slide,'the slide moves left and the video grows on the right');
 await teacher.screenshot({path:join(out,'teacher-video-split.png')});
 await teacher.goto(base+'teacher.html?page=5');
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('#lesson-stage [data-stage-media="inquiry"]').first().click();
 await teacher.locator('[data-prediction-reason]').fill('크기와 재료를 비교해 예상했어요.');
 await teacher.locator('[data-prediction-done]').click();
 await teacher.locator('[data-object]').first().waitFor();
 assert.equal(await teacher.locator('#book-pane').isVisible(),true,'the question slide remains beside measurement');
  await teacher.locator('[data-object]').first().click();
  await teacher.waitForFunction(()=>document.querySelector('[data-inquiry-feedback]')?.textContent==='실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?');
  const warning=await teacher.locator('[data-inquiry-feedback]').innerText();
 assert.equal(warning,'실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?');
 assert.doesNotMatch(warning,/영점/);
 assert.equal(await teacher.evaluate(()=>window.__stageAudio.length),0);
 await teacher.locator('#battle').click();
 assert.equal(await teacher.locator('#activity').getAttribute('data-kind'),'battle');
 await teacher.goto(base+'teacher.html?page=20');
 await teacher.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await teacher.locator('#lesson-stage [data-stage-question="next"]').click();
 await teacher.locator('#lesson-stage [data-stage-question="next"]').click();
 assert.equal(await teacher.locator('#lesson-stage [data-stage-reveal]').isDisabled(),true,'unverified item 9 has no answer reveal');
 assert.equal(await teacher.locator('#lesson-stage .stage-answer').isVisible(),false);
 await teacher.close();

 const student=await page('student',1);
 assert.equal(await student.locator('#lesson-stage .student-lesson').isVisible(),true);
 assert.equal(await student.locator('#mobile-reader').isVisible(),false);
 assert.equal(await student.locator('#lesson-stage .teacher-answer').count(),0);
 await student.waitForFunction(()=>document.querySelector('#activity-content canvas'));
 assert.equal(await student.locator('#workspace').evaluate(el=>el.classList.contains('active')),true,'the live 3D lesson opens with the student scene');
 assert.equal(await student.locator('#lesson-stage .lesson-stage-visual').isVisible(),false,'the static diagram does not compete with 3D');
 await student.locator('[data-part-choice="handle"]').click();
 assert((await student.evaluate(()=>window.__stageAudio.length))>0,'an existing Urusaem clip starts after a student gesture');
 await student.goto(base+'student.html?page=19');
 await student.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await student.locator('#lesson-stage select[name="b1-0"]').selectOption('많이');
 await student.locator('#lesson-stage [data-stage-question="next"]').click();
 await student.locator('#lesson-stage [data-stage-question="prev"]').click();
 assert.equal(await student.locator('#lesson-stage select[name="b1-0"]').inputValue(),'많이');
 assert.equal(await student.locator('#lesson-stage .assessment-photo').isVisible(),true);
 await student.goto(base+'student.html?page=20');
 await student.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 for(let i=0;i<5;i++)await student.locator('#lesson-stage [data-stage-question="next"]').click();
 assert.equal(await student.locator('#lesson-stage .question[data-q="b12"]').count(),1);
 assert.match(await student.locator('#lesson-stage .question[data-q="b12"] table').innerText(),/4\s+8\s+12/,'the separate test data is 4/8/12 cm');
 assert.equal(await student.locator('#lesson-stage .student-graphic').isVisible(),false,'the graph is shown once at lesson scale');
 await student.locator('#lesson-stage [data-stage-media="assessment-graph"]').first().click();
 assert.equal(await student.locator('#activity').getAttribute('data-kind'),'assessment-graph');
 await student.emulateMedia({media:'print'});
 assert.equal(await student.locator('#print-root').isVisible(),true);
 assert.equal(await student.locator('#lesson-stage').isVisible(),false);
 await student.close();

 for(const mode of ['teacher','student']){
  const all=await page(mode,1);
  for(let number=0;number<=20;number++){
   await all.goto(`${base}${mode}.html?page=${number}`);
   await all.waitForFunction(()=>document.documentElement.dataset.ready==='true');
   assert.equal(await all.locator('#lesson-stage .lesson-stage').getAttribute('data-stage-page'),`P${number}`,`${mode} page ${number} uses a lesson scene`);
   assert.equal(await all.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${mode} page ${number} fits the viewport`);
   const broken=await all.locator('#lesson-stage img[src]').evaluateAll(images=>images.filter(image=>image.complete&&!image.naturalWidth).map(image=>image.getAttribute('src')));
   assert.deepEqual(broken,[],`${mode} page ${number} has no broken scene image`);
  }
  await all.close();
 }

 const narrow=await page('student',11,390,844);
 assert.equal(await narrow.locator('#lesson-stage .dt-speak').count(),1);
 assert.equal(await narrow.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await narrow.screenshot({path:join(out,'student-question-390.png')});
 await narrow.close();
 assert.deepEqual(errors,[]);
 console.log('lesson stages: cover and all 20 pages in both modes, silent teacher deck, answer reveal, locked item 9, media split, P5 neutral warning, battle, voiced student guide, saved dropdown, print separation and 390px width passed');
}finally{await browser.close();}
