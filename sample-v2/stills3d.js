// 투사·인쇄용 3D 정지 그림(1~4차시, 본책 서술을 나타내는 개념 그림). scripts/local/render-3d-stills.mjs가 한 번씩 그려 art/l3-*.jpg로 저장한다.
// 수치는 교재의 값만 쓴다(58.8 N → 9.8 N, 1 kg → 9.8 N, 6 kg → 58.8 N, 10 g · 100 g).
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {earthTexture,moonTexture,grassTexture,arrow,helixGeometry,boardTexture} from './lesson3d.js';
import {weightPlans} from './physics.js';

const UP=new THREE.Vector3(0,1,0);
const paint=(stage,w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return stage.canvasTex(c);};
const NUM_COLORS=['#f2c94c','#ee7f5a','#5ea9e6','#9b7ad8'];
function ballMaterial(stage,kind){
 if(kind==='beach')return stage.phys({map:paint(stage,512,256,(g,w,h)=>{['#e0603f','#ffffff','#f2c94c','#ffffff','#2c7fb8','#ffffff'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(i*w/6,0,w/6+1,h);});}),roughness:.35,clearcoat:.6});
 if(kind==='tennis')return stage.phys({map:paint(stage,512,256,(g,w,h)=>{g.fillStyle='#cfe04a';g.fillRect(0,0,w,h);g.strokeStyle='#ffffff';g.lineWidth=12;for(const o of [0,w/2]){g.beginPath();for(let x=0;x<=w/2;x+=4)g.lineTo(o+x,h/2+Math.sin(x/(w/2)*Math.PI*2)*h*.32);g.stroke();}}),roughness:.85});
 return stage.phys({map:paint(stage,512,256,(g,w,h)=>{g.fillStyle='#fbfbf8';g.fillRect(0,0,w,h);g.fillStyle='#1d232a';for(let r=0;r<3;r++)for(let c=0;c<6;c++){const x=(c+.5+(r%2)*.5)*w/6,y=(r+.5)*h/3;g.beginPath();for(let k=0;k<5;k++){const a=k/5*Math.PI*2-Math.PI/2;g.lineTo(x+Math.cos(a)*22,y+Math.sin(a)*22);}g.fill();}}),roughness:.45,clearcoat:.3});
}
function earthScene(stage,{items,arrows}){
 const R=2.1,D=3.6;
 const earth=stage.mesh(new THREE.SphereGeometry(R,64,48),stage.mat({map:earthTexture(stage),roughness:.75}));earth.rotation.y=-.7;
 stage.mesh(new THREE.SphereGeometry(R*1.05,48,32),stage.mat({color:'#8fd0ff',transparent:true,opacity:.14,side:THREE.BackSide,depthWrite:false}),stage.scene,{cast:false,receive:false});
 for(const it of items){
  const a=it.angle*Math.PI/180,dir=new THREE.Vector3(Math.sin(a),Math.cos(a),0);
  const ball=stage.mesh(new THREE.SphereGeometry(it.kind==='num'?.34:.38,48,32),it.kind==='num'?stage.phys({color:NUM_COLORS[(it.n-1)%4],roughness:.35,clearcoat:.6}):ballMaterial(stage,it.kind));
  ball.position.copy(dir.clone().multiplyScalar(D));ball.rotation.set(.35,.6,.1);
  if(it.kind==='num'){const t=stage.label(`${it.n}번`,{size:.62});t.position.copy(dir.clone().multiplyScalar(D+.9)).add(new THREE.Vector3(0,0,.3));}
  if(it.arrow??arrows){const ar=arrow(stage,stage.scene);ar.position.copy(dir.clone().multiplyScalar(D-.45));ar.quaternion.setFromUnitVectors(UP,dir.clone().negate());}
 }
}
function ground(stage,map,r=11){const g=stage.mesh(new THREE.CylinderGeometry(r,r,.4,72),stage.mat({map,roughness:.95}));g.position.y=-.2;return g;}
const water=stage=>stage.phys({color:'#3d8fd6',roughness:.12,transmission:0,transparent:true,opacity:.78,clearcoat:1});
function cap(stage,r,l,m,x,y,z,rz=0){const o=stage.mesh(new THREE.CapsuleGeometry(r,l,8,16),m);o.position.set(x,y,z);o.rotation.z=rz;return o;}

