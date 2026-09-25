import {gradeQuestion,normalize} from './physics.js';

const lockedAnswers=new Set(['b9','b10','b11']);
const choiceNumbers='①②③④⑤';

function proposedChoice(q,draft){
 const value=normalize(draft);
 const number=String(draft).match(/^[\s]*(?:([1-5])\s*번?|([①②③④⑤]))[\s]*$/);
 if(number)return number[1]?Number(number[1])-1:choiceNumbers.indexOf(number[2]);
 return q.options.findIndex(option=>normalize(option)===value);
}

export function mountAssessmentSpeech(root,questions,valueFor){
 let recognition=null;
 const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition;
 const questionById=new Map(questions.map(q=>[q.id,q]));
 root.querySelectorAll('.question[data-q]').forEach(box=>{
  const q=questionById.get(box.dataset.q);
  if(!q||q.kind==='graph')return;
  const fields=[...box.querySelectorAll('[data-answer-field]')];
  if(!fields.length)return;
  const panel=document.createElement('section');
  panel.className='speech-answer';
  panel.setAttribute('aria-label',`${q.n}번 말하기와 셀프 체크`);
  const slots=q.kind==='parts'?['ㄱ','ㄴ','ㄷ','ㄹ']:q.kind==='pair'?['㉠','㉡']:[];
  panel.innerHTML=`<div class="speech-answer-title"><strong>말하고 · 고치고 · 확인하기</strong><span>일일 테스트 ${q.n}번</span></div><div class="speech-answer-row"><button type="button" class="speech-start">🎙 마이크로 말하기</button>${slots.length?`<label>적용할 칸 <select class="speech-slot">${slots.map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select></label>`:''}</div><label class="speech-draft-label">글자로 바뀐 초안을 읽고 고쳐요<textarea class="speech-draft" rows="2" placeholder="마이크로 말하거나 여기에 답을 써 보세요"></textarea></label><div class="speech-answer-row"><button type="button" class="speech-apply">수정한 답 적용</button><button type="button" class="speech-check">답 확인 · 셀프 체크</button></div><p class="speech-message" role="status" aria-live="polite"></p><div class="speech-result" hidden></div>`;
  box.append(panel);
  const mic=panel.querySelector('.speech-start');
  const draft=panel.querySelector('.speech-draft');
  const message=panel.querySelector('.speech-message');
  const result=panel.querySelector('.speech-result');
  mic.onclick=()=>{
   if(!Ctor){message.textContent='이 브라우저에서는 말하기 입력을 사용할 수 없어요. 아래 칸에 직접 써 주세요.';draft.focus();return;}
   recognition?.abort();
   recognition=new Ctor();
   recognition.lang='ko-KR';recognition.interimResults=false;recognition.maxAlternatives=1;
   recognition.onresult=event=>{draft.value=event.results?.[0]?.[0]?.transcript||'';message.textContent='초안이 나왔어요. 읽고 고친 뒤 ‘수정한 답 적용’을 눌러 주세요.';draft.focus();};
   recognition.onerror=()=>{message.textContent='말하기를 받아쓰지 못했어요. 다시 말하거나 직접 써 주세요.';};
   recognition.onend=()=>{mic.disabled=false;mic.textContent='🎙 마이크로 말하기';};
   try{mic.disabled=true;mic.textContent='듣고 있어요…';recognition.start();}catch{mic.disabled=false;mic.textContent='🎙 마이크로 말하기';message.textContent='마이크를 시작하지 못했어요. 직접 써 주세요.';}
  };
  panel.querySelector('.speech-apply').onclick=()=>{
   const text=draft.value.trim();
   if(!text){message.textContent='초안을 쓰거나 말한 뒤 확인해 주세요.';draft.focus();return;}
   let field;
   if(q.kind==='choice'){
    const index=proposedChoice(q,text);
    field=fields.find(item=>item.value===String(index));
    if(!field){message.textContent='보기와 정확히 같은 말 또는 보기 번호를 써 주세요. 직접 ○표를 골라도 됩니다.';return;}
    field.checked=true;
   }else if(slots.length){field=fields[Number(panel.querySelector('.speech-slot').value)];field.value=text;}
   else{field=fields[0];field.value=text;}
   field.dispatchEvent(new Event('input',{bubbles:true}));
   message.textContent='수정한 답을 적용했어요. 답 확인을 눌러 스스로 살펴보세요.';
   result.hidden=true;
  };
  panel.querySelector('.speech-check').onclick=()=>{
   const answer=valueFor(q);
   const blank=Array.isArray(answer)?answer.some(value=>!String(value).trim()):!String(answer).trim();
   if(blank){message.textContent='먼저 답안을 고르거나 써 주세요.';return;}
   result.hidden=false;
   if(lockedAnswers.has(q.id)){
    result.innerHTML='<strong>해설 확인 중</strong><p>이 문항은 정답·해설 검수가 끝나지 않았어요. 내 생각과 이유를 다시 살펴보고 선생님과 확인해 주세요.</p>';
   }else{
    const correct=gradeQuestion(q,answer);
    const expected=Array.isArray(q.answer)?q.answer.join(' · '):q.options?q.options[q.answer]:q.answer;
    result.innerHTML=`<strong>${correct?'맞았어요!':'한 번 더 살펴봐요.'}</strong><p>확인할 답: ${expected}</p><p>${q.why}</p>`;
   }
   const choices=document.createElement('div');choices.className='speech-self-choices';
   choices.innerHTML='<button type="button" data-self="understood">이해했어요 ○</button><button type="button" data-self="retry">다시 풀래요 ↺</button>';
   choices.querySelectorAll('button').forEach(button=>button.onclick=()=>{message.textContent=button.dataset.self==='understood'?'스스로 확인했어요. 다음 문제로 가도 좋아요.':'좋아요. 답을 고쳐 다시 확인해 보세요.';result.dataset.selfCheck=button.dataset.self;});
   result.append(choices);
  };
 });
 return ()=>{recognition?.abort();};
}
