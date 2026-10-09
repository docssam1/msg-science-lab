// 4차시 3D 체험: 수평잡기(막대 저울) · 양팔저울. 눈금·수치는 교재 30~33쪽의 값만 쓰고, 기울기는 무게 × 거리 / 평형 조건으로 정한다.
import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {SpringMotion,clamp,weightSet,isBalanced} from './physics.js';
import {roundedBoxGeometry} from './everyday-objects-3d.js';
import {studioEnvironment} from './lab3d.js';
import {leverAngle} from './graphics.js';
import {weightTargets} from './content.js';

const FONT='"Pretendard Variable","Pretendard","Segoe UI",Roboto,"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif',INK='#1b3446';
const RAD=Math.PI/180;
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

// 공통 무대: 렌더러, 스튜디오 조명, 책상, 자원 정리
function createStage(host,{cam,target,fov=32,orbit=true}={}){
 const canvas=document.createElement('canvas');canvas.className='balance3d-canvas';host.prepend(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(fov,1,.1,80);camera.position.set(...cam);
 let controls=null;
 if(orbit){controls=new OrbitControls(camera,canvas);controls.target.set(...target);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=22;controls.minPolarAngle=Math.PI*.22;controls.maxPolarAngle=Math.PI*.56;controls.minAzimuthAngle=-Math.PI*.3;controls.maxAzimuthAngle=Math.PI*.3;controls.update();}
 else camera.lookAt(...target);
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const canvasTex=(c,srgb=true)=>{const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=aniso;textures.add(t);return t;};
 const env=studioEnvironment(renderer);if(env){textures.add(env);scene.environment=env;scene.environmentIntensity=.62;}
 {const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),g=x.createRadialGradient(256,200,10,256,260,420);g.addColorStop(0,'#fdfefe');g.addColorStop(.5,'#eaf0ef');g.addColorStop(1,'#c9d5d5');x.fillStyle=g;x.fillRect(0,0,512,512);scene.background=canvasTex(c);}
 scene.add(new THREE.HemisphereLight('#ffffff','#b3c1c0',.75));
 const light=new THREE.DirectionalLight('#fff6ea',2.3);light.position.set(3,11,7);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-10,right:10,top:9,bottom:-5,near:1,far:34});light.shadow.bias=-.0004;light.shadow.normalBias=.02;light.shadow.radius=4;scene.add(light);
 const fill=new THREE.DirectionalLight('#dce9ff',.7);fill.position.set(-7,3,5);scene.add(fill);
 const rim=new THREE.DirectionalLight('#ffffff',1.4);rim.position.set(-3,6,-8);scene.add(rim);
 const mat=o=>{const m=new THREE.MeshStandardMaterial(o);materials.add(m);return m;};
 const phys=o=>{const m=new THREE.MeshPhysicalMaterial(o);materials.add(m);return m;};
 const mesh=(g,m,parent=scene,{cast=true,receive=true}={})=>{geometries.add(g);const o=new THREE.Mesh(g,m);o.castShadow=cast;o.receiveShadow=receive;parent.add(o);return o;};
 const rbox=(w,h,d,r,m,x,y,z,parent=scene)=>{const o=mesh(roundedBoxGeometry(w,h,d,r),m,parent);o.position.set(x,y,z);return o;};
 // 책상(윗면 y=0)
 const table=phys({color:'#efe7d6',roughness:.7,clearcoat:.15});
 rbox(44,.5,30,.12,table,0,-.25,-2);scene.fog=new THREE.Fog('#e6ece9',16,42);
 // 글자 카드(항상 정면을 보는 스프라이트)
 function label(text,{size=.5,anchor=.5}={}){
  const m=new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false});materials.add(m);
  const sprite=new THREE.Sprite(m);sprite.renderOrder=10;sprite.center.set(anchor,.5);
  let tex=null;
  sprite.userData.set=(s)=>{
   const S=3,fs=46,c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font=`800 ${fs}px ${FONT}`;const tw=Math.ceil(ctx.measureText(s).width),pad=26,blur=12,W=tw+pad*2,H=fs+28,w=W+blur*2,h=H+blur*2+6;
   c.width=w*S;c.height=h*S;ctx.scale(S,S);ctx.save();ctx.shadowColor='rgba(30,90,140,.24)';ctx.shadowBlur=blur;ctx.shadowOffsetY=4;ctx.fillStyle='#fff';rr(ctx,blur,blur,W,H,H/2);ctx.fill();ctx.restore();
   ctx.lineWidth=2;ctx.strokeStyle='#d3e0e3';rr(ctx,blur+1,blur+1,W-2,H-2,H/2-1);ctx.stroke();ctx.font=`800 ${fs}px ${FONT}`;ctx.fillStyle=INK;ctx.textBaseline='middle';ctx.fillText(s,blur+pad,blur+H/2+2);
   const next=canvasTex(c);if(tex){textures.delete(tex);tex.dispose();}tex=next;m.map=next;m.needsUpdate=true;sprite.scale.set(size*w/H,size*h/H,1);
  };
  sprite.userData.set(text);scene.add(sprite);return sprite;
 }
 function resize(){const r=host.getBoundingClientRect();if(r.width<1||r.height<1)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function dispose(){observer.disconnect();controls?.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove();}
 return {THREE,canvas,renderer,scene,camera,controls,mat,phys,mesh,rbox,label,canvasTex,resize,dispose,geometries,materials};
}

