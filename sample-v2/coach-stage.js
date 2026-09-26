// 우루사쌤 = 화면 구석의 **작은 말풍선**(2026-09-26 개편) — 표시 위치만 정한다.
// 안내 문장(#coach-copy)·음성·반짝이는 버튼(#guide-action)의 동작은 app.js 그대로이고, 여기서는
//  ① 말풍선(전신 120~150px + 2~3줄)을 작업 영역 아래 구석에 두되, 지면·실험 단추를 덮지 않는 쪽
//     (왼쪽 / 책 오른쪽 / 오른쪽)을 골라 앉히고, 어디든 덮게 되면 스스로 접혀 얼굴만 남긴다.
//     '접기'로 직접 접을 수 있고, 접힌 얼굴을 누르면 다시 펼쳐진다. 🔊 음성 = 지금 안내 다시 듣기.
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
 const place=()=>{if(dock.parentElement!==ws)ws.append(dock);sync();arrange();};
 // ── 자리 잡기 ──────────────────────────────────────────────────────
 const KEY='msg-coach-folded',fold=dock.querySelector('#coach-fold'),voiceBtn=dock.querySelector('#coach-voice'),fig=dock.querySelector('.character-figure');
 let userFolded=false;try{userFolded=localStorage.getItem(KEY)==='1';}catch{}
 let userOpened=false,raf=0;
 // 덮으면 안 되는 것: 보이는 지면 전체, 실험 패널의 단추·입력·글·영상(3D 무대의 빈 바닥은 괜찮다)
 const NEED='.activity-head,.lab-controls,svg,button,input,select,textarea,video,[role="button"],h2,h3,h4,p,li,label,table,figure,.order-card,.dt-card,.bt-panel';
 const obstacles=()=>{
  const out=[],wr=ws.getBoundingClientRect(),vis=r=>r.width>4&&r.height>4&&r.bottom>wr.top&&r.top<wr.bottom&&r.right>wr.left&&r.left<wr.right;
  // 스크롤되는 읽기 화면(시험지·본문 크게)은 아래를 비워 두어 올려 읽을 수 있으므로 장애물로 보지 않는다
  const reader=ws.querySelector('#mobile-reader'),scrolls=reader&&reader.scrollHeight>reader.clientHeight+4;
  papers().forEach(r=>out.push(r));
  if(!scrolls)ws.querySelectorAll('#mobile-reader .paper').forEach(el=>{const r=el.getBoundingClientRect();if(vis(r)&&el.offsetParent!==null)out.push(r);});
  if(ws.classList.contains('active'))activity.querySelectorAll(NEED).forEach(el=>{if(dock.contains(el))return;const r=el.getBoundingClientRect();if(vis(r)&&r.bottom>wr.top+wr.height*.45)out.push(r);});
  return out;
 };
 const papers=()=>{const wr=ws.getBoundingClientRect();return [...ws.querySelectorAll('#flipbook .paper')].filter(el=>el.offsetParent!==null&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none').map(el=>el.getBoundingClientRect()).filter(r=>r.width>4&&r.height>4&&r.right>wr.left&&r.left<wr.right&&r.bottom>wr.top&&r.top<wr.bottom);};
 const overlap=(a,list)=>list.reduce((sum,r)=>sum+Math.max(0,Math.min(a.right,r.right)-Math.max(a.left,r.left))*Math.max(0,Math.min(a.bottom,r.bottom)-Math.max(a.top,r.top)),0);
 const setFold=(on,why)=>{dock.classList.toggle('folded',on);dock.dataset.fold=on?why:'';fold?.setAttribute('aria-expanded',String(!on));fig?.setAttribute('aria-expanded',String(!on));if(!on)delete dock.dataset.unread;};
 function arrange(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
   if(document.body.classList.contains('hide-character'))return;
   const small=innerWidth<=760;dock.classList.toggle('compact',small);
   if(userFolded&&!userOpened){setFold(true,'user');if(!small)seat(obstacles(),true);return;}
   if(small){setFold(false,'');dock.dataset.side='left';dock.style.removeProperty('--dock-x');return;}
   const list=obstacles();
   setFold(false,'');
   if(userOpened){seat(list,false);return;}
   const best=seat(list,false);
   if(best.cost>best.area*.03){setFold(true,'auto');seat(list,true);}
  });
 }
 // 후보 자리(왼쪽 / 책 오른쪽 / 오른쪽, 책 양옆 여백이 좁으면 말풍선을 그림 위로 세운 모양)를
 // 차례로 놓아 보고 덜 덮는 곳에 앉힌다.
 function apply(c,wr){
  dock.dataset.side=c.side;dock.dataset.shape=c.shape;
  if(c.w)dock.style.setProperty('--dock-w',c.w+'px');else dock.style.removeProperty('--dock-w');
  const w=dock.offsetWidth,h=dock.offsetHeight,x=c.side==='right'?Math.round(wr.width-w-10):c.x;
  dock.style.setProperty('--dock-x',x+'px');
  return {w,h,x};
 }
 function seat(list,folded){
  const wr=ws.getBoundingClientRect(),pr=pane.getBoundingClientRect(),pad=10,cands=[{side:'left',x:pad,shape:'row'}];
  if(ws.classList.contains('split')&&pr.width>0)cands.push({side:'left',x:Math.round(pr.right-wr.left+pad),shape:'row'});
  cands.push({side:'right',shape:'row'});
  if(!folded){const ps=papers();if(ps.length){const lg=Math.min(...ps.map(r=>r.left))-wr.left-2*pad,rg=wr.right-Math.max(...ps.map(r=>r.right))-2*pad;
   if(lg>=200)cands.push({side:'left',x:pad,shape:'stack',w:Math.min(300,Math.floor(lg))});
   if(rg>=200)cands.push({side:'right',shape:'stack',w:Math.min(300,Math.floor(rg))});}}
  let best=null;
  for(const c of cands){
   const m=apply(c,wr),r={left:wr.left+m.x,right:wr.left+m.x+m.w,top:wr.bottom-pad-m.h,bottom:wr.bottom-pad};
   const cost=overlap(r,list);
   if(!best||cost<best.cost-1)best={...c,cost,area:m.w*m.h};
  }
  apply(best,wr);
  return best;
 }
 fold?.addEventListener('click',()=>{userFolded=true;userOpened=false;try{localStorage.setItem(KEY,'1');}catch{}arrange();});
 fig?.addEventListener('click',()=>{if(!dock.classList.contains('folded'))return;userFolded=false;userOpened=true;try{localStorage.removeItem(KEY);}catch{}setFold(false,'');arrange();});
 fig?.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&dock.classList.contains('folded')){e.preventDefault();fig.click();}});
 if(fig){fig.tabIndex=0;fig.setAttribute('aria-label','우루사쌤 말풍선 펼치기');}
 voiceBtn?.addEventListener('click',()=>document.querySelector('#start')?.click());
 const voiceLabel=()=>{if(voiceBtn)voiceBtn.textContent=document.body.classList.contains('talking')?'■ 멈춤':'🔊 음성';};
 const bodyObs=new MutationObserver(voiceLabel);bodyObs.observe(document.body,{attributes:true,attributeFilter:['class']});
 const ro=new ResizeObserver(()=>arrange());ro.observe(ws);
 let settle=0;const later=()=>{clearTimeout(settle);settle=setTimeout(arrange,420);};   // 책장·패널이 자리 잡은 뒤 다시
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
 const onCopy=()=>{if(dock.dataset.fold==='auto')dock.dataset.unread='1';later();pop();mirror.hidden=!mirror.textContent||mirror.textContent===copy.textContent.trim();
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

 const observers=[new MutationObserver(()=>{userOpened=false;place();later();}),new MutationObserver(onStatus),new MutationObserver(onCopy),new MutationObserver(()=>mood()),new MutationObserver(()=>mood())];
 observers[0].observe(ws,{attributes:true,attributeFilter:['class']});
 observers[1].observe(status,{childList:true,characterData:true,subtree:true});
 observers[2].observe(copy,{childList:true,characterData:true,subtree:true});
 observers[3].observe(dock,{attributes:true,attributeFilter:['data-mood','data-face']});
 if(content)observers[4].observe(content,{childList:true});
 const contentObs=new MutationObserver(later);if(content)contentObs.observe(content,{childList:true,subtree:true});
 const bookObs=new MutationObserver(later);bookObs.observe(pane,{childList:true,subtree:false});
 place();mood(true);
 return ()=>{observers.forEach(o=>o.disconnect());contentObs.disconnect();bookObs.disconnect();bodyObs.disconnect();ro.disconnect();document.removeEventListener('focusin',onFocusIn);document.removeEventListener('focusout',onFocusOut);ws.removeEventListener('change',onChange);face?.destroy();};
}
