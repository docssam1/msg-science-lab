// 1·2차시 3D 체험: 표를 그래프로(본문 17쪽 실험 A, Daily Test 12번), 용수철 조건 비교(18쪽), 생활 속 도구(19쪽).
// 화면 아래 단추·입력과 저장 키는 예전 2D 체험과 같다. 수치는 교재 값만(10·20·30 g → 3·6·9 cm, 12번은 4·8·12 cm).
import * as THREE from './vendor/three.module.js';
import {createStage} from './balance3d.js';
import {helixGeometry} from './lesson3d.js';
import {dataLesson,dataAssessment,gradePoints} from './physics.js';
import {esc} from './graphics.js';
import {toolRows} from './content.js';
import {factorArt,toolIcon} from './art3d.js';

function boardTexture(stage,{xs,xMax,ys,yMax,xLabel,yLabel}){
 const W=1600,H=1200,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#21483b';g.fillRect(0,0,W,H);
 const L=230,B=H-170,X=x=>L+x/xMax*(W-L-140),Y=y=>B-y/yMax*(B-120);
 g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=3;g.setLineDash([14,12]);
 for(const x of xs){g.beginPath();g.moveTo(X(x),Y(0));g.lineTo(X(x),Y(yMax));g.stroke();}
 for(const y of ys){g.beginPath();g.moveTo(X(0),Y(y));g.lineTo(X(xMax),Y(y));g.stroke();}
 g.setLineDash([]);g.strokeStyle='#f4f1e6';g.lineWidth=8;g.beginPath();g.moveTo(X(0),Y(yMax)-20);g.lineTo(X(0),Y(0));g.lineTo(X(xMax)+40,Y(0));g.stroke();
 const font=n=>`800 ${n}px "Pretendard Variable","Segoe UI","Malgun Gothic",sans-serif`;g.fillStyle='#f4f1e6';
 g.font=font(46);g.textAlign='center';g.fillText('0',X(0),Y(0)+62);for(const x of xs)g.fillText(String(x),X(x),Y(0)+62);g.textAlign='right';for(const y of ys)g.fillText(String(y),X(0)-20,Y(y)+16);
 g.font=font(50);g.textAlign='left';g.fillText(yLabel,X(0)-40,76);g.textAlign='right';g.fillText(xLabel,W-60,Y(0)+130);
 return {tex:stage.canvasTex(c),u:x=>X(x)/W,v:y=>Y(y)/H};
}

