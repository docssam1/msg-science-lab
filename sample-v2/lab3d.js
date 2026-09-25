import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {SpringMotion,clamp,finite,apparentReading} from './physics.js';
import {createEverydayAssembly,roundedBoxGeometry} from './everyday-objects-3d.js';
import {inquiryScale} from './everyday-objects.js';

// Visual layer only. Every value that decides a reading (y0, pitch, pointer top y/z, scale plane z .04,
// tick y positions, hit planes, hook/weight anchors, camera homes) is exactly the original model's.
const FONT='"Pretendard Variable","Pretendard","Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans KR","Noto Sans CJK KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif',INK='#1b3446';
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
// Rounded rectangle in the XZ plane (shape y = -z, so rotateX(-PI/2) extrudes it along +Y).
function rrShape(w,d,r,cx=0,cz=0,P=THREE.Shape){const s=new P(),a=cx-w/2,b=-cz-d/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.absarc(a+w-r,b+r,r,-Math.PI/2,0);s.lineTo(a+w,b+d-r);s.absarc(a+w-r,b+d-r,r,0,Math.PI/2);s.lineTo(a+r,b+d);s.absarc(a+r,b+d-r,r,Math.PI/2,Math.PI);s.lineTo(a,b+r);s.absarc(a+r,b+r,r,Math.PI,Math.PI*1.5);return s;}
function dither(ctx,w,h,a=3){const d=ctx.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const n=(Math.random()-.5)*a;p[i]+=n;p[i+1]+=n;p[i+2]+=n;}ctx.putImageData(d,0,0);}
// Small procedural photo studio (bright ceiling, soft boxes, darker floor) baked into a PMREM reflection map.
function studioEnvironment(renderer){try{
 const room=new THREE.Scene(),geo=new THREE.SphereGeometry(20,32,16),col=[],p=geo.attributes.position,top=new THREE.Color('#ffffff'),mid=new THREE.Color('#e3e9e9'),low=new THREE.Color('#6f7d80'),c=new THREE.Color();
 for(let i=0;i<p.count;i++){const y=p.getY(i)/20;c.copy(y>0?mid.clone().lerp(top,y):mid.clone().lerp(low,Math.min(1,-y*1.7)));col.push(c.r,c.g,c.b);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));room.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
 for(const [x,y,z,w,h,k] of [[9,7,7,7,9,2.6],[-10,5,4,4,9,1.5],[0,15,0,12,10,1.8],[-3,6,-12,12,5,1.3],[6,-2,-8,6,2,.6]]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(k,k,k),side:THREE.DoubleSide}));pl.position.set(x,y,z);pl.lookAt(0,0,0);room.add(pl);}
 const pm=new THREE.PMREMGenerator(renderer),t=pm.fromScene(room,.03).texture;pm.dispose();room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return t;
}catch{return null;}}

