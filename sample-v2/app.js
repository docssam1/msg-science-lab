import {editionName} from './editions.js';
import {studentPrintPages,studentCover,studentCoverPage} from './lesson-print-pages.js';
import {questions,gradeGroups,narration,lessonNames,q1,q2} from './content.js';
import {esc,graphSVG} from './graphics.js';
import {qrForPage} from './qr-map.js';
import {gradeQuestion} from './physics.js';
import {mountActivity,activityNames} from './activities.js';
import {mountReview,concepts} from './review.js';
import {mountSelfFlow} from './self-flow.js';
import {studentGuideFor,studentActivityPrompt} from './student-guide.js';
import {mountAssessmentSpeech} from './assessment-speech.js';
import {mountAssessmentPhoto} from './assessment-photo.js';
import {ANSWER_KEY_VERSION,gradeItem,summarize,reportHTML,mountRemedy,dxRows,nameOf} from './daily-grading.js';
import {diagnose,prescribe,firstAttemptRecord} from './remedy-bank.js';
import {mountCoachStage} from './coach-stage.js';
import {voiceStarted,voiceStopped} from './coach-face.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const edition=['student','teacher','book'].includes(new URLSearchParams(location.search).get('edition'))?new URLSearchParams(location.search).get('edition'):'book';
const isTeacher=edition==='teacher';
const isStudent=edition==='student';
const pages=[studentCoverPage,...studentPrintPages];
const pageGradeGroups={...gradeGroups,p11:q1,p19:q2.slice(0,6),p20:q2.slice(6,12)};
const BASE_KEY='msg-source-sample-v2:'+(isTeacher?'demo:':'learner:');
const LEGACY_KEY='msg-source-sample-v2:';
let keysVisible=false;
let writable=true;try{localStorage.setItem(BASE_KEY+'probe','1');localStorage.removeItem(BASE_KEY+'probe');}catch{writable=false;}
const memory=new Map();
function load(k,d){try{const x=localStorage.getItem(BASE_KEY+k)??(!isTeacher?localStorage.getItem(LEGACY_KEY+k):null);return x===null?(memory.get(k)??d):JSON.parse(x);}catch{return memory.get(k)??d;}}
function save(k,v){if(k==='graph-assessment-result'){{const value=load('graph-assessment',[]),status=gradeItem(q2[11],value).status;results.b12={correct:status==='correct'?true:status==='wrong'?false:null,status,value,time:Date.now(),answerKey:ANSWER_KEY_VERSION};}memory.set('results',results);try{localStorage.setItem(BASE_KEY+'results',JSON.stringify(results));}catch{}}memory.set(k,v);try{localStorage.setItem(BASE_KEY+k,JSON.stringify(v));return true;}catch{writable=false;return false;}}

