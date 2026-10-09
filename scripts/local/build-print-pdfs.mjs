// 학생용·교사용 인쇄 PDF를 만든다(sample-v2/print/student.pdf, teacher.pdf). 로컬 서버가 떠 있어야 한다.
// 사용: MSG_PLAYWRIGHT_URL=<playwright 모듈 경로> MSG_BASE_URL=http://127.0.0.1:4320 node scripts/local/build-print-pdfs.mjs [--out <폴더>]
// 기본 출력은 sample-v2/print/. 쪽 수(학생 = 장면 수 + 표지, 교사 = 표지 + 장면 × 2)와 쪽 넘침이 맞지 않으면 실패한다.
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.MSG_BASE_URL||'http://127.0.0.1:4320';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','..');
const outArg=process.argv.indexOf('--out');
const out=outArg>0?resolve(process.argv[outArg+1]):resolve(root,'sample-v2','print');
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
try{
 let scenes=null;
 for(const edition of ['student','teacher']){
  const page=await browser.newPage({viewport:{width:1365,height:900}});
  await page.goto(`${base}/sample-v2/index.html?edition=${edition}&page=11`);
  await page.waitForFunction(()=>Boolean(window.__sample));
  await page.evaluate(()=>window.__sample.printBuild());
  const info=await page.evaluate(()=>({
   sheets:document.querySelectorAll('#print-root .paper').length,
   answers:document.querySelectorAll('#print-root .teacher-answer').length,
   photos:document.querySelectorAll('#print-root .assessment-photo').length,
   overflow:[...document.querySelectorAll('#print-root .paper')].map((p,i)=>{const body=p.querySelector('.page-body');return body&&body.scrollHeight>body.clientHeight+2?`${i}:${p.dataset.printId||p.dataset.teacherNote}(+${body.scrollHeight-body.clientHeight})`:null;}).filter(Boolean)
  }));
  console.log(edition,JSON.stringify(info));
  if(edition==='student')scenes=info.sheets-1;
  else if(info.sheets!==1+scenes*2)throw new Error(`교사 인쇄 ${info.sheets}면: 표지 + 장면 ${scenes}개 × 2 = ${1+scenes*2}면이어야 합니다.`);
  if(info.overflow.length)throw new Error(`${edition} 쪽 넘침: ${info.overflow.join(', ')}`);
  await page.emulateMedia({media:'print'});
  await page.pdf({path:resolve(out,`${edition}.pdf`),format:'A4',printBackground:true,preferCSSPageSize:true});
  await page.close();
 }
 console.log('PDF 저장:',out);
}finally{await browser.close();}
