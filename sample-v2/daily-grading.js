// Daily Test 채점·첨삭 — 네트워크·AI 없이 이 기기에서만. 원본 문항·정답(content.js)은 읽기만 한다.
// 채점 규칙
//  · 확인된 정답과 같으면 ○, 원문에 나오는 **다른** 낱말·기호를 썼으면 ×.
//  · 글자로 쓴 답이 그 어느 쪽도 아니면(띄어쓰기·괄호·점만 다른 것은 같은 답으로 본다) 추측하지 않고 '검토 필요'.
//  · 공식 정답 미확인 문항(2차시 9–11번)은 답을 비교하지 않고 언제나 '검토 필요' — 점수·분모에서 뺀다.
//  · 스스로 체크(자신 있어요/헷갈려요)는 채점과 별개이며 점수에 넣지 않는다.
//  · 틀린 문항은 remedy-bank.js의 오개념으로 잇는다(첫 시도만 진단). 같은 오개념이 서로 다른 두 문항 → 확정 → 처방 문제.
import {normalize,gradePoints} from './physics.js';
import {esc} from './graphics.js';
import {ANSWER_KEY,UNCONFIRMED,misconceptions,misconceptionOf,bank,diagnose,prescribe,bankRecord} from './remedy-bank.js';

// 정답표 버전(remedy-bank.js의 ANSWER_KEY). 기록에 함께 남겨 두었다가 정답표가 고쳐지면 다시 채점할 수 있다.
export const ANSWER_KEY_VERSION=ANSWER_KEY;
export const LOCKED=UNCONFIRMED;
// '확실히 다른 답'으로 볼 수 있는 원문 어휘: P1 부분 이름 여섯 개, 4번 그림의 기호 세 개.
const PART_NAMES=['손잡이','영점조절나사','용수철','표시자','눈금','고리'];
const TEXT_VOCAB={a1:PART_NAMES,a3:PART_NAMES,a4:['ㄱ','ㄴ','ㄷ']};
const blank=v=>!String(v??'').trim();

function gradeText(expected,value,vocab){
 if(blank(value))return 'blank';
 const v=normalize(value);
 if(v===normalize(expected))return 'correct';
 if(vocab?.some(word=>normalize(word)===v))return 'wrong';
 return 'review';
}

// status: correct | wrong | review(검토 필요) | pending(아직 못 냄) | blank
export function gradeItem(q,value){
 if(LOCKED.has(q.id))return {status:'review',reason:'locked'};
 if(q.kind==='graph'){
  if(!Array.isArray(value)||!value.length)return {status:'pending',reason:'graph'};
  return {status:gradePoints(value,q.answer)?'correct':'wrong'};
 }
 if(q.kind==='parts'){
  const slots=q.answer.map((answer,i)=>gradeText(answer,value?.[i],TEXT_VOCAB[q.id]));
  if(slots.includes('blank'))return {status:'blank',slots};
  const status=slots.includes('wrong')?'wrong':slots.every(s=>s==='correct')?'correct':'review';
  return {status,slots,reason:status==='review'?'text':undefined};
 }
 if(q.kind==='text'){
  const status=gradeText(q.answer,value,TEXT_VOCAB[q.id]);
  return {status,reason:status==='review'?'text':undefined};
 }
 if(q.kind==='pair'){
  const slots=q.answer.map((answer,i)=>blank(value?.[i])?'blank':String(value[i])===answer?'correct':'wrong');
  if(slots.includes('blank'))return {status:'blank',slots};
  return {status:slots.every(s=>s==='correct')?'correct':'wrong',slots};
 }
 if(blank(value))return {status:'blank'};
 return {status:String(value)===String(q.answer)?'correct':'wrong'};
}

export function summarize(items){
 const count=s=>items.filter(item=>item.status===s).length;
 const correct=count('correct'),wrong=count('wrong');
 return {correct,wrong,confirmed:correct+wrong,review:count('review'),pending:count('pending')+count('unsubmitted')};
}