// ───────── 표를 그래프로 ─────────
function mountGraph(kind,host,ctx){
 const assessment=kind==='assessment-graph',expected=assessment?dataAssessment:dataLesson,step=assessment?4:3,max=step*4,key=assessment?'graph-assessment':'graph-lesson';
 let points=ctx.load(key,[]);
 host.innerHTML='<div class="graph3d-lab balance-lab"><div class="balance-view"><span class="scene-tag">3D 가상 칠판 · 칠판을 눌러 점을 찍을 수 있어요</span></div><div class="graph-copy"></div></div>';
 const view=host.querySelector('.balance-view'),side=host.querySelector('.graph-copy');
 side.innerHTML=`<b>${assessment?'일일평가 12번 자료':'본문 17쪽의 실험 자료'}</b><table><tr><th>g</th><th>cm</th></tr>${expected.map(([x,y])=>`<tr><td>${x}</td><td>${y}</td></tr>`).join('')}</table><p>가로축은 추의 무게, 세로축은 <b>늘어난 길이</b>입니다.</p><label>g <input data-x type="number" min="10" max="30" step="10" value="10" aria-label="추의 무게 g"></label><label>cm <input data-y type="number" min="0" max="${max}" step="${step}" value="${step}" aria-label="늘어난 길이 cm"></label><button data-add>점 찍기</button><button data-check class="selected">그래프 제출 · 확인</button><button data-clear>이 그래프 다시 그리기</button><p>${assessment?'앞의 실험은 3·6·9 cm, 이 문제는 4·8·12 cm입니다. 서로 다른 자료를 섞지 않습니다.':'측정표에서 찾은 값을 하나씩 점으로 옮겨 보세요.'}</p>`;
 const stage=createStage(view,{cam:[-.3,3.3,20.5],target:[-.3,3.0,0]});
 const {scene,canvas}=stage;
 const BW=8,BH=6,BX=1.2,BY=3.4;
 stage.rbox(BW+.4,BH+.4,.3,.1,stage.phys({color:'#8a6b3c',roughness:.5}),BX,BY,-.2);
 const t=boardTexture(stage,{xs:[10,20,30],xMax:33,ys:[step,step*2,step*3,step*4],yMax:step*4.3,xLabel:'추의 무게 (g)',yLabel:'늘어난 길이 (cm)'});
 const boardMesh=stage.mesh(new THREE.PlaneGeometry(BW,BH),stage.mat({map:t.tex,roughness:.9}),scene,{cast:false});boardMesh.position.set(BX,BY,-.03);
 for(const x of [BX-2.8,BX+2.8])stage.mesh(new THREE.CylinderGeometry(.08,.08,4.6,16),stage.mat({color:'#5c4a2e'})).position.set(x,1.1,-.4);
 const P=(x,y)=>new THREE.Vector3(BX-BW/2+t.u(x)*BW,BY+BH/2-t.v(y)*BH,.12);
 const dotMat=stage.phys({color:'#ff6a4d',roughness:.3,clearcoat:.7,emissive:'#5a1a10'}),dotGeo=new THREE.SphereGeometry(.16,24,16);stage.geometries.add(dotGeo);
 const dots=new THREE.Group();scene.add(dots);let line=null;const tags=[];
 // 왼쪽: 마지막에 찍은 점의 추를 매단 용수철(늘어난 길이를 눈으로 비교)
 const steel=stage.mat({color:'#d3dade',metalness:1,roughness:.24});
 stage.rbox(1.6,.18,.9,.05,stage.phys({color:'#2f4656'}),-5.3,5.6,0);stage.mesh(new THREE.CylinderGeometry(.07,.07,5.6,16),steel).position.set(-6.0,2.8,0);
 let spring=null;const weights=new THREE.Group();scene.add(weights);const brass=stage.phys({color:'#d3b05a',metalness:.9,roughness:.3}),wGeo=new THREE.CylinderGeometry(.24,.24,.26,32);stage.geometries.add(wGeo);
 const springTag=stage.label('',{size:.42});
 function draw(){
  while(dots.children.length)dots.remove(dots.children[0]);
  tags.forEach(tag=>{scene.remove(tag);tag.material.map?.dispose();tag.material.dispose();});tags.length=0;
  const sorted=points.slice().sort((a,b)=>a[0]-b[0]);
  for(const [x,y] of sorted){const m=new THREE.Mesh(dotGeo,dotMat);m.castShadow=true;m.position.copy(P(x,y));dots.add(m);const tag=stage.label(`(${x}, ${y})`,{size:.36});tag.position.copy(P(x,y).add(new THREE.Vector3(.75,.32,.1)));tags.push(tag);}
  if(line){scene.remove(line);line.geometry.dispose();line=null;}
  if(sorted.length>=2){line=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([P(0,0),...sorted.map(([x,y])=>P(x,y))],false,'catmullrom',0),48,.045,10),dotMat);scene.add(line);}
  const last=points.at(-1);const ext=last?last[1]:0,n=last?last[0]/10:0;
  if(spring){scene.remove(spring);spring.geometry.dispose();}
  const len=1.0+ext*.16;spring=new THREE.Mesh(helixGeometry(len,12,.22),steel);spring.castShadow=true;spring.position.set(-4.9,5.5,0);scene.add(spring);
  while(weights.children.length)weights.remove(weights.children[0]);
  for(let i=0;i<n;i++){const w=new THREE.Mesh(wGeo,brass);w.castShadow=true;w.position.set(-4.9,5.5-len-.2-i*.28,0);weights.add(w);}
  springTag.userData.set(last?`${last[0]} g · ${last[1]} cm`:'추를 매달아요');springTag.position.set(-4.9,5.5-len-.5-n*.28,.5);
  canvas.dataset.points=JSON.stringify(sorted);
 }
 function setPoint(x,y){if(![10,20,30].includes(x)||!Number.isFinite(y)||y<0||y>max){ctx.status('추의 무게는 10·20·30 g 중에서, 길이는 눈금 범위 안에서 선택하세요.');return;}points=points.filter(p=>p[0]!==x);points.push([x,y]);ctx.save(key,points);draw();ctx.status(`${x} g, ${y} cm에 점을 찍었습니다. (${points.length}/3)`);}
 side.querySelector('[data-add]').onclick=()=>setPoint(+side.querySelector('[data-x]').value,+side.querySelector('[data-y]').value);
 side.querySelector('[data-check]').onclick=()=>{const ok=gradePoints(points,expected);ctx.save(key+'-result',{correct:ok,points});ctx.status(ok?'세 점이 모두 표와 일치합니다. 무게와 늘어난 길이의 관계를 설명해 보세요.':'아직 표와 다른 점이 있어요. 각 추의 무게에 대응하는 늘어난 길이를 다시 읽어 보세요.');};
 side.querySelector('[data-clear]').onclick=()=>{points=[];ctx.save(key,points);draw();ctx.status('이 그래프의 점을 지웠습니다.');};
 // 칠판을 누르면 가장 가까운 눈금(10·20·30 g, 세로 눈금 간격)에 점을 찍는다
 const ray=new THREE.Raycaster(),vec=new THREE.Vector2();let downAt=null;
 canvas.addEventListener('pointerdown',e=>{downAt={x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointerup',e=>{if(!downAt||Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)>6)return;const r=canvas.getBoundingClientRect();vec.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(vec,stage.camera);const hit=ray.intersectObject(boardMesh)[0];if(!hit)return;
  const local=hit.point;const u=(local.x-(BX-BW/2))/BW,v=(BY+BH/2-local.y)/BH;
  const gx=[10,20,30].reduce((best,x)=>Math.abs(t.u(x)-u)<Math.abs(t.u(best)-u)?x:best,10);
  let gy=0,bd=Infinity;for(let k=0;k<=4;k++){const yv=k*step,d=Math.abs(t.v(yv)-v);if(d<bd){bd=d;gy=yv;}}
  side.querySelector('[data-x]').value=gx;side.querySelector('[data-y]').value=gy;setPoint(gx,gy);});
 draw();
 let raf=0,disposed=false;
 function tick(){if(disposed)return;stage.controls.update();stage.renderer.render(scene,stage.camera);raf=requestAnimationFrame(tick);}
 raf=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(raf);if(line)line.geometry.dispose();if(spring)spring.geometry.dispose();stage.dispose();}};
}