let current=0,book=null,activity=null,currentActivityKind=null,activityToken=0,voiceToken=0,voiceResolve=null,audio=null,utterance=null,started=false,reading=false,studentEngaged=false,studentVoiceSeq=0;
let teachPage=-1,teachStage=0;
let clearPageSpeech=()=>{},clearActivitySpeech=()=>{},clearPagePhoto=()=>{},clearActivityPhoto=()=>{};
let wantSpread=load('spread:'+edition,edition==='book'),motion=load('motion',true),sound=load('sound',true),showCharacter=isStudent?true:load('character',true),studentZoom=load('student-zoom',false),rebuilding=false;
const studentVisited=new Set(Array.isArray(load('guide-visited',[]))?load('guide-visited',[]):[]);
const answers=load('answers',{}),results=load('results',{});
let files={};
// A generation manifest is required before advertising a clip as an OmniVoice result.
try{files=await fetch('./audio/narration-manifest.json').then(r=>r.ok?r.json():{});}catch{}
try{const library=await fetch('./audio/voice-library.json').then(r=>r.ok?r.json():null);if(library?.clips)files={...library.clips,...files};}catch{}
const normalizeVoiceText=s=>String(s||'').replace(/\s+/g,' ').trim();
const clipByText=new Map(Object.entries(files).filter(([,v])=>v?.path&&v?.text).map(([id,v])=>[normalizeVoiceText(v.text),id]));
let toastTimer;
function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
let paperSerial=0;
function scopeGraphics(html){const pageKey='v'+paperSerial++;let j=0;return html.replace(/<svg[\s\S]*?<\/svg>/g,s=>{const pre=pageKey+'-'+j+++'-';const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);for(const id of ids){s=s.replaceAll('id="'+id+'"','id="'+pre+id+'"').replaceAll('url(#'+id+')','url(#'+pre+id+')');}return s;});}
function studentBody(html){const template=document.createElement('template');template.innerHTML=html;template.content.querySelectorAll('.teacher-answer,.teacher-graphic').forEach(el=>el.remove());return template.innerHTML;}
function paper(p,i,folio=i+1){if(p.printId==='P0')return studentCover();const actionDock=(p.body.match(/<button[^>]*(?:data-action|data-grade)=[^>]*>[\s\S]*?<\/button>/g)||[]).join('');return `<article class="paper has-lab-qr ${p.dense?'dense':''} ${p.assessment?'assessment':''} ${p.printClass||''}" data-book-page="${i}" data-print-id="${p.printId||''}" data-lesson="${p.lesson}" data-layout-page="${p.layoutIndex??i}" data-source="${p.source.join(',')}"><div class="page-top"><strong><span class="chapter-medal">${String(p.lesson).padStart(2,'0')}</span>${lessonNames[p.lesson]}</strong><em>${isTeacher?'강사용 교안':'MSG 초·과·심'}</em></div><a class="lab-qr" href="${qrForPage(p)}" target="_blank" rel="noopener" aria-label="${p.lesson}차시 관련 활동 QR · 새 수업 공개 전"><img src="./qr/${p.printId}.png" alt="관련 실험·활동 QR"><span>공개 전 QR</span></a><div class="page-tab">${p.lesson}차시 · ${p.assessment?'확인 문제':p.added?'추가 탐구':'과학 탐구'}</div><div class="page-heading"><div class="eyebrow">${p.kicker}</div><h1>${p.title}</h1><p class="page-lead">${p.lead}</p></div><form class="page-body" aria-label="교재 답안 ${i+1}">${scopeGraphics(!isTeacher?studentBody(p.body):p.body)}</form><div class="page-launch">${actionDock}</div><footer class="page-foot"><span>MSG · ${p.lesson}차시 / ${p.printClass?.includes('reading-page')?'과학 이야기':p.added?'추가 도입 탐구 · 본책 10쪽 연계':'본책 '+p.source.join('·')+'쪽'}</span><span>${isTeacher?'강사용':'학생용'} <strong>${String(folio).padStart(2,'0')}</strong></span></footer></article>`;}
function teacherNotePaper(p){const groups={P11:q1,P19:q2.slice(0,6),P20:q2.slice(6,12)};const items=groups[p.printId]||[];const key=q=>Array.isArray(q.answer)?Array.isArray(q.answer[0])?q.answer.map(([x,y])=>`(${x} g, ${y} cm)`).join(' · '):q.answer.join(' · '):q.options?q.options[q.answer]:q.answer;return `<article class="paper teacher-note-paper" data-teacher-note="${p.printId}"><div class="page-top"><strong>MSG 초·과·심 · 교사 노트</strong><em>${p.printId}</em></div><div class="page-heading"><div class="eyebrow">가르치기 · 질문 → 자료 → 정리</div><h1>${esc(p.title.replace('\n',' '))}</h1></div><section><h2>학생에게 먼저 묻기</h2><p>${esc(p.lead)}</p></section><section><h2>지도 메모</h2><p>${esc(p.teacher||'원본 그림과 학생 관찰을 확인하세요.')}</p></section>${items.length?`<section class="${p.printId==='P20'?'teacher-assessment-note':''}"><h2>평가 확인</h2><ol>${items.map(q=>`<li>${q.n}번 · ${['b9','b10','b11'].includes(q.id)?'해설 검토 필요':esc(key(q))}</li>`).join('')}</ol>${p.printId==='P20'?`<div class="teacher-note-graph">${graphSVG({step:4,points:[[10,4],[20,8],[30,12]]})}</div>`:''}</section>`:''}<section><h2>활동 연결</h2><p>${esc(activityNames[p.action]||'원본 문항을 먼저 풀고 답을 대조합니다.')}</p></section><footer class="page-foot"><span>원본 본책 ${p.source.join('·')}쪽</span><strong>${p.printId} · 교사용</strong></footer></article>`;}
function printBuild(){const student=studentCover()+studentPrintPages.map((p,i)=>paper(isTeacher?{...p,body:studentBody(p.body)}:p,i+1,i+2)).join('');$('#print-root').innerHTML=isTeacher?studentCover()+studentPrintPages.map((p,i)=>paper({...p,body:studentBody(p.body)},i+1,i+2)+teacherNotePaper(p)).join(''):student;$('#print-root').dataset.edition=isTeacher?'teacher':'student';}
function isSpread(){return wantSpread&&innerWidth>1000&&!$('#workspace').classList.contains('active');}
function fit(){const space=$('#book-space'),wrap=$('#book-transform');if(!space||!wrap)return;const w=isSpread()?1588:794,h=1123;const scale=Math.max(.05,Math.min((space.clientWidth-16)/w,(space.clientHeight-14)/h));wrap.style.width=w+'px';wrap.style.height=h+'px';wrap.style.transform=`translate(-50%,-50%) scale(${scale})`;$('#fit-info').textContent=isStudent?'책 안에서 스크롤·본문 확대':`전체 지면 ${Math.round(scale*100)}% · 본문 크게로 확대`;}
function toggleStudentZoom(){studentZoom=!studentZoom;save('student-zoom',studentZoom);document.body.classList.toggle('student-zoom',studentZoom);$('#focus-reading').textContent=studentZoom?'원래 크기':'본문 크게';$('#read-text').textContent=studentZoom?'원래 크기':'본문 크게';}

