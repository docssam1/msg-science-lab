// 지필드 과학 탐구 랩 — 라우터·화면. 데이터는 data/curriculum.js, 3D는 engine.js + scenes/*.js
import { PARTS, UNITS, unitById } from './data/curriculum.js';
import { Stage, Player } from './engine.js';

const $app = document.getElementById('app');
const STORE_KEY = 'sciLab.v1';
const store = {
  read() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (_) { return {}; } },
  write(d) { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (_) { /* private mode */ } },
  unit(id) { return this.read()[id] || {}; },
  patch(id, p) { const d = this.read(); d[id] = { ...(d[id] || {}), ...p, updatedAt: Date.now() }; this.write(d); },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LETTERS = ['A', 'B', 'C', 'D'];

let stage = null, player = null; // 현재 유닛의 3D

function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const m = h.match(/^u\/([\w-]+)/);
  teardown3D();
  if (m && unitById(m[1])) renderUnit(unitById(m[1])); else renderHome();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function teardown3D() { if (player) { player.stop(); if (player._offKey) player._offKey(); } if (stage) stage.dispose(); stage = null; player = null; }

function topbar(backHref) {
  const done = UNITS.filter((u) => store.unit(u.id).quizBest >= 2).length;
  return `<header class="topbar"><div class="wrap">
    <a class="brand" href="#/"><span class="mark">⚗</span>지필드 과학 탐구 랩<small>Science Inquiry Lab</small></a>
    <span class="spacer"></span>
    ${backHref ? `<a class="back" href="${backHref}">← 전체 순서</a>` : ''}
    <span class="progress-pill">완료 ${done}/${UNITS.length}</span>
  </div></header>`;
}
function footer() {
  return `<footer><div class="wrap">
    <p>교과 순서와 활동은 『2009 초등학교 과학탐구토론 지도자료』(서울특별시과학전시관)의 차례를 따르며, 개념 설명은 그 내용을 바탕으로 다시 썼습니다.</p>
    <p>3D 장면은 원본 도형으로만 그렸고 외부 저작물을 포함하지 않습니다. 음성은 기기의 읽어 주기 기능(Web Speech)을 씁니다.</p>
  </div></footer>`;
}

function renderHome() {
  const cards = (p) => UNITS.filter((u) => u.part === p.id).map((u) => {
    const s = store.unit(u.id);
    return `<a class="card" href="#/u/${u.id}">
      <span class="no">${p.id}-${u.no}</span><h3>${esc(u.title)}</h3><p>${esc(u.sub)}</p>
      <span class="badges"><span class="badge ${s.videoDone ? 'on' : ''}">🎬 3D ${s.videoDone ? '봤어요' : ''}</span><span class="badge ${s.quizBest >= 2 ? 'gold' : ''}">✎ 확인 ${s.quizBest != null ? s.quizBest + '/3' : ''}</span></span>
    </a>`;
  }).join('');
  $app.innerHTML = `${topbar()}
  <main class="wrap">
    <section class="hero">
      <h1>개념으로 이해하고, 3D로 실험을 봅니다</h1>
      <p>초등 과학탐구토론 지도자료의 차례 그대로 열다섯 단원. 단원마다 핵심 개념 → 3D 애니메이션 실험 → 탐구 활동 설계 → 토론 질문 → 확인 문제 순서로 갑니다.</p>
      <p class="src">출처: 서울특별시과학전시관, 『2009 초등학교 과학탐구토론 지도자료』 (1부 탐구 과정·활동, 3부 탐구 주제)</p>
    </section>
    ${PARTS.map((p) => `<section class="part"><div class="part-head"><span class="tag" style="background:${p.color}">PART ${p.id}</span><div><h2>${esc(p.title)}</h2><p>${esc(p.sub)}</p></div></div><div class="grid">${cards(p)}</div></section>`).join('')}
  </main>${footer()}`;
}