const circled='①②③④⑤';
const slotNames={parts:['ㄱ','ㄴ','ㄷ','ㄹ'],pair:['㉠','㉡']};
function optionText(q,index){
 const text=q.options?.[Number(index)];
 if(text===undefined)return '';
 if(q.graphic||/^[①-⑤]$/.test(text))return text;
 const inline=q.passage?.includes(`(${q.options.join(', ')})`);
 return inline?text:`${circled[Number(index)]} ${text}`;
}
export function formatAnswer(q,value){
 if(q.kind==='graph')return Array.isArray(value)&&value.length?value.slice().sort((a,b)=>a[0]-b[0]).map(([x,y])=>`(${x} g, ${y} cm)`).join(' · '):'점을 찍지 않았어요';
 if(slotNames[q.kind])return (value||[]).map((v,i)=>`${slotNames[q.kind][i]} ${String(v||'').trim()||'—'}`).join(' · ');
 if(q.kind==='choice')return blank(value)?'—':optionText(q,value);
 return blank(value)?'—':String(value).trim();
}
export function formatKey(q){
 if(q.kind==='graph')return q.answer.map(([x,y])=>`(${x} g, ${y} cm)`).join(' · ');
 if(slotNames[q.kind])return q.answer.map((v,i)=>`${slotNames[q.kind][i]} ${v}`).join(' · ');
 if(q.kind==='choice')return optionText(q,q.answer);
 return q.answer;
}

// 오개념이 없을 때만 쓰는 예비 첨삭(개념 단위 질문). 정답을 먼저 말하지 않는다.
export const conceptCoach={
 parts:{name:'부품의 이름과 하는 일',ask:'부품의 이름과 하는 일을 서로 바꿔 생각했을까요? 그 부분이 저울에서 무슨 일을 하는지 먼저 떠올려 볼까요?',lab:'parts'},
 zero:{name:'영점 확인 순서',ask:'측정하는 순서를 거꾸로 떠올렸을까요? 물체를 매달기 전에 빈 저울에서 무엇을 보았는지 생각해 볼까요?',lab:'zero'},
 eye:{name:'눈높이와 시차',ask:'보는 높이에 따라 눈금이 다르게 보인다는 점을 놓쳤을까요?',lab:'eye'},
 extend:{name:'무게와 늘어나는 정도',ask:'무게가 달라질 때 용수철이 어떻게 변하는지 다시 떠올려 볼까요?',lab:'measure'},
 graph:{name:'표와 그래프 읽기',ask:'가로축과 세로축이 각각 무엇을 나타내는지 확인했나요?',lab:'graph'},
 elastic:{name:'탄성의 뜻',ask:'힘을 없앤 뒤 원래 모양으로 돌아오는 경우와 바뀐 모양이 남는 경우를 나눠 볼까요?',lab:'elastic'},
 material:{name:'비교하는 조건',ask:'한 번에 한 조건만 바꿨는지 살펴볼까요?',lab:'factors'},
 force:{name:'정지 상태의 힘',ask:'늘어난 채 멈춰 있는 상태와 흔들리는 상태를 구별했나요?',lab:'target'}
};
// 오개념의 짧은 이름(화면 표시용)
export const misconceptionName={parts:'부품 이름과 하는 일',zero:'매달기 전 영점 확인',eye:'눈금 읽는 눈높이',stable:'멈춘 뒤 읽기',extend:'무게와 늘어나는 정도',origin:'늘어난 길이와 전체 길이',elastic:'탄성의 뜻',graph:'무게와 길이의 비례',data:'문제에 주어진 표 쓰기'};
export const nameOf=code=>misconceptionName[misconceptions[code]?.concept]||code;
export function itemLabel(id){const m=/^([ab])(\d+)$/.exec(id);if(m)return `${m[1]==='a'?1:2}차시 ${m[2]}번`;const s=/^s(\d+)$/.exec(id);return s?`처방 ${s[1]}`:id;}
export function relatedLab(q){return q.id==='b12'?'assessment-graph':conceptCoach[q.concept]?.lab||'parts';}
export function misconceptionFor(q,value){if(LOCKED.has(q.id))return null;return misconceptionOf(q.id,q.kind==='graph'&&Array.isArray(value)?value.slice().sort((a,b)=>a[0]-b[0]):value);}

