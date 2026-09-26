import {esc} from './graphics.js';
import {createZeroGate,methodErrorText} from './zero-gate.js';

import {inquiryObjects,inquiryScale,inquiryStateKey,initialOrder,validOrder,formatForce,objectFigure,objectPhoto} from './everyday-objects.js';
export {inquiryObjects,objectFigure} from './everyday-objects.js';

export {methodErrorText} from './zero-gate.js';
export function checkMethod(s){
 const reasons=[];
 if(Math.abs(s.zeroAtLoad)>.01||Math.abs(s.zero)>.01)reasons.push('reference');
 if(s.adjustedLoaded)reasons.push('loaded-adjustment');
 if(!s.settled)reasons.push('motion');
 if(s.viewMoving||Math.abs(s.expectedEye-s.reading)>inquiryScale.tolerance)reasons.push('view');
 if(!Number.isFinite(s.entered)||Math.abs(s.entered-s.reading)>inquiryScale.tolerance)reasons.push('reading');
 return {valid:reasons.length===0,reasons};
}
export async function mountInquiry(host,ctx){
 let disposed=false,lab=null,ghost=null;
 const key=inquiryStateKey;
 const old=ctx.load(key,null);
 const legacy=old?null:ctx.load('why-scale-everyday-five-v2',null);
 const validSaved=s=>s&&Array.isArray(s.attempts)&&validOrder(s.order)&&s.attempts.every(r=>inquiryObjects.some(o=>o.id===r.id));
 const state=validSaved(old)?old:validSaved(legacy)?{...legacy,phase:legacy.phase==='predict'?'predict':'ready',attempts:legacy.attempts.map(r=>({...r,valid:false,reasons:[...(r.reasons||[]),'legacy-method-unverified']})),zeroGate:null,legacyMethodUnverified:true}:{phase:'predict',order:initialOrder(),uncertain:false,reason:'',reflection:'',attempts:[],retry:false};
 const gate=createZeroGate(state.zeroGate);
 const pendingMethodReview=gate.state.events.at(-1)?.type==='attach-rejected';
 if(state.phase==='measure'||state.phase==='review')state.phase='ready';
 let selected=null,zeroAtLoad=0,adjustedLoaded=false;
 const save=()=>{state.zeroGate=gate.state;return ctx.save(key,state);};
 const feedback=text=>{if(disposed)return;ctx.status(text);const el=host.querySelector('[data-inquiry-feedback]');if(el)el.textContent=text;};
 const stopLab=()=>{lab?.destroy();lab=null;ctx.setLab(null);ghost?.remove();ghost=null;};
 const obj=id=>inquiryObjects.find(o=>o.id===id);
 function forecast(){return `다섯 물건: ${state.order.map(id=>obj(id).name).join(' → ')}${state.uncertain?' (잠정 순서)':''}`;}
 function prediction(){
  stopLab();state.phase='predict';
  host.innerHTML=`<div class="inquiry-stage everyday-inquiry"><div class="inq-col"><div class="eyebrow">추가 탐구 · 다섯 물건 전체 줄 세우기</div><h3>저울이 왜 필요할까요?</h3><p>모양은 달라도 무게가 비슷한 생활 물건 <b>5개</b>입니다. 모두 가벼울 것 같은 순서부터 놓아 보세요.</p><p class="everyday-count-note"><b>신발은 한 짝, 사과는 한 개, 귤은 두 개를 함께</b> 잽니다. 휴대폰 한 개와 필기구가 든 필통까지, 비교할 물건은 다섯 가지입니다.</p><div class="rank-direction"><span>가벼울 것 같아요</span><span>→ 무거울 것 같아요</span></div><div class="inquiry-order everyday-order" data-order></div></div><div class="inq-col inq-side"><label><input type="checkbox" data-unsure ${state.uncertain?'checked':''}> 차이가 작아서 순서를 확신하기 어려워요.</label><label class="inquiry-label">그렇게 예상한 까닭<textarea data-prediction-reason rows="2" maxlength="400" placeholder="다섯 물건의 크기, 모양, 재료와 수량을 살펴보고 적어 보세요.">${esc(state.reason)}</textarea></label><button class="selected" data-prediction-done>다섯 물건의 예상을 기록하고 직접 측정하기 →</button><p class="inquiry-note">생활 물건을 본뜬 가상 탐구입니다. 실제 물건은 크기·제품·내용물에 따라 무게가 달라집니다. 정해진 수치는 측정 후에만 확인합니다.</p></div></div>`;
  const orderHost=host.querySelector('[data-order]');
  function reorder(id,to){const from=state.order.indexOf(id);if(from<0||to<0||to>=state.order.length)return;state.order.splice(from,1);state.order.splice(to,0,id);save();drawOrder();}
  function drawOrder(){orderHost.innerHTML=state.order.map((id,i)=>`<div class="order-card" data-order-id="${id}"><span class="order-position">${i+1}</span><div class="order-handle" role="button" tabindex="0" aria-label="${obj(id).name} 끌어 옮기기">${objectPhoto(obj(id))}<b>${obj(id).name}</b></div><div><button data-earlier="${id}" ${i===0?'disabled':''} aria-label="${obj(id).name} 더 가벼운 쪽으로">←</button><button data-later="${id}" ${i===state.order.length-1?'disabled':''} aria-label="${obj(id).name} 더 무거운 쪽으로">→</button></div></div>`).join('');
   orderHost.querySelectorAll('[data-earlier]').forEach(b=>b.onclick=()=>reorder(b.dataset.earlier,state.order.indexOf(b.dataset.earlier)-1));orderHost.querySelectorAll('[data-later]').forEach(b=>b.onclick=()=>reorder(b.dataset.later,state.order.indexOf(b.dataset.later)+1));
   orderHost.querySelectorAll('.order-handle').forEach(h=>{let drag=null;h.onpointerdown=e=>{if(e.button!==0)return;drag={id:h.parentElement.dataset.orderId,pointer:e.pointerId,x:e.clientX,y:e.clientY};h.setPointerCapture(e.pointerId);e.preventDefault();};h.onpointermove=e=>{if(!drag||drag.pointer!==e.pointerId)return;if(!ghost&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=obj(drag.id).name;document.body.append(ghost);}if(ghost){ghost.style.left=e.clientX+10+'px';ghost.style.top=e.clientY+10+'px';}};h.onpointerup=e=>{if(!drag)return;const hit=[...orderHost.children].findIndex(c=>{const r=c.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;});const id=drag.id;drag=null;ghost?.remove();ghost=null;if(hit>=0)reorder(id,hit);};h.onpointercancel=()=>{drag=null;ghost?.remove();ghost=null;};h.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();reorder(h.parentElement.dataset.orderId,state.order.indexOf(h.parentElement.dataset.orderId)+(e.key==='ArrowLeft'?-1:1));}};});
  }drawOrder();
  host.querySelector('[data-unsure]').onchange=e=>{state.uncertain=e.target.checked;save();};host.querySelector('[data-prediction-reason]').oninput=e=>{state.reason=e.target.value;save();};
  host.querySelector('[data-prediction-done]').onclick=()=>{if(!validOrder(state.order)){feedback('다섯 물건을 하나씩 모두 줄 세워 주세요.');return;}if(!state.reason.trim()){feedback('예상한 까닭도 먼저 적어 주세요.');return;}state.phase='ready';save();measurement();};
 }
 function recordRows(){return state.attempts.map((r,i)=>`<tr><td>${i+1}</td><td>${obj(r.id).name}</td><td>${formatForce(r.value)} N</td><td>${r.valid?'기록됨':'재검토'}</td></tr>`).join('');}
 function validLatest(){const latest=new Map();state.attempts.forEach(r=>latest.set(r.id,r));return inquiryObjects.every(o=>latest.get(o.id)?.valid);}
 async function measurement(){
  stopLab();state.phase='measure';save();selected=null;adjustedLoaded=false;
  host.innerHTML=`<div class="lab-layout inquiry-lab"><div class="scene"></div><div class="lab-controls"><div class="eyebrow">추가 탐구 · 직접 측정</div><h3>예상을 확인해 볼까요?</h3><details><summary>나의 처음 예상</summary><p>${esc(forecast())}</p><p>${esc(state.reason)}</p></details><div class="weights">${inquiryObjects.map(o=>`<div class="weight-item inquiry-load" role="button" tabindex="0" data-object="${o.id}" aria-label="${o.name} 매달기">${objectPhoto(o)}<strong>${o.name}</strong></div>`).join('')}</div><button data-inquiry-remove>물체 빼기</button><div class="control-grid"><button data-inquiry-object disabled>물건 확대</button><button data-inquiry-whole>물건·교구 전체</button><button data-inquiry-view="high">위에서</button><button data-inquiry-view="front">눈금 확대</button><button data-inquiry-view="low">아래에서</button></div><label class="inquiry-label">조절나사<input type="range" data-inquiry-adjust min="-0.6" max="0.6" step="0.1" value="0" aria-label="조절나사 위치"></label><label>내가 읽은 값 <input type="number" data-inquiry-reading min="0" max="5" step="0.1" aria-label="읽은 눈금 N"> N</label><button class="selected" data-inquiry-record>측정 기록 제출</button><div class="feedback" data-inquiry-feedback>물체를 고리에 매달고, 내가 읽은 값을 기록해 보세요.</div><div class="method-review" data-method-review hidden><label>내가 다시 확인할 과정<textarea data-method-thought rows="2" maxlength="400" placeholder="원인이 무엇이라고 생각하나요?"></textarea></label><button data-inquiry-retry>내 생각을 기록하고 재실험</button></div><table class="inquiry-records"><thead><tr><th>회</th><th>물체</th><th>내 기록</th><th>상태</th></tr></thead><tbody data-inquiry-rows>${recordRows()}</tbody></table><button data-inquiry-summary ${validLatest()?'':'disabled'}>예상과 결과 비교 · 마지막 해설</button><p class="inquiry-note">추가 탐구용 0~5 N 저울 · 한 작은 눈금 0.1 N. 본책의 0~30 N 교구와는 다른 설정입니다.</p></div></div>`;
  const panel=host.querySelector('.lab-controls');
  panel.querySelector('.weights').insertAdjacentHTML('beforebegin','<button type="button" data-confirm-empty>빈 저울의 기준 확인</button><p class="inquiry-note">물체를 걸기 전에 빈 저울의 표시를 살펴보세요.</p>');
  const {mountLab}=await import('./lab3d.js');if(disposed)return;
  lab=mountLab(host.querySelector('.scene'),{mode:'inquiry',onAdjust:s=>{if(s.force>0)adjustedLoaded=true;},onChange:s=>{if(disposed)return;const adjust=panel.querySelector('[data-inquiry-adjust]');if(adjust)adjust.value=s.zero;},onPick:v=>{const input=panel.querySelector('[data-inquiry-reading]');if(input)input.value=v;}});ctx.setLab(lab);
  // Includes correctly set instruments. Feedback is never forced by a scenario or prediction.
  lab.setZero(0);
  if(pendingMethodReview){panel.querySelector('[data-method-review]').hidden=false;feedback(methodErrorText);}
  panel.querySelector('[data-confirm-empty]').onclick=()=>{const s=lab.state();const result=gate.confirm(s.zero,s.force>0);save();feedback(result.accepted?'빈 저울의 기준을 확인했습니다.':'물체가 없는 상태에서 표시를 다시 살펴보세요.');};
  function loadObject(id){const s=lab.state();const result=gate.attach(id,s.zero,s.force>0);save();if(!result.accepted){panel.querySelector('[data-method-review]').hidden=false;panel.querySelector('[data-inquiry-reading]').value='';feedback(result.message);ctx.say?.(methodErrorText,'method-error');return;}selected=id;zeroAtLoad=s.zero;adjustedLoaded=false;lab.setForce(obj(id).force,{object:obj(id).kind});lab.resetView();panel.querySelector('[data-inquiry-object]').disabled=false;panel.querySelector('[data-inquiry-reading]').value='';panel.querySelectorAll('[data-object]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.object===id));feedback(`${obj(id).name}를 매달았습니다. 보이는 눈금을 기록해 보세요.`);}
  panel.querySelectorAll('[data-object]').forEach(el=>{let drag=null;el.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();el.setPointerCapture(e.pointerId);drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false};};el.onpointermove=e=>{if(!drag||e.pointerId!==drag.pointer)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6){drag.moved=true;if(!ghost){ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=obj(el.dataset.object).name;document.body.append(ghost);}ghost.style.left=e.clientX+10+'px';ghost.style.top=e.clientY-10+'px';}};el.onpointerup=e=>{if(!drag||drag.pointer!==e.pointerId)return;const p=lab.hookScreen();if(!drag.moved||Math.hypot(p.x-e.clientX,p.y-e.clientY)<95)loadObject(el.dataset.object);else feedback('고리 가까이에 놓아 주세요. 버튼으로 매달 수도 있습니다.');drag=null;ghost?.remove();ghost=null;};el.onpointercancel=()=>{drag=null;ghost?.remove();ghost=null;};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();loadObject(el.dataset.object);}};});
  panel.querySelector('[data-inquiry-remove]').onclick=()=>{lab.setForce(0);gate.remove();save();panel.querySelector('[data-inquiry-object]').disabled=true;selected=null;adjustedLoaded=false;panel.querySelector('[data-inquiry-reading]').value='';panel.querySelectorAll('[data-object]').forEach(x=>x.setAttribute('aria-pressed','false'));feedback('물체를 뺐습니다.');};
  panel.querySelector('[data-inquiry-object]').onclick=()=>lab.focusObject();
  panel.querySelector('[data-inquiry-whole]').onclick=()=>lab.resetView();panel.querySelectorAll('[data-inquiry-view]').forEach(b=>b.onclick=()=>lab.setEye(b.dataset.inquiryView));
  panel.querySelector('[data-inquiry-adjust]').oninput=e=>{if(lab.state().force>0){gate.adjust(lab.state().zero,true);save();feedback('물체를 내려놓고 다시 살펴보세요.');e.target.value=lab.state().zero;return;}lab.setZero(+e.target.value);gate.adjust(+e.target.value);save();};
  panel.querySelector('[data-inquiry-record]').onclick=()=>{
   const input=panel.querySelector('[data-inquiry-reading]');if(!selected||input.value===''){feedback('물체를 매달고, 내가 읽은 값을 적어 주세요.');return;}if(!Number.isFinite(Number(input.value))||Number(input.value)<0||Number(input.value)>inquiryScale.max){feedback('0~5 N 안에서 눈금과 단위를 다시 읽어 주세요.');return;}if(!lab.state().settled){feedback('표시자가 멈춘 뒤 눈금을 읽어 주세요.');return;}
   const snapshot={...lab.state(),zeroAtLoad,adjustedLoaded,entered:Number(input.value)};const checked=checkMethod(snapshot);
   state.attempts.push({id:selected,value:snapshot.entered,valid:checked.valid,reasons:checked.reasons,snapshot,at:Date.now()});save();
   panel.querySelector('[data-inquiry-rows]').innerHTML=recordRows();panel.querySelector('[data-inquiry-summary]').disabled=!validLatest();
   if(checked.valid){feedback('측정값을 기록했어요. 다른 물건도 같은 방법으로 재 보세요.');panel.querySelector('[data-method-review]').hidden=true;}
   else{feedback(methodErrorText);panel.querySelector('[data-method-review]').hidden=false;}
  };
  panel.querySelector('[data-inquiry-retry]').onclick=()=>{const t=panel.querySelector('[data-method-thought]').value.trim();if(!t){feedback('다시 살펴볼 과정을 내 말로 적어 주세요.');return;}state.reflection=t;state.retry=true;gate.reflect(t);save();panel.querySelector('[data-method-review]').hidden=true;feedback('내 생각을 기록했어요. 필요한 과정을 고쳐 다시 측정해 보세요.');};
  panel.querySelector('[data-inquiry-summary]').onclick=summary;
 }
 function summary(){
  if(!validLatest())return;stopLab();state.phase='summary';save();
  const latest=new Map();state.attempts.forEach(r=>latest.set(r.id,r));
  const measured=[...inquiryObjects].sort((a,b)=>latest.get(a.id).value-latest.get(b.id).value);
  const failureReasons=new Set(state.attempts.flatMap(r=>r.reasons));
  const explanations={reference:'물체를 매달기 전의 기준이 맞지 않으면 같은 크기만큼 모든 측정값이 치우칠 수 있습니다. 빈 저울의 표시자 윗부분을 0에 맞춘 뒤 다시 잽니다.', 'loaded-adjustment':'물체를 매단 채 조절하면 기준까지 바뀝니다. 물체를 뺀 상태에서 조절한 뒤 다시 매답니다.',motion:'표시자가 움직이는 동안 기록한 값은 흔들립니다. 표시자가 멈춘 뒤 읽습니다.',view:'시선이 비스듬하거나 움직이는 동안 눈금을 읽었습니다. 표시자 윗부분과 눈높이를 맞춥니다.',reading:'표시자가 가리킨 눈금과 적은 수치를 대조합니다. 눈금의 간격과 단위도 확인합니다.'};
  host.innerHTML=`<div class="inquiry-stage inquiry-summary"><div class="eyebrow">마지막 정리 · 이제 원인 공개</div><h3>예상과 측정 결과를 비교해요.</h3><p><b>처음 예상</b> ${esc(forecast())}</p><div class="inquiry-pair everyday-results">${inquiryObjects.map(o=>`<div>${objectPhoto(o)}<b>${o.name} · ${formatForce(latest.get(o.id).value)} N</b></div>`).join('')}</div><h3>가벼운 순서 → 무거운 순서</h3><p class="inquiry-ranking">${measured.map(o=>`${o.name} ${formatForce(latest.get(o.id).value)} N`).join(' → ')}</p><p>예상이 달랐다는 것만으로 실험 방법이 잘못된 것은 아닙니다. 과정이 올바른 측정값으로 생각을 고치면 됩니다.</p><h3>실험 과정을 돌아봐요.</h3>${failureReasons.size?[...failureReasons].map(k=>`<p>${explanations[k]}</p>`).join(''):'<p>제출한 기록에서 점검 대상인 실험 방법 오류는 발견되지 않았습니다.</p>'}<p><b>기억할 점</b> 모든 물체의 측정값에 같은 오차가 더해지면 순서는 그대로일 수도 있어요. 줄 세운 순서만 맞았다고 측정값까지 정확한 것은 아닙니다.</p><label class="inquiry-label">그래서 저울은 왜 필요할까요?<textarea data-conclusion rows="3" maxlength="500">${esc(state.conclusion||'')}</textarea></label><button data-save-conclusion>나의 결론 저장</button><p class="inquiry-note">물체와 수치는 추가 가상 탐구의 설정이며 제품의 실측값이 아닙니다. 귤 두 개는 한 묶음으로 잽니다. 같은 투명 받침의 무게를 제외해 물건만 비교하는 가상 설정입니다. 실제 수업에서는 받침의 무게 조건도 같게 합니다.</p></div>`;
  host.querySelector('[data-save-conclusion]').onclick=()=>{state.conclusion=host.querySelector('[data-conclusion]').value;save();feedback('나의 결론을 이 기기에 저장했습니다.');};
 }
 if(state.phase==='summary'&&validLatest())summary();else if(state.phase==='ready')measurement();else prediction();
 return {destroy(){disposed=true;stopLab();}};
}
