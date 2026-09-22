import {parts,daily} from './ch01-model.js';
import {createAvatar} from './avatar.js';
import {mountSpringScale} from './spring-scale-3d.js';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const teacherNotes=[
  '손으로 든 느낌과 측정값의 차이를 먼저 말하게 합니다.',
  '부품 이름을 외우기보다 “없으면 무엇이 안 되는가”를 설명하게 합니다.',
  '영점은 물체를 달기 전에 맞춥니다. 표시자의 윗부분을 기준으로 읽습니다.',
  '흔들림이 멈춘 뒤 읽고, 측정 범위를 넘는 물체는 달지 않습니다.',
  '눈높이는 표시자의 윗부분과 같은 높이. 위·아래에서 본 값은 시차 때문에 달라집니다.',
  '저울마다 쓰임이 다르지만 사용 전 0 확인과 표시가 안정된 뒤 읽기는 공통입니다.',
  '원본 13~14쪽을 읽고 용수철의 쓰임을 생활 속 도구와 연결합니다.',
  '원본 일일평가 6문항. 제출 전 정답은 공개하지 않습니다.'
];

function pageShell(pageNo,title,body,teacher=''){
  return `<article class="book-page" data-page="${pageNo}">
    <header class="page-band"><span class="chapter-no">01</span><h2>${title}</h2><span>초과심_물리 · PART I 무게 재기</span></header>
    ${body}
    <div class="teacher-note"><b>교사용 진행 포인트</b><br>${esc(teacher)}</div>
    <footer class="page-foot"><strong>MSG SCIENCE LAB</strong><span>${pageNo}</span></footer>
  </article>`;
}