const scenes={
 'l3-apple-tree':{size:[1200,900],stage:{cam:[0,3.6,15.5],target:[.3,3.1,0],table:false,backdrop:'sky'},build(s){
  ground(s,grassTexture(s));
  const bark=s.phys({color:'#7a5230',roughness:.8});
  s.mesh(new THREE.CylinderGeometry(.34,.5,3.4,24),bark).position.set(-1.2,1.7,0);
  for(const [x,y,z,r,c] of [[-1.2,4.3,0,1.8,'#4ea65a'],[-2.5,3.9,.3,1.25,'#58b064'],[.1,4.0,.2,1.3,'#58b064'],[-1.2,5.3,-.3,1.35,'#5fb86b'],[-.8,3.7,1.0,1.05,'#4b9f56']])s.mesh(new THREE.SphereGeometry(r,40,28),s.phys({color:c,roughness:.7})).position.set(x,y,z);
  const red=s.phys({color:'#d8402f',roughness:.35,clearcoat:.6});
  for(const [x,y,z] of [[-2.1,4.6,1.2],[-.4,4.9,1.3],[.6,3.9,1.2],[-1.6,3.5,1.6],[-2.9,3.6,1.1],[-.9,5.8,.9]])s.mesh(new THREE.SphereGeometry(.2,24,16),red).position.set(x,y,z);
  const apple=s.mesh(new THREE.SphereGeometry(.26,32,24),red);apple.position.set(2.4,2.9,.8);
  s.mesh(new THREE.CylinderGeometry(.025,.025,.18,8),s.mat({color:'#6b4a24'})).position.set(2.4,3.22,.8);
  const ar=arrow(s,s.scene);ar.position.set(2.4,2.5,.8);ar.quaternion.setFromUnitVectors(UP,new THREE.Vector3(0,-1,0));
  s.label('아래로 떨어져요',{size:.5}).position.set(3.6,1.1,.8);
 }},
 'l3-earth-objects':{size:[1200,900],stage:{cam:[0,.2,18.8],target:[0,0,0],table:false,backdrop:'space'},build(s){earthScene(s,{items:[{angle:300,kind:'ball'},{angle:35,kind:'beach'},{angle:150,kind:'tennis'}],arrows:true});}},
 'l3-earth-numbered':{size:[1200,900],stage:{cam:[0,.2,18.8],target:[0,0,0],table:false,backdrop:'space'},build(s){earthScene(s,{items:[1,2,3,4].map((n,i)=>({angle:[0,270,180,90][i],kind:'num',n})),arrows:false});}},
 'l3-earth-numbered-arrows':{size:[1200,900],stage:{cam:[0,.2,18.8],target:[0,0,0],table:false,backdrop:'space'},build(s){earthScene(s,{items:[1,2,3,4].map((n,i)=>({angle:[0,270,180,90][i],kind:'num',n})),arrows:true});}},
 'l3-earth-daily4':{size:[1200,900],stage:{cam:[0,.2,18.8],target:[0,0,0],table:false,backdrop:'space'},build(s){earthScene(s,{items:[{angle:38,kind:'beach'},{angle:205,kind:'ball'},{angle:305,kind:'tennis'}],arrows:false});}},
 'l3-earth-daily4-arrows':{size:[1200,900],stage:{cam:[0,.2,18.8],target:[0,0,0],table:false,backdrop:'space'},build(s){earthScene(s,{items:[{angle:38,kind:'beach'},{angle:205,kind:'ball'},{angle:305,kind:'tennis'}],arrows:true});}},
 'l3-use-bungee':{size:[900,560],stage:{cam:[0,3.2,11.5],target:[0,2.8,0],table:false,backdrop:'sky'},build(s){
  const river=s.mesh(new THREE.BoxGeometry(22,.2,8),water(s));river.position.set(0,-.1,0);
  const concrete=s.phys({color:'#9aa5ad',roughness:.6});s.rbox(9,.45,1.8,.08,concrete,0,5.4,0);s.rbox(.5,5.4,1.4,.06,concrete,-3.6,2.7,0);
  const curve=new THREE.CatmullRomCurve3([[.9,5.2,0],[1.1,4.4,0],[.8,3.6,0],[.9,2.9,0]].map(p=>new THREE.Vector3(...p)));s.mesh(new THREE.TubeGeometry(curve,40,.05,8),s.phys({color:'#d13a35'}));
  const suit=s.phys({color:'#f28c2e',roughness:.5});cap(s,.26,.7,suit,.9,2.3,0);s.mesh(new THREE.SphereGeometry(.24,24,16),s.phys({color:'#f1c7a1'})).position.set(.9,1.6,0);
  const ar=arrow(s,s.scene);ar.position.set(2.3,3.6,0);ar.quaternion.setFromUnitVectors(UP,new THREE.Vector3(0,-1,0));
 }},
 'l3-use-drop':{size:[900,560],stage:{cam:[0,2.4,9],target:[.6,1.7,0],backdrop:'studio'},build(s){
  const wood=s.phys({color:'#c99a5b',roughness:.55});s.rbox(3,.18,2,.05,wood,-1,2.1,0);for(const [x,z] of [[-2.3,-.8],[.3,-.8],[-2.3,.8],[.3,.8]])s.mesh(new THREE.CylinderGeometry(.07,.07,2.1,12),wood).position.set(x,1.05,z);
  for(const [y,o] of [[3.1,.25],[2.3,.45],[1.5,.7]])s.mesh(new THREE.SphereGeometry(.3,32,24),s.phys({color:'#ee7f5a',transparent:true,opacity:o,roughness:.4})).position.set(1.5,y,0);
  s.mesh(new THREE.SphereGeometry(.3,32,24),s.phys({color:'#ee7f5a',roughness:.35,clearcoat:.6})).position.set(1.5,.3,0);
  const ar=arrow(s,s.scene);ar.position.set(2.5,3.0,0);ar.quaternion.setFromUnitVectors(UP,new THREE.Vector3(0,-1,0));ar.scale.setScalar(1.6);
 }},
 'l3-use-meteor':{size:[900,560],stage:{cam:[0,.6,12],target:[0,.2,0],table:false,backdrop:'space'},build(s){
  const earth=s.mesh(new THREE.SphereGeometry(6,72,48),s.mat({map:earthTexture(s),roughness:.75}));earth.position.set(3.5,-6.6,-3);
  const rock=s.mesh(new THREE.IcosahedronGeometry(.6,1),s.phys({color:'#6b4a35',roughness:.95,flatShading:true}));rock.position.set(-2.4,2.2,0);
  const dir=new THREE.Vector3(3.5,-6.6,-3).sub(rock.position).normalize();
  const tail=s.mesh(new THREE.ConeGeometry(.55,3.4,32,1,true),s.mat({color:'#ffb347',emissive:'#ff7a1a',emissiveIntensity:1.2,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}),s.scene,{cast:false,receive:false});
  tail.position.copy(rock.position.clone().addScaledVector(dir,-1.9));tail.quaternion.setFromUnitVectors(UP,dir);
  const ar=arrow(s,s.scene);ar.position.copy(rock.position.clone().addScaledVector(dir,.9));ar.quaternion.setFromUnitVectors(UP,dir);
 }},
 'l3-use-water':{size:[900,560],stage:{cam:[.6,3.4,10.5],target:[0,1.6,0],table:false,backdrop:'sky'},build(s){
  ground(s,grassTexture(s));const rock=s.phys({color:'#8e8a80',roughness:.85});const w=water(s);
  for(const [x,h] of [[-2.4,3.2],[-.2,2.0],[2.0,.8]]){s.rbox(2.2,h,2.4,.12,rock,x,h/2,0);s.rbox(2.0,.12,2.0,.05,w,x,h+.06,0);}
  s.rbox(.18,1.2,1.8,.04,w,-1.25,2.6,0);s.rbox(.18,1.2,1.8,.04,w,.95,1.4,0);
  const ar=arrow(s,s.scene);ar.position.set(-1.9,4.2,1.4);ar.quaternion.setFromUnitVectors(UP,new THREE.Vector3(1,-.7,0).normalize());ar.scale.setScalar(1.4);
 }},
 'l3-use-mill':{size:[900,560],stage:{cam:[.4,2.6,9.5],target:[0,1.8,0],table:false,backdrop:'sky'},build(s){
  ground(s,grassTexture(s));const wood=s.phys({color:'#8a6238',roughness:.7});const w=water(s);
  const wheel=new THREE.Group();wheel.position.set(.6,2.0,0);s.scene.add(wheel);
  for(const z of [-.4,.4])s.mesh(new THREE.TorusGeometry(1.5,.08,12,48),wood,wheel).position.z=z;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,p=s.mesh(new THREE.BoxGeometry(.14,.62,.9),wood,wheel);p.position.set(Math.cos(a)*1.35,Math.sin(a)*1.35,0);p.rotation.z=a+Math.PI/2;}
  s.mesh(new THREE.CylinderGeometry(.12,.12,1.4,16),wood,wheel).rotation.x=Math.PI/2;
  s.rbox(2.6,.22,.7,.05,wood,-1.6,3.7,0);s.rbox(2.4,.1,.5,.03,w,-1.6,3.84,0);s.rbox(.26,1.0,.5,.04,w,-.35,3.25,0);
  const ar=arrow(s,s.scene);ar.position.set(-.35,2.6,.9);ar.quaternion.setFromUnitVectors(UP,new THREE.Vector3(0,-1,0));
 }},
 'l3-use-dam':{size:[900,560],stage:{cam:[2.2,4.0,11.5],target:[.6,1.3,0],table:false,backdrop:'sky'},build(s){
  ground(s,grassTexture(s));const concrete=s.phys({color:'#b9c0c4',roughness:.6});const w=water(s);
  const shape=new THREE.Shape();shape.moveTo(-1.1,0);shape.lineTo(1.1,0);shape.lineTo(.3,3.2);shape.lineTo(-.3,3.2);shape.closePath();
  const g=new THREE.ExtrudeGeometry(shape,{depth:5,bevelEnabled:false});g.translate(0,0,-2.5);s.mesh(g,concrete);
  s.rbox(4.2,2.8,5,.05,w,-3.2,1.4,0);
  s.rbox(1.5,1.1,1.4,.08,s.phys({color:'#d9dfe2',roughness:.5}),2.4,.55,0);s.rbox(1.7,.18,1.6,.04,s.phys({color:'#5a6f7e'}),2.4,1.19,0);
  s.mesh(new THREE.CylinderGeometry(.18,.18,1.6,16),concrete).position.set(1.25,.5,0);s.scene.children.at(-1).rotation.z=Math.PI/2;
  s.rbox(3,.08,.7,.03,w,4.6,.06,0);
  s.label('전기',{size:.45}).position.set(2.4,1.8,0);
  const ar=arrow(s,s.scene);ar.position.set(.9,2.6,1.6);ar.quaternion.setFromUnitVectors(UP,new THREE.Vector3(1,-1.1,0).normalize());
 }},
 'l3-spring-10-100':{size:[1200,900],stage:{cam:[0,2.6,9.5],target:[0,2.4,0],backdrop:'studio'},build(s){
  const steel=s.mat({color:'#d3dade',metalness:1,roughness:.24}),dark=s.phys({color:'#2f4656',roughness:.4,clearcoat:.5});
  s.rbox(5.2,.22,.5,.06,dark,0,4.5,0);for(const x of [-2.4,2.4])s.mesh(new THREE.CylinderGeometry(.08,.08,4.5,16),steel).position.set(x,2.25,0);
  const brass=s.phys({color:'#d3b05a',metalness:.9,roughness:.3});
  for(const [x,len,r,h,text] of [[-1.1,.9,.2,.28,'10 g'],[1.1,2.3,.38,.6,'100 g']]){
   const spring=new THREE.Mesh(helixGeometry(len),steel);spring.castShadow=true;spring.position.set(x,4.38,0);s.scene.add(spring);
   s.mesh(new THREE.CylinderGeometry(r,r,h,40),brass).position.set(x,4.38-len-h/2-.05,0);
   s.label(text,{size:.5}).position.set(x+1.0,4.38-len-h/2,0);
  }
 }},
 'l3-weigh-earth':{size:[900,720],stage:{cam:[1.8,3.0,10.4],target:[0,2.4,0],table:false,backdrop:'sky'},build(s){weighScene(s,'earth');}},
 'l3-weigh-moon':{size:[900,720],stage:{cam:[1.8,3.0,10.4],target:[0,2.4,0],table:false,backdrop:'space'},build(s){weighScene(s,'moon');}},
 'l3-graph-board':{size:[1200,900],stage:{cam:[1.0,3.4,12.8],target:[1.0,3.4,0],backdrop:'studio'},build(s){graphScene(s,false);}},
 'l3-graph-board-answer':{size:[1200,900],stage:{cam:[1.0,3.4,12.8],target:[1.0,3.4,0],backdrop:'studio'},build(s){graphScene(s,true);}}
};
function weighScene(s,place){
 const steel=s.mat({color:'#d3dade',metalness:1,roughness:.24}),dark=s.phys({color:'#2f4656',roughness:.4,clearcoat:.5});
 ground(s,place==='moon'?moonTexture(s):grassTexture(s));
 if(place==='moon'){const e=s.mesh(new THREE.SphereGeometry(1.1,48,32),s.mat({map:earthTexture(s),roughness:.7}),s.scene,{cast:false,receive:false});e.position.set(-6,6.4,-12);}
 s.rbox(2.4,.22,1.4,.08,dark,-.3,.11,0);s.mesh(new THREE.CylinderGeometry(.09,.09,4.6,24),steel).position.set(-1.2,2.5,0);s.rbox(1.9,.16,.2,.05,steel,-.35,4.75,0);
 s.mesh(new THREE.CylinderGeometry(.24,.24,1.0,32),s.phys({color:'#1c8783',roughness:.35,clearcoat:.6})).position.set(.4,4.15,0);
 const n=place==='moon'?9.8:58.8,len=.5+1.6*(n/58.8);
 const spring=new THREE.Mesh(helixGeometry(len),steel);spring.castShadow=true;spring.position.set(.4,3.62,0);s.scene.add(spring);
 s.mesh(new THREE.TorusGeometry(.1,.025,10,24),steel).position.set(.4,3.62-len-.08,0);
 s.rbox(.9,.8,.9,.1,s.phys({color:'#c99a5b',roughness:.5,clearcoat:.3}),.4,3.62-len-.62,0);
 s.label(`${place==='moon'?'달':'지구'} ${n} N`,{size:.62}).position.set(1.75,3.5,0);
}
function graphScene(s,answer){
 const BW=8,BH=6,BX=1.0,BY=3.4;
 s.rbox(BW+.4,BH+.4,.3,.1,s.phys({color:'#8a6b3c',roughness:.5}),BX,BY,-.2);
 s.mesh(new THREE.PlaneGeometry(BW,BH),s.mat({map:boardTexture(s),roughness:.9}),s.scene,{cast:false}).position.set(BX,BY,-.03);
 if(!answer)return;
 const PX=x=>BX-BW/2+(220+x*200)/1600*BW,PY=y=>BY+BH/2-(1040-y*15.5)/1200*BH;
 const dot=s.phys({color:'#ff6a4d',roughness:.3,clearcoat:.7,emissive:'#5a1a10'});
 s.mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(PX(0),PY(0),.1),new THREE.Vector3(PX(6.3),PY(6.3*9.8),.1)),2,.05,10),dot);
 for(const [x,y] of [[1,9.8],[6,58.8]]){s.mesh(new THREE.SphereGeometry(.17,24,16),dot).position.set(PX(x),PY(y),.14);s.label(`(${x}, ${y})`,{size:.38}).position.set(PX(x)+.8,PY(y)+.35,.2);}
}

