// 수평잡기 3D 장면(sample-v2/balance3d.js)을 한 번씩 그려 투사·인쇄용 정지 그림으로 저장한다.
// 사용: MSG_PLAYWRIGHT_URL=<playwright 모듈 경로> QA_BASE=http://127.0.0.1:4320/sample-v2/ node scripts/local/render-lever-stills.mjs
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=join(dirname(fileURLToPath(import.meta.url)),'..','..','sample-v2','art');
mkdirSync(out,{recursive:true});
const L=(n,a)=>({n,a}),R=(n,b)=>({n,b});
const stills={
 'lever-equal-distance':{left:L(2,3),right:R(2,3),names:false},
 'lever-heavy-near':{left:L(4,1),right:R(2,2),names:false},
 'lever-4-4':{left:L(1,4),right:R(1,4)},
 'lever-2-4-held':{left:L(1,2),right:R(1,4),held:true},
 'lever-2-4-tilt':{left:L(1,2),right:R(1,4),tilt:'auto'},
 'lever-2x2-1x4':{left:L(2,2),right:R(1,4)},
 'lever-2x2-question':{left:L(2,2),right:R(1,4),hideRight:true,held:true,names:false},
 'ramp-wheel':{kind:'ramp'},
 'ramp-wheel-path':{kind:'ramp',path:true}
};
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1300,height:700},deviceScaleFactor:1.5});
 const page=await context.newPage();
 page.on('pageerror',error=>{throw error;});
 await page.goto(`${base}start.html`,{waitUntil:'domcontentloaded'});
 for(const [name,options] of Object.entries(stills)){
  const url=await page.evaluate(async(opts)=>{
   const {renderLeverStill,renderRampStill}=await import('./balance3d.js');
   const host=document.createElement('div');host.style.cssText='position:fixed;left:0;top:0;width:1200px;height:520px;z-index:99';document.body.append(host);
   const still=opts.kind==='ramp'?renderRampStill(host,opts):renderLeverStill(host,opts);
   const png=still.canvas.toDataURL('image/jpeg',.92);
   still.dispose();host.remove();
   return png;
  },options);
  writeFileSync(join(out,`${name}.jpg`),Buffer.from(url.split(',')[1],'base64'));
  console.log('rendered',name);
 }
}finally{await browser.close();}
