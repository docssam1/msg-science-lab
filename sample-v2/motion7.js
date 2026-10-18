// 7차시 3D 교구: 운동과 정지(교재 50~51쪽) · 위치 표현의 3요소(52~53쪽) · 곰 인형으로 보는 운동(54쪽) · 속력 그래프(55쪽) · 속력의 단위(56쪽).
// 교재 50~57쪽의 문장·수치만 쓴다. 건물 사이 간격은 교재 그림처럼 거리에 비례하지 않는다(거리는 이름표의 km로 읽는다).
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {buildPerson} from './figures3d.js';
import {normalize} from './physics.js';

export const FONT='"Pretendard Variable","Pretendard","Segoe UI",Roboto,"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
const UP=new THREE.Vector3(0,1,0);
export const paint=(s,w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return s.canvasTex(c);};
export const fail=view=>{view.innerHTML='<div class="scene-error"><h3>3D 교구를 열지 못했습니다.</h3><p>이 브라우저의 WebGL 지원을 확인해 주세요. 교재의 그림과 본문은 계속 읽을 수 있습니다.</p></div>';};
export function placeRod(o,a,b){const d=b.clone().sub(a);o.position.copy(a).addScaledVector(d,.5);o.scale.set(1,Math.max(d.length(),.001),1);o.quaternion.setFromUnitVectors(UP,d.normalize());}
export function rod(s,a,b,r,m,parent=s.scene){const o=s.mesh(new THREE.CylinderGeometry(r,r,1,12),m,parent);placeRod(o,a,b);return o;}
export function callout(s,text,at,to,size=.46){const red=s.phys({color:'#d13a35',roughness:.4});const a=new THREE.Vector3(...at),b=new THREE.Vector3(...to);rod(s,a,b,.025,red);s.mesh(new THREE.SphereGeometry(.07,16,12),red).position.copy(b);const l=s.label(text,{size});l.position.copy(a);return l;}
// 화살표(a → b). set(a,b)로 다시 놓는다.
export function arrow3(s,{color='#d13a35',r=.06,parent=s.scene}={}){
 const m=s.phys({color,roughness:.35,clearcoat:.5});const g=new THREE.Group();parent.add(g);
 const shaft=s.mesh(new THREE.CylinderGeometry(r,r,1,16),m,g),head=s.mesh(new THREE.ConeGeometry(r*2.8,r*6,24),m,g);
 function set(a,b){const d=b.clone().sub(a),dir=d.clone().normalize(),hl=Math.min(r*6,d.length()*.5);placeRod(shaft,a,b.clone().addScaledVector(dir,-hl));head.position.copy(b).addScaledVector(dir,-hl/2);head.quaternion.setFromUnitVectors(UP,dir);}
 return {group:g,set};
}
// 거리 표시(양쪽 화살표 + 가운데 이름표)
export function dimension(s,xa,xb,text,{y=.3,z=1.25,color='#d13a35',size=.46}={}){
 const mid=(xa+xb)/2,a=arrow3(s,{color,r:.035}),b=arrow3(s,{color,r:.035});
 a.set(new THREE.Vector3(mid,y,z),new THREE.Vector3(xa+.05,y,z));b.set(new THREE.Vector3(mid,y,z),new THREE.Vector3(xb-.05,y,z));
 const l=s.label(text,{size});l.position.set(mid,y-.48,z+.1);return {a,b,label:l};
}
const ghostify=(root,opacity)=>{const mats=new Set();root.traverse(o=>{if(o.isMesh){o.castShadow=false;mats.add(o.material);}});mats.forEach(m=>{m.transparent=true;m.opacity=Math.min(m.opacity,opacity);m.depthWrite=false;});};

