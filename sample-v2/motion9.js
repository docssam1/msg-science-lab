// 9차시 3D 교구: 속력 비교하기(교재 64~65쪽) · 일정한 시간마다 남긴 자국(66~67쪽 Daily Test).
// 거리·시간은 교재의 값만 쓴다(10초에 500m·300m, 500m를 5초·20초, 종목 10m·15m·30m, 달리기 50m 9·8·5·12·10초, 빨대 12cm).
// 움직임은 시간을 줄여 보여 주며, 사람·자동차·강아지의 모습은 가상의 모형이다.
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {buildPerson} from './figures3d.js';
import {fail,buildCar} from './motion7.js';

const X0=-4.6,LEN=8.4;
export const timeCars=[['A자동차',500,10,'#f2c230'],['B자동차',300,10,'#4f8ed0']];
export const distCars=[['A자동차',500,5,'#f2c230'],['B자동차',500,20,'#4f8ed0']];
export const events=[['앞발 이어 걷기한 사람',10,10,'heel'],['한 발로 뛴 사람',15,10,'hop'],['뒤로 걷기한 사람',30,10,'back']];
export const racers=[['1조','진홍',9],['2조','영수',8],['3조','순희',5],['4조','지영',12],['5조','주홍',10]];
export const raceOrder=racers.slice().sort((a,b)=>a[2]-b[2]).map(r=>r[1]);
const round1=v=>Math.round(v*10)/10;
function lane(s,z,{w=LEN+1.2,color='#c9ced2'}={}){s.rbox(w,.1,.9,.03,s.phys({color,roughness:.7}),X0+LEN/2,.05,z);s.rbox(.06,.02,.9,.01,s.phys({color:'#f2c230'}),X0,.11,z);const t=s.label('START',{size:.3});t.position.set(X0-.3,.3,z+.25);}
function ground(s){s.rbox(60,.2,60,.05,s.phys({color:'#e7ece2',roughness:.95}),0,-.1,4);}
function buildDog(s){
 const g=new THREE.Group();s.scene.add(g);const fur=s.phys({color:'#d9a066',roughness:.8}),dark=s.mat({color:'#2a211b'});
 const body=s.mesh(new THREE.CapsuleGeometry(.16,.36,8,16),fur,g);body.rotation.z=Math.PI/2;body.position.y=.32;
 s.mesh(new THREE.SphereGeometry(.15,20,14),fur,g).position.set(.34,.46,0);s.mesh(new THREE.SphereGeometry(.06,12,10),dark,g).position.set(.48,.44,0);
 for(const z of [-.09,.09]){const e=s.mesh(new THREE.SphereGeometry(.07,12,10),s.phys({color:'#8a5a32'}),g);e.position.set(.3,.56,z);e.scale.set(.6,1.3,.5);}
 for(const [x,z] of [[-.16,-.09],[-.16,.09],[.16,-.09],[.16,.09]])s.mesh(new THREE.CylinderGeometry(.04,.04,.2,10),fur,g).position.set(x,.1,z);
 const tail=s.mesh(new THREE.CylinderGeometry(.025,.02,.22,8),fur,g);tail.position.set(-.33,.42,0);tail.rotation.z=-.8;
 return g;
}
function straw(s){const m=s.mesh(new THREE.CylinderGeometry(.03,.03,.5,10),s.phys({color:'#e5483d',roughness:.4}));m.rotation.x=Math.PI/2;m.position.y=.05;return m;}