// ───────────────────────── 수평잡기 ─────────────────────────
const PY=1.5,BEAM=9.6;
function beamTextures(stage){
 const wood=(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#f2deb0');gr.addColorStop(1,'#e2c78c');g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalAlpha=.07;g.fillStyle='#7a5a2c';for(let i=0;i<40;i++)g.fillRect(0,Math.random()*H,W,1+Math.random()*2);g.globalAlpha=1;};
 const X=(i,W)=>(i+BEAM/2)/BEAM*W;
 const f=document.createElement('canvas');f.width=2400;f.height=130;{const g=f.getContext('2d');wood(g,2400,130);g.fillStyle='#7a5a2c';g.textAlign='center';g.textBaseline='middle';g.font=`800 56px ${FONT}`;for(let i=-4;i<=4;i++){g.fillRect(X(i,2400)-3,0,6,42);g.fillText(i===0?'O':String(Math.abs(i)),X(i,2400),88);}g.fillRect(0,0,2400,5);}
 const t=document.createElement('canvas');t.width=2400;t.height=275;{const g=t.getContext('2d');wood(g,2400,275);g.strokeStyle='rgba(122,90,44,.5)';g.lineWidth=4;g.beginPath();g.moveTo(0,137);g.lineTo(2400,137);g.stroke();for(let i=-4;i<=4;i++){g.fillStyle='#d13a35';g.beginPath();g.arc(X(i,2400),137,i===0?24:20,0,Math.PI*2);g.fill();g.fillStyle='rgba(122,90,44,.55)';g.fillRect(X(i,2400)-2,30,4,40);g.fillRect(X(i,2400)-2,205,4,40);}}
 return [stage.canvasTex(f),stage.canvasTex(t)];
}
// state: {left:{n,a},right:{n,b}}; held=true면 양끝을 받침대로 받쳐 수평으로 잡고 있는 모습, hideRight=true면 오른쪽 상자를 치운다.
function buildLever(stage,{names=true,held=false}={}){
 const {scene,mat,phys,mesh,rbox,label}=stage;
 const wood=phys({color:'#e8d09a',roughness:.55,clearcoat:.25}),[frontTex,topTex]=beamTextures(stage);
 const frontMat=mat({map:frontTex,roughness:.5}),topMat=mat({map:topTex,roughness:.5});
 const frame=new THREE.Group();frame.position.set(0,PY,0);scene.add(frame);
 const beam=mesh(new THREE.BoxGeometry(BEAM,.5,1.1),[wood,wood,topMat,wood,frontMat,wood],frame);beam.position.y=.25;
 // 받침(삼각기둥)
 const shape=new THREE.Shape();shape.moveTo(-1,0);shape.lineTo(1,0);shape.lineTo(0,PY-.02);shape.closePath();
 const prismGeo=new THREE.ExtrudeGeometry(shape,{depth:1.0,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:3});prismGeo.translate(0,0,-.5);
 const prism=mesh(prismGeo,phys({color:'#5a7184',metalness:.25,roughness:.38,clearcoat:.6}));
 if(held)for(const s of [-1,1]){const post=mesh(new THREE.CylinderGeometry(.13,.13,PY-.04,32),phys({color:'#8fa1ad',metalness:.6,roughness:.3}));post.position.set(s*4.55,(PY-.04)/2,0);}
 const cube=roundedBoxGeometry(.8,.72,.8,.09);stage.geometries.add(cube);
 const leftMat=phys({color:'#ee7f5a',roughness:.35,clearcoat:.6,clearcoatRoughness:.2}),rightMat=phys({color:'#4f8ed0',roughness:.35,clearcoat:.6,clearcoatRoughness:.2});
 const stacks={left:new THREE.Group(),right:new THREE.Group()};frame.add(stacks.left,stacks.right);
 const tags=names?['A','O','B'].map(s=>{const l=label(s,{size:.46});l.userData.s=s;return l;}):[];
 const tops={left:label('',{size:.56}),right:label('',{size:.56})};
 const state={left:{n:1,a:4},right:{n:1,b:4}};
 let tilt=0;
 function apply(next,{labels='formula'}={}){
  Object.assign(state,{left:{...next.left},right:{...next.right}});
  for(const side of ['left','right']){
   const g=stacks[side],n=state[side].n,d=side==='left'?state.left.a:state.right.b,s=side==='left'?-1:1;
   while(g.children.length)g.remove(g.children[0]);
   for(let k=0;k<n;k++){const c=new THREE.Mesh(cube,side==='left'?leftMat:rightMat);c.castShadow=true;c.receiveShadow=true;c.userData.side=side;c.position.set(0,.5+.36+k*.72,0);g.add(c);}
   g.position.x=s*d;
  }
  tags.forEach(t=>{const x=t.userData.s==='A'?-state.left.a:t.userData.s==='B'?state.right.b:0;t.position.set(x,PY-.5,.65);});
  const L=state.left.n*state.left.a,R=state.right.n*state.right.b;
  tops.left.userData.set(labels==='distance'?`a = ${state.left.a}칸`:`왼쪽 ${state.left.n}개 × ${state.left.a}칸 = ${L}`);
  tops.right.userData.set(labels==='distance'?`b = ${state.right.b}칸`:`오른쪽 ${state.right.n}개 × ${state.right.b}칸 = ${R}`);
  return leverAngle(state.left,state.right);
 }
 // 움직이는 위치에 맞춰 이름표를 틀(frame)의 회전 좌표에서 월드 좌표로 옮긴다
 function place(){
  frame.updateMatrixWorld(true);
  tags.forEach(t=>{const p=new THREE.Vector3(t.position.x,-.5,.65);frame.localToWorld(p);t.position.copy(p);});
  tops.left.position.set(-3.1,PY+4.0,0);tops.right.position.set(3.1,PY+4.0,0);
 }
 function setTilt(deg){tilt=deg;frame.rotation.z=-deg*RAD;}
 function localX(pointWorld){return frame.worldToLocal(pointWorld.clone()).x;}
 return {frame,stacks,state,apply,place,setTilt,localX,tops,tags,get tilt(){return tilt;},hide(side){stacks[side].visible=false;},show(side){stacks[side].visible=true;}};
}

function leverCamera(){return {cam:[0,3.2,11.8],target:[0,2.6,0]};}

// 정지 영상(인쇄·투사 도해용): 같은 3D 장면을 한 번만 그린다.
export function renderLeverStill(host,{left,right,tilt='level',held=false,hideRight=false,names=true,labels='distance'}={}){
 const cfg=leverCamera(),stage=createStage(host,{...cfg,orbit:false});
 const lever=buildLever(stage,{names,held});
 const auto=lever.apply({left,right},{labels});
 if(hideRight)lever.hide('right');
 lever.setTilt(tilt==='auto'?auto:tilt==='level'?0:Number(tilt));
 if(!names){lever.tops.left.visible=false;lever.tops.right.visible=false;}
 lever.place();stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}

// 비탈길 오르는 바퀴(교재 34~35쪽): 마주 붙인 깔때기 두 개(쌍뿔)가 넓어지는 V자 비탈길에서 올라가는 것처럼 보이지만 무게중심은 낮아진다.
// path=true면 무게중심이 지나는 길(붉은 선)을 함께 그린다(교사용 답).
export function renderRampStill(host,{path=false}={}){
 const stage=createStage(host,{cam:[-6.4,4.4,9.4],target:[0.2,1.0,0],fov:30,orbit:false});
 const {scene,phys,mat,mesh,label}=stage;
 const X0=-4.2,X1=4.2,S0=1.0,S1=2.9,RISE=.34,R=1.0,H=1.9;
 const sAt=x=>S0+(S1-S0)*(x-X0)/(X1-X0),yAt=x=>.1+RISE*(x-X0)/(X1-X0),rc=x=>R*(1-sAt(x)/(2*H)),cy=x=>yAt(x)+rc(x);
 const railMat=phys({color:'#4f7dbb',roughness:.35,clearcoat:.6}),redMat=phys({color:'#d13a35',roughness:.3,clearcoat:.5});
 for(const s of [-1,1]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(X0,yAt(X0)-.08,s*sAt(X0)/2),new THREE.Vector3(X1,yAt(X1)-.08,s*sAt(X1)/2)]);mesh(new THREE.TubeGeometry(curve,2,.1,16),railMat);}
 // 받침 판(레일 아래를 받치는 쐐기)
 const wedge=new THREE.Shape();wedge.moveTo(X0,0);wedge.lineTo(X1,0);wedge.lineTo(X1,yAt(X1)-.2);wedge.lineTo(X0,yAt(X0)-.2);wedge.closePath();
 const wg=new THREE.ExtrudeGeometry(wedge,{depth:.12,bevelEnabled:false});wg.translate(0,0,-.06);mesh(wg,phys({color:'#d8c9a4',roughness:.6}));
 const coneGeo=new THREE.LatheGeometry([new THREE.Vector2(0,-H),new THREE.Vector2(R,0),new THREE.Vector2(0,H)],64);coneGeo.rotateX(Math.PI/2);stage.geometries.add(coneGeo);
 const wheelMat=phys({color:'#f2c235',roughness:.3,clearcoat:.7,side:THREE.DoubleSide}),dotMat=mat({color:'#1b1f23',roughness:.4});
 for(const x of [-3.2,0,3.2]){const c=new THREE.Mesh(coneGeo,wheelMat);c.castShadow=true;c.receiveShadow=true;c.position.set(x,cy(x),0);c.rotation.y=0;scene.add(c);
  const dot=mesh(new THREE.SphereGeometry(.13,24,16),dotMat);dot.position.set(x,cy(x),0);dot.castShadow=false;}
 if(path){const pts=[];for(let i=0;i<=24;i++){const x=-3.2+6.4*i/24;pts.push(new THREE.Vector3(x,cy(x),.02));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.045,10),redMat);
  const arrow=mesh(new THREE.ConeGeometry(.14,.4,20),redMat);arrow.position.set(3.55,cy(3.55)-.04,.02);arrow.rotation.z=-Math.PI/2-Math.atan2(cy(3.6)-cy(3.2),.4);}
 const tag=label(path?'무게중심은 낮아져요':'● 무게중심',{size:.55});tag.position.set(0.2,3.7,0);
 stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}

