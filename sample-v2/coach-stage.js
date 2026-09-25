// 우루사쌤을 책 지면과 실험 패널 **안으로** — 표시 위치만 옮긴다.
// 안내 문장(#coach-copy)·음성·반짝이는 버튼(#guide-action)의 동작은 app.js 그대로이고, 여기서는
//  ① 활동이 열리면 안내 막대를 실험 패널 아래쪽에, 닫히면 책 영역 아래쪽에 붙이고
//  ② 실험의 실시간 상태 문장(#activity-status)을 말풍선 둘째 줄에 비추고
//  ③ 말풍선 문장이 바뀔 때 살짝 올라오게 하고
//  ④ 지금 상황(dock의 data-mood·data-face, 답을 쓰는 중인지)에 맞는 표정을 coach-face.js에 알린다.
// 교사용 화면에서는 아무것도 하지 않는다.
import {methodErrorText} from './zero-gate.js';
import {mountCoachFace} from './coach-face.js';

const GOOD=/일치합니다|맞췄|맞았어요|정확해요|잘했어요|확인했어요/;
const ANSWER='textarea,input:not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"]):not([type="range"]):not([type="file"]):not([type="hidden"])';
export function mountCoachStage(edition){
 if(edition==='teacher')return ()=>{};
 const dock=document.querySelector('.teacher-dock'),ws=document.querySelector('#workspace'),activity=document.querySelector('#activity'),pane=document.querySelector('#book-pane');
 const copy=document.querySelector('#coach-copy'),status=document.querySelector('#activity-status'),note=dock?.querySelector('.coach-note');
 const content=document.querySelector('#activity-content');
 if(!dock||!ws||!activity||!pane||!copy||!status||!note)return ()=>{};
 document.body.classList.add('coach-stage');
 const face=mountCoachFace(dock.querySelector('.character-figure'));
 let mirror=document.querySelector('#coach-status'),fromStatus=false;
 if(!mirror){mirror=document.createElement('p');mirror.id='coach-status';mirror.setAttribute('aria-hidden','true');copy.after(mirror);}
 const place=()=>{const target=ws.classList.contains('active')?activity:pane;if(dock.parentElement!==target)target.append(dock);sync();};
 const sync=()=>{
  const text=ws.classList.contains('active')?status.textContent.trim():'';
  if(mirror.textContent!==text){mirror.textContent=text;if(text)pop();}
  mirror.hidden=!text||text===copy.textContent.trim();   // 같은 문장을 두 줄로 되풀이하지 않는다
  // 실험 상태 문장에서 온 분위기만 여기서 바꾼다(채점 결과처럼 app.js가 정한 분위기는 두고).
  if(text){dock.dataset.mood=text.includes(methodErrorText)?'check':GOOD.test(text)?'good':'';fromStatus=true;delete dock.dataset.face;}
  else if(fromStatus||!ws.classList.contains('active')){dock.dataset.mood='';fromStatus=false;delete dock.dataset.face;}
 };
 const pop=()=>{note.classList.remove('coach-new');void note.offsetWidth;note.classList.add('coach-new');};

 // ── 표정(승인된 그림 6장을 통째로 바꿔 끼움 · coach-face.js) ─────────────
 //  check → 방법 오류(영점 게이트)면 놀람(흔들)→격려, 채점·처방의 오답이면 격려(끄덕)
 //  good  → 칭찬(깡충) → 잠시 뒤 부드러운 격려 미소
 //  data-face(app.js coachSay의 셋째 값) → 그 표정(예: 오개념 되묻기 = 생각)
 //  그 밖 → 답을 쓰는 중·예상 단계면 생각(몸을 기울임), 아니면 듣는 얼굴
 //  분위기 없는 새 안내 → 잠깐 설명 표정. 소리가 실제로 나는 동안은 입이 움직인다.
 let typing=false,lastKey='';
 const predicting=()=>ws.classList.contains('active')&&!!content?.querySelector('.inquiry-stage [data-order],[data-prediction-reason]');
 const mood=(force=false)=>{
  if(!face)return;
  const m=dock.dataset.mood||'',hint=dock.dataset.face||'',said=copy.textContent.trim(),seen=mirror.textContent.trim();
  const method=m==='check'&&(said+' '+seen).includes(methodErrorText);
  const key=[m,hint,method,said,seen].join('|');
  const fresh=key!==lastKey||force;lastKey=key;
  if(hint)face.mood(hint,{motion:fresh&&hint!=='think'?'nod':null});
  else if(method){if(fresh)face.react('surprise',1100,'shake');face.mood('encourage');}
  else if(m==='check')face.mood('encourage',{motion:fresh?'nod':null});
  else if(m==='good'){if(fresh)face.react('praise',3200,'hop');face.mood('encourage');}
  else face.mood(typing||predicting()?'think':'listen');
 };
 const onCopy=()=>{pop();mirror.hidden=!mirror.textContent||mirror.textContent===copy.textContent.trim();
  if(face&&!dock.dataset.mood&&!dock.dataset.face&&copy.textContent.trim())face.hint('explain',1500,'present');
  mood();};
 // 같은 실수를 되풀이해도(상태 문장이 같아도) 다시 놀란다
 const onStatus=()=>{sync();mood(status.textContent.includes(methodErrorText));};
 const isAnswer=el=>el instanceof Element&&el.matches(ANSWER)&&ws.contains(el)&&!dock.contains(el);
 const onFocusIn=e=>{if(isAnswer(e.target)){typing=true;mood();}};
 const onFocusOut=e=>{if(isAnswer(e.target)){typing=false;mood();}};
 // 보기를 고를 때도 잠깐 생각하는 얼굴
 const onChange=e=>{const t=e.target;if(face&&t instanceof Element&&t.matches('input[type="radio"],input[type="checkbox"],select')&&ws.contains(t)&&!dock.contains(t)&&!dock.dataset.mood)face.hint('think',1600);};
 document.addEventListener('focusin',onFocusIn);document.addEventListener('focusout',onFocusOut);ws.addEventListener('change',onChange);

 const observers=[new MutationObserver(place),new MutationObserver(onStatus),new MutationObserver(onCopy),new MutationObserver(()=>mood()),new MutationObserver(()=>mood())];
 observers[0].observe(ws,{attributes:true,attributeFilter:['class']});
 observers[1].observe(status,{childList:true,characterData:true,subtree:true});
 observers[2].observe(copy,{childList:true,characterData:true,subtree:true});
 observers[3].observe(dock,{attributes:true,attributeFilter:['data-mood','data-face']});
 if(content)observers[4].observe(content,{childList:true});
 place();mood(true);
 return ()=>{observers.forEach(o=>o.disconnect());document.removeEventListener('focusin',onFocusIn);document.removeEventListener('focusout',onFocusOut);ws.removeEventListener('change',onChange);face?.destroy();};
}