// 장면 만들기: kind = time | event | dist | race | marks
function buildScene(s,kind){
 ground(s);
 if(kind==='time'||kind==='dist'){
  const list=kind==='time'?timeCars:distCars,max=500;
  const items=list.map(([name,d,t,color],i)=>{const z=-1.1+i*2.2;lane(s,z);const car=buildCar(s,color);car.position.set(X0,.1,z);const tag=s.label(kind==='dist'?`${name} · ${t}초 걸림`:name,{size:.34});
   const dimTag=s.label(`${d}m`,{size:.34});dimTag.position.set(X0+LEN*d/max/2,.25,z+.75);return {name,d,t,obj:car,tag,z,scale:LEN/max,walk:null};});
  return {items,duration:Math.max(...list.map(l=>l[2]))};
 }
 if(kind==='event'){
  const max=30;const items=events.map(([name,d,t,style],i)=>{const z=-1.6+i*1.6;lane(s,z);const p=buildPerson(s,{height:1.7,shirt:['#e86a45','#3c8fd8','#2f9a5e'][i],pants:'#3b4552',hair:'#2f2a26'});p.root.position.set(X0,.1,z);const tag=s.label(name,{size:.3});return {name,d,t,obj:p.root,person:p,style,tag,z,scale:LEN/max};});
  return {items,duration:10};
 }
 if(kind==='race'){
  const max=50;const items=racers.map(([team,name,t],i)=>{const z=-2.4+i*1.2;lane(s,z,{w:LEN+1.2});const p=buildPerson(s,{height:1.6,shirt:['#e86a45','#f2c230','#2f9a5e','#4f8ed0','#8a4fd1'][i],pants:'#2b3a4a',hair:'#2f2a26',child:true});p.root.position.set(X0,.1,z);const tag=s.label(`${team} ${name}`,{size:.28});return {name,d:50,t,obj:p.root,person:p,style:'run',tag,z,scale:LEN/max};});
  s.rbox(.08,.03,6.6,.01,s.phys({color:'#d13a35'}),X0+LEN,.12,0);const fin=s.label('50m',{size:.34});fin.position.set(X0+LEN,.4,3.6);
  return {items,duration:12};
 }
 // marks: 강아지 두 마리가 1초마다 빨대를 놓는다(A는 12cm, B는 6cm 간격 — B는 비교용 가상의 값)
 const items=[['강아지 A',12,'#d9a066'],['강아지 B',6,'#b7b7b7']].map(([name,step],i)=>{const z=-.6+i*1.6;lane(s,z,{color:'#e9e2d2'});const dog=buildDog(s);dog.position.set(X0,.1,z);const tag=s.label(name,{size:.32});return {name,step,obj:dog,tag,z,straws:[],scale:LEN/60};});
 return {items,duration:5};
}
function poseAt(s,scene,kind,t){
 for(const it of scene.items){
  let x;
  if(kind==='marks'){const cm=it.step*Math.min(t,scene.duration);x=X0+cm*it.scale;
   const need=Math.floor(Math.min(t,scene.duration)+1e-6);while(it.straws.length<need){const k=it.straws.length+1;const m=straw(s);if(scene.root)scene.root.add(m);m.position.set(X0+it.step*k*it.scale,.08,it.z+.3);it.straws.push(m);}}
  else x=X0+it.d*Math.min(t/it.t,1)*it.scale;
  it.obj.position.x=x;
  if(it.person){const moving=t>0&&t<it.t;it.obj.rotation.y=it.style==='back'?-Math.PI/2:Math.PI/2;
   if(it.style==='hop'){it.person.setPose(moving?'walk':'stand',moving?.9:0);it.obj.position.y=.1+(moving?Math.abs(Math.sin(t*6))*.25:0);}
   else it.person.setPose(moving?'walk':'stand',t*(it.style==='run'?9:5));}
  it.tag.position.set(x,it.person?2.1:1.15,it.z);
 }
}
// 정지 그림: 마지막 순간(또는 경주 중간)의 모습
export function renderScene(s,kind,t){const sc=buildScene(s,kind);poseAt(s,sc,kind,t??sc.duration);return sc;}

