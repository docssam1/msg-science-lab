// 5차시 3D 교구: 앉은뱅이저울(가정용저울)의 속 구조 · 윗접시저울과 분동. 교재 36~38쪽의 구조·사용법 문장만 쓴다.
// 물체의 무게(사과 230 g 등)는 체험을 위한 가상의 값이며 교재의 값이 아니다. 투사·인쇄용 정지 그림도 같은 장면으로 그린다.
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {helixGeometry} from './lesson3d.js';
import {SpringMotion,clamp} from './physics.js';
import {roundedBoxGeometry} from './everyday-objects-3d.js';

const FONT='"Pretendard Variable","Pretendard","Segoe UI",Roboto,"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
const RAD=Math.PI/180,UP=new THREE.Vector3(0,1,0);
const paint=(s,w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return s.canvasTex(c);};
const fail=view=>{view.innerHTML='<div class="scene-error"><h3>3D 교구를 열지 못했습니다.</h3><p>이 브라우저의 WebGL 지원을 확인해 주세요. 교재의 그림과 본문은 계속 읽을 수 있습니다.</p></div>';};
function rod(s,a,b,r,m,parent=s.scene){const d=b.clone().sub(a),o=s.mesh(new THREE.CylinderGeometry(r,r,1,12),m,parent);o.position.copy(a).addScaledVector(d,.5);o.scale.set(1,d.length(),1);o.quaternion.setFromUnitVectors(UP,d.normalize());return o;}
function placeRod(o,a,b){const d=b.clone().sub(a);o.position.copy(a).addScaledVector(d,.5);o.scale.set(1,Math.max(d.length(),.001),1);o.quaternion.setFromUnitVectors(UP,d.normalize());}
// 교재 사진처럼 이름표에서 부품까지 붉은 지시선을 긋는다.
function callout(s,text,at,to,size=.46){const red=s.phys({color:'#d13a35',roughness:.4});const a=new THREE.Vector3(...at),b=new THREE.Vector3(...to);rod(s,a,b,.025,red);s.mesh(new THREE.SphereGeometry(.07,16,12),red).position.copy(b);s.label(text,{size}).position.copy(a);}

