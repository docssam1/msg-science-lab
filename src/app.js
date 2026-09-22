import { createAvatar } from './avatar.js';
import { CharacterPlayer } from './player.js';
import { springModel } from './core.js';

const lecture = document.body.dataset.mode === 'lecture';
const studio = document.body.dataset.mode === 'character';
const lessons = [
  { name: '관찰하기', title: '추를 달면, 무엇이 달라질까?', lead: '같은 용수철에 추를 하나씩 달아 보세요.', question: '추를 하나 더 달면 용수철은 어떻게 될까요?', note: '학생의 예상을 먼저 듣고, 추를 추가해 관찰 결과를 비교합니다.', answer: '추의 무게가 커지면 같은 용수철의 늘어난 길이가 커집니다.' },
  { name: '기준 찾기', title: '추를 달기 전을 기억해요', lead: '추가 없을 때의 길이가 비교의 기준이에요.', question: '원래 길이는 어디부터 어디까지일까요?', note: '추를 모두 빼고 원래 길이 6cm를 확인합니다. 추를 단 뒤에는 늘어난 부분을 구분합니다.', answer: '늘어난 길이는 현재 전체 길이에서 원래 길이를 뺀 값입니다.' },
  { name: '직접 실험', title: '하나씩 달고, 차근차근 관찰', lead: '추 0개부터 4개까지 같은 방법으로 비교해 보세요.', question: '추 한 개를 더 달 때마다 얼마나 늘어나나요?', note: '한 번에 바꾸는 것은 추의 개수뿐입니다. 용수철과 추의 종류는 유지합니다.', answer: '이 모형에서는 추 한 개(1N)마다 2cm씩 늘어납니다.' },
  { name: '규칙 설명', title: '늘어난 길이에 규칙이 있어요', lead: '전체 길이와 늘어난 길이를 구별해 보세요.', question: '추가 두 배면 전체 길이도 두 배일까요?', note: '추 1개일 때 전체 길이 8cm, 2개일 때 10cm를 비교합니다. 늘어난 길이는 2cm와 4cm입니다.', answer: '이 모형에서는 늘어난 길이가 두 배가 됩니다. 전체 길이가 두 배가 되는 것은 아닙니다.' },
  { name: '탐구 문제', title: '늘어난 길이가 6cm라면?', lead: '이 모형과 같은 용수철이에요. 물체의 무게를 추론해 보세요.', question: '늘어난 길이와 추의 무게를 연결해 볼까요?', note: '학생이 먼저 답과 근거를 말하도록 기다립니다. 화면의 추 조작으로 다시 확인해도 좋습니다.', answer: '무게는 3N입니다. 1N마다 2cm 늘어나므로 6cm는 3N에 해당합니다.' },
  { name: '정리하기', title: '어떻게 잴지 설명할 수 있나요?', lead: '기준을 정하고, 관찰한 규칙으로 무게를 알아봐요.', question: '정확하게 비교하려면 무엇을 같게 해야 할까요?', note: '같은 용수철, 같은 단위 추, 원래 길이의 확인을 학생 자신의 말로 정리하게 합니다.', answer: '같은 용수철과 단위 추를 사용하고, 원래 길이를 기준으로 늘어난 길이를 비교합니다.' },
];
const moods = [['welcome', '기본'], ['explain', '설명'], ['question', '질문'], ['surprise', '놀람'], ['praise', '칭찬'], ['listen', '듣기']];
document.querySelector('#app').innerHTML = `
  <a class="skip" href="#lesson">수업으로 건너뛰기</a>
  <header class="topbar"><a class="brand" href="./index.html"><span class="msg-mark">MSG</span><span>사이언스 랩</span></a><nav class="modes" aria-label="학습 방식"><a href="./student.html" ${!lecture && !studio ? 'aria-current="page"' : ''}>학생 자습</a><a href="./lecture.html" ${lecture ? 'aria-current="page"' : ''}>강의 화면</a><a href="./character.html" ${studio ? 'aria-current="page"' : ''}>캐릭터</a></nav><span class="preview-label">캐릭터 동작 시안</span></header>
  <div class="shell"><aside class="unit-index"><div class="subject">물리</div><h1>무게 재기</h1><p class="unit-subtitle">용수철로 알아보는 무게</p><ol class="lesson-index">${lessons.map((l, i) => `<li><button data-step="${i}"><span class="step-number">${i + 1}</span>${l.name}</button></li>`).join('')}</ol><div class="index-foot"><span class="book-spine"></span><p>직접 해 보고<br>내 말로 설명하기</p></div></aside>
  <main id="lesson"><div class="lesson-heading"><div><p class="chapter">물리 첫 번째 탐구</p><h2 id="lesson-title"></h2><p id="lesson-lead"></p></div><span id="folio"></span></div>
    <div class="workspace"><section class="experiment" aria-label="용수철 관찰 모형"><div class="experiment-label"><span>용수철 실험</span><span>가상 모형</span></div><div id="spring"></div><div class="weight-controls"><button id="remove-weight" aria-label="추 한 개 빼기">−</button><p>같은 추 <strong id="weight-count">2</strong>개</p><button id="add-weight" aria-label="추 한 개 추가">＋</button></div><div class="readings"><div><span>추의 무게</span><strong id="force"></strong></div><div><span>늘어난 길이</span><strong id="extension"></strong></div><div><span>전체 길이</span><strong id="length"></strong></div></div><p class="model-note">이 모형의 약속: 추 1개는 1N, 원래 길이는 6cm.<br>1N마다 2cm씩 늘어나며, 추는 4개까지 달 수 있어요.</p><div id="exercise" hidden><p>물체의 무게를 골라 보세요.</p><div class="answers"><button data-answer="2">2N</button><button data-answer="3">3N</button><button data-answer="4">4N</button></div><p id="feedback" role="status"></p></div></section>
    <aside class="teacher-panel" aria-label="선생님 캐릭터"><div class="teacher-label"><span class="teacher-dot"></span>선생님과 생각해 보기</div><p id="speech" class="speech"></p><div id="avatar"></div><div class="playback"><button id="play" class="primary">무음 동작 시연</button><button id="stop">처음으로</button></div><progress id="progress" max="1" value="0" aria-label="시연 진행"></progress><p id="player-status" role="status">무음 동작 시연 · 실제 목소리 연결 전</p></aside></div>
    ${lecture ? `<section class="teacher-notes"><div><h3>강사 메모</h3><p id="note"></p></div><button id="reveal">정답·설명 공개</button><p id="teacher-answer" hidden></p></section>` : `<section class="student-hint"><button id="hint-button" aria-expanded="false">생각의 힌트</button><p id="hint" hidden>추를 모두 빼서 원래 길이를 확인해 보세요. 지금 길이에서 원래 길이를 빼면 얼마나 늘어났는지 알 수 있어요.</p></section>`}
    <footer class="lesson-footer"><button id="previous">이전</button><p>${lecture ? '교사가 설명과 정답 공개를 조절합니다.' : '속도는 내가 정해요. 다시 해 봐도 괜찮아요.'}</p><button id="next">다음 탐구</button>${lecture ? '<button id="fullscreen">전체 화면</button>' : ''}</footer>
    <details class="character-tools" open><summary>캐릭터 동작 확인</summary><div class="tool-content"><div><p class="tool-label">표정</p><div class="moods">${moods.map(([key, text]) => `<button data-mood="${key}" aria-pressed="${key === 'welcome'}">${text}</button>`).join('')}<button id="blink">눈 깜빡임</button></div></div><div class="audio-tools"><label class="file-label" for="audio-file">음성 파일 연결<input id="audio-file" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg"></label><button id="demo-mode">무음 시연으로 전환</button><p id="file-label">파일은 이 기기에서만 재생하며 업로드하지 않습니다.</p><p>OmniVoice 음성 생성 전입니다. 파일 연결은 음량 기반 근사 립싱크를 확인하는 기능입니다.</p></div></div></details>
    <p class="prototype-note">동작 확인용 수업 시안입니다. 전체 MSG 교재와 강의용 PPTX는 아직 제작 전입니다.</p>
  </main></div>`;