// ───────────────────────── 운동과 정지(50~51쪽) ─────────────────────────
// stop·move: 50쪽 ①②(0초·1초·2초), q1·q2: 51쪽 Speed Question(0초~4초). 위치는 1초마다 같은 간격으로 바뀐다(가상의 빠르기).
export const motionCases={
 stop:{seconds:2,step:4.2,child:false,move:false,ghostEvery:.5,name:'① 정지',book:'① 정지 · 단위 시간동안 물체의 위치가 변하지 않는 운동 상태'},
 move:{seconds:2,step:4.2,child:false,move:true,ghostEvery:.5,name:'② 운동',book:'② 운동 · 단위 시간동안 물체의 위치가 변한 운동 상태'},
 q1:{seconds:4,step:2.6,child:true,move:false,ghostEvery:1,name:'Speed Question 1',book:'다음 그림에서 물체가 운동하고 있지 않다” 라고 생각하는 이유를 설명해보세요.'},
 q2:{seconds:4,step:2.6,child:true,move:true,ghostEvery:1,name:'Speed Question 2',book:'다음 그림에서 물체가 운동하고 있다” 라고 생각하는 이유를 설명해보세요.'}
};
const caseX=(c,t)=>{const x0=-c.seconds*c.step/2;return c.move?x0+c.step*t:x0;};
function buildTimeline(s,c){
 const g=new THREE.Group();s.scene.add(g);const x0=-c.seconds*c.step/2;
 s.rbox(c.seconds*c.step+2.6,.24,1.7,.06,s.phys({color:'#a9acaf',roughness:.6}),0,.12,0,g);
 const labels=[];for(let i=0;i<=c.seconds;i++){const l=s.label(`${i}초`,{size:.55});l.position.set(x0+i*c.step,-.42,1.05);labels.push(l);}
 return {remove(){s.scene.remove(g);labels.forEach(l=>s.scene.remove(l));}};
}
function motionPeople(s,child){
 const opts=child?{height:2.5,child:true,shirt:'#f6a6b9',pants:'#4f79b8',shorts:true,shoes:'#f4f1ea',hair:'#6b4426',hairStyle:'pigtails'}:{height:3.4,shirt:'#7d8a96',pants:'#4c5560',shoes:'#3b3f46',hair:'#2f2a26'};
 const main=buildPerson(s,opts),ghosts=[0,1,2,3].map(()=>{const p=buildPerson(s,opts);ghostify(p.root,.4);p.root.visible=false;return p;});
 return {main,ghosts,set visible(v){main.root.visible=v;if(!v)ghosts.forEach(g=>g.root.visible=false);}};
}
// t초일 때의 모습(지난 위치는 trail이면 흐리게 남긴다)
function poseMotion(people,c,t,trail){
 const walking=c.move&&t<c.seconds;
 const place=(p,tt,walk)=>{p.root.position.set(caseX(c,tt),.24,.1);p.root.rotation.y=c.move?Math.PI/2:.25;p.setPose(walk?'walk':'stand',tt*Math.PI*2+.6);};
 place(people.main,t,walking||(c.move&&t>0&&t<c.seconds));
 people.ghosts.forEach((g,i)=>{const tt=i*c.ghostEvery;g.root.visible=trail&&c.move&&tt<t-1e-6;if(g.root.visible)place(g,tt,true);});
}
function mountMotionTime(host,ctx){
 const saved=ctx.load('motion-time',null)||{};
 const st={case:saved.case||'stop',t:0,playing:false,trail:true,judged:new Set(saved.judged||[])};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>시간이 흐를 때 물체의 위치를 비교해 보세요</h3><div class="lab5-tabs">${Object.entries(motionCases).map(([k,c])=>`<button type="button" data-case="${k}">${c.name}</button>`).join('')}</div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 시간을 흐르게 하고 위치를 비교해요</span></div><p class="lab5-book" data-book></p><div class="lab5-row"><b>시간</b><button type="button" data-play>▶ 시간 흐르게 하기</button><span data-times></span><label class="lab5-check"><input type="checkbox" data-trail checked> 지난 위치 남기기</label></div><div class="lab5-row"><b>물체의 위치가</b><button type="button" data-judge="same">변하지 않았어요</button><button type="button" data-judge="moved">변했어요</button></div><p class="lab5-note" role="status"></p><p class="lab5-small">사람이 움직이는 빠르기는 체험을 위한 가상의 값입니다.</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,3.0,14.5],target:[0,1.6,0],fov:32,table:false,backdrop:'sky'});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=8;stage.controls.maxDistance=22;
 stage.rbox(60,.2,60,.05,stage.phys({color:'#e5e9df',roughness:.9}),0,-.1,4);
 const canvas=stage.canvas,adults=motionPeople(stage,false),kids=motionPeople(stage,true);
 let line=null;
 const say=x=>{note.textContent=x;ctx.status(x);};
 const people=()=>motionCases[st.case].child?kids:adults;
 function save(){ctx.save('motion-time',{case:st.case,judged:[...st.judged]});}
 function setCase(k){st.case=k;st.t=0;st.playing=false;line?.remove();line=buildTimeline(stage,motionCases[k]);adults.visible=!motionCases[k].child;kids.visible=motionCases[k].child;paintUI();}
 function paintUI(){
  const c=motionCases[st.case];
  host.querySelectorAll('[data-case]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.case===st.case));b.classList.toggle('done',st.judged.has(b.dataset.case));});
  host.querySelector('[data-book]').textContent=c.book;
  host.querySelector('[data-times]').innerHTML=Array.from({length:c.seconds+1},(_,i)=>`<button type="button" data-t="${i}" aria-pressed="${!st.playing&&Math.abs(st.t-i)<1e-6}">${i}초</button>`).join('');
  host.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{st.playing=false;st.t=+b.dataset.t;paintUI();say(`${b.dataset.t}초일 때의 위치예요.`);});
  canvas.dataset.labCase=st.case;canvas.dataset.labJudged=[...st.judged].sort().join(',');
 }
 host.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>{setCase(b.dataset.case);say('▶ 시간 흐르게 하기를 눌러 위치가 어떻게 되는지 보세요.');});
 host.querySelector('[data-play]').onclick=()=>{st.t=0;st.playing=true;paintUI();say('시간이 흐르고 있어요. 물체의 위치를 보세요.');};
 host.querySelector('[data-trail]').onchange=e=>{st.trail=e.target.checked;};
 host.querySelectorAll('[data-judge]').forEach(b=>b.onclick=()=>{
  const c=motionCases[st.case],ok=(b.dataset.judge==='moved')===c.move;
  if(ok){st.judged.add(st.case);save();paintUI();}
  say(ok?(c.move?'맞아요. 시간이 흐르는 동안 물체의 위치가 변했어요. 교재 50쪽: 단위 시간동안 물체의 위치가 변한 운동 상태를 ‘운동’이라고 해요.':'맞아요. 시간이 흘러도 물체의 위치가 변하지 않았어요. 교재 50쪽: 단위 시간동안 물체의 위치가 변하지 않는 운동 상태를 ‘정지’라고 해요.'):'0초와 마지막 시간의 위치를 다시 비교해 볼까요? ▶ 시간 흐르게 하기를 눌러 보세요.');
 });
 setCase(st.case);say('▶ 시간 흐르게 하기를 눌러 위치가 어떻게 되는지 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;const c=motionCases[st.case];
  if(st.playing&&!document.hidden){st.t=Math.min(c.seconds,st.t+dt);if(st.t>=c.seconds){st.playing=false;paintUI();say(c.move?'시간이 흐르는 동안 위치가 어떻게 되었나요?':'시간이 흐르는 동안 위치가 어떻게 되었나요?');}}
  poseMotion(people(),c,st.t,st.trail);canvas.dataset.labT=st.t.toFixed(2);canvas.dataset.labX=caseX(c,st.t).toFixed(2);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── 위치 표현의 3요소(52~53쪽) ─────────────────────────
function signTexture(s,text,{bg='#ffffff',fg='#1b1f23',w=512,h=128,border='#3c4a5a'}={}){return paint(s,w,h,(g)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=border;g.lineWidth=10;g.strokeRect(5,5,w-10,h-10);g.fillStyle=fg;g.font=`800 ${h*.5}px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+4);});}
function windowsTexture(s,{bg,win='#ffffff',frame='#2e4a5c',cols=4,rows=4,w=512,h=640}){return paint(s,w,h,(g)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);const cw=w/cols,ch=h/rows;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){g.fillStyle=frame;g.fillRect(i*cw+cw*.14,j*ch+ch*.16,cw*.72,ch*.62);g.fillStyle=win;g.fillRect(i*cw+cw*.2,j*ch+ch*.22,cw*.6,ch*.5);}});}
function building(s,kind,{x=0,z=-.6}={}){
 const g=new THREE.Group();g.position.set(x,.12,z);s.scene.add(g);
 const P=o=>s.phys({roughness:.5,clearcoat:.3,...o});
 const sign=(text,y,w=1.3,opts={})=>{const m=s.mesh(new THREE.PlaneGeometry(w,w/4),s.mat({map:signTexture(s,text,opts),roughness:.5}),g,{cast:false});m.position.set(0,y,.52);return m;};
 if(kind==='school'){s.rbox(1.7,1.5,1.0,.04,P({color:'#f6c933'}),0,.75,0,g);for(const cx of [-.55,-.2,.2,.55])s.rbox(.14,.92,.08,.02,P({color:'#9aa3ab'}),cx,.5,.52,g);s.rbox(2.1,.14,1.25,.04,P({color:'#3c4a5a'}),0,1.57,0,g);s.rbox(1.6,.12,1.0,.04,P({color:'#3c4a5a'}),0,1.75,0,g);s.rbox(1.0,.12,.8,.04,P({color:'#3c4a5a'}),0,1.92,0,g);sign('대치엠에스지',1.24,1.45);}
 if(kind==='cave'){const dome=s.mesh(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2),P({color:'#cfc6b6',roughness:.95,clearcoat:0}),g);dome.scale.set(1.25,.95,.9);const hole=s.mesh(new THREE.SphereGeometry(.5,32,16,0,Math.PI*2,0,Math.PI/2),s.mat({color:'#2a2420',roughness:1}),g);hole.scale.set(.85,1.05,.32);hole.position.set(-.1,0,.8);for(const [rx,ry,rz,rs] of [[.6,.15,.55,.22],[-.8,.1,.4,.18],[.95,.08,-.2,.2]]){const r=s.mesh(new THREE.DodecahedronGeometry(rs),P({color:'#b8ad9a',roughness:1,clearcoat:0}),g);r.position.set(rx,ry,rz);}}
 if(kind==='hospital'){s.rbox(1.5,2.3,1.0,.04,P({color:'#3fb6c9'}),0,1.15,0,g);const front=s.mesh(new THREE.PlaneGeometry(1.42,2.2),s.mat({map:windowsTexture(s,{bg:'#3fb6c9',frame:'#e0742c',cols:4,rows:5}),roughness:.4}),g,{cast:false});front.position.set(0,1.15,.505);s.rbox(.5,.3,.5,.04,P({color:'#3fb6c9'}),0,2.45,0,g);sign('MSG병원',.42,1.2,{bg:'#f4fbfc',fg:'#6a7a84',border:'#6a7a84'});}
 if(kind==='house'){s.rbox(1.0,.8,.9,.04,P({color:'#f5a33a'}),0,.4,0,g);const roof=s.mesh(new THREE.ConeGeometry(.9,.62,4),P({color:'#d6453b'}),g);roof.rotation.y=Math.PI/4;roof.position.y=1.11;s.rbox(.24,.42,.06,.02,P({color:'#b23a3a'}),.22,.21,.47,g);s.rbox(.28,.24,.05,.02,P({color:'#8fd0ef',roughness:.1}),-.22,.5,.46,g);}
 if(kind==='clinic'){s.rbox(1.6,1.1,1.0,.04,P({color:'#5cc6b5'}),0,.55,0,g);const front=s.mesh(new THREE.PlaneGeometry(1.5,.8),s.mat({map:windowsTexture(s,{bg:'#5cc6b5',frame:'#2f6e66',cols:4,rows:2,h:320}),roughness:.4}),g,{cast:false});front.position.set(0,.5,.505);s.rbox(1.0,.4,.8,.04,P({color:'#f2f6f5'}),0,1.3,0,g);const red=P({color:'#e03a3a'});s.rbox(.5,.13,.06,.02,red,0,1.3,.43,g);s.rbox(.13,.36,.06,.02,red,0,1.3,.43,g);for(const tx of [-.95,.95]){const t=s.mesh(new THREE.SphereGeometry(.24,20,14),P({color:'#5fb54a',roughness:.8}),g);t.position.set(tx,.45,.25);rod(s,new THREE.Vector3(tx,0,.25),new THREE.Vector3(tx,.3,.25),.04,P({color:'#8a5a2a'}),g);}}
 if(kind==='cafe'){s.rbox(1.15,.9,.9,.04,P({color:'#c94f5f'}),0,.45,0,g);const aw=s.mesh(new THREE.PlaneGeometry(1.3,.5),s.mat({map:paint(s,256,128,(c,w,h)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#ffffff':'#d63b4c';c.fillRect(i*w/8,0,w/8,h);}}),roughness:.6,side:THREE.DoubleSide}),g);aw.rotation.x=-.9;aw.position.set(0,.98,.6);s.rbox(.5,.4,.05,.02,P({color:'#ffe9b0',roughness:.2}),0,.36,.46,g);sign('카페',1.25,.9,{bg:'#fff6e0',fg:'#7a2a2a',border:'#7a2a2a'});}
 if(kind==='office'){s.rbox(1.35,1.6,1.0,.04,P({color:'#c8282c'}),0,.8,0,g);const front=s.mesh(new THREE.PlaneGeometry(1.25,1.4),s.mat({map:windowsTexture(s,{bg:'#c8282c',frame:'#7c1416',cols:3,rows:3,h:512}),roughness:.4}),g,{cast:false});front.position.set(0,.85,.505);const roof=s.mesh(new THREE.ConeGeometry(1.0,.5,4),P({color:'#5a3324'}),g);roof.rotation.y=Math.PI/4;roof.scale.set(1.0,1,.75);roof.position.y=1.85;}
 return g;
}
export const positionLayouts={
 example:{places:[['school','대치엠에스지',-4.6,-3],['cave','우루사 동굴',0,0],['hospital','MSG병원',4.6,4]],dims:[[-4.6,0,'3km'],[0,4.6,'4km']]},
 map:{places:[['house','집',-4.8,0],['clinic','병원',-1.3,4],['cafe','카페',1.05,5],['office','회사',4.9,13]],dims:[[-4.8,-1.3,'4 km'],[-1.3,1.05,'1 km'],[1.05,4.9,'8 km']]}
};
// 53쪽 Speed Question 다섯 문장: [대상, 기준점]. 방향·거리는 그림의 거리(4 km · 1 km · 8 km)로 정한다.
export const positionRows=[['병원','집'],['집','회사'],['회사','병원'],['카페','집'],['병원','회사']];
export function positionAnswer(layout,target,ref){const km=Object.fromEntries(positionLayouts[layout].places.map(p=>[p[1],p[3]]));const d=km[target]-km[ref];return {dir:d>0?'동쪽':'서쪽',km:Math.abs(d)};}
function buildRoadScene(s,layout,{names=true}={}){
 const L=positionLayouts[layout];
 s.rbox(60,.2,60,.05,s.phys({color:'#e3e8dc',roughness:.95}),0,-.1,4);
 s.rbox(11.6,.12,1.1,.04,s.phys({color:'#b9bdc1',roughness:.7}),0,.06,.35);
 const W=s.label('서쪽',{size:.5}),E=s.label('동쪽',{size:.5});W.position.set(-6.4,.3,.6);E.position.set(6.4,.3,.6);
 const byName={};for(const [kind,name,x] of L.places){byName[name]={group:building(s,kind,{x}),x};if(names){const l=s.label(name,{size:.42});l.position.set(x,kind==='hospital'?3.05:kind==='office'?2.55:kind==='school'?2.35:kind==='cave'?1.45:1.9,-.4);}}
 const dims=L.dims.map(([a,b,t])=>dimension(s,a,b,t));
 return {byName,dims};
}
function ring(s,color){const r=s.mesh(new THREE.TorusGeometry(1.0,.07,12,48),s.phys({color,roughness:.3,clearcoat:.6,emissive:color,emissiveIntensity:.25}),s.scene,{cast:false});r.rotation.x=-Math.PI/2;r.visible=false;return r;}
function mountPosition(host,ctx){
 const saved=ctx.load('position-map',null)||{};
 const st={tab:saved.tab||'example',step:null,answers:saved.answers||{},solved:new Set(saved.solved||[]),focus:0,tryOk:!!saved.tryOk};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>기준점 · 방향 · 거리로 위치를 표현해 보세요</h3><div class="lab5-tabs"><button type="button" data-tab="example">① 위치 표현의 3요소 (52쪽)</button><button type="button" data-tab="speedq">Speed Question (53쪽)</button></div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 건물 사이의 거리는 이름표의 km로 읽어요</span></div><div class="lab5-panel"></div><p class="lab5-note" role="status"></p></div>`;
 const view=host.querySelector('.balance-view'),panel=host.querySelector('.lab5-panel'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,4.2,14.5],target:[0,1.2,0],fov:32,table:false,backdrop:'sky'});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=8;stage.controls.maxDistance=22;
 const canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 const groups={};
 function scene(layout){if(groups[layout])return groups[layout];const before=new Set(stage.scene.children);const built=buildRoadScene(stage,layout);const objs=stage.scene.children.filter(o=>!before.has(o));groups[layout]={...built,objs};return groups[layout];}
 const refRing=ring(stage,'#2f6db5'),tgtRing=ring(stage,'#e0742c'),dirArrow=arrow3(stage,{color:'#2f6db5',r:.07});dirArrow.group.visible=false;
 const tag=stage.label('',{size:.5});tag.visible=false;
 function showLayout(layout){for(const [k,g] of Object.entries(groups))g.objs.forEach(o=>o.visible=k===layout);scene(layout).objs.forEach(o=>o.visible=true);}
 function mark(layout,ref,target,{arrow=false,text=''}={}){if(!layout){refRing.visible=tgtRing.visible=dirArrow.group.visible=tag.visible=false;return;}const g=scene(layout);refRing.visible=!!ref;tgtRing.visible=!!target;dirArrow.group.visible=arrow;tag.visible=!!text;
  if(ref)refRing.position.set(g.byName[ref].x,.16,-.35);if(target)tgtRing.position.set(g.byName[target].x,.16,-.35);
  if(arrow){const a=g.byName[ref].x,b=g.byName[target].x;dirArrow.set(new THREE.Vector3(a,.5,1.9),new THREE.Vector3(b,.5,1.9));}
  if(text){tag.userData.set(text);tag.position.set((g.byName[ref].x+g.byName[target].x)/2,.95,2.5);}}
 function save(){ctx.save('position-map',{tab:st.tab,answers:st.answers,solved:[...st.solved],tryOk:st.tryOk});}
 const dirSelect=(name,value)=>`<select data-${name}><option value="">방향</option>${['동쪽','서쪽'].map(d=>`<option ${value===d?'selected':''}>${d}</option>`).join('')}</select>`;
 function draw(){
  host.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===st.tab)));
  showLayout(st.tab==='example'?'example':'map');
  if(st.tab==='example'){
   panel.innerHTML=`<p class="lab5-book">(예) 우루사 동굴을 기준으로 ‘대치엠에스지’의 위치를 표현하시오. · ‘대치엠에스지’는 우루사 동굴에서 서쪽으로 3km 떨어져 있다</p><div class="lab5-row"><b>3요소 짚기</b><button type="button" data-step="ref" aria-pressed="${st.step==='ref'}">① 기준점</button><button type="button" data-step="dir" aria-pressed="${st.step==='dir'}">② 방향</button><button type="button" data-step="dist" aria-pressed="${st.step==='dist'}">③ 거리</button></div><div class="lab5-row"><b>MSG병원의 위치</b><select data-tryref><option value="">기준점</option><option>대치엠에스지</option><option>우루사 동굴</option></select>에서 ${dirSelect('trydir','')}으로 <input data-trykm type="number" min="0" step="1" aria-label="거리 km"> km 떨어져 있다 <button type="button" data-trycheck class="${st.tryOk?'done':''}">확인</button></div>`;
   panel.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{st.step=b.dataset.step;draw();
    if(st.step==='ref'){mark('example','우루사 동굴',null);say('① 기준점: 우루사 동굴에서 — 어디를 기준으로 하는지 먼저 정해요.');}
    if(st.step==='dir'){mark('example','우루사 동굴','대치엠에스지',{arrow:true,text:'서쪽'});say('② 방향: 서쪽으로 — 기준점에서 어느 쪽인지 말해요.');}
    if(st.step==='dist'){mark('example','우루사 동굴','대치엠에스지',{arrow:true,text:'3km'});say('③ 거리: 3km 떨어져 있다 — 기준점에서 얼마나 떨어져 있는지 말해요.');}
    canvas.dataset.labStep=st.step;});
   panel.querySelector('[data-trycheck]').onclick=()=>{const ref=panel.querySelector('[data-tryref]').value,dir=panel.querySelector('[data-trydir]').value,km=panel.querySelector('[data-trykm]').value;
    if(!ref||!dir||km===''){say('기준점, 방향, 거리를 모두 정해 주세요.');return;}
    const a=positionAnswer('example','MSG병원',ref),ok=a.dir===dir&&a.km===Number(km);
    mark('example',ref,'MSG병원',{arrow:ok,text:ok?`${dir}으로 ${km}km`:''});
    if(ok){st.tryOk=true;save();}canvas.dataset.labTry=String(st.tryOk);
    say(ok?`맞아요. ‘MSG병원’은 ${ref}에서 ${dir}으로 ${km}km 떨어져 있어요. 기준점이 바뀌면 방향과 거리도 바뀌어요.`:`${ref}에서 MSG병원은 어느 쪽에 있나요? 그림 아래의 km를 더해서 거리를 구해 보세요.`);};
  }else{
   panel.innerHTML=`<p class="lab5-book">다음 그림에서 표현된 여러 건물의 위치를 올바르게 표현하기 위해 (   )에 알맞은 방향과 거리를 쓰시오.</p><ol class="lab5-steps">${positionRows.map(([t,r],i)=>{const v=st.answers[i]||{};return `<li data-row="${i}" class="${st.solved.has(i)?'done':''}"><span>${'①②③④⑤'[i]} ${t==='회사'||t==='카페'?t+'는':t+'은'} ${r}에서</span>${dirSelect('dir',v.dir||'')}방향으로 <input data-km type="number" min="0" step="1" value="${v.km??''}" aria-label="거리 km">km 떨어진 곳에 위치하고 있다. <button type="button" data-focus="${i}">그림에서 보기</button></li>`;}).join('')}</ol><div class="lab5-row"><button type="button" data-check>다섯 문장 확인</button><span class="lab5-sum">맞힌 문장 ${st.solved.size}/5</span></div>`;
   panel.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{const i=+b.dataset.focus,[t,r]=positionRows[i];st.focus=i;const done=st.solved.has(i),a=positionAnswer('map',t,r);mark('map',r,t,{arrow:done,text:done?`${a.dir}으로 ${a.km} km`:''});say(`파란 고리가 기준점(${r}), 주황 고리가 위치를 표현할 건물(${t})이에요.`);});
   panel.querySelector('[data-check]').onclick=()=>{
    panel.querySelectorAll('[data-row]').forEach(li=>{const i=+li.dataset.row;st.answers[i]={dir:li.querySelector('[data-dir]').value,km:li.querySelector('[data-km]').value};});
    const wrong=[];positionRows.forEach(([t,r],i)=>{const a=positionAnswer('map',t,r),v=st.answers[i];if(v.dir===a.dir&&Number(v.km)===a.km&&v.km!=='')st.solved.add(i);else{st.solved.delete(i);wrong.push(i);}});
    save();draw();canvas.dataset.labSolved=[...st.solved].sort().join(',');
    if(!wrong.length){const [t,r]=positionRows[4],a=positionAnswer('map',t,r);mark('map',r,t,{arrow:true,text:`${a.dir}으로 ${a.km} km`});say('다섯 문장 모두 맞아요. 기준점이 어디인지에 따라 방향과 거리가 달라져요.');}
    else{const i=wrong[0],[t,r]=positionRows[i];mark('map',r,t);say(`${'①②③④⑤'[i]}을 다시 볼까요? 기준점 ${r}에서 ${t}까지 사이의 km를 모두 더해 보세요.`);}
   };
  }
  canvas.dataset.labTab=st.tab;canvas.dataset.labSolved=[...st.solved].sort().join(',');canvas.dataset.labTry=String(st.tryOk);
 }
 host.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{st.tab=b.dataset.tab;st.step=null;mark(null,null,null);save();draw();say(st.tab==='example'?'①②③을 눌러 위치 표현의 3요소를 하나씩 짚어 보세요.':'방향과 거리를 고르고 확인해 보세요.');});
 draw();say(st.tab==='example'?'①②③을 눌러 위치 표현의 3요소를 하나씩 짚어 보세요.':'방향과 거리를 고르고 확인해 보세요.');
 let disposed=false,raf=0;
 function tick(){if(disposed)return;stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── 곰 인형과 배경(54쪽 ③) ─────────────────────────
function backdropTexture(s){
 return paint(s,3072,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#fffaf6');gr.addColorStop(1,'#fdf1ea');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#f0c9c4';g.fillRect(0,h*.86,w,h*.04);
  const tree=(x,sc)=>{g.save();g.translate(x,h*.86);g.scale(sc,sc);g.fillStyle='#f3cfae';g.beginPath();g.moveTo(-70,0);g.bezierCurveTo(-40,-200,-60,-360,-20,-470);g.lineTo(40,-470);g.bezierCurveTo(70,-360,50,-200,80,0);g.closePath();g.fill();
   g.fillStyle='#f6dcc6';for(const [cx,cy,r] of [[-150,-560,150],[20,-640,170],[170,-560,150],[-60,-470,120],[110,-470,120]]){g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.fill();}
   g.fillStyle='#e9a6a0';for(const [hx,hy] of [[-120,-600],[60,-700],[150,-520],[-30,-520],[110,-640]]){g.beginPath();g.moveTo(hx,hy+14);g.bezierCurveTo(hx-26,hy-6,hx-12,hy-26,hx,hy-10);g.bezierCurveTo(hx+12,hy-26,hx+26,hy-6,hx,hy+14);g.fill();}
   g.fillStyle='#c97b52';g.fillRect(-150,-250,120,46);g.fillStyle='#fff4e8';g.font=`700 26px ${FONT}`;g.fillText('LOVE',-128,-220);g.restore();};
  tree(w*.78,1.0);tree(w*.3,.8);
  g.fillStyle='#e9b9a6';for(let i=0;i<40;i++){const x=(i*389)%w,y=h*.84;g.beginPath();g.ellipse(x,y,10,5,0,0,Math.PI*2);g.fill();}});
}
function buildBear(s){
 const g=new THREE.Group();s.scene.add(g);
 const fur=s.phys({color:'#f4f0e8',roughness:.9,sheen:.6}),dark=s.mat({color:'#2a211b',roughness:.3}),pink=s.phys({color:'#efb8c0',roughness:.8});
 const at=(geo,m,x,y,z,sc)=>{const o=s.mesh(geo,m,g);o.position.set(x,y,z);if(sc)o.scale.set(...sc);return o;};
 at(new THREE.SphereGeometry(.42,32,24),fur,0,.62,0,[1,1.15,.9]);at(new THREE.SphereGeometry(.36,32,24),fur,0,1.28,0);
 for(const sx of [-1,1]){at(new THREE.SphereGeometry(.13,20,14),fur,sx*.26,1.56,0);at(new THREE.SphereGeometry(.07,16,12),pink,sx*.26,1.56,.07);at(new THREE.SphereGeometry(.045,14,10),dark,sx*.13,1.36,.31);
  const arm=at(new THREE.SphereGeometry(.14,20,14),fur,sx*.44,.78,.08,[1,1.7,1]);arm.rotation.z=sx*.5;at(new THREE.SphereGeometry(.17,20,14),fur,sx*.22,.2,.18,[1.05,.9,1.35]);}
 at(new THREE.SphereGeometry(.15,20,14),fur,0,1.2,.3,[1.15,.82,.85]);at(new THREE.SphereGeometry(.055,14,10),dark,0,1.25,.43);
 // 실과 손잡이 막대
 rod(s,new THREE.Vector3(0,1.62,0),new THREE.Vector3(0,4.35,0),.012,s.mat({color:'#c9b9e8',roughness:.6}),g).castShadow=false;
 s.rbox(.9,.1,.1,.03,s.phys({color:'#d8a85a',roughness:.5}),0,4.4,0,g).castShadow=false;
 return g;
}
const BEAR={start:-2.6,run:4.2,secs:3};
function bearSet(s){
 s.rbox(60,.2,60,.05,s.phys({color:'#f7eee8',roughness:.95}),0,-.1,4);
 const bg=new THREE.Group();s.scene.add(bg);
 const panel=s.mesh(new THREE.PlaneGeometry(21,5.3),s.mat({map:backdropTexture(s),roughness:.9}),bg,{cast:false});panel.position.set(2.5,2.4,-1.4);
 const bear=buildBear(s);
 const bearArrow=arrow3(s,{color:'#8f9aa3',r:.07}),bgArrow=arrow3(s,{color:'#8f9aa3',r:.09});
 const tags={bgStill:s.label('배경은 정지상태',{size:.45}),bearStill:s.label('인형 정지 상태',{size:.45}),bgMove:s.label('배경을 뒤로 움직임',{size:.45})};
 function pose(method,u){   // u: 0~1 진행
  const m1=method===1;bear.position.set(m1?BEAR.start+BEAR.run*u:BEAR.start+BEAR.run*.25,.02,.4);bg.position.x=m1?0:-BEAR.run*u;
  bearArrow.group.visible=m1;bgArrow.group.visible=!m1;
  if(m1)bearArrow.set(new THREE.Vector3(bear.position.x+.55,.62,.6),new THREE.Vector3(bear.position.x+1.5,.62,.6));
  else bgArrow.set(new THREE.Vector3(3.2,-.05+.3,1.6),new THREE.Vector3(.2,.25,1.6));
  tags.bgStill.visible=m1;tags.bearStill.visible=!m1;tags.bgMove.visible=!m1;
  tags.bgStill.position.set(1.4,3.1,-1.0);tags.bearStill.position.set(bear.position.x,2.4,.6);tags.bgMove.position.set(1.8,.75,1.6);
 }
 return {bear,bg,pose};
}
function mountBear(host,ctx){
 const saved=ctx.load('relative-motion',null)||{};
 const st={method:1,u:0,playing:false,follow:false,seen:new Set(saved.seen||[])};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>곰 인형이 앞으로 움직이는 것처럼 보이게 하기</h3><div class="lab5-tabs"><button type="button" data-method="1">〈방법1〉 배경은 정지 상태, 앞으로 인형을 움직이기</button><button type="button" data-method="2">〈방법2〉 인형은 정지 상태, 배경을 뒤로 움직이기</button></div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 돌려 볼 수 있어요</span></div><div class="lab5-row"><b>움직이기</b><button type="button" data-play>▶ 움직이기</button><button type="button" data-reset>처음으로</button><label class="lab5-check"><input type="checkbox" data-follow> 카메라가 곰 인형을 따라가며 보기</label></div><p class="lab5-book">④ 다른 운동의 예 · ① 차를 타고 갈 때 풍경이 뒤로 가는듯한 느낌이 들 때 · ② 자동차로 다른 옆 차를 지나갈 때 추월을 하면 옆 차가 뒤로 가는 느낌 · ③ 다른 자동차에게 추월을 당하는 경우 내차가 뒤로, 옆 차가 앞으로 가는 느낌</p><p class="lab5-note" role="status"></p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,2.6,12.5],target:[0,1.9,0],fov:32,table:false});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=7;stage.controls.maxDistance=18;
 const set=bearSet(stage),canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 function paintUI(){host.querySelectorAll('[data-method]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.method===st.method));b.classList.toggle('done',st.seen.has(+b.dataset.method));});canvas.dataset.labMethod=String(st.method);canvas.dataset.labSeen=[...st.seen].sort().join(',');canvas.dataset.labFollow=String(st.follow);}
 host.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>{st.method=+b.dataset.method;st.u=0;st.playing=false;paintUI();say(st.method===1?'배경은 그대로 두고 곰 인형을 앞으로 움직여요.':'곰 인형은 그대로 두고 배경을 뒤로 움직여요.');});
 host.querySelector('[data-play]').onclick=()=>{st.u=0;st.playing=true;say('곰 인형이 어느 쪽으로 움직이는 것처럼 보이나요?');};
 host.querySelector('[data-reset]').onclick=()=>{st.u=0;st.playing=false;say('처음 위치로 돌아왔어요.');};
 host.querySelector('[data-follow]').onchange=e=>{st.follow=e.target.checked;paintUI();say(st.follow?'카메라가 곰 인형과 함께 움직여요. 〈방법1〉도 배경이 뒤로 가는 것처럼 보이나요?':'카메라를 제자리에 두었어요.');};
 paintUI();say('〈방법1〉과 〈방법2〉를 각각 ▶ 움직이기로 비교해 보세요.');
 const offset=new THREE.Vector3();
 let disposed=false,raf=0,last=performance.now(),camX=0;
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  if(st.playing&&!document.hidden){st.u=Math.min(1,st.u+dt/BEAR.secs);if(st.u>=1){st.playing=false;st.seen.add(st.method);ctx.save('relative-motion',{seen:[...st.seen]});paintUI();say(st.seen.size>=2?'두 방법 모두 곰 인형이 앞으로 움직이는 것처럼 보여요. 무엇을 기준으로 보느냐에 따라 운동이 다르게 보여요.':(st.method===1?'곰 인형이 앞으로 움직였어요. 이번에는 〈방법2〉도 해 보세요.':'곰 인형은 그대로인데 앞으로 가는 것처럼 보였나요? 〈방법1〉도 해 보세요.'));}}
  set.pose(st.method,st.u);
  const want=st.follow?set.bear.position.x-(BEAR.start+BEAR.run*.25):0;
  offset.copy(stage.camera.position).sub(stage.controls.target);stage.controls.target.x+=want-camX;stage.camera.position.copy(stage.controls.target).add(offset);camX=want;
  canvas.dataset.labBearX=set.bear.position.x.toFixed(2);canvas.dataset.labBgX=set.bg.position.x.toFixed(2);canvas.dataset.labU=st.u.toFixed(2);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── 속력 그래프(55쪽 ②) ─────────────────────────
const GW=1600,GH=1200,GX=x=>260+x*280,GY=y=>1000-y*200;
function speedBoardTexture(s){
 return paint(s,GW,GH,(g)=>{g.fillStyle='#21483b';g.fillRect(0,0,GW,GH);
  g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=3;g.setLineDash([14,12]);for(let i=1;i<=4;i++){g.beginPath();g.moveTo(GX(i),GY(0));g.lineTo(GX(i),GY(4.3));g.stroke();g.beginPath();g.moveTo(GX(0),GY(i));g.lineTo(GX(4.3),GY(i));g.stroke();}
  g.setLineDash([]);g.strokeStyle='#f4f1e6';g.lineWidth=8;g.beginPath();g.moveTo(GX(0),GY(4.5));g.lineTo(GX(0),GY(0));g.lineTo(GX(4.6),GY(0));g.stroke();
  g.fillStyle='#f4f1e6';g.font=`700 52px ${FONT}`;g.textAlign='center';for(let i=1;i<=4;i++)g.fillText(String(i),GX(i),GY(0)+70);g.fillText('0',GX(0)-30,GY(0)+60);
  g.textAlign='right';for(let i=1;i<=4;i++)g.fillText(String(i),GX(0)-26,GY(i)+18);
  g.textAlign='left';g.font=`800 50px ${FONT}`;g.fillText('이동거리(m)',GX(0)-70,90);g.textAlign='right';g.fillText('시간(s)',GW-50,GY(0)+130);});
}
const SPEED_POINTS=[['A',1,1],['B',2,2],['C',3,3],['D',4,4]];
function buildSpeedBoard(s,{x=0,y=4.3,z=-1.3,w=6.2,h=4.65}={}){
 s.rbox(w+.36,h+.36,.3,.1,s.phys({color:'#8a6b3c',roughness:.5}),x,y,z-.17);
 s.mesh(new THREE.PlaneGeometry(w,h),s.mat({map:speedBoardTexture(s),roughness:.9}),s.scene,{cast:false}).position.set(x,y,z);
 const PX=v=>x-w/2+GX(v)/GW*w,PY=v=>y+h/2-GY(v)/GH*h;
 const dotMat=s.phys({color:'#f6b81f',roughness:.3,clearcoat:.7,emissive:'#5a3a00',emissiveIntensity:.4}),dim=s.phys({color:'#6f7a72',roughness:.6});
 const line=s.mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(PX(0),PY(0),z+.06),new THREE.Vector3(PX(4.15),PY(4.15),z+.06)),2,.035,10),s.phys({color:'#e5483d',roughness:.4}),s.scene,{cast:false});
 const dots=SPEED_POINTS.map(([n,t,d])=>{const m=s.mesh(new THREE.SphereGeometry(.13,24,16),dotMat,s.scene,{cast:false});m.position.set(PX(t),PY(d),z+.12);const l=s.label(n,{size:.36});l.position.set(PX(t)-.32,PY(d)+.3,z+.2);return {n,mesh:m,label:l};});
 function show(upto){dots.forEach((d,i)=>{d.mesh.material=i<upto?dotMat:dim;});line.scale.set(1,1,1);}
 return {PX,PY,dots,line,show};
}
export function buildCar(s,color='#e2483d'){
 const g=new THREE.Group();s.scene.add(g);
 const body=s.phys({color,roughness:.35,clearcoat:.7});s.rbox(1.25,.34,.7,.1,body,0,.36,0,g);
 s.rbox(.68,.3,.62,.1,s.phys({color:'#cfe8f5',roughness:.1,clearcoat:1}),-.08,.66,0,g);
 const tire=s.phys({color:'#22262b',roughness:.6}),wg=new THREE.CylinderGeometry(.17,.17,.14,24);s.geometries.add(wg);
 for(const [x,z] of [[-.4,.34],[.4,.34],[-.4,-.34],[.4,-.34]]){const w=new THREE.Mesh(wg,tire);w.rotation.x=Math.PI/2;w.position.set(x,.17,z);w.castShadow=true;g.add(w);}
 return g;
}
const TRACK={x0:-3.2,m:1.6,z:1.6};
function buildTrack(s,{meters=4,unit='m',labelEvery=1,x0=TRACK.x0,m=TRACK.m,z=TRACK.z}={}){
 s.rbox(meters*m+1.6,.12,1.2,.04,s.phys({color:'#bfc4c8',roughness:.7}),x0+meters*m/2,.06,z);
 const tick=s.phys({color:'#ffffff',roughness:.5});
 for(let i=0;i<=meters;i+=labelEvery){s.rbox(.06,.02,1.0,.01,tick,x0+i*m,.13,z);const l=s.label(`${i} ${unit}`,{size:.36});l.position.set(x0+i*m,-.3,z+.75);}
}
function mountSpeedGraph(host,ctx){
 const saved=ctx.load('speed-graph',null)||{};
 const st={t:0,playing:false,done:new Set(saved.done||[]),values:saved.values||{}};
 const rows=SPEED_POINTS.slice(1);
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>그래프를 읽고 B · C · D의 빠르기를 구해 보세요</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 자동차가 그래프처럼 움직여요</span></div><p class="lab5-book">(1) A의 속력은 얼마일까요? · A는 1초 동안 1m 이동했으므로, 속력 = 1m/1s 라면, 1m/s의 빠르기를 가진다.</p><div class="lab5-row"><b>자동차</b><button type="button" data-play>▶ 출발</button><span class="lab5-sum" data-clock></span></div><ol class="lab5-steps">${rows.map(([n,t,d],i)=>{const v=st.values[n]||{};return `<li data-row="${n}" class="${st.done.has(n)?'done':''}"><span>(${i+2}) ${n}의 빠르기</span>이동거리 <input data-d type="number" min="0" step="1" value="${v.d??''}" aria-label="${n} 이동거리 m">m · 걸린 시간 <input data-t type="number" min="0" step="1" value="${v.t??''}" aria-label="${n} 걸린 시간 s">s → 빠르기 <input data-v type="number" min="0" step="0.1" value="${v.v??''}" aria-label="${n} 빠르기 m/s">m/s <button type="button" data-check="${n}">확인</button></li>`;}).join('')}</ol><p class="lab5-note" role="status"></p><p class="lab5-small">자동차는 그래프의 값대로 1초에 1 m씩 움직이는 가상의 모형입니다.</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,3.4,16],target:[0,2.9,0],fov:32});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=8;stage.controls.maxDistance=22;
 const board=buildSpeedBoard(stage),car=buildCar(stage),canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 buildTrack(stage);
 const tag=stage.label('',{size:.42});
 const save=()=>ctx.save('speed-graph',{done:[...st.done],values:st.values});
 const paintUI=()=>{host.querySelectorAll('[data-row]').forEach(li=>li.classList.toggle('done',st.done.has(li.dataset.row)));canvas.dataset.labDone=[...st.done].sort().join(',');};
 host.querySelector('[data-play]').onclick=()=>{st.t=0;st.playing=true;say('자동차가 1초마다 어디에 있는지 그래프의 점과 비교해 보세요.');};
 host.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const n=b.dataset.check,li=b.closest('li'),[,t,d]=SPEED_POINTS.find(p=>p[0]===n);
  const v={d:li.querySelector('[data-d]').value,t:li.querySelector('[data-t]').value,v:li.querySelector('[data-v]').value};st.values[n]=v;
  if(v.d===''||v.t===''||v.v===''){say(`${n}의 이동거리, 걸린 시간, 빠르기를 모두 써 주세요.`);return;}
  const dOk=Number(v.d)===d,tOk=Number(v.t)===t,vOk=Math.abs(Number(v.v)-d/t)<1e-6;
  if(dOk&&tOk&&vOk){st.done.add(n);save();paintUI();say(`${n}는 ${t}초 동안 ${d}m 이동했으므로, 속력 = ${d}m/${t}s, ${d/t}m/s의 빠르기를 가져요.${st.done.size===3?' A·B·C·D 모두 같은 빠르기예요.':''}`);}
  else{st.done.delete(n);save();paintUI();say(!dOk||!tOk?`${n}점에서 아래로 내려가 시간을, 왼쪽으로 가서 이동거리를 읽어 보세요.`:`${n}는 ${t}초 동안 ${d}m 이동했어요. A처럼 계산해 보세요.`);}
 });
 paintUI();say('▶ 출발을 누르고, 그래프에서 B·C·D의 시간과 이동거리를 읽어 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  if(st.playing&&!document.hidden){st.t=Math.min(4,st.t+dt);if(st.t>=4)st.playing=false;}
  car.position.set(TRACK.x0+st.t*TRACK.m,.12,TRACK.z);board.show(Math.floor(st.t+1e-6));
  tag.userData.set(`${st.t.toFixed(1)} s · ${st.t.toFixed(1)} m`);tag.position.set(car.position.x,1.35,TRACK.z);
  host.querySelector('[data-clock]').textContent=`시간 ${st.t.toFixed(1)} s · 이동거리 ${st.t.toFixed(1)} m`;canvas.dataset.labT=st.t.toFixed(2);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── 속력의 단위(56쪽 ③) ─────────────────────────
export const speedUnits=[['m/s','1 m/s','일 미터 퍼 세크','1초당 1m를 이동하는 빠르기','1초','1 m'],['m/m','1 m/m','일 미터 퍼 미닛','1분당 1m를 이동하는 빠르기','1분','1 m'],['km/h','1 km/h','일 킬로미터 퍼 아워','1시간당 1km를 이동하는 빠르기','1시간','1 km']];
// 56쪽 Speed Question 읽기. 교재에는 답이 인쇄돼 있지 않아, 56쪽 표의 읽는 법(미터 퍼 세크 …)으로 읽었는지만 본다.
export const unitReadings=[{q:'(1) 100 m/s',need:['미터퍼세크'],num:['백','100'],not:['킬로','센티']},{q:'(2) 1000 km/h',need:['킬로미터퍼아워'],num:['천','1000'],not:['센티']},{q:'(3) 5 cm/s',need:['센티미터퍼세크'],num:['오','5'],not:['킬로']}];
export function checkUnitReading(i,text){const v=normalize(text),r=unitReadings[i];return r.need.every(w=>v.includes(w))&&r.num.some(n=>v.startsWith(normalize(n)))&&!r.not.some(w=>v.includes(w));}
export function clockFace(s){
 const g=new THREE.Group();s.scene.add(g);
 const face=s.mesh(new THREE.CylinderGeometry(.95,.95,.12,48),[s.phys({color:'#2f6db5'}),s.mat({map:paint(s,512,512,(c,w,h)=>{c.fillStyle='#ffffff';c.beginPath();c.arc(w/2,h/2,w/2,0,Math.PI*2);c.fill();c.strokeStyle='#1b3446';for(let i=0;i<60;i++){const a=i/60*Math.PI*2,r1=i%5?226:206;c.lineWidth=i%5?4:10;c.beginPath();c.moveTo(w/2+Math.sin(a)*r1,h/2-Math.cos(a)*r1);c.lineTo(w/2+Math.sin(a)*244,h/2-Math.cos(a)*244);c.stroke();}}),roughness:.4}),s.phys({color:'#2f6db5'})],g);
 face.rotation.x=Math.PI/2;
 const hand=new THREE.Group();g.add(hand);s.rbox(.07,.78,.05,.02,s.phys({color:'#d13a35'}),0,.36,.1,hand);s.mesh(new THREE.SphereGeometry(.08,16,12),s.phys({color:'#d13a35'}),g).position.z=.1;
 return {group:g,hand};
}
function mountUnits(host,ctx){
 const saved=ctx.load('speed-units',null)||{};
 const st={unit:0,u:0,playing:false,seen:new Set(saved.seen||[]),read:saved.read||['','',''],ok:new Set(saved.ok||[])};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>속력의 단위를 읽고 뜻을 알아보세요</h3><div class="lab5-tabs">${speedUnits.map(([k,u],i)=>`<button type="button" data-unit="${i}">${u}</button>`).join('')}</div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 시계가 한 바퀴 도는 동안 움직인 거리</span></div><p class="lab5-book" data-row></p><div class="lab5-row"><b>움직이기</b><button type="button" data-play>▶ 시계 한 바퀴</button></div><ol class="lab5-steps">${unitReadings.map((r,i)=>`<li data-read="${i}" class="${st.ok.has(i)?'done':''}"><span>${r.q}</span><input data-text type="text" value="${st.read[i]||''}" aria-label="${r.q} 읽기" style="width:12em"></li>`).join('')}</ol><div class="lab5-row"><button type="button" data-check>Speed Question 읽기 확인</button></div><p class="lab5-note" role="status"></p><p class="lab5-small">자동차가 움직이는 모습은 단위의 뜻을 보여 주기 위해 시간을 줄인 것입니다.</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,3.6,14.5],target:[0,1.9,0],fov:32});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=8;stage.controls.maxDistance=20;
 const canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 stage.rbox(9.2,.12,1.2,.04,stage.phys({color:'#bfc4c8',roughness:.7}),0,.06,1.4);
 for(const x of [-3.8,3.8]){rod(stage,new THREE.Vector3(x,0,.85),new THREE.Vector3(x,1.6,.85),.04,stage.phys({color:'#5a6470'}));}
 const flag=stage.mesh(new THREE.PlaneGeometry(.6,.4),stage.phys({color:'#d13a35',side:THREE.DoubleSide}));flag.position.set(4.1,1.4,.85);
 const startTag=stage.label('출발',{size:.4}),endTag=stage.label('',{size:.46});startTag.position.set(-3.8,-.3,2.2);endTag.position.set(3.8,-.3,2.2);
 const car=buildCar(stage,'#2f6db5'),clock=clockFace(stage);clock.group.position.set(0,3.3,-.8);
 const clockTag=stage.label('',{size:.46});clockTag.position.set(0,4.75,-.8);
 const readTag=stage.label('',{size:.5});readTag.position.set(0,2.0,1.4);
 const save=()=>ctx.save('speed-units',{seen:[...st.seen],read:st.read,ok:[...st.ok]});
 function paintUI(){const [,u,read,mean,per,dist]=speedUnits[st.unit];host.querySelectorAll('[data-unit]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.unit===st.unit));b.classList.toggle('done',st.seen.has(+b.dataset.unit));});
  host.querySelector('[data-row]').textContent=`${u} · 읽어보기: ${read} · 뜻: ${mean}`;clockTag.userData.set(`한 바퀴 = ${per}`);endTag.userData.set(dist);readTag.userData.set(`${u} · ${read}`);
  host.querySelectorAll('[data-read]').forEach(li=>li.classList.toggle('done',st.ok.has(+li.dataset.read)));
  canvas.dataset.labUnit=speedUnits[st.unit][0];canvas.dataset.labSeen=[...st.seen].sort().join(',');canvas.dataset.labOk=[...st.ok].sort().join(',');}
 host.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{st.unit=+b.dataset.unit;st.u=0;st.playing=false;paintUI();say(`${speedUnits[st.unit][1]}: ${speedUnits[st.unit][3]}예요. ▶ 시계 한 바퀴를 눌러 보세요.`);});
 host.querySelector('[data-play]').onclick=()=>{st.u=0;st.playing=true;say(`${speedUnits[st.unit][4]} 동안 얼마나 움직이는지 보세요.`);};
 host.querySelector('[data-check]').onclick=()=>{
  host.querySelectorAll('[data-read]').forEach(li=>{const i=+li.dataset.read,v=li.querySelector('[data-text]').value;st.read[i]=v;if(checkUnitReading(i,v))st.ok.add(i);else st.ok.delete(i);});save();paintUI();
  const miss=[0,1,2].find(i=>!st.ok.has(i));
  say(miss==null?'세 가지 모두 표의 읽는 법대로 읽었어요. 숫자를 먼저 읽고, 단위를 ‘… 퍼 …’로 읽어요.':st.read[miss].trim()===''?`${unitReadings[miss].q}를 먼저 읽어 써 보세요.`:miss===2?'(3)의 cm는 ‘센티미터’예요. m/s를 읽는 방법(미터 퍼 세크)을 떠올려 보세요.':`${unitReadings[miss].q}는 숫자를 먼저 읽고, 위의 표처럼 단위를 읽어 보세요.`);};
 paintUI();say('단위를 고르고 ▶ 시계 한 바퀴를 눌러 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  if(st.playing&&!document.hidden){st.u=Math.min(1,st.u+dt/3);if(st.u>=1){st.playing=false;st.seen.add(st.unit);save();paintUI();say(`${speedUnits[st.unit][4]} 동안 ${speedUnits[st.unit][5]}를 이동했어요. ${speedUnits[st.unit][3]}, ${speedUnits[st.unit][1]}예요.`);}}
  car.position.set(-3.8+7.6*st.u,.12,1.4);clock.hand.rotation.z=-st.u*Math.PI*2;canvas.dataset.labU=st.u.toFixed(2);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

export function mountMotion7(kind,host,ctx){
 if(kind==='motion-time')return mountMotionTime(host,ctx);
 if(kind==='position-map')return mountPosition(host,ctx);
 if(kind==='relative-motion')return mountBear(host,ctx);
 if(kind==='speed-graph')return mountSpeedGraph(host,ctx);
 return mountUnits(host,ctx);
}

// ───────────────────────── 정지 그림(투사·인쇄) ─────────────────────────
function motionStill(s,key){
 const c=motionCases[key];buildTimeline(s,c);s.rbox(60,.2,60,.05,s.phys({color:'#eef1ea',roughness:.9}),0,-.1,4);
 const people=motionPeople(s,c.child);people.ghosts.forEach(g=>{g.root.traverse(o=>{if(o.isMesh&&o.material.opacity<1)o.material.opacity=.55;});});
 poseMotion(people,c,c.seconds,true);if(c.move)people.main.setPose('walk',c.seconds*Math.PI*2+.6+Math.PI);
}
function boardRoom(s){
 s.rbox(12,6,.3,.04,s.phys({color:'#efe6d4',roughness:.9}),0,3,-2.4);
 s.rbox(5.4,2.8,.16,.06,s.phys({color:'#8a6b3c',roughness:.5}),-.6,3.2,-2.2);
 s.rbox(5.0,2.4,.1,.04,s.phys({color:'#2c5a46',roughness:.85}),-.6,3.2,-2.1);
 s.rbox(5.0,.1,.3,.02,s.phys({color:'#8a6b3c'}),-.6,1.9,-2.0);
 const t=buildPerson(s,{height:3.0,shirt:'#2d2f36',pants:'#24262c',shoes:'#1b1d22',hair:'#1f1c1a',pose:'point'});t.root.position.set(-1.6,.0,-.2);t.root.rotation.y=.35;
 const a=arrow3(s,{color:'#d13a35',r:.06}),b=arrow3(s,{color:'#d13a35',r:.06});
 a.set(new THREE.Vector3(-.5,.08,-1.2),new THREE.Vector3(-.5,.08,-2.2));b.set(new THREE.Vector3(-.5,.08,-1.2),new THREE.Vector3(-.5,.08,-.2));
 const l=s.label('칠판에서 앞쪽, 1m',{size:.42});l.position.set(1.5,.25,.2);
 callout(s,'칠판',[1.9,4.9,-1.9],[.8,4.1,-2.05],.44);
}
function bearStill(s,method){const set=bearSet(s);set.pose(method,.55);}
function unitsStill(s){
 speedUnits.forEach(([k,u,read,mean,per,dist],i)=>{const z=-2.4+i*2.4;
  s.rbox(8.6,.12,1.1,.04,s.phys({color:'#bfc4c8',roughness:.7}),.6,.06,z);
  for(const x of [-3.2,4.6])rod(s,new THREE.Vector3(x,0,z-.6),new THREE.Vector3(x,1.1,z-.6),.035,s.phys({color:'#5a6470'}));
  const car=buildCar(s,['#e2483d','#2f9a5e','#2f6db5'][i]);car.position.set(3.7,.12,z);
  const l=s.label(`${u} · ${per}당 ${dist}`,{size:.42});l.position.set(-1.0,.32,z+.32);});
}
const l7Stills={
 'l7-stand':{size:[1200,520],stage:{cam:[0,2.9,13.2],target:[0,1.75,0],fov:30,table:false,backdrop:'sky'},build(s){motionStill(s,'stop');}},
 'l7-walk':{size:[1200,520],stage:{cam:[0,2.9,13.2],target:[0,1.75,0],fov:30,table:false,backdrop:'sky'},build(s){motionStill(s,'move');}},
 'l7-q-still':{size:[1200,440],stage:{cam:[0,2.3,14.5],target:[0,1.3,0],fov:28,table:false,backdrop:'sky'},build(s){motionStill(s,'q1');}},
 'l7-q-move':{size:[1200,440],stage:{cam:[0,2.3,14.5],target:[0,1.3,0],fov:28,table:false,backdrop:'sky'},build(s){motionStill(s,'q2');}},
 'l7-position-example':{size:[1200,560],stage:{cam:[0,3.6,12.8],target:[0,1.3,0],fov:32,table:false,backdrop:'sky'},build(s){buildRoadScene(s,'example');}},
 'l7-board':{size:[1000,720],stage:{cam:[7.2,3.6,6.6],target:[-.8,2.0,-1.2],fov:34,table:false},build(s){s.rbox(30,.2,14,.05,s.phys({color:'#c9b38f',roughness:.8}),0,-.1,0);boardRoom(s);}},
 'l7-position-map':{size:[1200,560],stage:{cam:[0,3.6,12.8],target:[0,1.3,0],fov:32,table:false,backdrop:'sky'},build(s){buildRoadScene(s,'map');}},
 'l7-bear-1':{size:[1000,620],stage:{cam:[0,2.6,12.5],target:[.3,1.9,0],fov:32,table:false},build(s){bearStill(s,1);}},
 'l7-bear-2':{size:[1000,620],stage:{cam:[0,2.6,12.5],target:[.3,1.9,0],fov:32,table:false},build(s){bearStill(s,2);}},
 'l7-speed-graph':{size:[1000,780],stage:{cam:[0,4.3,10.6],target:[0,4.25,0],fov:32,table:false},build(s){buildSpeedBoard(s,{y:4.3,z:0});}},
 'l7-speed-track':{size:[1200,480],stage:{cam:[0,2.6,9.6],target:[0,.6,1.4],fov:32},build(s){buildTrack(s);const car=buildCar(s);car.position.set(TRACK.x0+2*TRACK.m,.12,TRACK.z);const l=s.label('2 s · 2 m',{size:.42});l.position.set(car.position.x,1.35,TRACK.z);}},
 'l7-units':{size:[1200,640],stage:{cam:[.6,5.4,10.6],target:[.6,.2,-.2],fov:34},build(s){unitsStill(s);}}
};
export const lesson7StillNames=Object.keys(l7Stills);
export function lesson7StillSize(name){return l7Stills[name].size;}
export function renderLesson7Still(name,host){
 const sc=l7Stills[name];if(!sc)throw new Error('알 수 없는 그림: '+name);
 const stage=createStage(host,{...sc.stage,orbit:false});
 sc.build(stage);stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}