const face=name=>`./art/expressions/${name}.png`;
const stamp={correct:'<span class="dt-stamp ok" aria-label="맞음">○</span>',wrong:'<span class="dt-stamp no" aria-label="틀림">✕</span>',review:'<span class="dt-badge review">검토 필요</span>',pending:'<span class="dt-badge pending">채점 전</span>',unsubmitted:'<span class="dt-badge pending">채점 전</span>'};
const selfLabel={sure:'○ 자신 있었어요',unsure:'△ 헷갈렸어요'};
const statusChip={suspected:'<span class="dx-chip suspected">의심</span>',confirmed:'<span class="dx-chip confirmed">확정</span>',resolved:'<span class="dx-chip resolved">해소</span>'};

function ring(correct,confirmed){
 const r=40,c=2*Math.PI*r,share=confirmed?correct/confirmed:0;
 return `<svg class="dt-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" class="dt-ring-bg"/><circle cx="50" cy="50" r="${r}" class="dt-ring-fg" stroke-dasharray="${(c*share).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/></svg>`;
}
function labButton(page,pageLab,fallbackKind,labNames){
 const lab=page!=null?pageLab?.(page):null;
 if(lab)return `<button type="button" class="dt-link" data-dt-goto="${page}">관련 실험 다시 하기 · ${esc(lab.name)}</button>`;
 return `<button type="button" class="dt-link" data-dt-lab="${fallbackKind}">관련 실험 다시 하기 · ${esc(labNames[fallbackKind]||'')}</button>`;
}

function itemCard(item,{character,self,labNames,pageLab}){
 const {q,status,value}=item;
 const prompt=esc(q.passage||q.q);
 const mine=`<div class="dt-row"><span>내 답</span><b>${esc(formatAnswer(q,value))}</b></div>`;
 const selfTag=self?`<span class="dt-self-tag" title="스스로 체크 · 점수와 별개">${selfLabel[self]||''}</span>`:'';
 let body='';
 if(status==='correct')body=`${mine}<div class="dt-row key"><span>정답</span><b>${esc(formatKey(q))}</b></div><p class="dt-why">${esc(q.why)}</p>`;
 else if(status==='wrong'){
  const code=misconceptionFor(q,value),m=code&&misconceptions[code],fallback=conceptCoach[q.concept]||conceptCoach.parts;
  body=`${mine}<div class="dt-coach">${character?`<img src="${face('think')}" alt="생각하는 우루사쌤">`:''}<div class="dt-coach-say"><span>우루사쌤 첨삭${m?` · ${esc(nameOf(code))}`:''}</span><p>${esc(m?m.label:fallback.ask)}</p></div></div><details class="dt-reveal"><summary>생각해 봤어요 · 해설 보기</summary><div class="dt-row key"><span>정답</span><b>${esc(formatKey(q))}</b></div><p class="dt-why">${esc(q.why)}</p>${m?`<p class="dt-fix"><span>바로잡기</span>${m.fix}</p>`:''}</details><div class="dt-actions">${labButton(m?.page,pageLab,relatedLab(q),labNames)}</div>`;
 }
 else if(status==='review'&&item.reason==='locked')body=`${mine}<p class="dt-note">공식 정답·해설을 확인하고 있는 문항이에요. 자동으로 채점하지 않고 점수·진단에서 뺐어요. 내 생각과 까닭을 선생님과 함께 확인해요.</p>`;
 else if(status==='review')body=`${mine}<div class="dt-row key"><span>정답</span><b>${esc(formatKey(q))}</b></div><p class="dt-note">쓴 답을 자동으로 판단하지 않았어요. 정답과 비교해 보고 선생님께 확인받아요. 점수에서는 뺐어요.</p>`;
 else if(status==='pending'&&q.kind==='graph')body=`<p class="dt-note">그래프에 점을 찍어 제출하면 채점돼요.</p><div class="dt-actions"><button type="button" class="dt-link" data-dt-lab="assessment-graph">그래프에 점 찍기</button></div>`;
 else body=`<p class="dt-note">이 문항이 있는 쪽에서 채점하기를 누르면 여기에 결과가 나와요.</p><div class="dt-actions"><button type="button" class="dt-link soft" data-dt-page="${q.id}">문제로 가기</button></div>`;
 return `<article class="dt-card ${status}" data-dt-item="${q.id}"><header><span class="dt-num">${String(q.n).padStart(2,'0')}</span><p>${prompt}</p>${stamp[status]||''}</header>${selfTag}${body}</article>`;
}

