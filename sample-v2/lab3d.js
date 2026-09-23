import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {SpringMotion,clamp,finite,apparentReading} from './physics.js';

export function mountLab(host, {mode='compare',onChange=()=>{},onPick=()=>{},onRelease=()=>{},onAdjust=()=>{}}={}) {
 const measure=mode==='measure',compress=mode==='compression',plain=measure||compress||mode==='elastic';
 host.innerHTML='<span class="scene-tag">3D 가상 교구 · 관찰 모형</span><span class="scene-hint">'+(mode==='eye'?'눈높이를 바꾼 뒤 눈금을 직접 누르세요':mode==='target'||mode==='elastic'?'고리를 잡아 아래로 당겨 보세요':mode==='compression'?'위쪽 누름판을 잡고 내려 보세요':'손가락 / 마우스로 돌려 볼 수 있어요')+'</span>';
 const canvas=document.createElement('canvas');host.prepend(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#edf3f2');
 const camera=new THREE.PerspectiveCamera(35,1,.1,80);camera.position.set(4,1.6,11.8);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,-.25,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.86;controls.minPolarAngle=Math.PI*.10;
 const hemi=new THREE.HemisphereLight('#ffffff','#8fa6a6',2.1);scene.add(hemi);
 const light=new THREE.DirectionalLight('#fff3df',3.8);light.position.set(3,6,7);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-5;light.shadow.camera.right=5;light.shadow.camera.top=5;light.shadow.camera.bottom=-5;scene.add(light);
 const fill=new THREE.DirectionalLight('#d8ebff',2);fill.position.set(-4,0,3);scene.add(fill);
 const root=new THREE.Group();scene.add(root);
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const mat=(o)=>{const m=new THREE.MeshStandardMaterial(o);materials.add(m);return m;};
 const steel=mat({color:'#7996a7',metalness:.77,roughness:.26});
 const blue=mat({color:'#154962',metalness:.45,roughness:.32});
 const copper=mat({color:'#c39960',metalness:.66,roughness:.27});
 const orange=mat({color:'#d36b4c',metalness:.20,roughness:.38});
 const teal=mat({color:'#237b7c',metalness:.25,roughness:.32});
 const porcelain=mat({color:'#f5f9f7',roughness:.74});
 function mesh(g,m,parent=root){geometries.add(g);let o=new THREE.Mesh(g,m);parent.add(o);o.castShadow=true;o.receiveShadow=true;return o;}
 function box(w,h,d,m,x,y,z,parent=root){let o=mesh(new THREE.BoxGeometry(w,h,d),m,parent);o.position.set(x,y,z);return o;}
 function cyl(r,h,m,x,y,z,parent=root){let o=mesh(new THREE.CylinderGeometry(r,r,h,48),m,parent);o.position.set(x,y,z);return o;}
 function tube(points,r,m,parent=root){let c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(c,64,r,9,false),m,parent);}
 function label(text,x,y,z,{size=.18,color='#173955',width=512}={}){
  let c=document.createElement('canvas');c.width=width;c.height=128;let ctx=c.getContext('2d');ctx.font='600 64px "Noto Sans CJK KR",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,width/2,64);let tex=new THREE.CanvasTexture(c);textures.add(tex);let m=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});materials.add(m);let o=new THREE.Sprite(m);o.scale.set(size*width/128,size,1);o.position.set(x,y,z);root.add(o);return o;
 }
 const floor=mesh(new THREE.PlaneGeometry(200,200),mat({color:'#e6eeeb',roughness:1}),scene);floor.rotation.x=-Math.PI/2;floor.position.y=-3.8;floor.castShadow=false;
 box(3.0,.16,1.6,blue,0,-3.65,-.1);cyl(.10,6.6,steel,-1.0,-.28,-.1);tube([[-1,3,-.1],[-1,3.3,-.1],[-.7,3.35,-.1],[.08,3.35,-.1]],.10,steel);
 const hand=tube([[-.25,2.61,.16],[-.25,2.91,.16],[0,3.08,.16],[.25,2.91,.16],[.25,2.61,.16]],.065,steel);
 const topCap=cyl(.60,.23,blue,0,2.48,.11);
 const bottomCap=cyl(.60,.22,blue,0,-1.28,.11);
 const inner=box(1.12,3.56,.12,porcelain,0,.62,-.12);
 const glassMat=new THREE.MeshPhysicalMaterial({color:'#b4d7df',transparent:true,opacity:.10,metalness:0,roughness:.08,depthWrite:false,side:THREE.DoubleSide});materials.add(glassMat);
 const glass=mesh(new THREE.CylinderGeometry(.6,.6,3.58,64,1,true),glassMat);glass.position.set(0,.61,.1);glass.castShadow=false;
 const knob=cyl(.23,.27,teal,0,2.17,.55);knob.rotation.x=Math.PI/2;
 for(let i=0;i<12;i++){const o=box(.022,.30,.04,steel,Math.cos(i*Math.PI/6)*.20,2.17+Math.sin(i*Math.PI/6)*.20,.70);o.rotation.z=i*Math.PI/6;}
 let moving=new THREE.Group();root.add(moving);
 const y0=measure?1.1:1.2,pitch=measure?.06:.07;
 const rod=box(.052,1.38,.052,steel,-.10,y0-.69,.32,moving);
 const pointer=box(.93,.055,.08,orange,.12,y0-.0275,.38,moving);
 const hook=tube([[-.10,y0-1.37,.32],[-.10,y0-1.58,.32],[.05,y0-1.72,.32],[.21,y0-1.59,.32],[.16,y0-1.48,.32]],.047,steel,moving);
 const weight=new THREE.Group();moving.add(weight);weight.position.set(.04,y0-1.86,.31);
 let weightBody=cyl(.26,.48,copper,0,-.21,0,weight);cyl(.14,.06,steel,0,.075,0,weight);
 let weightHook=tube([[0,.065,0],[0,.17,0],[.10,.21,0],[.13,.14,0]],.02,steel,weight);
 let secondary=mesh(new THREE.BoxGeometry(.5,.37,.28),teal,weight);secondary.position.y=-.23;secondary.visible=false;
 // Helical tube buffer: fixed topology, only vertices/normals move.
 const turns=18,segs=288,radial=8,R=.135,wire=.026;
 const cg=new THREE.BufferGeometry(),pos=new Float32Array((segs+1)*(radial+1)*3),norm=new Float32Array(pos.length),idx=[];
 for(let i=0;i<segs;i++)for(let j=0;j<radial;j++){let a=i*(radial+1)+j,b=a+radial+1;idx.push(a,b,a+1,b,b+1,a+1);}
 cg.setAttribute('position',new THREE.BufferAttribute(pos,3));cg.setAttribute('normal',new THREE.BufferAttribute(norm,3));cg.setIndex(idx);
 const spring=mesh(cg,steel);const axis=compress?0:-.10;
 function springShape(top,bottom){
  const length=top-bottom;
  for(let i=0;i<=segs;i++){const t=i/segs,a=t*2*Math.PI*turns;let tangent=new THREE.Vector3(-R*Math.sin(a),-length/(2*Math.PI*turns),R*Math.cos(a)).normalize(),N=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),B=new THREE.Vector3().crossVectors(tangent,N).normalize();
   for(let j=0;j<=radial;j++){const b=j/radial*Math.PI*2,normal=N.clone().multiplyScalar(Math.cos(b)).addScaledVector(B,Math.sin(b));let k=(i*(radial+1)+j)*3;pos[k]=axis+R*Math.cos(a)+normal.x*wire;pos[k+1]=top-length*t+normal.y*wire;pos[k+2]=.24+R*Math.sin(a)+normal.z*wire;norm[k]=normal.x;norm[k+1]=normal.y;norm[k+2]=normal.z;}
  }
  cg.attributes.position.needsUpdate=true;cg.attributes.normal.needsUpdate=true;cg.computeBoundingSphere();
 }
 const tickGroup=new THREE.Group();root.add(tickGroup);
 const lineMat=new THREE.LineBasicMaterial({color:'#25475d'});materials.add(lineMat);
 const line=(a,b,parent=tickGroup)=>{let g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);geometries.add(g);let o=new THREE.Line(g,lineMat);parent.add(o);return o;};
 const tickLabels=[];
 if(measure){
  inner.scale.x=.50;inner.position.x=.68;inner.position.y=.43;inner.scale.y=1.05;
  for(let i=0;i<=16;i++){let y=2.10-i*.2;line([.48,y,.04],[i%5===0?.97:.81,y,.04]);if(i%1===0)tickLabels.push(label(String(i),1.01,y,.06,{size:.12,width:128}));}
  tickLabels.push(label('cm',.78,2.39,.05,{size:.16,width:200}));
 }else{
  for(let i=0;i<=30;i++){let y=y0-i*pitch;line([.32,y,.04],[i%5===0?.71:.55,y,.04]);if(i%5===0)tickLabels.push(label(String(i),.86,y,.06,{size:.13,width:128}));}
  tickLabels.push(label('N',.51,1.57,.05,{size:.23,width:128}));tickLabels.push(label('MAX 30 N',.25,-1.08,.15,{size:.13,width:390,color:'#b55844'}));
 }
 const transparent=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});materials.add(transparent);
 const scaleHit=mesh(new THREE.PlaneGeometry(.80,measure?3.23:2.14),transparent);scaleHit.position.set(.70,measure?.50:.15,.042);scaleHit.castShadow=false;
 const hookHit=mesh(new THREE.SphereGeometry(.28,16,16),transparent,moving);hookHit.position.set(.07,y0-1.57,.32);hookHit.castShadow=false;
 const capHit=mesh(new THREE.BoxGeometry(.8,.3,.8),transparent);capHit.position.set(0,1.90,.24);capHit.visible=compress;
 const compressBase=cyl(.4,.16,teal,0,-.3,.25);compressBase.visible=compress;
 const compressTop=cyl(.35,.13,teal,0,1.85,.25);compressTop.visible=compress;
 if(plain){glass.visible=false;topCap.visible=false;bottomCap.visible=false;knob.visible=false;}
 if(compress){moving.visible=false;inner.visible=false;tickGroup.visible=false;tickLabels.forEach(x=>x.visible=false);hand.visible=false;}
 const restLine=line([-.53,1.1,.4],[1.1,1.1,.4],root);restLine.visible=measure;
 let restNote=label('원래 길이 5 cm',-1.0,1.08,.4,{size:.12,width:500});restNote.visible=measure;
 const ring=mesh(new THREE.TorusGeometry(.32,.013,6,64),orange,moving);ring.position.copy(hookHit.position);ring.visible=mode==='inquiry'||mode==='compare'||mode==='measure'||mode==='target'||mode==='elastic';ring.castShadow=false;
 const ray=new THREE.Raycaster(),vec=new THREE.Vector2();
 let force=mode==='eye'?20:0,zero=mode==='zero'?4:0,eye='front',motion=new SpringMotion(force),disposed=false,raf,tween=null,drag=null,last=performance.now(),lastPaint=-999,version=0,settledLast=false;
 const home={pos:new THREE.Vector3(4,1.6,11.8),target:new THREE.Vector3(0,-.25,0)};
 const partPositions={handle:new THREE.Vector3(0,2.86,.16),zero:new THREE.Vector3(0,2.17,.55),spring:new THREE.Vector3(-.10,1.65,.24),pointer:new THREE.Vector3(.2,1.2,.38),scale:new THREE.Vector3(.66,.2,.04),hook:new THREE.Vector3(.08,-.4,.32)};
 function animateCamera(position,target,duration=950){tween={from:camera.position.clone(),to:position.clone(),fromTarget:controls.target.clone(),toTarget:target.clone(),start:performance.now(),duration};controls.enabled=false;}
 function focusPart(id){const p=partPositions[id]||partPositions.spring;animateCamera(p.clone().add(new THREE.Vector3(.6,.15,3.2)),p,1000);}
 function resetView(){animateCamera(home.pos,home.target);}
 function setEye(which){eye=which;const py=y0-(force+zero)*pitch;const p=new THREE.Vector3(.59,py,.38);const delta=which==='high'?1.35:which==='low'?-1.35:0;animateCamera(new THREE.Vector3(.59,py+delta,3.2),new THREE.Vector3(.59,py,.05),800);}
 function setForce(v,{instant=false,shape}={}){v=finite(v);if(v<0||v>30)return false;force=v;motion.set(v,instant);if(shape){weightBody.visible=shape!=='case';secondary.visible=shape==='case';weightBody.material=shape==='ball'?orange:copper;}version++;return true;}
 function setZero(v){if(force!==0&&mode!=='inquiry')return false;const old=zero;zero=clamp(finite(v),-6,6);knob.rotation.z=zero*.35;version++;if(old!==zero)onAdjust({force,zero,previous:old});return true;}
 function intersect(e,objects){const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,camera);return ray.intersectObjects(objects,true)[0];}
 function pointOnDragPlane(e){const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,camera);let target=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),-.32),target);}
 function down(e){if(disposed||tween)return;if(mode==='inquiry'){
 const hit=intersect(e,[knob]);if(hit){drag={kind:'zero',id:e.pointerId,startX:e.clientX,zero};canvas.setPointerCapture(e.pointerId);controls.enabled=false;e.preventDefault();return;}
 const tick=intersect(e,[scaleHit]);if(tick){const value=Math.round((y0-tick.point.y)/pitch);if(value>=0&&value<=30)onPick(value,state());}return;
 }if(mode==='zero'){const hit=intersect(e,[knob]);if(hit){drag={kind:'zero',id:e.pointerId,startX:e.clientX,zero};canvas.setPointerCapture(e.pointerId);controls.enabled=false;e.preventDefault();}}else if(['target','elastic','compression'].includes(mode)){
  let hit=intersect(e,[compress?capHit:hookHit]);if(hit){let p=pointOnDragPlane(e);if(!p)return;drag={id:e.pointerId,start:p.y,value:force};canvas.setPointerCapture(e.pointerId);controls.enabled=false;e.preventDefault();}
 }else if(mode==='eye'){
  const hit=intersect(e,[scaleHit]);if(hit){const value=Math.round((y0-hit.point.y)/pitch);if(value>=0&&value<=30){onPick(value,{force,zero,eye,expected:apparentReading({force,zero,cameraY:camera.position.y,cameraZ:camera.position.z}).value});}}
 }}
 function move(e){if(!drag||e.pointerId!==drag.id)return;if(drag.kind==='zero'){setZero(Math.round(clamp(drag.zero+(e.clientX-drag.startX)/18,-6,6)));e.preventDefault();return;}let p=pointOnDragPlane(e);if(!p)return;let v=clamp(drag.value+(drag.start-p.y)/(compress?.04:pitch),0,30);setForce(v,{instant:true});e.preventDefault();}
 function up(e){if(!drag||drag.id!==e.pointerId)return;if(drag.kind==='zero'){drag=null;controls.enabled=true;return;}onRelease(force);drag=null;controls.enabled=mode!=='eye';setForce(0);}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 function projectionOf(position){const p=position.clone().project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};}
 function hookScreen(){return projectionOf(hookHit.getWorldPosition(new THREE.Vector3()));}
 function tickScreen(n){return projectionOf(new THREE.Vector3(.59,y0-n*pitch,.045));}
 function state(){return {force,zero,value:motion.value,reading:force+zero,settled:motion.settled,viewMoving:!!tween,eye,mode,extension:force*.3,totalLength:5+force*.3,expectedEye:apparentReading({force,zero,cameraY:camera.position.y,cameraZ:camera.position.z}).value};}
 function resize(){let r=host.getBoundingClientRect();if(r.width<1||r.height<1)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();controls.update();
 if(mode==='eye')setEye('front');
 let currentVersion=-1;
 function tick(now){if(disposed)return;let dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);
  if(tween){let t=clamp((now-tween.start)/tween.duration,0,1),s=t*t*(3-2*t);camera.position.lerpVectors(tween.from,tween.to,s);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,s);if(t===1){tween=null;controls.enabled=mode!=='eye';}}
  controls.update();let shown=motion.value+zero;
  if(Math.abs(shown-lastPaint)>.0008||version!==currentVersion){
   moving.position.y=-shown*pitch;weight.visible=force>0||Math.abs(motion.value)>.15;
   if(compress){let top=1.85-shown*.04;springShape(top,-.3);compressTop.position.y=top;capHit.position.y=top;}
   else springShape(measure?2.1:2.15,y0-shown*pitch);
   lastPaint=shown;currentVersion=version;onChange(state());
  }
  if(motion.settled!==settledLast){settledLast=motion.settled;onChange(state());}
  renderer.render(scene,camera);raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 return {setForce,setZero,focusPart,resetView,setEye,state,hookScreen,tickScreen,knobScreen:()=>projectionOf(knob.getWorldPosition(new THREE.Vector3())),canvas,
  destroy(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();host.innerHTML='';}
 };
}
