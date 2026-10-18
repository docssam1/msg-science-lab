// 8차시 3D 교구: 교통안전표지판(교재 58쪽) · 하이퍼튜브(59~60쪽) · A에서 B까지 가는 경로(61쪽 ①) · 민정이의 자전거(62쪽 Speed Question).
// 표지판의 이름과 기사 문장은 교재 그대로 쓴다. 경로 길이·자전거·캡슐의 움직임은 체험을 위한 가상의 모습이다.
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {buildPerson} from './figures3d.js';
import {FONT,paint,fail,rod,placeRod,callout,arrow3,dimension,clockFace} from './motion7.js';

const UP=new THREE.Vector3(0,1,0);

// ───────────────────────── 교통안전표지판(58쪽) ─────────────────────────
// [이름(교재 표기), 모양, 그림]. 순서는 교재 표의 순서(4줄 × 6칸)다.
export const trafficSigns=[
 ['통행금지','circle','text-x:통행금지'],['자동차 통행금지','circle','car'],['화물자동차 통행금지','circle','truck'],['승합자동차 통행금지','circle','bus'],['이륜자동차 및 원동기장치자전거 통행금지','circle','moto'],['자동차, 이륜자동차 및 원동기장치자전거 통행금지','circle','car-moto'],
 ['트랙터, 경운기 및 손수레 통행금지','circle','tractor'],['자전거 통행금지','circle','bike'],['진입금지','circle','no-entry'],['직진금지','circle','straight'],['우회전금지','circle','right'],['좌회전금지','circle','left'],
 ['유턴금지','circle','uturn'],['앞지르기(추월)금지','circle','overtake'],['주정차금지','circle','blue-x:주정차금지'],['주차금지','circle','blue-slash:주 차 금 지'],['차중량제한','circle','num:5.5t'],['차높이제한','circle','height'],
 ['차폭제한','circle','width'],['차간거리확보','circle','gap'],['최고속도제한','circle','num:50'],['최저속도제한','circle','min:30'],['서행','tri','slow'],['일시정지','oct','stop']
];
// 속력과 관계있는 표지판(체험의 찾기 활동 — 교재 분류가 아니라 이 차시의 편집 보완 활동)
export const speedSigns=['차간거리확보','최고속도제한','최저속도제한','서행','일시정지'];
const RED='#d6262b',INK='#15181c';
function drawVehicle(g,kind,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=INK;g.strokeStyle=INK;
 const wheel=(wx,wy,r)=>{g.fillStyle=INK;g.beginPath();g.arc(wx,wy,r,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(wx,wy,r*.4,0,7);g.fill();g.fillStyle=INK;};
 if(kind==='car'){g.beginPath();g.roundRect(-95,-10,190,52,14);g.fill();g.beginPath();g.moveTo(-58,-10);g.lineTo(-38,-52);g.lineTo(40,-52);g.lineTo(62,-10);g.fill();g.fillStyle='#fff';g.fillRect(-30,-44,28,28);g.fillRect(6,-44,30,28);wheel(-52,44,20);wheel(52,44,20);}
 if(kind==='truck'){g.fillRect(-100,-50,120,80);g.beginPath();g.moveTo(26,-30);g.lineTo(70,-30);g.lineTo(100,0);g.lineTo(100,30);g.lineTo(26,30);g.fill();g.fillStyle='#fff';g.fillRect(40,-22,32,22);wheel(-70,40,20);wheel(-25,40,20);wheel(70,40,20);}
 if(kind==='bus'){g.beginPath();g.roundRect(-110,-48,220,82,16);g.fill();g.fillStyle='#fff';for(let i=0;i<5;i++)g.fillRect(-95+i*40,-36,30,28);g.fillRect(-100,4,200,6);wheel(-65,38,20);wheel(65,38,20);}
 if(kind==='moto'){g.lineWidth=12;g.beginPath();g.arc(-55,30,30,0,7);g.stroke();g.beginPath();g.arc(60,30,30,0,7);g.stroke();g.beginPath();g.moveTo(-55,30);g.lineTo(-10,-10);g.lineTo(40,-10);g.lineTo(60,30);g.stroke();g.beginPath();g.arc(0,-80,18,0,7);g.fill();g.beginPath();g.moveTo(-5,-62);g.lineTo(-15,-12);g.lineTo(25,-12);g.lineTo(35,-40);g.stroke();}
 if(kind==='bike'){g.lineWidth=11;g.beginPath();g.arc(-60,25,38,0,7);g.stroke();g.beginPath();g.arc(60,25,38,0,7);g.stroke();g.beginPath();g.moveTo(-60,25);g.lineTo(-15,-35);g.lineTo(40,-35);g.lineTo(60,25);g.moveTo(-15,-35);g.lineTo(5,25);g.lineTo(-60,25);g.moveTo(40,-35);g.lineTo(35,-58);g.lineTo(55,-58);g.moveTo(-25,-48);g.lineTo(0,-48);g.stroke();}
 if(kind==='tractor'){g.beginPath();g.arc(-50,20,40,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-50,20,15,0,7);g.fill();g.fillStyle=INK;g.fillRect(-60,-55,60,50);g.fillRect(-10,-20,70,30);g.beginPath();g.arc(45,32,22,0,7);g.fill();g.lineWidth=8;g.beginPath();g.moveTo(80,-20);g.lineTo(130,-20);g.stroke();g.fillRect(85,-30,40,20);}
 g.restore();
}
function drawArrow(g,kind){
 g.fillStyle=INK;g.strokeStyle=INK;g.lineWidth=46;g.lineCap='butt';
 const head=(x,y,ang)=>{g.save();g.translate(x,y);g.rotate(ang);g.beginPath();g.moveTo(0,-62);g.lineTo(52,6);g.lineTo(-52,6);g.closePath();g.fill();g.restore();};
 if(kind==='straight'){g.beginPath();g.moveTo(256,410);g.lineTo(256,170);g.stroke();head(256,140,0);}
 if(kind==='right'){g.beginPath();g.moveTo(200,410);g.lineTo(200,250);g.arc(280,250,80,Math.PI,1.5*Math.PI);g.lineTo(300,170);g.stroke();head(330,170,Math.PI/2);}
 if(kind==='left'){g.beginPath();g.moveTo(312,410);g.lineTo(312,250);g.arc(232,250,80,0,1.5*Math.PI,true);g.lineTo(212,170);g.stroke();head(182,170,-Math.PI/2);}
 if(kind==='uturn'){g.beginPath();g.moveTo(320,250);g.lineTo(320,230);g.arc(256,230,64,0,Math.PI,true);g.lineTo(192,380);g.stroke();head(320,280,Math.PI);}
}
export function signTexture(s,kind,shape){
 return paint(s,512,512,(g,w,h)=>{
  g.clearRect(0,0,w,h);const c=w/2;
  const ring=(fill='#fff')=>{g.fillStyle=RED;g.beginPath();g.arc(c,c,250,0,7);g.fill();g.fillStyle=fill;g.beginPath();g.arc(c,c,206,0,7);g.fill();};
  const slash=()=>{g.strokeStyle=RED;g.lineWidth=34;g.beginPath();g.moveTo(c-146,c-146);g.lineTo(c+146,c+146);g.stroke();};
  const text=(t,size,y=c,color=INK)=>{g.fillStyle=color;g.font=`900 ${size}px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText(t,c,y);};
  const [type,arg]=kind.split(':');
  if(shape==='tri'){g.fillStyle=RED;g.beginPath();g.moveTo(16,40);g.lineTo(496,40);g.lineTo(256,480);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(80,78);g.lineTo(432,78);g.lineTo(256,402);g.closePath();g.fill();text('천천히',62,150);text('SLOW',34,206);return;}
  if(shape==='oct'){g.fillStyle='#fff';g.beginPath();for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;g[i?'lineTo':'moveTo'](c+Math.cos(a)*255,c+Math.sin(a)*255);}g.closePath();g.fill();g.fillStyle=RED;g.beginPath();for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;g[i?'lineTo':'moveTo'](c+Math.cos(a)*235,c+Math.sin(a)*235);}g.closePath();g.fill();text('정 지',104,c-56,'#fff');text('STOP',104,c+66,'#fff');return;}
  if(type==='no-entry'){g.fillStyle=RED;g.beginPath();g.arc(c,c,250,0,7);g.fill();g.fillStyle='#fff';g.fillRect(c-180,c-48,360,96);text('진 입 금 지',58,c+2,RED);return;}
  if(type==='blue-x'||type==='blue-slash'){ring('#2f5cc4');g.strokeStyle=RED;g.lineWidth=30;g.beginPath();g.moveTo(c-146,c-146);g.lineTo(c+146,c+146);if(type==='blue-x'){g.moveTo(c+146,c-146);g.lineTo(c-146,c+146);}g.stroke();g.fillStyle=RED;g.fillRect(c-150,c-40,300,80);text(arg,52,c+2,'#fff');return;}
  ring();
  if(type==='text-x'){text(arg,66);g.strokeStyle=RED;g.lineWidth=26;g.beginPath();g.moveTo(c-146,c-146);g.lineTo(c+146,c+146);g.moveTo(c+146,c-146);g.lineTo(c-146,c+146);g.stroke();return;}
  if(['car','truck','bus','moto','bike','tractor'].includes(type)){drawVehicle(g,type,c,c+10,1.1);slash();return;}
  if(type==='car-moto'){drawVehicle(g,'car',c,c-62,.82);drawVehicle(g,'moto',c+10,c+92,.7);slash();return;}
  if(['straight','right','left','uturn'].includes(type)){drawArrow(g,type);slash();return;}
  if(type==='overtake'){drawVehicle(g,'car',c+50,c+70,.62);g.fillStyle=RED;g.save();g.translate(c-60,c-20);g.scale(.62,.62);g.beginPath();g.roundRect(-95,-10,190,52,14);g.fill();g.restore();g.strokeStyle=INK;g.lineWidth=26;g.beginPath();g.moveTo(c-40,c+150);g.bezierCurveTo(c-40,c+40,c+60,c,c+60,c-110);g.stroke();g.fillStyle=INK;g.beginPath();g.moveTo(c+60,c-170);g.lineTo(c+100,c-100);g.lineTo(c+20,c-100);g.fill();return;}
  if(type==='num'){text(arg,arg.length>2?150:200,c+8);return;}
  if(type==='min'){text(arg,190,c-6);g.fillStyle=INK;g.fillRect(c-110,c+92,220,18);return;}
  if(type==='height'){text('3.5m',120,c+6);g.fillStyle=INK;for(const [y,d] of [[c-160,1],[c+160,-1]]){g.beginPath();g.moveTo(c,y+d*60);g.lineTo(c-40,y);g.lineTo(c+40,y);g.closePath();g.fill();}return;}
  if(type==='width'){text('2.2',120,c+20);text('m',60,c-70);g.fillStyle=INK;for(const [x,d] of [[c-176,1],[c+176,-1]]){g.beginPath();g.moveTo(x+d*56,c);g.lineTo(x,c-36);g.lineTo(x,c+36);g.closePath();g.fill();}return;}
  if(type==='gap'){text('50m',140,c-50);drawVehicle(g,'car',c-90,c+110,.42);drawVehicle(g,'car',c+90,c+110,.42);g.fillStyle=INK;g.fillRect(c-40,c+100,80,10);return;}
 });
}
const shapeOf=shape=>{const sh=new THREE.Shape();if(shape==='circle')sh.absarc(0,0,.5,0,Math.PI*2,false);else if(shape==='tri'){sh.moveTo(-.47,.43);sh.lineTo(.47,.43);sh.lineTo(0,-.44);sh.closePath();}else{for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;i?sh.lineTo(Math.cos(a)*.5,Math.sin(a)*.5):sh.moveTo(Math.cos(a)*.5,Math.sin(a)*.5);}sh.closePath();}return sh;};
function buildSign(s,[name,shape,kind],size=1){
 const g=new THREE.Group();g.scale.setScalar(size);
 const back=new THREE.ExtrudeGeometry(shapeOf(shape),{depth:.05,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2});s.geometries.add(back);
 const b=new THREE.Mesh(back,s.phys({color:'#c9ced2',metalness:.7,roughness:.35}));b.castShadow=true;g.add(b);
 const face=s.mesh(new THREE.PlaneGeometry(1.0,1.0),s.mat({map:signTexture(s,kind,shape),transparent:true,alphaTest:.05,roughness:.45}),g,{cast:false});face.position.z=.066;
 g.userData.name=name;return g;
}
// 교재 표처럼 칸마다 표지판과 이름(이름은 판에 인쇄)
const CW=1.5,CH=1.85,COLS=6,ROWS=4;
function boardTexture(s){
 return paint(s,2400,1184,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);const cw=w/COLS,ch=h/ROWS;g.strokeStyle='#d5dadd';g.lineWidth=3;
  for(let i=0;i<=COLS;i++){g.beginPath();g.moveTo(i*cw,0);g.lineTo(i*cw,h);g.stroke();}for(let j=0;j<=ROWS;j++){g.beginPath();g.moveTo(0,j*ch);g.lineTo(w,j*ch);g.stroke();}
  g.fillStyle='#2b3138';g.textAlign='center';g.textBaseline='middle';
  trafficSigns.forEach(([name],i)=>{const cx=(i%COLS+.5)*cw,cy=(Math.floor(i/COLS)+1)*ch-46;const size=name.length>14?22:name.length>9?25:28;g.font=`700 ${size}px ${FONT}`;
   const words=name.split(' ');const lines=[];let cur='';for(const word of words){const t=cur?cur+' '+word:word;if(g.measureText(t).width>cw-30&&cur){lines.push(cur);cur=word;}else cur=t;}lines.push(cur);
   lines.forEach((l,k)=>g.fillText(l,cx,cy+(k-(lines.length-1)/2)*(size+4)));});});
}
function buildSignBoard(s){
 const W=CW*COLS,H=CH*ROWS,g=new THREE.Group();s.scene.add(g);g.position.set(0,H/2+.3,0);
 s.rbox(W+.3,H+.3,.14,.04,s.phys({color:'#6f7f8c',roughness:.5}),0,0,-.1,g);
 s.mesh(new THREE.PlaneGeometry(W,H),s.mat({map:boardTexture(s),roughness:.8}),g,{cast:false}).position.z=-.02;
 const signs=trafficSigns.map((sign,i)=>{const o=buildSign(s,sign,.92);o.position.set((i%COLS-(COLS-1)/2)*CW,H/2-(Math.floor(i/COLS)+.42)*CH,0);g.add(o);return o;});
 return {group:g,signs};
}
function mountSigns(host,ctx){
 const saved=ctx.load('traffic-signs',null)||{};
 const st={found:new Set(saved.found||[]),pick:null};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>규제표지판에서 속력과 관계있는 표지판 찾기</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 표지판을 누르면 이름이 나와요</span></div><p class="lab5-book">규제표지판 · 주로 원형 모양, 빨간색 테두리가 있는 흰색 바탕으로 통행을 금지하거나 제한하는 것을 도로이용자에게 알리는 표지판.</p><div class="lab5-row"><b>표지판 번호</b><span data-buttons></span></div><p class="lab5-sum" data-found></p><p class="lab5-note" role="status"></p><p class="lab5-small">‘속력과 관계있는 표지판 찾기’는 이 차시의 체험 활동이며 교재의 분류가 아닙니다.</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,4.0,13.5],target:[0,3.95,0],fov:34,table:false});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=7;stage.controls.maxDistance=18;
 const board=buildSignBoard(stage),canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 const halo=stage.mesh(new THREE.TorusGeometry(.56,.05,12,48),stage.phys({color:'#f2b705',emissive:'#f2b705',emissiveIntensity:.5}),board.group,{cast:false});halo.visible=false;
 function paintUI(){host.querySelector('[data-buttons]').innerHTML=trafficSigns.map((t,i)=>`<button type="button" data-sign="${i}" aria-pressed="${st.pick===i}" class="${st.found.has(t[0])?'done':''}">${i+1}</button>`).join('');
  host.querySelectorAll('[data-sign]').forEach(b=>b.onclick=()=>choose(+b.dataset.sign));
  host.querySelector('[data-found]').textContent=`찾은 표지판 ${st.found.size}/${speedSigns.length}${st.found.size?` · ${[...st.found].join(', ')}`:''}`;
  canvas.dataset.labFound=String(st.found.size);canvas.dataset.labPick=st.pick==null?'':String(st.pick);}
 function choose(i){st.pick=i;const [name]=trafficSigns[i],o=board.signs[i];halo.visible=true;halo.position.set(o.position.x,o.position.y,.12);
  if(speedSigns.includes(name)){st.found.add(name);ctx.save('traffic-signs',{found:[...st.found]});say(st.found.size===speedSigns.length?`${name} — 속력과 관계있는 표지판을 모두 찾았어요.`:`${name} — 속력과 관계있는 표지판이에요.`);}
  else say(`${name}`);paintUI();}
 const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
 canvas.addEventListener('pointerup',e=>{const r=canvas.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,stage.camera);const hit=ray.intersectObjects(board.signs,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.name)o=o.parent;if(o)choose(board.signs.indexOf(o));}});
 paintUI();say('표지판을 누르거나 번호를 골라 이름을 확인해 보세요. 속력과 관계있는 표지판은 몇 개일까요?');
 let disposed=false,raf=0;
 function tick(){if(disposed)return;stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── 하이퍼튜브(59~60쪽) ─────────────────────────
// 교재 사진(UNIST 차량 이미지·모형)은 쓰지 않고 같은 모양의 개념 3D 모형을 만든다. 이름표 Luggage · Compressor · Magnetic Legs는 교재 그림의 표기다.
export function buildCapsule(s,{parent=s.scene}={}){
 const g=new THREE.Group();parent.add(g);
 const white=s.phys({color:'#f4f6f7',roughness:.25,clearcoat:1}),dark=s.phys({color:'#22282e',roughness:.3,clearcoat:.8}),steel=s.phys({color:'#b8c0c6',metalness:.8,roughness:.25});
 const prof=[[0,-2.5],[.32,-2.45],[.5,-2.2],[.56,-1.6],[.56,1.4],[.5,2.0],[.36,2.35],[.12,2.5],[0,2.52]].map(([r,y])=>new THREE.Vector2(r,y));
 const body=s.mesh(new THREE.LatheGeometry(prof,48),white,g);body.rotation.z=-Math.PI/2;body.scale.set(1,1,.82);
 const intake=s.mesh(new THREE.TorusGeometry(.36,.06,16,40),steel,g);intake.rotation.y=Math.PI/2;intake.position.x=-2.42;
 const fan=s.mesh(new THREE.CircleGeometry(.33,40),dark,g,{cast:false});fan.rotation.y=-Math.PI/2;fan.position.x=-2.4;
 for(let i=0;i<8;i++){const b=s.rbox(.02,.3,.07,.01,steel,-2.39,0,0,g);b.rotation.x=i/8*Math.PI*2;b.position.set(-2.39,Math.cos(i/8*Math.PI*2)*.15,Math.sin(i/8*Math.PI*2)*.15);}
 s.rbox(2.6,.14,.02,.05,dark,.3,.22,.47,g);
 s.rbox(.18,.05,.02,.02,s.phys({color:'#e5302f',emissive:'#a01010'}),-1.7,0,.42,g);
 for(const x of [-1.4,1.3]){s.rbox(1.0,.06,.24,.03,steel,x,-.55,0,g);s.rbox(.08,.12,.08,.02,steel,x,-.47,0,g);}
 return g;
}
function buildTube(s,{len=16}={}){
 const g=new THREE.Group();s.scene.add(g);
 const tube=s.mesh(new THREE.CylinderGeometry(.95,.95,len,48,1,true),s.phys({color:'#e3f1f8',transparent:true,opacity:.22,roughness:.05,clearcoat:1,depthWrite:false,side:THREE.DoubleSide}),g,{cast:false,receive:false});tube.rotation.z=Math.PI/2;
 for(const x of [-len/2,len/2]){const r=s.mesh(new THREE.TorusGeometry(.98,.12,16,48),s.phys({color:'#eceeef',roughness:.4}),g);r.rotation.y=Math.PI/2;r.position.x=x;}
 for(let x=-len/2+2;x<len/2;x+=4){s.rbox(.3,1.2,.9,.04,s.phys({color:'#eef0f0',roughness:.6}),x,-1.45,0,g);}
 return g;
}
function mountHypertube(host,ctx){
 const saved=ctx.load('hypertube',null)||{};
 const st={u:0,playing:false,ok:!!saved.ok};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>1200km/h로 달리는 하이퍼튜브</h3><div class="balance-view"><span class="scene-tag">3D 개념 모형 · 실제 차량 사진이 아닙니다</span></div><p class="lab5-book">하이퍼튜브는 최고속도 시속 1200km를 목표로 철도연이 개발 중인 초고속 열차로, 서울에서 부산까지 20분 만에 주행할 수 있다.</p><div class="lab5-row"><b>달리기</b><button type="button" data-play>▶ 20분 달리기</button><span class="lab5-sum" data-read></span></div><div class="lab5-row"><b>1200km/h로 20분 동안 달리면</b><input data-km type="number" min="0" step="1" aria-label="이동거리 km"> km를 갈까요? <button type="button" data-check class="${st.ok?'done':''}">확인</button></div><p class="lab5-note" role="status"></p><p class="lab5-small">캡슐이 움직이는 모습은 시간을 줄여 보여 줍니다. 1200km/h는 교재 56쪽처럼 1시간당 1200km를 이동하는 빠르기예요.</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[2.5,2.6,10.5],target:[0,1.6,0],fov:34});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=5;stage.controls.maxDistance=16;
 const tube=buildTube(stage);tube.position.y=1.8;const cap=buildCapsule(stage);
 const clock=clockFace(stage);clock.group.position.set(-4.2,4.3,-1.6);clock.group.scale.setScalar(.7);
 const clockTag=stage.label('시계 한 바퀴 = 1시간',{size:.36});clockTag.position.set(-4.2,5.25,-1.6);
 const canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 host.querySelector('[data-play]').onclick=()=>{st.u=0;st.playing=true;say('캡슐이 1200km/h로 달리고 있어요. 시계의 1/3 바퀴가 20분이에요.');};
 host.querySelector('[data-check]').onclick=()=>{const v=host.querySelector('[data-km]').value;if(v===''){say('몇 km를 갈지 먼저 써 보세요.');return;}
  const ok=Number(v)===400;if(ok){st.ok=true;ctx.save('hypertube',{ok:true});host.querySelector('[data-check]').classList.add('done');}canvas.dataset.labOk=String(st.ok);
  say(ok?'맞아요. 1시간에 1200km를 가므로, 1시간의 1/3인 20분에는 1200km의 1/3인 400km를 가요.':'1200km/h는 1시간당 1200km예요. 20분은 1시간의 몇 분의 1인지 먼저 생각해 보세요.');};
 canvas.dataset.labOk=String(st.ok);say('▶ 20분 달리기를 눌러 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  if(st.playing&&!document.hidden){st.u=Math.min(1,st.u+dt/4);if(st.u>=1)st.playing=false;}
  const lap=(st.u*6)%1;cap.position.set(-7+14*lap,1.8,0);clock.hand.rotation.z=-st.u/3*Math.PI*2;
  host.querySelector('[data-read]').textContent=`${Math.round(st.u*20)}분 · ${Math.round(st.u*400)} km`;canvas.dataset.labU=st.u.toFixed(2);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── A에서 B까지(61쪽 ①) ─────────────────────────
function grass(s){s.rbox(60,.2,60,.05,s.phys({color:'#d9ecc9',roughness:.95}),0,-.1,4);}
function buildBull(s){
 const g=new THREE.Group();s.scene.add(g);const fur=s.phys({color:'#5d5f66',roughness:.85}),horn=s.phys({color:'#f1e7d0',roughness:.4}),dark=s.mat({color:'#1d1f24'});
 s.rbox(1.5,.8,.75,.3,fur,0,1.05,0,g);const head=s.rbox(.55,.5,.5,.18,fur,.95,1.3,0,g);head.rotation.z=-.25;
 for(const z of [-.18,.18]){const h=s.mesh(new THREE.ConeGeometry(.07,.4,12),horn,g);h.position.set(1.0,1.62,z);h.rotation.set(z>0?.5:-.5,0,-.4);s.mesh(new THREE.SphereGeometry(.04,10,8),dark,g).position.set(1.16,1.36,z*.9);}
 for(const [x,z] of [[-.5,-.25],[-.5,.25],[.5,-.25],[.5,.25]]){const l=s.mesh(new THREE.CylinderGeometry(.1,.08,.7,12),fur,g);l.position.set(x,.35,z);}
 rod(s,new THREE.Vector3(-.75,1.2,0),new THREE.Vector3(-1.05,.7,0),.03,fur,g);
 return g;
}
const A=new THREE.Vector3(-4.6,0,-1.6),B=new THREE.Vector3(4.6,0,1.4);
// 세 가지 경로(가상의 모양). 직선은 A에서 B로의 위치 변화.
export const routePoints=[
 [[-4.6,-1.6],[-2.5,-3.6],[1,-3.2],[3.4,-.6],[4.6,1.4]],
 [[-4.6,-1.6],[-2.6,1.6],[0,2.8],[2.6,3.0],[4.6,1.4]],
 [[-4.6,-1.6],[-3.4,.2],[-1.4,-1.2],[.6,.8],[2.6,-.6],[4.6,1.4]]
];
const UNIT=10;   // 그림의 1칸 = 10 m(가상)
export function routeLength(points){const c=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.06,z)));return Math.round(c.getLength()*UNIT);}
export const straightLength=Math.round(A.distanceTo(B)*UNIT);
function buildRoutes(s){
 const colors=['#e0742c','#2f9a5e','#8a4fd1'];
 const routes=routePoints.map((pts,i)=>{const curve=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,.07,z)));const m=s.mesh(new THREE.TubeGeometry(curve,120,.07,10,false),s.phys({color:colors[i],roughness:.4}),s.scene,{cast:false});const mid=curve.getPoint(.5);const tag=s.label(`${'①②③'[i]}`,{size:.5});tag.position.set(mid.x,.6,mid.z);return {curve,mesh:m,tag,len:routeLength(pts)};});
 const straight=arrow3(s,{color:'#d13a35',r:.09});straight.set(A.clone().setY(.25),B.clone().setY(.25));
 const ta=s.label('A',{size:.6}),tb=s.label('B',{size:.6});ta.position.set(A.x-.2,2.4,A.z);tb.position.set(B.x,3.5,B.z);
 return {routes,straight};
}
function mountRoutes(host,ctx){
 const saved=ctx.load('routes',null)||{};
 const st={route:null,u:0,playing:false,seen:new Set(saved.seen||[]),straight:false};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>A위치에서 B위치까지 이동하는 방법은 몇 가지나 될까?</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 경로의 모양과 길이는 가상의 값입니다</span></div><p class="lab5-book">아래 그림에 소가 있는 위치 A에서 쌤이 있는 B위치까지 이동할 수 있는 경로를 그리고, 스스로가 그린 경로에 ①. ②처럼 숫자를 표시한 후 속력과 속도로 구분하여 보세요.</p><div class="lab5-row"><b>경로 따라가기</b>${[0,1,2].map(i=>`<button type="button" data-route="${i}">경로 ${'①②③'[i]}</button>`).join('')}<label class="lab5-check"><input type="checkbox" data-straight> A에서 B로 곧게 이은 화살표</label></div><p class="lab5-sum" data-read></p><p class="lab5-note" role="status"></p><p class="lab5-small">속도는 물체의 빠르기를 이동한 방향과 함께 나타낸다는 점에서 속력과 차이가 있다. (교재 61쪽 ② ③)</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,9.5,11],target:[0,.6,0],fov:34,table:false,backdrop:'sky'});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=7;stage.controls.maxDistance=22;stage.controls.maxPolarAngle=Math.PI*.42;
 grass(stage);const bull=buildBull(stage);bull.position.copy(A);bull.position.x-=.6;
 const teacher=buildPerson(stage,{height:2.4,shirt:'#2d2f36',pants:'#24262c',hair:'#1f1c1a',pose:'point'});teacher.root.position.copy(B).add(new THREE.Vector3(.5,0,0));teacher.root.rotation.y=-.6;
 const R=buildRoutes(stage);R.straight.group.visible=false;
 const walker=stage.mesh(new THREE.SphereGeometry(.22,24,16),stage.phys({color:'#f2b705',roughness:.3,clearcoat:.6}));walker.visible=false;
 const canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 function paintUI(){host.querySelectorAll('[data-route]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.route===st.route));b.classList.toggle('done',st.seen.has(+b.dataset.route));});
  R.routes.forEach((r,i)=>{r.mesh.material.opacity=st.route==null||st.route===i?1:.25;r.mesh.material.transparent=st.route!=null&&st.route!==i;});
  host.querySelector('[data-read]').textContent=`${st.route==null?'경로를 골라 보세요.':`경로 ${'①②③'[st.route]}의 이동거리 약 ${R.routes[st.route].len} m`}${st.straight?` · A에서 B로 곧게 약 ${straightLength} m(방향: A → B)`:''}`;
  canvas.dataset.labRoute=st.route==null?'':String(st.route);canvas.dataset.labSeen=[...st.seen].sort().join(',');canvas.dataset.labStraight=String(st.straight);}
 host.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{st.route=+b.dataset.route;st.u=0;st.playing=true;walker.visible=true;paintUI();say(`경로 ${'①②③'[st.route]}를 따라 A에서 B로 가요.`);});
 host.querySelector('[data-straight]').onchange=e=>{st.straight=e.target.checked;R.straight.group.visible=st.straight;paintUI();say(st.straight?'어느 경로로 가도 A에서 B로 곧게 이은 화살표(방향과 거리)는 하나예요.':'화살표를 숨겼어요.');};
 paintUI();say('경로 ①②③을 차례로 따라가 보고, 경로마다 이동거리를 비교해 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  if(st.playing&&!document.hidden){st.u=Math.min(1,st.u+dt/2.5);if(st.u>=1){st.playing=false;st.seen.add(st.route);ctx.save('routes',{seen:[...st.seen]});paintUI();say(st.seen.size>=3?'세 경로 모두 A에서 출발해 B에 도착했어요. 이동거리는 경로마다 달라요. 곧게 이은 화살표도 켜 보세요.':`경로 ${'①②③'[st.route]}의 이동거리는 약 ${R.routes[st.route].len} m예요. 다른 경로도 따라가 보세요.`);}}
  if(st.route!=null){const p=R.routes[st.route].curve.getPoint(st.u);walker.position.set(p.x,.3,p.z);}canvas.dataset.labU=st.u.toFixed(2);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

// ───────────────────────── 민정이의 자전거(62쪽 Speed Question) ─────────────────────────
// A–B 200m, B–C 200m, C–D 200m, D–E 300m. A에서 출발해 E를 돌아 D까지, 구간마다 10초.
export const tripStops=[['A',0],['B',200],['C',400],['D',600],['E',900]];
export const tripLegs=[[0,200],[200,400],[400,600],[600,900],[900,600]];
export const tripTotals=(()=>{const dist=tripLegs.reduce((a,[f,t])=>a+Math.abs(t-f),0),time=tripLegs.length*10,disp=tripLegs.at(-1)[1]-tripLegs[0][0];return {dist,time,disp,speed:dist/time,velocity:disp/time};})();
const XM=m=>-5.4+m*.0115;
function buildBicycle(s){
 const g=new THREE.Group();s.scene.add(g);const frame=s.phys({color:'#2c8ad6',roughness:.35,clearcoat:.6}),tire=s.phys({color:'#1f2328',roughness:.6}),steel=s.phys({color:'#b9c1c7',metalness:.8,roughness:.3});
 const wheels=[-.55,.55].map(x=>{const w=s.mesh(new THREE.TorusGeometry(.34,.04,10,36),tire,g);w.position.set(x,.36,0);for(let i=0;i<6;i++){const sp=rod(s,new THREE.Vector3(x,.36,0),new THREE.Vector3(x+Math.cos(i)*.32,.36+Math.sin(i)*.32,0),.008,steel,g);sp.castShadow=false;}return w;});
 const P=(x,y)=>new THREE.Vector3(x,y,0);
 for(const [a,b] of [[P(-.55,.36),P(-.12,.36)],[P(-.12,.36),P(-.22,.86)],[P(-.22,.86),P(.42,.84)],[P(-.12,.36),P(.42,.84)],[P(.42,.84),P(.55,.36)],[P(-.55,.36),P(-.22,.86)],[P(.42,.84),P(.46,1.05)]])rod(s,a,b,.03,frame,g);
 rod(s,new THREE.Vector3(.46,1.05,-.25),new THREE.Vector3(.46,1.05,.25),.025,steel,g);
 s.rbox(.26,.06,.14,.03,s.phys({color:'#222'}),-.24,.9,0,g);
 return {group:g,wheels};
}
function buildTrip(s){
 s.rbox(13.4,.12,1.2,.04,s.phys({color:'#c8ccd0',roughness:.7}),XM(450),.06,0);
 const colors=['#f08a24','#3c8fd8','#3c8fd8','#3c8fd8','#3c8fd8'];
 tripStops.forEach(([n,m],i)=>{const d=s.mesh(new THREE.CylinderGeometry(.26,.26,.06,32),s.phys({color:colors[i],roughness:.4}));d.position.set(XM(m),.15,.75);const l=s.label(n,{size:.5});l.position.set(XM(m),.75,.9);});
 [[0,200,'200m'],[200,400,'200m'],[400,600,'200m'],[600,900,'300m']].forEach(([a,b,t])=>dimension(s,XM(a),XM(b),t,{y:.22,z:1.45,size:.42}));
}
function mountTrip(host,ctx){
 const saved=ctx.load('cycle-trip',null)||{};
 const st={t:0,playing:false,done:new Set(saved.done||[])};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>민정이의 속력과 속도 구해보기</h3><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 구간마다 10초씩 걸려요</span></div><p class="lab5-book">어느 맑은 오전에 상쾌한 기분으로 자전거를 타고 있는 민정이가 A지점에서 출발하여 목표지점은 E구간을 돌아 다시 D까지 오는 동안의 속력과 속도를 구하시오. ( 각 구간별 이동시간은 동일하게 10초가 걸렸다. )</p><div class="lab5-row"><b>자전거</b><button type="button" data-play>▶ 출발</button><span class="lab5-sum" data-read></span></div><ol class="lab5-steps"><li data-row="speed" class="${st.done.has('speed')?'done':''}"><span>① 속력 구하기</span><input data-v type="number" step="0.1" aria-label="속력 m/s"> m/s <button type="button" data-check="speed">확인</button></li><li data-row="velocity" class="${st.done.has('velocity')?'done':''}"><span>② 속도 구하기</span><input data-v type="number" step="0.1" aria-label="속도 m/s"> m/s (A에서 D 쪽으로) <button type="button" data-check="velocity">확인</button></li></ol><p class="lab5-note" role="status"></p><p class="lab5-small">자전거가 움직이는 모습은 시간을 줄여 보여 줍니다(구간마다 10초).</p></div>`;
 const view=host.querySelector('.balance-view'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,4.2,12.5],target:[0,1.0,0],fov:34,table:false,backdrop:'sky'});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=6;stage.controls.maxDistance=20;
 grass(stage);buildTrip(stage);
 const bike=buildBicycle(stage),rider=buildPerson(stage,{height:1.9,child:true,shirt:'#d43a3a',pants:'#d43a3a',shorts:true,shoes:'#f4f1ea',hair:'#3a2a1e',hairStyle:'long',pose:'ride',parent:bike.group});rider.root.position.set(-.3,-.05,0);rider.root.rotation.y=Math.PI/2;
 const canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 const state=t=>{const leg=Math.min(4,Math.floor(t/10)),f=Math.min(1,(t-leg*10)/10),[a,b]=tripLegs[leg];const pos=a+(b-a)*f;let dist=0;for(let i=0;i<leg;i++)dist+=Math.abs(tripLegs[i][1]-tripLegs[i][0]);dist+=Math.abs(b-a)*f;return {pos,dist,back:b<a};};
 host.querySelector('[data-play]').onclick=()=>{st.t=0;st.playing=true;say('민정이가 A에서 출발했어요. 이동거리와 A에서의 위치를 함께 보세요.');};
 host.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const k=b.dataset.check,v=b.closest('li').querySelector('[data-v]').value;if(v===''){say('값을 먼저 써 보세요.');return;}
  const want=k==='speed'?tripTotals.speed:tripTotals.velocity,ok=Math.abs(Number(v)-want)<1e-6;
  if(ok){st.done.add(k);ctx.save('cycle-trip',{done:[...st.done]});b.closest('li').classList.add('done');}
  canvas.dataset.labDone=[...st.done].sort().join(',');
  say(ok?(k==='speed'?`맞아요. 이동거리 ${tripTotals.dist}m를 ${tripTotals.time}초 동안 갔으므로 속력은 ${tripTotals.speed}m/s예요.`:`맞아요. A에서 D까지 위치가 ${tripTotals.disp}m 변했고 ${tripTotals.time}초가 걸렸으므로 속도는 ${tripTotals.velocity}m/s(A에서 D 쪽으로)예요.`):(k==='speed'?'민정이가 실제로 달린 길(E를 돌아 D까지)의 길이를 모두 더하고, 걸린 시간으로 나눠 보세요.':'속도는 방향과 함께 나타내요. A에서 출발해 마지막에 어디에 있는지, 그 위치까지 곧게 잰 거리로 생각해 보세요.'));});
 canvas.dataset.labDone=[...st.done].sort().join(',');say('▶ 출발을 눌러 민정이를 따라가 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  if(st.playing&&!document.hidden){st.t=Math.min(tripTotals.time,st.t+dt*10/1.2);if(st.t>=tripTotals.time)st.playing=false;}
  const s=state(st.t);bike.group.position.set(XM(s.pos),.12,0);bike.group.rotation.y=s.back?Math.PI:0;rider.setPose('ride',st.t*1.5);bike.wheels.forEach(w=>w.rotation.z=-st.t*.8);
  host.querySelector('[data-read]').textContent=`시간 ${Math.round(st.t)}초 · 이동거리 ${Math.round(s.dist)}m · A에서의 위치 ${Math.round(s.pos)}m`;canvas.dataset.labT=st.t.toFixed(1);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}

export function mountMotion8(kind,host,ctx){
 if(kind==='traffic-signs')return mountSigns(host,ctx);
 if(kind==='hypertube')return mountHypertube(host,ctx);
 if(kind==='routes')return mountRoutes(host,ctx);
 return mountTrip(host,ctx);
}

// ───────────────────────── 정지 그림(투사·인쇄) ─────────────────────────
const l8Stills={
 'l8-signs':{size:[1400,900],stage:{cam:[0,4.0,13.0],target:[0,4.0,0],fov:34,table:false},build(s){buildSignBoard(s);}},
 'l8-signs-speed':{size:[1200,560],stage:{cam:[0,1.7,7.2],target:[0,1.35,0],fov:34,table:false},build(s){speedSigns.forEach((n,i)=>{const sign=trafficSigns.find(t=>t[0]===n);const o=buildSign(s,sign,1.1);o.position.set((i-2)*2.2,1.7,0);s.scene.add(o);rod(s,new THREE.Vector3((i-2)*2.2,0,-.05),new THREE.Vector3((i-2)*2.2,1.2,-.05),.05,s.phys({color:'#9aa3ab',metalness:.6,roughness:.4}));const l=s.label(n,{size:.36});l.position.set((i-2)*2.2,.35,.4);});s.rbox(14,.1,4,.04,s.phys({color:'#d4d8db'}),0,.05,0);}},
 'l8-hypertube':{size:[1200,600],stage:{cam:[1.4,1.9,7.0],target:[0,.75,0],fov:34},build(s){const c=buildCapsule(s);c.position.y=.7;callout(s,'Luggage',[.6,1.75,.4],[.3,1.0,.3],.36);callout(s,'Compressor',[-2.6,1.6,.3],[-2.42,.75,0],.36);callout(s,'Magnetic Legs',[1.9,-.2,.9],[1.3,.15,.12],.36);}},
 'l8-hypertube-tube':{size:[1200,600],stage:{cam:[3.6,2.6,8.4],target:[0,1.6,0],fov:34},build(s){const t=buildTube(s,{len:10});t.position.y=1.8;const c=buildCapsule(s);c.position.set(.6,1.8,0);}},
 'l8-routes':{size:[1200,720],stage:{cam:[0,9.5,11],target:[0,.6,0],fov:34,table:false,backdrop:'sky'},build(s){grass(s);const b=buildBull(s);b.position.copy(A);b.position.x-=.6;const t=buildPerson(s,{height:2.4,shirt:'#2d2f36',pants:'#24262c',hair:'#1f1c1a',pose:'point'});t.root.position.copy(B).add(new THREE.Vector3(.5,0,0));t.root.rotation.y=-.6;buildRoutes(s);}},
 'l8-trip':{size:[1200,520],stage:{cam:[0,3.4,11],target:[0,.9,0],fov:34,table:false,backdrop:'sky'},build(s){grass(s);buildTrip(s);const bike=buildBicycle(s);bike.group.position.set(XM(0),.12,0);const r=buildPerson(s,{height:1.9,child:true,shirt:'#d43a3a',pants:'#d43a3a',shorts:true,shoes:'#f4f1ea',hair:'#3a2a1e',hairStyle:'long',pose:'ride',parent:bike.group});r.root.position.set(-.3,-.05,0);r.root.rotation.y=Math.PI/2;r.setPose('ride',.8);const a=arrow3(s,{color:'#2f6db5',r:.06});a.set(new THREE.Vector3(XM(0)+.8,1.9,0),new THREE.Vector3(XM(900),1.9,0));const b=arrow3(s,{color:'#2f6db5',r:.06});b.set(new THREE.Vector3(XM(900),1.6,0),new THREE.Vector3(XM(600),1.6,0));}}
};
export const lesson8StillNames=Object.keys(l8Stills);
export function lesson8StillSize(name){return l8Stills[name].size;}
export function renderLesson8Still(name,host){
 const sc=l8Stills[name];if(!sc)throw new Error('알 수 없는 그림: '+name);
 const stage=createStage(host,{...sc.stage,orbit:false});
 sc.build(stage);stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}