// ───────────────────────── 앉은뱅이저울(가정용저울) ─────────────────────────
// 교재 36쪽 사진의 구조: 접시 · 바늘과 눈금(최대 1 kg) · 속의 용수철 · 영점 조절 나사.
// 접시를 누르면(물체를 올리면) 안쪽 받침이 내려가며 용수철이 늘어나고, 이와 연결된 바늘이 돈다.
function dialTexture(s){
 return paint(s,1024,1024,(g,N)=>{const R=N/2;g.fillStyle='#fbfbf7';g.beginPath();g.arc(R,R,R,0,Math.PI*2);g.fill();g.translate(R,R);
  for(let v=0;v<1000;v+=10){const a=v/1000*Math.PI*2,big=v%100===0,mid=v%50===0,r1=R*.93,r0=big?R*.79:mid?R*.84:R*.87;g.strokeStyle=v%200===0?'#c8283c':'#2c3a44';g.lineWidth=big?8:mid?5:3;g.beginPath();g.moveTo(Math.sin(a)*r0,-Math.cos(a)*r0);g.lineTo(Math.sin(a)*r1,-Math.cos(a)*r1);g.stroke();}
  g.textAlign='center';g.textBaseline='middle';
  for(let v=0;v<1000;v+=100){const a=v/1000*Math.PI*2,big=v%200===0;g.fillStyle=big?'#c8283c':'#2c3a44';g.font=`800 ${big?96:58}px ${FONT}`;const r=big?R*.6:R*.64;g.fillText(String(v),Math.sin(a)*r,-Math.cos(a)*r);}
  g.fillStyle='#2c3a44';g.font=`800 64px ${FONT}`;g.fillText('g',0,R*.28);g.font=`700 42px ${FONT}`;g.fillText('최대 1 kg',0,R*.43);});
}
function kitchenObject(s,kind,parent){
 const grp=new THREE.Group();parent.add(grp);
 if(kind==='apple'){const a=s.mesh(new THREE.SphereGeometry(.5,48,32),s.phys({color:'#c9302c',roughness:.35,clearcoat:.8}),grp);a.scale.set(1,.88,1);a.position.y=.44;const st=s.mesh(new THREE.CylinderGeometry(.03,.04,.26,10),s.mat({color:'#5b3a1d'}),grp);st.position.set(.02,.95,0);st.rotation.z=.25;const lf=s.mesh(new THREE.SphereGeometry(.13,16,8),s.phys({color:'#3f8f3a',roughness:.5}),grp);lf.scale.set(1.4,.25,.7);lf.position.set(.16,.97,0);}
 if(kind==='flour'){s.rbox(1.25,.85,.8,.18,s.phys({map:paint(s,512,256,(g,w,h)=>{g.fillStyle='#f6f1e4';g.fillRect(0,0,w,h);g.fillStyle='#d48a2c';g.fillRect(0,h*.62,w,h*.16);g.fillStyle='#7a5320';g.font=`800 72px ${FONT}`;g.textAlign='center';g.fillText('밀가루',w/2,h*.45);}),roughness:.85}),0,.43,0,grp);}
 if(kind==='bottle'){const b=s.mesh(new THREE.CylinderGeometry(.36,.38,1.25,40),s.phys({color:'#8cc8ef',roughness:.08,transparent:true,opacity:.7,clearcoat:1}),grp);b.position.y=.63;const cap=s.mesh(new THREE.CylinderGeometry(.16,.16,.22,24),s.phys({color:'#2f6db5',roughness:.4}),grp);cap.position.y=1.36;const w=s.mesh(new THREE.CylinderGeometry(.33,.35,.95,40),s.phys({color:'#3d8fd6',roughness:.1,transparent:true,opacity:.55}),grp);w.position.y=.5;}
 return grp;
}
export function buildKitchen(s,{open=false}={}){
 const {mat,phys,mesh,rbox}=s;
 const pivot=new THREE.Group();pivot.position.set(-1.75,0,0);s.scene.add(pivot);   // 왼쪽 아래 모서리를 축으로 기울인다(①편평한 곳)
 const root=new THREE.Group();root.position.x=1.75;pivot.add(root);
 const pink=phys({color:'#ee8c9c',roughness:.38,clearcoat:.7,clearcoatRoughness:.25});
 const steel=phys({color:'#cfd6da',metalness:.85,roughness:.3}),red=phys({color:'#d8263a',roughness:.35,clearcoat:.4});
 rbox(3.5,.14,3.0,.05,steel,0,.07,0,root);
 const shell=rbox(3.2,2.9,2.7,.32,pink,0,1.59,0,root);
 const rim=mesh(new THREE.TorusGeometry(1.14,.08,16,96),pink,root);rim.position.set(0,1.62,1.36);
 const face=mesh(new THREE.CircleGeometry(1.12,96),mat({map:dialTexture(s),roughness:.5}),root,{cast:false});face.position.set(0,1.62,1.37);
 const glass=mesh(new THREE.CircleGeometry(1.12,64),phys({color:'#ffffff',transparent:true,opacity:.1,roughness:.04,clearcoat:1,depthWrite:false}),root,{cast:false,receive:false});glass.position.set(0,1.62,1.47);
 const needle=new THREE.Group();needle.position.set(0,1.62,1.42);root.add(needle);
 const nb=mesh(new THREE.BoxGeometry(.05,1.02,.02),red,needle,{cast:false});nb.position.y=.43;
 const nt=mesh(new THREE.CylinderGeometry(.09,.09,.06,24),red,needle,{cast:false});nt.rotation.x=Math.PI/2;
 // 접시
 const panGeo=new THREE.LatheGeometry([[0,0],[1.2,.02],[1.5,.12],[1.58,.24],[1.52,.24],[1.43,.14],[1.15,.08],[0,.07]].map(p=>new THREE.Vector2(...p)),64);s.geometries.add(panGeo);
 const pan=new THREE.Group();root.add(pan);
 const dish=new THREE.Mesh(panGeo,pink);dish.castShadow=dish.receiveShadow=true;pan.add(dish);
 const neck=mesh(new THREE.CylinderGeometry(.34,.4,.12,32),pink,pan);neck.position.y=-.05;
 // 영점 조절 나사(흰 손잡이): 앞면 오른쪽 아래, 겉에서도 보인다.
 const knob=new THREE.Group();knob.position.set(1.3,.42,1.36);knob.rotation.x=Math.PI/2;root.add(knob);
 const kb=mesh(new THREE.CylinderGeometry(.17,.19,.3,24),phys({color:'#f4f4f0',roughness:.45,clearcoat:.4}),knob);kb.position.y=.15;
 for(let i=0;i<8;i++){const r=mesh(new THREE.BoxGeometry(.03,.28,.05),phys({color:'#e2e2dc',roughness:.5}),knob);const a=i/8*Math.PI*2;r.position.set(Math.cos(a)*.18,.15,Math.sin(a)*.18);r.rotation.y=-a;}
 // 속 구조(겉판을 열었을 때만 보임): 네 기둥과 윗판, 다이얼 받침
 const inner=new THREE.Group();root.add(inner);
 for(const x of [-1.25,1.25])for(const z of [-1.0,1.0])rbox(.12,2.66,.12,.03,steel,x,1.47,z,inner);
 rbox(2.66,.07,2.2,.02,steel,0,2.78,0,inner);
 rbox(.26,1.5,.05,.02,steel,0,.9,1.31,inner);
 const screw=mesh(new THREE.CylinderGeometry(.04,.04,.4,12),steel,inner);screw.rotation.x=Math.PI/2;screw.position.set(1.3,.42,1.15);
 const bracket=rbox(2.1,.1,.55,.03,steel,0,1.0,0,inner);
 const springGeo=helixGeometry(1,16,.17);s.geometries.add(springGeo);
 const springMat=phys({color:'#3b3f46',metalness:.7,roughness:.35});
 const springs=[-.72,.72].map(x=>{const m=new THREE.Mesh(springGeo,springMat);m.castShadow=true;m.position.set(x,2.74,0);inner.add(m);return m;});
 const stem=rod(s,new THREE.Vector3(0,3,0),new THREE.Vector3(0,1,0),.07,steel,inner);
 const rack=rbox(.1,1.0,.08,.02,steel,.2,1.5,1.18,inner);
 const pinion=new THREE.Group();pinion.position.set(0,1.62,1.22);inner.add(pinion);
 const pc=mesh(new THREE.CylinderGeometry(.14,.14,.1,24),steel,pinion);pc.rotation.x=Math.PI/2;
 for(let i=0;i<12;i++){const t=mesh(new THREE.BoxGeometry(.05,.07,.1),steel,pinion);const a=i/12*Math.PI*2;t.position.set(Math.cos(a)*.16,Math.sin(a)*.16,0);t.rotation.z=a;}
 const book=rbox(1.1,.45,2.2,.05,phys({color:'#5a7ec4',roughness:.6}),1.25,.225,0);book.visible=false;
 const objects={};let current=null;
 const state={load:0,zero:0,open,tilt:0};
 function setOpen(v){state.open=v;shell.visible=!v;rim.visible=!v;inner.visible=v;glass.visible=!v;}
 function setObject(kind){if(current)current.visible=false;current=null;if(!kind)return;objects[kind]??=kitchenObject(s,kind,pan);current=objects[kind];current.visible=true;current.position.y=.08;}
 function setTilt(deg){state.tilt=deg;pivot.rotation.z=deg*RAD;book.visible=deg>0.5;book.scale.y=Math.max(.05,Math.sin(deg*RAD)*3.5/.45);book.position.y=book.scale.y*.45/2;}
 function update(load,zero=state.zero){
  state.load=load;state.zero=zero;
  const travel=clamp(load,0,1000)/1000*.42;
  pan.position.set(0,3.1-travel,0);bracket.position.y=1.0-travel;rack.position.y=1.5-travel;
  springs.forEach(m=>m.scale.y=1.74+travel);
  placeRod(stem,new THREE.Vector3(0,3.08-travel,0),new THREE.Vector3(0,1.0-travel,0));
  const a=-(load+zero)/1000*Math.PI*2;needle.rotation.z=a;pinion.rotation.z=a;knob.rotation.y=zero/100*Math.PI;
 }
 setOpen(open);update(0,0);
 return {root,pan,dish,knob,needle,setOpen,setObject,setTilt,update,state};
}
export const kitchenObjects=[['apple','사과',230],['flour','밀가루 봉지',500],['bottle','물병',780]];
function kitchenCamera(open){return open?{cam:[5.8,4.4,7.2],target:[0,1.7,0]}:{cam:[2.6,4.6,8.6],target:[0,1.75,0]};}

