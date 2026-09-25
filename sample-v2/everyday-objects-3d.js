import * as THREE from './vendor/three.module.js';

// Rounded box: a subdivided cube whose vertices are pushed onto rounded edges/corners (smooth normals, box UVs kept).
export function roundedBoxGeometry(w,h,d,r,seg=3){
 r=Math.max(0,Math.min(r,w/2,h/2,d/2));if(r<1e-4)return new THREE.BoxGeometry(w,h,d);
 const s=seg*2+1,geo=new THREE.BoxGeometry(1,1,1,s,s,s).toNonIndexed(),pos=geo.attributes.position,nor=geo.attributes.normal,uv=geo.attributes.uv,half=.5/s;
 const inner=new THREE.Vector3(w/2-r,h/2-r,d/2-r),p=new THREE.Vector3(),n=new THREE.Vector3(),f=new THREE.Vector3();
 for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);f.fromBufferAttribute(nor,i);n.set(p.x-Math.sign(p.x)*half,p.y-Math.sign(p.y)*half,p.z-Math.sign(p.z)*half).normalize();const x=inner.x*Math.sign(p.x)+n.x*r,y=inner.y*Math.sign(p.y)+n.y*r,z=inner.z*Math.sign(p.z)+n.z*r;pos.setXYZ(i,x,y,z);nor.setXYZ(i,n.x,n.y,n.z);
  // Re-project UVs from the final position so a texture spans the whole face (the collapse would otherwise squeeze it into the middle cell).
  if(Math.abs(f.z)>.5)uv.setXY(i,f.z>0?x/w+.5:.5-x/w,y/h+.5);else if(Math.abs(f.x)>.5)uv.setXY(i,f.x>0?.5-z/d:z/d+.5,y/h+.5);else uv.setXY(i,x/w+.5,f.y>0?.5-z/d:z/d+.5);}
 geo.computeBoundingBox();geo.computeBoundingSphere();return geo;
}
const paper=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];};