const $ = (s) => document.querySelector(s);
const avatar = createAvatar($('#avatar'));
let step = 0, count = 2, revealed = false;
const player = new CharacterPlayer(avatar, {
  onState(state, text) { $('#player-status').textContent = text; $('#play').textContent = state === 'playing' ? '일시정지' : state === 'paused' ? '계속 재생' : player?.kind === 'audio' ? '연결한 음성 재생' : '무음 동작 시연'; },
  onLine(text) { if ($('#speech').textContent !== text) $('#speech').textContent = text; },
  onProgress(value) { $('#progress').value = Math.max(0, Math.min(1, value)); },
  onMood(value) { document.querySelectorAll('button[data-mood]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mood === value))); },
});

function renderSpring() {
  const model = springModel(count), coilEnd = 145 + model.extension * 12, hookEnd = coilEnd + 24;
  let coil = 'M186 58 L186 70';
  for (let i = 0; i < 12; i++) coil += ` L${i % 2 ? 164 : 208} ${70 + (coilEnd - 70) * (i + 1) / 12}`;
  coil += ` L186 ${coilEnd + 8}`;
  const weights = Array.from({ length: count }, (_, i) => `<g transform="translate(162 ${hookEnd + i * 24})"><rect width="48" height="22" rx="3" fill="#e9b83e" stroke="#ad8225"/><path d="M1 5H47" stroke="#ffe8a6"/><text x="24" y="16" text-anchor="middle" font-size="12" fill="#4b3914">1N</text></g>`).join('');
  $('#spring').innerHTML = `<svg viewBox="0 0 420 400" role="img" aria-label="추 ${count}개, 무게 ${model.force}뉴턴, 늘어난 길이 ${model.extension}센티미터"><defs><pattern id="lab-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e8eef2" stroke-width="1"/></pattern></defs><rect x="20" y="15" width="380" height="370" fill="url(#lab-grid)"/><path d="M80 365H260 M104 365V39H258" fill="none" stroke="#75939f" stroke-width="8" stroke-linecap="round"/><rect x="158" y="32" width="58" height="17" rx="3" fill="#19394b"/><path d="M186 49V59" stroke="#19394b" stroke-width="4"/><path d="${coil}" fill="none" stroke="#507797" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M186 ${coilEnd + 8}v8q14 12 0 17q-9 1-9-7" fill="none" stroke="#507797" stroke-width="4"/>${weights}<path d="M219 145H359" stroke="#8196a2" stroke-dasharray="5 5"/><text x="272" y="132" fill="#657884" font-size="13">원래 끝 위치</text>${count ? `<path d="M240 145V${coilEnd}" stroke="#2c60a4" stroke-width="3"/><path d="M232 145h16M232 ${coilEnd}h16" stroke="#2c60a4" stroke-width="3"/><text x="254" y="${145 + (coilEnd - 145) / 2 + 5}" fill="#2c60a4" font-size="19" font-weight="bold">+${model.extension}cm</text>` : ''}<rect x="340" y="150" width="24" height="192" rx="2" fill="#e7edf1"/>${Array.from({ length: 17 }, (_, i) => `<path d="M340 ${150 + i * 12}h${i % 2 ? 8 : 14}" stroke="#80939f"/>`).join('')}<text x="40" y="390" font-size="12" fill="#657884">늘어난 부분을 원래 끝 위치와 비교해요</text></svg>`;
  $('#weight-count').textContent = count; $('#force').textContent = `${model.force} N`; $('#extension').textContent = `${model.extension} cm`; $('#length').textContent = `${model.length} cm`;
  $('#remove-weight').disabled = count === 0; $('#add-weight').disabled = count === 4;
}
function setStep(value) {
  player.stop(); step = Math.max(0, Math.min(lessons.length - 1, value)); revealed = false;
  const lesson = lessons[step]; $('#lesson-title').textContent = lesson.title; $('#lesson-lead').textContent = lesson.lead; $('#speech').textContent = lesson.question; $('#folio').textContent = `${String(step + 1).padStart(2, '0')} / 06`;
  document.querySelectorAll('[data-step]').forEach(b => { const active = Number(b.dataset.step) === step; if (active) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  $('#previous').disabled = step === 0; $('#next').disabled = step === lessons.length - 1;
  $('#exercise').hidden = lecture || step !== 4; $('#feedback').textContent = ''; document.querySelectorAll('[data-answer]').forEach(b => b.removeAttribute('aria-pressed'));
  if (lecture) { $('#note').textContent = lesson.note; $('#teacher-answer').hidden = true; $('#teacher-answer').textContent = ''; $('#reveal').textContent = '정답·설명 공개'; }
  else { $('#hint').hidden = true; $('#hint-button').setAttribute('aria-expanded', 'false'); }
  setMood(step === 4 ? 'question' : 'welcome');
}
function setMood(value) {
  avatar.setMood(value); avatar.setMouth(value === 'surprise' ? 'round' : value === 'praise' ? 'open' : value === 'explain' ? 'half' : 'closed');
  document.querySelectorAll('button[data-mood]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mood === value)));
}
$('#play').addEventListener('click', () => player.state === 'playing' ? player.pause() : player.play());
$('#stop').addEventListener('click', () => { player.stop(); $('#speech').textContent = lessons[step].question; });
$('#add-weight').addEventListener('click', () => { count = springModel(count + 1).count; renderSpring(); });
$('#remove-weight').addEventListener('click', () => { count = springModel(count - 1).count; renderSpring(); });
$('#previous').addEventListener('click', () => setStep(step - 1)); $('#next').addEventListener('click', () => setStep(step + 1));
document.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => setStep(Number(b.dataset.step))));
document.querySelectorAll('button[data-mood]').forEach(b => b.addEventListener('click', () => { player.stop(); setMood(b.dataset.mood); }));
$('#blink').addEventListener('click', () => avatar.blink());
$('#audio-file').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; try { await player.loadFile(file); $('#file-label').textContent = file.name; } catch (err) { $('#file-label').textContent = err.message; } });
$('#demo-mode').addEventListener('click', () => { player.useDemo(); $('#audio-file').value = ''; $('#file-label').textContent = '파일은 이 기기에서만 재생하며 업로드하지 않습니다.'; });
if (lecture) {
  $('#reveal').addEventListener('click', () => { revealed = !revealed; $('#teacher-answer').hidden = !revealed; $('#teacher-answer').textContent = revealed ? lessons[step].answer : ''; $('#reveal').textContent = revealed ? '정답·설명 숨기기' : '정답·설명 공개'; });
  $('#fullscreen').addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { $('#player-status').textContent = '이 브라우저에서는 전체 화면을 사용할 수 없습니다.'; } });
  document.addEventListener('keydown', (e) => { if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return; if (e.key === 'ArrowRight') setStep(step + 1); if (e.key === 'ArrowLeft') setStep(step - 1); });
} else {
  $('#hint-button').addEventListener('click', () => { $('#hint').hidden = !$('#hint').hidden; $('#hint-button').setAttribute('aria-expanded', String(!$('#hint').hidden)); });
  document.querySelectorAll('[data-answer]').forEach(b => b.addEventListener('click', () => { const correct = b.dataset.answer === '3'; $('#feedback').textContent = correct ? '맞아요! 1N마다 2cm 늘어나므로 6cm는 3N에 해당해요.' : '1N일 때 2cm 늘어나요. 추를 하나씩 달아 다시 확인해 볼까요?'; setMood(correct ? 'praise' : 'question'); }));
}
window.addEventListener('pagehide', () => player.destroy(), { once: true });
renderSpring(); setStep(0);
if (studio) { $('.chapter').textContent = '초과심_물리 · 무게 재기'; $('#lesson-title').textContent = 'MSG 사이언스 랩'; $('#lesson-lead').textContent = '캐릭터 동작 시연 · 실제 수업은 학생 자습 또는 강의 화면에서 열어 주세요.'; $('#folio').hidden = true; }