function mountLever(host,ctx){
 const saved=ctx.load('lever-state',null);
 const state=saved?.left&&saved?.right?{left:{...saved.left},right:{...saved.right}}:{left:{n:1,a:4},right:{n:1,b:4}};
 const presets=[['교재 ⑤ · 4칸과 4칸',{left:{n:1,a:4},right:{n:1,b:4}}],['교재 ⑥ · 2칸과 4칸',{left:{n:1,a:2},right:{n:1,b:4}}],['교재 ⑦ · 2개×2칸과 1개×4칸',{left:{n:2,a:2},right:{n:1,b:4}}]];
 const rows=[['left','왼쪽 A','n','상자 개수',[1,2,3],'개'],['left','왼쪽 A','a','받침점에서',[1,2,3,4],'칸'],['right','오른쪽 B','n','상자 개수',[1,2,3],'개'],['right','오른쪽 B','b','받침점에서',[1,2,3,4],'칸']];
 host.innerHTML='<div class="lever-activity balance-lab"><h3>같은 무게의 상자를 놓아 수평을 만들어 보세요</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 상자를 끌어 칸을 바꿔 보세요</span></div><p class="lever-formula" role="status"></p><div class="lever-controls"></div><div class="lever-presets"></div><p class="lever-note" role="status"></p></div>';
 const view=host.querySelector('.balance-view'),formula=host.querySelector('.lever-formula'),controls=host.querySelector('.lever-controls'),presetBox=host.querySelector('.lever-presets'),note=host.querySelector('.lever-note');
 let stage;
 try{stage=createStage(view,{...leverCamera()});}catch(e){view.innerHTML='<div class="scene-error"><h3>3D 교구를 열지 못했습니다.</h3><p>이 브라우저의 WebGL 지원을 확인해 주세요.</p></div>';throw e;}
 const lever=buildLever(stage,{names:true});
 const motion=new SpringMotion(0);
 let disposed=false,raf=0,last=performance.now(),drag=null,goal=0;
 const canvas=stage.canvas;
 function refresh(){
  goal=lever.apply(state);motion.set(goal);canvas.dataset.angle=String(goal);canvas.dataset.state=JSON.stringify(state);
  const L=state.left.n*state.left.a,R=state.right.n*state.right.b,sign=L===R?'=':L<R?'<':'>';
  formula.innerHTML=`왼쪽 ${state.left.n}개 × ${state.left.a}칸 = <b>${L}</b> <span class="lever-sign">${sign}</span> 오른쪽 ${state.right.n}개 × ${state.right.b}칸 = <b>${R}</b>`;
  const msg=L===R?'수평이에요! 왼쪽의 무게 × 거리와 오른쪽의 무게 × 거리가 같아요.':L<R?'오른쪽의 무게 × 거리가 더 커서 오른쪽으로 기울어져요.':'왼쪽의 무게 × 거리가 더 커서 왼쪽으로 기울어져요.';
  note.textContent=msg;ctx.status(msg);
  controls.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',String(state[b.dataset.side][b.dataset.field]===+b.dataset.value)));
 }
 function change(mutator){mutator();ctx.save('lever-state',state);refresh();}
 controls.innerHTML=rows.map(([side,name,field,lab,values,unit])=>`<div class="lever-row"><b>${name} · ${lab}</b>${values.map(v=>`<button type="button" data-side="${side}" data-field="${field}" data-value="${v}" aria-pressed="false">${v}${unit}</button>`).join('')}</div>`).join('');
 presetBox.innerHTML=presets.map(([name],i)=>`<button type="button" data-preset="${i}">${name}</button>`).join('');
 controls.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>change(()=>{state[b.dataset.side][b.dataset.field]=+b.dataset.value;}));
 presetBox.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>change(()=>{const p=presets[+b.dataset.preset][1];state.left={...p.left};state.right={...p.right};}));
 // 상자 더미를 끌어서 받침점으로부터의 칸 수를 바꾼다(같은 쪽 안에서 1~4칸).
 const ray=new THREE.Raycaster(),vec=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0);
 const setRay=e=>{const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,stage.camera);};
 canvas.addEventListener('pointerdown',e=>{setRay(e);const hit=ray.intersectObjects([...lever.stacks.left.children,...lever.stacks.right.children],false)[0];if(!hit)return;drag={id:e.pointerId,side:hit.object.userData.side};canvas.setPointerCapture(e.pointerId);stage.controls.enabled=false;canvas.style.cursor='grabbing';e.preventDefault();});
 canvas.addEventListener('pointermove',e=>{
  if(!drag){setRay(e);canvas.style.cursor=ray.intersectObjects([...lever.stacks.left.children,...lever.stacks.right.children],false)[0]?'grab':'';return;}
  if(e.pointerId!==drag.id)return;setRay(e);const p=new THREE.Vector3();if(!ray.ray.intersectPlane(plane,p))return;
  const lx=lever.localX(p),s=drag.side==='left'?-1:1,cell=clamp(Math.round(lx*s),1,4),field=drag.side==='left'?'a':'b';
  if(state[drag.side][field]!==cell)change(()=>{state[drag.side][field]=cell;});
 });
 const up=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;stage.controls.enabled=true;canvas.style.cursor='';};
 canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 refresh();motion.set(goal,true);lever.setTilt(goal);lever.place();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);lever.setTilt(motion.value);lever.place();canvas.dataset.shown=motion.value.toFixed(2);stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);stage.dispose();}};
}