const TABS={
 'compare-time':[['time','① 일정한 시간(10초)'],['event','Speed Question · 종목']],
 'compare-dist':[['dist','② 일정한 거리(500m)'],['race','Speed Question · 달리기 시합']],
 'speed-marks':[['marks','1초마다 놓은 빨대']]
};
const BOOK={
 time:'10초 동안 이동한 거리 측정했을 때, 더 멀리 이동한 장난감의 속력이 빠르다',
 event:'각 종목마다 각각 10초씩 일정한 시간 내에 움직인 이동거리를 측정하였다.',
 dist:'500m 이동하는 시간 측정했을 때, 이동시간 적게 걸린 장난감의 속력이 빠르다.',
 race:'일정한 거리를 이동한 달리기시합에서 가장 빨리 달린 사람은?',
 marks:'1초마다 장난감 강아지가 지나간 자리에 빨대 조각을 놓았을 때, 빨대 조각 사이의 거리가 12cm 라면 장난감 강아지의 속력을 구하시오.'
};
function mountCompare(kind,host,ctx){
 const key='lab-'+kind,saved=ctx.load(key,null)||{};
 const st={tab:TABS[kind][0][0],t:0,playing:false,done:new Set(saved.done||[])};
 host.innerHTML=`<div class="motion-activity balance-lab lab5"><h3>속력 비교하기</h3><div class="lab5-tabs">${TABS[kind].map(([k,n])=>`<button type="button" data-tab="${k}">${n}</button>`).join('')}</div><div class="balance-view"><span class="scene-tag">3D 가상 교구 · 시간을 줄여 보여 줘요</span></div><p class="lab5-book" data-book></p><div class="lab5-row"><b>움직이기</b><button type="button" data-play>▶ 출발</button><span class="lab5-sum" data-clock></span></div><div class="lab5-panel"></div><p class="lab5-note" role="status"></p><p class="lab5-small">거리와 시간은 교재의 값이고, 사람·자동차·강아지의 모습은 가상의 모형입니다.</p></div>`;
 const view=host.querySelector('.balance-view'),panel=host.querySelector('.lab5-panel'),note=host.querySelector('.lab5-note');
 let stage;try{stage=createStage(view,{cam:[0,4.6,10.4],target:[-.3,.6,0],fov:34,table:false,backdrop:'sky'});}catch(e){fail(view);throw e;}
 stage.controls.minDistance=6;stage.controls.maxDistance=20;
 const canvas=stage.canvas,say=x=>{note.textContent=x;ctx.status(x);};
 let scene=null,root=null;
 function setTab(tab){st.tab=tab;st.t=0;st.playing=false;if(root)stage.scene.remove(root);const before=new Set(stage.scene.children);scene=buildScene(stage,tab);root=new THREE.Group();for(const o of stage.scene.children.filter(o=>!before.has(o)))root.add(o);stage.scene.add(root);scene.root=root;poseAt(stage,scene,tab,0);draw();}
 const save=()=>ctx.save(key,{done:[...st.done]});
 const mark=(id,ok,msg)=>{if(ok){st.done.add(id);save();}canvas.dataset.labDone=[...st.done].sort().join(',');say(msg);};
 function draw(){
  host.querySelectorAll('[data-tab]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.tab===st.tab));b.classList.toggle('done',st.done.has(b.dataset.tab));});
  host.querySelector('[data-book]').textContent=BOOK[st.tab];
  if(st.tab==='time'||st.tab==='dist')panel.innerHTML=`<div class="lab5-row"><b>${st.tab==='time'?'더 멀리 간 자동차':'먼저 도착한 자동차'}</b><button type="button" data-pick="A자동차">A자동차</button><button type="button" data-pick="B자동차">B자동차</button></div>`;
  if(st.tab==='event')panel.innerHTML=`<ol class="lab5-steps">${events.map(([n,d,t],i)=>`<li data-row="${i}"><span>${n} · ${t}초 · ${d}m</span>속력 <input data-v type="number" step="0.1" aria-label="${n} 속력"> m/s</li>`).join('')}</ol><div class="lab5-row"><button type="button" data-check>속력 확인</button></div>`;
  if(st.tab==='race')panel.innerHTML=`<ol class="lab5-steps">${racers.map(([team,n,t],i)=>`<li data-row="${i}"><span>${team} ${n} · ${t}초 · 50m</span>속력 <input data-v type="number" step="0.1" aria-label="${n} 속력"> m/s</li>`).join('')}</ol><div class="lab5-row"><b>빠른 순서</b>${racers.map((_,i)=>`<select data-rank="${i}" aria-label="${i+1}번째"><option value="">${i+1}번째</option>${racers.map(r=>`<option>${r[1]}</option>`).join('')}</select>`).join('')}<button type="button" data-check>확인</button></div>`;
  if(st.tab==='marks')panel.innerHTML=`<div class="lab5-row"><b>강아지 A의 속력</b><input data-v type="number" step="1" aria-label="강아지 A 속력"> cm/s <button type="button" data-check>확인</button></div><div class="lab5-row"><b>자국 사이가 더 먼 강아지가</b><button type="button" data-pick="fast">더 빨라요</button><button type="button" data-pick="slow">더 느려요</button></div>`;
  panel.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const v=b.dataset.pick;
   if(st.tab==='time')mark('time',v==='A자동차',v==='A자동차'?'맞아요. 10초 동안 A자동차가 500m, B자동차가 300m를 갔어요. 더 멀리 이동한 A자동차의 속력이 빨라요. (A자동차 〉 B자동차)':'10초 동안 각각 몇 m를 갔는지 거리 표시를 다시 보세요.');
   if(st.tab==='dist')mark('dist',v==='A자동차',v==='A자동차'?'맞아요. 같은 500m를 A자동차는 5초, B자동차는 20초에 갔어요. 이동시간이 적게 걸린 A자동차의 속력이 빨라요. (A자동차 〉 B자동차)':'같은 500m를 가는 데 각각 몇 초가 걸렸는지 비교해 보세요.');
   if(st.tab==='marks')mark('marks-compare',v==='fast',v==='fast'?'맞아요. 같은 1초 동안 더 멀리 갔으니 자국 사이가 먼 쪽이 더 빨라요.':'같은 1초마다 놓았어요. 1초 동안 더 멀리 간 쪽은 어느 강아지인가요?');});
  const chk=panel.querySelector('[data-check]');if(chk)chk.onclick=()=>{
   if(st.tab==='event'){const vals=[...panel.querySelectorAll('[data-v]')].map(i=>i.value);if(vals.some(v=>v==='')){say('세 종목의 속력을 모두 써 주세요.');return;}const ok=events.every(([,d,t],i)=>Math.abs(Number(vals[i])-d/t)<.051);mark('event',ok,ok?'맞아요. 1m/s · 1.5m/s · 3m/s예요. 같은 10초 동안 가장 멀리 간 뒤로 걷기한 사람이 가장 빨라요.':'이동 거리를 걸린 시간 10초로 나눠 보세요.');}
   if(st.tab==='race'){const vals=[...panel.querySelectorAll('[data-v]')].map(i=>i.value),ranks=[...panel.querySelectorAll('[data-rank]')].map(s=>s.value);if(vals.some(v=>v==='')||ranks.some(v=>v==='')){say('다섯 사람의 속력과 순서를 모두 써 주세요.');return;}
    const speedOk=racers.every(([,,t],i)=>Math.abs(Number(vals[i])-round1(50/t))<.051),orderOk=ranks.join()===raceOrder.join();
    mark('race',speedOk&&orderOk,speedOk&&orderOk?`맞아요. 걸린 시간이 짧을수록 빨라요: ${raceOrder.join(' → ')}`:!speedOk?'50m를 각자 걸린 시간으로 나눠 보세요(소수 첫째 자리까지).':'걸린 시간이 짧은 사람부터 순서대로 골라 보세요.');}
   if(st.tab==='marks'){const v=panel.querySelector('[data-v]').value;if(v===''){say('강아지 A의 속력을 써 주세요.');return;}mark('marks',Number(v)===12,Number(v)===12?'맞아요. 1초마다 12cm를 갔으니 12cm/s예요.':'1초 동안 빨대 사이만큼 갔어요. 그 거리를 1초로 나눠 보세요.');}
  };
  canvas.dataset.labTab=st.tab;canvas.dataset.labDone=[...st.done].sort().join(',');
 }
 host.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{setTab(b.dataset.tab);say('▶ 출발을 눌러 보세요.');});
 host.querySelector('[data-play]').onclick=()=>{if(st.tab==='marks')setTab('marks');st.t=0;st.playing=true;say('움직이는 모습을 보세요.');};
 setTab(st.tab);say('▶ 출발을 눌러 보세요.');
 let disposed=false,raf=0,last=performance.now();
 function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.06);last=now;
  if(st.playing&&!document.hidden){st.t=Math.min(scene.duration,st.t+dt*scene.duration/4);if(st.t>=scene.duration)st.playing=false;}
  poseAt(stage,scene,st.tab,st.t);host.querySelector('[data-clock]').textContent=`${Math.round(st.t*10)/10}초`;canvas.dataset.labT=st.t.toFixed(1);
  stage.controls.update();stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);stage.dispose();}};
}
export function mountMotion9(kind,host,ctx){return mountCompare(kind,host,ctx);}

