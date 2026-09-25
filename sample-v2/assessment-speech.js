import {normalize} from './physics.js';

// 문항마다 작은 도구 줄: ① 말로 답하기(받아쓴 초안 → 학생이 고침 → 적용) ② 스스로 체크.
// 스스로 체크는 채점이 아니다 — 정답을 보여 주지 않고 점수에도 넣지 않는다. 정답·해설은 '채점하기' 뒤에만.
const choiceNumbers='①②③④⑤';
const SELF_KEY='self-check';
const mic='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';

function proposedChoice(q,draft){
 const value=normalize(draft);
 const number=String(draft).match(/^[\s]*(?:([1-5])\s*번?|([①②③④⑤]))[\s]*$/);
 if(number)return number[1]?Number(number[1])-1:choiceNumbers.indexOf(number[2]);
 return q.options.findIndex(option=>normalize(option)===value);
}

export function mountAssessmentSpeech(root,questions,valueFor,store={}){
 let recognition=null,serial=0;
 const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition;
 const questionById=new Map(questions.map(q=>[q.id,q]));
 const readSelf=()=>{const v=store.load?.(SELF_KEY,{});return v&&typeof v==='object'?v:{};};
 root.querySelectorAll('.question[data-q]').forEach(box=>{
  const q=questionById.get(box.dataset.q);
  if(!q||q.kind==='graph'||box.querySelector('.dt-tools'))return;
  const fields=[...box.querySelectorAll('[data-answer-field]')];
  if(!fields.length)return;
  const id=`dt-drawer-${q.id}-${serial++}`;
  const slots=q.kind==='parts'?['ㄱ','ㄴ','ㄷ','ㄹ']:q.kind==='pair'?['㉠','㉡']:[];
  const tools=document.createElement('div');
  tools.className='dt-tools';
  tools.innerHTML=`<button type="button" class="dt-tool dt-speak" aria-expanded="false" aria-controls="${id}">${mic}<span>말로 답하기</span></button><div class="dt-self" role="group" aria-label="${q.n}번 스스로 체크 · 점수와 별개"><span>스스로 체크</span><button type="button" data-self="sure" aria-pressed="false">○ 자신 있어요</button><button type="button" data-self="unsure" aria-pressed="false">△ 헷갈려요</button></div>`;
  const panel=document.createElement('section');
  panel.className='speech-answer dt-drawer';panel.id=id;panel.hidden=true;
  panel.setAttribute('aria-label',`${q.n}번 말로 답하기`);
  panel.innerHTML=`<div class="speech-answer-row"><button type="button" class="speech-start">${mic}<span>마이크로 말하기</span></button>${slots.length?`<label class="speech-slot-label">적용할 칸 <select class="speech-slot">${slots.map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select></label>`:''}</div><label class="speech-draft-label">받아쓴 초안을 읽고 고쳐요<textarea class="speech-draft" rows="2" placeholder="마이크로 말하거나 여기에 답을 써 보세요"></textarea></label><div class="speech-answer-row"><button type="button" class="speech-apply">고친 답을 문제에 넣기</button><p class="speech-message" role="status" aria-live="polite"></p></div>`;
  box.append(tools,panel);
  const toggle=tools.querySelector('.dt-speak');
  toggle.onclick=()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));box.classList.toggle('dt-open',open);if(open)panel.querySelector('.speech-draft').focus({preventScroll:true});};
  const selfButtons=[...tools.querySelectorAll('[data-self]')];
  const paint=()=>{const v=readSelf()[q.id];selfButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.self===v)));tools.dataset.selfState=v||'';};
  selfButtons.forEach(b=>b.onclick=()=>{const all=readSelf();if(all[q.id]===b.dataset.self)delete all[q.id];else all[q.id]=b.dataset.self;store.save?.(SELF_KEY,all);paint();});
  paint();
  const start=panel.querySelector('.speech-start');
  const draft=panel.querySelector('.speech-draft');
  const message=panel.querySelector('.speech-message');
  const startLabel=start.innerHTML;
  start.onclick=()=>{
   if(!Ctor){message.textContent='이 브라우저에서는 말하기 입력을 쓸 수 없어요. 칸에 직접 써 주세요.';draft.focus();return;}
   recognition?.abort();
   recognition=new Ctor();
   recognition.lang='ko-KR';recognition.interimResults=false;recognition.maxAlternatives=1;
   recognition.onresult=event=>{draft.value=event.results?.[0]?.[0]?.transcript||'';message.textContent='초안이 나왔어요. 읽고 고친 뒤 넣어 주세요.';draft.focus();};
   recognition.onerror=()=>{message.textContent='말을 받아쓰지 못했어요. 다시 말하거나 직접 써 주세요.';};
   recognition.onend=()=>{start.disabled=false;start.innerHTML=startLabel;start.classList.remove('listening');};
   try{start.disabled=true;start.classList.add('listening');start.innerHTML=`${mic}<span>듣고 있어요…</span>`;recognition.start();}catch{start.disabled=false;start.innerHTML=startLabel;start.classList.remove('listening');message.textContent='마이크를 시작하지 못했어요. 직접 써 주세요.';}
  };
  panel.querySelector('.speech-apply').onclick=()=>{
   const text=draft.value.trim();
   if(!text){message.textContent='초안을 쓰거나 말한 뒤 넣어 주세요.';draft.focus();return;}
   let field;
   if(q.kind==='choice'){
    const index=proposedChoice(q,text);
    field=fields.find(item=>item.value===String(index));
    if(!field){message.textContent='보기와 똑같은 말이나 보기 번호로 말해 주세요. 직접 골라도 돼요.';return;}
    field.checked=true;
   }else if(q.kind==='pair'){
    field=fields[Number(panel.querySelector('.speech-slot').value)];
    const option=[...field.options].find(o=>o.value&&normalize(o.value)===normalize(text));
    if(!option){message.textContent='‘조금’ 또는 ‘많이’로 말해 주세요. 직접 골라도 돼요.';return;}
    field.value=option.value;
   }else if(slots.length){field=fields[Number(panel.querySelector('.speech-slot').value)];field.value=text;}
   else{field=fields[0];field.value=text;}
   field.dispatchEvent(new Event('input',{bubbles:true}));
   message.textContent='문제에 넣었어요. 다 풀면 채점하기를 눌러요.';
  };
 });
 return ()=>{recognition?.abort();};
}