function buildPages(){
  const p=[];
  p.push(pageShell(10,'용수철저울의 구조 익히기',`
    <p class="page-kicker">CHAPTER 01 · 살아있는 교재</p>
    <h1>손으로 어림한 무게,<br>정확하게 비교할 수 있을까요?</h1>
    <p class="lead">먼저 예상하고, 영상과 3D 실험으로 확인한 뒤 교재의 문제를 풀어 봅시다.</p>
    <div class="book-grid equal">
      <div class="video-panel">
        <video controls playsinline preload="metadata" src="./output/msg-character-motion-preview.mp4"></video>
        <div class="video-copy"><b>우루사쌤과 시작하기</b><span>영상이 끝나면 물체의 무게를 예상해 보세요.</span></div>
      </div>
      <div>
        <div class="concept-movie" data-movie><div class="ball"></div><div class="arrow"></div><div class="unit">N</div><div class="caption">물체를 아래로 끌어당기는 힘을 저울로 재고 N(뉴턴)으로 나타내요.</div></div>
        <div class="action-row"><button data-play-movie>▶ 무게·힘·단위 애니메이션</button><button class="secondary" data-audio="./assets/audio/docssam-predict.wav">🔊 우루사쌤 질문 듣기</button></div>
      </div>
    </div>
    <div class="book-box question"><h3>미리 생각하기</h3><p>같은 물체를 들어도 사람마다 무겁다고 느끼는 정도가 같을까요?</p><div class="answer-line"></div><div class="answer-line"></div></div>
    <div class="book-box expansion"><p>교실에 있는 두 물체를 골라 어느 것이 더 무거울지 예상해 보세요. 다음 페이지의 3D 저울로 확인합니다.</p></div>
  `,teacherNotes[0]));

  p.push(pageShell(11,'구조 · 영점 · 측정',`
    <div class="book-grid">
      <div class="lab-figure"><img src="./assets/ch01/source-structure.png" alt="용수철저울의 구조를 보여 주는 교재 그림"><div class="action-row"><button data-lab="structure">3D로 구조 보기</button><button data-lab="zero">영점 맞추기</button><button class="secondary" data-audio="./assets/audio/docssam-parts.wav">🔊 구조 설명 듣기</button><button class="secondary" data-audio="./assets/audio/docssam-zero.wav">🔊 영점 질문 듣기</button></div></div>
      <div>
        <h3>각 부분의 역할</h3>
        <div class="parts-mini">${parts.map(x=>`<span><b>${esc(x[1])}</b><br>${esc(x[2])}</span>`).join('')}</div>
      </div>
    </div>
    <div class="book-box note"><h3>사용 순서</h3><ol><li>물체를 달기 전에 표시자의 윗부분이 0을 가리키는지 확인합니다.</li><li>물체를 고리에 매답니다.</li><li>표시자의 흔들림이 멈추면 눈높이를 맞추고 눈금을 읽습니다.</li></ol></div>
    <div class="book-grid equal">
      <div class="book-box question"><h3>어느 것이 더 무거울까요?</h3><p>물체를 3D 저울에 직접 끌어 놓아 비교하세요.</p><div class="action-row"><button data-lab="compare">물체 비교 실험</button></div></div>
      <div class="book-box expansion"><p>고리를 직접 당겨 <b>10 N, 14 N, 22 N</b> 같은 목표 눈금에 맞춰 보세요.</p><div class="action-row"><button data-lab="target">목표 N 맞추기</button></div></div>
    </div>
  `,teacherNotes[1]+' '+teacherNotes[2]+' '+teacherNotes[3]));

  p.push(pageShell(12,'눈높이와 시선의 각',`
    <p class="lead">물체의 힘은 그대로인데 보는 위치만 바뀌면 왜 다른 눈금처럼 보일까요?</p>
    <div class="eye-diagram">
      <div class="eye-scale">${Array.from({length:8},()=>'<i></i>').join('')}</div><div class="eye-pointer"></div>
      <div class="eye-ray high"></div><div class="eye-ray front"></div><div class="eye-ray low"></div>
      <span class="eye-label high">위에서 보기</span><span class="eye-label front">같은 높이</span><span class="eye-label low">아래에서 보기</span>
    </div>
    <div class="book-box question"><h3>눈금을 직접 찍어 보세요</h3><p>3D 화면에서 우루사쌤의 시점을 위·정면·아래로 바꾼 뒤, 보이는 눈금을 직접 누릅니다.</p><div class="action-row"><button data-lab="eye">시선 각도 3D 실험</button></div></div>
    <div class="book-grid equal">
      <div class="book-box soft"><h3>관찰</h3><p>표시자의 윗부분과 눈높이를 같은 높이로 맞추면 실제 눈금을 가장 정확하게 읽을 수 있습니다.</p></div>
      <div class="book-box expansion"><p>눈금판과 표시자의 앞뒤 간격이 더 커지면 시차는 어떻게 변할까요?</p></div>
    </div>
    <div class="lab-figure"><img src="./assets/ch01/source-eyelevel.png" alt="눈높이에 따라 읽는 눈금이 달라지는 교재 그림"></div>
  `,teacherNotes[4]));

  p.push(pageShell(13,'여러 가지 저울',`
    <p class="page-kicker">교재 12쪽</p><h1>무엇을 재느냐에 따라<br>알맞은 저울을 골라요.</h1>
    <div class="book-grid equal">
      <div class="book-box"><h3>용수철저울</h3><p>추와 여러 물체를 고리에 매달아 힘을 재는 데 사용합니다.</p></div>
      <div class="book-box"><h3>앉은뱅이저울</h3><p>채소처럼 접시 위에 올려놓는 물체를 재는 데 알맞습니다.</p></div>
      <div class="book-box"><h3>체중계</h3><p>사람의 몸무게를 재는 데 사용합니다.</p></div>
      <div class="book-box note"><h3>공통점</h3><p>사용하기 전에 0을 확인하고, 표시가 안정된 뒤 값을 읽습니다.</p></div>
    </div>
    <div class="book-box question"><h3>어떤 저울을 사용할까요?</h3><p>실험용 추 / 채소 / 사람의 몸에 알맞은 저울을 각각 써 보세요.</p><div class="answer-line"></div><div class="answer-line"></div></div>
  `,teacherNotes[5]));

  p.push(pageShell(14,'과학 이야기 · 용수철의 과거와 미래',`
    <p class="page-kicker">교재 13~14쪽</p><h1>우리 주변에서 용수철은<br>어떤 일을 하고 있을까요?</h1>
    <div class="book-grid">
      <div class="book-box soft"><h3>교재와 함께 읽기</h3><p>13쪽에서 용수철의 이름과 과거를, 14쪽에서 코일 형태 용수철의 등장과 앞으로의 활용을 읽어 봅니다.</p><a href="https://drive.google.com/file/d/1oatstBXJS3VBsSqT0v2VnA67wDktBWSt/view" target="_blank" rel="noopener">원본 교재 13~14쪽 열기</a></div>
      <div class="book-box expansion"><p>우리 교실이나 집에서 용수철을 쓰는 도구를 찾아 사진이나 그림으로 기록하고, 용수철이 하는 일을 설명해 보세요.</p></div>
    </div>
    <h3>나의 과학 노트</h3><div class="answer-line"></div><div class="answer-line"></div><div class="answer-line"></div><div class="answer-line"></div>
  `,teacherNotes[6]));

  const qHtml=daily.map((q,i)=>`<div class="daily-q"><b>${i+1}. ${esc(q.prompt)}</b>${q.passage?`<p>${esc(q.passage)}</p>`:''}${q.options?`<p>${q.options.map((o,j)=>`${j+1}) ${esc(o)}`).join(' · ')}</p>`:''}<div class="answer-line"></div></div>`).join('');
  p.push(pageShell(15,'Daily Test · 원본 6문항',`
    <p class="page-kicker">교재 15쪽</p><h1>내가 이해한 내용을 확인해요.</h1>
    <p class="lead">아래 6문항은 CHAPTER 01 원본 일일평가입니다. 먼저 종이에 풀고, 스마트북에서는 오개념 확인과 유사문제로 이어집니다.</p>
    <div class="daily-list">${qHtml}</div>
    <div class="action-row"><a href="./student.html?stage=daily">스마트 채점·오개념 분석 열기</a></div>
  `,teacherNotes[7]));

  return p;
}

