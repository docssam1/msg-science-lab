import {esc,toolIcon,springArt,eyeArt,graphSVG} from './graphics.js';
import {dataLesson,dataAssessment,gradePoints,clamp} from './physics.js';
import {toolRows} from './content.js';
export const activityNames={inquiry:'저울이 왜 필요할까? · 예상부터 방법 점검까지',parts:'이 부품은 어떤 일을 할까요?',zero:'물체를 달기 전에 영점 맞추기',compare:'어느 물체가 더 무거울까요?',target:'고리를 당겨 목표 눈금에 맞추기',eye:'시선만 바꾸고 눈금 직접 찍기',types:'어떤 저울을 사용할까요?',history:'용수철의 이름과 과거',watch:'기록영상 · 시계 속 태엽',balance:'기록영상 · 작은 용수철의 반복 운동',future:'교재의 미래 전망 · 개념 도해',elastic:'잡아당기고 놓아 보는 탄성',compression:'누르는 힘과 길이 변화',measure:'추 10·20·30 g과 늘어난 길이',graph:'표를 읽고 그래프에 점 찍기','assessment-graph':'일일평가 12번 · 다른 표, 다른 그래프','spring-film':'실제 용수철 운동 관찰',tools:'생활 속 여섯 도구',assessment:'답안과 확인 질문',source:'원본 교재 대조',reading:'본문 크게 읽기',credits:'외부 자료와 구현 범위'};
const partList=[['handle','손잡이','손으로 잡거나 스탠드에 고정하는 부분입니다.'],['zero','영점조절나사','물체를 달기 전에 표시자를 0에 맞춥니다.'],['spring','용수철','물체를 매달면 늘어나는 부분입니다.'],['pointer','표시자','눈금을 가리키며 윗부분을 기준으로 읽습니다.'],['scale','눈금','측정값과 단위를 확인하는 표시입니다.'],['hook','고리','무게를 재려는 물체를 매다는 부분입니다.']];
export async function mountActivity(kind,host,ctx){
 if(kind==='inquiry'){const {mountInquiry}=await import('./inquiry.js');return mountInquiry(host,ctx);}
 let disposed=false,cleanup=()=>{};const setStatus=s=>{if(!disposed)ctx.status(s);};
 const say=s=>disposed?Promise.resolve(false):ctx.say(s);
 const destroy=()=>{disposed=true;cleanup();};
 if(['parts','zero','compare','target','eye','elastic','compression','measure'].includes(kind)){
  host.innerHTML='<div class="lab-layout"><div class="scene"></div><div class="lab-controls"></div></div>';
  const scene=host.querySelector('.scene'),panel=host.querySelector('.lab-controls');
  let lab=null;const state={part:0,revealed:false,target:14,read:false,rows:ctx.load('measure-rows',[]),measurementPick:null};
  function error(e){scene.innerHTML='<div class="scene-error"><h3>3D 교구를 열지 못했습니다.</h3><p>이 브라우저의 WebGL 지원을 확인해 주세요. 교재의 정확한 그림과 본문은 계속 읽을 수 있습니다.</p><p>'+esc(e.message||e)+'</p></div>';setStatus('3D 표시 실패 · 다른 브라우저에서 다시 시도할 수 있습니다.');}
  function sync(s){
   if(disposed)return;
   if(kind==='zero'){const z=panel.querySelector('[data-zero]');if(z)z.value=s.zero;const v=panel.querySelector('[data-zero-out]');if(v)v.textContent=s.zero+' N';}
   const out=panel.querySelector('[data-reading]');
   if(out){if(kind==='measure')out.textContent=s.settled?'표시가 멈췄어요':'아직 흔들리고 있어요';else if(kind==='eye')out.textContent='물체의 힘: 20 N';else if(kind==='compression')out.textContent=`전체 ${(10-s.force*.2).toFixed(1)} cm / 줄어든 ${(s.force*.2).toFixed(1)} cm`;else if(kind==='target'||kind==='elastic')out.textContent=`${s.force.toFixed(1)} N`;else out.textContent=state.read&&s.settled?`${s.reading.toFixed(0)} N`:s.settled?'눈금을 읽어 보세요':'진동이 멈출 때까지 기다려요';}
   panel.querySelectorAll('[data-requires-stable]').forEach(b=>b.disabled=!s.settled);
  }
  let externalHandlers=[];
  try{const {mountLab}=await import('./lab3d.js');if(disposed)return {destroy};lab=mountLab(scene,{mode:kind,onChange:sync,onPick:(value,s)=>{
   if(kind!=='eye')return;
   state.measurementPick=value;
   const expected=s.expected;
   setStatus(`선택한 눈금 ${value} N. ${Math.abs(value-expected)<.8?'현재 시선에 맞는 위치를 읽었어요.':'표시자 윗부분과 같은 시선으로 눈금판을 다시 살펴보세요.'} 물체의 실제 힘은 20 N 그대로입니다.`);
  },onRelease:v=>{if(kind==='target'){const ok=Math.abs(v-state.target)<=.6;setStatus(ok?`목표 ${state.target} N에 맞췄어요. 손을 놓으면 다시 돌아갑니다.`:`놓기 직전 ${v.toFixed(1)} N이었어요. 목표 ${state.target} N과 비교해 다시 당겨 보세요.`);}}});
  }catch(e){error(e);return {destroy};}
  ctx.setLab(lab);
  const feedback=s=>{const el=panel.querySelector('[data-feedback]');if(el)el.textContent=s;setStatus(s);};
  const buttons=()=>`<button data-home>저울 전체 보기</button><button data-front>정면으로 보기</button>`;
  if(kind==='parts'){
   function showPart(){const [id,name]=partList[state.part];state.revealed=false;lab.focusPart(id);panel.innerHTML=`<div class="eyebrow">부품 ${state.part+1} / 6</div><h3>확대된 부분의 이름은?</h3><p>모양을 보고, 없어지면 무엇이 어려울지 말해 보세요.</p><div class="control-grid">${partList.map(([i,n])=>`<button data-part-choice="${i}">${n}</button>`).join('')}</div><div class="feedback" data-feedback>아직 이름을 공개하지 않았어요.</div><button data-next-part disabled>다음 부품 →</button>${buttons()}`;
    panel.querySelectorAll('[data-part-choice]').forEach(b=>b.onclick=()=>{const ok=b.dataset.partChoice===id;feedback(ok?`${name}: ${partList[state.part][2]}`:'이 부품의 위치와 역할을 다시 살펴보세요.');if(ok){state.revealed=true;panel.querySelector('[data-next-part]').disabled=false;say(`${name}. ${partList[state.part][2]}`);}});
    panel.querySelector('[data-next-part]').onclick=()=>{if(state.part===5){feedback('여섯 부품을 모두 확인했습니다. 이제 영점을 맞추고 물체를 매달아 봅시다.');lab.resetView();return;}state.part++;showPart();};bindViews();
   }
   function bindViews(){panel.querySelector('[data-home]').onclick=()=>lab.resetView();panel.querySelector('[data-front]').onclick=()=>lab.setEye('front');}
   showPart();
  }
  if(kind==='zero'){
   panel.innerHTML='<h3>빈 저울이 4 N을 가리켜요.</h3><p>물체를 달지 않았습니다. 영점조절나사로 0에 맞춰 보세요.</p><output class="reading" data-zero-out>4 N</output><input type="range" min="-6" max="6" step="1" value="4" aria-label="영점조절나사" data-zero><div class="control-grid"><button data-zminus>−1</button><button data-zplus>+1</button></div><button data-zero-check>0에 맞췄어요</button><div class="feedback" data-feedback>표시자의 윗부분을 기준으로 읽어요.</div>';
   const change=v=>{lab.setZero(v);panel.querySelector('[data-zero]').value=v;panel.querySelector('[data-zero-out]').textContent=`${v} N`;};
   panel.querySelector('[data-zero]').oninput=e=>change(+e.target.value);
   panel.querySelector('[data-zminus]').onclick=()=>change(clamp(lab.state().zero-1,-6,6));panel.querySelector('[data-zplus]').onclick=()=>change(clamp(lab.state().zero+1,-6,6));
   panel.querySelector('[data-zero-check]').onclick=()=>{const ok=lab.state().zero===0;feedback(ok?'영점이 맞았어요. 이제 물체를 고리에 걸 수 있습니다.':'아직 0이 아니에요. 나사를 다시 조절해 보세요.');};
  }
  if(kind==='compare'||kind==='measure'){
   const objects=kind==='measure'?[['10 g 추',10,'weight'],['20 g 추',20,'weight'],['30 g 추',30,'weight']]:[['작은 공',6,'ball'],['필통',12,'case'],['금속 추',20,'weight'],['큰 추',28,'weight']];
   panel.innerHTML=`<h3>${kind==='measure'?'추를 고리에 매달아 보세요':'먼저 무게를 예상해요'}</h3><p>물체를 고리의 주황색 원에 끌어 놓으세요. 버튼을 눌러 매달 수도 있어요.</p><div class="weights">${objects.map(([name,f,shape],i)=>`<div class="weight-item" role="button" tabindex="0" data-load="${f}" data-shape="${shape}" data-name="${name}"><span>${['○','▣','▥','▦'][i]}</span><strong>${name}</strong></div>`).join('')}</div><button data-remove>물체 빼기</button><div class="reading" data-reading>눈금을 읽어 보세요</div>${kind==='measure'?'<label>늘어난 길이 <input type="number" step="1" min="0" max="15" data-record-value aria-label="늘어난 길이 cm"> cm</label><button data-record data-requires-stable>읽은 값 기록하기</button><p>원래 길이 5 cm는 이 가상 교구의 추가 설정입니다. 전체 길이에서 원래 길이를 빼요.</p>':'<button data-read data-requires-stable>측정값 확인 · 기록</button>'}<div class="feedback" data-feedback>표시자가 멈춘 뒤 읽습니다.</div><div data-table></div>`;
   let currentName='';const rows=kind==='measure'?state.rows:[];
   function table(){panel.querySelector('[data-table]').innerHTML='<table><tr><th>물체</th><th>측정 기록</th></tr>'+rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.value} ${kind==='measure'?'cm':'N'}</td></tr>`).join('')+'</table>';}
   table();
   function load(el){state.read=false;currentName=el.dataset.name;lab.setForce(+el.dataset.load,{shape:el.dataset.shape});feedback(`${currentName}를 매달았어요. 진동이 멈출 때까지 관찰합니다.`);}
   panel.querySelectorAll('[data-load]').forEach(el=>{
    let dragInfo=null;
    const onDown=e=>{if(e.button!==0&&e.pointerType==='mouse')return;el.setPointerCapture(e.pointerId);dragInfo={id:e.pointerId,x:e.clientX,y:e.clientY,ghost:null};e.preventDefault();};
    const onMove=e=>{if(!dragInfo||dragInfo.id!==e.pointerId)return;if(!dragInfo.ghost&&Math.hypot(e.clientX-dragInfo.x,e.clientY-dragInfo.y)>5){const g=document.createElement('div');g.className='drag-ghost';g.textContent=el.dataset.name;document.body.append(g);dragInfo.ghost=g;}if(dragInfo.ghost){dragInfo.ghost.style.left=e.clientX+10+'px';dragInfo.ghost.style.top=e.clientY-10+'px';}};
    const onUp=e=>{if(!dragInfo||dragInfo.id!==e.pointerId)return;const h=lab.hookScreen();if(!dragInfo.ghost||Math.hypot(h.x-e.clientX,h.y-e.clientY)<95)load(el);else feedback('고리의 주황색 원 가까이에 놓아 주세요.');dragInfo.ghost?.remove();dragInfo=null;};
    const onCancel=()=>{dragInfo?.ghost?.remove();dragInfo=null;};
    el.addEventListener('pointerdown',onDown);el.addEventListener('pointermove',onMove);el.addEventListener('pointerup',onUp);el.addEventListener('pointercancel',onCancel);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();load(el);}};externalHandlers.push(onCancel);
   });
   panel.querySelector('[data-remove]').onclick=()=>{lab.setForce(0);state.read=false;currentName='';};
   if(kind==='compare')panel.querySelector('[data-read]').onclick=()=>{let s=lab.state();if(!s.settled)return;state.read=true;sync(s);if(currentName&&!rows.some(r=>r.name===currentName))rows.push({name:currentName,value:s.reading});table();feedback('측정값을 기록했어요. 다른 물체의 값과 비교해 보세요.');};
   else panel.querySelector('[data-record]').onclick=()=>{let s=lab.state(),input=panel.querySelector('[data-record-value]'),v=Number(input.value);if(!currentName||input.value===''){feedback('추를 매단 뒤 읽은 값을 적어 주세요.');return;}if(!s.settled)return;if(Math.abs(v-s.extension)>.05){feedback('전체 길이가 아니라 원래 길이에서 늘어난 길이를 구해 보세요.');return;}let r={name:currentName,value:v,mass:s.force};const old=rows.findIndex(r=>r.name===currentName);if(old>=0)rows[old]=r;else rows.push(r);ctx.save('measure-rows',rows);table();feedback(rows.length===3?'세 측정값을 모두 기록했어요. 다음 그래프 활동으로 이어갑니다.':'기록했어요. 다음 추로 같은 방법을 반복해 보세요.');};
  }
  if(kind==='target'||kind==='elastic'){
   panel.innerHTML=`<h3>${kind==='target'?'목표: <b data-target>14 N</b>':'당겼다가 놓아 보세요'}</h3><p>고리의 주황색 부분을 잡아 아래로 당깁니다. 손을 놓으면 원래 위치로 돌아갑니다.</p><output class="reading" data-reading>0 N</output><label>키보드·터치 보조 조절<input type="range" min="0" max="30" step="1" value="0" aria-label="당기는 힘 N" data-force-range></label><button data-release>힘을 놓기</button>${kind==='target'?'<button data-new-target>다음 목표</button>':''}<div class="feedback">${kind==='target'?'목표 근처에 맞춘 뒤 손을 놓아 보세요.':'작은 힘과 큰 힘으로 당겼을 때를 비교해 보세요.'}</div>`;
   panel.querySelector('[data-force-range]').oninput=e=>lab.setForce(+e.target.value,{instant:true});panel.querySelector('[data-release]').onclick=()=>{const v=lab.state().force;if(kind==='target')setStatus(Math.abs(v-state.target)<.6?'목표에 맞췄어요. 손을 놓으면 돌아옵니다.':'목표 눈금과 현재 힘을 비교해 다시 시도해 보세요.');lab.setForce(0);panel.querySelector('[data-force-range]').value=0;};
   if(kind==='target'){const sequence=[14,10,22,18,26],seen=new Set([14]);panel.querySelector('[data-new-target]').onclick=()=>{const next=sequence.find(x=>!seen.has(x));if(next===undefined){setStatus('이 활동의 목표를 모두 확인했습니다. 같은 목표를 다시 뽑지 않습니다.');panel.querySelector('[data-new-target]').disabled=true;return;}seen.add(next);state.target=next;panel.querySelector('[data-target]').textContent=next+' N';};}
  }
  if(kind==='compression'){
   panel.innerHTML='<h3>원래 길이 10 cm</h3><p>누르는 힘이 커질수록 전체 길이는 짧아지고 줄어든 길이는 커집니다.</p><label>누르는 힘<input type="range" min="0" max="30" step="1" value="0" aria-label="누르는 힘" data-compress></label><output class="reading" data-reading style="font-size:16px">전체 10 cm / 줄어든 0 cm</output><button data-release>힘을 없애기</button><div class="feedback">10 cm와 수치 변환은 추가한 가상 모형의 설정입니다. ‘전체 길이와 반비례’라는 원문의 문장은 별도 검토 표시를 유지합니다.</div>';
   panel.querySelector('[data-compress]').oninput=e=>lab.setForce(+e.target.value,{instant:true});panel.querySelector('[data-release]').onclick=()=>{lab.setForce(0);panel.querySelector('[data-compress]').value=0;};
  }
  if(kind==='eye'){
   panel.innerHTML='<h3>실제 힘은 변하지 않아요.</h3><output class="reading" data-reading>물체의 힘: 20 N</output><div class="control-grid"><button data-eye="high">위에서</button><button data-eye="front">같은 높이</button><button data-eye="low">아래에서</button></div><p>표시자의 윗부분을 따라 눈금판에서 같은 위치로 보이는 눈금을 직접 누르세요.</p><div class="feedback" data-feedback>처음에는 같은 높이에서 봅니다.</div><label>눈금 직접 입력 <input type="number" min="0" max="30" step="1" value="20" data-eye-value aria-label="읽은 눈금 N"> N</label><button data-check-eye>읽은 눈금 확인</button>';
   panel.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{panel.querySelectorAll('[data-eye]').forEach(x=>x.classList.toggle('selected',x===b));lab.setEye(b.dataset.eye);feedback('시선이 이동합니다. 물체와 표시자는 같은 위치입니다.');});
   panel.querySelector('[data-check-eye]').onclick=()=>{const s=lab.state(),v=Number(panel.querySelector('[data-eye-value]').value);feedback(Math.abs(v-s.expectedEye)<.8?`이 시선에서는 약 ${v} N으로 보여요. 실제 힘은 20 N입니다.`:'현재 시선으로 표시자 윗부분과 눈금판을 다시 비교해 보세요.');};
  }
  cleanup=()=>{externalHandlers.forEach(f=>f());ctx.setLab(null);lab?.destroy();};
  return {destroy};
 }
 if(kind==='graph'||kind==='assessment-graph'){
  const assessment=kind==='assessment-graph',expected=assessment?dataAssessment:dataLesson,step=assessment?4:3,max=step*4,key=assessment?'graph-assessment':'graph-lesson';
  let points=ctx.load(key,[]);host.innerHTML='<div class="graph-layout"><div class="graph-holder"></div><div class="graph-copy"></div></div>';
  const graph=host.querySelector('.graph-holder'),side=host.querySelector('.graph-copy');
  side.innerHTML=`<b>${assessment?'일일평가 12번 자료':'본문 17쪽의 실험 자료'}</b><table><tr><th>g</th><th>cm</th></tr>${expected.map(([x,y])=>`<tr><td>${x}</td><td>${y}</td></tr>`).join('')}</table><p>가로축은 추의 무게, 세로축은 <b>늘어난 길이</b>입니다.</p><label>g <input data-x type="number" min="10" max="30" step="10" value="10" aria-label="추의 무게 g"></label><label>cm <input data-y type="number" min="0" max="${max}" step="${step}" value="${step}" aria-label="늘어난 길이 cm"></label><button data-add>점 찍기</button><button data-check class="selected">그래프 제출 · 확인</button><button data-clear>이 그래프 다시 그리기</button><p>${assessment?'앞의 실험은 3·6·9 cm, 이 문제는 4·8·12 cm입니다. 서로 다른 자료를 섞지 않습니다.':'측정표에서 찾은 값을 하나씩 점으로 옮겨 보세요.'}</p>`;
  function draw(){let grid='';for(let x=0;x<=30;x+=10){let X=100+x*14;grid+=`<path d="M${X} 80V440" stroke="#b8cdd3" stroke-dasharray="5 5"/><text x="${X}" y="470" text-anchor="middle" font-size="20">${x}</text>`;}for(let i=0;i<=4;i++){let y=i*step,Y=440-i*90;grid+=`<path d="M100 ${Y}H520" stroke="#b8cdd3" stroke-dasharray="5 5"/><text x="83" y="${Y+7}" text-anchor="end" font-size="20">${y}</text>`;}
   graph.innerHTML=`<svg class="graph-canvas" viewBox="0 0 650 550" aria-label="추의 무게와 늘어난 길이 그래프. 아래 입력으로도 점을 찍을 수 있습니다."><text x="100" y="35" font-size="22" font-weight="700">늘어난 길이 (cm)</text>${grid}<path d="M100 57V440H555" stroke="#173955" stroke-width="3" fill="none"/><text x="410" y="516" font-size="22" font-weight="700">추의 무게 (g)</text>${[10,20,30].flatMap(x=>Array.from({length:5},(_,i)=>`<circle class="pickable" data-point="${x},${i*step}" cx="${100+x*14}" cy="${440-i*90}" r="20" fill="transparent" role="button" tabindex="0" aria-label="${x} g, ${i*step} cm"/>`)).join('')}${points.slice().sort((a,b)=>a[0]-b[0]).map(([x,y])=>`<circle cx="${100+x*14}" cy="${440-y/max*360}" r="8" fill="#ca624a" pointer-events="none"/><text x="${100+x*14+10}" y="${440-y/max*360-10}" font-size="17" pointer-events="none">(${x}, ${y})</text>`).join('')}</svg>`;
   graph.querySelectorAll('[data-point]').forEach(p=>{const add=()=>setPoint(...p.dataset.point.split(',').map(Number));p.onclick=add;p.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();add();}};});}
  function setPoint(x,y){if(![10,20,30].includes(x)||!Number.isFinite(y)||y<0||y>max){setStatus('추의 무게는 10·20·30 g 중에서, 길이는 눈금 범위 안에서 선택하세요.');return;}points=points.filter(p=>p[0]!==x);points.push([x,y]);ctx.save(key,points);draw();setStatus(`${x} g, ${y} cm에 점을 찍었습니다. (${points.length}/3)`);}
  side.querySelector('[data-add]').onclick=()=>setPoint(+side.querySelector('[data-x]').value,+side.querySelector('[data-y]').value);
  side.querySelector('[data-check]').onclick=()=>{const ok=gradePoints(points,expected);ctx.save(key+'-result',{correct:ok,points});setStatus(ok?'세 점이 모두 표와 일치합니다. 무게와 늘어난 길이의 관계를 설명해 보세요.':'아직 표와 다른 점이 있어요. 각 추의 무게에 대응하는 늘어난 길이를 다시 읽어 보세요.');};
  side.querySelector('[data-clear]').onclick=()=>{points=[];ctx.save(key,points);draw();setStatus('이 그래프의 점을 지웠습니다.');};draw();return {destroy};
 }
 if(['watch','balance','spring-film'].includes(kind)){
  const isWatch=kind!=='spring-film';const name=kind==='watch'?'watch-mainspring.mp4':kind==='balance'?'watch-balance.mp4':'spring-observation.mp4';
  const cap=isWatch?'How a Watch Works (1949) · Handy (Jam) Organization / Hamilton Watch Company · Prelinger Archives · Public Domain. 원음 제거·일부 발췌.':'Hookeslawexample · Walter Lewin / MIT Course 8.01 · CC BY 3.0. 원음 제거·29~43초 발췌. 본책의 10·20·30 g 표와는 다른 관찰 실험입니다.';
  const url=isWatch?'https://commons.wikimedia.org/wiki/File:HowaWatchWork1949.ogv':'https://commons.wikimedia.org/wiki/File:Hookeslawexample.ogv';
  host.innerHTML=`<div class="film-stage"><video muted playsinline controls preload="metadata" aria-label="${activityNames[kind]}"><source src="./media/${name.replace('.mp4','.webm')}" type="video/webm"><source src="./media/${name}" type="video/mp4"></video><div class="media-credit">${cap} <a href="${url}" target="_blank" rel="noopener">원본·이용 조건</a></div><button data-video-play>▶ 영상 시작</button></div>`;
  const video=host.querySelector('video'),btn=host.querySelector('[data-video-play]');
  video.muted=true;btn.onclick=()=>video.paused?video.play().catch(()=>setStatus('재생 버튼을 눌러 주세요.')):video.pause();video.onplay=()=>btn.textContent='Ⅱ 잠시 멈추기';video.onpause=()=>btn.textContent='▶ 다시 재생';
  video.onended=()=>{btn.textContent='↻ 다시 보기';const q=kind==='watch'?'방금 본 태엽은 감아 두었다가 풀리면서 움직였어요. 책의 코일 모양과 어떤 점이 같고 다른지 말해 볼까요?':kind==='balance'?'작은 용수철이 반복해서 모양을 바꾸었지요. 용수철이 원래 모양으로 돌아가려는 성질을 찾아보세요.':'추가 위아래로 움직이는 동안 지금 눈금을 읽어도 될까요? 안정된 뒤 읽어야 하는 이유를 설명해 보세요.';setStatus(q);say(q);};video.onerror=()=>setStatus('영상 파일을 불러오지 못했습니다. 본문과 도해로 활동을 계속할 수 있습니다.');
  if(ctx.auto)video.play().catch(()=>setStatus('브라우저가 재생을 멈췄습니다. 영상 시작을 눌러 주세요.'));
  cleanup=()=>{video.pause();video.removeAttribute('src');video.replaceChildren();video.load();};return {destroy};
 }
 if(kind==='types'){
  let done=new Set();host.innerHTML='<div class="concept-review"><h3>어떤 저울이 알맞을까요?</h3><div data-type-q></div><div data-type-f></div></div>';let i=0;const list=[['실험용 추','용수철저울'],['육류와 채소','앉은뱅이저울'],['사람의 몸','체중계']];const draw=()=>{host.querySelector('[data-type-q]').innerHTML=`<div class="review-question">${list[i][0]}를 재려고 합니다.</div>${['용수철저울','앉은뱅이저울','체중계'].map(x=>`<button data-choice="${x}">${x}</button>`).join('')}`;host.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(b.dataset.choice===list[i][1]){done.add(i);host.querySelector('[data-type-f]').textContent=`맞아요. ${list[i][0]}에는 ${list[i][1]}가 알맞습니다.`;if(i<2){i++;draw();}else setStatus('세 종류의 용도를 모두 확인했습니다. 사용 전에 0을 확인하는 공통점도 기억하세요.');}else host.querySelector('[data-type-f]').textContent='물체를 어디에 놓는 저울인지 다시 생각해 보세요.';});};draw();return {destroy};
 }
 if(kind==='history'||kind==='future'){
  const list=kind==='history'?[
   ['이름풀이','용의 수염에 빗대어','원래 모양으로 돌아오는 성질을 설명하기 위한 교재의 비유입니다. 실제 동물을 관찰한 증거와는 구분해 읽습니다.',toolIcon('watch')],
   ['비코일 용수철','코일이 아니어도','원문은 청동기 시대의 집게와 구부러진 판의 이야기를 소개합니다. 휘었다가 돌아가는 판스프링의 모양을 살펴보세요.',toolIcon('leaf')],
   ['작은 시계','태엽으로 이어지는 이야기','본책은 휴대용 시계의 개발과 코일 스프링을 연결합니다. 다음 기록영상에서 움직임을 직접 관찰할 수 있습니다.',toolIcon('watch')]
  ]:[['극소 코일','기기 안으로 더 작게','교재는 휴대전화·터치패드·전자기기 속 작은 코일의 수요를 이야기합니다. 아래 그림은 크기 변화를 설명하는 개념 모형입니다.',springArt()],['4D 프린팅','시간에 따라 형태가 바뀐다면','원문의 미래 전망입니다. 시간에 따른 변형과 자기 조립을 설명하는 개념 도해이며 실제 연구 촬영 영상이 아닙니다.',springArt({mode:'compress'})],['2D 재료','원자 한두 개의 두께','교재는 그래핀 등의 재료를 소개합니다. 수치와 연구 현황은 집필 당시의 설명임을 구분해서 읽습니다.',toolIcon('leaf')]];
  let i=0,timer=null,storyToken=0;
  const draw=()=>{const [tag,title,txt,figure]=list[i];host.innerHTML=`<div class="story-stage"><figure class="art">${figure}</figure><div class="story-copy"><span class="timeline-label">${tag}</span><h3>${title}</h3><p>${txt}</p><div class="story-steps">${list.map((x,j)=>`<button data-story="${j}" class="${i===j?'selected':''}" aria-label="이야기 ${j+1}">${j+1}</button>`).join('')}</div><button data-story-play>▶ 순서대로 보기</button></div></div>`;host.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>{storyToken++;clearTimeout(timer);i=+b.dataset.story;draw();say(list[i][2]);});host.querySelector('[data-story-play]').onclick=()=>{storyToken++;i=0;play(storyToken);};};
  async function play(token=storyToken){draw();const completed=await say(list[i][2]);if(disposed||token!==storyToken||!completed)return;timer=setTimeout(()=>{if(disposed||token!==storyToken)return;if(i<list.length-1){i++;play(token);}else setStatus('이야기를 모두 보았습니다. 책의 문단을 다시 읽고 연결되는 점을 설명해 보세요.');},500);}
  draw();if(ctx.auto)play();cleanup=()=>{storyToken++;clearTimeout(timer);};return {destroy};
 }
 if(kind==='tools'){
  let chosen=0;host.innerHTML='<div class="tool-activity"><div class="tool-main"></div><div class="tool-picker"></div></div>';const main=host.querySelector('.tool-main'),picker=host.querySelector('.tool-picker');
  picker.innerHTML=toolRows.map(([k,t],i)=>`<button data-tool="${i}">${t}</button>`).join('');
  const draw=()=>{const [key,title,text]=toolRows[chosen];main.classList.remove('running');main.innerHTML=`${toolIcon(key)}<h3>${title}</h3><p>${text}</p><small>본책 p19의 설명을 나타낸 개념 도해 · 실제 제품 구조와 다를 수 있음</small><button data-tool-motion>개념 모형 움직이기</button><div class="control-grid"><button data-role="compress">줄었다가 돌아온다</button><button data-role="extend">늘었다가 돌아온다</button></div>`;main.querySelector('svg').classList.add('art');main.querySelector('[data-tool-motion]').onclick=e=>{const on=main.classList.toggle('running');e.target.textContent=on?'움직임 멈추기':'개념 모형 움직이기';};main.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{setStatus(b.dataset.role===(chosen<3?'compress':'extend')?'본책에서 설명한 분류와 같습니다. 실제 도구의 어느 부분인지도 찾아보세요.':'본책 p19에서 이 도구가 어떻게 설명되어 있는지 다시 읽어 보세요.');});};picker.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{chosen=+b.dataset.tool;draw();say(toolRows[chosen][2]);});draw();return {destroy};
 }
 host.innerHTML='<div class="large-reading">교재에서 해당 내용을 확인할 수 있습니다.</div>';return {destroy};
}