// ───────── 용수철 조건 비교 ─────────
function mountFactors(host,ctx){
 const factors=[['material','재질'],['thickness','철사 굵기'],['diameter','코일 지름']];
 let selected=0;const notes=ctx.load('factor-notes',{});
 function draw(){const [id,label]=factors[selected],same=factors.filter((_,i)=>i!==selected).map(x=>x[1]);
  host.innerHTML=`<div class="factor-activity"><h3>무엇을 하나만 바꿀까요?</h3><div class="factor-tabs">${factors.map(([,name],i)=>`<button data-factor="${i}" aria-pressed="${i===selected}">${name}</button>`).join('')}</div><p>바꿀 조건: <b>${label}</b> · 같게 둘 조건: <b>${same.join(' · ')} · 매단 힘</b></p><figure class="factor-3d">${factorArt(id)}<figcaption>${label}만 다른 두 용수철(3D 개념 그림)</figcaption></figure><p>이 그림은 비교할 조건만 나타낸 3D 개념 그림입니다. 늘어난 길이나 탄성력의 크기는 실제 관찰 뒤 기록하세요.</p><label>예상과 관찰<textarea data-factor-note rows="3" maxlength="500">${esc(notes[id]||'')}</textarea></label><button data-factor-save>기록 저장</button></div>`;
  host.querySelectorAll('[data-factor]').forEach(b=>b.onclick=()=>{notes[id]=host.querySelector('[data-factor-note]').value;ctx.save('factor-notes',notes);selected=+b.dataset.factor;draw();});
  host.querySelector('[data-factor-save]').onclick=()=>{notes[id]=host.querySelector('[data-factor-note]').value;ctx.save('factor-notes',notes);ctx.status(`${label}을 바꿔 비교한 기록을 저장했습니다.`);};}
 draw();
 return {destroy(){const id=factors[selected][0];notes[id]=host.querySelector('[data-factor-note]')?.value||notes[id]||'';ctx.save('factor-notes',notes);}};
}

