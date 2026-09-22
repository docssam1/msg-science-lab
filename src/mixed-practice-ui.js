import {reviewTopics} from './ch01-remediation.js';
import {getMixedState,claimNextVariant,submitMixedVariant} from './variant-state.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function mountMixedPractice({host,teacher=false,onRevisit}) {
 host.querySelector('#concept-review')?.remove();host.querySelector('#mixed-practice')?.remove();
 const pool=reviewTopics.map(t=>({...t.practice,topicId:t.id,topicTitle:t.title}));
 const panel=document.createElement('section');panel.id='mixed-practice';panel.className='concept-review';panel.setAttribute('aria-labelledby','mixed-title');host.append(panel);
 let busy=false,token=0;
 const fail=error=>{panel.querySelector('.mixed-error').textContent=error.message||'기록을 확인할 수 없어 새 문제 선택을 멈췄어요.';};
 async function render(focus=true) {
  const version=++token;let state,error;
  try{state=await getMixedState(pool,teacher);}catch(e){error=e;}
  if(version!==token||!panel.isConnected)return;
  const question=state?.active?pool.find(q=>q.id===state.active.id):null,done=!!state?.active?.submitted;
  panel.innerHTML=`<div class="review-heading"><div><p class="review-origin">창작 유사문제 · 원본 6문항과 별도</p><h3 id="mixed-title" tabindex="-1">중복 없이 섞어 확인</h3></div><button type="button" data-mixed-close>연습 닫기</button></div>
   <p class="review-boundary">이 기기의 ${teacher?'강의용':'학생용'} 변형 이력에서 아직 나오지 않은 문제만 고릅니다. 같은 조건·선택지의 변형은 다시 뽑지 않고, 모두 소진하면 멈춥니다.</p>
   <p class="mixed-error" role="status"></p>
   ${state?`<p class="mixed-count">아직 열지 않은 유사문제 ${state.remaining}개${question?' · 마지막으로 연 문항 이어보기':''}</p>`:''}
   ${question?`<form class="mixed-form review-form"><fieldset ${done?'disabled':''}><legend><span>${esc(question.topicTitle)} · 창작 유사문제</span>${esc(question.prompt)}</legend><div class="review-options">${question.options.map((o,i)=>`<label><input type="radio" name="mixed-answer" value="${esc(o.id)}" ${state.active.answerId===o.id?'checked':''}><span>${['①','②','③','④','⑤'][i]||''} ${esc(o.label)}</span></label>`).join('')}</div></fieldset>${done?'':`<button type="submit" class="primary">${teacher?'교사가 풀이 공개':'답 제출하고 확인'}</button>`}</form>`:''}
   ${done?`<div class="review-feedback"><strong>${teacher?'교사용 풀이':state.active.correct?'이 문항에서 맞게 확인했어요':'설명을 보고 관련 실험을 다시 관찰해요'}</strong><p>${esc(question.explanation)}</p><button type="button" data-mixed-revisit>관련 실험 다시 보기</button></div>`:''}
   ${state?state.remaining===0?`<p class="mixed-exhausted">새 변형을 모두 열었어요. 이전 문제를 다시 뽑아 채우지 않습니다.${question&&!done?' 지금 열린 마지막 문항에 답해 주세요.':''}</p>`:(!question||done)?'<button type="button" class="primary" data-mixed-next>아직 풀지 않은 변형 열기</button>':'':''}
   <p class="review-coverage">직접 확인하기에서 이미 열었던 유사문제도 제외합니다. 문제를 다시 보는 것은 이어보기이며 새 추출이 아닙니다. 학생·강의 기록은 분리되며 다른 기기와 동기화하지 않습니다. 기록 오류 때는 중복 방지를 위해 선택을 중단합니다.</p>`;
  panel.querySelector('[data-mixed-close]').onclick=()=>{token++;panel.remove();host.querySelector('[data-mixed-open]')?.focus();};
  if(error)fail(error);
  const next=panel.querySelector('[data-mixed-next]');if(next)next.onclick=async()=>{if(busy)return;busy=true;next.disabled=true;try{await claimNextVariant(pool,teacher);await render(false);}catch(e){fail(e);}finally{busy=false;if(next.isConnected)next.disabled=false;}};
  const form=panel.querySelector('.mixed-form');if(form&&!done)form.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;const button=form.querySelector('button');button.disabled=true;try{await submitMixedVariant(question,new FormData(form).get('mixed-answer'),teacher);await render(false);}catch(e){fail(e);}finally{busy=false;if(button.isConnected)button.disabled=false;}};
  const revisit=panel.querySelector('[data-mixed-revisit]');if(revisit)revisit.onclick=()=>onRevisit(Number(question.revisit));
  if(focus){panel.querySelector('#mixed-title').focus({preventScroll:true});panel.scrollIntoView({block:'start'});}
 }
 await render();
}