function mountKitchen(host,ctx){
 const saved=ctx.load('kitchen-lab',null)||{};
 const st={open:!!saved.open,flat:!!saved.flat,zeroed:!!saved.zeroed,zero:Number.isFinite(saved.zero)?saved.zero:40,object:null,press:0,reads:saved.reads||{}};
 host.innerHTML=`<div class="kitchen-activity balance-lab lab5"><h3>앉은뱅이저울(가정용저울)의 속 구조와 사용 방법</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 접시를 아래로 끌어 눌러 보세요</span></div>
 <div class="lab5-row"><b>보기</b><button type="button" data-view="out">겉모습</button><button type="button" data-view="in">속 구조 보기</button></div>
 <div class="lab5-row"><b>영점 조절 나사</b><button type="button" data-turn="-10">◀ 왼쪽으로 돌리기</button><button type="button" data-turn="10">오른쪽으로 돌리기 ▶</button></div>
 <ol class="lab5-steps"><li data-step="flat"><span>① 편평한 곳에 위치시킨다.</span><button type="button" data-do="flat">편평한 곳으로 옮기기</button></li><li data-step="zero"><span>② 바늘이 0을 가리키는지 확인한다.</span><button type="button" data-do="zero">0을 가리켜요</button></li><li data-step="read"><span>③ 물체를 올리고, 눈금을 읽어 무게 측정한다.</span><span class="lab5-objects">${kitchenObjects.map(([k,n])=>`<button type="button" data-object="${k}">${n}</button>`).join('')}<button type="button" data-object="">내리기</button></span><label>읽은 값 <input type="number" inputmode="numeric" data-read-input min="0" max="1000" step="10"> g</label><button type="button" data-do="read">확인</button></li></ol>
 <p class="lab5-note" role="status"></p><p class="lab5-small">물체의 무게는 체험을 위한 가상의 값입니다.</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{...kitchenCamera(st.open),fov:32});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=6;stage.controls.maxDistance=16;stage.controls.minAzimuthAngle=-Math.PI*.15;stage.controls.maxAzimuthAngle=Math.PI*.5;
 const k=buildKitchen(stage,{open:st.open}),canvas=stage.canvas,motion=new SpringMotion(0),tilt=new SpringMotion(st.flat?0:7);
 const say=(t)=>{note.textContent=t;ctx.status(t);};
 const objG=()=>kitchenObjects.find(o=>o[0]===st.object)?.[2]||0;
 function save(){ctx.save('kitchen-lab',{open:st.open,flat:st.flat,zeroed:st.zeroed,zero:st.zero,reads:st.reads});}
 function paintUI(){
  host.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='in')===st.open)));
  host.querySelectorAll('[data-object]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.object||null)===st.object)));
  host.querySelector('[data-step="flat"]').classList.toggle('done',st.flat);host.querySelector('[data-step="zero"]').classList.toggle('done',st.zeroed);host.querySelector('[data-step="read"]').classList.toggle('done',Object.keys(st.reads).length>0);
  canvas.dataset.open=String(st.open);canvas.dataset.flat=String(st.flat);canvas.dataset.zero=String(st.zero);canvas.dataset.load=String(objG()+Math.round(st.press));canvas.dataset.reading=String(objG()+st.zero);
 }
 function goal(){motion.set(objG()+st.press);}
 host.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{st.open=b.dataset.view==='in';k.setOpen(st.open);const c=kitchenCamera(st.open);stage.camera.position.set(...c.cam);stage.controls.target.set(...c.target);stage.controls.update();save();paintUI();say(st.open?'겉판을 열었어요. 접시를 눌러 용수철과 바늘이 함께 움직이는지 보세요. (관찰①)':'겉모습으로 돌아왔어요.');});
 host.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>{st.zero=clamp(st.zero+Number(b.dataset.turn),-100,100);if(st.zero!==0)st.zeroed=false;save();paintUI();say(st.zero===0?'바늘이 0을 가리켜요.':`영점 조절 나사를 돌리니 바늘이 움직였어요. (관찰②) 지금 빈 접시에서 ${st.zero>0?'+':''}${st.zero} g을 가리켜요.`);});
 host.querySelector('[data-do="flat"]').onclick=()=>{st.flat=true;tilt.set(0);save();paintUI();say('① 편평한 곳에 놓았어요.');};
 host.querySelector('[data-do="zero"]').onclick=()=>{if(!st.flat){say('먼저 ① 저울을 편평한 곳에 놓아요.');return;}if(st.object){say('접시를 비운 상태에서 바늘을 확인해요.');return;}if(st.zero!==0){say(`아직 바늘이 0이 아니에요(${st.zero>0?'+':''}${st.zero} g). 영점 조절 나사를 돌려 0에 맞춰요.`);return;}st.zeroed=true;save();paintUI();say('② 바늘이 0을 가리켜요. 이제 물체를 올려 보세요.');};
 host.querySelectorAll('[data-object]').forEach(b=>b.onclick=()=>{st.object=b.dataset.object||null;k.setObject(st.object);goal();paintUI();if(st.object&&(!st.flat||!st.zeroed))say('물체를 올렸어요. 그런데 ①②를 먼저 했나요? 순서대로 해 보세요.');else if(st.object)say('바늘이 멈춘 뒤 눈금을 읽어 보세요.');});
 host.querySelector('[data-do="read"]').onclick=()=>{
  if(!st.object){say('③ 먼저 물체를 올려요.');return;}
  const v=Number(host.querySelector('[data-read-input]').value),shown=objG()+st.zero;
  if(!Number.isFinite(v)||host.querySelector('[data-read-input]').value===''){say('바늘이 가리키는 눈금을 숫자로 써 보세요.');return;}
  if(v!==shown){say(`다시 읽어 보세요. 큰 눈금 한 칸은 100 g, 작은 눈금 한 칸은 10 g이에요.`);return;}
  if(st.zero!==0){say(`눈금은 바르게 읽었어요(${v} g). 하지만 빈 접시에서 바늘이 0이 아니었으니 물체의 무게와 달라요. ②로 돌아가 영점을 맞춰요.`);return;}
  st.reads[st.object]=v;save();paintUI();say(`${v} g! 바르게 읽었어요. 다른 물체도 올려 보세요. (${Object.keys(st.reads).length}/${kitchenObjects.length})`);
 };
 // 접시 누르기: 접시를 잡고 아래로 끌면 누르는 힘만큼 바늘이 돌고, 놓으면 되돌아간다(관찰①).
 const ray=new THREE.Raycaster(),vec=new THREE.Vector2();let drag=null;
 const setRay=e=>{const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,stage.camera);};
 const panHit=e=>{setRay(e);return ray.intersectObject(k.pan,true)[0];};
 canvas.addEventListener('pointerdown',e=>{if(!panHit(e))return;drag={id:e.pointerId,y:e.clientY};canvas.setPointerCapture(e.pointerId);stage.controls.enabled=false;e.preventDefault();});
 canvas.addEventListener('pointermove',e=>{if(!drag){canvas.style.cursor=panHit(e)?'ns-resize':'';return;}if(e.pointerId!==drag.id)return;const r=canvas.getBoundingClientRect();st.press=clamp((e.clientY-drag.y)/(r.height*.35)*600,0,1000-objG());goal();paintUI();});
 const up=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;stage.controls.enabled=true;st.press=0;goal();paintUI();say(st.open?'접시를 누르면 용수철 길이가 변하고 바늘이 움직여요. 손을 떼면 되돌아가요. (관찰①)':'접시를 누르면 바늘이 움직여요. 속 구조 보기로 용수철도 살펴보세요.');};
 canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 k.setTilt(st.flat?0:7);paintUI();goal();motion.set(objG(),true);
 say(st.flat?'접시를 눌러 보거나, 영점 조절 나사를 돌려 보세요.':'저울이 기울어진 곳에 있어요. 사용 방법 ①부터 해 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);tilt.update(document.hidden?0:dt);k.setTilt(Math.max(0,tilt.value));k.update(motion.value,st.zero);canvas.dataset.needle=String(Math.round(motion.value+st.zero));stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);stage.dispose();}};
}

// ───────────────────────── 윗접시저울 ─────────────────────────
// 교재 37쪽: 눈금판 · 접시 · 영점조절나사 · 팔받침. 두 접시는 받침점에서 같은 거리에 있고 위로 받쳐져 기울어도 수평을 유지한다.
const PIV=new THREE.Vector3(0,1.86,0),ARM=2.25,MAXTILT=7.5;
// 분동(교재 38쪽 사진): 값은 0.1 g 단위의 정수로 둔다.
export const brassSet=[['w100',1000],['w50',500],['w20',200],['w10a',100],['w10b',100],['w5',50],['w2a',20],['w2b',20],['w1',10],['m500',5],['m200',2],['m100',1]];
export const brassLabel=t=>t>=10?`${t/10} g`:`${t*100} mg`;
export const toppanObjects=[['eraser','지우개',23],['glue','풀',37],['block','나무 블록',64],['apple','사과',128]];
function scalePlateTexture(s){
 return paint(s,640,240,(g,w,h)=>{g.fillStyle='#f7f8f4';g.fillRect(0,0,w,h);g.strokeStyle='#9aa7ad';g.lineWidth=6;g.strokeRect(3,3,w-6,h-6);
  for(let i=-5;i<=5;i++){const x=w/2+i*54;g.strokeStyle=i===0?'#c8283c':'#2c3a44';g.lineWidth=i===0?8:4;g.beginPath();g.moveTo(x,24);g.lineTo(x,i%5===0?150:110);g.stroke();}
  g.fillStyle='#c8283c';g.font=`800 60px ${FONT}`;g.textAlign='center';g.fillText('0',w/2,214);});
}
function brassMesh(s,t,mats){
 const grp=new THREE.Group();
 if(t>=10){const r=.085+.18*Math.cbrt(t/1000),h=r*1.75;const body=s.mesh(new THREE.CylinderGeometry(r,r*1.02,h,40),mats.brass,grp);body.position.y=h/2;const neckM=s.mesh(new THREE.CylinderGeometry(r*.38,r*.45,r*.35,24),mats.brass,grp);neckM.position.y=h+r*.17;const top=s.mesh(new THREE.SphereGeometry(r*.48,24,16),mats.brass,grp);top.scale.y=.7;top.position.y=h+r*.42;grp.userData.h=h+r*.7;grp.userData.r=r;}
 else{const geo=t===1?new THREE.CylinderGeometry(.2,.2,.03,3):new THREE.BoxGeometry(t===5?.34:.27,.03,t===5?.34:.27);const p=s.mesh(geo,mats.alu,grp);p.position.y=.02;grp.userData.h=.05;grp.userData.r=.2;}
 return grp;
}
function toppanObject(s,kind,parent){
 const grp=new THREE.Group();parent.add(grp);
 if(kind==='eraser'){s.rbox(.9,.32,.48,.06,s.phys({map:paint(s,256,128,(g,w,h)=>{g.fillStyle='#f7f7f2';g.fillRect(0,0,w,h);g.fillStyle='#2f6db5';g.fillRect(w*.42,0,w*.58,h);}),roughness:.8}),0,.16,0,grp);}
 if(kind==='glue'){const b=s.mesh(new THREE.CylinderGeometry(.2,.2,.9,32),s.phys({color:'#f2c94c',roughness:.4,clearcoat:.5}),grp);b.position.y=.45;const c=s.mesh(new THREE.CylinderGeometry(.21,.21,.28,32),s.phys({color:'#d13a35',roughness:.4}),grp);c.position.y=1.0;}
 if(kind==='block'){s.rbox(.66,.66,.66,.06,s.phys({color:'#d9b47a',roughness:.65,clearcoat:.2}),0,.33,0,grp);}
 if(kind==='apple'){const a=s.mesh(new THREE.SphereGeometry(.42,40,28),s.phys({color:'#c9302c',roughness:.35,clearcoat:.8}),grp);a.scale.set(1,.88,1);a.position.y=.37;const st=s.mesh(new THREE.CylinderGeometry(.025,.035,.22,10),s.mat({color:'#5b3a1d'}),grp);st.position.y=.8;}
 return grp;
}
export function buildTopPan(s,{withBox=true}={}){
 const {mat,phys,mesh,rbox}=s;
 const green=phys({color:'#2f9c8a',roughness:.35,clearcoat:.6,clearcoatRoughness:.25});
 const steel=phys({color:'#d5dbde',metalness:.95,roughness:.22});
 const black=phys({color:'#25292d',roughness:.45,clearcoat:.4});
 // 받침대
 rbox(6.8,.62,2.3,.16,green,0,.31,0);rbox(6.2,.16,2.0,.08,green,0,.7,0);rbox(1.7,.34,1.4,.16,green,0,.95,0);
 rbox(.5,.62,.5,.06,steel,0,1.42,0);
 // 팔받침(팔이 크게 움직이는 것을 막는다)
 const restMat=phys({color:'#2a8c7b',roughness:.35,clearcoat:.6});
 const rests=[-1.45,1.45].map(x=>{const m=mesh(new THREE.CylinderGeometry(.09,.11,.78,20),restMat);m.position.set(x,.78+.39-.01,.25);return m;});
 // 눈금판(고정)과 기둥
 const post=mesh(new THREE.CylinderGeometry(.07,.07,1.5,16),steel);post.position.set(0,2.55,-.22);
 const plateMat=mat({map:scalePlateTexture(s),roughness:.5});
 const plate=s.rbox(.86,.34,.08,.03,steel,0,3.32,-.14);
 const plateFace=mesh(new THREE.PlaneGeometry(.82,.31),plateMat,s.scene,{cast:false});plateFace.position.set(0,3.32,-.095);
 // 팔(막대)과 바늘: 받침점(PIV)을 중심으로 돈다
 const beam=new THREE.Group();beam.position.copy(PIV);s.scene.add(beam);
 rbox(2*ARM+.3,.26,.3,.08,black,0,0,0,beam);rbox(.62,.46,.46,.06,steel,0,0,0,beam);
 const needle=mesh(new THREE.BoxGeometry(.035,1.42,.025),phys({color:'#d13a35',roughness:.35}),beam,{cast:false});needle.position.set(0,.74,.06);
 // 영점조절나사: 팔 양 끝에서 바깥으로 나온 나사와 너트
 const screwMat=phys({color:'#c2c9cc',metalness:.9,roughness:.3});
 const nuts={};
 for(const sx of [-1,1]){
  const r=mesh(new THREE.CylinderGeometry(.03,.03,.95,10),screwMat,beam);r.rotation.z=Math.PI/2;r.position.set(sx*(ARM+.62),0,0);
  const nut=new THREE.Group();beam.add(nut);
  const n1=mesh(new THREE.ConeGeometry(.13,.2,6),screwMat,nut);n1.rotation.z=sx*Math.PI/2;
  const n2=mesh(new THREE.CylinderGeometry(.11,.11,.1,6),screwMat,nut);n2.rotation.z=Math.PI/2;n2.position.x=-sx*.12;
  nuts[sx<0?'left':'right']=nut;
 }
 // 접시와 받침(위로 받친 접시는 팔이 기울어도 수평을 유지한다)
 const dishGeo=new THREE.LatheGeometry([[0,0],[.85,.03],[1.04,.16],[1.1,.27],[1.05,.28],[.98,.18],[.8,.08],[0,.06]].map(p=>new THREE.Vector2(...p)),64);s.geometries.add(dishGeo);
 const pans={},stems={},links={};
 for(const side of ['left','right']){
  const g=new THREE.Group();s.scene.add(g);const d=new THREE.Mesh(dishGeo,steel);d.castShadow=d.receiveShadow=true;g.add(d);
  rbox(.34,.34,.34,.05,steel,0,-.35,0,g);pans[side]=g;
  stems[side]=rod(s,new THREE.Vector3(),new THREE.Vector3(0,1,0),.06,steel);
  links[side]=rod(s,new THREE.Vector3(),new THREE.Vector3(0,1,0),.05,steel);
 }
 let box=null,tweezers=null;const homes={};
 if(withBox){
  box=new THREE.Group();box.position.set(4.75,0,1.0);s.scene.add(box);
  rbox(2.5,.36,1.7,.08,phys({color:'#c9cfd2',roughness:.45,clearcoat:.4}),0,.18,0,box);
  const hole=mat({color:'#3a3f43',roughness:.9});
  brassSet.forEach(([id,t],i)=>{const col=i<9?i%5:(i-9),row=i<5?0:i<9?1:2;const p=new THREE.Vector3(-.95+col*.47,.37,-.55+row*.55);homes[id]=p.clone().add(box.position);const m=s.mesh(new THREE.CylinderGeometry(.21,.21,.02,24),hole,box,{cast:false});m.position.copy(p);m.position.y=.365;});
  tweezers=new THREE.Group();s.scene.add(tweezers);
  for(const sx of [-1,1]){const arm=rbox(.05,.03,1.1,.012,steel,sx*.05,0,.55,tweezers);arm.rotation.y=sx*.08;}
  tweezers.position.set(4.2,.4,2.3);tweezers.rotation.y=.4;
 }
 const parts={'눈금판':[plate,plateFace],'접시':Object.values(pans),'영점조절나사':Object.values(nuts),'팔받침':rests};
 const state={deg:0,nut:{left:0,right:0}};
 function setNut(side,step){state.nut[side]=step;const sx=side==='left'?-1:1;nuts[side].position.set(sx*(ARM+.62+step*.04),0,0);}
 function pose(deg){
  state.deg=deg;beam.rotation.z=-deg*RAD;beam.updateMatrixWorld(true);
  for(const [side,sx] of [['left',-1],['right',1]]){
   const end=new THREE.Vector3(sx*ARM,0,0).applyMatrix4(beam.matrixWorld);
   pans[side].position.set(end.x,end.y+.75,0);
   placeRod(stems[side],end,new THREE.Vector3(end.x,end.y+.42,0));
   placeRod(links[side],new THREE.Vector3(end.x,.78,0),end);
  }
 }
 const panTop=side=>pans[side].position.clone().add(new THREE.Vector3(0,.08,0));
 setNut('left',0);setNut('right',0);pose(0);
 return {beam,pans,nuts,rests,plate,parts,box,homes,tweezers,setNut,pose,panTop,state,needle};
}
const toppanCamera={cam:[1.2,4.0,10.0],target:[1.0,1.9,0]};
const rightSlots=[[0,0],[.5,0],[-.5,0],[0,.46],[0,-.46],[.44,.42],[-.44,.42],[.44,-.42],[-.44,-.42],[.82,0],[-.82,0],[0,.82]];

function mountTopPan(kind,host,ctx){
 const saved=ctx.load('toppan-lab',null)||{};
 const st={tab:kind==='top-pan-weigh'?'weigh':'parts',part:null,nut:{left:saved.nutL??0,right:saved.nutR??3},object:saved.object||'glue',on:[],tried:new Set(),phase:'load',mistakes:0,done:new Set(saved.done||[])};
 host.innerHTML=`<div class="toppan-activity balance-lab lab5"><h3>윗접시저울로 무게 재기</h3><div class="lab5-tabs" role="tablist"><button type="button" data-tab="parts">구조 찾기</button><button type="button" data-tab="zero">① 영점 맞추기</button><button type="button" data-tab="weigh">②③ 분동으로 재기</button></div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 부품이나 분동을 눌러 보세요</span></div><div class="lab5-panel"></div><p class="lab5-note" role="status"></p></div>`;
 const view=host.querySelector('.balance-view'),panel=host.querySelector('.lab5-panel'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{...toppanCamera,fov:34});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=7;stage.controls.maxDistance=18;
 const t=buildTopPan(stage),canvas=stage.canvas;
 const mats={brass:stage.phys({color:'#d6d9d4',metalness:1,roughness:.18}),alu:stage.phys({color:'#c9cdd0',metalness:.8,roughness:.35})};
 const brass={};brassSet.forEach(([id,v])=>{const m=brassMesh(stage,v,mats);m.userData={...m.userData,id,v};m.traverse(o=>{o.userData.id=id;});stage.scene.add(m);m.position.copy(t.homes[id]);brass[id]={mesh:m,v,anim:null};});
 const objects={};let objMesh=null;
 const motion=new SpringMotion(0);
 const say=x=>{note.textContent=x;ctx.status(x);};
 const left10=()=>(toppanObjects.find(o=>o[0]===st.object)?.[2]||0)*10;
 const right10=()=>st.on.reduce((a,id)=>a+brass[id].v,0);
 const zero10=()=>(st.nut.right-st.nut.left)*10;   // 너트 한 칸 = 1 g만큼 한쪽이 무거워지는 효과
 function save(){ctx.save('toppan-lab',{nutL:st.nut.left,nutR:st.nut.right,object:st.object,done:[...st.done]});}
 function diff10(){return st.tab==='weigh'?right10()+zero10()-left10():zero10();}
 function settle(){const d=diff10();motion.set(clamp(d*.35,-MAXTILT,MAXTILT));canvas.dataset.diff=String(d/10);canvas.dataset.balanced=String(d===0);canvas.dataset.zero=String(zero10()/10);canvas.dataset.phase=st.phase;canvas.dataset.tab=st.tab;canvas.dataset.mistakes=String(st.mistakes);canvas.dataset.on=st.on.join(',');}
 function setObject(kind){if(objMesh)objMesh.visible=false;objMesh=null;if(st.tab!=='weigh'||!kind)return;objects[kind]??=toppanObject(stage,kind,stage.scene);objMesh=objects[kind];objMesh.visible=true;}
 const partText={'눈금판':'바늘이 0점을 가리키는지 이 판에서 확인해요. (교재 37쪽 그림의 이름)','접시':'물체와 추를 올려놓는 곳이다. (왼쪽 접시)에는 측정하고자 하는 물체를 올려놓고 (오른쪽 접시)에는 분동을 올려놓는다.','영점조절나사':'바늘이 0점에 오도록 조정하는 나사이다.','팔받침':'팔이 크게 움직이는 것을 막아 주는 역할을 한다.'};
 function highlight(name){Object.entries(t.parts).forEach(([k,list])=>list.forEach(o=>o.traverse(m=>{if(m.material&&!Array.isArray(m.material)&&'emissive' in m.material){m.material=m.material.userData.base??m.material;if(k===name){const c=m.material.clone();c.userData.base=m.material;c.emissive=new THREE.Color('#ffb000');c.emissiveIntensity=.45;stage.materials.add(c);m.material=c;}}})));}
 function drawPanel(){
  host.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===st.tab)));
  if(st.tab==='parts')panel.innerHTML=`<div class="lab5-row">${Object.keys(t.parts).map(n=>`<button type="button" data-part="${n}" aria-pressed="${st.part===n}">${n}</button>`).join('')}</div>${st.part?`<p class="lab5-book"><b>${st.part}</b> ${partText[st.part]}</p>`:'<p class="lab5-book">부품 이름을 누르거나 3D 저울에서 부품을 눌러 보세요.</p>'}`;
  if(st.tab==='zero')panel.innerHTML=`<p class="lab5-book">① 바늘이 0점을 가리키도록 한다. (= 영점조절)</p>${['left','right'].map(side=>`<div class="lab5-row"><b>${side==='left'?'왼쪽':'오른쪽'} 영점조절나사</b><button type="button" data-nut="${side}" data-step="-1">안쪽으로</button><button type="button" data-nut="${side}" data-step="1">바깥쪽으로</button></div>`).join('')}`;
  if(st.tab==='weigh'){
   panel.innerHTML=`<p class="lab5-book">② 분동은 집게를 사용하여 무거운 것부터 가벼운 것 순으로 올려놓는다. ③ 분동을 내려놓을 때는 거꾸로 가벼운 것부터 무거운 것 순으로 내려놓는다.</p><div class="lab5-row"><b>왼쪽 접시의 물체</b>${toppanObjects.map(([k,n])=>`<button type="button" data-tobj="${k}" aria-pressed="${st.object===k}" class="${st.done.has(k)?'done':''}">${n}${st.done.has(k)?' ✓':''}</button>`).join('')}</div><div class="lab5-row lab5-brass"><b>분동 (오른쪽 접시)</b>${brassSet.map(([id,v])=>`<button type="button" data-brass="${id}" aria-pressed="${st.on.includes(id)}">${brassLabel(v)}</button>`).join('')}</div><p class="lab5-sum">오른쪽 분동의 합: <b>${right10()/10} g</b></p><p class="lab5-small">물체의 무게는 체험을 위한 가상의 값입니다.</p>`;
  }
  panel.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>pickPart(b.dataset.part));
  panel.querySelectorAll('[data-nut]').forEach(b=>b.onclick=()=>{const side=b.dataset.nut;st.nut[side]=clamp(st.nut[side]+Number(b.dataset.step),-5,5);t.setNut(side,st.nut[side]);save();settle();const z=zero10();say(z===0?'바늘이 0점을 가리켜요. 영점조절이 끝났어요.':`바늘이 0점에서 ${z>0?'오른쪽':'왼쪽'}으로 기울었어요. 너트를 옮겨 0점에 맞춰 보세요.`);});
  panel.querySelectorAll('[data-tobj]').forEach(b=>b.onclick=()=>{st.object=b.dataset.tobj;resetWeigh();setObject(st.object);save();drawPanel();settle();say('새 물체를 왼쪽 접시에 올렸어요. 분동을 무거운 것부터 올려 보세요.');});
  panel.querySelectorAll('[data-brass]').forEach(b=>b.onclick=()=>toggle(b.dataset.brass));
 }
 function pickPart(name){st.part=name;highlight(name);drawPanel();say(`${name}: ${partText[name]}`);}
 function resetWeigh(){st.on.forEach(id=>moveTo(id,t.homes[id]));st.on=[];st.tried=new Set();st.phase='load';st.mistakes=0;}
 function moveTo(id,to){const b=brass[id];b.anim={from:b.mesh.position.clone(),to:to.clone(),t:0};}
 function slotFor(i){const top=t.panTop('right'),[dx,dz]=rightSlots[i]||[0,0];return new THREE.Vector3(top.x+dx,top.y,dz);}
 function toggle(id){
  if(st.tab!=='weigh')return;const v=brass[id].v,on=st.on.includes(id);
  if(!on){
   if(st.phase!=='load'){st.phase='load';st.tried=new Set();}
   const skipped=brassSet.filter(([o,w])=>w>v&&!st.on.includes(o)&&!st.tried.has(o));
   st.on.push(id);moveTo(id,slotFor(st.on.length-1));
   const d=right10()+zero10()-left10();
   if(skipped.length){st.mistakes++;say(`무거운 분동부터 올려야 해요. ${brassLabel(skipped[0][1])}을(를) 먼저 올려 봤나요?`);}
   else if(d>0)say(`${brassLabel(v)}을(를) 올리니 오른쪽이 더 무거워요. 이 분동을 내려놓고 다음으로 가벼운 분동을 올려 보세요.`);
   else if(d<0)say(`아직 왼쪽(물체)이 더 무거워요. 다음 분동을 올려 보세요.`);
  }else{
   if(st.phase==='balanced'||st.phase==='unload'){
    const lighter=st.on.filter(o=>brass[o].v<v);
    if(lighter.length){st.mistakes++;say(`내려놓을 때는 가벼운 것부터예요. ${brassLabel(brass[lighter[0]].v)}부터 내려놓아요.`);}
    st.phase='unload';
   }else st.tried.add(id);
   st.on=st.on.filter(o=>o!==id);moveTo(id,t.homes[id]);st.on.forEach((o,i)=>moveTo(o,slotFor(i)));
  }
  const d=right10()+zero10()-left10();
  if(st.phase==='load'&&d===0&&st.on.length){
   if(zero10()!==0)say('수평이 되었지만 영점이 맞지 않은 저울이에요. ① 영점 맞추기부터 해요.');
   else{st.phase='balanced';say(`수평이에요! 분동의 무게 합 ${right10()/10} g이 물체의 무게예요. 이제 가벼운 것부터 내려놓아요.`);}
  }
  if(st.phase==='unload'&&!st.on.length){if(st.mistakes===0&&zero10()===0){st.done.add(st.object);save();say(`잘했어요! 올리는 순서와 내리는 순서를 모두 지켰어요. (${st.done.size}/${toppanObjects.length})`);}else say('분동을 모두 내려놓았어요. 순서를 지키며 다시 해 볼까요?');st.phase='load';st.tried=new Set();st.mistakes=0;}
  drawPanel();settle();
 }
 host.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{st.tab=b.dataset.tab;if(st.tab!=='weigh')resetWeigh();setObject(st.object);highlight(null);st.part=null;drawPanel();settle();say(st.tab==='parts'?'부품을 눌러 이름과 하는 일을 확인해요.':st.tab==='zero'?'빈 접시에서 바늘이 0점을 가리키도록 영점조절나사의 너트를 옮겨요.':zero10()!==0?'먼저 ① 영점을 맞춰야 바르게 잴 수 있어요.':'물체는 왼쪽, 분동은 오른쪽 접시예요. 무거운 분동부터 올려 보세요.');});
 // 3D에서 누르기: 부품 찾기 · 분동 올리기/내리기
 const ray=new THREE.Raycaster(),vec=new THREE.Vector2();
 const setRay=e=>{const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,stage.camera);};
 let down=null;
 canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
 const click=e=>{
  if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return;}down=null;setRay(e);
  if(st.tab==='weigh'){const hit=ray.intersectObjects(Object.values(brass).map(b=>b.mesh),true)[0];if(hit)toggle(hit.object.userData.id);return;}
  if(st.tab==='parts'){for(const [name,list] of Object.entries(t.parts)){if(ray.intersectObjects(list,true).length){pickPart(name);return;}}}
 };
 canvas.addEventListener('pointerup',click);
 t.setNut('left',st.nut.left);t.setNut('right',st.nut.right);setObject(st.object);drawPanel();settle();motion.set(motion.target,true);
 say(st.tab==='weigh'?(zero10()!==0?'먼저 ① 영점을 맞춰야 바르게 잴 수 있어요.':'물체는 왼쪽, 분동은 오른쪽 접시예요. 무거운 분동부터 올려 보세요.'):'부품을 눌러 이름과 하는 일을 확인해요.');
 let disposed=false,raf=0,last=performance.now(),carrying=null;
 function tick(now){
  if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);t.pose(motion.value);
  if(objMesh){const p=t.panTop('left');objMesh.position.set(p.x,p.y,p.z);}
  carrying=null;
  for(const [id,b] of Object.entries(brass)){
   if(b.anim){b.anim.t=Math.min(1,b.anim.t+dt/.55);const k=b.anim.t,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;b.mesh.position.lerpVectors(b.anim.from,b.anim.to,e);b.mesh.position.y+=Math.sin(Math.PI*k)*1.2;if(k>=1)b.anim=null;else carrying=b;}
   else if(st.on.includes(id)){const i=st.on.indexOf(id);b.mesh.position.copy(slotFor(i));}
  }
  if(t.tweezers){if(carrying){const p=carrying.mesh.position;t.tweezers.position.set(p.x,p.y+(carrying.mesh.userData.h||.3)*.6,p.z);t.tweezers.rotation.set(-Math.PI/2,0,0);}else{t.tweezers.position.set(4.2,.4,2.3);t.tweezers.rotation.set(0,.4,0);}}
  canvas.dataset.shown=motion.value.toFixed(2);stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);canvas.removeEventListener('pointerup',click);stage.dispose();}};
}

export function mountScale5(kind,host,ctx){return kind==='kitchen-scale'?mountKitchen(host,ctx):mountTopPan(kind,host,ctx);}

// ───────────────────────── 정지 그림(투사·인쇄) ─────────────────────────
function mobileScene(s){
 const bar=s.phys({color:'#bfc4c8',roughness:.4,clearcoat:.4}),line=s.mat({color:'#55606a',roughness:.6});
 const X=px=>(px-478)/50;
 const hBar=(a,b,y)=>{const m=s.mesh(new THREE.CapsuleGeometry(.14,X(b)-X(a),8,16),bar);m.rotation.z=Math.PI/2;m.position.set((X(a)+X(b))/2,y,0);};
 const v=(px,y0,y1)=>rod(s,new THREE.Vector3(X(px),y0,0),new THREE.Vector3(X(px),y1,0),.025,line);
 v(478,4.6,6.3);hBar(328,628,4.6);v(333,4.6,2.95);hBar(245,423,2.95);v(415,2.95,1.95);hBar(352,480,1.95);
 const disc=(px,yTop,ch)=>{v(px,yTop,.95);const d=s.mesh(new THREE.CylinderGeometry(.55,.55,.12,48),s.phys({color:'#f4f4f0',roughness:.5}));d.rotation.x=Math.PI/2;d.position.set(X(px),.4,0);
  const f=s.mesh(new THREE.CircleGeometry(.53,48),s.mat({map:paint(s,256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.fillStyle='#25292d';g.font=`800 150px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText(ch,w/2,h/2+8);}),roughness:.5}),s.scene,{cast:false});f.position.set(X(px),.4,.065);
  const ring=s.mesh(new THREE.TorusGeometry(.55,.04,12,48),line);ring.position.set(X(px),.4,.07);};
 disc(250,2.95,'ㄱ');disc(352,1.95,'ㄴ');disc(480,1.95,'ㄷ');disc(622,4.6,'ㄹ');
}
function springLeverScene(s){
 const beamTex=paint(s,2048,200,(g,w,h)=>{g.fillStyle='#cfe2ef';g.fillRect(0,0,w,h);g.strokeStyle='#7d9db3';g.lineWidth=8;g.strokeRect(4,4,w-8,h-8);const xs=[-5,-4,-3,-2,-1,0,1,2,3,4,5];xs.forEach(i=>{const x=w/2+i*178;if(i===0)return;g.fillStyle='#fbf3c8';g.beginPath();g.arc(x,h/2,62,0,Math.PI*2);g.fill();g.strokeStyle='#8b8f6a';g.lineWidth=5;g.stroke();g.fillStyle='#2c3a44';g.font=`800 78px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText(String(Math.abs(i)),x,h/2+4);});});
 const steel=s.phys({color:'#c9d0d4',metalness:.85,roughness:.3});
 const beamSide=s.phys({color:'#b9d0df',roughness:.5});
 s.mesh(new THREE.BoxGeometry(10.4,1.0,.3),[beamSide,beamSide,beamSide,beamSide,s.mat({map:beamTex,roughness:.5}),beamSide]).position.set(0,5,0);
 s.mesh(new THREE.CylinderGeometry(.12,.12,4.8,16),steel).position.set(0,2.4,-.3);
 for(const [y,flip] of [[5.75,1],[4.25,-1]]){const c=s.mesh(new THREE.ConeGeometry(.32,.5,3),steel);c.position.set(0,y,.25);c.rotation.z=flip>0?Math.PI:0;}
 s.label('받침점',{size:.6}).position.set(0,6.55,0);
 const sp=s.phys({color:'#8a9096',metalness:.8,roughness:.35});const X=i=>i*.92;
 const left=s.mesh(helixGeometry(1,22,.16),sp);left.position.set(X(-2),4.45,0);left.scale.y=1.7;rod(s,new THREE.Vector3(X(-2),4.5,0),new THREE.Vector3(X(-2),4.45,0),.02,sp);
 rod(s,new THREE.Vector3(X(-2),2.75,0),new THREE.Vector3(X(-2),2.35,0),.02,sp);
 const w=s.mesh(new THREE.CylinderGeometry(.3,.3,.42,32),s.phys({color:'#d3b05a',metalness:.9,roughness:.3}));w.position.set(X(-2),2.1,0);
 const right=s.mesh(helixGeometry(1,22,.16),sp);right.position.set(X(2),4.45,0);right.scale.y=3.0;
 const ring=s.mesh(new THREE.TorusGeometry(.18,.04,10,24),sp);ring.position.set(X(2),1.3,0);
 const red=s.phys({color:'#d13a35',roughness:.35});rod(s,new THREE.Vector3(X(2),1.05,.2),new THREE.Vector3(X(2),.45,.2),.06,red);const head=s.mesh(new THREE.ConeGeometry(.18,.34,20),red);head.position.set(X(2),.32,.2);head.rotation.z=Math.PI;
 s.label('손으로 잡아당김',{size:.48}).position.set(X(2)+1.9,.9,0);
}
function weightRow(s){
 const mats={brass:s.phys({color:'#d6d9d4',metalness:1,roughness:.18}),alu:s.phys({color:'#c9cdd0',metalness:.8,roughness:.35})};
 const list=[1000,500,200,100,100,50,20,20,10,5,2,1],step=v=>v>=10?Math.max(.62,2*(.085+.18*Math.cbrt(v/1000))+.3):.78;
 const total=list.reduce((a,v)=>a+step(v),0);let x=-total/2;
 list.forEach(v=>{const m=brassMesh(s,v,mats);x+=step(v)/2;m.position.set(x,0,0);s.scene.add(m);s.label(brassLabel(v),{size:.2}).position.set(x,.02,.75);x+=step(v)/2;});
}
function balancedArms(s,{answer}){
 const t=buildTopPan(s,{withBox:false});t.pose(0);
 if(!answer)return;
 const red=s.phys({color:'#d13a35',roughness:.35});
 for(const sx of [-1,1]){rod(s,new THREE.Vector3(0,1.5,.45),new THREE.Vector3(sx*ARM,1.5,.45),.035,red);for(const x of [0,sx*ARM])rod(s,new THREE.Vector3(x,1.38,.45),new THREE.Vector3(x,1.62,.45),.03,red);s.label(sx<0?'a':'b',{size:.45}).position.set(sx*ARM/2,1.2,.6);}
 s.label('a = b',{size:.6}).position.set(0,4.15,0);
}
const l5Stills={
 'l5-kitchen':{size:[1000,900],stage:{cam:[2.6,4.6,8.6],target:[0,1.75,0],fov:32},build(s){buildKitchen(s);}},
 'l5-kitchen-open':{size:[1000,900],stage:{cam:[6.6,4.8,8.4],target:[0,1.7,0],fov:32},build(s){const k=buildKitchen(s,{open:true});k.update(0,0);callout(s,'용수철',[2.3,3.6,-.9],[.85,2.1,0],.4);callout(s,'영점 조절 나사',[2.5,1.3,2.0],[1.3,.42,1.55],.36);callout(s,'바늘',[-2.0,3.1,1.5],[0,1.95,1.45],.4);callout(s,'접시',[-2.2,4.1,0],[-1.3,3.3,0],.4);}},
 'l5-kitchen-open-load':{size:[1000,900],stage:{cam:[6.6,4.8,8.4],target:[0,1.7,0],fov:32},build(s){const k=buildKitchen(s,{open:true});k.setObject('flour');k.update(500,0);callout(s,'용수철 길이가 변해요',[1.7,3.9,-1.0],[.85,1.9,0],.38);}},
 'l5-kitchen-flat':{size:[900,700],stage:{cam:[2.6,4.0,8.6],target:[0,1.6,0],fov:32},build(s){buildKitchen(s);s.label('편평한 곳',{size:.55}).position.set(0,-.1,2.6);}},
 'l5-kitchen-dial0':{size:[900,700],stage:{cam:[.4,1.9,5.2],target:[0,1.6,0],fov:32},build(s){buildKitchen(s);}},
 'l5-kitchen-read':{size:[900,700],stage:{cam:[.9,3.9,6.6],target:[0,1.95,0],fov:32},build(s){const k=buildKitchen(s);k.setObject('apple');k.update(230,0);}},
 'l5-toppan-parts':{size:[1300,760],stage:{cam:[0,3.6,10.4],target:[0,2.0,0],fov:32},build(s){buildTopPan(s,{withBox:false});callout(s,'눈금판',[-1.5,4.0,0],[-.35,3.4,0]);callout(s,'접시',[3.4,3.75,0],[2.6,2.95,0]);callout(s,'영점조절나사',[4.0,1.25,.4],[3.05,1.86,.05],.42);callout(s,'팔받침',[3.0,.55,1.6],[1.45,1.3,.36]);}},
 'l5-toppan-zero':{size:[1100,700],stage:{cam:[0,3.4,9.6],target:[0,2.1,0],fov:32},build(s){const t=buildTopPan(s,{withBox:false});t.setNut('right',3);t.pose(3*.35);callout(s,'바늘이 0점을 가리키도록',[-2.2,4.15,0],[-.3,3.32,0],.42);callout(s,'영점조절나사',[2.6,.85,.9],[3.0,1.72,.05],.4);}},
 'l5-toppan-weigh':{size:[1300,760],stage:{cam:[1.3,4.3,11.2],target:[1.15,1.95,0],fov:34},build(s){const t=buildTopPan(s);t.pose(0);const o=toppanObject(s,'glue',s.scene);o.position.copy(t.panTop('left'));const mats={brass:s.phys({color:'#d6d9d4',metalness:1,roughness:.18}),alu:s.phys({color:'#c9cdd0',metalness:.8,roughness:.35})};[[200,0],[100,1]].forEach(([v,i])=>{const m=brassMesh(s,v,mats);s.scene.add(m);const top=t.panTop('right'),[dx,dz]=rightSlots[i];m.position.set(top.x+dx,top.y,dz);});const held=brassMesh(s,50,mats);s.scene.add(held);const top=t.panTop('right');held.position.set(top.x+.45,top.y+.55,.3);t.tweezers.position.set(held.position.x,held.position.y+held.userData.h*.6,held.position.z);t.tweezers.rotation.set(-Math.PI/2,0,0);brassSet.filter(([id])=>!['w20','w10a','w5'].includes(id)).forEach(([id,v])=>{const m=brassMesh(s,v,mats);s.scene.add(m);m.position.copy(t.homes[id]);});callout(s,'집게로 무거운 것부터',[4.6,3.5,0],[top.x+.6,top.y+1.4,.3],.42);callout(s,'물체',[-3.6,3.9,0],[-2.25,3.3,0]);callout(s,'분동',[1.0,3.9,.5],[top.x-.2,top.y+.35,0]);}},
 'l5-weights-set':{size:[1400,400],stage:{cam:[0,1.25,6.6],target:[0,.3,0],fov:24},build(s){weightRow(s);}},
 'l5-speed':{size:[1200,700],stage:{cam:[0,2.6,9.8],target:[0,2.1,0],fov:32},build(s){balancedArms(s,{answer:false});}},
 'l5-speed-answer':{size:[1200,700],stage:{cam:[0,2.6,9.8],target:[0,2.1,0],fov:32},build(s){balancedArms(s,{answer:true});}},
 'l5-dt-mobile':{size:[900,760],stage:{cam:[-.85,3.3,15.5],target:[-.85,3.3,0],fov:32,table:false},build(s){mobileScene(s);}},
 'l5-dt-springs':{size:[900,760],stage:{cam:[.6,3.5,16.5],target:[.6,3.3,0],fov:32},build(s){springLeverScene(s);}}
};
export const lesson5StillNames=Object.keys(l5Stills);
export function lesson5StillSize(name){return l5Stills[name].size;}
export function renderLesson5Still(name,host){
 const sc=l5Stills[name];if(!sc)throw new Error('알 수 없는 그림: '+name);
 const stage=createStage(host,{...sc.stage,orbit:false});
 sc.build(stage);stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}
