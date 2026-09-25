import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=process.env.QA_OUT||'.proofs/student-guide';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  window.__guidedAudio=[];
  window.Audio=class {
   constructor(url){window.__guidedAudio.push(url);}
   play(){setTimeout(()=>this.onended?.(),15);return Promise.resolve();}
   pause(){} removeAttribute(){} load(){}
  };
  window.SpeechRecognition=class {
   start(){setTimeout(()=>{this.onresult?.({results:[[{transcript:'표시 자'}]]});this.onend?.();},10);}
   abort(){this.onend?.();}
  };
 });
 await page.goto(base+'student.html?page=0');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await page.locator('body').getAttribute('data-edition'),'student');
 assert.equal(await page.locator('.lesson-bar').evaluate(el=>getComputedStyle(el).display),'none');
 assert.match(await page.locator('#coach-copy').innerText(),/다음 페이지/);
 assert.equal(await page.locator('#guide-action').getAttribute('data-guide-action'),'next');
 assert.equal(await page.locator('#mobile-reader').isVisible(),true);
 assert.match(await page.locator('#teacher-expression').getAttribute('src'),/teacher-neutral\.png/);
 assert((await page.locator('#teacher-expression').evaluate(img=>img.naturalHeight))>1000,'approved full-body image loads');
 await page.screenshot({path:join(out,'student-cover-1366.png')});
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('#print-root').isVisible(),true);
 assert.equal(await page.locator('.teacher-dock').isVisible(),false);
 await page.emulateMedia({media:'screen'});

 await page.locator('#guide-action').click();
 await page.waitForFunction(()=>window.__sample.current===1);
 await page.waitForTimeout(700);
 assert((await page.evaluate(()=>window.__guidedAudio.length))>0,'existing narration should start after a page action');
 assert.equal(await page.locator('#guide-action').getAttribute('data-guide-action'),'activity');
 assert.equal(await page.locator('#guide-action').getAttribute('data-guide-kind'),'parts');
 assert.match(await page.locator('#coach-copy').innerText(),/실험/);
 assert((await page.locator('.guide-target').count())>0);
 await page.screenshot({path:join(out,'student-experiment-cue-1366.png')});

 await page.locator('#guide-action').click();
 await page.waitForFunction(()=>document.querySelector('#workspace').classList.contains('active'));
 await page.waitForFunction(()=>document.querySelector('#activity-content').children.length>0);
 await page.waitForTimeout(750);
 assert.match(await page.locator('#coach-copy').innerText(),/부분을 하나씩/);
 await page.screenshot({path:join(out,'student-activity-1366.png')});
 await page.locator('#close-activity').click();
 assert.equal(await page.locator('#guide-action').getAttribute('data-guide-action'),'next');
 assert.equal(await page.locator('#self-study').isVisible(),false);

 await page.goto(base+'student.html?page=11');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 const question=page.locator('#mobile-reader .question[data-q="a3"]');
 await question.locator('.speech-start').click();
 await page.waitForFunction(()=>document.querySelector('#mobile-reader .question[data-q="a3"] .speech-draft').value==='표시 자');
 assert.equal(await question.locator('input[name="a3"]').inputValue(),'','dictation must remain a draft');
 await question.locator('.speech-draft').fill('표시자');
 await question.locator('.speech-apply').click();
 assert.equal(await question.locator('input[name="a3"]').inputValue(),'표시자');
 await question.locator('.speech-check').click();
 assert.match(await question.locator('.speech-result').innerText(),/맞았어요/);
 await question.locator('[data-self="understood"]').click();
 assert.equal(await question.locator('.speech-result').getAttribute('data-self-check'),'understood');
 await page.screenshot({path:join(out,'student-speech-selfcheck-1366.png')});
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('#print-root .speech-answer').count(),0,'print source remains unchanged');
 await page.emulateMedia({media:'screen'});

 await page.goto(base+'student.html?page=20');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 const locked=page.locator('#mobile-reader .question[data-q="b9"]');
 await locked.locator('input[value="0"]').check();
 await locked.locator('.speech-check').click();
 assert.match(await locked.locator('.speech-result').innerText(),/해설 확인 중/);
 assert.doesNotMatch(await locked.locator('.speech-result').innerText(),/확인할 답/);

 await page.goto(base+'index.html?edition=teacher&page=1');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await page.locator('#guide-action').isVisible(),false);
 assert.equal(await page.locator('#start').isVisible(),false);
 assert.equal(await page.locator('.speech-answer').count(),0);
 assert.notEqual(await page.locator('.lesson-bar').evaluate(el=>getComputedStyle(el).display),'none');
 await page.locator('#next').click();
 await page.waitForTimeout(700);
 assert.equal(await page.evaluate(()=>window.__guidedAudio.length),0,'teacher pages do not narrate automatically');

 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 mobile.on('pageerror',error=>errors.push(error.message));
 await mobile.goto(base+'student.html?page=5');
 await mobile.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await mobile.locator('.teacher-dock').isVisible(),true);
 assert.equal(await mobile.locator('#guide-action').getAttribute('data-guide-kind'),'inquiry');
 assert.equal(await mobile.locator('.speech-answer').count(),0,'learning pages do not show assessment input');
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mobile.locator('#focus-reading').tap();
 assert.equal(await mobile.locator('body').evaluate(el=>el.classList.contains('student-zoom')),true);
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mobile.locator('#focus-reading').tap();
 await mobile.screenshot({path:join(out,'student-experiment-cue-390.png')});
 await mobile.locator('#guide-action').tap();
 await mobile.waitForFunction(()=>document.querySelector('#workspace').classList.contains('active'));
 assert.equal(await mobile.locator('.teacher-dock').isVisible(),true);
 for(let i=0;i<21;i++){
  await mobile.goto(base+`student.html?page=${i}`);
  await mobile.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  assert((await mobile.locator('#coach-copy').innerText()).length>8,`guide text for page ${i}`);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`viewport width on page ${i}`);
  assert.equal(await mobile.locator('#mobile-reader').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,`book width on page ${i}`);
  if([11,19,20].includes(i))assert.equal(await mobile.locator('#mobile-reader .page-launch [data-grade]').isVisible(),true,`test grading button on page ${i}`);
  if(i===10)await mobile.screenshot({path:join(out,'student-reading-390.png')});
 }
 assert.deepEqual(errors,[]);
 console.log('student guidance and speech draft: full-body image, edit/apply/self-check, locked keys, print separation, teacher separation, 21 pages at 390px passed');
}finally{await browser.close();}