const order={confirmed:0,suspected:1,resolved:2};
export function dxRows(dx){return Object.values(dx).filter(d=>d.status!=='none').sort((a,b)=>order[a.status]-order[b.status]||a.code.localeCompare(b.code));}
function dxRow(d){
 const evidence=[...d.items].map(id=>id.startsWith('s')?`${itemLabel(id)} ✕`:itemLabel(id)).concat([...d.bankOk].map(id=>`${itemLabel(id)} ○`));
 return `<li class="dx-row ${d.status}">${statusChip[d.status]}<div><b>${esc(nameOf(d.code))}</b><small>${evidence.map(esc).join(' · ')}</small></div></li>`;
}

export function reportHTML({lesson,items,selfChecks={},character=true,labNames={},gradedAt=Date.now(),dx=null,pageLab=null,remedy=true}){
 const s=summarize(items);
 const rows=dx?dxRows(dx):[];
 const due=dx?prescribe(dx):[];
 const confirmed=rows.filter(d=>d.status==='confirmed'),suspected=rows.filter(d=>d.status==='suspected');
 const sureWrong=items.filter(item=>item.status==='wrong'&&selfChecks[item.q.id]==='sure').length;
 const unsureRight=items.filter(item=>item.status==='correct'&&selfChecks[item.q.id]==='unsure').length;
 const perfect=s.confirmed>0&&s.wrong===0;
 const mood=perfect?'praise':s.wrong?'encourage':'listen';
 const headline=!s.confirmed?'채점할 수 있는 문항이 아직 없어요.':perfect?'확인된 문제를 모두 맞혔어요!':s.correct>=s.wrong?'잘 해냈어요. 틀린 문제만 다시 살펴봐요.':'괜찮아요. 하나씩 다시 생각해 봐요.';
 const time=new Date(gradedAt).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const next=suspected[0]&&misconceptions[suspected[0].code];
 const recommend=remedy&&due.length?`<div class="dt-recommend hot"><span>처방 문제</span><b>${confirmed.map(d=>esc(nameOf(d.code))).join(' · ')}</b><small>두 문제 이상에서 같은 헷갈림이 보였어요.</small><button type="button" class="dt-primary warm" data-dt-remedy>처방 문제 풀기 · ${due.length}문제</button></div>`
  :next&&pageLab?.(next.page)?`<div class="dt-recommend"><span>추천 다시 하기</span><b>${esc(pageLab(next.page).name)}</b><button type="button" class="dt-primary" data-dt-goto="${next.page}">실험 다시 하기</button></div>`:'';
 return `<div class="dt-report">
<section class="dt-hero">
 <div class="dt-score">${ring(s.correct,s.confirmed)}<div><b>${s.correct}</b><span>/ ${s.confirmed}</span></div></div>
 <div class="dt-hero-copy"><span class="dt-eyebrow">${lesson}차시 Daily Test · 채점 결과</span><h3>${headline}</h3>
  <div class="dt-meta"><span class="dt-pill ok">○ ${s.correct}</span><span class="dt-pill no">✕ ${s.wrong}</span>${s.review?`<span class="dt-pill review">${s.review}문항 검토 중 · 점수 제외</span>`:''}${s.pending?`<span class="dt-pill pending">채점 전 ${s.pending}</span>`:''}</div>
  <small>확인된 정답 ${s.confirmed}문항 기준 · 정답표 ${ANSWER_KEY_VERSION} · ${esc(time)} 채점</small></div>
 ${character?`<figure class="dt-hero-face"><img src="${face(mood)}" alt="우루사쌤"></figure>`:''}
</section>
<section class="dt-diagnosis"><div><span class="dt-eyebrow">오개념 진단 · 첫 시도 기준</span><h4>${confirmed.length?'확정된 오개념이 있어요':suspected.length?'살펴볼 헷갈림이 있어요':rows.length?'헷갈림을 모두 해소했어요':'헷갈린 개념이 보이지 않아요'}</h4>${rows.length?`<ul class="dx-list">${rows.map(dxRow).join('')}</ul>`:''}<p class="dt-meta-note">한 문항 = 의심 · 서로 다른 두 문항 = 확정 · 처방 문제 두 개를 처음에 맞히면 해소${sureWrong||unsureRight?` — 스스로 체크와 비교: ${[sureWrong&&`자신 있었는데 틀린 문항 ${sureWrong}개`,unsureRight&&`헷갈렸지만 맞힌 문항 ${unsureRight}개`].filter(Boolean).join(' · ')}`:''}</p></div>${recommend}</section>
<section class="dt-items">${items.map(item=>itemCard(item,{character,self:selfChecks[item.q.id],labNames,pageLab})).join('')}</section>
<footer class="dt-foot"><p>스스로 체크(○ 자신 있어요 · △ 헷갈려요)는 채점·진단과 따로 두고 점수에 넣지 않아요. 진단은 문항마다 처음 채점한 답으로만 해요.</p><button type="button" class="dt-primary ghost" data-dt-back>문제로 돌아가 다시 풀기</button></footer>
</div>`;
}