// ───────────────────────── 양팔저울 ─────────────────────────
const WPY=3.7,HALF=3.1,HANG=1.9;
const WEIGHT_LOOK={1:{r:.24,h:.34,color:'#f2c94c'},3:{r:.32,h:.46,color:'#f2a07f'},9:{r:.44,h:.62,color:'#79a8dc'}};
function mountPans(host,ctx){
 const saved=ctx.load('weights-lab',null)||{};
 let target=weightTargets.includes(saved.target)?saved.target:2;const solved=new Set((saved.solved||[]).filter(t=>weightTargets.includes(t)));
 const place={1:'off',3:'off',9:'off'};
 host.innerHTML='<div class="pans-activity balance-lab"><h3>양팔저울이 수평이 되게 추를 올려 보세요</h3><div class="pans-targets"></div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 추를 끌어 접시에 올려 보세요</span></div><div class="pans-weights"></div><p class="pans-note" role="status"></p><p class="pans-progress"></p></div>';
 const view=host.querySelector('.balance-view'),targets=host.querySelector('.pans-targets'),weights=host.querySelector('.pans-weights'),note=host.querySelector('.pans-note'),progress=host.querySelector('.pans-progress');
 let stage;
 try{stage=createStage(view,{cam:[0,4.0,10.2],target:[0,2.35,0]});}catch(e){view.innerHTML='<div class="scene-error"><h3>3D 교구를 열지 못했습니다.</h3><p>이 브라우저의 WebGL 지원을 확인해 주세요.</p></div>';throw e;}
 const {scene,phys,mat,mesh,rbox,label,canvas}=stage;
 const brass=phys({color:'#d3b05a',metalness:.9,roughness:.28,clearcoat:.3}),steel=mat({color:'#d3dade',metalness:1,roughness:.24}),base=phys({color:'#51657a',metalness:.15,roughness:.45,clearcoat:.5});
 rbox(3.6,.3,1.9,.12,base,0,.15,0);
 const column=mesh(new THREE.CylinderGeometry(.14,.18,WPY,40),steel);column.position.set(0,WPY/2,0);
 const frame=new THREE.Group();frame.position.set(0,WPY,0);scene.add(frame);
 const beamMesh=rbox(HALF*2+.5,.18,.36,.06,brass,0,0,0,frame);
 const knob=mesh(new THREE.SphereGeometry(.22,32,24),brass);knob.position.set(0,WPY,.0);
 const needle=mesh(new THREE.ConeGeometry(.07,1.15,20),phys({color:'#d13a35',roughness:.4}),frame,{cast:false});needle.position.set(0,-.62,.2);needle.rotation.z=Math.PI;
 const mark=mesh(new THREE.ConeGeometry(.1,.2,3),phys({color:'#1c8783',roughness:.4}),scene,{cast:false});mark.position.set(0,WPY-1.34,.2);mark.rotation.z=0;
 const trayMat=phys({color:'#d9e3e6',roughness:.5,clearcoat:.3});rbox(5.4,.1,1.5,.05,trayMat,0,.05,2.5);
 // 접시 + 줄
 const panGeo=new THREE.LatheGeometry([[0,-.08],[.7,-.06],[.92,.04],[.98,.13],[.94,.14],[.88,.06],[.68,-.0],[0,-.02]].map(p=>new THREE.Vector2(...p)),48);stage.geometries.add(panGeo);
 const pans={left:new THREE.Group(),right:new THREE.Group()};
 for(const g of Object.values(pans)){const m=new THREE.Mesh(panGeo,mat({color:'#e7edf0',metalness:1,roughness:.22,side:THREE.DoubleSide}));m.scale.set(1.3,1,1.3);m.castShadow=true;m.receiveShadow=true;g.add(m);scene.add(g);}
 const stringGeo=new THREE.CylinderGeometry(.018,.018,1,6);stage.geometries.add(stringGeo);const stringMat=mat({color:'#7d8a93',metalness:.6,roughness:.4});
 const strings={left:[0,1,2].map(()=>{const m=new THREE.Mesh(stringGeo,stringMat);scene.add(m);return m;}),right:[0,1,2].map(()=>{const m=new THREE.Mesh(stringGeo,stringMat);scene.add(m);return m;})};
 const up=new THREE.Vector3(0,1,0);
 function placeString(m,a,b){const d=b.clone().sub(a),len=d.length();m.position.copy(a).addScaledVector(d,.5);m.scale.set(1,len,1);m.quaternion.setFromUnitVectors(up,d.normalize());}
 // 물체와 추
 const tex=(text,color)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,256,256);g.fillStyle='rgba(27,52,70,.9)';g.font=`800 120px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,138);g.font=`800 56px ${FONT}`;g.fillText('g',128,222);return stage.canvasTex(c);};
 const items={};
 for(const w of weightSet){const look=WEIGHT_LOOK[w],geo=new THREE.CylinderGeometry(look.r,look.r*1.06,look.h,48);stage.geometries.add(geo);
  const side=phys({color:look.color,metalness:.55,roughness:.3,clearcoat:.4}),top=mat({map:tex(String(w),look.color),roughness:.4});
  const m=new THREE.Mesh(geo,[side,top,side]);m.castShadow=true;m.receiveShadow=true;m.userData.w=w;scene.add(m);
  m.position.set((w===1?-1.7:w===3?0:1.7),.1+look.h/2,2.5);items[w]={mesh:m,h:look.h,pos:m.position.clone()};}
 const objGeo=roundedBoxGeometry(.82,.8,.82,.1);stage.geometries.add(objGeo);
 const objMat=phys({color:'#cfe3a2',roughness:.4,clearcoat:.5});const object=new THREE.Mesh(objGeo,objMat);object.castShadow=true;scene.add(object);
 const objTag=label('',{size:.5});
 const verdict=label('수평이에요!',{size:.62});verdict.position.set(0,WPY+1.05,0);verdict.visible=false;
 const motion=new SpringMotion(0);
 let disposed=false,raf=0,last=performance.now(),dragging=null,goal=0;
 const sum=a=>a.reduce((x,y)=>x+y,0);
 const sides=()=>({left:weightSet.filter(w=>place[w]==='left'),right:weightSet.filter(w=>place[w]==='right')});
 function slots(side){return side==='left'?[[.55,0],[.2,.78],[.2,-.78]]:[[-.55,0],[.55,0],[0,.8]];}
 function targetFor(w){
  if(place[w]==='off')return items[w].pos.clone().setY(.1+items[w].h/2);
  const {left,right}=sides(),list=place[w]==='left'?left:right,i=list.indexOf(w),[dx,dz]=slots(place[w])[i]||[0,0],pan=pans[place[w]].position;
  return new THREE.Vector3(pan.x+dx,pan.y+.1+items[w].h/2,pan.z+dz);
 }
 function recompute(){
  const {left,right}=sides(),diff=sum(right)-(target+sum(left)),balanced=isBalanced(target,left,right)&&(left.length||right.length);
  goal=clamp(diff*1.3,-8,8);motion.set(goal);canvas.dataset.angle=String(Number(goal.toFixed(2)));canvas.dataset.balanced=String(!!balanced);
  objTag.userData.set(`물체 ${target} g`);
  if(balanced){solved.add(target);ctx.save('weights-lab',{target,solved:[...solved]});}
  targets.innerHTML=weightTargets.map(t=>`<button type="button" data-target="${t}" aria-pressed="${t===target}" class="${solved.has(t)?'done':''}">${t} g${solved.has(t)?' ✓':''}</button>`).join('');
  weights.innerHTML=weightSet.map(w=>`<div class="pans-row"><b>${w} g 추</b>${[['left','왼쪽(물체 쪽)'],['off','쓰지 않음'],['right','오른쪽']].map(([s,l])=>`<button type="button" data-weight="${w}" data-side="${s}" aria-pressed="${place[w]===s}">${l}</button>`).join('')}</div>`).join('');
  progress.textContent=`수평을 찾은 무게 ${solved.size} / ${weightTargets.length}개${solved.size===weightTargets.length?' · 모두 찾았어요!':''}`;
  const text=balanced?`수평이에요! ${[`${target} g`,...left.map(w=>`${w} g`)].join(' + ')} = ${right.map(w=>`${w} g`).join(' + ')}`:diff>0?'오른쪽이 더 무거워요. 추를 옮기거나 바꿔 보세요.':diff<0?'왼쪽이 더 무거워요. 추를 옮기거나 바꿔 보세요.':'추를 접시에 올려 보세요.';
  note.textContent=text;ctx.status(balanced?`${target} g을 달 수 있어요. (${solved.size}/${weightTargets.length})`:text);verdictOn=!!balanced;
  targets.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{target=+b.dataset.target;weightSet.forEach(w=>place[w]='off');ctx.save('weights-lab',{target,solved:[...solved]});recompute();});
  weights.querySelectorAll('[data-weight]').forEach(b=>b.onclick=()=>{place[+b.dataset.weight]=b.dataset.side;recompute();});
 }
 let verdictOn=false;
 // 끌어서 올리기: 놓은 곳에서 가까운 접시로, 멀면 받침 쟁반으로
 const ray=new THREE.Raycaster(),vec=new THREE.Vector2();
 const setRay=e=>{const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,stage.camera);};
 const screenOf=p=>{const q=p.clone().project(stage.camera),r=canvas.getBoundingClientRect();return {x:r.left+(q.x+1)*r.width/2,y:r.top+(1-q.y)*r.height/2};};
 canvas.addEventListener('pointerdown',e=>{setRay(e);const hit=ray.intersectObjects(weightSet.map(w=>items[w].mesh),false)[0];if(!hit)return;const w=hit.object.userData.w;dragging={id:e.pointerId,w,moved:false,start:{x:e.clientX,y:e.clientY},plane:new THREE.Plane(new THREE.Vector3(0,0,1),-hit.object.position.z)};canvas.setPointerCapture(e.pointerId);stage.controls.enabled=false;canvas.style.cursor='grabbing';e.preventDefault();});
 canvas.addEventListener('pointermove',e=>{
  if(!dragging){setRay(e);canvas.style.cursor=ray.intersectObjects(weightSet.map(w=>items[w].mesh),false)[0]?'grab':'';return;}
  if(e.pointerId!==dragging.id)return;if(Math.hypot(e.clientX-dragging.start.x,e.clientY-dragging.start.y)>6)dragging.moved=true;
  setRay(e);const p=new THREE.Vector3();if(ray.ray.intersectPlane(dragging.plane,p))dragging.point=p;
 });
 const release=e=>{
  if(!dragging||dragging.id!==e.pointerId)return;const d=dragging;dragging=null;stage.controls.enabled=true;canvas.style.cursor='';
  if(!d.moved){place[d.w]=place[d.w]==='off'?'right':place[d.w]==='right'?'left':'off';recompute();return;}
  const r=canvas.getBoundingClientRect(),limit=Math.max(90,r.width*.1),pt={x:e.clientX,y:e.clientY};
  const dl=Math.hypot(screenOf(pans.left.position).x-pt.x,screenOf(pans.left.position).y-pt.y),dr=Math.hypot(screenOf(pans.right.position).x-pt.x,screenOf(pans.right.position).y-pt.y);
  place[d.w]=Math.min(dl,dr)<limit*1.6?(dl<dr?'left':'right'):'off';recompute();
 };
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 recompute();motion.set(goal,true);
 const tmp=new THREE.Vector3();
 function tick(now){
  if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);
  const th=-motion.value*RAD;frame.rotation.z=th;
  for(const [side,s] of [['left',-1],['right',1]]){
   const ex=s*HALF*Math.cos(th),ey=WPY+s*HALF*Math.sin(th),pan=pans[side];pan.position.set(ex,ey-HANG,0);
   const top=new THREE.Vector3(ex,ey,0);
   strings[side].forEach((m,i)=>{const a=i*Math.PI*2/3+Math.PI/2;placeString(m,top,new THREE.Vector3(ex+1.15*Math.cos(a),ey-HANG+.1,1.15*Math.sin(a)));});
  }
  const lp=pans.left.position;object.position.set(lp.x-.6,lp.y+.1+.4,lp.z);objTag.position.set(object.position.x,object.position.y+.95,0);
  for(const w of weightSet){const it=items[w];if(dragging?.w===w&&dragging.point){tmp.copy(dragging.point);tmp.y=Math.max(tmp.y,.1+it.h/2);it.mesh.position.lerp(tmp,.55);}else it.mesh.position.lerp(targetFor(w),.22);}
  verdict.visible=verdictOn&&Math.abs(motion.value-goal)<.6;
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);canvas.removeEventListener('pointerup',release);canvas.removeEventListener('pointercancel',release);stage.dispose();}};
}

export function mountBalance(kind,host,ctx){return kind==='lever'?mountLever(host,ctx):mountPans(host,ctx);}
