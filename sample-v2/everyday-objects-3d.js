import * as THREE from './vendor/three.module.js';

// Recognisable, individual 3D teaching objects; all share the SAME transparent tray.
// No object is replaced by a generic weight when attached to the spring scale.
export function createEverydayAssembly(){
 const group=new THREE.Group(),content=new THREE.Group(),objects=new Map();
 const geometry=new Set(),materials=new Set();group.add(content);
 const material=(color,options={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.5,...options});materials.add(m);return m;};
 const steel=material('#839ba8',{metalness:.65,roughness:.27});
 const add=(geo,mat,parent=group)=>{geometry.add(geo);const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const sphere=(r,mat,p,x=0,y=0,z=0,scale=[1,1,1])=>{const m=add(new THREE.SphereGeometry(r,36,24),mat,p);m.position.set(x,y,z);m.scale.set(...scale);return m;};
 function rounded(w,h,d,r,mat,parent,x=0,y=0,z=0){
  const s=new THREE.Shape();const a=-w/2,b=-h/2;
  s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
  const m=add(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,curveSegments:12}),mat,parent);m.position.set(x,y,z-d/2);return m;
 }
 function line(points,r,mat,parent=group){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a))),32,r,8,false),mat,parent);}
 function leaf(parent,x,y,z,angle=0){const o=sphere(.14,material('#508849'),parent,x,y,z,[1,.17,.42]);o.rotation.z=angle;return o;}
 function fruit(parent,r,x,y,z,isApple){
  const geo=new THREE.SphereGeometry(r,48,32),attr=geo.attributes.position;
  for(let i=0;i<attr.count;i++){const vx=attr.getX(i),vy=attr.getY(i),vz=attr.getZ(i);const a=Math.atan2(vz,vx),sy=vy/r;const lobes=isApple?1+.052*Math.cos(a*5)*Math.pow(Math.abs(sy),2):1+.012*Math.cos(a*12);attr.setXYZ(i,vx*lobes,vy*(isApple?1.03:.83)-(isApple?.022:0)*Math.exp(-((vx*vx+vz*vz)/(r*r*.035))),vz*lobes);}
  geo.computeVertexNormals();const f=add(geo,material(isApple?'#d74432':'#f39821',{roughness:isApple?.28:.7}),parent);f.position.set(x,y,z);
  line([[x,y+r*.88,z],[x+.025,y+r+.10,z-.01]],.018,material('#66483b'),parent);
  leaf(parent,x+.07,y+r+.06,z,.33);return f;
 }
 // Transparent, open-top carrier. Its mass is excluded by the virtual model, not
 // a real-life calibration claim. All objects use exactly the same carrier.
 const glass=new THREE.MeshPhysicalMaterial({color:'#cbe3e7',transparent:true,opacity:.10,roughness:.15,depthWrite:false,side:THREE.DoubleSide});materials.add(glass);
 const tray=add(new THREE.BoxGeometry(1.58,.035,.95),glass);tray.position.set(0,-.78,0);
 const rim=rounded(1.61,.06,.99,.06,steel,group,0,-.80,0);rim.castShadow=false;
 for(const x of [-.79,.79]){const wall=add(new THREE.PlaneGeometry(.95,.32),glass);wall.rotation.y=Math.PI/2;wall.position.set(x,-.62,0);wall.castShadow=false;}
 for(const z of [-.47,.47]){const wall=add(new THREE.PlaneGeometry(1.58,.32),glass);wall.position.set(0,-.62,z);wall.castShadow=false;line([[-.79,-.45,z],[.79,-.45,z]],.012,steel);}
 const cord=material('#657f8b',{metalness:.35});
 for(const x of [-.72,.72])for(const z of [-.38,.38])line([[0,.15,0],[x*.62,-.22,z*.62],[x,-.75,z]],.011,cord);
 content.position.y=-.745;
 function newObject(id){const p=new THREE.Group();p.name=id;p.visible=false;content.add(p);objects.set(id,p);return p;}
 const shoe=newObject('shoe');
 const shoeRoot=new THREE.Group();shoeRoot.rotation.y=-.35;shoe.add(shoeRoot);
 const sole=rounded(1.34,.15,.52,.1,material('#edf0e6'),shoeRoot,0,.11,0);
 const upperMat=material('#426e86'),cream=material('#e5e9dc'),blue=material('#27475f');
 sphere(.33,upperMat,shoeRoot,.38,.28,0,[1.10,.58,.79]);sphere(.30,upperMat,shoeRoot,-.15,.38,0,[1.15,.85,.81]);sphere(.24,blue,shoeRoot,-.44,.35,0,[.65,.92,1.02]);
 const collar=add(new THREE.TorusGeometry(.135,.06,12,36),cream,shoeRoot);collar.rotation.x=Math.PI/2;collar.scale.set(1,1.35,1);collar.position.set(-.30,.62,0);
 const hole=add(new THREE.CylinderGeometry(.11,.11,.015,24),material('#142f45'),shoeRoot);hole.position.set(-.30,.627,0);
 for(let i=0;i<4;i++)line([[-.11+i*.105,.57-i*.052,-.16],[-.025+i*.105,.57-i*.052,.17]],.016,cream,shoeRoot);
 for(const z of [-.266,.266])line([[-.13,.30,z],[.04,.25,z],[.23,.32,z]],.048,material('#c48768'),shoeRoot);
 for(let i=0;i<8;i++)line([[-.55+i*.155,.077,.267],[-.50+i*.155,.05,.267]],.008,steel,shoeRoot);
 const apple=newObject('apple');fruit(apple,.39,0,.39,0,true);
 const mandarins=newObject('mandarins');fruit(mandarins,.29,-.30,.25,-.06,false);fruit(mandarins,.29,.29,.25,.10,false);
 const phone=newObject('phone');const phoneRoot=new THREE.Group();phone.add(phoneRoot);phoneRoot.position.set(0,.13,0);phoneRoot.rotation.x=-1.20;phoneRoot.rotation.z=.28;
 rounded(.56,1.02,.063,.085,material('#778e9f',{metalness:.55}),phoneRoot,0,.47,0);
 rounded(.51,.95,.016,.068,material('#152d4a',{metalness:.22,roughness:.23}),phoneRoot,0,.47,.042);
 const wave=rounded(.48,.54,.006,.12,material('#459baf',{roughness:.24}),phoneRoot,.01,.30,.055);
 rounded(.19,.043,.009,.02,material('#10232f'),phoneRoot,0,.91,.056);
 sphere(.015,material('#567da6'),phoneRoot,.064,.912,.064,[1,1,.25]);
 rounded(.16,.015,.009,.007,cream,phoneRoot,0,.041,.056);
 const pc=newObject('pencilcase');const pcRoot=new THREE.Group();pc.add(pcRoot);pcRoot.rotation.y=-.18;
 const fabric=material('#4d9c90'),lining=material('#183e4b');
 rounded(1.26,.36,.60,.12,fabric,pcRoot,0,.22,0);
 const mouth=add(new THREE.TorusGeometry(.31,.055,12,48),lining,pcRoot);mouth.rotation.x=Math.PI/2;mouth.scale.set(1.7,.73,1);mouth.position.set(0,.425,0);
 const inside=add(new THREE.CylinderGeometry(.31,.31,.012,36),lining,pcRoot);inside.scale.set(1.65,1,.68);inside.position.set(0,.423,0);
 for(let i=0;i<3;i++){
  const pencil=new THREE.Group();pencil.position.set(-.35+i*.22,.47,0);pencil.rotation.z=-.25+i*.21;pcRoot.add(pencil);
  const sh=add(new THREE.CylinderGeometry(.036,.036,.58,6),material(['#eab64c','#d7765e','#6492b6'][i]),pencil);sh.position.y=.19;
  const tip=add(new THREE.ConeGeometry(.036,.12,6),material('#d2b58d'),pencil);tip.position.y=.54;
  const lead=add(new THREE.ConeGeometry(.013,.035,6),material('#303c40'),pencil);lead.position.y=.592;
 }
 const ruler=rounded(.15,.55,.032,.006,material('#d8bd8b'),pcRoot,.40,.62,-.04);ruler.rotation.z=-.15;
 for(let i=0;i<5;i++)line([[.36,.39+i*.07,.022],[.41,.39+i*.07,.022]],.004,steel,pcRoot);
 rounded(.22,.17,.15,.025,cream,pcRoot,-.30,.48,.13);
 for(let i=0;i<17;i++){const t=i/16,x=-.55+t*1.1;const y=.31+.04*Math.sin(t*Math.PI);line([[x,y,.305],[x+.024,y+.023,.305]],.009,cream,pcRoot);}
 rounded(.055,.13,.022,.015,copperMaterial(),pcRoot,.50,.30,.315);
 function copperMaterial(){return material('#c19b64',{metalness:.6});}
 const pen=newObject('pen');const penRoot=new THREE.Group();pen.add(penRoot);penRoot.rotation.z=-Math.PI/2;penRoot.position.set(0,.23,0);
 const penBlue=material('#2874aa',{roughness:.32}),penClear=material('#d8e8e9',{transparent:true,opacity:.72});
 const penBody=add(new THREE.CylinderGeometry(.055,.052,.92,24),penClear,penRoot);penBody.position.y=.48;
 const penInk=add(new THREE.CylinderGeometry(.018,.018,.73,12),penBlue,penRoot);penInk.position.y=.44;
 const penCap=add(new THREE.CylinderGeometry(.062,.062,.17,24),penBlue,penRoot);penCap.position.y=.90;
 const penTip=add(new THREE.ConeGeometry(.047,.15,24),steel,penRoot);penTip.rotation.z=Math.PI;penTip.position.y=-.05;
 line([[.065,.85,0],[.09,.62,0]],.012,penBlue,penRoot);
 const stapler=newObject('stapler');const stapleRoot=new THREE.Group();stapler.add(stapleRoot);stapleRoot.rotation.y=-.22;
 const stapleDark=material('#315371',{roughness:.42}),stapleMetal=material('#9aa9ad',{metalness:.72,roughness:.3});
 rounded(.96,.12,.32,.045,stapleDark,stapleRoot,0,.12,0);
 const stapleTop=rounded(.88,.18,.31,.055,stapleDark,stapleRoot,-.035,.31,0);stapleTop.rotation.z=.10;
 rounded(.67,.025,.18,.008,stapleMetal,stapleRoot,.02,.215,0);
 sphere(.075,stapleMetal,stapleRoot,-.43,.22,0,[.3,1,1]);
 let current=null;
 return {group,set(id){current=objects.has(id)?id:null;objects.forEach((o,k)=>o.visible=k===current);group.userData.objectId=current;},get objectId(){return current;},dispose(){geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
