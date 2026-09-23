import {OBJECTS,METHOD_ERROR,inspectAttempt,comparePredictions} from './inquiry-model.js';
import {esc} from './graphics.js';

export function objectGraphic(id){
 const o=OBJECTS.find(x=>x.id===id);
 const shape=o?.shape==='ball'?'<circle cx="80" cy="57" r="39" fill="#ddad64"/><path d="M44 41q41 33 71 39M80 18q-22 42 2 78" fill="none" stroke="#f6e5bf" stroke-width="4"/>':o?.shape==='weight'?'<path d="M63 28v-9q17-17 34 0v9" fill="none" stroke="#52616a" stroke-width="8"/><path d="M54 34h52l13 65H41z" fill="#526b78"/><path d="M57 41h16l-8 49H46z" fill="#9eafb6"/>':'<path d="M51 31h58l15 64q-43 20-87 0z" fill="#a6bab1"/><path d="M52 30l-6-16 32 6 34-6-5 17" fill="#d2dfd8"/><path d="M48 34h64M55 36l-8 18M104 36l12 19" stroke="#617c71" stroke-width="4" fill="none"/>';
 return `<svg viewBox="0 0 160 120" role="img" aria-label="${esc(o?.name||'물체')}"><ellipse cx="80" cy="106" rx="48" ry="5" fill="#dce4e1"/>${shape}</svg>`;
}

