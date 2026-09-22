import {parts, stages, daily, clamp, scaleReading, projection, gradeDaily} from './ch01-model.js';
import {createAvatar} from './avatar.js';
const clearConceptReview = host => {host?.querySelector('#concept-review')?.remove();host?.querySelector('#mixed-practice')?.remove();host?.querySelector('[data-mixed-open]')?.remove();};
async function openConceptReview(id) {
 try {
  const {mountConceptReview}=await import('./remediation-ui.js');
  if(step===7&&submitted&&(!teacher||daily[dailyIndex].id===id))mountConceptReview({host:$('#content'),values,teacher,activeId:id,onRevisit:go});
 } catch { const status=$('#daily-status');if(status)status.textContent='추가 연습을 불러오지 못했어요. 원본 풀이와 관련 실험은 계속 사용할 수 있어요.'; }
}
async function openMixedPractice() {
 try{const {mountMixedPractice}=await import('./mixed-practice-ui.js');if(step===7&&submitted)await mountMixedPractice({host:$('#content'),teacher,onRevisit:go});}
 catch{const status=$('#daily-status');if(status)status.textContent='변형 이력을 확인할 수 없어 새 문제 선택을 멈췄어요. 원본 풀이는 계속 확인할 수 있어요.';}
}
const $ = s => document.querySelector(s);
const teacher = document.body.dataset.mode === 'lecture';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const requested = new URLSearchParams(location.search).get('stage');
let step = Math.max(0, stages.findIndex(s=>s.id===requested)), force = 0, zero = 4, eye = 0;
let settling = false, motionFrame = 0, demoTimers = [], demoActive = false, submitted = false, currentPart = '', pen = false, penPointer = null, dailyIndex = 0;
const strokes = new Map(), values = {}, results = new Map();
const storageKey = 'msg-ch01-daily-first-attempt-v1';
const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.title = `${teacher?'전자칠판 강의':'학생 자습'} | 초과심_물리 | MSG 사이언스 랩`;
$('#app').innerHTML = `<a class="skip" href="#stage">수업으로 건너뛰기</a>
<header class="site-head"><a class="brand" href="./index.html"><img src="./assets/msg-logo.png" alt="MSG"><span>사이언스 랩</span></a><nav aria-label="학습 방식"><a href="./student.html" ${!teacher?'aria-current="page"':''}>학생 자습</a><a href="./lecture.html" ${teacher?'aria-current="page"':''}>전자칠판 강의</a></nav><a class="quiet-link" href="./character.html">캐릭터 시연</a></header>
<main><div class="bookline"><span>초과심_물리</span><span>PART I 무게 재기</span><span>CHAPTER 01</span></div><div class="chapter-head"><h1>용수철저울의 구조 익히기</h1><span>${teacher?'함께 탐구하는 수업':'직접 해 보는 과학'}</span></div>
<nav class="stages" aria-label="수업 단계">${stages.map((s,i)=>`<button data-stage="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.label}</button>`).join('')}</nav>
<div class="board-tools" ${teacher?'':'hidden'}><button id="pen" aria-pressed="false">펜 판서</button><button id="undo">한 획 취소</button><button id="clear-ink">이 장 판서 지우기</button><button id="fullscreen">전체 화면</button><span id="pen-status">실험 조작 모드</span></div>
<section id="stage" aria-labelledby="stage-title"><div class="stage-heading"><div><p id="source-page"></p><h2 id="stage-title"></h2></div><button id="reset-stage">이 장 초기화</button></div><div id="content"></div><svg id="ink" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-label="교실 판서 영역"></svg></section>
<section class="explain"><div class="coach"><div id="coach-avatar"></div><div><span>함께 생각해요</span><p id="prompt"></p></div></div><div class="reveal-area"><button id="reveal">${teacher?'설명 공개':'생각의 힌트'}</button><p id="explanation" hidden></p></div></section>
<footer class="lesson-controls"><button id="prev">이전</button><span id="step-counter"></span><button id="next" class="primary">다음</button></footer>
<details class="source-notes"><summary>교재 출처와 시범 수업 안내</summary><p>본문 10~15쪽을 바탕으로 한 CHAPTER 01 시범 수업입니다. 일일평가 6문항은 교재 문항이며, 그 밖의 조작 실험은 원리를 설명하는 가상 모형입니다. 단원평가 20문항은 별도 평가로 남겨 두었습니다.</p><p>가상 저울의 범위 0~30 N, 한 눈금 2 N은 이 실험의 설정입니다. 실제 교구의 규격과 같다는 뜻이 아닙니다. 원본 역사·미래 읽기 자료는 교재에서 확인합니다.</p><p>현재 캐릭터 음성과 실제 촬영 영상은 연결 전입니다. 움직이는 장면은 무음 가상 실험입니다. 자습 답안은 이 기기의 브라우저에만 저장하며 외부로 전송하지 않습니다.</p><a href="https://drive.google.com/file/d/1oatstBXJS3VBsSqT0v2VnA67wDktBWSt/view" target="_blank" rel="noopener">원본 교재 열기</a></details></main>`;
const avatar = createAvatar($('#coach-avatar'));
function notify(message) { const target=$('#lab-status'); if(target) target.textContent=message; }
function stopMotion() { cancelAnimationFrame(motionFrame); motionFrame=0; settling=false; }
function stopDemo() { demoTimers.forEach(clearTimeout); demoTimers=[]; demoActive=false; const b=$('#demo'); if(b) b.textContent='움직이는 시연'; }
function stopAll() {stopMotion();stopDemo();}
function bodySvg(labels = false) {
 const tick = Array.from({length:16},(_,i)=>`<path d="M326 ${205+i*8}h${i%5===0?33:19}" stroke="#45617a" stroke-width="2"/>${i%5===0?`<text x="368" y="${211+i*8}">${i*2}</text>`:''}`).join('');
 return `<svg class="scale-art" viewBox="0 0 660 660" role="img" aria-label="용수철저울 내부 모형, 눈금 단위 뉴턴"><defs><linearGradient id="case-metal"><stop stop-color="#d4e3e8"/><stop offset=".4" stop-color="#fff"/><stop offset="1" stop-color="#9fb8c8"/></linearGradient></defs>
 <path d="M102 642H458M139 642V37H318" stroke="#6a8293" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M282 79V42a27 27 0 0 1 54 0v37" fill="none" stroke="#183e59" stroke-width="6"/>
 <rect x="260" y="76" width="146" height="330" rx="28" fill="url(#case-metal)" stroke="#93aaba" stroke-width="2"/><rect x="273" y="92" width="120" height="292" rx="14" fill="#f7fbff"/><path d="M317 95v28" stroke="#527083" stroke-width="6"/>
 <g id="zero-knob" transform="rotate(0 317 105)"><rect x="290" y="89" width="54" height="29" rx="5" fill="#5bbcc0" stroke="#17475c" stroke-width="3"/><path d="M296 96h42M296 106h42" stroke="#17475c" stroke-width="2"/></g>
 <path id="coil" fill="none" stroke="#416c86" stroke-width="5" stroke-linejoin="round"/><text x="364" y="181" font-size="19">N</text>${tick}
 <g id="pointer"><path d="M283 208.5H358" stroke="#ecae44" stroke-width="7"/><path d="M296 212V397" stroke="#247791" stroke-width="8"/><path d="M296 397v12q20 22 7 27q-15 6-16-9" fill="none" stroke="#274a64" stroke-width="5"/></g>
 <g id="load"><path d="M303 510v12" stroke="#24415a" stroke-width="3"/><rect x="266" y="520" width="74" height="51" rx="9" fill="#88745c"/><text id="load-text" x="303" y="552" text-anchor="middle" fill="#fff" font-size="20"></text></g>
 ${labels?'':'<text x="465" y="90" font-size="17">내부 모형</text><text x="465" y="120" font-size="17">측정 범위 30 N</text>'}
 ${labels?parts.map(([id,name],i)=>{const pos={handle:[309,49,434,42],zero:[317,103,437,166],spring:[302,162,18,194],pointer:[320,205,437,263],scale:[352,285,440,364],hook:[303,436,25,443]}[id];return `<g class="part-target" data-part="${id}" role="button" tabindex="0" aria-label="${name}"><path d="M${pos[0]} ${pos[1]}L${pos[2]+(pos[2]<100?152:0)} ${pos[3]+27}" stroke="#5a9aab" stroke-width="2"/><rect x="${pos[2]}" y="${pos[3]}" width="180" height="54" rx="7"/><text x="${pos[2]+90}" y="${pos[3]+34}" text-anchor="middle">${name}</text></g>`;}).join(''):''}</svg>`;
}
function drawScale(oscillation=0) {
 const pointer=$('#pointer'); if(!pointer)return;
 const value = force + zero + oscillation, displacement = value*4, y = 205+displacement;
 // The pointer's top edge, rigid rod, hook and weight share one displacement.
 pointer.setAttribute('transform',`translate(0 ${displacement})`);
 $('#load').setAttribute('transform',`translate(0 ${displacement-74})`);
 $('#load').style.display=force?'':'none'; $('#load-text').textContent=`${force} N`;
 let d='M302 123';for(let i=0;i<14;i++)d+=` L${i%2?289:315} ${126+(y-136)*(i+1)/14}`;d+=` L302 ${y}`;$('#coil').setAttribute('d',d);
 const reading=$('#reading');if(reading)reading.textContent=settling?'관찰 중':`${(force+zero).toFixed(0)} N`;
 if($('#read-value'))$('#read-value').disabled=settling;
 if($('#zero-value'))$('#zero-value').textContent=`${zero} N`;
 if($('#zero-slider'))$('#zero-slider').value=zero;
 if($('#zero-knob'))$('#zero-knob').setAttribute('transform',`rotate(${zero*20} 317 105)`);
}
function setForce(value) {
 if(scaleReading(value).overload){notify('측정 범위 30 N을 넘어요. 이 저울에는 매달지 않습니다.');return;}
 stopMotion();force=value;settling=force>0&&!reduced.matches;
 document.querySelectorAll('[data-load]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.load)===force)));
 const start=performance.now();
 const animate=now=>{const elapsed=(now-start)/1000; if(elapsed>1.8||reduced.matches){settling=false;drawScale();notify(force?'표시자가 멈췄어요. 눈높이를 맞추고 읽어 보세요.':'물체를 뺐어요. 영점을 다시 확인할 수 있어요.');return;}drawScale(Math.sin(elapsed*18)*2.2*Math.exp(-elapsed*2.4));motionFrame=requestAnimationFrame(animate);};
 drawScale();if(settling){notify('표시자가 흔들리고 있어요. 잠시 기다려요.');motionFrame=requestAnimationFrame(animate);}else notify(force?'표시자가 멈췄어요. 눈높이를 맞추고 읽어 보세요.':'물체를 뺐어요.');
}
function eyeSvg() {return `<svg class="eye-art" viewBox="0 0 640 480" role="img" aria-label="눈금판 앞에 있는 표시자와 보는 눈높이의 관계"><rect x="250" y="65" width="98" height="352" rx="9" fill="#e5eff2"/>${Array.from({length:16},(_,i)=>`<path d="M295 ${140+i*14}h${i%5?16:30}" stroke="#173d58" stroke-width="2"/>${i%5===0?`<text x="255" y="${147+i*14}">${i*2}</text>`:''}`).join('')}<text x="271" y="109">N</text><path d="M250 280h98" stroke="#8d9fa8" stroke-dasharray="5 5"/><g id="eye-projection"><path id="sightline" stroke="#cc8142" stroke-width="3" stroke-dasharray="8 4"/><circle id="apparent-dot" cx="316" r="7" fill="#cc8142"/><g id="eye-icon"><path d="M475 0q25-24 50 0q-25 24-50 0" fill="white" stroke="#153f58" stroke-width="3"/><circle cx="500" r="8" fill="#153f58"/></g></g><path id="eye-pointer" d="M348 284h54" stroke="#2b8396" stroke-width="8"/><text x="369" y="315" font-size="18">표시자 윗부분</text><text x="48" y="435" font-size="19">눈금판과 표시자 사이 간격을 확대한 가상 모형</text></svg>`;}
function drawEye() {const p=projection(eye);$('#eye-icon').setAttribute('transform',`translate(0 ${p.eyeY})`);$('#apparent-dot').setAttribute('cy',p.apparentY);$('#sightline').setAttribute('d',`M508 ${p.eyeY}L316 ${p.apparentY}`);$('#eye-reading').textContent=`${scaleReading(20,0,eye).apparent} N`;$('#eye-description').textContent=eye===0?'표시자의 윗부분과 눈높이가 같아요.':eye>0?'위를 선택했어요. 물체는 그대로인데 더 큰 눈금을 읽게 돼요.':'아래를 선택했어요. 물체는 그대로인데 더 작은 눈금을 읽게 돼요.';document.querySelectorAll('[data-eye]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.eye)===eye)));}
function labHtml(kind) {return `<div class="lab-grid"><div class="instrument">${bodySvg(kind==='parts')}</div><div class="lab-controls">${kind==='parts'?`<p class="activity-label">부품 탐색</p><h3 id="part-name">어느 부분을 살펴볼까요?</h3><p id="part-detail">왼쪽 부품 이름을 터치해 보세요. 키보드로도 선택할 수 있어요.</p><div class="part-list">${parts.map(([id,name])=>`<button data-part="${id}">${name}</button>`).join('')}</div>`:kind==='zero'?`<p class="activity-label">물체를 달기 전</p><h3>표시자의 윗부분을 0에</h3><output id="zero-value">4 N</output><label for="zero-slider">영점조절나사</label><input id="zero-slider" type="range" min="-6" max="6" step="2" value="4"><div class="paired"><button data-zero="-2">− 조절</button><button data-zero="2">＋ 조절</button></div><button id="check-zero" class="primary">0에 맞췄어요</button>`:`<p class="activity-label">영점을 맞춘 저울</p><h3>물체를 고리에 걸어 보세요</h3><div class="weights">${[0,10,20,30,40].map(n=>`<button data-load="${n}" aria-pressed="${n===0}">${n?n+' N':'물체 빼기'}</button>`).join('')}</div><div class="measurement"><span>표시자가 가리키는 눈금</span><output id="reading">0 N</output></div><button id="read-value" class="primary">눈금 읽기</button><button id="demo">움직이는 시연</button><p id="demo-caption">가상 모형 · 무음</p>`}<p id="lab-status" role="status"></p><p class="fine">가상 저울 0~30 N · 한 눈금 2 N<br>교재의 실제 교구와 규격이 같다는 뜻은 아닙니다.</p></div></div>`;}
function dailyHtml(){return `<p class="daily-intro">교재 15쪽 daily test · 원본 6문항<br><span>구조와 눈높이 그림은 원본에서 가져왔습니다. 답은 제출 전까지 보이지 않습니다.</span></p><form id="daily-form">${daily.map((q,i)=>`<fieldset data-question="${q.id}"><legend><strong>${String(i+1).padStart(2,'0')}</strong> ${q.prompt}</legend>${q.kind==='parts'?`<div class="parts-question"><img src="./assets/ch01/daily-parts.png" alt="용수철저울 각 부분을 ㄱ, ㄴ, ㄷ, ㄹ로 표시한 원본 그림"><div>${['ㄱ','ㄴ','ㄷ','ㄹ'].map((label,j)=>`<label>${label}<input name="d1-${j}" maxlength="30" autocomplete="off" aria-label="1번 ${label} 부분의 이름" value="${esc(values.d1?.[j]||'')}"></label>`).join('')}</div></div>`:q.kind==='eye'?`<img class="question-eye" src="./assets/ch01/daily-eye.png" alt="표시자 위 ㄱ, 같은 높이 ㄴ, 아래 ㄷ의 눈높이 원본 그림"><label class="written">기호<input name="d4" maxlength="10" autocomplete="off" value="${esc(values.d4||'')}"></label>`:`${q.passage?`<p class="passage">${q.passage}</p>`:''}${q.options?`<div class="choices">${q.options.map((o,j)=>`<label><input type="radio" name="${q.id}" value="${j}" ${values[q.id]===String(j)?'checked':''}><span>${q.id==='d2'?['①','②','③','④','⑤'][j]+' ':''}${o}</span></label>`).join('')}</div>`:`<label class="written">답<input name="${q.id}" maxlength="30" autocomplete="off" value="${esc(values[q.id]||'')}"></label>`}`}
<div class="question-feedback" id="feedback-${q.id}" hidden></div></fieldset>`).join('')}<div class="submit-row"><button type="submit" class="primary">${teacher?'정답·풀이 공개':'답 제출하고 확인'}</button><button type="button" id="retry">다시 풀기</button><p id="daily-status" role="status"></p></div></form>`;}
function renderStage(reset=true){
 stopAll();pen=false;$('#pen').setAttribute('aria-pressed','false');$('#ink').classList.remove('writing');$('#pen-status').textContent='실험 조작 모드';
 if(reset){force=0;zero=step===2?4:0;eye=0;currentPart='';}
 const s=stages[step];$('#source-page').textContent=`교재 ${s.page}쪽`;$('#stage-title').textContent=s.title;$('#prompt').textContent=s.prompt;$('#explanation').hidden=true;$('#explanation').textContent='';$('#reveal').textContent=teacher?'설명 공개':'생각의 힌트';$('#reveal').hidden=s.id==='daily';
 $('#prev').disabled=step===0;$('#next').disabled=step===stages.length-1;$('#step-counter').textContent=`${step+1} / ${stages.length}`;
 document.querySelectorAll('[data-stage]').forEach(b=>{if(Number(b.dataset.stage)===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 avatar.setMood(['predict','daily','eye'].includes(s.id)?'question':'welcome');avatar.close();
 let html='';
 if(s.id==='predict')html=`<div class="opening"><div><p class="activity-label">오늘의 질문</p><h3>같은 물체를 들었는데<br>왜 느낌이 다를까요?</h3><p>친구와 먼저 예상해 보세요.<br>정확하게 비교할 방법을 찾아봅시다.</p><div class="prediction"><button data-predict="same">같게 느껴요</button><button data-predict="different">다르게 느낄 수도 있어요</button></div><p id="prediction-result" role="status"></p></div><div class="opening-instrument">${bodySvg()}</div></div>`;
 if(['parts','zero','measure'].includes(s.id))html=labHtml(s.id);
 if(s.id==='eye')html=`<div class="lab-grid"><div class="instrument">${eyeSvg()}</div><div class="lab-controls"><p class="activity-label">물체의 힘은 그대로 20 N</p><h3>눈높이를 바꿔 보세요</h3><div class="eye-options"><button data-eye="1">위에서 보기</button><button data-eye="0" aria-pressed="true">같은 높이에서 보기</button><button data-eye="-1">아래에서 보기</button></div><div class="measurement"><span>이 모형에서 보이는 눈금</span><output id="eye-reading">20 N</output></div><p id="eye-description" role="status"></p><p class="fine">시차를 설명하도록 눈금판과 표시자 간격을 확대했습니다. 18·20·22 N은 이 모형의 예시이며 교재 그림의 수치를 바꾸지 않습니다.</p></div></div>`;
 if(s.id==='types')html=`<div class="types-lesson"><h3>어느 저울을 사용할까요?</h3><p>용도를 선택하면 교재의 사용 방법을 확인할 수 있어요.</p><div class="type-options"><button data-type="0">실험용 추</button><button data-type="1">채소</button><button data-type="2">사람의 몸</button></div><div id="type-detail" role="status">용도를 하나 선택해 보세요.</div><p class="fine">교재 12쪽의 용수철저울·앉은뱅이저울·체중계 비교 활동</p></div>`;
 if(s.id==='story')html=`<div class="story"><p class="activity-label">교재와 함께 읽기</p><h3>용수철의 과거와 미래</h3><p>13쪽: 용수철의 이름이 붙여진 유래와 과거</p><p>14쪽: 코일 형태 용수철의 등장과 미래</p><a class="button primary" href="https://drive.google.com/file/d/1oatstBXJS3VBsSqT0v2VnA67wDktBWSt/view" target="_blank" rel="noopener">교재 13~14쪽 읽기</a><label for="story-note">우리 주변의 용수철을 쓰는 도구와 그 역할<textarea id="story-note" rows="3" maxlength="500" placeholder="교재를 읽고 내 말로 설명해 보세요."></textarea></label><p class="fine">이 글은 자동 채점하지 않습니다. 읽기 내용과 생각을 친구와 비교해 보세요.</p></div>`;
 if(s.id==='daily')html=dailyHtml();
 $('#content').innerHTML=html;drawScale();if(s.id==='eye')drawEye();drawInk();bindStage();
 if(teacher&&s.id==='daily')setupQuestionNavigation();
 if(teacher){const note=document.createElement('details');note.className='teacher-note';const sum=document.createElement('summary');sum.textContent='강사 진행 메모';const p=document.createElement('p');p.textContent=s.teacher;note.append(sum,p);$('#content').append(note);}
}
function bindStage(){
 document.querySelectorAll('[data-part]').forEach(b=>{const select=()=>{currentPart=b.dataset.part;const p=parts.find(p=>p[0]===currentPart);$('#part-name').textContent=p[1];$('#part-detail').textContent=p[2];document.querySelectorAll('[data-part]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.part===currentPart)));avatar.setMood('explain');avatar.close();};b.addEventListener('click',select);if(b.tagName.toLowerCase()==='g')b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});});
 document.querySelectorAll('[data-zero]').forEach(b=>b.onclick=()=>{zero=clamp(zero+Number(b.dataset.zero),-6,6);drawScale();notify('표시자의 윗부분과 0 눈금을 비교해 보세요.');});
 if($('#zero-slider'))$('#zero-slider').oninput=e=>{zero=Number(e.target.value);drawScale();};
 if($('#check-zero'))$('#check-zero').onclick=()=>{notify(zero===0?'맞아요. 영점이 맞았어요. 이제 물체를 매달 수 있어요.':'아직 0이 아니에요. 물체 없이 나사를 다시 조절해 보세요.');avatar.setMood(zero===0?'praise':'question');avatar.close();};
 document.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{stopDemo();setForce(Number(b.dataset.load));});
 if($('#read-value'))$('#read-value').onclick=()=>notify(`표시자의 윗부분과 눈높이를 맞추면 ${force+zero} N입니다.`);
 if($('#demo'))$('#demo').onclick=()=>{if(demoActive){stopAll();drawScale();$('#demo-caption').textContent='시연 정지 · 직접 조작할 수 있어요.';return;}stopAll();demoActive=true;force=0;zero=0;drawScale();$('#demo').textContent='시연 정지';$('#demo-caption').textContent='먼저 예상해 보세요. 물체를 달면 무엇이 움직일까요?';demoTimers.push(setTimeout(()=>{setForce(20);$('#demo-caption').textContent='물체를 달았어요. 표시자가 멈출 때까지 기다려요.';},2200),setTimeout(()=>{$('#demo-caption').textContent='이제 눈높이를 맞춰 20 N을 읽어요.';},4400),setTimeout(()=>{stopDemo();$('#demo-caption').textContent='친구가 직접 같은 순서로 측정해 보세요.';},8000));};
 document.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{eye=Number(b.dataset.eye);drawEye();});
 document.querySelectorAll('[data-predict]').forEach(b=>b.onclick=()=>{$('#prediction-result').textContent='예상을 골랐어요. 그렇게 생각한 이유를 말하고 저울로 확인해 봅시다.';document.querySelectorAll('[data-predict]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));});
 document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{const texts=['용수철저울: 물체를 고리에 걸어요. 물체가 없을 때 0인지 확인하고, 표시자가 멈추면 눈높이를 맞춰 읽어요.','앉은뱅이저울: 물체를 접시 위에 올려요. 빈 접시에서 0인지 확인하고, 바늘이 멈추면 끝이 가리키는 눈금을 읽어요.','체중계: 사람의 몸을 재요. 사용 전 0을 확인하고, 바늘 또는 숫자가 더 이상 변하지 않을 때 읽어요.'];$('#type-detail').textContent=texts[Number(b.dataset.type)];document.querySelectorAll('[data-type]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));});
 if($('#daily-form')){submitted=false;$('#daily-form').oninput=readAnswers;$('#daily-form').onsubmit=e=>{e.preventDefault();readAnswers();if(!teacher&&daily.some(q=>Array.isArray(q.answer)?q.answer.some((_,i)=>!values[q.id]?.[i]?.trim()):!String(values[q.id]??'').trim())){$('#daily-status').textContent='빈 답이 있어요. 모든 문항에 답한 뒤 제출해 주세요.';return;}
 const graded=gradeDaily(values);graded.forEach(r=>results.set(r.id,r.correct));submitted=true;
 clearConceptReview($('#content'));
 daily.forEach((q,i)=>{const box=$(`#feedback-${q.id}`);box.hidden=teacher&&i!==dailyIndex;box.innerHTML=`<strong>${teacher?'풀이':results.get(q.id)?'맞았어요':'다시 살펴봐요'}</strong><p>${q.explanation}</p><button type="button" data-revisit="${q.revisit}">관련 실험 다시 보기</button> <button type="button" data-concept-review="${q.id}">${teacher?'확인 질문·유사문제 열기':'이 개념 다시 확인'}</button>`;});
 document.querySelectorAll('[data-concept-review]').forEach(b=>b.onclick=()=>openConceptReview(b.dataset.conceptReview));
 document.querySelectorAll('[data-revisit]').forEach(b=>b.onclick=()=>go(Number(b.dataset.revisit)));
 $('#daily-status').textContent=teacher?'교사가 풀이를 공개했습니다.':`${graded.filter(r=>r.correct).length} / 6 문항 정답 · 설명도 확인해 보세요.`;
 $('#content').querySelector('[data-mixed-open]')?.remove();
 const mixButton=document.createElement('button');mixButton.type='button';mixButton.dataset.mixedOpen='';mixButton.textContent='유사문제 섞어 확인 · 중복 없음';mixButton.className='mixed-open';mixButton.onclick=openMixedPractice;$('#daily-form').after(mixButton);
 if(!teacher){try{if(!localStorage.getItem(storageKey))localStorage.setItem(storageKey,JSON.stringify({at:new Date().toISOString(),results:graded,values}));}catch{$('#daily-status').textContent+=' 이 브라우저에서는 기록을 저장하지 못했습니다.';}}
 };$('#retry').onclick=()=>{Object.keys(values).forEach(k=>delete values[k]);renderStage();};}
}
function readAnswers(){const f=$('#daily-form');if(!f)return;const data=new FormData(f);values.d1=[0,1,2,3].map(i=>String(data.get(`d1-${i}`)||''));daily.slice(1).forEach(q=>values[q.id]=String(data.get(q.id)||''));if(submitted){clearConceptReview($('#content'));document.querySelectorAll('.question-feedback').forEach(el=>el.hidden=true);$('#daily-status').textContent='답이 바뀌었어요. 다시 제출해 주세요.';submitted=false;}}
function go(n){readAnswers();step=clamp(n,0,stages.length-1);renderStage();history.replaceState(null,'',`${location.pathname}?stage=${stages[step].id}`);}
function setupQuestionNavigation(){const nav=document.createElement('nav');nav.className='question-nav';nav.setAttribute('aria-label','일일평가 문제 선택');nav.innerHTML=daily.map((q,i)=>`<button type="button" data-question-index="${i}">${i+1}번</button>`).join('');$('#daily-form').before(nav);nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{dailyIndex=Number(b.dataset.questionIndex);document.querySelectorAll('.question-feedback').forEach(el=>el.hidden=true);$('#daily-status').textContent='';showQuestion();});$('#daily-form button[type=submit]').textContent='이 문제 풀이 공개';showQuestion();}
function showQuestion(){clearConceptReview($('#content'));document.querySelectorAll('#daily-form fieldset').forEach((el,i)=>el.hidden=i!==dailyIndex);document.querySelectorAll('[data-question-index]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.questionIndex)===dailyIndex)));penPointer=null;drawInk();}
const inkKey=()=>teacher&&step===7?`daily-${dailyIndex}`:step;
function drawInk(){const list=strokes.get(inkKey())||[];$('#ink').innerHTML=list.map(points=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#bf4c38" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('');}
$('#ink').addEventListener('pointerdown',e=>{if(!pen||penPointer!==null)return;e.preventDefault();penPointer=e.pointerId;$('#ink').setPointerCapture(e.pointerId);const list=strokes.get(inkKey())||[];list.push([]);strokes.set(inkKey(),list);addPoint(e);});
function addPoint(e){if(e.pointerId!==penPointer)return;const r=$('#ink').getBoundingClientRect();strokes.get(inkKey()).at(-1).push([Math.round((e.clientX-r.x)/r.width*1000),Math.round((e.clientY-r.y)/r.height*700)]);drawInk();}
$('#ink').addEventListener('pointermove',addPoint);for(const name of ['pointerup','pointercancel','lostpointercapture'])$('#ink').addEventListener(name,()=>penPointer=null);
$('#pen').onclick=()=>{pen=!pen;penPointer=null;$('#ink').classList.toggle('writing',pen);$('#pen').setAttribute('aria-pressed',String(pen));$('#pen-status').textContent=pen?'판서 모드 · 실험 조작 잠금':'실험 조작 모드';};
$('#undo').onclick=()=>{strokes.get(inkKey())?.pop();drawInk();};$('#clear-ink').onclick=()=>{strokes.set(inkKey(),[]);drawInk();};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#pen-status').textContent='전체 화면을 열 수 없습니다. 브라우저의 전체 화면 기능을 사용해 주세요.';}};
$('#reveal').onclick=()=>{const p=$('#explanation');p.hidden=!p.hidden;p.textContent=p.hidden?'':stages[step].answer;$('#reveal').textContent=p.hidden?(teacher?'설명 공개':'생각의 힌트'):'설명 숨기기';};
$('#prev').onclick=()=>go(step-1);$('#next').onclick=()=>go(step+1);document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>go(Number(b.dataset.stage)));
$('#reset-stage').onclick=()=>{if(step===7)Object.keys(values).forEach(k=>delete values[k]);strokes.set(inkKey(),[]);renderStage();};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(e.target.tagName)||e.ctrlKey||e.altKey||e.metaKey)return;if(e.key==='ArrowRight')go(step+1);if(e.key==='ArrowLeft')go(step-1);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAll();drawScale();}});reduced.addEventListener('change',()=>{stopMotion();drawScale();});window.addEventListener('pagehide',()=>{stopAll();avatar.destroy();});
renderStage();