export function mountLab(host, {mode='compare',onChange=()=>{},onPick=()=>{},onRelease=()=>{},onAdjust=()=>{}}={}) {
 const inquiry=mode==='inquiry',scaleMax=inquiry?inquiryScale.max:30,scaleStep=inquiry?inquiryScale.step:1,zeroLimit=inquiry?inquiryScale.zeroLimit:6;
 const measure=mode==='measure',compress=mode==='compression',plain=measure||compress||mode==='elastic';
 host.innerHTML='<span class="scene-tag">3D 가상 교구 · 관찰 모형</span><span class="scene-hint">'+(mode==='eye'?'눈높이를 바꾼 뒤 눈금을 직접 누르세요':mode==='target'||mode==='elastic'?'고리를 잡아 아래로 당겨 보세요':mode==='compression'?'위쪽 누름판을 잡고 내려 보세요':'손가락 / 마우스로 돌려 볼 수 있어요')+'</span>';
 const canvas=document.createElement('canvas');host.prepend(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.0;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.1,80);camera.position.set(4,1.6,11.8);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,-.25,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.86;controls.minPolarAngle=Math.PI*.10;
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const canvasTex=(c,srgb=true)=>{const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=aniso;textures.add(t);return t;};
 // Studio: reflection environment, vignette backdrop, soft key / fill / rim lights.
 const env=studioEnvironment(renderer);if(env){textures.add(env);scene.environment=env;scene.environmentIntensity=.62;}
 {const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),g=x.createRadialGradient(256,200,10,256,260,420);g.addColorStop(0,'#fdfefe');g.addColorStop(.5,'#eaf0ef');g.addColorStop(1,'#c9d5d5');x.fillStyle=g;x.fillRect(0,0,512,512);dither(x,512,512);scene.background=canvasTex(c);}
 const hemi=new THREE.HemisphereLight('#ffffff','#b3c1c0',.75);scene.add(hemi);
 const light=new THREE.DirectionalLight('#fff6ea',2.3);light.position.set(2.6,10,5.2);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:1,far:30});light.shadow.bias=-.0004;light.shadow.normalBias=.02;light.shadow.radius=4;scene.add(light);
 const fill=new THREE.DirectionalLight('#dce9ff',.7);fill.position.set(-6,2.5,4);scene.add(fill);
 const rim=new THREE.DirectionalLight('#ffffff',1.5);rim.position.set(-3,5,-7);scene.add(rim);
 const root=new THREE.Group();scene.add(root);
 const mat=(o)=>{const m=new THREE.MeshStandardMaterial(o);materials.add(m);return m;};
 const phys=(o)=>{const m=new THREE.MeshPhysicalMaterial(o);materials.add(m);return m;};
 const steel=mat({color:'#d3dade',metalness:1,roughness:.24});
 const chrome=mat({color:'#e4e9ec',metalness:1,roughness:.14});
 const springSteel=mat({color:'#c9d1d6',metalness:1,roughness:.2});
 const blue=phys({color:'#17435c',metalness:0,roughness:.4,clearcoat:.7,clearcoatRoughness:.22});
 const castIron=phys({color:'#223747',metalness:.2,roughness:.55,clearcoat:.35,clearcoatRoughness:.4});
 const copper=mat({color:'#caa060',metalness:1,roughness:.28});
 const orange=phys({color:'#ea5f36',metalness:0,roughness:.32,clearcoat:.6,clearcoatRoughness:.2});
 const teal=phys({color:'#1c8783',metalness:0,roughness:.36,clearcoat:.6,clearcoatRoughness:.25});
 const porcelain=phys({color:'#dfe6e6',roughness:.5,clearcoat:.3});
 const white=mat({color:'#ffffff',roughness:.4});
 function mesh(g,m,parent=root){geometries.add(g);let o=new THREE.Mesh(g,m);parent.add(o);o.castShadow=true;o.receiveShadow=true;return o;}
 function rbox(w,h,d,r,m,x,y,z,parent=root){let o=mesh(roundedBoxGeometry(w,h,d,r),m,parent);o.position.set(x,y,z);return o;}
 function cyl(r,h,m,x,y,z,parent=root,seg=56){let o=mesh(new THREE.CylinderGeometry(r,r,h,seg),m,parent);o.position.set(x,y,z);return o;}
 function lathe(pts,m,x,y,z,parent=root,seg=64){let o=mesh(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(...p)),seg),m,parent);o.position.set(x,y,z);return o;}
 function tube(points,r,m,parent=root,closed=false,seg=72){let c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed);return mesh(new THREE.TubeGeometry(c,seg,r,14,closed),m,parent);}
 function extrudeY(shape,h,m,y,parent=root,bevel=0){const g=new THREE.ExtrudeGeometry(shape,{depth:h,curveSegments:14,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3});g.rotateX(-Math.PI/2);let o=mesh(g,m,parent);o.position.y=y;return o;}
 // Label card: 3x canvas, white card, thin border, soft blue shadow (same language as the science-lab kit).
 function label(text,x,y,z,{size=.17,color=INK,anchor=.5}={}){
  const S=3,fs=46,c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font=`700 ${fs}px ${FONT}`;const tw=Math.ceil(ctx.measureText(text).width),pad=26,blur=12,W=tw+pad*2,H=fs+28,w=W+blur*2,h=H+blur*2+6;
  c.width=w*S;c.height=h*S;ctx.scale(S,S);ctx.save();ctx.shadowColor='rgba(30,90,140,.24)';ctx.shadowBlur=blur;ctx.shadowOffsetY=4;ctx.fillStyle='#fff';rr(ctx,blur,blur,W,H,H/2);ctx.fill();ctx.restore();
  const g=ctx.createLinearGradient(0,blur,0,blur+H);g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#eef5f6');ctx.fillStyle=g;rr(ctx,blur,blur,W,H,H/2);ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#d3e0e3';rr(ctx,blur+1,blur+1,W-2,H-2,H/2-1);ctx.stroke();
  ctx.font=`700 ${fs}px ${FONT}`;ctx.fillStyle=color;ctx.textBaseline='middle';ctx.fillText(text,blur+pad,blur+H/2+2);
  let m=new THREE.SpriteMaterial({map:canvasTex(c),transparent:true,depthTest:false,depthWrite:false,toneMapped:false});materials.add(m);let o=new THREE.Sprite(m);o.renderOrder=10;o.center.set(anchor,.5);o.scale.set(size*w/H,size*h/H,1);o.position.set(x,y,z);root.add(o);return o;
 }
 // Printed dial plate: ticks & numbers drawn at their exact world coordinates onto one crisp canvas at z=.04.
 function printedPlate(x0,x1,yb,yt,draw,{bg='#fbfbf8',K=420,radius=.045}={}){
  const W=Math.round((x1-x0)*K),H=Math.round((yt-yb)*K),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),X=x=>(x-x0)/(x1-x0)*W,Y=y=>(yt-y)/(yt-yb)*H;
  rr(g,0,0,W,H,radius*K);g.save();g.clip();const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,bg);gr.addColorStop(1,'#eef1ef');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(27,52,70,.14)';g.lineWidth=2;rr(g,.018*K,.018*K,W-.036*K,H-.036*K,(radius-.012)*K);g.stroke();
  draw(g,X,Y,K);g.restore();
  const m=mat({map:canvasTex(c),roughness:.42,alphaTest:.5});const o=mesh(new THREE.PlaneGeometry(x1-x0,yt-yb),m);o.position.set((x0+x1)/2,(yb+yt)/2,.04);o.castShadow=false;
  const back=rbox(x1-x0+.03,yt-yb+.03,.07,.035,porcelain,(x0+x1)/2,(yb+yt)/2,.002);return {plate:o,back};
 }
 const tickRect=(g,X,Y,K,x0,x1,y,t,col=INK)=>{g.fillStyle=col;g.fillRect(X(x0),Y(y)-t*K/2,(x1-x0)*K,t*K);};
 const print=(g,X,Y,K,s,x,y,size,{col=INK,weight=700,spacing=0}={})=>{g.font=`${weight} ${size*K}px ${FONT}`;if('letterSpacing' in g)g.letterSpacing=spacing+'px';g.fillStyle=col;g.textAlign='center';g.textBaseline='middle';g.fillText(s,X(x),Y(y)+size*K*.06);};
 // Studio floor: soft pool of light that fades into the backdrop, plus a contact shadow under the base.
 {const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),g=x.createRadialGradient(256,256,0,256,256,256);g.addColorStop(0,'rgba(246,249,248,1)');g.addColorStop(.45,'rgba(236,242,241,.95)');g.addColorStop(.78,'rgba(222,231,230,.55)');g.addColorStop(1,'rgba(214,224,224,0)');x.fillStyle=g;x.fillRect(0,0,512,512);
  const floor=mesh(new THREE.CircleGeometry(10,96),mat({map:canvasTex(c),roughness:.85,transparent:true,depthWrite:false}),scene);floor.rotation.x=-Math.PI/2;floor.position.set(-.4,-3.735,-.6);floor.castShadow=false;floor.renderOrder=-2;}
 {const c=document.createElement('canvas');c.width=256;c.height=160;const x=c.getContext('2d');x.filter='blur(14px)';x.fillStyle='rgba(12,30,40,.55)';rr(x,40,34,176,92,30);x.fill();
  const cs=mesh(new THREE.PlaneGeometry(3.9,2.45),new THREE.MeshBasicMaterial({map:canvasTex(c),transparent:true,depthWrite:false,opacity:.75}),scene);materials.add(cs.material);cs.rotation.x=-Math.PI/2;cs.position.set(0,-3.728,-.1);cs.castShadow=false;cs.receiveShadow=false;cs.renderOrder=-1;}
 // Stand: bevelled cast base with feet, turned collar, satin steel pillar and arm, S-hook to the scale handle.
 rbox(3.0,.16,1.6,.06,castIron,0,-3.65,-.1);
 {const foot=mat({color:'#2b2f33',roughness:.9});for(const [fx,fz] of [[-1.32,-.78],[1.32,-.78],[-1.32,.58],[1.32,.58]])cyl(.09,.02,foot,fx,-3.735,fz,root,20).castShadow=false;}
 lathe([[0,0],[.2,0],[.21,.02],[.19,.06],[.14,.1],[.12,.16],[0,.16]],steel,-1.0,-3.57,-.1);
 cyl(.10,6.6,steel,-1.0,-.28,-.1);tube([[-1,3,-.1],[-1,3.3,-.1],[-.7,3.35,-.1],[.08,3.35,-.1]],.10,steel);
 {const cap=mesh(new THREE.SphereGeometry(.1,24,12,0,Math.PI*2,0,Math.PI/2),steel);cap.rotation.z=-Math.PI/2;cap.position.set(.08,3.35,-.1);}
 const hand=tube([[-.25,2.61,.16],[-.25,2.91,.16],[0,3.08,.16],[.25,2.91,.16],[.25,2.61,.16]],.065,chrome);
 const sHook=new THREE.Group();root.add(sHook);{const r=mesh(new THREE.TorusGeometry(.13,.022,12,40),chrome,sHook);r.rotation.y=Math.PI/2;r.position.set(0,3.35,-.1);tube([[0,3.23,-.1],[0,3.18,-.02],[0,3.12,.1],[0,3.07,.16]],.024,chrome,sHook,false,24);}
 // Housing (hidden in the open-spring modes): rounded head with zero dial, acrylic window, bottom collar.
 const HX=.30,HZ=.22,HW=1.64,HD=.56,TB=-1.17,TT=1.90;
 const topCap=rbox(1.72,.72,.64,.1,blue,HX,2.25,HZ);
 const bottomCap=new THREE.Group();root.add(bottomCap);{const s=rrShape(1.72,.64,.13,HX,HZ);s.holes.push(rrShape(1.46,.40,.08,HX,HZ,THREE.Path));extrudeY(s,.16,blue,-1.36,bottomCap,.018);}
 // Acrylic: reflections are added at full strength (premultiplied-style blend) while the body only faintly tints what is behind, so the dial stays razor sharp.
 const glassMat=phys({color:'#000000',metalness:0,roughness:.06,envMapIntensity:.85,transparent:true,opacity:.07,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor});
 const glass=new THREE.Group();root.add(glass);
 {const s=rrShape(HW,HD,.17,HX,HZ);s.holes.push(rrShape(HW-.05,HD-.05,.145,HX,HZ,THREE.Path));const g=extrudeY(s,TT-TB,glassMat,TB,glass);g.castShadow=false;g.renderOrder=2;
  const c=document.createElement('canvas');c.width=16;c.height=256;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.18,'rgba(255,255,255,.9)');gr.addColorStop(.7,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,16,256);
  const sm=new THREE.MeshBasicMaterial({map:canvasTex(c),transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});materials.add(sm);
  for(const [x0,w,o] of [[-.27,.07,1],[-.17,.018,.8],[.88,.035,.55]]){const st=mesh(new THREE.PlaneGeometry(w,TT-TB-.18),sm,glass);st.position.set(x0,(TT+TB)/2,HZ+HD/2+.004);st.castShadow=false;st.receiveShadow=false;st.renderOrder=3;st.scale.y=o;}}
 // Zero-adjust dial: one knurled wheel + face + index mark; the group spins about the viewing axis.
 const knob=new THREE.Group();root.add(knob);knob.position.set(0,2.17,.55);
 {const g=new THREE.CylinderGeometry(.23,.23,.27,120,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=Math.hypot(x,z);if(r>.2){const a=Math.atan2(z,x),k=(.215+.017*Math.pow(Math.abs(Math.cos(a*15)),.6))/r;p.setX(i,x*k);p.setZ(i,z*k);}}g.computeVertexNormals();const w=mesh(g,teal,knob);w.rotation.x=Math.PI/2;
  const face=mesh(new THREE.CylinderGeometry(.17,.18,.03,64),phys({color:'#e9f1f0',roughness:.3,clearcoat:.8}),knob);face.rotation.x=Math.PI/2;face.position.z=.145;
  const hub=mesh(new THREE.CylinderGeometry(.05,.05,.03,32),steel,knob);hub.rotation.x=Math.PI/2;hub.position.z=.16;
  rbox(.028,.12,.012,.006,orange,0,.095,.165,knob);}
 const zeroMark=rbox(.03,.07,.012,.005,white,0,2.475,HZ+.325);
 {const c=document.createElement('canvas');c.width=640;c.height=240;const x=c.getContext('2d');x.fillStyle='rgba(255,255,255,.92)';x.font=`700 70px ${FONT}`;x.textBaseline='middle';x.fillText('용수철저울',24,84);x.fillStyle='rgba(158,214,210,.95)';x.font=`700 46px ${FONT}`;if('letterSpacing' in x)x.letterSpacing='3px';x.fillText('측정 범위 0 – '+scaleMax+' N',26,170);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(24,128,300,3);
  const m=new THREE.MeshStandardMaterial({map:canvasTex(c),transparent:true,roughness:.4,depthWrite:false});materials.add(m);const nm=mesh(new THREE.PlaneGeometry(.8,.3),m,topCap);nm.position.set(.4,-.02,.321);nm.castShadow=false;nm.receiveShadow=false;}
 let moving=new THREE.Group();root.add(moving);
 const y0=measure?1.1:1.2,pitch=measure?.06:inquiry?2.1/inquiryScale.max:.07;
 const rod=cyl(.026,1.38,chrome,-.10,y0-.69,.32,moving,20);
 const pointer=rbox(.93,.055,.08,.014,orange,.12,y0-.0275,.38,moving);
 rbox(.9,.005,.004,.002,mat({color:'#8c2410',roughness:.5}),.12,y0-.0035,.421,moving).castShadow=false;
 const hook=tube([[-.10,y0-1.37,.32],[-.10,y0-1.58,.32],[.05,y0-1.72,.32],[.21,y0-1.59,.32],[.16,y0-1.48,.32]],.047,chrome,moving);
 {const e=mesh(new THREE.SphereGeometry(.047,20,12),chrome,moving);e.position.set(.16,y0-1.48,.32);e.castShadow=false;}
 const weight=new THREE.Group();moving.add(weight);weight.position.set(.04,y0-1.86,.31);
 // Slotted brass masses (one 10 g disc per 10 g in the measurement lesson), chamfered by a lathe profile.
 const discGeo=new THREE.LatheGeometry([[0,-.075],[.235,-.075],[.26,-.05],[.26,.05],[.235,.075],[0,.075]].map(p=>new THREE.Vector2(...p)),64);geometries.add(discGeo);
 let weightBody=new THREE.Group();weight.add(weightBody);const discs=[0,1,2].map(i=>{const d=new THREE.Mesh(discGeo,copper);d.castShadow=d.receiveShadow=true;d.position.y=-.035-i*.16;weightBody.add(d);return d;});
 cyl(.03,.46,chrome,0,-.2,0,weight,16).castShadow=false;lathe([[0,0],[.14,0],[.15,.02],[.15,.05],[.13,.07],[0,.07]],chrome,0,.04,0,weight);
 let weightHook=tube([[0,.1,0],[0,.17,0],[.10,.21,0],[.13,.14,0]],.02,chrome,weight,false,24);
 const ball=mesh(new THREE.SphereGeometry(.25,48,32),orange,weight);ball.position.y=-.2;ball.visible=false;
 let secondary=new THREE.Group();weight.add(secondary);secondary.position.y=-.23;secondary.visible=false;rbox(.5,.37,.28,.1,teal,0,0,0,secondary);rbox(.46,.018,.05,.009,mat({color:'#13343b',roughness:.6}),0,.18,0,secondary);rbox(.05,.09,.02,.01,steel,.2,.14,.13,secondary);
 const everyday=inquiry?createEverydayAssembly():null;
 if(everyday){moving.add(everyday.group);everyday.group.position.copy(weight.position);weight.visible=false;}
 // Helical tube buffer: fixed topology, only vertices/normals move.
 const turns=18,segs=432,radial=10,R=.135,wire=.026;
 const cg=new THREE.BufferGeometry(),pos=new Float32Array((segs+1)*(radial+1)*3),norm=new Float32Array(pos.length),idx=[];
 for(let i=0;i<segs;i++)for(let j=0;j<radial;j++){let a=i*(radial+1)+j,b=a+radial+1;idx.push(a,b,a+1,b,b+1,a+1);}
 cg.setAttribute('position',new THREE.BufferAttribute(pos,3));cg.setAttribute('normal',new THREE.BufferAttribute(norm,3));cg.setIndex(idx);
 const spring=mesh(cg,springSteel);const axis=compress?0:-.10;
 const _t=new THREE.Vector3(),_n=new THREE.Vector3(),_b=new THREE.Vector3(),_q=new THREE.Vector3();
 function springShape(top,bottom){
  const length=top-bottom;
  for(let i=0;i<=segs;i++){const t=i/segs,a=t*2*Math.PI*turns;_t.set(-R*Math.sin(a),-length/(2*Math.PI*turns),R*Math.cos(a)).normalize();_n.set(Math.cos(a),0,Math.sin(a));_b.crossVectors(_t,_n).normalize();
   for(let j=0;j<=radial;j++){const b=j/radial*Math.PI*2;_q.copy(_n).multiplyScalar(Math.cos(b)).addScaledVector(_b,Math.sin(b));let k=(i*(radial+1)+j)*3;pos[k]=axis+R*Math.cos(a)+_q.x*wire;pos[k+1]=top-length*t+_q.y*wire;pos[k+2]=.24+R*Math.sin(a)+_q.z*wire;norm[k]=_q.x;norm[k+1]=_q.y;norm[k+2]=_q.z;}
  }
  cg.attributes.position.needsUpdate=true;cg.attributes.normal.needsUpdate=true;cg.computeBoundingSphere();
 }
 // Dial plate (N) or measuring ruler (cm). Tick values, y positions and lengths are exactly the original ones.
 const tickGroup=new THREE.Group();root.add(tickGroup);const tickLabels=[];
 let inner;
 if(measure){
  const r=printedPlate(.44,1.12,-1.14,2.52,(g,X,Y,K)=>{for(let i=0;i<=16;i++){let y=2.10-i*.2;tickRect(g,X,Y,K,.44,i%5===0?.97:.81,y,i%5===0?.012:.008);print(g,X,Y,K,String(i),1.035,y,.07);}print(g,X,Y,K,'cm',.78,2.39,.085,{col:'#2a6f73'});},{bg:'#fdfcf7'});
  inner=r.back;tickGroup.add(r.plate);
 }else{
  const r=printedPlate(-.46,1.06,-1.12,2.36,(g,X,Y,K)=>{
   g.fillStyle=INK;g.fillRect(X(.316),Y(y0)-.004*K,.008*K,(scaleMax*pitch+.008)*K);
   for(let i=0;i<=Math.round(scaleMax/scaleStep);i++){let value=Number((i*scaleStep).toFixed(1)),y=y0-value*pitch,major=inquiry?i%10===0:i%5===0;tickRect(g,X,Y,K,.32,major?.71:.55,y,major?.011:.0062);if(major)print(g,X,Y,K,String(value),.86,y,.1);}
   print(g,X,Y,K,'N',.51,1.57,.19);print(g,X,Y,K,'MAX '+scaleMax+' N',.25,-1.04,.062,{col:'#bf5236',spacing:1});
  });
  inner=r.back;tickGroup.add(r.plate);
 }
 const transparent=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,visible:false});materials.add(transparent);
 const scaleHit=mesh(new THREE.PlaneGeometry(.80,measure?3.23:2.14),transparent);scaleHit.position.set(.70,measure?.50:.15,.042);scaleHit.castShadow=false;
 const hookHit=mesh(new THREE.SphereGeometry(.28,16,16),transparent,moving);hookHit.position.set(.07,y0-1.57,.32);hookHit.castShadow=false;
 const capHit=mesh(new THREE.BoxGeometry(.8,.3,.8),transparent);capHit.position.set(0,1.90,.24);capHit.visible=compress;
 // Compression rig: pedestal, chamfered base disc and a press plate with a grip.
 const compressBase=lathe([[0,-.08],[.4,-.08],[.42,-.06],[.42,.06],[.4,.08],[0,.08]],teal,0,-.3,.25);compressBase.visible=compress;
 const compressTop=new THREE.Group();root.add(compressTop);compressTop.position.set(0,1.85,.25);compressTop.visible=compress;
 lathe([[0,-.065],[.33,-.065],[.35,-.045],[.35,.045],[.33,.065],[0,.065]],teal,0,0,0,compressTop);lathe([[0,.06],[.12,.06],[.12,.1],[.08,.16],[0,.18]],steel,0,0,0,compressTop);
 const pedestal=new THREE.Group();root.add(pedestal);pedestal.visible=compress;cyl(.09,3.2,steel,0,-1.97,.25,pedestal,32);lathe([[0,0],[.34,0],[.35,.02],[.3,.07],[.12,.12],[0,.12]],castIron,0,-3.57,.25,pedestal);
 // Open-spring bracket (elastic / measure): spring and plate hang from one bar under the handle.
 const bracket=new THREE.Group();root.add(bracket);bracket.visible=plain&&!compress;
 {const x1=measure?.47:1.08,yb=measure?2.48:2.36,top=measure?2.1:2.15;rbox(x1+.52,.22,.52,.07,blue,(x1-.52)/2,yb+.11,.19,bracket);cyl(.028,yb-top+.04,chrome,-.10,(yb+top)/2,.24,bracket,16);}
 if(plain){glass.visible=false;topCap.visible=false;bottomCap.visible=false;knob.visible=false;zeroMark.visible=false;}
 if(compress){moving.visible=false;inner.visible=false;tickGroup.visible=false;tickLabels.forEach(x=>x.visible=false);hand.visible=false;sHook.visible=false;}
 // Rest-length guide (measurement lesson): dashed line + label card.
 const restLine=new THREE.Group();root.add(restLine);
 {const c=document.createElement('canvas');c.width=128;c.height=8;const x=c.getContext('2d');x.fillStyle='#1c8783';for(let i=0;i<128;i+=32)x.fillRect(i,0,20,8);const t=canvasTex(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(8,1);const m=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false});materials.add(m);const l=mesh(new THREE.PlaneGeometry(1.63,.014),m,restLine);l.position.set(.285,1.1,.4);l.castShadow=false;}
 restLine.visible=measure;
 let restNote=label('원래 길이 5 cm',-.6,1.1,.4,{size:.15,anchor:1});restNote.visible=measure;const noteH=restNote.scale.y/.15,noteAspect=restNote.scale.x/.15,_lp=new THREE.Vector3();
 const ring=mesh(new THREE.TorusGeometry(.32,.016,10,72),phys({color:'#f07a45',emissive:'#f07a45',emissiveIntensity:.35,roughness:.3,transparent:true,opacity:.85}),moving);ring.position.copy(hookHit.position);ring.visible=mode==='inquiry'||mode==='compare'||mode==='measure'||mode==='target'||mode==='elastic';ring.castShadow=false;
 [weightHook,rod].forEach(o=>o.castShadow=false);
 const ray=new THREE.Raycaster(),vec=new THREE.Vector2();
 let force=mode==='eye'?20:0,zero=mode==='zero'?4:0,eye='front',motion=new SpringMotion(force),disposed=false,raf,tween=null,drag=null,last=performance.now(),lastPaint=-999,version=0,settledLast=false;
 const home={pos:inquiry?new THREE.Vector3(.59,.2,13):new THREE.Vector3(4,1.6,11.8),target:inquiry?new THREE.Vector3(.59,.2,.04):new THREE.Vector3(0,-.25,0)};
 if(inquiry){camera.position.copy(home.pos);controls.target.copy(home.target);}
 const partPositions={handle:new THREE.Vector3(0,2.86,.16),zero:new THREE.Vector3(0,2.17,.55),spring:new THREE.Vector3(-.10,1.65,.24),pointer:new THREE.Vector3(.2,1.2,.38),scale:new THREE.Vector3(.66,.2,.04),hook:new THREE.Vector3(.08,-.4,.32)};
 function animateCamera(position,target,duration=950){tween={from:camera.position.clone(),to:position.clone(),fromTarget:controls.target.clone(),toTarget:target.clone(),start:performance.now(),duration};controls.enabled=false;}
 function focusPart(id){const p=partPositions[id]||partPositions.spring;animateCamera(p.clone().add(new THREE.Vector3(.6,.15,3.2)),p,1000);}
 function resetView(){if(inquiry&&force>0){const py=y0-(force+zero)*pitch;eye='front';animateCamera(new THREE.Vector3(.59,py,13),new THREE.Vector3(.59,py,.04));}else animateCamera(home.pos,home.target);}
 function focusObject(){if(!everyday||!everyday.objectId)return false;const center=everyday.group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,-.38,0));animateCamera(center.clone().add(new THREE.Vector3(1.7,1.05,3.25)),center,850);return true;}
 function setEye(which){eye=which;const py=y0-(force+zero)*pitch;const p=new THREE.Vector3(.59,py,.38);const delta=which==='high'?1.35:which==='low'?-1.35:0;animateCamera(new THREE.Vector3(.59,py+delta,3.2),new THREE.Vector3(.59,py,.05),800);}
 function setForce(v,{instant=false,shape,object}={}){v=finite(v);if(v<0||v>scaleMax)return false;force=v;motion.set(v,instant);if(everyday){everyday.set(force>0?object:null);canvas.dataset.object=everyday.objectId||'';}if(shape){weightBody.visible=shape!=='case'&&shape!=='ball';secondary.visible=shape==='case';ball.visible=shape==='ball';}if(measure&&force>0){const n=clamp(Math.round(force/10),1,3);discs.forEach((d,i)=>d.visible=i<n);}version++;return true;}
 function setZero(v){if(force!==0&&mode!=='inquiry')return false;const old=zero;zero=Number(clamp(finite(v),-zeroLimit,zeroLimit).toFixed(inquiry?1:0));knob.rotation.z=zero*.35;version++;if(old!==zero)onAdjust({force,zero,previous:old});return true;}
 function intersect(e,objects){const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,camera);return ray.intersectObjects(objects,true)[0];}
 function pointOnDragPlane(e){const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,camera);let target=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),-.32),target);}
 function down(e){if(disposed||tween)return;if(mode==='inquiry'){
 const hit=intersect(e,[knob]);if(hit){drag={kind:'zero',id:e.pointerId,startX:e.clientX,zero};canvas.setPointerCapture(e.pointerId);controls.enabled=false;e.preventDefault();return;}
 const tick=intersect(e,[scaleHit]);if(tick){const value=Number((Math.round((y0-tick.point.y)/pitch/scaleStep)*scaleStep).toFixed(1));if(value>=0&&value<=scaleMax)onPick(value,state());}return;
 }if(mode==='zero'){const hit=intersect(e,[knob]);if(hit){drag={kind:'zero',id:e.pointerId,startX:e.clientX,zero};canvas.setPointerCapture(e.pointerId);controls.enabled=false;e.preventDefault();}}else if(['target','elastic','compression'].includes(mode)){
  let hit=intersect(e,[compress?capHit:hookHit]);if(hit){let p=pointOnDragPlane(e);if(!p)return;drag={id:e.pointerId,start:p.y,value:force};canvas.setPointerCapture(e.pointerId);controls.enabled=false;e.preventDefault();}
 }else if(mode==='eye'){
  const hit=intersect(e,[scaleHit]);if(hit){const value=Math.round((y0-hit.point.y)/pitch);if(value>=0&&value<=30){onPick(value,{force,zero,eye,expected:apparentReading({force,zero,cameraY:camera.position.y,cameraZ:camera.position.z,pitch}).value});}}
 }}
 function move(e){if(!drag||e.pointerId!==drag.id)return;if(drag.kind==='zero'){setZero(Math.round(clamp(drag.zero+(e.clientX-drag.startX)/18*scaleStep,-zeroLimit,zeroLimit)/scaleStep)*scaleStep);e.preventDefault();return;}let p=pointOnDragPlane(e);if(!p)return;let v=clamp(drag.value+(drag.start-p.y)/(compress?.04:pitch),0,30);setForce(v,{instant:true});e.preventDefault();}
 function up(e){if(!drag||drag.id!==e.pointerId)return;if(drag.kind==='zero'){drag=null;controls.enabled=true;return;}onRelease(force);drag=null;controls.enabled=mode!=='eye';setForce(0);}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 function projectionOf(position){const p=position.clone().project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};}
 function hookScreen(){return projectionOf(hookHit.getWorldPosition(new THREE.Vector3()));}
 function tickScreen(n){return projectionOf(new THREE.Vector3(.59,y0-n*pitch,.045));}
 function state(){return {force,zero,value:motion.value,reading:force+zero,settled:motion.settled,viewMoving:!!tween,eye,mode,scaleMax,scaleStep,objectId:everyday?.objectId||null,extension:force*.3,totalLength:5+force*.3,expectedEye:apparentReading({force,zero,cameraY:camera.position.y,cameraZ:camera.position.z,pitch}).value};}
 function resize(){let r=host.getBoundingClientRect();if(r.width<1||r.height<1)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();controls.update();
 if(mode==='eye')setEye('front');
 let currentVersion=-1;
 function tick(now){if(disposed)return;let dt=Math.min((now-last)/1000,.06);last=now;motion.update(document.hidden?0:dt);
  if(tween){let t=clamp((now-tween.start)/tween.duration,0,1),s=t*t*(3-2*t);camera.position.lerpVectors(tween.from,tween.to,s);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,s);if(t===1){tween=null;controls.enabled=mode!=='eye';}}
  controls.update();let shown=motion.value+zero;
  if(Math.abs(shown-lastPaint)>.0008||version!==currentVersion){
   moving.position.y=-shown*pitch;weight.visible=!inquiry&&(force>0||Math.abs(motion.value)>.15);
   if(compress){let top=1.85-shown*.04;springShape(top,-.3);compressTop.position.y=top;capHit.position.y=top;}
   else springShape(measure?2.1:2.15,y0-shown*pitch);
   lastPaint=shown;currentVersion=version;onChange(state());
  }
  if(restNote.visible){restNote.getWorldPosition(_lp).applyMatrix4(camera.matrixWorldInverse);const px=renderer.domElement.clientHeight||1,need=Math.max(.15,-_lp.z*2*Math.tan(camera.fov*Math.PI/360)/px*24);restNote.scale.set(noteAspect*need,need*noteH,1);}
  if(motion.settled!==settledLast){settledLast=motion.settled;onChange(state());}
  renderer.render(scene,camera);raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 return {setForce,setZero,focusPart,focusObject,resetView,setEye,state,hookScreen,tickScreen,knobScreen:()=>projectionOf(knob.getWorldPosition(new THREE.Vector3())),canvas,
  destroy(){everyday?.dispose();disposed=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();host.innerHTML='';}
 };
}