function renderUnit(u) {
  const part = PARTS.find((p) => p.id === u.part);
  const idx = UNITS.indexOf(u), prev = UNITS[idx - 1], next = UNITS[idx + 1];
  const s = store.unit(u.id);
  $app.innerHTML = `${topbar('#/')}
  <main>
    <div class="wrap unit-head">
      <div class="crumb"><span class="tag" style="background:${part.color};color:#fff;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700">PART ${part.id}</span><span>${esc(part.title)} · ${u.no}/${UNITS.filter((x) => x.part === u.part).length}</span><span>·</span><span>지도자료 ${esc(u.source)}</span></div>
      <h1>${esc(u.title)}</h1><p class="sub">${esc(u.sub)}</p>
      ${u.note ? `<div class="note">${esc(u.note)}</div>` : ''}
    </div>
    <nav class="tabs"><div class="wrap">
      <a href="#/u/${u.id}" data-to="concept" class="on">① 개념</a><a href="#/u/${u.id}" data-to="video">② 3D 실험</a><a href="#/u/${u.id}" data-to="activity">③ 탐구 활동</a><a href="#/u/${u.id}" data-to="discuss">④ 토론</a><a href="#/u/${u.id}" data-to="quiz">⑤ 확인</a>
    </div></nav>
    <section class="wrap section" id="concept"><h2><span class="step">STEP 1</span>개념</h2><p class="lead">${esc(u.concept.lead)}</p>
      <div class="points">${u.concept.points.map(([b, t]) => `<div class="point"><b>${esc(b)}</b><span>${esc(t)}</span></div>`).join('')}</div>
      <div class="terms">${u.concept.terms.map(([t, d]) => `<span class="term"><b>${esc(t)}</b>${esc(d)}</span>`).join('')}</div>
    </section>
    <section class="wrap section" id="video"><h2><span class="step">STEP 2</span>3D 실험 보기</h2><p class="lead">재생을 누르면 실험이 한 단계씩 그려집니다. 화면을 끌면 돌려 볼 수 있고, 자막을 누르면 그 장면으로 갑니다.</p>
      <div class="stage">
        <canvas id="stage" aria-label="3D 실험 장면"></canvas>
        <div class="caption" id="caption"><span class="idx">장면 1</span>불러오는 중…</div>
        <div class="dots" id="dots"></div>
        <div class="controls">
          <button class="btn primary" id="btnPlay">▶ 재생</button>
          <button class="btn" id="btnPrev" title="이전 장면">⏮</button>
          <button class="btn" id="btnNext" title="다음 장면">⏭</button>
          <button class="btn" id="btnReplay" title="처음부터">↺ 처음</button>
          <span class="sp"></span>
          <button class="btn" id="btnVoice" aria-pressed="false" title="읽어 주기">🔈 음성</button>
          <select id="speed" aria-label="속도"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option></select>
        </div>
      </div>
      <div class="transcript" id="transcript"></div>
      <p class="hint">자막이 원본입니다. 음성은 기기의 읽어 주기 기능이라 브라우저마다 목소리가 다를 수 있고, 꺼 두어도 학습에 지장이 없습니다.</p>
    </section>
    <section class="wrap section" id="activity"><h2><span class="step">STEP 3</span>탐구 활동 — ${esc(u.activity.title)}</h2>
      <div class="activity">
        <div class="box"><h3>절차</h3><ol>${u.activity.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></div>
        <div>
          <div class="box" style="margin-bottom:12px"><h3>준비물</h3><ul>${u.activity.materials.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
          <div class="box"><h3>변인표</h3><div class="vars">
            <div class="var diff"><b>다르게</b><span>${u.activity.vars.diff.map(esc).join(' / ')}</span></div>
            <div class="var measure"><b>측정</b><span>${u.activity.vars.measure.map(esc).join(' / ')}</span></div>
            <div class="var same"><b>같게</b><span>${u.activity.vars.same.map(esc).join(' / ')}</span></div>
          </div></div>
        </div>
      </div>
    </section>
    <section class="wrap section" id="discuss"><h2><span class="step">STEP 4</span>토론 · 반론</h2><p class="lead">먼저 스스로 답을 말해 본 뒤 힌트를 엽니다. 반론은 "근거가 무엇입니까?", "그 실험만으로 알 수 있습니까?"에서 시작합니다.</p>
      <div class="discuss">${u.discuss.map((d) => `<details><summary>${esc(d.q)}</summary><p>${esc(d.hint)}</p></details>`).join('')}</div>
    </section>
    <section class="wrap section" id="quiz"><h2><span class="step">STEP 5</span>확인 문제</h2><p class="lead">세 문제. 고르면 바로 풀이가 보입니다.${s.quizBest != null ? ` 최고 기록 ${s.quizBest}/3.` : ''}</p>
      <div class="quiz" id="quiz">${u.quiz.map((q, qi) => `<div class="q" data-q="${qi}"><p class="stem">${qi + 1}. ${esc(q.q)}</p><div class="choices">${q.c.map((c, ci) => `<button data-c="${ci}"><span class="l">${LETTERS[ci]}</span><span>${esc(c)}</span></button>`).join('')}</div><p class="why" hidden></p></div>`).join('')}</div>
      <p class="score" id="score"></p>
    </section>
    <div class="wrap unit-nav">
      ${prev ? `<a href="#/u/${prev.id}"><b>← 이전</b>${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="next" href="#/u/${next.id}"><b>다음 →</b>${esc(next.title)}</a>` : `<a class="next" href="#/"><b>처음으로</b>전체 순서</a>`}
    </div>
  </main>${footer()}`;

  // 탭: 같은 페이지 안의 섹션으로 스크롤
  const tabs = [...$app.querySelectorAll('.tabs a')];
  tabs.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); document.getElementById(a.dataset.to)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  const io = new IntersectionObserver((ents) => { ents.forEach((en) => { if (en.isIntersecting) tabs.forEach((a) => a.classList.toggle('on', a.dataset.to === en.target.id)); }); }, { rootMargin: '-40% 0px -55% 0px' });
  ['concept', 'video', 'activity', 'discuss', 'quiz'].forEach((id) => io.observe(document.getElementById(id)));

  mount3D(u);
  mountQuiz(u);
}