const l9Stills={
 'l9-time':{size:[1200,560],stage:{cam:[0,3.9,8.6],target:[-.3,.5,0],fov:34,table:false,backdrop:'sky'},build(s){renderScene(s,'time');const t=s.label('10초 동안',{size:.42});t.position.set(-.4,2.1,-1.1);}},
 'l9-dist':{size:[1200,560],stage:{cam:[0,3.9,8.6],target:[-.3,.5,0],fov:34,table:false,backdrop:'sky'},build(s){renderScene(s,'dist',20);}},
 'l9-event':{size:[1200,620],stage:{cam:[0,3.8,9.4],target:[-.6,.9,0],fov:34,table:false,backdrop:'sky'},build(s){renderScene(s,'event',6);}},
 'l9-race':{size:[1200,680],stage:{cam:[0,5.4,10.2],target:[-.6,.7,0],fov:34,table:false,backdrop:'sky'},build(s){renderScene(s,'race',4.5);}},
 'l9-marks':{size:[1200,520],stage:{cam:[0,3.0,7.2],target:[-.6,.3,.3],fov:34,table:false,backdrop:'sky'},build(s){renderScene(s,'marks',4);}}
};
export const lesson9StillNames=Object.keys(l9Stills);
export function lesson9StillSize(name){return l9Stills[name].size;}
export function renderLesson9Still(name,host){
 const sc=l9Stills[name];if(!sc)throw new Error('알 수 없는 그림: '+name);
 const stage=createStage(host,{...sc.stage,orbit:false});
 sc.build(stage);stage.resize();stage.renderer.render(stage.scene,stage.camera);
 return {canvas:stage.canvas,dispose:stage.dispose};
}