// ───────── 생활 속 도구(사진·3D 그림 + 3D 용수철 움직임) ─────────
function mountTools(host,ctx,say){
 let chosen=0,running=false;
 host.innerHTML='<div class="tool-activity"><div class="tool-main"></div><div class="tool-picker"></div></div>';
 const main=host.querySelector('.tool-main'),picker=host.querySelector('.tool-picker');
 picker.innerHTML=toolRows.map(([,t],i)=>`<button data-tool="${i}">${t}</button>`).join('');
 let stage=null,spring=null,raf=0,disposed=false,t0=performance.now();
 const steel=()=>stage.mat({color:'#d3dade',metalness:1,roughness:.24});
 function buildSpring(){
  stage?.dispose();cancelAnimationFrame(raf);
  const view=main.querySelector('.tool-spring');stage=createStage(view,{cam:[0,2.2,7.5],target:[0,2,0]});
  stage.rbox(2.4,.2,1.2,.06,stage.phys({color:'#2f4656'}),0,4.0,0);
  spring=null;const m=steel();
  function frame(now){if(disposed)return;const compressMode=chosen<3,phase=running?(Math.sin((now-t0)/380)+1)/2:0;
   const len=compressMode?2.6-phase*1.2:2.0+phase*1.2;
   if(spring){stage.scene.remove(spring);spring.geometry.dispose();}
   spring=new THREE.Mesh(helixGeometry(len,10,.3),m);spring.castShadow=true;spring.position.set(0,3.9,0);stage.scene.add(spring);
   stage.renderer.render(stage.scene,stage.camera);raf=requestAnimationFrame(frame);}
  raf=requestAnimationFrame(frame);
 }
 function draw(){const [key,title,text]=toolRows[chosen];running=false;
  main.innerHTML=`<div class="tool-figures"><figure class="tool-photo">${toolIcon(key)}</figure><div class="balance-view tool-spring"><span class="scene-tag">3D 개념 모형</span></div></div><h3>${title}</h3><p>${text}</p><small>본책 p19의 설명 · 사진과 3D 개념 모형, 실제 제품 구조는 다를 수 있음</small><button data-tool-motion>개념 모형 움직이기</button><div class="control-grid"><button data-role="compress">줄었다가 돌아온다</button><button data-role="extend">늘었다가 돌아온다</button></div>`;
  buildSpring();
  main.querySelector('[data-tool-motion]').onclick=e=>{running=!running;t0=performance.now();e.target.textContent=running?'움직임 멈추기':'개념 모형 움직이기';main.classList.toggle('running',running);};
  main.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>ctx.status(b.dataset.role===(chosen<3?'compress':'extend')?'본책에서 설명한 분류와 같습니다. 실제 도구의 어느 부분인지도 찾아보세요.':'본책 p19에서 이 도구가 어떻게 설명되어 있는지 다시 읽어 보세요.'));}
 picker.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{chosen=+b.dataset.tool;draw();say(toolRows[chosen][2]);});
 draw();
 return {destroy(){disposed=true;cancelAnimationFrame(raf);if(spring)spring.geometry.dispose();stage?.dispose();}};
}

export function mountLessons12(kind,host,ctx,say){
 if(kind==='graph'||kind==='assessment-graph')return mountGraph(kind,host,ctx);
 if(kind==='factors')return mountFactors(host,ctx);
 return mountTools(host,ctx,say);
}