function fitPageBodies(){
 const root=document.querySelector('#flipbook');if(!root)return;
 root.querySelectorAll('.paper').forEach(pg=>{
  const body=pg.querySelector('.page-body'),dock=pg.querySelector('.page-launch'),foot=pg.querySelector('.page-foot');
  if(!body||!foot||pg.getBoundingClientRect().height<1)return;body.style.zoom='1';body.style.width='100%';
  const limit=(dock&&dock.children.length?dock.offsetTop:foot.offsetTop)-12;
  const available=limit-body.offsetTop;if(available<100)return;
  let full=body.scrollHeight;if(full<=available)return;
  let z=Math.min(1,available/full);z=Math.max(.75,z);
  body.style.zoom=String(z);body.style.width='100%';
  pg.dataset.bodyFit=z.toFixed(3);
 });
}
function restoreFields(root=document){root.querySelectorAll('[data-answer-field]').forEach(el=>{const v=answers[el.name];if(el.type==='radio')el.checked=String(v)===el.value;else if(v!==undefined)el.value=v;});}
function pageVoice(p){if(!isTeacher&&p.printId==='P5')return {text:'다섯 물건을 하나씩 재고 처음 예상과 비교해 보세요.',id:null};if(!isTeacher&&p.printId==='P12')return {text:'먼저 모양의 변화를 관찰하고, 힘을 없애면 어떻게 될지 예상해 보세요.',id:null};if(!isTeacher&&p.printId==='P16')return {text:'표를 보고 그래프에 점을 직접 찍어 보세요.',id:null};if(p.printId==='P17')return {text:'재질·철사 굵기·코일 지름을 한 번에 하나씩 바꿔 비교해 보세요.',id:null};return {text:files[p.id]?.text||narration[p.id]?.text||'그림을 보고 직접 관찰해 보세요.',id:p.id};}
function renderMobilePage(){if(innerWidth>700&&!isStudent)return;clearPageSpeech();clearPagePhoto();const host=$('#mobile-reader');host.innerHTML=paper(pages[current],current,current+1);host.scrollTop=0;restoreFields(host);if(isStudent&&pages[current].assessment){clearPageSpeech=mountAssessmentSpeech(host,questions,valueFor,{load,save});clearPagePhoto=mountAssessmentPhoto(host,pages[current].printId);}if(isStudent&&pages[current].assessment)markPaper(host);}
function updateMeta(){const p=pages[current];if(isTeacher&&teachPage!==current){teachPage=current;teachStage=0;keysVisible=false;document.body.classList.remove('teacher-mode');$('#teacher').setAttribute('aria-pressed','false');$('#teacher').textContent='교안·정답 공개';}if(isTeacher){$('#teach-overlay').hidden=teachStage>0||$('#workspace').classList.contains('active');$('#teach-question').textContent=p.title.replace('\n',' ');}$('#current-section').textContent=p.printId==='P0'?'원본 표지':`${p.lesson}차시 · ${p.kicker.split('·')[1]||p.kicker}`;$('#page-source').textContent=p.printId==='P0'?'사용자 제공 원본 표지':`${p.printClass?.includes('reading-page')?'과학 이야기':'본책 '+p.source.join('·')+'쪽'} · ${p.printId||current+1}/${pages.length}`;$('#page-select').value=current;$('#prev').disabled=current===0;$('#next').disabled=current>=pages.length-1;$$('button[data-lesson]').forEach(b=>b.classList.toggle('selected',+b.dataset.lesson===p.lesson));$('#teacher-guide').textContent=p.teacher||'';$('#teacher-guide').hidden=true;$('#self-study').hidden=isStudent||isTeacher||p.assessment||['P0','P3','P4','P5'].includes(p.printId);$('#coach-copy').textContent=isTeacher&&teachStage===0?'질문을 먼저 보여 주고 학생의 생각을 들어 보세요.':pageVoice(p).text;$('#lesson-state').textContent=p.assessment?'생각하고 답한 뒤 제출해 보세요.':isTeacher?'질문 → 자료 → 학생 조작 → 정리':'예상 → 조작 → 기록 → 확인';renderMobilePage();if(isStudent)showStudentGuide();save(isTeacher?'page:teacher':'page:learner',current);requestAnimationFrame(fitPageBodies);}
function showStudentGuide(){
 if(!isStudent)return;
 const action=$('#guide-action'),active=$('#workspace').classList.contains('active');
 $$('.guide-target').forEach(el=>el.classList.remove('guide-target'));
 if(active){$('#coach-copy').textContent=studentActivityPrompt(currentActivityKind);action.hidden=true;return;}
 let guide=studentGuideFor(pages[current],current,pages.length-1,studentVisited.has(current));
 if(guide.action==='grade'&&pageGraded(current)&&current<pages.length-1)guide={text:'채점을 마쳤어요. 답을 고쳤다면 다시 채점하고, 아니면 다음 페이지로 넘어가 보세요.',action:'next',label:'다음 페이지',kind:null};
 $('#coach-copy').textContent=guide.text;
 action.hidden=guide.action==='none';action.textContent=guide.label;action.dataset.guideAction=guide.action;
 if(guide.kind)action.dataset.guideKind=guide.kind;else delete action.dataset.guideKind;
 if(guide.action==='activity'){
  action.classList.add('guide-target');
  $$(`[data-book-page="${current}"] [data-action="${CSS.escape(guide.kind)}"]`).forEach(el=>{if(!el.closest('#print-root'))el.classList.add('guide-target');});
 }else if(guide.action==='next')$('#next').classList.add('guide-target');
 else if(guide.action==='grade')$$(`#mobile-reader [data-book-page="${current}"] .page-launch [data-grade]`).forEach(el=>el.classList.add('guide-target'));
}
function buildBook(){rebuilding=true;const old=current;book?.destroy();$('#book-transform').innerHTML='<div id="flipbook"></div>';const el=$('#flipbook');el.style.width=(isSpread()?1588:794)+'px';el.style.height='1123px';el.innerHTML=pages.map((p,i)=>paper(p,i)).join('');restoreFields(el);
 book=new St.PageFlip(el,{width:794,height:1123,size:'fixed',autoSize:false,minWidth:794,maxWidth:794,minHeight:1123,maxHeight:1123,usePortrait:!isSpread(),showCover:false,startPage:old,flippingTime:500,maxShadowOpacity:.2,useMouseEvents:false,clickEventForward:true,disableFlipByClick:true,showPageCorners:false,mobileScrollSupport:true});
 book.loadFromHTML(el.querySelectorAll('.paper'));book.on('flip',e=>{if(rebuilding)return;current=Math.min(pages.length-1,e.data);updateMeta();restoreFields(el);});
 book.turnToPage(old);current=old;fit();fitPageBodies();requestAnimationFrame(fitPageBodies);updateMeta();rebuilding=false;
}
// 스스로 공부하기·살아있는 책의 얼굴은 coach-face.js(승인된 표정 6장 바꿔 끼우기)가 맡는다.
function expression(name){if(!isTeacher)return;const img=$('#teacher-expression');if(img){const src=`./art/expressions/${name}.png`;if(img.getAttribute('src')!==src)img.src=src;img.alt=`우루사쌤 ${name==='explain'?'설명하는':'듣는'} 표정`;}}
function stopVoice(){voiceToken++;audio?.pause();if(audio){audio.removeAttribute('src');audio.load();}audio=null;if(window.speechSynthesis)speechSynthesis.cancel();utterance=null;voiceResolve?.(false);voiceResolve=null;voiceStopped();document.body.classList.remove('talking');expression('listen');reading=false;$('#start').textContent=isStudent?(started?'▶ 안내 다시 듣기':'▶ 안내 소리 시작'):(started?'▶ 해설 다시 듣기':'▶ 수업 시작');}
async function say(text,clipId=null){stopVoice();$('#coach-copy').textContent=text;if(!sound||document.hidden)return false;const token=voiceToken;reading=true;$('#start').textContent='Ⅱ 해설 멈추기';document.body.classList.add('talking');
 return new Promise(resolve=>{voiceResolve=resolve;let done=false;const finish=ok=>{if(done)return;done=true;if(token===voiceToken){voiceStopped();document.body.classList.remove('talking');reading=false;$('#start').textContent=isStudent?'▶ 안내 다시 듣기':'▶ 해설 다시 듣기';voiceResolve=null;}resolve(ok&&token===voiceToken);};
  const unavailable=()=>{if(token!==voiceToken)return finish(false);expression('listen');$('#voice-kind').textContent='음성을 재생할 수 없어요 · 자막을 읽어 주세요';toast('음성을 재생할 수 없어요. 다시 듣기를 눌러 주세요.');finish(false);};
  const matchedId=clipId||clipByText.get(normalizeVoiceText(text));
  if(matchedId&&files[matchedId]?.path){audio=new Audio(new URL(files[matchedId].path,import.meta.url).href);$('#voice-kind').textContent='우루사쌤 · OmniVoice 생성 해설';expression('explain');voiceStarted(audio);audio.onended=()=>{expression('listen');finish(true);};audio.onerror=()=>{audio=null;unavailable();};audio.play().catch(()=>{audio=null;unavailable();});}else{$('#voice-kind').textContent='기존 음성 없음 · 자막으로 확인';expression('listen');finish(false);}
 });
}
async function narrateCurrent(){started=true;if(!sound){if(isStudent)showStudentGuide();return;}const p=pages[current];if(!p.id||p.printId==='P0'){if(isStudent)showStudentGuide();return;}if(isTeacher&&teachStage===0){toast('자료를 보여준 뒤 설명 음성을 재생해 주세요.');return;}const voice=pageVoice(p);if(!voice.id||!files[voice.id]?.path){if(isStudent){showStudentGuide();return;}toast('이 장면은 글과 실험으로 확인해 주세요.');return;}await say(voice.text,voice.id);if(isStudent&&!$('#workspace').classList.contains('active'))showStudentGuide();}
async function openActivity(kind,auto=false,custom=null){if(kind==='battle'&&!isTeacher)return;if(isStudent){studentVoiceSeq++;studentEngaged=true;if(!['reading','assessment','source','credits'].includes(kind)){studentVisited.add(current);save('guide-visited',[...studentVisited]);}}currentActivityKind=kind;$('#activity').dataset.kind=kind;document.body.classList.toggle('battle-active',kind==='battle');$('#battle').setAttribute('aria-pressed',String(kind==='battle'));stopVoice();activityToken++;const token=activityToken;activity?.destroy();clearActivitySpeech();clearActivityPhoto();clearActivitySpeech=()=>{};clearActivityPhoto=()=>{};activity=null;window.__lab=null;const wasActive=$('#workspace').classList.contains('active');$('#workspace').classList.add('active');$('#activity').setAttribute('aria-hidden','false');$('#activity-title').textContent=activityNames[kind]||'개념 다시 확인';$('#activity-kicker').textContent=['watch','balance','spring-film'].includes(kind)?'ACTUAL FOOTAGE · 실제 기록영상':'SMART LAB · 교재 연계 활동';$('#activity-status').textContent='';$('#activity-content').innerHTML='';if(!wasActive)buildBook();if(isStudent)showStudentGuide();
 if(isTeacher)$('#teach-overlay').hidden=true;
 const ctx={say,status:t=>$('#activity-status').textContent=t,load,save,setLab:l=>window.__lab=l,auto,open:openActivity,close:closeActivity,writable};
 if(custom){activity=custom($('#activity-content'),ctx);return;}
 if(kind==='source'){const p=pages[current];if(p.printId==='P0'){$('#activity-content').innerHTML='<div class="large-reading">'+studentCover()+'</div>';return;}$('#activity-content').innerHTML=`<div class="source-view"><div class="source-tabs">${p.source.map(n=>`<button data-source-page="${n}">본책 ${n}쪽</button>`).join('')}</div><img src="./source/p${p.source[0]}.webp" alt="원본 교재 ${p.source[0]}쪽"></div>`;$('#activity-content').querySelectorAll('[data-source-page]').forEach(b=>b.onclick=()=>{$('#activity-content img').src=`./source/p${b.dataset.sourcePage}.webp`;$('#activity-content img').alt=`원본 교재 ${b.dataset.sourcePage}쪽`;});return;}
 if(kind==='reading'){$('#activity-content').innerHTML='<div class="large-reading">'+paper(pages[current],current)+'</div>';restoreFields($('#activity-content'));return;}
 if(kind==='credits'){credits();return;}
 if(kind==='assessment'){const p=pages[current];$('#activity-content').innerHTML='<div class="large-reading">'+paper(p,current)+'</div>';restoreFields($('#activity-content'));if(isStudent&&p.assessment){clearActivitySpeech=mountAssessmentSpeech($('#activity-content'),questions,valueFor,{load,save});clearActivityPhoto=mountAssessmentPhoto($('#activity-content'),p.printId);markPaper($('#activity-content'));}return;}
 try{const inst=await mountActivity(kind,$('#activity-content'),ctx);if(token!==activityToken)inst?.destroy();else activity=inst;}catch(e){$('#activity-content').innerHTML='<div class="large-reading"><h3>활동을 열지 못했습니다.</h3><p>'+esc(e.message)+'</p></div>';console.error(e);}
}
function closeActivity(){document.body.classList.remove('battle-active');$('#battle').setAttribute('aria-pressed','false');stopVoice();activityToken++;activity?.destroy();clearActivitySpeech();clearActivityPhoto();clearActivitySpeech=()=>{};clearActivityPhoto=()=>{};activity=null;currentActivityKind=null;delete $('#activity').dataset.kind;window.__lab=null;$('#activity-content').innerHTML='';$('#activity').setAttribute('aria-hidden','true');$('#workspace').classList.remove('active');buildBook();if(isTeacher)$('#teach-overlay').hidden=teachStage>0;}
function navigate(i,{animated=false}={}){if(i<0||i>=pages.length)return;if(isStudent)studentEngaged=true;stopVoice();if($('#workspace').classList.contains('active'))closeActivity();const old=current;current=i;const sameSpread=isSpread()&&Math.floor(old/2)===Math.floor(i/2);
 if(animated&&motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sameSpread){book.flip(i);setTimeout(()=>{current=i;updateMeta();},550);}else{book.turnToPage(i);current=i;updateMeta();}
 $('#voice-kind').textContent=isStudent?'기존 우루사쌤 음성이 있으면 자동으로 들려요.':started?'해설 다시 듣기로 시작합니다.':'소리는 수업 시작 후 재생됩니다.';
 if(isStudent&&studentEngaged&&i!==old){const seq=++studentVoiceSeq;setTimeout(()=>{if(seq===studentVoiceSeq&&current===i&&!$('#workspace').classList.contains('active'))narrateCurrent();},animated&&motion&&!sameSpread?620:0);}
}
function collectField(el){answers[el.name]=el.value;save('answers',answers);el.closest('.question[data-mark]')?.removeAttribute('data-mark');$$(`[data-answer-field][name="${CSS.escape(el.name)}"]`).forEach(other=>{if(other!==el){if(other.type==='radio')other.checked=other.value===el.value;else other.value=el.value;}});}
function valueFor(q){if(q.kind==='graph')return load('graph-assessment',[]);return Array.isArray(q.answer)?q.answer.map((_,i)=>answers[q.id+'-'+i]??''):answers[q.id]??'';}
function markPaper(root=document){root.querySelectorAll('.question[data-q]').forEach(box=>{const q=questions.find(x=>x.id===box.dataset.q),r=results[box.dataset.q];if(!q||box.closest('#print-root'))return;if(!isTeacher&&r?.answerKey&&['correct','wrong','review'].includes(r.status)&&JSON.stringify(r.value)===JSON.stringify(valueFor(q)))box.dataset.mark=r.status;else box.removeAttribute('data-mark');});}
function pageGraded(i){const qs=(pageGradeGroups[pages[i]?.printId?.toLowerCase()]||[]).filter(q=>q.kind!=='graph');return qs.length>0&&qs.every(q=>results[q.id]?.answerKey&&JSON.stringify(results[q.id].value)===JSON.stringify(valueFor(q)));}
// 채점: 확인된 정답만 ○/×. 공식 정답 미확인·판단 불가 답은 '검토 필요'로 남기고 점수에서 뺀다(daily-grading.js).
function grade(group){const qs=pageGradeGroups[group];if(!qs)return;const blank=qs.find(q=>{if(q.kind==='graph')return false;const v=valueFor(q);return Array.isArray(v)?v.some(x=>!String(x).trim()):!String(v).trim();});if(blank){toast(`${blank.n}번의 답을 먼저 써 주세요.`);return;}
 const at=Date.now(),entry={at,page:group,answerKey:ANSWER_KEY_VERSION,items:{},self:load('self-check',{})};
 qs.forEach(q=>{const value=valueFor(q),g=gradeItem(q,value);if(g.status==='pending')return;results[q.id]={correct:g.status==='correct'?true:g.status==='wrong'?false:null,status:g.status,value,time:at,answerKey:ANSWER_KEY_VERSION};entry.items[q.id]={status:g.status,value};if((g.status==='correct'||g.status==='wrong')&&!remedyLog().some(r=>r.src==='test'&&r.item===q.id)){const rec=firstAttemptRecord(q.id,value,g.status==='correct');if(rec)addRemedy({...rec,at});}});
 save('results',results);const log=load('grading-log',[]);save('grading-log',[...(Array.isArray(log)?log:[]),entry].slice(-40));markPaper();openDailyReport(q1.includes(qs[0])?1:2,qs,at);}
