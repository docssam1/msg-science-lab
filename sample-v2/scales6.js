// 6차시 3D 교구: 용수철저울 만들기(유리관·흰색 테이프·추) · 양팔저울 만들기(자·클립·스티로폼 접시·고무 찰흙), 단원 평가 그림.
// 교재 41~42쪽의 제작 과정·확인 방법 문장만 쓴다. 물체의 무게는 체험을 위한 가상의 값이다.
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {helixGeometry} from './lesson3d.js';
import {SpringMotion,clamp} from './physics.js';
import {buildPerson} from './figures3d.js';

const FONT='"Pretendard Variable","Pretendard","Segoe UI",Roboto,"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
const RAD=Math.PI/180,UP=new THREE.Vector3(0,1,0);
const paint=(s,w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return s.canvasTex(c);};
const fail=view=>{view.innerHTML='<div class="scene-error"><h3>3D 교구를 열지 못했습니다.</h3><p>이 브라우저의 WebGL 지원을 확인해 주세요. 교재의 그림과 본문은 계속 읽을 수 있습니다.</p></div>';};
function rod(s,a,b,r,m,parent=s.scene){const d=b.clone().sub(a),o=s.mesh(new THREE.CylinderGeometry(r,r,1,12),m,parent);o.position.copy(a).addScaledVector(d,.5);o.scale.set(1,d.length(),1);o.quaternion.setFromUnitVectors(UP,d.normalize());return o;}
function placeRod(o,a,b){const d=b.clone().sub(a);o.position.copy(a).addScaledVector(d,.5);o.scale.set(1,Math.max(d.length(),.001),1);o.quaternion.setFromUnitVectors(UP,d.normalize());}
function callout(s,text,at,to,size=.46){const red=s.phys({color:'#d13a35',roughness:.4});const a=new THREE.Vector3(...at),b=new THREE.Vector3(...to);rod(s,a,b,.025,red);s.mesh(new THREE.SphereGeometry(.07,16,12),red).position.copy(b);s.label(text,{size}).position.copy(a);}

// ───────────────────────── 용수철저울 만들기(교재 41쪽 ①②) ─────────────────────────
// 투명한 유리관에 흰색 테이프를 붙이고, 나무 막대에 건 용수철 끝에 실과 접시를 매단다. 추 1개마다 STEP만큼 늘어난다.
const TOP=5.6,REST=1.25,STEP=.3,MAXW=5;
function tapeTexture(s,marks){
 return paint(s,256,1024,(g,w,h)=>{g.fillStyle='#fbfbf6';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.08)';for(let y=0;y<h;y+=9){g.beginPath();g.moveTo(0,y);g.lineTo(w,y+3);g.stroke();}
  // 테이프 길이 2.6(유리관 위 TOP-.15 → TOP-2.75)를 캔버스 높이에 대응시킨다.
  for(const [n,y] of Object.entries(marks)){const py=(TOP-.15-y)/2.6*h;g.strokeStyle='#1b3446';g.lineWidth=7;g.beginPath();g.moveTo(10,py);g.lineTo(130,py);g.stroke();g.fillStyle='#c8283c';g.font=`800 70px ${FONT}`;g.textBaseline='middle';g.fillText(String(n),146,py+3);}});
}
export function buildTubeScale(s){
 const {phys,mat,mesh,rbox}=s;
 const glass=phys({color:'#e8f4fb',transparent:true,opacity:.28,roughness:.05,clearcoat:1,depthWrite:false});
 const wood=phys({color:'#c99a5b',roughness:.6});
 // 스탠드
 rbox(2.6,.16,1.6,.05,phys({color:'#5d7488',roughness:.5}),0,.08,0);
 const post=mesh(new THREE.CylinderGeometry(.07,.07,6.3,16),phys({color:'#a9b5bc',metalness:.8,roughness:.3}));post.position.set(-1.0,3.15,-.5);
 rbox(1.2,.1,.1,.02,phys({color:'#a9b5bc',metalness:.8,roughness:.3}),-.45,6.1,-.5);
 // 유리관과 흰색 테이프
 const tube=mesh(new THREE.CylinderGeometry(.3,.3,2.8,40,1,true),glass,s.scene,{cast:false,receive:false});tube.position.set(0,TOP-1.4,0);
 const tapeMat=mat({map:tapeTexture(s,{}),roughness:.8});
 const tape=mesh(new THREE.PlaneGeometry(.26,2.6),tapeMat,s.scene,{cast:false});tape.position.set(0,TOP-.15-1.3,.31);
 rod(s,new THREE.Vector3(0,TOP+.45,-.5),new THREE.Vector3(0,TOP+.45,.1),.03,mat({color:'#8a8f94'}));
 rod(s,new THREE.Vector3(0,6.1,-.5),new THREE.Vector3(0,TOP+.45,-.5),.02,mat({color:'#8a8f94'}));
 // 나무 막대(유리관 위에 걸침)와 용수철
 const stick=mesh(new THREE.CylinderGeometry(.06,.06,1.1,16),wood);stick.rotation.z=Math.PI/2;stick.position.set(0,TOP+.05,0);
 const springGeo=helixGeometry(1,18,.13);s.geometries.add(springGeo);
 const spring=new THREE.Mesh(springGeo,phys({color:'#7b8188',metalness:.85,roughness:.3}));spring.castShadow=true;spring.position.set(0,TOP,0);s.scene.add(spring);
 const pointer=mesh(new THREE.SphereGeometry(.07,16,12),phys({color:'#d13a35',roughness:.3}));
 const thread=rod(s,new THREE.Vector3(),new THREE.Vector3(0,1,0),.012,mat({color:'#e07a3c',roughness:.8}));
 // 접시(실 끝)와 추
 const dish=new THREE.Group();s.scene.add(dish);
 const plate=mesh(new THREE.CylinderGeometry(.5,.45,.06,36),phys({color:'#f4f4ef',roughness:.6}),dish);
 const strings=[0,1,2].map(()=>rod(s,new THREE.Vector3(),new THREE.Vector3(0,1,0),.01,mat({color:'#e07a3c'})));
 const wGeo=new THREE.CylinderGeometry(.2,.2,.16,32);s.geometries.add(wGeo);
 const wMat=phys({color:'#c9a24a',metalness:.85,roughness:.3});
 const weights=Array.from({length:MAXW},(_,i)=>{const m=new THREE.Mesh(wGeo,wMat);m.castShadow=true;m.position.y=.11+i*.17;m.visible=false;dish.add(m);return m;});
 let marks={};
 function setMarks(next){marks={...next};const t=tapeTexture(s,marks);const old=tapeMat.map;tapeMat.map=t;tapeMat.needsUpdate=true;if(old){s.textures?.delete?.(old);old.dispose();}}
 function pose(stretch,count){
  const end=TOP-REST-stretch;spring.scale.y=REST+stretch;pointer.position.set(0,end-.02,.18);
  const dy=end-1.8;dish.position.set(0,dy,0);placeRod(thread,new THREE.Vector3(0,end,0),new THREE.Vector3(0,dy+.55,0));
  strings.forEach((m,i)=>{const a=i/3*Math.PI*2;placeRod(m,new THREE.Vector3(0,dy+.55,0),new THREE.Vector3(Math.cos(a)*.42,dy+.03,Math.sin(a)*.42));});
  weights.forEach((m,i)=>m.visible=i<count);
  return end;
 }
 pose(0,0);
 return {pose,setMarks,get marks(){return marks;},pointer,dish,tape};
}
const tubeCamera={cam:[2.4,3.6,9.6],target:[0,3.1,0]};