async function mount3D(u) {
  const canvas = document.getElementById('stage');
  const $cap = document.getElementById('caption'), $dots = document.getElementById('dots'), $tr = document.getElementById('transcript');
  const $play = document.getElementById('btnPlay'), $voice = document.getElementById('btnVoice'), $speed = document.getElementById('speed');
  let mod;
  try {
    stage = new Stage(canvas); player = new Player(stage);
    mod = (await import(`./scenes/${u.scene}.js`)).default;
    if (!stage) return; // 사이에 페이지를 떠났다
    await player.load(mod);
  } catch (err) {
    console.error(err); $cap.innerHTML = `<span class="idx">오류</span>3D 장면을 불러오지 못했습니다. (${esc(err.message)})`; return;
  }
  $tr.innerHTML = mod.beats.map((b, i) => `<button data-i="${i}"><span class="n">${i + 1}</span><span>${esc(b.text)}</span></button>`).join('');
  $dots.innerHTML = mod.beats.map(() => '<i></i>').join('');
  const sync = () => {
    const i = player.index, b = mod.beats[i];
    $cap.innerHTML = `<span class="idx">장면 ${i + 1}/${mod.beats.length}</span>${esc(b.text)}`;
    $play.textContent = player.playing ? '❚❚ 멈춤' : (player.done ? '↺ 다시' : '▶ 재생');
    [...$dots.children].forEach((d, k) => { d.className = k < i ? 'done' : k === i ? 'cur' : ''; });
    [...$tr.children].forEach((bt, k) => bt.classList.toggle('on', k === i));
    $voice.setAttribute('aria-pressed', String(player.voice));
    if (player.done && !store.unit(u.id).videoDone) { store.patch(u.id, { videoDone: true }); }
  };
  player.onChange = sync; sync();
  $play.onclick = () => player.toggle();
  document.getElementById('btnPrev').onclick = () => player.prev();
  document.getElementById('btnNext').onclick = () => player.next();
  document.getElementById('btnReplay').onclick = () => player.replay();
  $voice.onclick = () => player.setVoice(!player.voice);
  $speed.onchange = () => player.setSpeed(parseFloat($speed.value));
  $tr.onclick = (e) => { const bt = e.target.closest('button'); if (bt) player.goto(+bt.dataset.i, false); };
  document.addEventListener('keydown', onKey);
  function onKey(e) { if (!player || e.target.matches('input,select,textarea')) return; if (e.key === ' ') { e.preventDefault(); player.toggle(); } if (e.key === 'ArrowRight') player.next(); if (e.key === 'ArrowLeft') player.prev(); }
  player._offKey = () => document.removeEventListener('keydown', onKey);
}

function mountQuiz(u) {
  const $quiz = document.getElementById('quiz'), $score = document.getElementById('score');
  const answered = new Map();
  $quiz.addEventListener('click', (e) => {
    const bt = e.target.closest('button'); if (!bt) return;
    const $q = bt.closest('.q'); const qi = +$q.dataset.q; if (answered.has(qi)) return;
    const q = u.quiz[qi], ci = +bt.dataset.c; answered.set(qi, ci === q.a);
    [...$q.querySelectorAll('button')].forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('correct'); else if (k === ci) b.classList.add('wrong'); });
    const $why = $q.querySelector('.why'); $why.hidden = false; $why.textContent = (ci === q.a ? '정답! ' : `아쉽네요. 정답은 ${LETTERS[q.a]}. `) + q.why;
    if (answered.size === u.quiz.length) {
      const score = [...answered.values()].filter(Boolean).length; const best = Math.max(score, store.unit(u.id).quizBest || 0);
      store.patch(u.id, { quizBest: best, lastScore: score });
      $score.textContent = `${score}/${u.quiz.length} ${score >= 2 ? '— 통과! 다음 단원으로 가도 좋아요.' : '— 개념을 한 번 더 읽고 다시 풀어 보세요.'}`; $score.className = 'score' + (score >= 2 ? ' pass' : '');
    }
  });
}

addEventListener('hashchange', route);
route();