// 진단 기록: 문항마다 첫 시도만(스스로 체크는 넣지 않는다). 처방 문제의 첫 시도도 같은 곳에 쌓인다.
function remedyLog(){const v=load('remedy-log',[]);return Array.isArray(v)?v:[];}
function addRemedy(rec){if(!rec)return;save('remedy-log',[...remedyLog(),{at:Date.now(),...rec}].slice(-300));}
function pageLab(i){const p=pages[i];return p?.action&&activityNames[p.action]?{kind:p.action,name:activityNames[p.action]}:null;}
function gotoLab(i){if(!pages[i])return;navigate(i);if(pages[i].action)openActivity(pages[i].action);}
function coachSay(text,mood='',face=''){if(isTeacher)return;$('#coach-copy').textContent=text;const dock=document.querySelector('.teacher-dock');if(dock){dock.dataset.mood=mood;if(face)dock.dataset.face=face;else delete dock.dataset.face;}}
function coachAction(label,act){if(!isStudent)return;const b=$('#guide-action');b.textContent=label;b.dataset.guideAction=act;delete b.dataset.guideKind;b.hidden=false;b.classList.add('guide-target');}
function openDailyReport(lesson,fresh=[],gradedAt=Date.now()){const list=lesson===1?q1:q2,selfChecks=load('self-check',{})||{};
 const items=list.map(q=>{const r=results[q.id];if(!r){if(q.kind==='graph'&&fresh.includes(q))return {q,value:valueFor(q),...gradeItem(q,valueFor(q))};return {q,status:'unsubmitted'};}const g=gradeItem(q,r.value);return {q,value:r.value,...g,status:g.status==='blank'?'unsubmitted':g.status};});
 const dx=diagnose(remedyLog());
 openActivity('assessment',false,host=>{host.innerHTML=reportHTML({lesson,items,selfChecks,character:!isTeacher,labNames:activityNames,gradedAt,dx,pageLab,remedy:!isTeacher});$('#activity-title').textContent=`${lesson}차시 Daily Test · 채점과 첨삭`;
  host.querySelectorAll('[data-dt-lab]').forEach(b=>b.onclick=()=>openActivity(b.dataset.dtLab));host.querySelectorAll('[data-dt-goto]').forEach(b=>b.onclick=()=>gotoLab(Number(b.dataset.dtGoto)));host.querySelectorAll('[data-dt-remedy]').forEach(b=>b.onclick=()=>openRemedy(lesson));
  host.querySelectorAll('[data-dt-page]').forEach(b=>b.onclick=()=>{const i=pages.findIndex(p=>p.assessment&&(pageGradeGroups[p.printId.toLowerCase()]||[]).some(q=>q.id===b.dataset.dtPage));if(i>=0)navigate(i);});host.querySelector('[data-dt-back]')?.addEventListener('click',closeActivity);
  if(!isTeacher){const s=summarize(items),rows=dxRows(dx),confirmed=rows.filter(d=>d.status==='confirmed'),due=prescribe(dx);
   if(due.length){coachSay(`‘${confirmed.map(d=>nameOf(d.code)).join('’, ‘')}’ 헷갈림이 두 문제 이상에서 보였어요. 처방 문제로 다시 확인해 볼까요?`,'check');coachAction(`처방 문제 풀기 · ${due.length}`,'remedy');}
   else coachSay(!s.confirmed?'채점할 수 있는 문항이 아직 없어요. 검토 중인 문항은 선생님과 함께 확인해요.':!s.wrong?`확인된 ${s.confirmed}문항을 모두 맞혔어요! 정말 잘했어요.${s.review?` 검토 중인 ${s.review}문항은 선생님과 확인해요.`:''}`:`${s.confirmed}문항 중 ${s.correct}문항을 맞혔어요. 틀린 문제는 우루사쌤 질문을 먼저 읽고 다시 생각해 봐요.`,s.wrong?'check':s.confirmed?'good':'');}
  return {destroy(){}};});}