// ───────── 1·2·4차시 정지 그림(2026-10-12 추가) ─────────
// 칠판 그래프(일반형): xs 눈금, ys 눈금, 축 이름. points/line은 답 판에서만.
function genericBoardTexture(s,{xs,xMax,ys,yMax,xLabel,yLabel,W=1600,H=1200,small=false}){
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#21483b';g.fillRect(0,0,W,H);
 const L=small?150:230,B=small?H-150:H-170,X=x=>L+x/xMax*(W-L-140),Y=y=>B-y/yMax*(B-120);
 g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=3;g.setLineDash([14,12]);
 for(const x of xs){g.beginPath();g.moveTo(X(x),Y(0));g.lineTo(X(x),Y(yMax));g.stroke();}
 for(const y of ys){g.beginPath();g.moveTo(X(0),Y(y));g.lineTo(X(xMax),Y(y));g.stroke();}
 g.setLineDash([]);g.strokeStyle='#f4f1e6';g.lineWidth=8;g.beginPath();g.moveTo(X(0),Y(yMax)-20);g.lineTo(X(0),Y(0));g.lineTo(X(xMax)+40,Y(0));g.stroke();
 const font=n=>`800 ${n}px "Pretendard Variable","Segoe UI","Malgun Gothic",sans-serif`;
 g.fillStyle='#f4f1e6';
 if(xs.length){g.font=font(small?60:46);g.textAlign='center';g.fillText('0',X(0),Y(0)+62);for(const x of xs)g.fillText(String(x),X(x),Y(0)+62);g.textAlign='right';for(const y of ys)g.fillText(String(y),X(0)-20,Y(y)+16);}
 g.font=font(small?62:50);g.textAlign='left';g.fillText(yLabel,X(0)-(small?60:40),small?92:76);g.textAlign='right';g.fillText(xLabel,W-60,Y(0)+(small?120:130));
 return {tex:s.canvasTex(c),X:x=>X(x)/W,Y:y=>Y(y)/H};
}
function board(s,{x=0,y=3.4,w=8,h=6,cfg,points=[],line=null,dot='#ff6a4d'}){
 s.rbox(w+.4,h+.4,.3,.1,s.phys({color:'#8a6b3c',roughness:.5}),x,y,-.2);
 const t=genericBoardTexture(s,cfg);
 s.mesh(new THREE.PlaneGeometry(w,h),s.mat({map:t.tex,roughness:.9}),s.scene,{cast:false}).position.set(x,y,-.03);
 const P=(px,py)=>new THREE.Vector3(x-w/2+t.X(px)*w,y+h/2-t.Y(py)*h,.12);
 const m=s.phys({color:dot,roughness:.3,clearcoat:.7,emissive:'#5a1a10'});
 if(line){const pts=line.map(([a,b])=>P(a,b));s.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'catmullrom',0),Math.max(2,pts.length*8),.05,10),m);}
 for(const [a,b] of points){s.mesh(new THREE.SphereGeometry(.16,24,16),m).position.copy(P(a,b));if(cfg.tags!==false)s.label(`(${a}, ${b})`,{size:.36}).position.copy(P(a,b).add(new THREE.Vector3(.72,.32,.1)));}
}
const springCfg=step=>({xs:[10,20,30],xMax:33,ys:[step,step*2,step*3,step*4],yMax:step*4.3,xLabel:'추의 무게 (g)',yLabel:'늘어난 길이 (cm)'});
function helixPair(s,{left,right,labels=['A','B']}){
 for(const [x,o,t] of [[-1.4,left,labels[0]],[1.4,right,labels[1]]]){
  const mat=s.phys({color:o.color||'#c9d1d6',metalness:o.metal??1,roughness:.25});
  const pts=[];const turns=10,len=3,R=o.radius||.32;for(let i=0;i<=turns*28;i++){const k=i/(turns*28),a=k*turns*Math.PI*2;pts.push(new THREE.Vector3(x+Math.cos(a)*R,4.4-k*len,Math.sin(a)*R));}
  const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),turns*28,o.wire||.045,10),mat);m.castShadow=true;s.scene.add(m);s.geometries.add(m.geometry);
  s.label(t,{size:.6}).position.set(x,.8,.4);
 }
 s.rbox(5.2,.2,.5,.06,s.phys({color:'#2f4656',roughness:.4}),0,4.6,0);
}
Object.assign(scenes,{
 'l2-graph':{size:[1200,900],stage:{cam:[0,3.4,12.8],target:[0,3.4,0],backdrop:'studio'},build(s){board(s,{cfg:springCfg(3)});}},
 'l2-graph-answer':{size:[1200,900],stage:{cam:[0,3.4,12.8],target:[0,3.4,0],backdrop:'studio'},build(s){board(s,{cfg:springCfg(3),points:[[10,3],[20,6],[30,9]],line:[[0,0],[10,3],[20,6],[30,9]]});}},
 'l2-graph-b12':{size:[1200,900],stage:{cam:[0,3.4,12.8],target:[0,3.4,0],backdrop:'studio'},build(s){board(s,{cfg:springCfg(4)});}},
 'l2-graph-b12-answer':{size:[1200,900],stage:{cam:[0,3.4,12.8],target:[0,3.4,0],backdrop:'studio'},build(s){board(s,{cfg:springCfg(4),points:[[10,4],[20,8],[30,12]],line:[[0,0],[10,4],[20,8],[30,12]]});}},
 'l2-graph-choices':{size:[1200,860],stage:{cam:[0,3.3,15.5],target:[0,3.3,0],backdrop:'studio'},build(s){
  const cfg={xs:[],xMax:10,ys:[],yMax:10,xLabel:'물체의 무게',yLabel:'늘어난 길이',small:true,tags:false};
  const lines=[[[0,9],[9,0.5]],[[0,4],[9,9.2]],[[0,0],[9,9.2]],[[0,6],[9,6]]];
  lines.forEach((line,i)=>{const x=i%2?3.1:-3.1,y=i<2?5.2:1.6;board(s,{x,y,w:5.6,h:3.2,cfg,line});s.label('①②③④'[i],{size:.7}).position.set(x-3.3,y+1.5,.3);});
 }},
 'l2-factor-material':{size:[900,900],stage:{cam:[0,2.8,10.5],target:[0,2.6,0],backdrop:'studio'},build(s){helixPair(s,{left:{color:'#c9d1d6'},right:{color:'#d39a5b',metal:.9},labels:['재질 A','재질 B']});}},
 'l2-factor-wire':{size:[900,900],stage:{cam:[0,2.8,10.5],target:[0,2.6,0],backdrop:'studio'},build(s){helixPair(s,{left:{wire:.03},right:{wire:.08},labels:['가는 철사','굵은 철사']});}},
 'l2-factor-diameter':{size:[900,900],stage:{cam:[0,2.8,10.5],target:[0,2.6,0],backdrop:'studio'},build(s){helixPair(s,{left:{radius:.24},right:{radius:.48},labels:['작은 지름','큰 지름']});}},
 'l2-tool-expander':{size:[900,700],stage:{cam:[0,2.6,9.5],target:[0,2.2,0],backdrop:'studio'},build(s){
  const grip=s.phys({color:'#1c2f3b',roughness:.6}),steel=s.mat({color:'#d3dade',metalness:1,roughness:.24});
  for(const x of [-2.6,2.6]){const h=s.mesh(new THREE.CylinderGeometry(.22,.22,1.6,24),grip);h.position.set(x,2.2,0);s.rbox(.5,.18,.3,.05,steel,x+(x<0?.3:-.3),2.2,0);}
  for(const z of [-.18,0,.18]){const pts=[];const n=14*24;for(let i=0;i<=n;i++){const k=i/n,a=k*14*Math.PI*2;pts.push(new THREE.Vector3(-2.3+k*4.6,2.2+Math.cos(a)*.12+z*.0,z+Math.sin(a)*.12));}s.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n,.025,8),steel);}
 }},
 'l1-leaf-spring':{size:[900,700],stage:{cam:[0,2.4,9],target:[0,1.8,0],backdrop:'studio'},build(s){
  const steel=s.phys({color:'#7f8c95',metalness:.8,roughness:.35});
  [3.6,3.0,2.4,1.8].forEach((len,i)=>{const r=6,ang=len/r;const sh=new THREE.Shape();sh.absarc(0,-r,r,Math.PI/2-ang/2,Math.PI/2+ang/2,false);sh.absarc(0,-r,r-.12,Math.PI/2+ang/2,Math.PI/2-ang/2,true);const g=new THREE.ExtrudeGeometry(sh,{depth:.7,bevelEnabled:false});g.translate(0,0,-.35);const m=s.mesh(g,steel);m.position.y=1.6-i*.13;});
  s.rbox(.5,.5,.9,.05,s.phys({color:'#2f4656'}),0,1.1,0);
  for(const x of [-1.85,1.85]){const e=s.mesh(new THREE.TorusGeometry(.16,.05,12,24),steel);e.position.set(x,1.36,0);}
 }},
 'l4-level':{size:[1200,700],stage:{cam:[0,.2,15],target:[0,0,0],table:false,backdrop:'space'},build(s){
  const red=s.phys({color:'#d13a35',roughness:.4}),blue='#2f7fd1';
  for(const [cx,deg] of [[-3.4,40],[3.4,180]]){
   const e=s.mesh(new THREE.SphereGeometry(2.2,64,48),s.mat({map:earthTexture(s),roughness:.75}));e.position.set(cx,0,0);e.rotation.y=cx;
   const a=deg*Math.PI/180,dir=new THREE.Vector3(Math.sin(a),Math.cos(a),0),p=new THREE.Vector3(cx,0,0).addScaledVector(dir,2.25);
   const plane=s.mesh(new THREE.BoxGeometry(2.6,.06,1.6),red);plane.position.copy(p);plane.quaternion.setFromUnitVectors(UP,dir);
   const ar=arrow(s,s.scene,blue);ar.position.copy(new THREE.Vector3(cx,0,0).addScaledVector(dir,3.4));ar.quaternion.setFromUnitVectors(UP,dir.clone().negate());
  }
  s.label('빨간 판(수평)은 중력 방향과 수직',{size:.5}).position.set(0,3.1,0);
 }}
});
// 양팔저울 한 칸(교재 33쪽). target이 있으면 왼쪽 접시에 물체, left/right 추를 올린다.
function panScene(s,{target=null,left=[],right=[]}){
 const steel=s.mat({color:'#d3dade',metalness:1,roughness:.24}),brass=s.phys({color:'#d3b05a',metalness:.9,roughness:.28});
 s.rbox(3.6,.3,1.6,.12,s.phys({color:'#51657a',roughness:.45,clearcoat:.5}),0,.15,0);
 s.mesh(new THREE.CylinderGeometry(.14,.18,3.4,32),steel).position.set(0,1.7,0);
 s.rbox(6.6,.18,.34,.06,brass,0,3.4,0);s.mesh(new THREE.SphereGeometry(.2,24,16),brass).position.set(0,3.4,0);
 const panGeo=new THREE.LatheGeometry([[0,-.08],[.7,-.06],[.92,.04],[.98,.13],[.94,.14],[.88,.06],[.68,0],[0,-.02]].map(p=>new THREE.Vector2(...p)),48);s.geometries.add(panGeo);
 const look={1:[.24,.34,'#f2c94c'],3:[.32,.46,'#f2a07f'],9:[.44,.62,'#79a8dc']};
 for(const [side,x] of [['left',-3],['right',3]]){
  const pan=s.mesh(panGeo,s.mat({color:'#e7edf0',metalness:1,roughness:.22,side:THREE.DoubleSide}));pan.scale.set(1.3,1,1.3);pan.position.set(x,1.5,0);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3+Math.PI/2,top=new THREE.Vector3(x,3.35,0),bot=new THREE.Vector3(x+1.15*Math.cos(a),1.6,1.15*Math.sin(a)),d=bot.clone().sub(top);const m=s.mesh(new THREE.CylinderGeometry(.018,.018,1,6),steel);m.position.copy(top).addScaledVector(d,.5);m.scale.set(1,d.length(),1);m.quaternion.setFromUnitVectors(UP,d.normalize());}
  const items=side==='left'?left:right,slots=side==='left'?[[.55,0],[.2,.78],[.2,-.78]]:[[-.55,0],[.55,0],[0,.8]];
  items.forEach((w,i)=>{const [r,h,c]=look[w];const m=s.mesh(new THREE.CylinderGeometry(r,r*1.06,h,40),s.phys({color:c,metalness:.55,roughness:.3}));m.position.set(x+slots[i][0],1.6+h/2,slots[i][1]);s.label(`${w} g`,{size:.42}).position.set(x+slots[i][0],1.6+h+.38,slots[i][1]+.4);});
  if(side==='left'&&target!=null){s.rbox(.8,.78,.8,.1,s.phys({color:'#cfe3a2',roughness:.4,clearcoat:.5}),x-.6,1.99,0);s.label(`물체 ${target} g`,{size:.46}).position.set(x-.6,2.85,.5);}
 }
}
scenes['l4-pans-empty']={size:[900,560],stage:{cam:[0,2.7,10],target:[0,2.1,0],backdrop:'studio'},build(s){panScene(s,{});}};
for(let t=1;t<=13;t++)scenes[`l4-pans-${t}`]={size:[900,560],stage:{cam:[0,2.7,10],target:[0,2.1,0],backdrop:'studio'},build(s){const p=weightPlans(t)[0];panScene(s,{target:t,left:p.left,right:p.right});}};

export const stillNames=Object.keys(scenes);
export function stillSize(name){return scenes[name].size;}
export function renderLesson3Still(name,host){
 const sc=scenes[name];if(!sc)throw new Error('알 수 없는 그림: '+name);
 const stage=createStage(host,{...sc.stage,orbit:false});
 sc.build(stage);stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}
