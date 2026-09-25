import {studentPrintPages,studentCoverPage} from './lesson-print-pages.js';
const pages=[studentCoverPage,...studentPrintPages];
const $=s=>document.querySelector(s);
function update(){let n=Number(localStorage.getItem('msg-source-sample-v2:demo:page:teacher'));if(!Number.isInteger(n)||n<0||n>=pages.length)n=Number(new URLSearchParams(location.search).get('page'))||0;const p=pages[n];$('#page').textContent=p.printId==='P0'?'원본 표지':`${p.lesson}차시 · 장면 ${n+1}/${pages.length}`;$('#title').textContent=p.title.replace('\n',' ');$('#lead').textContent=p.lead;$('#note').textContent=p.teacher||'원본 그림과 학생의 관찰을 먼저 확인하세요.';$('#source').textContent=p.printId==='P0'?'사용자 제공 원본 표지':`원본 본책 ${p.source.join('·')}쪽`;}update();addEventListener('storage',update);setInterval(update,2000);
