// 3차시 3D 체험: 중력 방향(22~23쪽), 지구·달 무게(26쪽 ⑤), 60 kg 질량·무게(27쪽 ⑪), 질량-무게 그래프(28쪽 ⑫).
// 수치는 교재의 값만 쓴다(58.8 N→9.8 N, 588 N→98 N, 1 kg→9.8 N, 6 kg→58.8 N). 화면 아래 단추·입력은 예전 체험과 같은 이름을 유지한다.
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {SpringMotion,gradePoints} from './physics.js';
import {roundedBoxGeometry} from './everyday-objects-3d.js';
import {buildPerson} from './figures3d.js';

const UP=new THREE.Vector3(0,1,0);
function rng(seed){let s=seed;return ()=>(s=(s*16807)%2147483647)/2147483647;}
function canvas2d(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
export function earthTexture(stage){
 const [c,g]=canvas2d(1024,512);
 const sea=g.createLinearGradient(0,0,0,512);sea.addColorStop(0,'#24649f');sea.addColorStop(.5,'#3a8fd0');sea.addColorStop(1,'#24649f');g.fillStyle=sea;g.fillRect(0,0,1024,512);
 const r=rng(11);
 for(let k=0;k<8;k++){const cx=r()*1024,cy=120+r()*270,n=16+Math.floor(r()*18);g.fillStyle=['#5da45a','#6fae5f','#7cb46a','#93a35c'][k%4];for(let i=0;i<n;i++){g.beginPath();g.ellipse(cx+(r()-.5)*230,cy+(r()-.5)*130,18+r()*62,12+r()*40,r()*3,0,Math.PI*2);g.fill();}}
 g.fillStyle='rgba(255,255,255,.93)';g.fillRect(0,0,1024,28);g.fillRect(0,484,1024,28);
 return stage.canvasTex(c);
}
export function moonTexture(stage,w=1024,h=512){
 const [c,g]=canvas2d(w,h);g.fillStyle='#a8a8a3';g.fillRect(0,0,w,h);const r=rng(5);
 for(let i=0;i<260;i++){const x=r()*w,y=r()*h,s=3+r()*26;g.fillStyle=`rgba(70,70,68,${.12+r()*.2})`;g.beginPath();g.arc(x,y,s,0,Math.PI*2);g.fill();g.fillStyle=`rgba(235,235,230,${.1+r()*.15})`;g.beginPath();g.arc(x-s*.25,y-s*.25,s*.55,0,Math.PI*2);g.fill();}
 return stage.canvasTex(c);
}
export function grassTexture(stage){
 const [c,g]=canvas2d(512,512);g.fillStyle='#86b765';g.fillRect(0,0,512,512);const r=rng(3);
 for(let i=0;i<2600;i++){g.fillStyle=`rgba(${60+r()*40|0},${120+r()*60|0},${50+r()*30|0},.55)`;g.fillRect(r()*512,r()*512,2,5);}
 const t=stage.canvasTex(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,6);return t;
}
export function arrow(stage,parent,color='#d13a35'){
 const m=stage.phys({color,roughness:.35,clearcoat:.5}),g=new THREE.Group();
 const shaft=stage.mesh(new THREE.CylinderGeometry(.075,.075,.72,20),m,g);shaft.position.y=.36;
 const head=stage.mesh(new THREE.ConeGeometry(.2,.36,24),m,g);head.position.y=.9;
 parent.add(g);return g;
}

// ───────── 중력의 방향(교재 22~23쪽) ─────────
function mountGravity(host,ctx){
 const spots=[{n:1,angle:0,where:'위쪽',dir:'down'},{n:2,angle:270,where:'왼쪽',dir:'right'},{n:3,angle:180,where:'아래쪽',dir:'up'},{n:4,angle:90,where:'오른쪽',dir:'left'}];
 const dirNames={up:'위쪽 ↑',down:'아래쪽 ↓',left:'왼쪽 ←',right:'오른쪽 →'};
 const chosen=ctx.load('gravity-lesson',{});
 host.innerHTML='<div class="gravity-activity balance-lab"><h3>물체를 놓으면 어느 쪽으로 떨어질까요?</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 지구를 돌려 볼 수 있어요</span></div><div class="gravity-picker"></div><p class="gravity-note" role="status"></p></div>';
 const view=host.querySelector('.balance-view'),picker=host.querySelector('.gravity-picker'),note=host.querySelector('.gravity-note');
 const stage=createStage(view,{cam:[0,.3,16.5],target:[0,0,0],table:false,backdrop:'space'});
 const {scene,canvas}=stage;
 const R=2.1,D=3.7,BALL=.34;
 const earth=stage.mesh(new THREE.SphereGeometry(R,64,48),stage.mat({map:earthTexture(stage),roughness:.75}));
 stage.mesh(new THREE.SphereGeometry(R*1.05,48,32),stage.mat({color:'#8fd0ff',transparent:true,opacity:.14,side:THREE.BackSide,depthWrite:false}),scene,{cast:false,receive:false});
 const colors=['#f2c94c','#ee7f5a','#5ea9e6','#9b7ad8'];
 const items=spots.map((s,i)=>{
  const dirOut=new THREE.Vector3(Math.sin(s.angle*Math.PI/180),Math.cos(s.angle*Math.PI/180),0);
  const ball=stage.mesh(new THREE.SphereGeometry(BALL,40,28),stage.phys({color:colors[i],roughness:.35,clearcoat:.6}));
  const tag=stage.label(`${s.n}번`,{size:.6});
  const arr=arrow(stage,scene);arr.visible=false;
  return {...s,dirOut,ball,tag,arr,d:D,shake:0};
 });
 const done=()=>spots.filter(s=>chosen[s.n]===s.dir).length;
 function sync(){
  items.forEach(it=>{it.arr.visible=chosen[it.n]===it.dir;});
  canvas.dataset.arrows=String(done());
  picker.innerHTML=spots.map(s=>`<div class="gravity-row"><b>${s.n}번 (그림의 ${s.where})</b>${Object.entries(dirNames).map(([d,label])=>`<button data-spot="${s.n}" data-dir="${d}" aria-pressed="${chosen[s.n]===d}" class="${chosen[s.n]===s.dir&&chosen[s.n]===d?'selected':''}">${label}</button>`).join('')}</div>`).join('');
  picker.querySelectorAll('[data-spot]').forEach(b=>b.onclick=()=>{const s=spots.find(x=>x.n===+b.dataset.spot);chosen[s.n]=b.dataset.dir;ctx.save('gravity-lesson',chosen);
   const it=items.find(x=>x.n===s.n);
   if(chosen[s.n]===s.dir)note.textContent=done()===4?'네 위치 모두 지구 중심 쪽으로 떨어져요. 중력은 지구 중심을 향합니다.':`${s.n}번은 지구 중심 쪽이에요. 다른 위치도 확인해 볼까요?`;
   else{note.textContent=`${s.n}번에서 지구 중심은 어느 쪽에 있나요? 물체를 놓으면 지구가 끌어당기는 쪽으로 떨어져요.`;it.shake=1;}
   ctx.status(`${done()}/4 위치를 맞혔어요.`);sync();});
 }
 sync();
 let raf=0,last=performance.now(),disposed=false;
 function tick(now){
  if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  earth.rotation.y+=dt*.12;
  items.forEach(it=>{
   const target=chosen[it.n]===it.dir?R+BALL:D;it.d+=(target-it.d)*Math.min(1,dt*4);
   const jitter=it.shake>0?Math.sin(now/30)*.12*it.shake:0;it.shake=Math.max(0,it.shake-dt*1.6);
   const p=it.dirOut.clone().multiplyScalar(it.d);p.x+=jitter*Math.abs(it.dirOut.y);p.y+=jitter*Math.abs(it.dirOut.x);
   it.ball.position.copy(p);
   const side=new THREE.Vector3(-it.dirOut.y,it.dirOut.x,0).multiplyScalar(.62);it.tag.position.copy(p).add(side).add(new THREE.Vector3(0,0,.4));
   const inward=it.dirOut.clone().negate();it.arr.position.copy(it.dirOut.clone().multiplyScalar(D+1.15));it.arr.quaternion.setFromUnitVectors(UP,inward);
  });
  stage.controls.update();stage.renderer.render(scene,stage.camera);raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────── 지구·달에서 무게(26쪽 ⑤) / 60 kg인 사람(27쪽 ⑪) ─────────
export function helixGeometry(len,turns=11,radius=.2){
 const pts=[];const n=turns*24;for(let i=0;i<=n;i++){const t=i/n,a=t*turns*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*radius,-t*len,Math.sin(a)*radius));}
 return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n,.035,8,false);
}
export function displayTexture(stage,text,{w=512,h=192,bg='#15232b',fg='#7cf2a6'}={}){
 const [c,g]=canvas2d(w,h);g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;g.font=`800 ${h*.52}px "Pretendard Variable","Segoe UI","Malgun Gothic",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+6);return stage.canvasTex(c);
}
function mountWeigh(kind,host,ctx){
 const mass=kind==='weight-mass';
 const data=mass?{subject:'60 kg인 사람',rows:[['지구',588],['달',98]],unit:'N'}:{subject:'같은 물체',rows:[['지구',58.8],['달',9.8]],unit:'N'};
 let place=ctx.load(kind+'-place','earth');const answers=ctx.load(kind+'-answers',{});
 host.innerHTML=`<div class="weight-activity balance-lab"><h3></h3><div class="place-picker"><button data-place="earth">지구</button><button data-place="moon">달</button></div><div class="weight-read"></div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 돌려 볼 수 있어요</span></div><p class="weight-hint"></p>${mass?'<div class="weight-quiz"><p>달로 가면 <b>질량</b>은 어떻게 될까요?</p><button data-q="mass" data-a="same">그대로예요</button><button data-q="mass" data-a="diff">달라져요</button><p>달로 가면 <b>무게</b>는 어떻게 될까요?</p><button data-q="weight" data-a="same">그대로예요</button><button data-q="weight" data-a="diff">달라져요</button><p class="weight-feedback" role="status"></p></div>':''}</div>`;
 const root=host.firstElementChild,view=root.querySelector('.balance-view');
 const stage=createStage(view,{cam:mass?[1.9,2.5,7.8]:[1.8,3.0,10.4],target:mass?[0,1.7,0]:[0,2.4,0],table:false,backdrop:'sky'});
 const {scene,canvas}=stage;
 const skyCanvas=backdrop=>{const [c,g]=canvas2d(512,512);if(backdrop==='moon'){const gr=g.createRadialGradient(256,240,10,256,256,420);gr.addColorStop(0,'#1d3550');gr.addColorStop(1,'#060b16');g.fillStyle=gr;g.fillRect(0,0,512,512);const r=rng(9);for(let i=0;i<240;i++){g.fillStyle=`rgba(255,255,255,${.3+r()*.6})`;g.beginPath();g.arc(r()*512,r()*512,r()*1.3+.3,0,Math.PI*2);g.fill();}}else{const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#7fb6e6');gr.addColorStop(.62,'#d8ecf7');gr.addColorStop(1,'#eef5f2');g.fillStyle=gr;g.fillRect(0,0,512,512);}return c;};
 const grass=stage.mat({map:grassTexture(stage),roughness:.95}),moonMat=stage.mat({map:moonTexture(stage),roughness:.95});
 const ground=stage.mesh(new THREE.CylinderGeometry(11,11,.4,72),grass);ground.position.y=-.2;
 const earthInSky=stage.mesh(new THREE.SphereGeometry(1.1,48,32),stage.mat({map:earthTexture(stage),roughness:.7}),scene,{cast:false,receive:false});earthInSky.position.set(-6,6.4,-12);
 const steel=stage.mat({color:'#d3dade',metalness:1,roughness:.24}),dark=stage.phys({color:'#2f4656',roughness:.4,clearcoat:.5});
 const motion=new SpringMotion(data.rows[0][1]);
 let springMesh=null,springLen=-1,display=null,displayText='';
 const reading=stage.label('',{size:.62});
 const parts={};
 if(!mass){
  stage.rbox(2.4,.22,1.4,.08,dark,-.3,.11,0);
  stage.mesh(new THREE.CylinderGeometry(.09,.09,4.6,24),steel).position.set(-1.2,2.5,0);
  stage.rbox(1.9,.16,.2,.05,steel,-.35,4.75,0);
  const body=stage.mesh(new THREE.CylinderGeometry(.24,.24,1.0,32),stage.phys({color:'#1c8783',roughness:.35,clearcoat:.6}));body.position.set(.4,4.15,0);
  stage.mesh(new THREE.CylinderGeometry(.03,.03,.28,10),steel).position.set(.4,4.78,0);
  parts.box=stage.rbox(.9,.8,.9,.1,stage.phys({color:'#c99a5b',roughness:.5,clearcoat:.3}),.4,1.2,0);
  parts.hook=stage.mesh(new THREE.TorusGeometry(.1,.025,10,24),steel);
 }else{
  const scale=stage.rbox(1.9,.24,1.5,.12,stage.phys({color:'#eef2f3',roughness:.35,clearcoat:.6}),0,.12,0);
  display=stage.mesh(new THREE.PlaneGeometry(.9,.32),stage.mat({map:displayTexture(stage,''),roughness:.4}),scene,{cast:false});display.rotation.x=-Math.PI/2;display.position.set(0,.245,.45);
  const person=buildPerson(stage,{height:3.0,shirt:'#3a6ea5',pants:'#2b3a4a',hair:'#3a2a1e'});person.root.position.set(0,.24,-.1);
  parts.massTag=stage.label('질량 60 kg',{size:.55});parts.massTag.position.set(0,3.6,0);
 }
 function updateSpring(n){
  if(mass)return;
  const len=.5+1.6*(n/58.8);if(Math.abs(len-springLen)<.002)return;springLen=len;
  if(springMesh){scene.remove(springMesh);springMesh.geometry.dispose();}
  springMesh=new THREE.Mesh(helixGeometry(len),steel);springMesh.castShadow=true;springMesh.position.set(.4,3.62,0);scene.add(springMesh);
  parts.hook.position.set(.4,3.62-len-.08,0);parts.box.position.set(.4,3.62-len-.62,0);
  reading.position.set(1.55,3.5,0);
 }
 function showReading(text){
  if(text===displayText)return;displayText=text;reading.userData.set(text);
  if(display){const old=display.material.map;display.material.map=displayTexture(stage,text);display.material.needsUpdate=true;old?.dispose();}
  if(mass)reading.position.set(1.7,1.0,.6);
 }
 function draw(){
  const idx=place==='earth'?0:1,[name,value]=data.rows[idx];
  root.querySelector('h3').textContent=`${data.subject}를 ${name}에서 재면?`;
  root.querySelectorAll('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.place===place)));
  root.querySelector('.weight-read').innerHTML=`<b>${name}에서의 무게 ${value} ${data.unit}</b>${mass?'<b class="mass-fixed">질량 60 kg</b>':''}`;
  root.querySelector('.weight-hint').textContent=place==='moon'?'달에서 중력은 지구 중력의 1/6배라서 무게도 지구의 1/6배가 돼요.':'먼저 지구에서의 값을 읽고, 달로 바꾸어 비교해 보세요.';
  ground.material=place==='moon'?moonMat:grass;earthInSky.visible=place==='moon';stage.setBackground(skyCanvas(place));
  motion.set(value);canvas.dataset.place=place;canvas.dataset.value=String(value);
  if(mass){const fb=root.querySelector('.weight-feedback');fb.textContent=answers.msg||'';}
 }
 root.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{place=b.dataset.place;ctx.save(kind+'-place',place);draw();ctx.status(place==='moon'?'달에서의 값과 지구의 값을 비교해 보세요.':'지구에서의 값을 읽어 보세요.');});
 root.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const q=b.dataset.q,a=b.dataset.a;const ok=q==='mass'?a==='same':a==='diff';
  answers.msg=ok?(q==='mass'?'맞아요. 질량은 어느 곳에서나 같아요. (교재 27쪽)':'맞아요. 같은 사람의 무게는 달에서 지구의 1/6로 줄어요. (교재 27쪽 표)'):(q==='mass'?'질량은 장소에 따라 변하지 않는 물체의 고유한 양이에요. 다시 생각해 볼까요?':'무게는 물체에 작용하는 중력의 크기예요. 달의 중력은 어떤가요?');
  ctx.save(kind+'-answers',answers);root.querySelector('.weight-feedback').textContent=answers.msg;});
 motion.set(data.rows[place==='earth'?0:1][1],true);draw();
 let raf=0,last=performance.now(),disposed=false;
 function tick(now){
  if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);
  const n=Math.max(0,motion.value);updateSpring(n);
  const target=data.rows[place==='earth'?0:1][1];showReading(`${motion.settled||Math.abs(n-target)<target*.01?target:Math.round(n*10)/10} N`);
  earthInSky.rotation.y+=dt*.1;
  stage.controls.update();stage.renderer.render(scene,stage.camera);raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);if(springMesh)springMesh.geometry.dispose();stage.dispose();}};
}

// ───────── 질량-무게 그래프(28쪽 ⑫) ─────────
export function boardTexture(stage){
 const W=1600,H=1200,[c,g]=canvas2d(W,H);g.fillStyle='#21483b';g.fillRect(0,0,W,H);
 const X=x=>220+x*200,Y=y=>1040-y*15.5;
 g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=3;g.setLineDash([14,12]);
 for(let x=1;x<=6;x++){g.beginPath();g.moveTo(X(x),Y(0));g.lineTo(X(x),Y(62));g.stroke();}
 for(let y=10;y<=60;y+=10){g.beginPath();g.moveTo(X(0),Y(y));g.lineTo(X(6.3),Y(y));g.stroke();}
 g.setLineDash([]);g.strokeStyle='#f4f1e6';g.lineWidth=8;g.beginPath();g.moveTo(X(0),Y(64));g.lineTo(X(0),Y(0));g.lineTo(X(6.5),Y(0));g.stroke();
 g.fillStyle='#f4f1e6';g.font='700 46px "Pretendard Variable","Segoe UI","Malgun Gothic",sans-serif';g.textAlign='center';
 for(let x=0;x<=6;x++)g.fillText(String(x),X(x),Y(0)+62);
 g.textAlign='right';for(let y=10;y<=60;y+=10)g.fillText(String(y),X(0)-20,Y(y)+16);
 g.textAlign='left';g.font='800 50px "Pretendard Variable","Segoe UI","Malgun Gothic",sans-serif';g.fillText('무게 (N)',X(0)-40,70);g.textAlign='right';g.fillText('질량 (kg)',W-60,Y(0)+130);
 return stage.canvasTex(c);
}
function mountGraph(host,ctx){
 const expected=[[1,9.8],[6,58.8]],key='mass-weight-graph';
 let points=ctx.load(key,[]);let linked=false;
 host.innerHTML='<div class="graph3d-lab balance-lab"><div class="balance-view"><span class="scene-tag">3D 가상 칠판 · 점은 오른쪽에서 찍어요</span></div><div class="graph-copy"></div></div>';
 const view=host.querySelector('.balance-view'),side=host.querySelector('.graph-copy');
 side.innerHTML=`<b>본문 27쪽의 값</b><table><tr><th>질량 kg</th><th>무게 N</th></tr>${expected.map(([x,y])=>`<tr><td>${x}</td><td>${y}</td></tr>`).join('')}</table><p>가로축은 질량(kg), 세로축은 <b>무게(N)</b>입니다.</p><label>kg <select data-x aria-label="질량 kg"><option>1</option><option>6</option></select></label><label>N <input data-y type="number" min="0" max="60" step="0.1" value="9.8" aria-label="무게 N"></label><button data-add>점 찍기</button><button data-check class="selected">그래프 제출 · 확인</button><button data-clear>이 그래프 다시 그리기</button><p>교재의 값을 하나씩 점으로 옮겨 보세요.</p>`;
 const stage=createStage(view,{cam:[-.6,3.4,17.6],target:[-.4,3.0,0]});
 const {scene,canvas}=stage;
 const BW=8,BH=6,BX=1.0,BY=3.4;
 stage.rbox(BW+.4,BH+.4,.3,.1,stage.phys({color:'#8a6b3c',roughness:.5}),BX,BY,-.2);
 stage.mesh(new THREE.PlaneGeometry(BW,BH),stage.mat({map:boardTexture(stage),roughness:.9}),scene,{cast:false}).position.set(BX,BY,-.03);
 stage.mesh(new THREE.CylinderGeometry(.08,.08,4.6,16),stage.mat({color:'#5c4a2e'})).position.set(BX-2.8,1.1,-.4);
 stage.mesh(new THREE.CylinderGeometry(.08,.08,4.6,16),stage.mat({color:'#5c4a2e'})).position.set(BX+2.8,1.1,-.4);
 // 칠판 좌표(교재 축): x 0~6.5 kg, y 0~64 N → 판 위 위치
 const PX=x=>BX-BW/2+(220+x*200)/1600*BW,PY=y=>BY+BH/2-(1040-y*15.5)/1200*BH;
 const dotMat=stage.phys({color:'#ff6a4d',roughness:.3,clearcoat:.7,emissive:'#5a1a10'});
 const dots=new THREE.Group();scene.add(dots);const dotGeo=new THREE.SphereGeometry(.16,24,16);stage.geometries.add(dotGeo);
 let line=null;
 // 왼쪽: 1 kg 상자를 올린 저울(마지막에 찍은 점의 질량만큼 쌓고, 입력한 무게를 표시)
 stage.rbox(1.8,.3,1.4,.1,stage.phys({color:'#eef2f3',roughness:.35,clearcoat:.6}),-4.7,.15,.6);
 const cubeGeo=roundedBoxGeometry(.62,.42,.62,.06);stage.geometries.add(cubeGeo);
 const cubeMat=stage.phys({color:'#c99a5b',roughness:.45,clearcoat:.4});
 const stack=new THREE.Group();scene.add(stack);
 const scaleTag=stage.label('',{size:.5});scaleTag.position.set(-4.7,3.6,.6);
 const tags=[];
 function draw(){
  while(dots.children.length){const d=dots.children[0];dots.remove(d);}
  tags.forEach(t=>{scene.remove(t);t.material.map?.dispose();t.material.dispose();});tags.length=0;
  const sorted=points.slice().sort((a,b)=>a[0]-b[0]);
  for(const [x,y] of sorted){const s=new THREE.Mesh(dotGeo,dotMat);s.castShadow=true;s.position.set(PX(x),PY(y),.14);dots.add(s);const t=stage.label(`(${x}, ${y})`,{size:.36});t.position.set(PX(x)+.75,PY(y)+.32,.2);tags.push(t);}
  if(line){scene.remove(line);line.geometry.dispose();line=null;}
  if(linked){line=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(PX(0),PY(0),.1),new THREE.Vector3(PX(6.3),PY(6.3*9.8),.1)),2,.05,10),dotMat);scene.add(line);}
  const lastPoint=points.at(-1);
  while(stack.children.length)stack.remove(stack.children[0]);
  const n=lastPoint?lastPoint[0]:0;for(let i=0;i<n;i++){const c=new THREE.Mesh(cubeGeo,cubeMat);c.castShadow=true;c.position.set(-4.7,.3+.21+i*.44,.6);stack.add(c);}
  scaleTag.userData.set(lastPoint?`${lastPoint[0]} kg → ${lastPoint[1]} N`:'1 kg 상자를 올려요');scaleTag.position.set(-4.7,Math.max(1.4,.6+n*.44+.6),.6);
  canvas.dataset.points=JSON.stringify(sorted);canvas.dataset.linked=String(linked);
 }
 function setPoint(x,y){if(![1,6].includes(x)||!Number.isFinite(y)||y<0||y>60){ctx.status('질량은 1 kg 또는 6 kg, 무게는 0~60 N 안에서 골라 주세요.');return;}points=points.filter(p=>p[0]!==x);points.push([x,Math.round(y*10)/10]);linked=false;ctx.save(key,points);draw();ctx.status(`${x} kg, ${y} N에 점을 찍었습니다. (${points.length}/2)`);}
 side.querySelector('[data-add]').onclick=()=>setPoint(+side.querySelector('[data-x]').value,+side.querySelector('[data-y]').value);
 side.querySelector('[data-check]').onclick=()=>{const ok=gradePoints(points,expected);linked=ok;ctx.save(key+'-result',{correct:ok,points});draw();ctx.status(ok?'두 점이 교재의 값과 같아요. 원점과 이은 선이 곧은 선이면 질량과 무게는 비례 관계예요.':'아직 교재의 값과 다른 점이 있어요. 질량 1 kg과 6 kg의 무게를 다시 읽어 보세요.');};
 side.querySelector('[data-clear]').onclick=()=>{points=[];linked=false;ctx.save(key,points);draw();ctx.status('점을 지웠습니다.');};
 draw();
 let raf=0,disposed=false;
 function tick(){if(disposed)return;stage.controls.update();stage.renderer.render(scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);if(line)line.geometry.dispose();stage.dispose();}};
}

export function mountLesson3(kind,host,ctx){
 if(kind==='gravity')return mountGravity(host,ctx);
 if(kind==='mass-weight-graph')return mountGraph(host,ctx);
 return mountWeigh(kind,host,ctx);
}