function mountTube(host,ctx){
 const saved=ctx.load('tube-scale',null)||{};
 const st={count:0,marks:saved.marks||{},checked:new Set(saved.checked||[]),phase:Object.keys(saved.marks||{}).length>=MAXW+1?'check':'make'};
 host.innerHTML=`<div class="tube-activity balance-lab lab5"><h3>용수철저울을 만들고 눈금을 표시해 보세요</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 추를 올리고, 용수철 끝이 멈추면 눈금을 표시해요</span></div>
 <div class="lab5-row"><b>추</b><button type="button" data-add="1">추 1개 올려놓기</button><button type="button" data-add="-1">추 1개 내려놓기</button><span class="lab5-sum" data-count></span></div>
 <div class="lab5-row"><b>⑥ 눈금 표시</b><button type="button" data-mark>지금 용수철 끝에 추의 개수 표시</button><button type="button" data-reset>테이프 새로 붙이기</button></div>
 <ol class="lab5-steps"><li data-step="zero"><span>① 추를 접시에 올려놓지 않았을 때 용수철 끝이‘0’을 가리키는지 확인한다.</span><button type="button" data-check="zero">0 확인</button></li><li data-step="match"><span>② 추를 올려놓으면서 추의 개수와 눈금의 숫자가 일치하는지 확인한다.</span><button type="button" data-check="match">지금 개수 확인</button></li></ol>
 <p class="lab5-note" role="status"></p><p class="lab5-small">흔들리는 동안 표시하면 눈금이 어긋나요. 용수철 끝이 멈춘 뒤에 표시해 보세요.</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{...tubeCamera,fov:32});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=5;stage.controls.maxDistance=14;
 const t=buildTubeScale(stage),canvas=stage.canvas,motion=new SpringMotion(0);
 t.setMarks(st.marks);
 const say=x=>{note.textContent=x;ctx.status(x);};
 const endAt=v=>TOP-REST-v;
 function save(){ctx.save('tube-scale',{marks:st.marks,checked:[...st.checked]});}
 function paintUI(){host.querySelector('[data-count]').textContent=`접시 위 추 ${st.count}개 · 표시한 눈금 ${Object.keys(st.marks).length}개`;
  host.querySelector('[data-step="zero"]').classList.toggle('done',st.checked.has('zero'));host.querySelector('[data-step="match"]').classList.toggle('done',[1,2,3,4,5].every(n=>st.checked.has('m'+n)));
  canvas.dataset.count=String(st.count);canvas.dataset.marks=Object.keys(st.marks).sort().join(',');canvas.dataset.checked=[...st.checked].sort().join(',');}
 host.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{st.count=clamp(st.count+Number(b.dataset.add),0,MAXW);motion.set(st.count*STEP);paintUI();say(`추 ${st.count}개. 용수철 끝이 멈출 때까지 기다려요.`);});
 host.querySelector('[data-mark]').onclick=()=>{const moving=Math.abs(motion.value-motion.target)>.02||Math.abs(motion.velocity)>.05;st.marks={...st.marks,[st.count]:endAt(motion.value)};t.setMarks(st.marks);save();paintUI();say(moving?`흔들리는 동안 ${st.count}을(를) 표시했어요. 이 눈금은 어긋날 수 있어요.`:`용수철 끝에 ${st.count}을(를) 표시했어요.`);};
 host.querySelector('[data-reset]').onclick=()=>{st.marks={};st.checked=new Set();t.setMarks({});save();paintUI();say('흰색 테이프를 새로 붙였어요. 추가 없을 때부터 다시 표시해요.');};
 host.querySelector('[data-check="zero"]').onclick=()=>{if(st.count!==0){say('① 먼저 접시의 추를 모두 내려놓아요.');return;}const m=st.marks[0];if(m==null){say('아직 ‘0’ 눈금이 없어요. 추가 없을 때 용수철 끝에 0을 표시해요.');return;}if(Math.abs(m-endAt(0))<.04){st.checked.add('zero');save();paintUI();say('① 용수철 끝이 ‘0’을 가리켜요.');}else say('용수철 끝이 ‘0’ 눈금과 어긋나요. 테이프를 새로 붙이고 멈춘 뒤에 다시 표시해요.');};
 host.querySelector('[data-check="match"]').onclick=()=>{const n=st.count;if(n===0){say('② 추를 올려놓으면서 확인해요.');return;}if(!motion.settled){say('용수철 끝이 멈춘 뒤에 확인해요.');return;}const m=st.marks[n];if(m==null){say(`${n} 눈금이 아직 없어요.`);return;}if(Math.abs(m-endAt(n*STEP))<.04){st.checked.add('m'+n);save();paintUI();const left=[1,2,3,4,5].filter(k=>!st.checked.has('m'+k));say(left.length?`추 ${n}개와 눈금 ${n}이 일치해요. 남은 확인: ${left.join(', ')}개`:'② 추의 개수와 눈금의 숫자가 모두 일치해요. 용수철저울이 제대로 만들어졌어요.');}else say(`추 ${n}개인데 용수철 끝이 눈금 ${n}과 어긋나요. 흔들릴 때 표시했나요?`);};
 motion.set(0,true);paintUI();say(Object.keys(st.marks).length?'표시한 눈금으로 ①②를 확인해 보세요.':'추를 올리기 전에 용수철 끝에 0을 표시하는 것부터 해 볼까요?');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);t.pose(Math.max(0,motion.value),st.count);canvas.dataset.end=endAt(motion.value).toFixed(3);stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── 양팔저울 만들기(교재 41쪽 ③, 42쪽 ④) ─────────────────────────
// 자의 가운데를 실로 매달고, 양 끝 클립에 스티로폼 접시를 단다. 같은 거리이므로 접시 위 무게만 비교한다.
const RY=4.4,RHALF=2.9,HANG=1.55;
function rulerTexture(s){
 return paint(s,2048,140,(g,w,h)=>{g.fillStyle='#eef6f8';g.fillRect(0,0,w,h);g.strokeStyle='#38515c';for(let mm=0;mm<=300;mm++){const x=20+mm*(w-40)/300,big=mm%10===0,mid=mm%5===0;g.lineWidth=big?3:1.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,big?44:mid?32:20);g.stroke();if(big){g.fillStyle='#38515c';g.font=`700 30px ${FONT}`;g.textAlign='center';g.fillText(String(mm/10),x,80);}}});
}
const TRAY_SHAPE=(()=>{const sh=new THREE.Shape();const n=8,r=.62;for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;const x=Math.cos(a)*r*1.25,y=Math.sin(a)*r;i?sh.lineTo(x,y):sh.moveTo(x,y);}sh.closePath();return sh;})();
export function buildRulerBalance(s){
 const {phys,mat,mesh,rbox}=s;
 const beam=new THREE.Group();beam.position.set(0,RY,0);s.scene.add(beam);
 const rulerMat=phys({map:rulerTexture(s),transparent:true,opacity:.92,roughness:.2,clearcoat:.8});
 const side=phys({color:'#d9eef3',transparent:true,opacity:.7,roughness:.2});
 mesh(new THREE.BoxGeometry(6.4,.42,.05),[side,side,side,side,rulerMat,side],beam);
 const orange=mat({color:'#e07a3c',roughness:.8});
 rod(s,new THREE.Vector3(0,RY+.2,0),new THREE.Vector3(0,7.2,0),.015,orange);
 // 클립과 접시
 const clipMat=phys({color:'#c9ced2',metalness:.9,roughness:.25});
 const trayGeo=new THREE.ExtrudeGeometry(TRAY_SHAPE,{depth:.22,bevelEnabled:true,bevelThickness:.03,bevelSize:.04,bevelSegments:2});trayGeo.rotateX(-Math.PI/2);s.geometries.add(trayGeo);
 const trayMat=phys({color:'#fbfbf8',roughness:.75});
 const trays={},strings={},clips={};
 for(const [side,sx] of [['left',-1],['right',1]]){
  const clip=mesh(new THREE.TorusGeometry(.13,.025,8,20),clipMat,beam);clip.position.set(sx*RHALF,-.3,.05);clip.scale.set(.7,1.5,1);clips[side]=clip;
  const g=new THREE.Group();s.scene.add(g);const tr=new THREE.Mesh(trayGeo,trayMat);tr.castShadow=tr.receiveShadow=true;g.add(tr);trays[side]=g;
  strings[side]=[0,1,2,3].map(()=>rod(s,new THREE.Vector3(),new THREE.Vector3(0,1,0),.01,orange));
 }
 // 고무 찰흙(수평을 맞출 때 가벼운 쪽 자 끝에 붙인다)
 const clayMat=phys({color:'#e6a1b8',roughness:.9});
 const clay={left:[],right:[]};
 function setClay(side,n){while(clay[side].length<n){const k=clay[side].length;const m=mesh(new THREE.SphereGeometry(.11,16,12),clayMat,beam);m.scale.set(1.2,.8,1);m.position.set((side==='left'?-1:1)*(RHALF+.12-k*.2),.27,.02);clay[side].push(m);}clay[side].forEach((m,i)=>m.visible=i<n);}
 const tmp=new THREE.Vector3();
 function pose(deg){
  beam.rotation.z=-deg*RAD;beam.updateMatrixWorld(true);
  for(const [side,sx] of [['left',-1],['right',1]]){
   const top=new THREE.Vector3(sx*RHALF,-.45,0).applyMatrix4(beam.matrixWorld);
   trays[side].position.set(top.x,top.y-HANG,0);
   strings[side].forEach((m,i)=>{const a=(i+.5)/4*Math.PI*2;placeRod(m,top,tmp.set(top.x+Math.cos(a)*.62,top.y-HANG+.22,Math.sin(a)*.4));});
  }
 }
 pose(0);
 return {beam,trays,pose,setClay,panTop:side=>trays[side].position.clone().add(new THREE.Vector3(0,.26,0))};
}
// 비교할 물체(가상의 무게, g)
export const rulerObjects=[['eraser','지우개',20,'#2f6db5'],['clips','클립 한 묶음',8,'#c9ced2'],['glue','풀',36,'#f2c94c'],['coin','동전 다섯 개',22,'#c9a24a'],['crayon','크레파스',12,'#e0603f']];
function objectMesh(s,kind,color){
 const g=new THREE.Group();const m=s.phys({color,roughness:.45,clearcoat:.3,metalness:kind==='coin'||kind==='clips'?.8:0});
 if(kind==='eraser')s.rbox(.62,.24,.36,.05,m,0,.12,0,g);
 if(kind==='glue'){const b=s.mesh(new THREE.CylinderGeometry(.15,.15,.66,24),m,g);b.position.y=.33;const c=s.mesh(new THREE.CylinderGeometry(.16,.16,.2,24),s.phys({color:'#d13a35'}),g);c.position.y=.74;}
 if(kind==='coin')for(let i=0;i<5;i++){const c=s.mesh(new THREE.CylinderGeometry(.16,.16,.04,28),m,g);c.position.set(i%2?.03:-.03,.03+i*.045,0);}
 if(kind==='clips')for(let i=0;i<5;i++){const c=s.mesh(new THREE.TorusGeometry(.12,.015,6,16),m,g);c.scale.set(.6,1.4,1);c.rotation.x=Math.PI/2;c.position.set((i-2)*.07,.03+i*.012,0);}
 if(kind==='crayon'){const b=s.mesh(new THREE.CylinderGeometry(.07,.07,.55,16),m,g);b.rotation.z=Math.PI/2;b.position.y=.08;}
 return g;
}
function mountRuler(kind,host,ctx){
 const saved=ctx.load('ruler-balance',null)||{};
 const st={clayL:saved.clayL??0,clayR:saved.clayR??0,refSide:saved.refSide||'right',ref:'eraser',item:null,sorted:saved.sorted||{}};
 const IMBAL=2;   // 처음에 오른쪽 클립 쪽이 2 g만큼 무겁다(가상의 값) → 고무 찰흙으로 맞춘다
 host.innerHTML=`<div class="ruler-activity balance-lab lab5"><h3>자와 클립으로 만든 양팔저울</h3><div class="lab5-tabs"><button type="button" data-tab="level">③ 수평조절</button><button type="button" data-tab="compare">④ 기준물체와 비교</button></div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 고무 찰흙과 물체를 올려 보세요</span></div><div class="lab5-panel"></div><p class="lab5-note" role="status"></p><p class="lab5-small">물체의 무게는 체험을 위한 가상의 값입니다.</p></div>`;
 const view=host.querySelector('.balance-view'),panel=host.querySelector('.lab5-panel'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,3.6,10.6],target:[0,3.0,0],fov:32});}catch(e){fail(view);throw e;}
 const r=buildRulerBalance(stage),canvas=stage.canvas,motion=new SpringMotion(0);
 const say=x=>{note.textContent=x;ctx.status(x);};
 const objs={};let tab=kind==='make-balance-compare'?'compare':'level';
 const mass=k=>rulerObjects.find(o=>o[0]===k)?.[2]||0;
 function save(){ctx.save('ruler-balance',{clayL:st.clayL,clayR:st.clayR,refSide:st.refSide,sorted:st.sorted});}
 const level=()=>st.clayL-st.clayR===IMBAL;
 function diff(){let L=st.clayL,R=IMBAL+st.clayR;if(tab==='compare'){const refM=mass(st.ref),itM=st.item?mass(st.item):0;if(st.refSide==='right'){R+=refM;L+=itM;}else{L+=refM;R+=itM;}}return R-L;}
 function show(){for(const o of Object.values(objs))o.visible=false;if(tab!=='compare')return;const put=(k,side)=>{if(!k)return;const meta=rulerObjects.find(o=>o[0]===k);objs[k]??=objectMesh(stage,k,meta[3]);stage.scene.add(objs[k]);objs[k].visible=true;objs[k].userData.side=side;};put(st.ref,st.refSide);put(st.item,st.refSide==='right'?'left':'right');}
 function settle(){const d=diff();motion.set(clamp(d*.9,-11,11));canvas.dataset.diff=String(d);canvas.dataset.level=String(level());canvas.dataset.tab=tab;canvas.dataset.sorted=Object.keys(st.sorted).sort().join(',');}
 function drawPanel(){
  host.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
  if(tab==='level')panel.innerHTML=`<p class="lab5-book">④ 수평조절을 한다. · 수평이 맞지 않는다면?? 고무 찰흙을 붙여 수평이 되게 한다.</p><div class="lab5-row"><b>왼쪽 끝 고무 찰흙</b><button type="button" data-clay="L" data-step="1">붙이기</button><button type="button" data-clay="L" data-step="-1">떼기</button></div><div class="lab5-row"><b>오른쪽 끝 고무 찰흙</b><button type="button" data-clay="R" data-step="1">붙이기</button><button type="button" data-clay="R" data-step="-1">떼기</button></div>`;
  else panel.innerHTML=`<p class="lab5-book">② 여러 가지 물체 중 무게가 중간쯤 되는 물체를 기준으로 정하여, 양팔 저울의 왼쪽 접시에 올려놓습니다. · 기준물체는 관찰자를 기준으로 해서 오른쪽에 놓는다.</p><div class="lab5-row"><b>기준물체(지우개) 놓을 접시</b><button type="button" data-ref="left" aria-pressed="${st.refSide==='left'}">왼쪽</button><button type="button" data-ref="right" aria-pressed="${st.refSide==='right'}">오른쪽</button></div><div class="lab5-row"><b>비교할 물체</b>${rulerObjects.filter(o=>o[0]!=='eraser').map(([k,n])=>`<button type="button" data-item="${k}" aria-pressed="${st.item===k}" class="${st.sorted[k]?'done':''}">${n}${st.sorted[k]?' ✓':''}</button>`).join('')}</div>${st.item?`<div class="lab5-row"><b>${rulerObjects.find(o=>o[0]===st.item)[1]}은(는) 기준물체보다</b><button type="button" data-sort="light">가볍다</button><button type="button" data-sort="heavy">무겁다</button></div>`:''}<p class="lab5-sum">가벼운 것: ${Object.entries(st.sorted).filter(([,v])=>v==='light').map(([k])=>rulerObjects.find(o=>o[0]===k)[1]).join(', ')||'—'} · 무거운 것: ${Object.entries(st.sorted).filter(([,v])=>v==='heavy').map(([k])=>rulerObjects.find(o=>o[0]===k)[1]).join(', ')||'—'}</p>`;
  panel.querySelectorAll('[data-clay]').forEach(b=>b.onclick=()=>{const k=b.dataset.clay==='L'?'clayL':'clayR';st[k]=clamp(st[k]+Number(b.dataset.step),0,5);r.setClay('left',st.clayL);r.setClay('right',st.clayR);save();settle();const d=diff();say(d===0?'수평이 되었어요! 이제 기준물체와 비교할 수 있어요.':d>0?'아직 오른쪽으로 기울어요. 가벼운 쪽(왼쪽)에 고무 찰흙을 붙여 보세요.':'왼쪽으로 기울어요. 고무 찰흙을 조금 떼어 보세요.');});
  panel.querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>{st.refSide=b.dataset.ref;save();show();drawPanel();settle();say(`기준물체를 ${st.refSide==='left'?'왼쪽':'오른쪽'} 접시에 놓았어요. 비교할 물체는 반대쪽 접시에 올려요.`);});
  panel.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{st.item=b.dataset.item;show();drawPanel();settle();say('저울이 어느 쪽으로 기우는지 보고, 기준물체보다 가벼운지 무거운지 골라 보세요.');});
  panel.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{const heavy=mass(st.item)>mass(st.ref);const ok=(b.dataset.sort==='heavy')===heavy;if(ok){st.sorted={...st.sorted,[st.item]:b.dataset.sort};save();drawPanel();settle();const n=Object.keys(st.sorted).length;say(n>=rulerObjects.length-1?'모든 물체를 기준물체보다 가벼운 것과 무거운 것으로 구분했어요!':'맞아요. 다른 물체도 올려 보세요.');}else say('저울이 어느 쪽으로 기울었는지 다시 보세요. 내려간 쪽이 더 무거워요.');});
 }
 host.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;if(tab==='compare'&&!level()){tab='level';drawPanel();show();settle();say('먼저 ③ 고무 찰흙으로 수평을 맞춰요.');return;}st.item=null;show();drawPanel();settle();say(tab==='level'?'자가 수평인지 보고, 기울면 고무 찰흙을 붙여 맞춰요.':'기준물체를 정하고 다른 물체를 하나씩 반대쪽 접시에 올려 보세요.');});
 r.setClay('left',st.clayL);r.setClay('right',st.clayR);
 if(tab==='compare'&&!level())tab='level';
 show();drawPanel();settle();motion.set(motion.target,true);
 say(tab==='level'?(level()?'수평이에요. ④ 기준물체와 비교로 넘어가 보세요.':'자가 오른쪽으로 기울어 있어요. 고무 찰흙으로 수평을 맞춰 보세요.'):'기준물체를 정하고 다른 물체를 하나씩 반대쪽 접시에 올려 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);r.pose(motion.value);for(const o of Object.values(objs))if(o.visible)o.position.copy(r.panTop(o.userData.side));canvas.dataset.shown=motion.value.toFixed(2);stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}
export function mountScale6(kind,host,ctx){return kind==='make-spring-scale'?mountTube(host,ctx):mountRuler(kind,host,ctx);}

// ───────────────────────── 정지 그림(투사·인쇄) ─────────────────────────
function springScaleFigure(s){   // 단원 평가 01: 손잡이 고리 · 영점조절나사(마개) · 용수철 · 표시자 · 고리 · 추
 const {phys,mat,mesh}=s;const orange=phys({color:'#d9822b',roughness:.4,clearcoat:.4}),steel=phys({color:'#aeb6bb',metalness:.85,roughness:.3});
 const ring=mesh(new THREE.TorusGeometry(.32,.05,12,32),steel);ring.position.set(0,6.1,0);ring.scale.set(.8,1.3,1);
 const cap=mesh(new THREE.CylinderGeometry(.2,.2,.32,24),orange);cap.position.set(0,5.55,0);
 const tube=mesh(new THREE.CylinderGeometry(.25,.25,3.4,32,1,true),phys({color:'#e8f4fb',transparent:true,opacity:.3,roughness:.05,depthWrite:false}),s.scene,{cast:false});tube.position.set(0,3.7,0);
 const sp=new THREE.Mesh(helixGeometry(1,16,.15),steel);sp.position.set(0,5.4,0);sp.scale.y=1.3;s.scene.add(sp);
 const ptr=mesh(new THREE.CylinderGeometry(.12,.12,1.5,20),orange);ptr.position.set(0,3.35,0);
 mesh(new THREE.BoxGeometry(.04,2.6,.02),mat({color:'#8a5a2a'})).position.set(.18,3.4,.2);
 const bot=mesh(new THREE.CylinderGeometry(.22,.22,.2,24),orange);bot.position.set(0,1.9,0);
 rod(s,new THREE.Vector3(0,1.8,0),new THREE.Vector3(0,1.3,0),.04,steel);
 const hook=mesh(new THREE.TorusGeometry(.2,.04,10,24,Math.PI*1.4),steel);hook.position.set(0,1.1,0);hook.rotation.z=Math.PI*.8;
 const w=mesh(new THREE.BoxGeometry(.4,.4,.4),phys({color:'#2b2f33',roughness:.5}));w.position.set(0,.45,0);
 rod(s,new THREE.Vector3(0,.95,0),new THREE.Vector3(0,.65,0),.02,steel);
 callout(s,'ㄱ',[1.6,5.55,0],[.22,5.55,0],.55);callout(s,'ㄴ',[1.6,4.65,0],[.17,4.65,0],.55);callout(s,'ㄷ',[1.6,3.95,0],[.14,3.95,0],.55);callout(s,'ㄹ',[1.6,1.05,0],[.22,1.05,0],.55);
}
function toolsFigure(s){   // 단원 평가 11: 스테이플러와 줄자
 const {phys,mesh,rbox}=s;
 const black=phys({color:'#1f2328',roughness:.35,clearcoat:.8}),steel=phys({color:'#c9cfd3',metalness:.9,roughness:.25});
 const st=new THREE.Group();st.position.set(-2.2,0,0);s.scene.add(st);
 rbox(2.6,.22,.9,.1,black,0,.11,0,st);const top=rbox(2.5,.42,.86,.2,black,.05,.55,0,st);top.rotation.z=.08;rbox(.5,.06,.6,.02,steel,-1.05,.28,0,st);
 const tm=new THREE.Group();tm.position.set(2.0,0,0);s.scene.add(tm);
 const red=phys({color:'#c8222e',roughness:.35,clearcoat:.7});
 const body=rbox(1.8,1.8,.8,.35,red,0,.95,0,tm);
 const face=mesh(new THREE.CircleGeometry(.62,40),s.mat({map:paint(s,256,256,(g,w,h)=>{g.fillStyle='#f6f6f0';g.fillRect(0,0,w,h);g.fillStyle='#1b1f23';g.font=`900 140px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText('5m',w/2,h/2+8);}),roughness:.5}),tm,{cast:false});face.position.set(0,.95,.41);
 rbox(1.3,.05,.32,.01,phys({color:'#e9d27a',metalness:.6,roughness:.3}),1.35,.2,.1,tm);
}
function objectsFigure(s){   // 단원 평가 14: 자 · 막대 · 야구 방망이 · 나무판
 const items=[[-4.5,'1번'],[-1.5,'2번'],[1.5,'3번'],[4.5,'4번']];
 const ruler=s.rbox(2.2,.08,.5,.02,s.phys({map:paint(s,512,128,(g,w,h)=>{g.fillStyle='#ffc04d';g.fillRect(0,0,w,h);g.strokeStyle='#6b4a12';for(let i=0;i<=30;i++){const x=10+i*(w-20)/30;g.lineWidth=2;g.beginPath();g.moveTo(x,0);g.lineTo(x,i%5?30:55);g.stroke();}}),roughness:.5}),items[0][0],.5,0);
 const stick=s.mesh(new THREE.CylinderGeometry(.09,.09,2.4,16),s.phys({color:'#1f7a2a',roughness:.4}));stick.rotation.z=Math.PI/2;stick.position.set(items[1][0],.55,0);
 const batGeo=new THREE.LatheGeometry([[0,0],[.07,0],[.07,.9],[.12,1.4],[.2,2.2],[.2,2.35],[0,2.4]].map(p=>new THREE.Vector2(...p)),24);s.geometries.add(batGeo);
 const bat=new THREE.Mesh(batGeo,s.phys({color:'#d8a85a',roughness:.5}));bat.rotation.z=-Math.PI/2;bat.position.set(items[2][0]-1.2,.55,0);bat.castShadow=true;s.scene.add(bat);
 const board=new THREE.Group();board.position.set(items[3][0],.3,0);s.scene.add(board);for(const y of [0,.36])s.rbox(2.3,.1,.8,.02,s.phys({color:'#c98a43',roughness:.6}),0,y,0,board);s.rbox(2.0,.26,.6,.02,s.phys({color:'#6b3f17',roughness:.6}),0,.18,0,board);
 for(const [x,t] of items)s.label(t,{size:.45}).position.set(x,1.6,0);
}
function hangingBar(s,x,{stringAt=0,tilt=0}={}){   // 단원 평가 15: 실로 매단 막대와 양 끝의 물체
 const g=new THREE.Group();g.position.set(x,2.2,0);g.rotation.z=-tilt*RAD;s.scene.add(g);
 s.rbox(2.4,.1,.12,.03,s.phys({color:'#f28ca0',roughness:.4}),0,0,0,g);
 const twine=s.mat({color:'#b88a4a',roughness:.9});
 rod(s,new THREE.Vector3(x+stringAt*Math.cos(tilt*RAD),2.2-stringAt*Math.sin(tilt*RAD),0),new THREE.Vector3(x+stringAt*Math.cos(tilt*RAD),3.4,0),.025,twine);
 for(const sx of [-1.1,1.1]){const p=new THREE.Vector3(sx,0,0).applyMatrix4(new THREE.Matrix4().makeRotationZ(-tilt*RAD));rod(s,new THREE.Vector3(x+p.x,2.2+p.y,0),new THREE.Vector3(x+p.x,2.2+p.y-.6,0),.02,twine);}
}
function barsFigure(s){
 hangingBar(s,-4.2,{stringAt:0});hangingBar(s,-1.4,{stringAt:.1,tilt:10});hangingBar(s,1.4,{stringAt:-.55});hangingBar(s,4.2,{stringAt:.6});
 [[-4.2,'1번'],[-1.4,'2번'],[1.4,'3번'],[4.2,'4번']].forEach(([x,t])=>s.label(t,{size:.42}).position.set(x,3.9,0));
}
function person(s,{x,y,scale=1,shirt,hair}){   // 단원 평가 16: 단순한 사람 모형
 const g=new THREE.Group();g.position.set(x,y,0);g.scale.setScalar(scale);s.scene.add(g);
 const skin=s.phys({color:'#f2c7a5',roughness:.6});
 s.mesh(new THREE.CapsuleGeometry(.32,.6,8,16),s.phys({color:shirt,roughness:.6}),g).position.y=.55;
 s.mesh(new THREE.SphereGeometry(.32,24,16),skin,g).position.y=1.35;
 const h=s.mesh(new THREE.SphereGeometry(.34,24,16,0,Math.PI*2,0,Math.PI*.55),s.phys({color:hair,roughness:.7}),g);h.position.y=1.4;
 for(const sx of [-.15,.15]){const l=s.mesh(new THREE.CapsuleGeometry(.1,.45,6,12),s.phys({color:'#5b6f8a'}),g);l.position.set(sx,-.15,.2);l.rotation.x=Math.PI/2.4;}
 return g;
}
function seesawFigure(s){
 s.rbox(.5,1.0,.6,.08,s.phys({color:'#e86a45',roughness:.5}),0,.5,0);s.rbox(1.6,.12,.8,.04,s.phys({color:'#e86a45'}),0,.06,0);
 s.rbox(7.2,.18,.9,.06,s.phys({color:'#78aee8',roughness:.45,clearcoat:.4}),0,1.1,0);
 for(const x of [-2.7,-2.0,2.0,2.7])s.mesh(new THREE.CylinderGeometry(.07,.07,.5,12),s.phys({color:'#f2d24a'})).position.set(x,1.45,-.25);
 buildPerson(s,{height:2.2,shirt:'#7cc47a',pants:'#f4f1ea',shoes:'#f0b6c4',hair:'#7b4a26',hairStyle:'ponytail',pose:'sit'}).root.position.set(-3.25,1.19,.05);
 buildPerson(s,{height:1.45,child:true,shirt:'#f8f8f4',pants:'#7fae84',shorts:true,shoes:'#6b4a3a',hair:'#7a4a2a',hairStyle:'pigtails',pose:'sit'}).root.position.set(2.35,1.19,.15);
 s.label('ㄱ',{size:.6}).position.set(-3.25,-.25,.6);s.label('ㄴ',{size:.6}).position.set(2.35,-.25,.6);
}
function cardAnimal(s,kind){   // 단원 평가 18: 쥐와 고양이 모형
 const g=new THREE.Group();
 if(kind==='mouse'){const grey=s.phys({color:'#c9c9cf',roughness:.6});s.mesh(new THREE.SphereGeometry(.3,24,16),grey,g).scale.set(1,1.2,.9);const h=s.mesh(new THREE.SphereGeometry(.2,20,14),grey,g);h.position.y=.42;for(const sx of [-.15,.15]){const e=s.mesh(new THREE.SphereGeometry(.1,14,10),s.phys({color:'#e7b9c4'}),g);e.position.set(sx,.6,0);}s.mesh(new THREE.CylinderGeometry(.18,.22,.22,16),s.phys({color:'#3b6fb6'}),g).position.y=-.15;}
 else{const brown=s.phys({color:'#5a3324',roughness:.6}),white=s.phys({color:'#f6f2ea',roughness:.6});const b=s.mesh(new THREE.SphereGeometry(.55,28,20),brown,g);b.scale.set(1,.85,.9);const bel=s.mesh(new THREE.SphereGeometry(.4,24,16),white,g);bel.position.set(0,-.05,.25);const h=s.mesh(new THREE.SphereGeometry(.42,28,20),brown,g);h.position.y=.72;const m=s.mesh(new THREE.SphereGeometry(.22,20,14),white,g);m.position.set(0,.62,.3);for(const sx of [-.25,.25]){const e=s.mesh(new THREE.ConeGeometry(.14,.3,4),brown,g);e.position.set(sx,1.12,0);}}
 return g;
}
function mobileCatsFigure(s){
 const bar=s.phys({color:'#f28ca0',roughness:.4}),twine=s.mat({color:'#b88a4a',roughness:.9});
 const X=px=>(px-246)/40;
 s.rbox((333-160)/40,.12,.14,.04,bar,0,3.8,0);
 rod(s,new THREE.Vector3(X(272),3.8,0),new THREE.Vector3(X(272),5.6,0),.03,twine);
 rod(s,new THREE.Vector3(X(165),3.8,0),new THREE.Vector3(X(165),3.0,0),.02,twine);rod(s,new THREE.Vector3(X(322),3.8,0),new THREE.Vector3(X(322),3.0,0),.02,twine);
 const mouse=cardAnimal(s,'mouse');mouse.position.set(X(165),2.45,0);s.scene.add(mouse);
 const cat=cardAnimal(s,'cat');cat.position.set(X(322),2.2,0);s.scene.add(cat);
}
function mobileABCDFigure(s){   // 단원 평가 20
 const bar=s.phys({color:'#f28ca0',roughness:.4}),twine=s.mat({color:'#b88a4a',roughness:.9});
 const X=px=>(px-650)/26;
 const hb=(a,b,y)=>s.rbox((b-a)/26,.11,.13,.03,bar,(X(a)+X(b))/2,y,0);
 const v=(px,y0,y1)=>rod(s,new THREE.Vector3(X(px),y0,0),new THREE.Vector3(X(px),y1,0),.022,twine);
 v(650,5.0,6.3);hb(582,720,5.0);v(594,5.0,4.2);hb(556,632,4.2);v(627,4.2,3.6);hb(591,667,3.6);
 v(562,4.2,2.5);v(597,3.6,2.5);v(661,3.6,2.5);v(711,5.0,2.5);
 const a=s.mesh(new THREE.SphereGeometry(.36,28,20),s.phys({color:'#9fd0f0',roughness:.3,clearcoat:.6}));a.position.set(X(562),2.15,0);
 const b=s.mesh(new THREE.BoxGeometry(.6,.6,.6),s.phys({color:'#1f3fb6',roughness:.35,clearcoat:.5}));b.position.set(X(597),2.15,0);b.rotation.set(.4,.6,0);
 const st=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.18:.42,an=i/10*Math.PI*2+Math.PI/2;const px=Math.cos(an)*r,py=Math.sin(an)*r;i?st.lineTo(px,py):st.moveTo(px,py);}st.closePath();
 const c=s.mesh(new THREE.ExtrudeGeometry(st,{depth:.16,bevelEnabled:false}),s.phys({color:'#f6cf3a',roughness:.35}));c.position.set(X(661),2.15,-.08);
 const d=s.mesh(new THREE.CylinderGeometry(.42,.42,.12,36),[s.phys({color:'#f6dd3a'}),s.mat({map:paint(s,256,256,(g,w,h)=>{g.fillStyle='#f6dd3a';g.fillRect(0,0,w,h);g.fillStyle='#3a2c0a';g.beginPath();g.arc(90,100,14,0,7);g.arc(166,100,14,0,7);g.fill();g.lineWidth=12;g.strokeStyle='#3a2c0a';g.beginPath();g.arc(128,135,55,.2*Math.PI,.8*Math.PI);g.stroke();})}),s.phys({color:'#f6dd3a'})]);
 d.rotation.x=Math.PI/2;d.rotation.y=Math.PI/2;d.position.set(X(711),2.1,0);
 [['A',562],['B',597],['C',661],['D',711]].forEach(([t,px])=>s.label(t,{size:.5}).position.set(X(px),1.25,.4));
}
const l6Stills={
 'l6-tube-scale':{size:[900,1000],stage:{cam:[2.0,3.6,11.0],target:[0,3.2,0],fov:32},build(s){const t=buildTubeScale(s);t.setMarks({0:TOP-REST,1:TOP-REST-STEP,2:TOP-REST-2*STEP,3:TOP-REST-3*STEP});t.pose(3*STEP,3);callout(s,'흰색 테이프',[1.8,4.4,.4],[.12,3.9,.32],.36);callout(s,'용수철',[-2.0,5.3,.3],[-.1,5.0,0],.36);callout(s,'나무 막대',[1.8,5.75,.3],[.4,TOP+.05,0],.36);callout(s,'추',[1.6,.9,.4],[.2,TOP-REST-3*STEP-1.6,0],.36);}},
 'l6-tube-zero':{size:[900,1000],stage:{cam:[1.6,3.6,9.4],target:[.3,3.3,0],fov:32},build(s){const t=buildTubeScale(s);t.setMarks({0:TOP-REST,1:TOP-REST-STEP,2:TOP-REST-2*STEP,3:TOP-REST-3*STEP,4:TOP-REST-4*STEP,5:TOP-REST-5*STEP});t.pose(0,0);callout(s,'용수철 끝이 ‘0’',[1.7,5.2,.4],[0,TOP-REST,.2],.34);}},
 'l6-tube-match':{size:[900,1000],stage:{cam:[1.6,3.4,9.4],target:[.3,3.0,0],fov:32},build(s){const t=buildTubeScale(s);t.setMarks({0:TOP-REST,1:TOP-REST-STEP,2:TOP-REST-2*STEP,3:TOP-REST-3*STEP,4:TOP-REST-4*STEP,5:TOP-REST-5*STEP});t.pose(4*STEP,4);callout(s,'추 4개 → 눈금 4',[1.8,4.4,.4],[0,TOP-REST-4*STEP,.2],.34);}},
 'l6-ruler-balance':{size:[1200,800],stage:{cam:[0,3.8,13.2],target:[0,3.0,0],fov:32},build(s){const r=buildRulerBalance(s);r.pose(0);callout(s,'클립',[-4.2,5.6,0],[-2.9,4.1,.05],.4);callout(s,'스티로폼 접시',[4.0,1.2,.6],[2.9,2.6,0],.4);callout(s,'자',[1.6,5.8,0],[1.2,4.45,.05],.4);}},
 'l6-ruler-clay':{size:[1200,800],stage:{cam:[0,3.8,13.2],target:[0,3.0,0],fov:32},build(s){const r=buildRulerBalance(s);r.setClay('left',2);r.pose(0);callout(s,'고무 찰흙',[-4.3,5.7,0],[-3.0,4.7,0],.42);}},
 'l6-ruler-tilt':{size:[1200,800],stage:{cam:[0,3.8,13.2],target:[0,3.0,0],fov:32},build(s){const r=buildRulerBalance(s);r.pose(4);s.label('수평이 맞지 않아요',{size:.45}).position.set(0,6.2,0);}},
 'l6-ruler-compare':{size:[1200,800],stage:{cam:[0,3.8,13.2],target:[0,3.0,0],fov:32},build(s){const r=buildRulerBalance(s);r.setClay('left',2);r.pose(-5);const ref=objectMesh(s,'eraser','#2f6db5');s.scene.add(ref);ref.position.copy(r.panTop('right'));const it=objectMesh(s,'glue','#f2c94c');s.scene.add(it);it.position.copy(r.panTop('left'));callout(s,'기준물체',[4.2,5.6,0],[r.panTop('right').x,r.panTop('right').y+.3,0],.4);callout(s,'비교할 물체',[-4.4,5.4,0],[r.panTop('left').x,r.panTop('left').y+.7,0],.4);}},
 'l6-u01-scale':{size:[700,1000],stage:{cam:[.8,3.4,9.6],target:[.6,3.3,0],fov:32,table:false},build(s){springScaleFigure(s);}},
 'l6-u11-tools':{size:[1000,520],stage:{cam:[.4,2.8,9.0],target:[.4,.8,0],fov:32},build(s){toolsFigure(s);}},
 'l6-u14-objects':{size:[1200,520],stage:{cam:[0,2.9,9.6],target:[0,.75,0],fov:32},build(s){objectsFigure(s);}},
 'l6-u15-bars':{size:[1200,560],stage:{cam:[0,2.9,10.0],target:[0,2.7,0],fov:32,table:false},build(s){barsFigure(s);}},
 'l6-u16-seesaw':{size:[1200,700],stage:{cam:[0,2.6,10.2],target:[0,1.4,0],fov:32},build(s){seesawFigure(s);}},
 'l6-u18-mobile':{size:[900,760],stage:{cam:[0,3.9,9.2],target:[0,3.6,0],fov:32,table:false},build(s){mobileCatsFigure(s);}},
 'l6-u20-mobile':{size:[900,760],stage:{cam:[-.55,3.9,11.6],target:[-.55,3.8,0],fov:32,table:false},build(s){mobileABCDFigure(s);}}
};
export const lesson6StillNames=Object.keys(l6Stills);
export function lesson6StillSize(name){return l6Stills[name].size;}
export function renderLesson6Still(name,host){
 const sc=l6Stills[name];if(!sc)throw new Error('알 수 없는 그림: '+name);
 const stage=createStage(host,{...sc.stage,orbit:false});
 sc.build(stage);stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}
