import {studentPrintPages,studentCoverPage} from './lesson-print-pages.js';
import {q1,q2} from './content.js';
import {sourceLessons} from './source-lessons.js';

const pages=[studentCoverPage,...studentPrintPages];
const $=selector=>document.querySelector(selector);
const groups={P11:q1,P19:q2.slice(0,6),P20:q2.slice(6,12)};
const unverified=new Set(['b9','b10','b11']);
let activeId='';

function pageIndex(){
 let index=NaN;
 try{const stored=localStorage.getItem('msg-source-sample-v2:demo:page:teacher');if(stored!==null)index=Number(stored);}catch{}
 if(!Number.isInteger(index)||index<0||index>=pages.length)index=Number(new URLSearchParams(location.search).get('page'))||0;
 return Math.max(0,Math.min(pages.length-1,index));
}
function answerText(question){
 if(Array.isArray(question.answer))return question.answer.map(value=>Array.isArray(value)?`(${value.join(', ')})`:value).join(' · ');
 return question.options?question.options[question.answer]:String(question.answer);
}
function renderAnswers(page){
 const host=$('#answers');host.replaceChildren();
 const list=document.createElement('ol');
 for(const question of groups[page.printId]||[]){
  const item=document.createElement('li');
  const title=document.createElement('strong');
  title.textContent=`${question.n}번 · ${unverified.has(question.id)?'공식 해설 대조 필요':answerText(question)}`;
  item.append(title);
  if(!unverified.has(question.id)){
   const why=document.createElement('p');why.textContent=question.why;item.append(why);
  }
  list.append(item);
 }
 host.append(list);
}
function update(){
 const index=pageIndex(),page=pages[index];
 if(activeId===page.printId)return;
 activeId=page.printId;
 $('#page').textContent=page.printId==='P0'?'원본 표지':`${page.lesson}차시 · 장면 ${index+1}/${pages.length}`;
 $('#title').textContent=page.title.replace('\n',' ');
 $('#lead').textContent=page.lead;
 $('#note').textContent=page.teacher||'원본 그림과 학생의 관찰을 먼저 확인하세요.';
 const sourceCue=sourceLessons[page.printId]?.teacher;
 $('#source-guidance').hidden=!sourceCue;
 $('#source-cue').textContent=sourceCue||'';
 $('#source').textContent=page.printId==='P0'?'사용자 제공 원본 표지':`원본 본책 ${page.source.join('·')}쪽`;
 $('#answer-section').hidden=!groups[page.printId];
 $('#answers').hidden=true;
 $('#show-answer').setAttribute('aria-expanded','false');
 $('#show-answer').textContent='해설 보기';
 if(groups[page.printId])renderAnswers(page);
 try{$('#memo').value=localStorage.getItem(`msg-source-sample-v2:teacher-note:${activeId}`)||'';$('#memo-state').textContent='이 브라우저에 자동 저장됩니다.';}catch{$('#memo').value='';$('#memo-state').textContent='이 브라우저에서는 메모를 저장할 수 없습니다.';}
}
$('#memo').addEventListener('input',event=>{
 try{localStorage.setItem(`msg-source-sample-v2:teacher-note:${activeId}`,event.target.value);$('#memo-state').textContent='이 브라우저에 저장했어요.';}
 catch{$('#memo-state').textContent='저장하지 못했어요. 메모를 따로 복사해 두세요.';}
});
$('#show-answer').onclick=()=>{
 const open=$('#answers').hidden;
 $('#answers').hidden=!open;
 $('#show-answer').setAttribute('aria-expanded',String(open));
 $('#show-answer').textContent=open?'해설 숨기기':'해설 보기';
};
update();addEventListener('storage',update);setInterval(update,2000);