const pages=buildPages();
const printBook=$('#print-book');
printBook.innerHTML=pages.join('');
let spread=0;
const left=$('#left-slot'),right=$('#right-slot'),pageIndex=$('#page-index');
function renderSpread(){
  const mobile=matchMedia('(max-width:1080px)').matches;
  const base=mobile?spread:spread*2;
  if(mobile){left.innerHTML='';right.innerHTML=pages[base]||'';pageIndex.textContent=`${Math.min(base+1,pages.length)} / ${pages.length}`;}
  else{left.innerHTML=pages[base]||'';right.innerHTML=pages[base+1]||'';pageIndex.textContent=`${Math.min(base+1,pages.length)}–${Math.min(base+2,pages.length)} / ${pages.length}`;}
  $('#prev-page').disabled=spread===0;
  $('#next-page').disabled=mobile?spread>=pages.length-1:spread>=Math.ceil(pages.length/2)-1;
  wirePageActions();
}
function turn(dir){
  const slot=dir>0?right:left;slot.classList.add(dir>0?'turn-forward':'turn-back');
  setTimeout(()=>{spread+=dir;slot.className=`book-slot ${slot===right?'right':'left'}`;renderSpread();},330);
}
$('#prev-page').onclick=()=>turn(-1);$('#next-page').onclick=()=>turn(1);
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&!$('#next-page').disabled)turn(1);if(e.key==='ArrowLeft'&&!$('#prev-page').disabled)turn(-1);});