export async function mountInquiry(host,ctx){
 let disposed=false,lab=null,stage=0,activeId='',attempts=[],records={},unsub=[];
 const previous=ctx.load('inquiry-predictions',null);
 let predictions=previous||{pair:'',order:['pouch-c','pouch-d','pouch-e'],reason:''};
 let locked=false,orderTouched=false,phase1=false;
 // Each opened experiment is a fresh run. Never combine calibration states from earlier sessions.
 const msg=t=>{if(disposed)return;ctx.status(t);const b=host.querySelector('[data-feedback]');if(b)b.textContent=t;};
 const remember=()=>ctx.save('inquiry-predictions',predictions);
 const stopLab=()=>{lab?.destroy();lab=null;ctx.setLab(null);unsub.forEach(f=>f());unsub=[];};
 function shell(body){host.innerHTML=`<div class="method-inquiry"><div class="inquiry-progress" aria-label="탐구 순서"><span ${stage===0?'aria-current="step"':''}>1 두 물체 예상</span><span ${stage===1?'aria-current="step"':''}>2 세 물체 줄 세우기</span><span ${stage===2?'aria-current="step"':''}>3 저울로 확인</span><span ${stage===3?'aria-current="step"':''}>4 방법과 결과 설명</span></div>${body}</div>`;}
 function predictPair(){
  stage=0;stopLab();
  shell(`<section class="prediction-page"><p class="eyebrow">추가 탐구 · 저울이 왜 필요할까?</p><h3>어느 것이 더 무거울까요?</h3><p>무게가 뚜렷하게 다른 두 가상 물체입니다. 먼저 예상하고 이유를 말해 보세요.</p><div class="predict-objects pair">${OBJECTS.filter(o=>o.group==='pair').map(o=>`<button data-pair="${o.id}" aria-pressed="${predictions.pair===o.id}">${objectGraphic(o.id)}<strong>${o.name}</strong><span>더 무거울 것 같아요</span></button>`).join('')}</div><p class="feedback" data-feedback>예상은 틀려도 괜찮아요. 아직 정답을 공개하지 않습니다.</p><button data-next ${predictions.pair?'':'disabled'}>예상을 남기고 세 물체로 →</button><small>이 활동의 물체와 측정값은 가상 실험 설정이며 실제 공·추의 무게를 뜻하지 않습니다.</small></section>`);
  host.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>{predictions.pair=b.dataset.pair;remember();host.querySelectorAll('[data-pair]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));host.querySelector('[data-next]').disabled=false;msg('예상을 기록했어요. 저울로 확인하기 전에는 정답을 알려주지 않습니다.');});
  host.querySelector('[data-next]').onclick=()=>{phase1=true;predictThree();};
 }
 function predictThree(){
  stage=1;stopLab();
  shell(`<section class="prediction-page"><p class="eyebrow">비슷한 물체는 느낌만으로 구별할 수 있을까요?</p><h3>가벼울 것 같은 것부터 줄 세워요.</h3><p>겉모양이 같고 무게가 비슷한 세 주머니입니다. 카드를 끌어 자리를 바꾸거나 이동 버튼을 누르세요.</p><ol class="predict-objects triple" aria-label="가벼운 것부터 예상 순서">${predictions.order.map((id,i)=>`<li draggable="true" data-order="${id}"><b class="order-num">${i+1}</b>${objectGraphic(id)}<strong>${OBJECTS.find(o=>o.id===id).name}</strong><div><button data-move="${id}" data-dir="-1" ${i===0?'disabled':''} aria-label="${id} 앞쪽으로 이동">←</button><button data-move="${id}" data-dir="1" ${i===2?'disabled':''} aria-label="${id} 뒤쪽으로 이동">→</button></div></li>`).join('')}</ol><label class="reason">이렇게 예상한 이유<textarea data-reason rows="2" maxlength="400" placeholder="크기, 느낌, 앞의 비교 경험 등을 떠올려 보세요.">${esc(predictions.reason)}</textarea></label><p class="feedback" data-feedback>이 순서가 맞다고 생각하면 그대로 확정해도 됩니다.</p><button data-next>예상 순서를 확정하고 측정하기 →</button><button data-back>두 물체 예상으로</button></section>`);
  const swap=(a,b)=>{if(a===b)return;[predictions.order[a],predictions.order[b]]=[predictions.order[b],predictions.order[a]];remember();orderTouched=true;predictThree();};
  host.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const i=predictions.order.indexOf(b.dataset.move),j=i+Number(b.dataset.dir);if(j>=0&&j<3)swap(i,j);});
  let from='';host.querySelectorAll('[data-order]').forEach(li=>{
   li.ondragstart=e=>{from=li.dataset.order;e.dataTransfer.setData('text/plain',from);};li.ondragover=e=>e.preventDefault();li.ondrop=e=>{e.preventDefault();if(from)swap(predictions.order.indexOf(from),predictions.order.indexOf(li.dataset.order));};
   let touch=null;li.onpointerdown=e=>{if(e.target.closest('button')||e.pointerType==='mouse')return;touch={id:e.pointerId,x:e.clientX,y:e.clientY};li.setPointerCapture(e.pointerId);};
   li.onpointerup=e=>{if(!touch||touch.id!==e.pointerId)return;const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-order]');if(hit&&Math.hypot(e.clientX-touch.x,e.clientY-touch.y)>8)swap(predictions.order.indexOf(li.dataset.order),predictions.order.indexOf(hit.dataset.order));touch=null;};li.onpointercancel=()=>touch=null;
  });
  host.querySelector('[data-reason]').oninput=e=>{predictions.reason=e.target.value;remember();};
  host.querySelector('[data-next]').onclick=()=>{locked=true;remember();experiment();};host.querySelector('[data-back]').onclick=predictPair;
 }
 async function experiment(){
  stage=2;stopLab();
  shell(`<div class="lab-layout method-layout"><div class="scene"></div><section class="lab-controls method-panel"><p class="eyebrow">예상은 남겨 두고, 이제 측정</p><h3>다섯 물체를 직접 재 보세요.</h3><p>물체를 고리에 놓고 눈금을 읽어 기록하세요. 실험 방법도 직접 판단합니다.</p><div class="weights">${OBJECTS.map(o=>`<button class="weight-item" data-object="${o.id}">${objectGraphic(o.id)}<strong>${o.name}</strong></button>`).join('')}</div><button data-remove>물체 빼기</button><button data-whole>저울 전체 보기</button><div class="instrument-tools"><label>나사 조절<input type="range" data-adjust min="-6" max="6" step="1" value="2" aria-label="나사 조절"></label><div class="control-grid"><button data-eye="high">위에서 관찰</button><button data-eye="front">가운데 관찰</button><button data-eye="low">아래에서 관찰</button></div></div><label class="entry">내가 읽은 눈금 <input data-measured type="number" min="0" max="30" step="1" aria-label="읽은 눈금"> N</label><button data-record>측정 기록 제출</button><div class="feedback" role="status" data-feedback>실험을 해 보고, 결과와 방법을 함께 점검해요.</div><button data-hint hidden>과정 다시 생각하기</button><label class="reason" data-reflect hidden>내가 바꿀 실험 방법<textarea data-correction rows="2" maxlength="300" placeholder="문제라고 생각한 과정과 바꿀 방법을 써 보세요."></textarea></label><div data-records></div><button data-finish disabled>기록과 예상 비교하기 →</button><small>측정 범위 0~30 N · 한 눈금 1 N · 가상 물체</small></section></div>`);
  const scene=host.querySelector('.scene'),panel=host.querySelector('.method-panel');
  try{
   const {mountLab}=await import('./lab3d.js');if(disposed||stage!==2)return;
   lab=mountLab(scene,{mode:'inquiry',initialZero:2,onChange:s=>{const x=panel.querySelector('[data-adjust]');if(x)x.value=s.zero;},onPick:value=>{panel.querySelector('[data-measured]').value=value;}});ctx.setLab(lab);
   lab.setEye('front');
  }catch(e){msg('3D 교구를 열지 못했습니다. 다른 브라우저에서 다시 확인해 주세요.');return;}
  function renderRecords(){panel.querySelector('[data-records]').innerHTML=`<table class="method-records"><caption>남겨 둔 실험 기록</caption><thead><tr><th>물체</th><th>내 기록</th><th>점검</th></tr></thead><tbody>${attempts.map(a=>`<tr><td>${OBJECTS.find(o=>o.id===a.objectId)?.name||'물체 없음'}</td><td>${a.entry===''?'—':esc(a.entry)+' N'}</td><td>${a.valid?'확인':'재점검'}</td></tr>`).join('')}</tbody></table>`;panel.querySelector('[data-finish]').disabled=!OBJECTS.every(o=>records[o.id]?.valid);}
  function attach(id){activeId=id;const o=OBJECTS.find(o=>o.id===id);lab.setForce(o.force,{shape:o.shape});panel.querySelector('[data-measured]').value='';panel.querySelectorAll('[data-object]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.object===id)));msg(`${o.name}를 매달았어요. 읽은 눈금을 기록해 보세요.`);}
  panel.querySelectorAll('[data-object]').forEach(el=>{
   let drag=null,skipClick=false;
   const cancel=()=>{drag?.ghost?.remove();drag=null;};unsub.push(cancel);
   el.onpointerdown=e=>{if(e.button!==0&&e.pointerType==='mouse')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ghost:null};el.setPointerCapture(e.pointerId);};
   el.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;if(!drag.ghost&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.ghost=document.createElement('div');drag.ghost.className='drag-ghost';drag.ghost.textContent=el.textContent;document.body.append(drag.ghost);}if(drag.ghost){drag.ghost.style.left=e.clientX+8+'px';drag.ghost.style.top=e.clientY-15+'px';}};
   el.onpointerup=e=>{if(!drag||drag.id!==e.pointerId)return;if(drag.ghost){skipClick=true;const p=lab.hookScreen();if(Math.hypot(p.x-e.clientX,p.y-e.clientY)<95)attach(el.dataset.object);else msg('물체를 고리 가까이에 놓아 보세요.');setTimeout(()=>skipClick=false,0);}cancel();};el.onpointercancel=cancel;
   el.onclick=()=>{if(!skipClick)attach(el.dataset.object);};
  });
  panel.querySelector('[data-remove]').onclick=()=>{activeId='';lab.setForce(0);panel.querySelector('[data-measured]').value='';msg('물체를 뺐어요. 기구를 관찰하거나 다음 물체를 선택하세요.');};
  panel.querySelector('[data-whole]').onclick=()=>lab.resetView();
  panel.querySelector('[data-adjust]').oninput=e=>{if(!lab.setZero(Number(e.target.value))){e.target.value=lab.state().zero;msg('지금은 나사를 조절할 수 없어요. 기구 상태를 살펴보세요.');}};
  panel.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>lab.setEye(b.dataset.eye));
  panel.querySelector('[data-record]').onclick=()=>{
   const entry=panel.querySelector('[data-measured]').value,snapshot=lab.state();
   const verdict=inspectAttempt(activeId,snapshot,entry);
   const attempt={objectId:activeId,entry,value:Number(entry),snapshot,correction:panel.querySelector('[data-correction]').value,...verdict,time:Date.now()};attempts.push(attempt);
   if(verdict.valid)records[activeId]=attempt;else if(activeId)delete records[activeId];
   ctx.save('inquiry-attempts',attempts);ctx.save('inquiry-current-records',records);renderRecords();msg(verdict.message);
   panel.querySelector('[data-hint]').hidden=verdict.valid;panel.querySelector('[data-reflect]').hidden=verdict.valid;
   // Never speak cause codes (including reference/zero) to the student automatically.
   if(!verdict.valid&&verdict.category==='method')ctx.say(METHOD_ERROR);
  };
  panel.querySelector('[data-hint]').onclick=()=>msg('물체를 선택한 때부터 값을 적은 때까지, 내가 한 일을 순서대로 되짚어 보세요. 바꿀 방법을 정한 뒤 같은 물체를 다시 재 보세요.');
  panel.querySelector('[data-finish]').onclick=finish;renderRecords();
 }
 function finish(){
  const comparison=comparePredictions(predictions,records);if(!comparison)return;stage=3;stopLab();
  shell(`<section class="prediction-page"><p class="eyebrow">예상 → 측정 → 실험 방법 점검</p><h3>느낌과 측정 결과는 같았나요?</h3><table><tr><th>두 물체</th><th>더 무겁다고 예상한 것</th><th>측정으로 확인한 것</th></tr><tr><td>A · B</td><td>${esc(OBJECTS.find(o=>o.id===predictions.pair)?.name)}</td><td>${esc(OBJECTS.find(o=>o.id===comparison.pair).name)}</td></tr></table><p><b>세 주머니 예상</b> ${predictions.order.map(id=>OBJECTS.find(o=>o.id===id).name).join(' → ')}</p><p><b>측정 후 가벼운 순서</b> ${comparison.order.map(id=>OBJECTS.find(o=>o.id===id).name+' ('+records[id].value+' N)').join(' → ')}</p><label class="reason">저울이 필요한 까닭과 내가 고친 실험 방법<textarea rows="3" data-conclusion placeholder="느낌만으로 비교할 때와 저울로 비교할 때의 차이를 써 보세요."></textarea></label><div class="feedback">예상이 달랐다는 것과 실험 방법이 잘못되었다는 것은 다릅니다. 예상이 달라도 방법을 점검해 얻은 결과로 생각을 바꿀 수 있어요.</div><button data-back-book>교재로 돌아가 구조와 사용법 읽기</button></section>`);
  host.querySelector('[data-conclusion]').oninput=e=>ctx.save('inquiry-conclusion',e.target.value);
  host.querySelector('[data-back-book]').onclick=()=>ctx.navigateTo?.('l1-structure');
 }
 predictPair();return {destroy(){disposed=true;stopLab();}};
}
