// 3D 사람 모형(공용). 관절(어깨·팔꿈치·엉덩이·무릎)이 있는 그룹 구조로 서기·앉기·뛰기 자세를 만든다.
// 크기는 키(height, 장면 단위)로 정하고, 원점은 서 있을 때 발바닥 가운데, 앉을 때 엉덩이 아래(앉은 면)다.
import * as THREE from './vendor/three.module.js';
import {roundedBoxGeometry} from './everyday-objects-3d.js';

const BASE=1.75;   // 기준 키(m 비율)로 만든 뒤 height/BASE배로 키운다
export function buildPerson(stage,{height=1.75,skin='#f2c7a3',shirt='#3a6ea5',pants='#2b3a4a',shoes='#3b3f46',hair='#3a2a1e',hairStyle='short',shorts=false,child=false,pose='stand',parent=stage.scene}={}){
 const {mesh}=stage;
 const M={skin:stage.phys({color:skin,roughness:.55,sheen:.3}),shirt:stage.phys({color:shirt,roughness:.6}),pants:stage.phys({color:pants,roughness:.65}),shoes:stage.phys({color:shoes,roughness:.4,clearcoat:.4}),hair:stage.phys({color:hair,roughness:.5,clearcoat:.2}),dark:stage.mat({color:'#1d1f24',roughness:.3}),white:stage.mat({color:'#ffffff',roughness:.2}),lip:stage.mat({color:'#b8524a',roughness:.5}),cheek:stage.mat({color:'#f08f8f',transparent:true,opacity:.35,roughness:.8,depthWrite:false})};
 const root=new THREE.Group();parent.add(root);
 const body=new THREE.Group();root.add(body);body.scale.setScalar(height/BASE);
 const add=(geo,mat,g,x=0,y=0,z=0)=>{const o=mesh(geo,mat,g);o.position.set(x,y,z);return o;};
 const limb=(rTop,rBot,len,mat,g,y)=>add(new THREE.CylinderGeometry(rTop,rBot,len,20),mat,g,0,y-len/2,0);
 // 엉덩이(골반)
 const hips=new THREE.Group();hips.position.y=.93;body.add(hips);
 const pelvis=add(new THREE.SphereGeometry(.155,28,20),M.pants,hips);pelvis.scale.set(1,.7,.7);
 const legs={};
 for(const side of [-1,1]){
  const hip=new THREE.Group();hip.position.set(side*.095,-.02,0);hips.add(hip);
  limb(.078,.062,.43,M.pants,hip,0);
  const knee=new THREE.Group();knee.position.y=-.43;hip.add(knee);
  add(new THREE.SphereGeometry(.062,18,14),shorts?M.skin:M.pants,knee);
  limb(.058,.044,.42,shorts?M.skin:M.pants,knee,0);
  const ankle=new THREE.Group();ankle.position.y=-.42;knee.add(ankle);
  if(shorts)add(new THREE.CylinderGeometry(.05,.05,.06,16),stage.phys({color:'#f4f4f0',roughness:.7}),ankle,0,.02,0);
  const shoe=mesh(roundedBoxGeometry(.11,.08,.27,.035),M.shoes,ankle);shoe.position.set(0,-.03,.055);
  legs[side]={hip,knee};
 }
 if(shorts){for(const side of [-1,1]){const cuff=add(new THREE.CylinderGeometry(.085,.082,.2,20),M.pants,legs[side].hip,0,-.1,0);cuff.scale.z=1;}
  // 짧은 바지: 허벅지 아래쪽은 피부
  legs[-1].hip.children[0].material=M.skin;legs[1].hip.children[0].material=M.skin;}
 // 몸통(허리 → 어깨), 위에서 보면 납작한 타원
 const torso=new THREE.Group();hips.add(torso);
 const profile=[[.0,0],[.152,0],[.158,.1],[.178,.28],[.195,.4],[.19,.47],[.145,.53],[.06,.56],[0,.56]].map(([r,y])=>new THREE.Vector2(r,y));
 const chest=add(new THREE.LatheGeometry(profile,40),M.shirt,torso);chest.scale.z=.62;
 add(new THREE.CylinderGeometry(.048,.052,.07,16),M.skin,torso,0,.585,0);
 // 머리
 const head=new THREE.Group();head.position.y=.725;torso.add(head);if(child)head.scale.setScalar(1.22);
 head.scale.multiplyScalar(1.1);const skull=add(new THREE.SphereGeometry(.115,40,30),M.skin,head);skull.scale.set(.95,1.08,1.0);
 for(const side of [-1,1]){
  add(new THREE.SphereGeometry(.026,16,12),M.skin,head,side*.11,-.005,0).scale.set(.6,1,1);
  add(new THREE.SphereGeometry(.017,16,12),M.dark,head,side*.04,.012,.103);
  add(new THREE.SphereGeometry(.006,10,8),M.white,head,side*.04+.006,.018,.117);
  const brow=mesh(roundedBoxGeometry(.04,.009,.01,.004),M.hair,head);brow.position.set(side*.042,.046,.104);brow.rotation.z=-side*.12;
  add(new THREE.CircleGeometry(.02,16),M.cheek,head,side*.064,-.03,.097).lookAt(side*.4,-.1,1.2);
 }
 add(new THREE.SphereGeometry(.014,12,10),M.skin,head,0,-.012,.118);
 const mouth=mesh(new THREE.TorusGeometry(.024,.0055,8,20,Math.PI),M.lip,head);mouth.position.set(0,-.045,.104);mouth.rotation.z=Math.PI;
 // 머리카락
 const cap=add(new THREE.SphereGeometry(.124,40,24,0,Math.PI*2,0,Math.PI*.52),M.hair,head,0,.012,-.008);cap.scale.set(.98,1.08,1.04);
 const bangs=add(new THREE.SphereGeometry(.12,32,16,-Math.PI*.42,Math.PI*.84,Math.PI*.18,Math.PI*.16),M.hair,head,0,.012,.006);bangs.scale.set(.99,1.05,1.05);
 if(hairStyle==='ponytail'){add(new THREE.SphereGeometry(.06,20,16),M.hair,head,0,.05,-.13).scale.set(1,1.3,1);const tail=add(new THREE.CapsuleGeometry(.045,.16,8,16),M.hair,head,0,-.03,-.17);tail.rotation.x=.35;}
 if(hairStyle==='pigtails')for(const side of [-1,1]){add(new THREE.SphereGeometry(.018,12,10),stage.phys({color:'#f4f4f0'}),head,side*.12,.06,-.03);const t=add(new THREE.CapsuleGeometry(.045,.13,8,16),M.hair,head,side*.15,-.02,-.03);t.rotation.z=side*.25;}
 if(hairStyle==='long'){const back=add(new THREE.CapsuleGeometry(.11,.16,8,20),M.hair,head,0,-.07,-.05);back.scale.z=.55;}
 // 팔(어깨 → 팔꿈치 → 손)
 const arms={};
 for(const side of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(side*.2,.47,0);torso.add(shoulder);
  add(new THREE.SphereGeometry(.056,18,14),M.shirt,shoulder);
  limb(.06,.05,.17,M.shirt,shoulder,0);
  limb(.046,.042,.13,M.skin,shoulder,-.16);
  const elbow=new THREE.Group();elbow.position.y=-.29;shoulder.add(elbow);
  add(new THREE.SphereGeometry(.043,16,12),M.skin,elbow);
  limb(.042,.034,.25,M.skin,elbow,0);
  const hand=add(new THREE.SphereGeometry(.045,18,14),M.skin,elbow,0,-.285,.005);hand.scale.set(.78,1.15,.55);
  const thumb=add(new THREE.CapsuleGeometry(.013,.035,6,10),M.skin,elbow,-side*.03,-.265,.02);thumb.rotation.z=side*.5;
  arms[side]={shoulder,elbow};
 }
 function setPose(name){
  for(const s of [-1,1]){legs[s].hip.rotation.set(0,0,0);legs[s].knee.rotation.set(0,0,0);arms[s].shoulder.rotation.set(0,0,0);arms[s].elbow.rotation.set(0,0,0);}
  hips.position.y=.93;torso.rotation.set(0,0,0);
  if(name==='stand'){for(const s of [-1,1]){arms[s].shoulder.rotation.z=s*.12;arms[s].elbow.rotation.x=-.18;legs[s].hip.rotation.z=s*.02;}}
  if(name==='sit'){hips.position.y=.1;for(const s of [-1,1]){legs[s].hip.rotation.x=-Math.PI/2;legs[s].hip.rotation.y=s*.06;legs[s].knee.rotation.x=Math.PI/2-.08;arms[s].shoulder.rotation.set(-.55,0,s*.08);arms[s].elbow.rotation.x=-.75;}}
  if(name==='jump'){for(const s of [-1,1]){arms[s].shoulder.rotation.z=s*2.3;arms[s].elbow.rotation.x=-.2;legs[s].hip.rotation.z=s*.18;legs[s].knee.rotation.x=.25;}}
 }
 setPose(pose);
 return {root,body,head,setPose};
}