// 처방 문제: 첫 오답 → 되묻기(답 공개 없음) → 다시 풀기. 풀이 보기는 한 번 풀어 본 뒤에만. 첫 시도만 진단에 기록.
export function mountRemedy(host,{getLog,record,coach,character=true,pageLab,onGoto,onBack}){
 let dx=diagnose(getLog());
 const due=prescribe(dx);
 const codes=[...new Set(due.map(b=>b.m))];
 const state=new Map(due.map(b=>[b.id,{tries:0,done:false,shown:false}]));
 const attempted=id=>getLog().some(r=>r.src==='bank'&&r.item===id);
 if(!due.length){host.innerHTML=`<div class="dt-report rx"><section class="dt-hero slim"><div class="dt-hero-copy"><span class="dt-eyebrow">처방 문제</span><h3>지금 풀 처방 문제가 없어요.</h3><small>두 문항 이상에서 같은 헷갈림이 보이면 여기에 비슷한 문제가 나와요.</small></div></section><footer class="dt-foot"><p></p><button type="button" class="dt-primary ghost" data-rx-back>채점 결과로 돌아가기</button></footer></div>`;host.querySelector('[data-rx-back]').onclick=onBack;return {destroy(){}};}
 const card=b=>`<article class="dt-card rx-card" data-rx="${b.id}"><header><span class="dt-num">${b.id.slice(1)}</span><p>${esc(b.q)}</p><span class="rx-mark"></span></header><div class="rx-options">${b.options.map((o,i)=>`<button type="button" class="rx-opt" data-rx-opt="${i}"><i>${circled[i]}</i><span>${esc(o)}</span></button>`).join('')}</div><div class="rx-feedback" aria-live="polite"></div><div class="dt-actions"><button type="button" class="dt-link soft" data-rx-solution hidden>풀이 보기</button></div></article>`;
 host.innerHTML=`<div class="dt-report rx"><section class="dt-hero slim"><div class="dt-hero-copy"><span class="dt-eyebrow">처방 문제 · 비슷한 문제로 다시 확인</span><h3>헷갈린 개념을 한 번 더 풀어 봐요</h3><small>처음 고른 답으로 진단해요. 한 개념에서 처방 문제 두 개를 처음에 바로 맞히면 해소돼요.</small></div>${character?`<figure class="dt-hero-face"><img src="${face('explain')}" alt="설명하는 우루사쌤"></figure>`:''}</section>
${codes.map(code=>`<section class="rx-group" data-rx-group="${code}"><header class="rx-head">${statusChip[dx[code].status]}<div><b>${esc(nameOf(code))}</b><p>${esc(misconceptions[code].label)}</p></div>${pageLab?.(misconceptions[code].page)?`<button type="button" class="dt-link" data-dt-goto="${misconceptions[code].page}">관련 실험 · ${esc(pageLab(misconceptions[code].page).name)}</button>`:''}</header><div class="dt-items">${due.filter(b=>b.m===code).map(card).join('')}</div></section>`).join('')}
<footer class="dt-foot"><p>풀이 보기는 한 번 풀어 본 뒤에 열려요. 다시 푼 답은 진단에 넣지 않아요.</p><button type="button" class="dt-primary ghost" data-rx-back>채점 결과로 돌아가기</button></footer></div>`;
 const refreshGroup=code=>{const head=host.querySelector(`[data-rx-group="${code}"] .rx-head .dx-chip`);if(head)head.outerHTML=statusChip[dx[code].status];};
 host.querySelectorAll('[data-rx]').forEach(el=>{
  const b=bank.find(x=>x.id===el.dataset.rx),st=state.get(b.id),fb=el.querySelector('.rx-feedback'),sol=el.querySelector('[data-rx-solution]');
  const reveal=()=>{st.done=true;el.classList.add('revealed');el.querySelectorAll('.rx-opt').forEach((o,i)=>{o.disabled=true;if(i===b.answer)o.classList.add('answer');});fb.innerHTML=`<p class="dt-why">${esc(b.why)}</p><p class="dt-fix"><span>바로잡기</span>${misconceptions[b.m].fix}</p>`;sol.hidden=true;};
  el.querySelectorAll('.rx-opt').forEach(opt=>opt.onclick=()=>{
   if(st.done)return;const i=Number(opt.dataset.rxOpt),ok=i===b.answer,first=!attempted(b.id)&&st.tries===0;st.tries++;
   let special=false;
   if(first){const before=dx[b.m].status;record(bankRecord(b.id,i));dx=diagnose(getLog());refreshGroup(b.m);special=true;
    if(before!=='resolved'&&dx[b.m].status==='resolved')coach(`‘${nameOf(b.m)}’ 헷갈림을 해소했어요! 처방 문제를 처음에 바로 맞혔어요.`,'good');
    else if(dx[b.m].status==='confirmed'&&due.filter(x=>x.m===b.m).every(x=>attempted(x.id))&&dx[b.m].bankOk.size<2)coach(`‘${nameOf(b.m)}’은(는) 선생님과 한 번 더 확인해요. 관련 실험을 다시 해 보면 도움이 돼요.`,'check');
    else special=false;}
   el.querySelectorAll('.rx-opt').forEach(o=>o.classList.remove('picked','no'));
   if(ok){opt.classList.add('picked','ok');el.classList.add('solved');el.querySelector('.rx-mark').innerHTML='<span class="dt-stamp ok" aria-label="맞음">○</span>';reveal();if(!special)coach(st.tries===1?'맞았어요! 풀이를 읽고 이유까지 확인해 봐요.':'다시 생각해서 맞혔어요. 풀이로 이유를 확인해 봐요.','good');}
   else{opt.classList.add('picked','no');const code=b.wrong[i]||b.m;fb.innerHTML=`<div class="dt-coach">${character?`<img src="${face('think')}" alt="생각하는 우루사쌤">`:''}<div class="dt-coach-say"><span>우루사쌤이 되물어요</span><p>${esc(misconceptions[code].label)} 한 번 더 골라 볼까요?</p></div></div>`;sol.hidden=false;if(!special)coach(`${misconceptions[code].label} 다시 골라 봐요.`,'check');}
  });
  sol.onclick=reveal;
 });
 host.querySelectorAll('[data-dt-goto]').forEach(btn=>btn.onclick=()=>onGoto(Number(btn.dataset.dtGoto)));
 host.querySelectorAll('[data-rx-back]').forEach(btn=>btn.onclick=onBack);
 coach(`${codes.map(nameOf).join(', ')} — 비슷한 문제로 다시 확인해 봐요. 처음 고른 답으로 진단해요.`,'');
 return {destroy(){}};
}