function openRemedy(lesson){if(isTeacher)return;openActivity('assessment',false,host=>{$('#activity-title').textContent='처방 문제 · 비슷한 문제로 다시 확인';return mountRemedy(host,{getLog:remedyLog,record:addRemedy,coach:coachSay,character:true,pageLab,onGoto:gotoLab,onBack:()=>openDailyReport(lesson)});});}
function openReview(concept){return openActivity('assessment',false,(host,ctx)=>mountReview(host,concept,ctx));}
function credits(){ $('#activity-content').innerHTML=`<div class="credits"><h3>교재 원본</h3><p>사용자 제공 《초과심_물리》 원본 앞표지와 본책 10–21쪽을 사용했습니다. 원본의 역사·미래 서술과 편집 보완 설명은 구분합니다.</p><h3>사진 출처</h3><p>P3–P5의 생활 물건, P7의 저울, P18의 생활 도구, P9의 실제 시계 태엽 사진은 원본과 촬영자·라이선스를 <a href="./photos/credits.html" target="_blank" rel="noopener">사진 출처 목록</a>에서 확인할 수 있습니다. 사진 속 물건의 실제 무게와 앱의 가상 측정값은 다릅니다. P18 완력기는 개념 도해입니다. P10의 극소 코일·4D 프린팅·2D 재료 이미지는 가상 실사로 만든 설명용 시각화이며 실제 연구 사진이 아닙니다.</p><h3>기존 영상 재사용</h3><p><a href="https://commons.wikimedia.org/wiki/File:HowaWatchWork1949.ogv" target="_blank" rel="noopener">How a Watch Works (1949)</a>의 기존 발췌 영상 두 장면과 <a href="https://commons.wikimedia.org/wiki/File:Hookeslawexample.ogv" target="_blank" rel="noopener">Hookeslawexample</a>의 기존 관찰 영상을 재사용합니다. 후자는 10·20·30 g의 수치를 증명하는 영상이 아닙니다.</p><h3>구현 자산</h3><p>StPageFlip과 Three.js의 라이선스 문서를 유지했습니다. 설명 음성은 기존 OmniVoice 클립이며, 재생 실패 시 자막으로 확인합니다. 기존 우루사쌤 전신 그림과 승인된 표정 이미지를 재사용합니다.</p><h3>기록</h3><p>답안과 활동 기록은 이 브라우저의 저장 공간에 남습니다. 원본 문항·그림과 해설의 최종 대조는 별도 검수가 필요합니다.</p></div>`;}
$('#page-select').innerHTML=pages.map((p,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${p.lesson}차시 · ${p.kicker.split('·').at(-1).trim()}</option>`).join('');
const entryParams=new URLSearchParams(location.search);
const namedPage=pages.findIndex(p=>p.id===(entryParams.get('section')||entryParams.get('s')));
current=namedPage>=0?namedPage:Math.max(0,Math.min(pages.length-1,Number(entryParams.get('page')||load(isTeacher?'page:teacher':'page:learner',0))));
if(!Number.isFinite(current))current=0;
document.body.classList.toggle('hide-character',!showCharacter);document.body.classList.toggle('guide-mode',isTeacher);document.body.classList.toggle('teacher-mode',isTeacher&&keysVisible);$('#character').setAttribute('aria-pressed',showCharacter);$('#character').textContent=showCharacter?'우루사쌤 표시':'우루사쌤 숨김';$('#teacher').setAttribute('aria-pressed',keysVisible);$('#sound').setAttribute('aria-pressed',sound);$('#sound').textContent=sound?'소리 켬':'소리 끔';$('#motion').setAttribute('aria-pressed',motion);$('#motion').textContent=motion?'책넘김 켬':'책넘김 끔';$('#spread').setAttribute('aria-pressed',wantSpread);$('#spread').textContent=wantSpread?'펼침 보기':'한 쪽 보기';
document.body.dataset.edition=edition;document.body.classList.toggle('student-zoom',isStudent&&studentZoom);$('#edition').value=edition;document.title=editionName(edition)+' | MSG 초·과·심';$('#teacher').textContent='교안·정답 공개';$('#teacher').hidden=!isTeacher;$('#teacher-notes').hidden=!isTeacher;$('#battle').hidden=!isTeacher;$('#character').hidden=isStudent;$('#start').textContent=isStudent?'▶ 안내 소리 시작':'▶ 설명 듣기';expression('listen');if(isStudent){$('#voice-kind').textContent='화면을 조작하면 기존 우루사쌤 음성이 이어져요.';$('#focus-reading').textContent=studentZoom?'원래 크기':'본문 크게';$('#read-text').textContent=studentZoom?'원래 크기':'본문 크게';}
mountCoachStage(edition);printBuild();buildBook();
$('#teach-show').onclick=()=>{teachStage=1;$('#teach-overlay').hidden=true;updateMeta();};
$('#teacher-notes').onclick=()=>window.open(`./teacher-notes.html?page=${current}`,'msg-teacher-notes','width=650,height=760');
$('#battle').onclick=()=>document.body.classList.contains('battle-active')?closeActivity():openActivity('battle');
$('#self-study').onclick=()=>{const p=pages[current];if(isTeacher||p.assessment||['P0','P3','P4','P5'].includes(p.printId))return;openActivity('self-flow',false,(host,ctx)=>{$('#activity-title').textContent='스스로 공부하기';return mountSelfFlow(host,ctx,p);});};
$('#edition').onchange=e=>{stopVoice();const url=new URL(location.href);url.searchParams.set('edition',e.target.value);url.searchParams.delete('s');url.searchParams.set('page',String(current));location.href=url.href;};
$('#start').onclick=()=>{if(isStudent)studentEngaged=true;return reading?stopVoice():narrateCurrent();};$('#read-text').onclick=()=>isStudent?toggleStudentZoom():openActivity('reading');
$('#guide-action').onclick=()=>{if(!isStudent)return;const {guideAction,guideKind}=$('#guide-action').dataset;if(guideAction==='next')navigate(current+1,{animated:true});else if(guideAction==='activity'&&guideKind)openActivity(guideKind,['watch','balance','spring-film'].includes(guideKind));else if(guideAction==='assessment')openActivity('assessment');else if(guideAction==='grade')grade(pages[current].printId.toLowerCase());else if(guideAction==='remedy')openRemedy(pages[current].lesson||1);};
$('#sound').onclick=()=>{sound=!sound;save('sound',sound);$('#sound').setAttribute('aria-pressed',sound);$('#sound').textContent=sound?'소리 켬':'소리 끔';if(!sound)stopVoice();};
$('#prev').onclick=()=>navigate(current-1,{animated:true});$('#next').onclick=()=>navigate(current+1,{animated:true});$('#page-select').onchange=e=>navigate(+e.target.value);$$('button[data-lesson]').forEach(b=>b.onclick=()=>navigate(pages.findIndex(p=>p.lesson===+b.dataset.lesson)));
$('#spread').onclick=()=>{wantSpread=!wantSpread;save('spread:'+edition,wantSpread);$('#spread').setAttribute('aria-pressed',wantSpread);$('#spread').textContent=wantSpread?'펼침 보기':'한 쪽 보기';buildBook();};
$('#motion').onclick=()=>{motion=!motion;save('motion',motion);$('#motion').setAttribute('aria-pressed',motion);$('#motion').textContent=motion?'책넘김 켬':'책넘김 끔';};
$('#teacher').onclick=()=>{if(!isTeacher)return;keysVisible=!keysVisible;document.body.classList.toggle('teacher-mode',keysVisible);$('#teacher').setAttribute('aria-pressed',keysVisible);$('#teacher').textContent=keysVisible?'교안·정답 숨기기':'교안·정답 공개';buildBook();updateMeta();if(keysVisible)openActivity('reading');else closeActivity();};
$('#character').onclick=()=>{showCharacter=!showCharacter;save('character',showCharacter);document.body.classList.toggle('hide-character',!showCharacter);$('#character').setAttribute('aria-pressed',showCharacter);$('#character').textContent=showCharacter?'우루사쌤 표시':'우루사쌤 숨김';fit();};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();fit();}catch{toast('브라우저 전체화면 권한이 없습니다. 현재 화면 맞춤은 유지합니다.');}};
$('#print').onclick=()=>{printBuild();window.print();};
document.addEventListener('beforeprint',()=>{});
window.addEventListener('beforeprint',()=>{document.body.classList.toggle('teacher-mode',isTeacher);});
window.addEventListener('afterprint',()=>{document.body.classList.toggle('teacher-mode',isTeacher&&keysVisible);});$('#source').onclick=()=>openActivity('source');$('#credits').onclick=()=>openActivity('credits');$('#focus-reading').onclick=()=>isStudent?toggleStudentZoom():openActivity('reading');$('#close-activity').onclick=closeActivity;
document.addEventListener('submit',e=>e.preventDefault());
document.addEventListener('input',e=>{if(e.target.matches('[data-answer-field]'))collectField(e.target);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action],[data-grade],[data-reveal],[data-quick]');if(!b||b.closest('#print-root'))return;if(b.dataset.action){const page=b.closest('[data-book-page]');if(page){current=+page.dataset.bookPage;updateMeta();}openActivity(b.dataset.action);}if(b.dataset.grade)grade(b.dataset.grade);if(b.dataset.reveal){b.textContent=b.dataset.reveal;toast('탄성: 원래 모양으로 돌아가려는 성질');}if(b.dataset.quick){const r=b.closest('.inquiry').querySelector('.quick-result');r.textContent=b.dataset.quick==='비례'?'표와 그래프에서 비례 관계를 확인했어요.':'같은 배수로 늘어나는 관계인지 다시 살펴보세요.';}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#workspace').classList.contains('active'))closeActivity();else stopVoice();return;}if(e.target.closest('input,select,textarea,button,a')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowRight')navigate(current+1,{animated:true});if(e.key==='ArrowLeft')navigate(current-1,{animated:true});});
const ro=new ResizeObserver(fit);ro.observe($('#book-space'));let lastCompact=innerWidth<=1000;addEventListener('resize',()=>{const compact=innerWidth<=1000;if(compact!==lastCompact){lastCompact=compact;buildBook();}else fit();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopVoice();document.querySelectorAll('video').forEach(v=>v.pause());}});addEventListener('pagehide',()=>{stopVoice();clearPageSpeech();clearActivitySpeech();clearPagePhoto();clearActivityPhoto();activity?.destroy();ro.disconnect();});
document.addEventListener('keydown',e=>{if(!e.target.matches('.story-video[data-action]')||!['Enter',' '].includes(e.key))return;e.preventDefault();e.target.click();});
if(!writable)toast('이 브라우저는 기록을 저장하지 못합니다. 중복 방지를 위해 새 유사문제 선택은 중단합니다.');

window.__sample={pages,questions,answers,results,navigate,open:openActivity,close:closeActivity,grade,report:openDailyReport,remedy:openRemedy,remedyLog,printBuild,get current(){return current},get book(){return book},get writable(){return writable},get edition(){return edition},get teacher(){return isTeacher},save,load};
document.documentElement.dataset.ready='true';

// QR deep links open the matching activity, not a menu. No unsolicited audio.
if(entryParams.get('activity')&&activityNames[entryParams.get('activity')])openActivity(entryParams.get('activity'));
else if(entryParams.get('lab')==='1')openActivity(pages[current].action);
