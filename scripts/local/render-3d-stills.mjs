// 3D 장면을 한 번씩 그려 투사·인쇄용 정지 그림(sample-v2/art/*.jpg)으로 저장한다.
// - 4차시: 수평잡기(lever-*), 비탈길 바퀴(ramp-wheel*) — sample-v2/balance3d.js
// - 3차시: 사과나무·지구·중력 이용·용수철·지구/달 무게·그래프 칠판(l3-*) — sample-v2/stills3d.js
// - 1·2차시: 3D 저울·용수철(l1-scale-*, l1-eye-*, l2-spring-*, l2-compress-*, l2-measure-*) — sample-v2/lab3d.js, 그래프 칠판·비교 용수철·완력기·판스프링(l2-*, l1-leaf-spring) — stills3d.js
// - 4차시: 수평(l4-level), 양팔저울 칸(l4-pans-*) — stills3d.js
// 사용: MSG_PLAYWRIGHT_URL=<playwright 모듈 경로> QA_BASE=http://127.0.0.1:4320/sample-v2/ node scripts/local/render-3d-stills.mjs [이름 …]
// 이름을 주면 그 그림만 다시 그린다.
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const {chromium}=await import(process.env.MSG_PLAYWRIGHT_URL||'playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4320/sample-v2/';
const out=join(dirname(fileURLToPath(import.meta.url)),'..','..','sample-v2','art');
mkdirSync(out,{recursive:true});
const L=(n,a)=>({n,a}),R=(n,b)=>({n,b});
const lesson4={
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
// 1·2차시 3D 저울·용수철(기존 sample-v2/lab3d.js 모델 그대로)
const labStills={
 'l1-scale-parts':{mode:'parts',force:0},
 'l1-scale-offzero':{mode:'zero',force:0},
 'l1-scale-empty':{mode:'compare',force:0},
 'l1-scale-loaded':{mode:'compare',force:12},
 'l1-scale-read':{mode:'eye',force:12,eye:'front'},
 'l1-eye-high':{mode:'eye',eye:'high'},
 'l1-eye-front':{mode:'eye',eye:'front'},
 'l1-eye-low':{mode:'eye',eye:'low'},
 'l2-spring-rest':{mode:'elastic',force:0},
 'l2-spring-small':{mode:'elastic',force:8},
 'l2-spring-pull':{mode:'elastic',force:16},
 'l2-spring-big':{mode:'elastic',force:24},
 'l2-compress-rest':{mode:'compression',force:0},
 'l2-compress-small':{mode:'compression',force:8},
 'l2-compress-big':{mode:'compression',force:20},
 'l2-measure-10':{mode:'measure',force:10},
 'l2-measure-20':{mode:'measure',force:20},
 'l2-measure-30':{mode:'measure',force:30}
};
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1300,height:1000},deviceScaleFactor:1.5});
 const page=await context.newPage();
 page.on('pageerror',error=>{throw error;});
 await page.goto(`${base}start.html`,{waitUntil:'domcontentloaded'});
 const lesson3=await page.evaluate(async()=>{const m=await import('./stills3d.js');return m.stillNames.map(name=>[name,m.stillSize(name)]);});
 const jobs=[...Object.entries(lesson4).map(([name,opts])=>({name,opts,size:[1200,520]})),...lesson3.map(([name,size])=>({name,opts:{kind:'lesson3'},size})),...Object.entries(labStills).map(([name,opts])=>({name,opts:{kind:'lab',...opts},size:[800,900]}))];
 const only=process.argv.slice(2);
 for(const job of jobs.filter(j=>!only.length||only.includes(j.name))){
  const url=await page.evaluate(async({name,opts,size})=>{
   const host=document.createElement('div');host.style.cssText=`position:fixed;left:0;top:0;width:${size[0]}px;height:${size[1]}px;z-index:99`;document.body.append(host);
   let still;
   if(opts.kind==='lab'){const {mountLab}=await import('./lab3d.js');const wait=ms=>new Promise(r=>setTimeout(r,ms));const lab=mountLab(host,{mode:opts.mode});await wait(1500);if(opts.force!=null)lab.setForce(opts.force,{instant:true});if(opts.eye)lab.setEye(opts.eye);await wait(1800);still={canvas:lab.canvas,dispose:()=>lab.destroy()};}
   else if(opts.kind==='lesson3'){const {renderLesson3Still}=await import('./stills3d.js');still=renderLesson3Still(name,host);}
   else{const {renderLeverStill,renderRampStill}=await import('./balance3d.js');still=opts.kind==='ramp'?renderRampStill(host,opts):renderLeverStill(host,opts);}
   const data=still.canvas.toDataURL('image/jpeg',.9);still.dispose();host.remove();return data;
  },job);
  writeFileSync(join(out,`${job.name}.jpg`),Buffer.from(url.split(',')[1],'base64'));
  console.log('rendered',job.name);
 }
}finally{await browser.close();}
