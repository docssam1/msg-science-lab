import {reviewTopics, assessOriginal, gradeReviewStep, summarizeReview} from './ch01-remediation.js';
import {markVariantPresented} from './variant-state.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const recordKey = 'msg-ch01-concept-review-v1';
export function clearConceptReview(host) { host?.querySelector('#concept-review')?.remove(); }

// A review starts only after the original submission or an explicit teacher reveal.
// Answers are not restored from browser storage into the question screen.
export function mountConceptReview({host, values, teacher = false, activeId = 'd1', onRevisit}) {
  clearConceptReview(host);
  host.querySelector('#mixed-practice')?.remove();
  const originalValues = structuredClone(values);
  const available = teacher ? reviewTopics.filter(t => t.id === activeId) : reviewTopics;
  if (!available.length) return;
  let topicId = available.some(t => t.id === activeId) ? activeId : available[0].id;
  const states = new Map();
  const panel = document.createElement('section');
  panel.id = 'concept-review'; panel.className = 'concept-review'; panel.setAttribute('aria-labelledby','review-title');
  host.append(panel);
  const stateFor = id => { if (!states.has(id)) states.set(id,{step:'probe',probeAnswer:null,practiceAnswer:null,probeDone:false,practiceDone:false,recorded:false}); return states.get(id); };
  const evidenceHtml = value => (Array.isArray(value) ? value : [value]).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
  function saveResult(topic,state,result,original) {
    if (teacher || state.recorded) return '';
    try {
      let saved; try { saved=JSON.parse(localStorage.getItem(recordKey)||'[]'); } catch { saved=[]; }
      if (!Array.isArray(saved)) saved=[];
      saved.push({at:new Date().toISOString(),topic:topic.id,originalStatus:original.status,probeCorrect:gradeReviewStep(topic.probe,state.probeAnswer),practiceCorrect:gradeReviewStep(topic.practice,state.practiceAnswer),status:result.status});
      localStorage.setItem(recordKey,JSON.stringify(saved.slice(-60))); state.recorded=true;
      return '이번 연습 결과를 이 브라우저에 기록했어요. 원본 첫 시도 기록은 바꾸지 않았어요.';
    } catch { return '이 브라우저에서는 결과를 저장하지 못했어요. 현재 화면에서 결과를 확인할 수 있어요.'; }
  }
  let renderVersion=0;
  async function render(focus=true) {
    const version=++renderVersion;
    const topic=available.find(t=>t.id===topicId), state=stateFor(topicId), original=assessOriginal(topicId,originalValues);
    const practice=state.step==='practice', done=practice?state.practiceDone:state.probeDone;
    const question=practice?topic.practice:topic.probe, answer=practice?state.practiceAnswer:state.probeAnswer;
    try{await markVariantPresented(question,teacher);}catch(error){if(version===renderVersion&&panel.isConnected)panel.innerHTML=`<h3>추가 연습을 잠시 멈췄어요</h3><p>${esc(error.message)}</p><p>원본 풀이와 실험은 계속 사용할 수 있습니다.</p>`;return;}
    if(version!==renderVersion||!panel.isConnected)return;
    const correct=gradeReviewStep(question,answer), finished=state.probeDone&&state.practiceDone;
    const result=finished&&!teacher?summarizeReview(topicId,original,state.probeAnswer,state.practiceAnswer):null;
    const savedMessage=result?saveResult(topic,state,result,original):'';
    panel.innerHTML=`<div class="review-heading"><div><p class="review-origin">교재 개념을 바탕으로 새로 만든 연습 · 원본 평가와 별도</p><h3 id="review-title" tabindex="-1">개념 다시 확인</h3></div><button type="button" data-review-close>연습 닫기</button></div>
      <p class="review-boundary">${teacher?'수업 토의용입니다. 학생의 개별 오개념이나 학습 결과를 자동 판단하지 않습니다.':'한 번의 답만으로 오개념을 단정하지 않아요. 확인 질문과 유사문제로 다시 살펴봅니다.'}</p>
      ${teacher?'':`<nav class="review-topics" aria-label="다시 확인할 문항">${available.map(t=>`<button type="button" data-review-topic="${t.id}" aria-pressed="${t.id===topicId}">${esc(t.id.slice(1))}번 ${esc(t.title)}</button>`).join('')}</nav>`}
      <div class="review-analysis"><h4>${esc(topic.title)}</h4>${teacher?`<p>${esc(topic.teacherPrompt)}</p>`:`<p class="review-candidate">${esc(original.candidate||original.nextStep)}</p>${evidenceHtml(original.evidence)}<p>${esc(original.nextStep)}</p>`}</div>
      <ol class="review-path" aria-label="개념 확인 순서"><li ${!practice?'aria-current="step"':''}>확인 질문</li><li ${practice?'aria-current="step"':''}>유사문제</li><li>이번 결과</li></ol>
      <form class="review-form"><fieldset ${done?'disabled':''}><legend><span>${practice?'창작 유사문제':'창작 확인 질문'}</span>${esc(question.prompt)}</legend><div class="review-options">${question.options.map((o,i)=>`<label><input type="radio" name="review-answer" value="${esc(o.id)}" ${answer===o.id?'checked':''}><span>${['①','②','③','④','⑤'][i]||''} ${esc(o.label)}</span></label>`).join('')}</div></fieldset>
      <p class="review-error" role="status"></p>${done?'':`<button class="primary" type="submit">${teacher?'이 질문 풀이 공개':'답 제출하고 확인'}</button>`}</form>
      ${done?`<div class="review-feedback" role="status"><strong>${teacher?'교사용 풀이':correct?'이 질문에서는 맞게 확인했어요':'설명을 보고 다시 관찰해요'}</strong><p>${esc(question.explanation)}</p></div>`:''}
      ${state.probeDone&&!practice?'<button class="primary" type="button" data-review-next>유사문제 풀기</button>':''}
      ${finished?`<section class="review-result" aria-label="이번 연습 결과"><h4>${teacher?'토의 후 확인할 점':esc(result.title)}</h4>${teacher?`<p>${esc(topic.teacherPrompt)}</p>`:`${evidenceHtml(result.evidence)}<p>${esc(result.nextStep)}</p>`}<p class="review-limit">이번 두 문항 범위의 확인입니다. 장기 숙달이나 오개념 확정 진단이 아닙니다.</p><details><summary>내 말로 설명하고 함께 확인해요</summary><p>${esc(topic.teacherPrompt)}</p><ul>${(topic.rubric||[]).map(r=>`<li>${esc(r)}</li>`).join('')}</ul><p>말이나 글의 이유는 자동 채점하지 않습니다. 관찰한 사실과 설명이 맞는지 선생님과 확인해요.</p></details><div class="review-actions"><button type="button" data-review-revisit>관련 실험 다시 관찰</button></div>${savedMessage?`<p class="review-storage" role="status">${esc(savedMessage)}</p>`:''}</section>`:''}
      <p class="review-coverage">미평가 범위: 원본 6문항과 이 두 질문만으로 진동 중 읽기·단위 이해 전체를 판단하지 않습니다. 해당 내용은 실험 관찰과 별도 질문이 필요합니다.</p>`;
    panel.querySelector('[data-review-close]').onclick=()=>{panel.remove();host.querySelector(`[data-concept-review="${topicId}"]`)?.focus();};
    panel.querySelectorAll('[data-review-topic]').forEach(b=>b.onclick=()=>{topicId=b.dataset.reviewTopic;render();});
    panel.querySelector('.review-form').onsubmit=e=>{
      e.preventDefault(); const selected=new FormData(e.currentTarget).get('review-answer');
      if(!teacher&&gradeReviewStep(question,selected)===null){panel.querySelector('.review-error').textContent='답을 하나 고른 뒤 확인해 주세요.';return;}
      if(practice){state.practiceAnswer=selected;state.practiceDone=true;}else{state.probeAnswer=selected;state.probeDone=true;}
      render(false); panel.querySelector('.review-feedback')?.scrollIntoView({block:'nearest'});
    };
    const next=panel.querySelector('[data-review-next]');if(next)next.onclick=()=>{state.step='practice';render();};
    const revisit=panel.querySelector('[data-review-revisit]');if(revisit)revisit.onclick=()=>onRevisit(Number(topic.practice.revisit));
    if(focus){panel.querySelector('#review-title').focus({preventScroll:true});panel.scrollIntoView({block:'start'});}
  }
  render();
}