const avatar=createAvatar($('#uru-avatar'));
avatar.setMood('welcome');
const characterToggle=$('#character-toggle');
const teacherToggle=$('#teacher-toggle');
function setCharacter(hidden){document.body.classList.toggle('character-hidden',hidden);characterToggle.setAttribute('aria-pressed',String(hidden));characterToggle.textContent=hidden?'우루사쌤 보이기':'우루사쌤 숨기기';localStorage.setItem('science-lab-character-hidden',hidden?'1':'0');}
setCharacter(localStorage.getItem('science-lab-character-hidden')==='1');
characterToggle.onclick=()=>setCharacter(!document.body.classList.contains('character-hidden'));
teacherToggle.onclick=()=>{const on=document.body.classList.toggle('teacher-mode');teacherToggle.setAttribute('aria-pressed',String(on));teacherToggle.textContent=on?'학생용 보기':'교사용 보기';renderSpread();};
$('#print-book-btn').onclick=()=>window.print();

let lab,voiceAudio;
function labText(kind){
  const m={
    structure:['3D 용수철저울','저울을 돌려 보며 내부 구조를 살펴보세요. 화면을 위아래로 끌면 표시자와 고리의 움직임도 확인할 수 있습니다.'],
    compare:['어느 것이 더 무거울까요?','아래 물체를 3D 저울 위로 끌어 놓으세요. 표시자가 흔들리다 멈춘 뒤 값을 기록하고 비교합니다.'],
    target:['목표 눈금에 맞춰 볼까요?','고리를 직접 위아래로 끌어 목표 N에 맞춰 보세요.'],
    zero:['영점을 맞춰 볼까요?','아무것도 달지 않은 저울이 4 N을 가리키고 있습니다. 영점 조절을 해서 표시자의 윗부분을 0에 맞춥니다.'],
    eye:['시선의 각과 눈금 읽기','물체는 20 N 그대로입니다. 위·정면·아래로 시점을 바꾼 뒤 눈금판을 직접 찍어 보세요.']
  };return m[kind]||m.structure;
}
function openLab(kind){
  const overlay=$('#lab-overlay'),[title,desc]=labText(kind);
  overlay.hidden=false;$('#lab-title').textContent=title;$('#lab-desc').textContent=desc;
  const controls=$('#lab-controls');controls.innerHTML='';let zero=kind==='zero'?4:0;
  let targetForce=[10,14,22][Math.floor(Math.random()*3)];
  const result=document.createElement('div');result.className='pick-result';result.textContent='직접 조작해 보세요.';
  lab?.destroy();
  lab=mountSpringScale($('#lab3d'),{
    initialForce:kind==='eye'?20:0,initialZero:zero,pullEnabled:kind==='target',
    onReading:r=>{const out=$('#lab-reading');if(out)out.textContent=`${Math.round(r.reading)} N`;},
    onPick:(picked,state)=>{
      if(kind==='target') result.textContent=Math.abs(picked-targetForce)<=1?`성공! ${targetForce} N에 맞췄어요.`:`지금 찍은 위치는 약 ${picked} N. 목표는 ${targetForce} N입니다.`;
      else if(kind==='eye'){const add=state.view==='high'?2:state.view==='low'?-2:0;const expected=state.trueReading+add;result.textContent=`이 시선에서 찍은 눈금: 약 ${picked} N · 이 모형에서 보이는 값은 약 ${expected} N`;}
      else result.textContent=`찍은 눈금: 약 ${picked} N`;
    }
  });
  controls.insertAdjacentHTML('beforeend','<div class="big-readout" id="lab-reading">0 N</div>');
  if(kind==='compare'){
    controls.insertAdjacentHTML('beforeend',`<div class="weight-tray">${[['작은 공',6],['필통',12],['큰 추',20],['무거운 상자',28]].map(([n,v])=>`<button class="weight-card" draggable="true" data-force="${v}"><b>${n}</b><span>먼저 무게를 예상해 보세요</span></button>`).join('')}</div><div class="control-group"><button data-clear>물체 빼기</button></div>`);
    controls.querySelectorAll('[data-force]').forEach(b=>{b.addEventListener('dragstart',e=>{e.dataTransfer.setData('application/x-msg-force',b.dataset.force);e.dataTransfer.setData('text/plain',b.dataset.force);});b.onclick=()=>lab.setForce(Number(b.dataset.force));});controls.querySelector('[data-clear]').onclick=()=>lab.setForce(0);
  } else if(kind==='target'){
    controls.insertAdjacentHTML('beforeend',`<div class="control-group"><b>목표: ${targetForce} N</b><p>3D 저울의 고리 쪽을 잡고 위아래로 끌어 보세요.</p><button data-new>새 목표</button></div>`);
    controls.querySelector('[data-new]').onclick=()=>{targetForce=[8,10,14,18,22,26][Math.floor(Math.random()*6)];openLab('target');};
  } else if(kind==='zero'){
    controls.insertAdjacentHTML('beforeend','<div class="control-group"><label>영점조절나사 <input data-zero type="range" min="-6" max="6" step="2" value="4"></label><p>물체를 달기 전에 0에 맞추세요.</p></div>');
    controls.querySelector('[data-zero]').oninput=e=>{zero=Number(e.target.value);lab.setZero(zero);result.textContent=zero===0?'영점이 맞았습니다. 이제 물체를 매달 수 있어요.':`현재 영점 오차 ${zero>0?'+':''}${zero} N`;};
  } else if(kind==='eye'){
    controls.insertAdjacentHTML('beforeend','<div class="control-group"><button data-view="high">위에서 보기</button><button data-view="front" class="primary">같은 높이</button><button data-view="low">아래에서 보기</button><p>시점을 바꾼 뒤 3D 눈금판을 직접 눌러 보세요.</p></div>');
    controls.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{lab.setView(b.dataset.view);controls.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('primary',x===b));});
  } else {
    controls.insertAdjacentHTML('beforeend','<div class="control-group"><button data-demo>20 N 물체 달아 보기</button><button data-reset>물체 빼기</button></div>');
    controls.querySelector('[data-demo]').onclick=()=>lab.setForce(20);controls.querySelector('[data-reset]').onclick=()=>lab.setForce(0);
  }
  controls.appendChild(result);
}
function closeLab(){lab?.destroy();lab=null;$('#lab-overlay').hidden=true;}
$('#lab-close').onclick=closeLab;$('#lab-overlay').addEventListener('click',e=>{if(e.target===$('#lab-overlay'))closeLab();});

function wirePageActions(){
  document.querySelectorAll('.book-stage [data-lab]').forEach(b=>b.onclick=()=>openLab(b.dataset.lab));
  document.querySelectorAll('.book-stage [data-play-movie]').forEach(b=>b.onclick=()=>{const m=b.closest('.book-page').querySelector('[data-movie]');m.classList.toggle('playing');b.textContent=m.classList.contains('playing')?'■ 애니메이션 멈추기':'▶ 무게·힘·단위 애니메이션';});
  document.querySelectorAll('.book-stage [data-audio]').forEach(b=>b.onclick=async()=>{const label=b.dataset.label||b.textContent;b.dataset.label=label;try{voiceAudio?.pause();voiceAudio=new Audio(b.dataset.audio);avatar.setMood('explain');avatar.setMouth('half');b.textContent='■ 재생 중';voiceAudio.onended=()=>{avatar.close();b.textContent=label;};voiceAudio.onerror=()=>{avatar.close();b.textContent='음성을 재생할 수 없어요';};await voiceAudio.play();}catch{avatar.close();b.textContent='음성을 재생할 수 없어요';}});
}
matchMedia('(max-width:1080px)').addEventListener('change',()=>{spread=0;renderSpread();});
renderSpread();
