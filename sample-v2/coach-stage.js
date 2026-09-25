// 우루사쌤을 책 지면과 실험 패널 **안으로** — 표시 위치만 옮긴다.
// 안내 문장(#coach-copy)·음성·반짝이는 버튼(#guide-action)의 동작은 app.js 그대로이고, 여기서는
//  ① 활동이 열리면 안내 막대를 실험 패널 아래쪽에, 닫히면 책 영역 아래쪽에 붙이고
//  ② 실험의 실시간 상태 문장(#activity-status)을 말풍선 둘째 줄에 비추고
//  ③ 말풍선 문장이 바뀔 때 살짝 올라오게 한다. 교사용 화면에서는 아무것도 하지 않는다.
import {methodErrorText} from './zero-gate.js';

const GOOD=/일치합니다|맞췄|맞았어요|정확해요|잘했어요|확인했어요/;
export function mountCoachStage(edition){
 if(edition==='teacher')return ()=>{};
 const dock=document.querySelector('.teacher-dock'),ws=document.querySelector('#workspace'),activity=document.querySelector('#activity'),pane=document.querySelector('#book-pane');
 const copy=document.querySelector('#coach-copy'),status=document.querySelector('#activity-status'),note=dock?.querySelector('.coach-note');
 if(!dock||!ws||!activity||!pane||!copy||!status||!note)return ()=>{};
 document.body.classList.add('coach-stage');
 let mirror=document.querySelector('#coach-status'),fromStatus=false;
 if(!mirror){mirror=document.createElement('p');mirror.id='coach-status';mirror.setAttribute('aria-hidden','true');copy.after(mirror);}
 const place=()=>{const target=ws.classList.contains('active')?activity:pane;if(dock.parentElement!==target)target.append(dock);sync();};
 const sync=()=>{
  const text=ws.classList.contains('active')?status.textContent.trim():'';
  if(mirror.textContent!==text){mirror.textContent=text;if(text)pop();}
  mirror.hidden=!text||text===copy.textContent.trim();   // 같은 문장을 두 줄로 되풀이하지 않는다
  // 실험 상태 문장에서 온 분위기만 여기서 바꾼다(채점 결과처럼 app.js가 정한 분위기는 두고).
  if(text){dock.dataset.mood=text.includes(methodErrorText)?'check':GOOD.test(text)?'good':'';fromStatus=true;}
  else if(fromStatus||!ws.classList.contains('active')){dock.dataset.mood='';fromStatus=false;}
 };
 const pop=()=>{note.classList.remove('coach-new');void note.offsetWidth;note.classList.add('coach-new');};
 const onCopy=()=>{pop();mirror.hidden=!mirror.textContent||mirror.textContent===copy.textContent.trim();};
 const observers=[new MutationObserver(place),new MutationObserver(sync),new MutationObserver(onCopy)];
 observers[0].observe(ws,{attributes:true,attributeFilter:['class']});
 observers[1].observe(status,{childList:true,characterData:true,subtree:true});
 observers[2].observe(copy,{childList:true,characterData:true,subtree:true});
 place();
 return ()=>observers.forEach(o=>o.disconnect());
}
