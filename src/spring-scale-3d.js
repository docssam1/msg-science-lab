import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function mountSpringScale(host,{initialForce=0,initialZero=0,onReading=()=>{},onForce=()=>{},onPick=()=>{}}={}){
  host.innerHTML='';
  const wrap=document.createElement('div');
  wrap.className='ss3d-wrap';
  wrap.innerHTML='<div class="ss3d-hud"><span data-force>0 N</span><span data-view>정면</span></div><div class="ss3d-drop">물체를 이곳에 끌어 놓으세요</div>';
  host.appendChild(wrap);

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0xf7f9fb);
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);
  camera.position.set(0.15,0.25,7.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  wrap.prepend(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff,0x667788,2.2));
  const key=new THREE.DirectionalLight(0xffffff,3.2); key.position.set(4,6,7); key.castShadow=true; scene.add(key);

  const root=new THREE.Group(); root.position.y=.15; scene.add(root);
  const metal=new THREE.MeshStandardMaterial({color:0x8ba8b7,metalness:.5,roughness:.28});
  const dark=new THREE.MeshStandardMaterial({color:0x254862,metalness:.35,roughness:.35});
  const glass=new THREE.MeshPhysicalMaterial({color:0xeaf9ff,transparent:true,opacity:.22,roughness:.1,transmission:.35,thickness:.2});
  const gold=new THREE.MeshStandardMaterial({color:0xe0a43b,metalness:.25,roughness:.32});
  const loadMat=new THREE.MeshStandardMaterial({color:0x8c7355,roughness:.7});

  const caseMesh=new THREE.Mesh(new THREE.BoxGeometry(2.15,4.65,.9),glass); caseMesh.position.y=.2; root.add(caseMesh);
  const back=new THREE.Mesh(new THREE.BoxGeometry(1.75,4.15,.12),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}));
  back.position.set(.1,.15,-.38); root.add(back);
  const topRing=new THREE.Mesh(new THREE.TorusGeometry(.36,.085,16,48),dark); topRing.position.y=3.05; topRing.rotation.x=Math.PI/2; root.add(topRing);
  const knob=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.28,32),new THREE.MeshStandardMaterial({color:0x58b9bd,roughness:.45}));
  knob.position.set(0,2.35,.48); knob.rotation.x=Math.PI/2; root.add(knob);

  const ticks=new THREE.Group();
  for(let i=0;i<=15;i++){
    const y=1.72-i*.225;
    const len=i%5===0?.48:.28;
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(.42,y,.51),new THREE.Vector3(.42+len,y,.51)]);
    const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x24445c}));
    ticks.add(line);
    if(i%5===0){
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;
      const ctx=canvas.getContext('2d');ctx.font='34px Arial';ctx.fillStyle='#24445c';ctx.fillText(String(i*2),4,42);
      const tex=new THREE.CanvasTexture(canvas);const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
      spr.scale.set(.46,.23,1);spr.position.set(1.1,y,.53);ticks.add(spr);
    }
  }
  root.add(ticks);

  let springLine;
  const springMat=new THREE.LineBasicMaterial({color:0x406c85});
  const pointer=new THREE.Mesh(new THREE.BoxGeometry(1.05,.12,.12),gold); pointer.position.set(.05,1.72,.6); root.add(pointer);
  const rod=new THREE.Mesh(new THREE.BoxGeometry(.11,2.3,.11),dark); rod.position.set(-.18,.57,.58); root.add(rod);
  const hook=new THREE.Mesh(new THREE.TorusGeometry(.24,.06,14,40,Math.PI*1.55),dark); hook.position.set(-.18,-.68,.58); hook.rotation.z=-.3; root.add(hook);
  const load=new THREE.Mesh(new THREE.BoxGeometry(1.05,.75,.82),loadMat); load.position.set(-.18,-1.65,.15); load.castShadow=true; root.add(load);

  let force=initialForce, zero=initialZero, bounce=0, target=force, dragging=false, eyeView='front';

  function springPoints(f){
    const top=2.05, bottom=1.72-(f+zero)*.1125;
    const pts=[]; const turns=17; const n=turns*16;
    for(let i=0;i<=n;i++){const t=i/n;const a=t*Math.PI*2*turns;pts.push(new THREE.Vector3(Math.sin(a)*.17,top+(bottom-top)*t,.46+Math.cos(a)*.05));}
    return pts;
  }
  function updateSpring(){
    if(springLine) root.remove(springLine);
    springLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(springPoints(force+bounce)),springMat); root.add(springLine);
  }
  function paint(){
    const reading=clamp(force+zero+bounce,0,30);
    const d=reading*.1125;
    pointer.position.y=1.72-d;
    rod.position.y=.57-d;
    hook.position.y=-.68-d;
    load.position.y=-1.65-d;
    load.visible=force>0;
    updateSpring();
    wrap.querySelector('[data-force]').textContent=`${Math.round(clamp(force+zero,0,30))} N`;
    onReading({force,zero,reading:force+zero,view:eyeView});
  }
  function setForce(v,{animate=true}={}){
    target=clamp(Number(v)||0,0,30);force=target;onForce(force);
    if(!animate){bounce=0;paint();return;}
    const start=performance.now();
    const run=(now)=>{const t=(now-start)/1000;if(t>1.3){bounce=0;paint();return;}bounce=Math.sin(t*20)*2.4*Math.exp(-t*2.7);paint();requestAnimationFrame(run);};
    requestAnimationFrame(run);
  }
  function setZero(v){zero=clamp(Number(v)||0,-6,6);paint();}
  function setView(v){
    eyeView=v;
    if(v==='high')camera.position.set(.15,2.25,6.4);
    else if(v==='low')camera.position.set(.15,-2.0,6.4);
    else camera.position.set(.15,.25,7.2);
    camera.lookAt(0,.15,0);
    wrap.querySelector('[data-view]').textContent=v==='high'?'위에서 보기':v==='low'?'아래에서 보기':'같은 높이';
    paint();
  }
  function pickedFromEvent(e){
    const r=renderer.domElement.getBoundingClientRect();
    const y=clamp((e.clientY-r.top)/r.height,0,1);
    const approx=clamp(Math.round(((y-.21)/.54)*30/2)*2,0,30);
    onPick(approx,{view:eyeView,trueReading:force+zero});
  }

  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const r=renderer.domElement.getBoundingClientRect();
    const y=clamp((e.clientY-r.top)/r.height,.22,.78);
    setForce(Math.round(((y-.22)/.56)*30/2)*2,{animate:false});
  });
  renderer.domElement.addEventListener('pointerup',e=>{if(dragging){dragging=false;pickedFromEvent(e);}});
  renderer.domElement.addEventListener('click',e=>pickedFromEvent(e));
  wrap.addEventListener('dragover',e=>{e.preventDefault();wrap.classList.add('dragover');});
  wrap.addEventListener('dragleave',()=>wrap.classList.remove('dragover'));
  wrap.addEventListener('drop',e=>{e.preventDefault();wrap.classList.remove('dragover');const v=Number(e.dataTransfer.getData('application/x-msg-force')||e.dataTransfer.getData('text/plain'));if(Number.isFinite(v))setForce(v);});

  function resize(){
    const r=wrap.getBoundingClientRect();const w=Math.max(280,r.width),h=Math.max(420,r.height);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  const ro=new ResizeObserver(resize);ro.observe(wrap);resize();
  camera.lookAt(0,.15,0);paint();
  let raf; const loop=()=>{root.rotation.y=Math.sin(performance.now()/4200)*.045;renderer.render(scene,camera);raf=requestAnimationFrame(loop);};loop();

  return {setForce,setZero,setView,getForce:()=>force,destroy(){cancelAnimationFrame(raf);ro.disconnect();renderer.dispose();host.innerHTML='';}};
}
