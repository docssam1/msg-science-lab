import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const base=process.env.MSG_BASE_URL||'http://127.0.0.1:4317';
 const out=process.env.MSG_QA_OUT;
 if(!out)throw new Error('MSG_QA_OUT must point to an E: QA directory');
 await mkdir(out,{recursive:true});
 for(const edition of ['student','teacher']){
  const page=await browser.newPage({viewport:{width:1365,height:900}});
  await page.goto(`${base}/sample-v2/index.html?edition=${edition}&page=11`);
  await page.waitForFunction(()=>Boolean(window.__sample));
  await page.evaluate(()=>window.__sample.printBuild());
  assert.equal(await page.locator('#print-root .paper').count(),edition==='student'?33:65,`${edition} printable sheets`);
  if(edition==='student'){
   assert.equal(await page.locator('#print-root .teacher-answer').count(),0,'student printable pages are answer-free');
   assert.equal(await page.locator('#print-root .assessment-photo').count(),0);
  }
  await page.emulateMedia({media:'print'});
  await page.pdf({path:`${out}/${edition}-print-qa.pdf`,format:'A4',printBackground:true,preferCSSPageSize:true});
  await page.close();
 }
 console.log('PASS print DOM: student 33 sheets, teacher 65 sheets including teaching notes, no student answer or photo controls; inspect emitted PDFs separately');
}finally{await browser.close();}