// Recognisable, individual 3D teaching objects; all share the SAME transparent tray.
// No object is replaced by a generic weight when attached to the spring scale.
export function createEverydayAssembly(){
 const group=new THREE.Group(),content=new THREE.Group(),objects=new Map();
 const geometry=new Set(),materials=new Set(),textures=new Set();group.add(content);
 const material=(color,options={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.5,...options});materials.add(m);return m;};
 const physical=(color,options={})=>{const m=new THREE.MeshPhysicalMaterial({color,roughness:.5,...options});materials.add(m);return m;};
 const tex=(c,srgb=true,repeat)=>{const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);}textures.add(t);return t;};
 const steel=material('#d2d9dd',{metalness:1,roughness:.24});
 const add=(geo,mat,parent=group)=>{geometry.add(geo);const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const rbox=(w,h,d,r,mat,parent,x=0,y=0,z=0)=>{const m=add(roundedBoxGeometry(w,h,d,r),mat,parent);m.position.set(x,y,z);return m;};
 const sphere=(r,mat,p,x=0,y=0,z=0,scale=[1,1,1])=>{const m=add(new THREE.SphereGeometry(r,48,32),mat,p);m.position.set(x,y,z);m.scale.set(...scale);return m;};
 function rounded(w,h,d,r,mat,parent,x=0,y=0,z=0){
  const s=new THREE.Shape();const a=-w/2,b=-h/2;
  s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
  const m=add(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:3,curveSegments:14}),mat,parent);m.position.set(x,y,z-d/2);return m;
 }
 function line(points,r,mat,parent=group,closed=false,seg=32){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)),closed,'centripetal'),seg,r,10,closed),mat,parent);}
 function leaf(parent,x,y,z,angle=0,size=1){
  const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(.07,.055,.17,0);s.quadraticCurveTo(.07,-.055,0,0);const g=new THREE.ShapeGeometry(s,10),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const lx=p.getX(i),ly=p.getY(i);p.setZ(i,-1.6*lx*lx+2.2*ly*ly);}g.computeVertexNormals();
  const o=add(g,leafMat,parent);o.position.set(x,y,z);o.rotation.set(-.5,.3,angle);o.scale.setScalar(size);return o;
 }
 const leafMat=physical('#4f8e3c',{roughness:.45,side:THREE.DoubleSide,clearcoat:.4,sheen:.3,sheenColor:new THREE.Color('#bfe39a')});
 const stemMat=material('#5a3a25',{roughness:.8});
 // Transparent, open-top carrier. Its mass is excluded by the virtual model, not
 // a real-life calibration claim. All objects use exactly the same carrier.
 const glass=physical('#000000',{roughness:.06,envMapIntensity:1.1,transparent:true,opacity:.08,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor});
 const tray=rbox(1.58,.035,.95,.014,glass,group,0,-.78,0);tray.castShadow=false;
 const rim=rounded(1.61,.06,.99,.06,steel,group,0,-.80,0);rim.castShadow=false;
 for(const x of [-.78,.78]){const w=rbox(.02,.32,.93,.008,glass,group,x,-.62,0);w.castShadow=false;}
 for(const z of [-.465,.465]){const w=rbox(1.54,.32,.02,.008,glass,group,0,-.62,z);w.castShadow=false;}
 {const pts=[],W=.79,D=.475,r=.05;for(const [cx,cz,a0] of [[W-r,D-r,0],[-W+r,D-r,Math.PI/2],[-W+r,-D+r,Math.PI],[W-r,-D+r,Math.PI*1.5]])for(let k=0;k<=4;k++){const a=a0+k/4*Math.PI/2;pts.push([cx+Math.cos(a)*r,-.46,cz+Math.sin(a)*r]);}line(pts,.013,steel,group,true,96);}
 const cord=physical('#3e5561',{roughness:.7,sheen:.5,sheenColor:new THREE.Color('#9fb6c0')});
 for(const x of [-.74,.74])for(const z of [-.43,.43])line([[0,.13,0],[x,-.46,z]],.009,cord,group,false,4);
 {const hub=add(new THREE.TorusGeometry(.05,.013,10,32),steel);hub.position.y=.155;hub.rotation.y=Math.PI/2;}
 content.position.y=-.745;
 function newObject(id){const p=new THREE.Group();p.name=id;p.visible=false;content.add(p);objects.set(id,p);return p;}

 // ---- Shoe: two-tone knit sneaker built from side profiles, tapered toward toe and ankle.
 const shoe=newObject('shoe');
 const shoeRoot=new THREE.Group();shoeRoot.rotation.y=-.35;shoe.add(shoeRoot);
 const taper=(g,dz)=>{g.translate(0,0,-dz);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);const f=(1-.34*Math.pow(Math.max(0,x/.66),2)-.1*Math.pow(Math.max(0,-x/.66),2))*(1-.3*Math.min(1,Math.max(0,(y-.26)/.34)));p.setZ(i,p.getZ(i)*f);}g.computeVertexNormals();return g;};
 const ext=(s,d,b)=>new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:b,bevelSize:b*.9,bevelSegments:5,curveSegments:18});
 {const s=new THREE.Shape();s.moveTo(-.60,0);s.lineTo(.50,0);s.quadraticCurveTo(.68,0,.68,.10);s.quadraticCurveTo(.68,.155,.62,.155);s.lineTo(-.63,.155);s.quadraticCurveTo(-.69,.155,-.68,.08);s.quadraticCurveTo(-.67,0,-.60,0);
  const g=taper(ext(s,.42,.025),.21);const sole=add(g,physical('#f5f4ef',{roughness:.55,clearcoat:.2}),shoeRoot);sole.position.y=.025;
  const out=add(g,material('#6f7c84',{roughness:.9}),shoeRoot);out.scale.set(1.012,.2,1.03);out.position.y=0;}
 const knit=(()=>{const [c,x]=paper(128,128);x.fillStyle='#808080';x.fillRect(0,0,128,128);for(let j=0;j<128;j+=4)for(let i=0;i<128;i+=6){x.fillStyle=(i/6+j/4)%2?'#9a9a9a':'#666';x.fillRect(i,j,5,3);}return tex(c,false,[6,3]);})();
 {const s=new THREE.Shape();s.moveTo(-.62,.14);s.lineTo(-.63,.36);s.quadraticCurveTo(-.645,.53,-.56,.565);s.quadraticCurveTo(-.46,.53,-.36,.505);s.quadraticCurveTo(-.27,.49,-.23,.60);s.quadraticCurveTo(-.2,.655,-.14,.61);s.quadraticCurveTo(.10,.47,.34,.37);s.quadraticCurveTo(.56,.31,.62,.21);s.quadraticCurveTo(.645,.145,.58,.14);s.lineTo(-.62,.14);
  add(taper(ext(s,.3,.075),.15),physical('#2f5f80',{roughness:.78,bumpMap:knit,bumpScale:1.2,sheen:.8,sheenColor:new THREE.Color('#9dc8e2'),sheenRoughness:.55}),shoeRoot);}
 const cream=physical('#ece8da',{roughness:.5,clearcoat:.3});
 {const s=new THREE.Shape();s.moveTo(-.63,.14);s.lineTo(-.64,.36);s.quadraticCurveTo(-.655,.5,-.58,.53);s.quadraticCurveTo(-.5,.44,-.42,.3);s.quadraticCurveTo(-.4,.2,-.43,.14);s.lineTo(-.63,.14);add(taper(ext(s,.33,.075),.165),cream,shoeRoot);
  const t=new THREE.Shape();t.moveTo(.36,.14);t.quadraticCurveTo(.34,.3,.42,.345);t.quadraticCurveTo(.58,.3,.63,.21);t.quadraticCurveTo(.655,.145,.58,.14);t.lineTo(.36,.14);add(taper(ext(t,.3,.08),.15),cream,shoeRoot);}
 {const lining=add(new THREE.CylinderGeometry(.13,.13,.02,40),material('#16232e',{roughness:.9}),shoeRoot);lining.scale.set(1.25,1,.95);lining.position.set(-.40,.585,0);lining.rotation.z=.1;
  const collar=add(new THREE.TorusGeometry(.14,.034,14,48),cream,shoeRoot);collar.rotation.set(Math.PI/2,.1,0);collar.scale.set(1.25,.95,1);collar.position.set(-.40,.595,0);}
 {const laceMat=physical('#fbfbf7',{roughness:.6,sheen:.4}),q=(t,a,b,c)=>(1-t)*(1-t)*a+2*t*(1-t)*b+t*t*c;
  for(let i=0;i<5;i++){const t=.12+i*.15,x=q(t,-.14,.10,.34),y=q(t,.61,.47,.37)+.07,hw=.16*(1-.3*Math.min(1,Math.max(0,(y-.26)/.34)))*(1-.34*Math.pow(Math.max(0,x/.66),2))-.02;
   line([[x-.03,y,-hw],[x,y+.022,0],[x+.03,y,hw]],.016,laceMat,shoeRoot,false,12);for(const z of [-1,1]){const e=add(new THREE.TorusGeometry(.017,.006,6,16),steel,shoeRoot);e.position.set(x+z*.03,y-.004,z*hw);e.rotation.x=Math.PI/2;}}}
 // ---- Apple: turned profile with stem cavity, painted streaks and lenticels, glossy skin.
 const apple=newObject('apple');
 {const prof=[[0,.07],[.06,.05],[.13,.02],[.22,.025],[.30,.07],[.36,.16],[.39,.27],[.395,.38],[.385,.48],[.355,.57],[.30,.645],[.22,.695],[.14,.71],[.08,.695],[.035,.668],[0,.655]];
  const pts=new THREE.SplineCurve(prof.map(p=>new THREE.Vector2(...p))).getPoints(56);pts[0].x=0;pts[pts.length-1].x=0;
  const [c,x]=paper(512,256);const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#7e1a1c');g.addColorStop(.12,'#b92b27');g.addColorStop(.5,'#d63d2d');g.addColorStop(.85,'#d9632f');g.addColorStop(1,'#e9b650');x.fillStyle=g;x.fillRect(0,0,512,256);
  x.filter='blur(3px)';x.globalAlpha=.16;for(let i=0;i<110;i++){const px=Math.random()*512,w=3+Math.random()*9;x.strokeStyle=Math.random()<.6?'#8f1b1c':'#f0a14a';x.lineWidth=w;x.beginPath();x.moveTo(px,20+Math.random()*30);x.bezierCurveTo(px+Math.random()*16-8,90,px+Math.random()*16-8,160,px+Math.random()*20-10,200+Math.random()*50);x.stroke();}
  x.filter='blur(28px)';x.globalAlpha=.45;x.fillStyle='#f0b04a';x.beginPath();x.ellipse(130,190,110,70,0,0,Math.PI*2);x.fill();x.filter='none';x.globalAlpha=.4;x.fillStyle='#f6d9a0';for(let i=0;i<260;i++){x.beginPath();x.arc(Math.random()*512,30+Math.random()*210,.6+Math.random()*1.2,0,Math.PI*2);x.fill();}x.globalAlpha=1;
  const f=add(new THREE.LatheGeometry(pts,72),physical('#ffffff',{map:tex(c),roughness:.34,clearcoat:.55,clearcoatRoughness:.3}),apple);f.scale.set(1,1.02,.96);f.position.y=.0;
  line([[0,.64,0],[.008,.73,0],[.04,.82,.01]],.017,stemMat,apple,false,12);leaf(apple,.035,.79,.01,.45,1.05);}
 // ---- Mandarins (two, weighed together): dimpled peel via bump map, star calyx.
 const mandarins=newObject('mandarins');
 {const [c,x]=paper(512,256);x.fillStyle='#8a8a8a';x.fillRect(0,0,512,256);for(let i=0;i<5200;i++){const px=Math.random()*512,py=Math.random()*256,r=.8+Math.random()*1.9;x.fillStyle=`rgba(40,40,40,${.35+Math.random()*.4})`;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();}const bump=tex(c,false);
  const [d,y]=paper(256,128);const g=y.createLinearGradient(0,0,0,128);g.addColorStop(0,'#e7872a');g.addColorStop(.25,'#f59b25');g.addColorStop(.7,'#f28c1b');g.addColorStop(1,'#d9701a');y.fillStyle=g;y.fillRect(0,0,256,128);y.globalAlpha=.18;for(let i=0;i<260;i++){y.fillStyle=Math.random()<.5?'#ffc15a':'#c95f12';y.beginPath();y.arc(Math.random()*256,Math.random()*128,2+Math.random()*6,0,Math.PI*2);y.fill();}
  const peel=physical('#ffffff',{map:tex(d),bumpMap:bump,bumpScale:2.2,roughness:.52,clearcoat:.35,clearcoatRoughness:.45});
  const calyx=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?.018:.045;i?calyx.lineTo(Math.cos(a)*r,Math.sin(a)*r):calyx.moveTo(r,0);}const cg=new THREE.ExtrudeGeometry(calyx,{depth:.008,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:2});cg.rotateX(-Math.PI/2);
  const calyxMat=physical('#4d6b2c',{roughness:.6});
  for(const [px,pz,ry,s] of [[-.30,-.06,.4,1],[.29,.10,2.1,.96]]){const f=add(new THREE.SphereGeometry(.29,72,48),peel,mandarins);f.position.set(px,.235*s,pz);f.scale.set(s,.81*s,s);f.rotation.y=ry;const k=add(cg,calyxMat,mandarins);k.position.set(px,.235*s+.232*s,pz);k.rotation.y=ry;const st=add(new THREE.CylinderGeometry(.009,.012,.03,10),stemMat,mandarins);st.position.set(px,.235*s+.25*s,pz);}
  leaf(mandarins,-.27,.47,-.05,.1,.95);}
 // ---- Phone: graphite body, glossy lit screen, camera module.
 const phone=newObject('phone');const phoneRoot=new THREE.Group();phone.add(phoneRoot);phoneRoot.position.set(0,.13,0);phoneRoot.rotation.x=-1.20;phoneRoot.rotation.z=.28;
 {rbox(.56,1.02,.066,.075,physical('#3a4856',{metalness:.55,roughness:.3,clearcoat:.8,clearcoatRoughness:.2}),phoneRoot,0,.47,0);
  rbox(.575,1.035,.04,.08,material('#b8c2c9',{metalness:1,roughness:.25}),phoneRoot,0,.47,0);
  const [c,x]=paper(256,480);const g=x.createLinearGradient(0,0,256,480);g.addColorStop(0,'#123a5c');g.addColorStop(.55,'#1f7f8a');g.addColorStop(1,'#9fd6c4');x.fillStyle=g;x.fillRect(0,0,256,480);
  x.globalAlpha=.22;x.fillStyle='#ffffff';x.beginPath();x.arc(210,120,120,0,Math.PI*2);x.fill();x.beginPath();x.arc(40,420,150,0,Math.PI*2);x.fill();x.globalAlpha=1;
  x.fillStyle='#fff';x.textAlign='center';x.font='600 64px "Segoe UI",Roboto,Arial,sans-serif';x.fillText('9:41',128,120);x.font='500 16px "Segoe UI",Roboto,Arial,sans-serif';x.globalAlpha=.8;x.fillText('SCIENCE LAB',128,150);x.globalAlpha=1;
  x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.roundRect(22,396,212,58,20);x.fill();['#ffb347','#5bd08a','#6aa8ff','#ff7a7a'].forEach((col,i)=>{x.fillStyle=col;x.beginPath();x.roundRect(34+i*50,404,40,40,11);x.fill();});
  const screenTex=tex(c);const scr=rbox(.52,.975,.012,.06,physical('#ffffff',{map:screenTex,emissiveMap:screenTex,emissive:'#ffffff',emissiveIntensity:.45,roughness:.12,metalness:0,clearcoat:.7,clearcoatRoughness:.05,envMapIntensity:.5}),phoneRoot,0,.47,.031);scr.castShadow=false;
  rbox(.13,.03,.006,.015,material('#05080c',{roughness:.3}),phoneRoot,0,.915,.039);
  const bump=rbox(.21,.21,.022,.055,physical('#2e3b47',{roughness:.25,clearcoat:1}),phoneRoot,-.14,.83,-.04);bump.castShadow=false;
  const lens=physical('#0b1118',{roughness:.05,clearcoat:1,metalness:.3});for(const [lx,ly] of [[-.18,.87],[-.18,.79],[-.1,.83]]){const l=add(new THREE.CylinderGeometry(.03,.034,.02,28),lens,phoneRoot);l.rotation.x=Math.PI/2;l.position.set(lx,ly,-.055);}
  rbox(.012,.12,.02,.005,material('#9aa6ae',{metalness:1,roughness:.3}),phoneRoot,.285,.72,0);}
 // ---- Pencil case: soft zip pouch with pencils poking out of the open zipper.
 const pc=newObject('pencilcase');const pcRoot=new THREE.Group();pc.add(pcRoot);pcRoot.rotation.y=-.18;
 {const [c,x]=paper(64,64);x.fillStyle='#808080';x.fillRect(0,0,64,64);for(let i=0;i<64;i+=4){x.fillStyle='#9b9b9b';x.fillRect(i,0,2,64);x.fillStyle='#6a6a6a';x.fillRect(0,i,64,1);}const weave=tex(c,false,[10,4]);
  const body=rbox(1.24,.36,.56,.12,physical('#3e8f86',{roughness:.82,bumpMap:weave,bumpScale:1.4,sheen:.7,sheenColor:new THREE.Color('#a6e0d6'),sheenRoughness:.6}),pcRoot,0,.2,0);
  body.scale.set(1,1,1);
  rbox(1.1,.018,.075,.009,material('#1c3136',{roughness:.7}),pcRoot,0,.378,0);
  rbox(.62,.024,.13,.012,material('#0d1c20',{roughness:.95}),pcRoot,-.14,.376,0);
  rbox(.46,.01,.03,.004,material('#c7d0d3',{metalness:.8,roughness:.35}),pcRoot,.34,.39,0);
  rbox(.08,.035,.09,.012,steel,pcRoot,.16,.392,0);const tab=rbox(.05,.12,.014,.012,steel,pcRoot,.2,.35,.05);tab.rotation.x=.9;
  rbox(.07,.14,.03,.012,physical('#c3955c',{roughness:.5,clearcoat:.3}),pcRoot,.63,.22,.12);
  for(let i=0;i<3;i++){
   const pencil=new THREE.Group();pencil.position.set(-.34+i*.12,.34,-.02+i*.02);pencil.rotation.z=-.42+i*.34;pencil.rotation.x=-.12+i*.08;pcRoot.add(pencil);
   add(new THREE.CylinderGeometry(.034,.034,.5,6),physical(['#f0b93a','#d9573f','#3e7fc0'][i],{roughness:.35,clearcoat:.6}),pencil).position.y=.25;
   add(new THREE.ConeGeometry(.034,.1,6),material('#e2c49a',{roughness:.8}),pencil).position.y=.55;
   add(new THREE.ConeGeometry(.012,.032,8),material('#2b3236',{roughness:.4}),pencil).position.y=.59;}
  const ruler=rbox(.12,.42,.024,.008,physical('#f0f6f7',{roughness:.15,clearcoat:1,transparent:true,opacity:.72}),pcRoot,.24,.44,-.06);ruler.rotation.z=-.22;
  for(let i=0;i<6;i++){const t=rbox(i%2?.035:.055,.006,.004,.002,material('#2a4a58'),ruler,-.04+(i%2?-.01:0),-.15+i*.05,.014);t.castShadow=false;}}
 // ---- Pen and stapler (battle rounds).
 const pen=newObject('pen');const penRoot=new THREE.Group();pen.add(penRoot);penRoot.rotation.z=-Math.PI/2;penRoot.position.set(0,.23,0);
 const penBlue=physical('#2270a8',{roughness:.28,clearcoat:.8}),penClear=physical('#dcecee',{roughness:.08,clearcoat:1,transparent:true,opacity:.55});
 const penBody=add(new THREE.CylinderGeometry(.055,.052,.92,32),penClear,penRoot);penBody.position.y=.48;
 const penInk=add(new THREE.CylinderGeometry(.018,.018,.73,12),penBlue,penRoot);penInk.position.y=.44;
 const penCap=add(new THREE.CylinderGeometry(.062,.062,.17,32),penBlue,penRoot);penCap.position.y=.90;
 const penTip=add(new THREE.ConeGeometry(.047,.15,32),steel,penRoot);penTip.rotation.z=Math.PI;penTip.position.y=-.05;
 line([[.065,.85,0],[.09,.62,0]],.012,penBlue,penRoot);
 const stapler=newObject('stapler');const stapleRoot=new THREE.Group();stapler.add(stapleRoot);stapleRoot.rotation.y=-.22;
 const stapleDark=physical('#2d4f6e',{roughness:.38,clearcoat:.6}),stapleMetal=material('#b3bec3',{metalness:1,roughness:.28});
 rbox(.96,.12,.32,.05,stapleDark,stapleRoot,0,.12,0);
 const stapleTop=rbox(.88,.18,.31,.07,stapleDark,stapleRoot,-.035,.31,0);stapleTop.rotation.z=.10;
 rbox(.67,.025,.18,.01,stapleMetal,stapleRoot,.02,.215,0);
 sphere(.075,stapleMetal,stapleRoot,-.43,.22,0,[.3,1,1]);
 let current=null;
 return {group,set(id){current=objects.has(id)?id:null;objects.forEach((o,k)=>o.visible=k===current);group.userData.objectId=current;},get objectId(){return current;},dispose(){geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
