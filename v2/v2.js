// docssam 과학 탐구 랩 v2 — 단원 = 5E 한 단계 한 화면 + 준비물(QR) + 탐구보고서 + 교재 인쇄.
// 화면과 교재는 같은 단원 데이터(data/units/*.js)를 쓴다.
import { towerModel } from './lab-ring-tower.js';
import { mount3D, LABS, mountLabOf } from './mounts.js';
import { pageHome } from './home.js';
import { escapeInApp } from './inapp.js';
import { record, analyze, remedyItems, log as readLog, clearLog } from './progress.js';
escapeInApp();

const UNITS = { 's41-u01': async () => ({ ...(await import('../data/units/s41-u01.js')), ...(await import('../data/units/s41-u01.lesson.js')),
  ...(await import('../data/units/s41-u01.similar.js')), ...(await import('../data/units/s41-u01.taxonomy.js')), misc: await import('../data/units/s41-u01.misc.js') }),
  's41-u02': async () => ({ ...(await import('../data/units/s41-u02.js')), ...(await import('../data/units/s41-u02.lesson.js')),
  ...(await import('../data/units/s41-u02.similar.js')), ...(await import('../data/units/s41-u02.taxonomy.js')) }),
  's41-u03': async () => ({ ...(await import('../data/units/s41-u03.js')), ...(await import('../data/units/s41-u03.lesson.js')),
  ...(await import('../data/units/s41-u03.similar.js')), ...(await import('../data/units/s41-u03.taxonomy.js')), misc: await import('../data/units/s41-u03.misc.js') }),
  's41-u03b': async () => ({ ...(await import('../data/units/s41-u03.js')), ...(await import('../data/units/s41-u03b.lesson.js')),
  ...(await import('../data/units/s41-u03.similar.js')), ...(await import('../data/units/s41-u03.taxonomy.js')), ...(await import('../data/media/s41-u03b.media.js')), misc: await import('../data/units/s41-u03.misc.js') }),
  's42-u01': async () => ({ ...(await import('../data/units/s42-u01.js')), ...(await import('../data/units/s42-u01.lesson.js')),
  ...(await import('../data/units/s42-u01.similar.js')), ...(await import('../data/units/s42-u01.taxonomy.js')) }) };
const DATA_UNIT = { 's41-u03b': 's41-u03' }; const du = (u) => DATA_UNIT[u] || u; // 기록은 문항을 가진 단원 id로
const STEPS = [
  { key: 'engage', label: '① 궁금' }, { key: 'explore', label: '② 실험' }, { key: 'explain', label: '③ 개념' },
  { key: 'elaborate', label: '④ 확장' }, { key: 'evaluate', label: '⑤ 점검' },
];
const A = '../assets/';
const BODY = { talk: 'docssam-A1-mouth-closed.webp', surprised: 'docssam-B1-surprised.webp', thinking: 'docssam-B2-thinking.webp', praise: 'docssam-B3-praise.webp', encourage: 'docssam-B4-encourage.webp' };
const FACE = { half: 'face-A2-mouth-half.webp', open: 'face-A3-mouth-open.webp', o: 'face-A4-mouth-o.webp', blink: 'face-A5-eyes-closed.webp' };
const REDUCED = matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CIRC = ['①', '②', '③', '④', '⑤'];

// ── 저장(기기) — 실패해도 화면은 그대로 동작 ──
const KEY = 'sciLab.v2';
const store = {
  all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
  get(u) { return this.all()[u] || {}; },
  set(u, patch) { try { const a = this.all(); a[u] = { ...(a[u] || {}), ...patch }; localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* 저장 불가 기기 */ } },
};

// ── docssam: 말하기(모음에 따라 입 모양) · 깜빡임 · 표정 ──
function mouthFor(ch) {
  const c = ch.charCodeAt(0) - 0xac00; if (c < 0 || c > 11171) return null;
  const j = Math.floor(c / 28) % 21;
  if ([0, 2, 4, 6, 9, 14].includes(j)) return 'open';
  if ([8, 12, 13, 17].includes(j)) return 'o';
  return 'half';
}
let voiceOn = false;
function teacher(el, lines, { big = false } = {}) {
  el.innerHTML = `<div class="teacher ${big ? 'big' : ''}"><div class="bubble" aria-live="polite"></div>
    <div class="char"><img class="body" alt="docssam 선생님"><img class="face" alt=""></div></div>`;
  const $b = el.querySelector('.bubble'), $c = el.querySelector('.char'), $body = el.querySelector('.body'), $face = el.querySelector('.face');
  let alive = true, talking = false;
  const face = (k) => { if (!k) { $face.style.display = 'none'; return; } $face.src = A + FACE[k]; $face.style.display = 'block'; };
  const blink = () => setTimeout(() => { if (!alive || !el.isConnected) return; if (!talking && $body.dataset.mood === 'talk') { face('blink'); setTimeout(() => !talking && face(null), 140); } blink(); }, 3000 + Math.random() * 2000);
  async function say(line) {
    const mood = line.mood || 'talk'; $body.src = A + BODY[mood] ; $body.dataset.mood = mood; face(null);
    $b.classList.toggle('ask', mood === 'surprised' || mood === 'thinking');
    if (voiceOn && 'speechSynthesis' in window) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(line.text); u.lang = 'ko-KR'; speechSynthesis.speak(u); } catch { /* 음성 없음 */ } }
    if (REDUCED) { $b.textContent = line.text; return; }
    talking = true; $c.classList.add('talk'); $b.textContent = '';
    for (const ch of line.text) {
      if (!alive) return; $b.textContent += ch;
      const m = mood === 'talk' ? mouthFor(ch) : null; face(m);
      await new Promise((r) => setTimeout(r, m ? 90 : 150));
      if (m) { face(null); await new Promise((r) => setTimeout(r, 20)); }
    }
    talking = false; $c.classList.remove('talk'); face(null);
  }
  (async () => { for (const l of lines) { await say(l); await new Promise((r) => setTimeout(r, 700)); } })();
  blink();
  return { say, stop() { alive = false; } };
}

// ── 문항 렌더러 (화면·교재 공용) ──
function blanksHtml(text, blanks, { print, show }) {
  let i = 0;
  return esc(text).replace(/\( [①②③④⑤] \)/g, () => {
    const b = blanks[i], k = i++;
    if (print) return show ? `<span class="blank-print ans">${esc(b.answer)}</span>` : '<span class="blank-print">&nbsp;</span>';
    return `<button type="button" class="blank" data-k="${k}" aria-label="빈칸 ${k + 1}, 눌러서 열기">?</button>`;
  });
}
function itemHtml(it, { print = false, show = false, no = '' } = {}) {
  const ac = it.answerContract, lv = `<span class="level">${esc(it.taxonomy.track)} · ${esc(it.taxonomy.level)}</span>`;
  const fig = it.visualModel?.kind === 'authored-svg' ? `<div class="fig">${FIG[it.visualModel.figure] || ''}</div>` : '';
  const giv = it.givens ? Object.entries(it.givens).map(([k, v]) => v && typeof v === 'object' && !Array.isArray(v)
    ? `<table class="tbl"><thead><tr>${Object.keys(v).map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody><tr>${Object.values(v).map((c) => `<td>${esc([].concat(c).join(', '))}</td>`).join('')}</tr></tbody></table>`
    : `<p class="lead">${/^(설명|내용|text|문항|자료|글|지문)$/.test(k) ? '' : k === '보기' ? '<b>〈보기〉</b> ' : `<b>${esc(k)}</b> `}${esc(Array.isArray(v) ? v.join(' / ') : v)}</p>`).join('') : '';
  const head = `<p>${no ? `<span class="no">${no}.</span>` : ''}${ac.type === 'cloze' ? blanksHtml(it.prompt, ac.blanks, { print, show }) : esc(it.prompt)}</p>`;
  let body = '';
  const CZ = !print && ac.type === 'cloze' && MISC?.cloze?.[it.id];
  if (CZ) body = `<div class="chips">${CZ.options.map((opts, k) => `<div class="chip-row" data-k="${k}"><span class="chip-no">${CIRC[k]}</span>${opts.map((o) => `<button type="button" class="chip" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`).join('')}</div><p class="why" hidden></p>`;
  if (ac.type === 'single-choice') {
    body = print ? `<div class="${it.choices.join('').length < 60 ? 'cols' : ''}">${it.choices.map((c, i) => `<div${show && i === ac.answer ? ' class="ans"' : ''}>${CIRC[i]} ${esc(c)}</div>`).join('')}</div>`
      : `<div class="choices">${it.choices.map((c, i) => `<button type="button" class="choice" data-i="${i}">${CIRC[i]} ${esc(c)}</button>`).join('')}</div><p class="why" hidden></p>`;
  } else if (ac.type === 'multi-choice') {
    body = print ? `<div>${it.choices.map((c, i) => `<div${show && ac.answers.includes(i) ? ' class="ans"' : ''}>${CIRC[i]} ${esc(c)}</div>`).join('')}</div>`
      : `<p class="lead">${ac.answers.length}개를 고르세요.</p><div class="choices">${it.choices.map((c, i) => `<button type="button" class="choice" data-i="${i}" aria-pressed="false">${CIRC[i]} ${esc(c)}</button>`).join('')}</div><p class="why" hidden></p>`;
  } else if (ac.type === 'short-text') {
    body = print ? (show ? `<p class="ans">${esc(ac.answer)}</p>` : '<div class="ans-line"></div>')
      : `<div class="short"><input type="text" aria-label="내 답" autocomplete="off"><button type="button" class="btn" data-act="check-short">확인</button></div><p class="why" hidden></p>`;
  } else if (ac.type === 'table-fill') {
    const cols = ac.columns;
    body = `<table class="tbl tfill"><thead><tr><th>${esc(ac.rowHead || '물체')}</th>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${ac.rows.map((r, ri) => `<tr><td>${esc(r.label)}</td>${cols.map((c, ci) => print
      ? `<td>${show ? `<span class="ans">${esc(r.answer[ci])}</span>` : ''}</td>`
      : `<td><select data-r="${ri}" data-c="${ci}" aria-label="${esc(r.label)} ${esc(c)}"><option value="">고르기</option>${ac.options[c].map((o) => `<option>${esc(o)}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</tbody></table>
      ${print ? '' : '<button type="button" class="btn" data-act="check-table">맞았는지 보기</button><p class="why" hidden></p>'}`;
  } else if (ac.type === 'written-explanation') {
    const rb = ac.rubric;
    body = print ? (show ? `<p class="ans">예시 답: ${esc(ac.sample)}</p><ul class="rubric">${rb.required.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '<div class="ans-line"></div><div class="ans-line"></div><div class="ans-line"></div>')
      : `<textarea aria-label="내 답 쓰기"></textarea><details><summary>채점 기준 보기</summary><ul class="rubric">${rb.required.map((r) => `<li><label><input type="checkbox"> ${esc(r)}</label></li>`).join('')}</ul><p class="rubric">통과: ${esc(rb.pass)}${rb.bonus ? ` · 더하기: ${esc(rb.bonus)}` : ''}</p><p class="why">예시 답: ${esc(ac.sample)}</p></details>`;
    if (rb.preview) body += `<p class="preview"><b>미리보기</b> ${esc(rb.preview)}</p>`;
  }
  const expl = print && show ? `<p class="why">${esc(it.explanation)}</p>` : '';
  return `<div class="${print ? 'q' : 'card item'}" data-id="${it.id}">${print ? '' : lv}${head}${fig}${giv}${body}${expl}</div>`;
}
let FIG = {}, BOOKX = {}, MISC = null;
// 오답 → 오개념 교정 문장. 연결된 오개념이 없으면 해설만.
function whyHtml(it, ok, detail) {
  if (ok) return `<b class="ok">맞았어요!</b> ${esc(it.explanation)}`;
  const D = MISC?.distractors?.[it.id], T = MISC?.typed?.[it.id], ms = new Set();
  if (D && detail.picked != null) for (const i of [].concat(detail.picked)) if (D[i]) ms.add(D[i]);
  if (T && detail.typed) { let hit = false; for (const [re, m] of T.pats || []) if (re.test(detail.typed)) { ms.add(m); hit = true; } if (!hit && T.any) ms.add(T.any); }
  if (detail.m) ms.add(detail.m);
  const fixes = [...ms].map((m) => MISC.misconceptions[m]).filter(Boolean);
  return fixes.length ? fixes.map((f) => `<span class="mis-tag">${esc(f.label)}</span><span class="fix">${f.fix}</span>`).join('') : `<b class="no">다시 생각해 봐요.</b> ${esc(it.explanation)}`;
}
// ctx = { u, stage } 가 있으면 결과를 기록한다. onDone(ok, detail)
function wireItem(card, it, onDone, ctx) {
  const ac = it.answerContract;
  const done = (ok, detail = {}) => { if (ctx) record(du(ctx.u), it, ctx.stage, ok, detail, MISC); onDone?.(ok, detail); };
  const CZ = ac.type === 'cloze' && MISC?.cloze?.[it.id];
  if (CZ) {
    const $why = card.querySelector('.why'), got = {};
    card.querySelectorAll('.chip-row').forEach((row) => row.querySelectorAll('.chip').forEach((ch) => ch.addEventListener('click', () => {
      if (row.dataset.done) return; row.dataset.done = 1;
      const k = +row.dataset.k, v = ch.dataset.v, ok = ac.blanks[k].accepted.includes(v) || ac.blanks[k].answer === v; got[k] = ok;
      const b = card.querySelector(`.blank[data-k="${k}"]`); b.innerHTML = ok ? esc(v) : `<s>${esc(v)}</s> ${esc(ac.blanks[k].answer)}`; b.classList.add('open', ok ? 'right' : 'wrong');
      ch.classList.add(ok ? 'right' : 'wrong'); if (!ok) row.querySelector(`.chip[data-v="${CSS.escape(ac.blanks[k].answer)}"]`)?.classList.add('right');
      if (Object.keys(got).length === ac.blanks.length) { const wrong = Object.entries(got).filter(([, o]) => !o).map(([i]) => +i), all = !wrong.length;
        $why.hidden = false; $why.innerHTML = whyHtml(it, all, { m: all ? null : CZ.wrong }); done(all, { wrongBlanks: wrong, picked: null }); }
    })));
  } else card.querySelectorAll('.blank').forEach((b) => b.addEventListener('click', () => { b.textContent = ac.blanks[+b.dataset.k].answer; b.classList.add('open'); if ([...card.querySelectorAll('.blank')].every((x) => x.classList.contains('open'))) done(true, { revealed: true }); }));
  if (ac.type === 'single-choice') {
    const $why = card.querySelector('.why');
    card.querySelectorAll('.choice').forEach((btn) => btn.addEventListener('click', () => {
      if (card.dataset.done) return; card.dataset.done = 1;
      const i = +btn.dataset.i, ok = i === ac.answer;
      btn.classList.add(ok ? 'right' : 'wrong'); card.querySelector(`.choice[data-i="${ac.answer}"]`).classList.add('right');
      $why.hidden = false; $why.innerHTML = whyHtml(it, ok, { picked: i }); done(ok, { picked: i });
    }));
  }
  if (ac.type === 'multi-choice') {
    const $why = card.querySelector('.why'), picked = new Set();
    card.querySelectorAll('.choice').forEach((btn) => btn.addEventListener('click', () => {
      if (card.dataset.done) return; const i = +btn.dataset.i;
      picked.has(i) ? picked.delete(i) : picked.add(i); btn.classList.toggle('sel', picked.has(i)); btn.setAttribute('aria-pressed', picked.has(i));
      if (picked.size < ac.answers.length) return;
      card.dataset.done = 1; const ok = ac.answers.every((a) => picked.has(a));
      card.querySelectorAll('.choice').forEach((b) => { const k = +b.dataset.i; if (ac.answers.includes(k)) b.classList.add('right'); else if (picked.has(k)) b.classList.add('wrong'); });
      const pk = [...picked].filter((k) => !ac.answers.includes(k));
      $why.hidden = false; $why.innerHTML = whyHtml(it, ok, { picked: pk }); done(ok, { picked: pk });
    }));
  }
  if (ac.type === 'short-text') {
    const $in = card.querySelector('input'), $why = card.querySelector('.why');
    const norm = (x) => String(x).replace(/[\s()·.,/:\-]/g, '').replace(/ㄱ/g, '㉠').replace(/ㄴ/g, '㉡').replace(/ㄷ/g, '㉢').replace(/ㄹ/g, '㉣').replace(/[oO]/g, '○').replace(/[xX]/g, '×').toUpperCase();
    const check = () => { if (card.dataset.done || !$in.value.trim()) return; card.dataset.done = 1;
      const ok = ac.accepted.some((a) => norm(a) === norm($in.value)); $in.readOnly = true; $in.classList.add(ok ? 'right' : 'wrong');
      $why.hidden = false; $why.innerHTML = `${ok ? '' : `<b class="no">정답: ${esc(ac.answer)}</b> `}${whyHtml(it, ok, { typed: $in.value })}`; done(ok, { typed: $in.value }); };
    card.querySelector('[data-act=check-short]').addEventListener('click', check);
    $in.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
  }
  card.querySelector('[data-act=check-table]')?.addEventListener('click', () => {
    if (card.dataset.done) return; const sels = [...card.querySelectorAll('select')];
    if (sels.some((s) => !s.value)) { sels.find((s) => !s.value).focus(); return; }
    let right = 0, total = 0;
    sels.forEach((s) => { total++; const ok = s.value === ac.rows[+s.dataset.r].answer[+s.dataset.c]; if (ok) right++; s.classList.add(ok ? 'right' : 'wrong'); s.disabled = true; });
    card.dataset.done = 1;
    const all = right === total, $why = card.querySelector('.why'); $why.hidden = false;
    $why.innerHTML = `<b class="${all ? 'ok' : 'no'}">${total}칸 중 ${right}칸 맞았어요.</b> ${whyHtml(it, all, { m: all ? null : MISC?.cells?.[it.id] })}`; done(all, { wrongCells: !all });
  });
}

// ── 화면 뼈대 ──
function frame(u, lesson, stepIdx, inner, { next, nextLabel = '다음' } = {}) {
  const st = store.get(u);
  $app.innerHTML = `<header class="top"><div class="wrap">
      <a class="back" href="#/">‹ 지도로</a><h1>${esc(lesson.title)}</h1>
      ${stepIdx != null ? `<nav class="dots" aria-label="단계">${STEPS.map((s, i) => `<a href="#/${u}/${i + 1}" class="${i === stepIdx ? 'on' : (st.done || []).includes(i) ? 'done' : ''}" aria-label="${s.label}"></a>`).join('')}</nav>` : ''}
      ${MISC ? `<a class="icon-btn diag-link" href="#/${u}/diagnose" title="진단·처방">진단</a>` : ''}<button class="icon-btn" id="voice" aria-pressed="${voiceOn}" title="읽어 주기">${voiceOn ? '소리 켬' : '소리'}</button>
    </div></header>
    <main class="wrap">${inner}</main>
    ${next ? `<div class="bottom"><div class="wrap"><a class="btn primary" href="${next}" style="display:flex;align-items:center;justify-content:center;text-decoration:none">${nextLabel}</a></div></div>` : ''}`;
  $app.querySelector('#voice').addEventListener('click', (e) => { voiceOn = !voiceOn; e.currentTarget.setAttribute('aria-pressed', voiceOn); e.currentTarget.textContent = voiceOn ? '소리 켬' : '소리'; if (!voiceOn) try { speechSynthesis.cancel(); } catch { /* */ } });
  if (stepIdx != null) { const d = new Set(st.done || []); d.add(stepIdx); store.set(u, { done: [...d], step: stepIdx }); }
  scrollTo(0, 0);
}
const byId = (items) => Object.fromEntries(items.map((i) => [i.id, i]));
// 실제 사진·영상(위키미디어 공용 등 자유 이용 자료). 출처는 항상 화면에 같이 보인다.
const videoHtml = (v) => v ? `<figure class="card media video"><h3>${esc(v.title)}</h3>
    <video controls playsinline preload="metadata" ${v.poster ? `poster="${v.poster}"` : ''}><source src="${v.src}" type="video/webm">${v.mp4 ? `<source src="${v.mp4}" type="video/mp4">` : ''}<source src="${v.full}" type="video/webm"></video>
    <figcaption>실제 영상 · <a href="${v.page}" target="_blank" rel="noopener">${esc(v.credit)}</a> · 안 보이면 <a href="${v.page}" target="_blank" rel="noopener">여기서 보기</a></figcaption></figure>` : '';
const galleryHtml = (g, title = '실제로 보기') => g?.length ? `<section class="card media"><h3>${esc(title)}</h3><div class="gallery">${g.map((m) => `<figure class="${m.tall ? 'tall' : ''}"><img src="${m.src}" alt="${esc(m.cap)}" loading="lazy"><figcaption>${esc(m.cap)}<small><a href="${m.page}" target="_blank" rel="noopener">${esc(m.credit)}</a></small></figcaption></figure>`).join('')}</div></section>` : '';

// ① 궁금
function stepEngage(u, L) {
  const e = L.engage, st = store.get(u);
  frame(u, L, 0, `<p class="step-label">${STEPS[0].label}</p><div id="t"></div>
    <div id="s3d"></div>${videoHtml(L.media?.engage)}
    <div class="card"><h3>${esc(e.question)}</h3><div class="choices">${e.predictions.map((p) => `<button type="button" class="choice ${st.prediction === p.id ? 'sel' : ''}" data-p="${p.id}">${esc(p.text)}</button>`).join('')}</div>
    <p class="why">정답은 실험을 해 본 뒤에 알려 줄게요.</p></div>`, { next: `#/${u}/2`, nextLabel: '실험하러 가기' });
  teacher(document.getElementById('t'), e.say);
  mount3D(document.getElementById('s3d'), e.scene, { autoplay: true });
  $app.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { store.set(u, { prediction: b.dataset.p }); $app.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('sel', x === b)); }));
}

// ② 실험 (가상 실험실 · 3D 보기 · 집 실험)
function stepExplore(u, L, mode) {
  const x = L.explore; mode = mode || 'lab';
  const names = { lab: '가상 실험실', scene: '3D로 보기', home: '집에서 실험' };
  frame(u, L, 1, `<p class="step-label">${STEPS[1].label}</p><div id="t"></div>
    <div class="modes" role="tablist">${x.modes.map((m) => `<button role="tab" aria-selected="${m === mode}" data-m="${m}">${names[m]}</button>`).join('')}</div>
    <div id="pane"></div>`, { next: `#/${u}/3`, nextLabel: '개념 정리하러 가기' });
  teacher(document.getElementById('t'), x.say);
  $app.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/${u}/2/${b.dataset.m}`; }));
  const pane = document.getElementById('pane');
  if (mode === 'lab') {
    pane.innerHTML = `<div class="card"><p><b>${esc(x.lab.goal)}</b></p><div id="lab"></div></div>`;
    mountLabOf(x.lab.kind)(document.getElementById('lab'), { ...x.lab, rows: store.get(u).labRows || [], onRecord: (rows) => store.set(u, { labRows: rows }) });
  } else if (mode === 'scene') {
    mount3D(pane, L.engage.scene, { autoplay: false });
    if (L.media?.explore) pane.insertAdjacentHTML('beforeend', videoHtml(L.media.explore));
  } else {
    pane.innerHTML = kitHtml(u, x.home);
  }
}
function kitHtml(u, h) {
  const buy = h.materials.filter((m) => m.have === 'buy');
  const link = (m) => m.buy.coupangUrl || `https://www.coupang.com/np/search?q=${encodeURIComponent(m.buy.query)}`;
  return `<div class="card"><h3>${esc(h.title)} <span class="level">${h.minutes}분 · ${h.guardian ? '보호자와 함께' : '혼자 해도 돼요'}</span></h3>
    <div class="kit-qr"><img src="${h.qr}" alt="준비물 페이지로 가는 QR"><p class="lead">부모님 휴대폰으로 QR을 찍으면 준비물을 바로 살 수 있어요. 결제는 부모님이 해요.</p></div></div>
    <div class="card"><h3>준비물</h3>${h.materials.map((m) => `<div class="mat"><span class="name">${esc(m.name)} <small class="lead">${esc(m.qty)}</small></span>${m.have === 'home' ? '<span class="tag">집에 있음</span>' : `<a class="buy" href="${esc(link(m))}" target="_blank" rel="noopener">쿠팡에서 찾기</a>`}</div>`).join('')}
    ${buy.length ? '<p class="lead" style="margin-top:8px">로켓배송 표시가 있는 상품을 고르면 배송비 부담이 적어요.</p>' : ''}</div>
    <div class="card"><h3>순서</h3><ol class="steps">${h.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    <div class="card safety"><h3>안전</h3><ul>${h.safety.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>`;
}

// ③ 개념
function stepExplain(u, L, items) {
  const x = L.explain, I = byId(items), st = store.get(u), rows = st.labRows || [];
  const best = rows.reduce((a, r) => (!a || r.height > a.height ? r : a), null);
  const pred = L.engage.predictions.find((p) => p.id === st.prediction);
  frame(u, L, 2, `<p class="step-label">${STEPS[2].label}</p><div id="t"></div>
    ${pred ? `<div class="card from-data">네 예상: <b>${esc(pred.text)}</b> — ${st.prediction === L.engage.answer ? '실험 결과와 같았어요!' : (L.engage.wrongNote || '실험 결과는 달랐어요. 마주 보는 면의 극이 까닭이었어요.')}</div>` : ''}
    ${(() => { const fd = typeof x.fromData === 'function' ? x.fromData(rows) : best ? `${x.fromData.replace('{floating}', best.floating)} (탑 높이 ${best.height}칸)` : ''; return fd ? `<div class="card from-data">${esc(fd)}</div>` : ''; })()}
    <p class="analogy">${esc(x.analogy)}</p>
    ${galleryHtml(L.media?.gallery)}
    ${x.cards.map((id) => itemHtml(I[id])).join('')}
    ${itemHtml(I[x.table])}
    <h3>잠깐 확인</h3>${x.miniTest.map((id) => itemHtml(I[id])).join('')}`, { next: `#/${u}/4`, nextLabel: '영재원 문제로 넓히기' });
  teacher(document.getElementById('t'), x.say, { big: true });
  $app.querySelectorAll('.item').forEach((c) => wireItem(c, I[c.dataset.id], null, { u, stage: x.miniTest.includes(c.dataset.id) ? 'mini' : 'concept' }));
}

// ④ 확장
function stepElaborate(u, L, items) {
  const x = L.elaborate, I = byId(items);
  frame(u, L, 3, `<p class="step-label">${STEPS[3].label}</p><div id="t"></div>
    <div class="card reading"><h3>${esc(x.reading.title)}</h3>${L.media?.reading ? `<figure class="side"><img src="${L.media.reading.src}" alt="${esc(L.media.reading.cap)}" loading="lazy"><figcaption>${esc(L.media.reading.cap)}<small>${esc(L.media.reading.credit)}</small></figcaption></figure>` : ''}<p>${esc(x.reading.text)}</p></div>
    ${x.items.map((id) => itemHtml(I[id])).join('')}
    ${x.report ? `<div class="card"><h3>탐구보고서</h3><p class="lead">실험 기록이 보고서에 자동으로 들어가 있어요. 빈칸만 내 말로 채워요.</p><a class="btn" href="#/${u}/report" style="display:inline-flex;align-items:center;text-decoration:none">보고서 쓰기</a></div>` : ''}`,
  { next: `#/${u}/5`, nextLabel: '마지막 점검' });
  teacher(document.getElementById('t'), x.say);
  $app.querySelectorAll('.item').forEach((c) => wireItem(c, I[c.dataset.id], null, { u, stage: 'elaborate' }));
}

// ⑤ 점검 — 관문 2/3, 다시 풀기는 보기 섞기
function shuffleItem(it) {
  if (it.answerContract.type !== 'single-choice') return it;
  const order = it.choices.map((_, i) => i).sort(() => Math.random() - 0.5);
  return { ...it, choices: order.map((i) => it.choices[i]), answerContract: { ...it.answerContract, answer: order.indexOf(it.answerContract.answer) } };
}
function stepEvaluate(u, L, items, retry = false) {
  const x = L.evaluate, I = byId(items);
  const list = x.items.map((id) => (retry ? shuffleItem(I[id]) : I[id]));
  frame(u, L, 4, `<p class="step-label">${STEPS[4].label}</p><div id="t"></div>
    ${list.map((it, k) => itemHtml(it, { no: k + 1 })).join('')}<div id="res"></div>`);
  teacher(document.getElementById('t'), x.say);
  let answered = 0, right = 0; const wrongIds = [];
  $app.querySelectorAll('.item').forEach((c, k) => wireItem(c, list[k], (ok) => {
    answered++; if (ok) right++; else wrongIds.push(list[k].id);
    if (answered === list.length) {
      const pass = right >= x.pass; store.set(u, { passed: pass || store.get(u).passed, best: Math.max(right, store.get(u).best || 0) });
      const diag = MISC ? `<a class="btn" href="#/${u}/diagnose" style="display:inline-flex;align-items:center;text-decoration:none">진단 보기</a>` : '';
      document.getElementById('res').innerHTML = `<div class="card result"><p class="score">${right} / ${list.length}</p>
        <p>${pass ? '관문 통과! 깃발을 받았어요.' : `${x.pass}문제 이상 맞으면 통과예요.`}</p>
        <div class="print-bar" style="justify-content:center">${pass ? `<button class="btn" id="again">다시 풀기</button>${diag}<a class="btn primary" href="#/" style="display:inline-flex;align-items:center;text-decoration:none">다음 정거장</a>` : `<a class="btn" href="#/${u}/3" style="display:inline-flex;align-items:center;text-decoration:none">개념 다시 보기</a>${diag}<button class="btn primary" id="again">다시 풀기</button>`}</div></div>
        ${MISC && wrongIds.length ? `<div id="drill"></div>` : ''}`;
      teacher(document.getElementById('t'), [{ mood: pass ? 'praise' : 'encourage', text: pass ? '정말 잘했어요!' : '괜찮아요, 한 번 더 해 볼까요?' }]);
      document.getElementById('again').addEventListener('click', () => stepEvaluate(u, L, items, true));
      if (MISC && wrongIds.length) drillFor(u, wrongIds, document.getElementById('drill'));
    }
  }, { u, stage: 'evaluate' }));
}

// 틀린 문항의 오개념마다 유사문항 한 판 더(같은 오개념이 오답 보기로 들어 있는 문항, 안 푼 것 먼저)
function drillFor(u, wrongIds, el) {
  const pool = [...(BOOKX.similar || []), ...(BOOKX.items || [])];
  const L = readLog(du(u)), ms = new Set();
  for (const id of wrongIds) { const e = [...L].reverse().find((x) => x.id === id); for (const m of e?.m || []) ms.add(m); }
  if (!ms.size) return;
  el.innerHTML = `<h3 class="h-drill">틀린 까닭으로 한 판 더</h3>` + [...ms].map((m) => { const M = MISC.misconceptions[m], its = remedyItems(du(u), m, MISC, pool, 2).filter((i) => !wrongIds.includes(i.id));
    return its.length ? `<div class="card drill"><p class="mis-tag">${esc(M.label)}</p><p class="fix">${M.fix}</p></div>${its.map((it) => itemHtml(it)).join('')}` : ''; }).join('');
  const I = Object.fromEntries(pool.map((i) => [i.id, i]));
  el.querySelectorAll('.item').forEach((c) => wireItem(c, I[c.dataset.id], null, { u, stage: 'remedy' }));
}

// 진단·분석·처방 — 학습 중 고른 오답을 오개념표로 읽어 정리한다(학생용/강사용, 인쇄)
function pageDiagnose(u, L, items, mode = 'student') {
  const A = analyze(du(u), MISC), tx = BOOKX.taxonomy, pool = [...(BOOKX.similar || []), ...items];
  const I = Object.fromEntries(pool.map((i) => [i.id, i])), T = mode === 'teacher';
  const STAGE = { concept: '개념', mini: '잠깐 확인', elaborate: '확장', evaluate: '점검', sub: '유형별', remedy: '한 판 더', book: '교재', 'book-concept': '교재 개념' };
  const ST = { confirmed: ['확정', 'st-c'], suspected: ['의심', 'st-s'], resolved: ['해소', 'st-r'] };
  const pct = (o) => (o.tot ? Math.round((o.ok / o.tot) * 100) : null);
  const bar = (name, o) => { const p = pct(o); return `<div class="bar"><span>${esc(name)}</span><i><b style="width:${p ?? 0}%" class="${p == null ? '' : p < 60 ? 'weak' : p < 80 ? 'mid' : 'good'}"></b></i><em>${p == null ? '—' : `${p}%`}<small> ${o.ok}/${o.tot}</small></em></div>`; };
  const elems = (tx?.elements || []).map((e) => bar(e.name, A.byElement[e.id] || { ok: 0, tot: 0 })).join('');
  const pickText = (e) => { const it = I[e.id]; if (e.chip) return `'${e.chip}' 자리를 틀림`; if (!it) return ''; if (e.picked != null && it.choices) return [].concat(e.picked).map((i) => `${CIRC[i]} ${it.choices[i]}`).join(' / '); if (e.typed) return `"${e.typed}"`; return '빈칸·표를 틀림'; };
  const evText = (e) => (e.id.startsWith('book:') ? '개념 정리 빈칸' : `${I[e.id]?.prompt?.slice(0, 40) || e.id}…`);
  const cards = A.order.map((m, ci) => { const M = MISC.misconceptions[m], r = A.mis[m], [lab, cls] = ST[r.status];
    const rem = remedyItems(du(u), m, MISC, pool, 3);
    return `<section class="card mis ${cls}"><div class="mis-head"><span class="st">${lab}</span><h3>${esc(M.label)}</h3></div>
      <p class="fix">${M.fix}</p>
      <details ${T ? 'open' : ''}><summary>근거 ${r.wrong.length}건${r.streak ? ` · 그 뒤 ${r.streak}번 연속 맞힘` : ''}</summary><ul class="ev">${r.wrong.map((e) => `<li><b>${esc(STAGE[e.stage] || e.stage)}</b> ${esc(evText(e))} → <span class="picked">${esc(pickText(e))}</span></li>`).join('')}</ul></details>
      ${r.status === 'resolved' ? '' : `<div class="rx"><b>처방</b> <a href="#/${u}/${MISC.remedy?.[m]?.step || 3}">${['', '궁금', '실험', '개념', '확장', '점검'][MISC.remedy?.[m]?.step || 3]} 화면 다시 보기</a> · 아래 ${rem.length}문제로 확인</div>
      <details class="rx-d" ${ci === 0 ? 'open' : ''}><summary>처방 문제 ${rem.length}개 풀기</summary><div class="rx-items">${rem.map((it) => itemHtml(it)).join('')}</div></details>`}</section>`; }).join('');
  const verdict = !A.total ? '아직 푼 문제가 없어요. 5단계 탐구나 유형별 문제를 풀면 여기에 진단이 쌓여요.'
    : A.order.filter((m) => A.mis[m].status === 'confirmed').length ? `되풀이되는 오개념이 <b>${A.order.filter((m) => A.mis[m].status === 'confirmed').length}개</b> 있어요. 빨간 카드부터 처방 문제를 풀어요.`
    : A.order.filter((m) => A.mis[m].status === 'suspected').length ? '한 번씩 헷갈린 것이 있어요. 노란 카드의 문제로 확인해요.' : '오개념 없이 잘 이해하고 있어요!';
  frame(u, L, null, `<p class="step-label">진단 · 분석 · 처방</p><h2>${esc(L.title)}</h2>
    <div class="print-bar no-print"><a class="btn${T ? '' : ' primary'}" href="#/${u}/diagnose">학생용</a><a class="btn${T ? ' primary' : ''}" href="#/${u}/diagnose/teacher">강사용</a><button class="btn" onclick="print()">인쇄</button>${T ? '<button class="btn" id="reset">기록 지우기</button>' : ''}</div>
    <div class="card sum"><p class="score">${A.right} / ${A.total}</p><p class="verdict">${verdict}</p>
      <p class="legend"><span class="st st-c">확정</span> 서로 다른 문제 2개 이상에서 같은 오개념 <span class="st st-s">의심</span> 1번 <span class="st st-r">해소</span> 그 뒤 2번 연속 맞힘${A.slips ? ` · 단순 실수 ${A.slips}` : ''}${A.reveals ? ` · 답 열어 봄 ${A.reveals}` : ''}</p></div>
    <div class="card"><h3>소단원별 정답률</h3>${elems}</div>
    ${cards || ''}
    ${T ? `<div class="card"><h3>유형별 정답률</h3>${(tx?.types || []).filter((t) => A.byType[t.id]).map((t) => bar(t.name, A.byType[t.id])).join('') || '<p class="lead">아직 없음</p>'}</div>` : ''}`);
  $app.querySelectorAll('.rx-items .item').forEach((c) => wireItem(c, I[c.dataset.id], () => setTimeout(() => pageDiagnose(u, L, items, mode), 1400), { u, stage: 'remedy' }));
  $app.querySelector('#reset')?.addEventListener('click', () => { if (confirm('이 단원의 학습 기록을 지울까요?')) { clearLog(du(u)); pageDiagnose(u, L, items, mode); } });
}

// 소단원 = 교육과정 내용 요소. 유형별로 유사문항을 푼다.
function pageSub(u, L, eid) {
  const tx = BOOKX.taxonomy, sim = BOOKX.similar || [], e = tx?.elements.find((x) => x.id === eid);
  if (!e) { location.replace('#/'); return; }
  const types = tx.types.filter((t) => t.element === e.id);
  frame(u, L, null, `<p class="step-label">소단원 ${tx.elements.indexOf(e) + 1}</p><h2>${esc(e.name)}</h2>
    ${L.engage ? `<div class="print-bar"><a class="btn primary" href="#/${u}/1" style="display:inline-flex;align-items:center;text-decoration:none">5단계 탐구로 배우기</a></div>` : ''}
    <nav class="modes" aria-label="소단원">${tx.elements.map((x, i) => `<a href="#/${u}/sub/${x.id}" class="btn" style="display:inline-flex;align-items:center;text-decoration:none;min-height:44px;font-size:17px${x.id === e.id ? ';background:var(--navy);color:var(--on-navy)' : ''}">${i + 1}</a>`).join('')}</nav>
    ${types.map((t) => `<h3>${esc(t.name)}</h3><p class="lead">${esc(t.desc)}</p>${sim.filter((s) => s.taxonomy.type === t.id).map((s) => itemHtml(s)).join('')}`).join('')}`);
  const I = Object.fromEntries(sim.map((s) => [s.id, s]));
  $app.querySelectorAll('.item').forEach((c) => wireItem(c, I[c.dataset.id], null, { u, stage: 'sub' }));
}

// 준비물 페이지 (QR 도착지)
function pageKit(u, L) {
  frame(u, L, null, `<p class="step-label">준비물</p><h2>${esc(L.explore.home.title)}</h2>${kitHtml(u, L.explore.home)}
    <p class="lead"><a href="#/${u}/1">학습 처음으로</a></p>`);
}

// 탐구보고서 — 자동 채움 + 기기 저장 + 인쇄
function reportAuto(u, L) {
  const st = store.get(u), h = L.explore.home, rows = st.labRows || [];
  const pred = L.engage.predictions.find((p) => p.id === st.prediction);
  return {
    'engage.question': L.engage.question,
    'engage.prediction': pred ? `${pred.text}(이)라고 예상했어요.` : '',
    'explore.home.materials': h.materials.map((m) => `${m.name} ${m.qty}`).join(', '),
    'explore.home.steps': h.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    'explore.lab.table': rows.length ? rows.map((r) => (L.explore.lab.rowText ? L.explore.lab.rowText(r) : `${r.shape} → 떠 있는 층 ${r.floating}, 높이 ${r.height}칸`)).join('\n') : '',
  };
}
function pageReport(u, L) {
  const R = L.report, auto = reportAuto(u, L), saved = store.get(u).report || {};
  frame(u, L, null, `<p class="step-label">탐구보고서</p><h2>${esc(R.title)}</h2>
    <div class="print-bar no-print"><button class="btn" onclick="print()">A4로 인쇄</button><a class="btn" href="#/${u}/4" style="display:inline-flex;align-items:center;text-decoration:none">확장으로 돌아가기</a></div>
    <form class="report card">${R.sections.map((s) => `<label for="r-${s.key}">${esc(s.label)}</label>${s.hint ? `<p class="hint">${esc(s.hint)}</p>` : ''}
      <textarea id="r-${s.key}" data-k="${s.key}">${esc(saved[s.key] ?? (s.from ? auto[s.from] : s.default) ?? '')}</textarea>`).join('')}
    </form>
    <div class="card"><h3>스스로 점검</h3><ul class="checks">${R.checks.map((c) => `<li><label><input type="checkbox"> ${esc(c)}</label></li>`).join('')}</ul></div>`);
  $app.querySelectorAll('textarea[data-k]').forEach((t) => t.addEventListener('input', () => { const r = store.get(u).report || {}; r[t.dataset.k] = t.value; store.set(u, { report: r }); }));
}

// 교재 인쇄: student(빈칸) · teacher(정답 포함) · answers(정답·해설만)
function pageBook(u, L, items, mode) {
  const I = byId(items), show = mode === 'teacher';
  const kyo = items.filter((i) => i.taxonomy.track === '교과'), yeong = items.filter((i) => i.taxonomy.track === '영재성');
  const h = L.explore?.home; let n = 0;
  const qs = (list) => list.map((it) => itemHtml(it, { print: true, show, no: ++n })).join('');
  const answers = () => { let k = 0; return [...kyo, ...yeong].map((it) => { k++; const ac = it.answerContract;
    const a = ac.type === 'single-choice' ? CIRC[ac.answer] : ac.type === 'cloze' ? ac.blanks.map((b) => b.answer).join(', ') : ac.type === 'table-fill' ? ac.rows.map((r) => `${r.label}: ${r.answer.join('·')}`).join(' / ') : ac.sample;
    return `<div class="q"><span class="no">${k}.</span> <b class="ans">${esc(a)}</b> — ${esc(it.explanation)}</div>`; }).join(''); };
  const chapter = mode === 'answers' || !L.explain ? '' : `
    <section class="page"><h2>${esc(L.title)} — 개념 정리</h2>
      <p class="analogy">${esc(L.explain.analogy)}</p>
      ${L.explain.cards.map((id) => itemHtml(I[id], { print: true, show })).join('')}
      ${itemHtml(I[L.explain.table], { print: true, show })}</section>
    <section class="page page-break"><h2>실험 — ${esc(h.title)}</h2>
      <p><b>알아볼 것</b> ${esc(L.engage.question)}</p>
      <p><b>원리</b> ${esc(L.explain.principle || '같은 극끼리는 밀어 내고 다른 극끼리는 끌어당겨요(개념 정리 쪽).')}</p>
      <div class="kit-qr"><img src="${h.qr}" alt="준비물 QR" style="width:30mm;height:30mm"><div><b>준비물</b><ul>${h.materials.map((m) => `<li>${esc(m.name)} ${esc(m.qty)}${m.have === 'buy' ? ' (QR로 구매)' : ''}</li>`).join('')}</ul></div></div>
      <h3>순서</h3><ol class="steps">${h.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <h3>안전</h3><ul>${h.safety.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h3>결과 기록</h3><table class="tbl"><thead><tr>${L.explore.lab.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${[1, 2, 3, 4].map(() => `<tr>${L.explore.lab.columns.map(() => '<td>&nbsp;</td>').join('')}</tr>`).join('')}</tbody></table></section>
    <section class="page page-break rep-print"><h2>탐구보고서</h2>${L.report.sections.map((s) => `<h3>${esc(s.label)}</h3><div class="ans-line"></div><div class="ans-line"></div>`).join('')}</section>
    <section class="page page-break"><h2>문제 — 교과</h2>${qs(kyo)}</section>
    <section class="page page-break"><h2>문제 — 영재성</h2>${qs(yeong)}</section>`;
  const tx = BOOKX.taxonomy, sim = BOOKX.similar || [];
  const typed = mode !== 'answers' && tx && sim.length ? tx.elements.map((e) => `<section class="page page-break"><h2>유형별 문제 — ${esc(e.name)}</h2>
      ${tx.types.filter((t) => t.element === e.id).map((t) => `<h3>${esc(t.name)}</h3><p class="lead">${esc(t.desc)}</p>${sim.filter((s) => s.taxonomy.type === t.id).map((s) => itemHtml(s, { print: true, show, no: ++n })).join('')}`).join('')}</section>`).join('') : '';
  const simAns = () => { let k = kyo.length + yeong.length; return sim.map((it) => { k++; const ac = it.answerContract;
    const a = ac.type === 'single-choice' ? CIRC[ac.answer] : ac.type === 'multi-choice' ? ac.answers.map((i) => CIRC[i]).join(', ') : ac.type === 'short-text' ? ac.answer : ac.sample;
    return `<div class="q"><span class="no">${k}.</span> <b class="ans">${esc(a)}</b> — ${esc(it.explanation)}</div>`; }).join(''); };
  const tail = mode === 'student' ? '' : `<section class="page page-break"><h2>정답·해설</h2>${answers()}${simAns()}</section>`;
  $app.innerHTML = `<div class="book"><div class="wrap no-print print-bar">
      <a class="btn" href="#/${u}/print/student" style="display:inline-flex;align-items:center;text-decoration:none">학생용</a>
      <a class="btn" href="#/${u}/print/teacher" style="display:inline-flex;align-items:center;text-decoration:none">교사용</a>
      <a class="btn" href="#/${u}/print/answers" style="display:inline-flex;align-items:center;text-decoration:none">정답·해설만</a>
      <button class="btn primary" onclick="print()">인쇄</button></div>
    <div class="wrap">${chapter}${typed}${tail}</div></div>`;
}

// GFIELD 실험 과학 영재 — 실험 교재(웹·A4 인쇄)와 화면 수업 자료(가르치기·스스로 공부하기)
const BOOKS = { 's41-u03': () => import('../data/book/s41-u03.book.js'), 's41-u03b': () => import('../data/book/s41-u03b.book.js') };
function labBar(u, cur) {
  const b = (href, t, k) => `<a class="btn${cur === k ? ' primary' : ''}" href="${href}">${t}</a>`;
  return `<div class="bk-bar no-print">${b(`#/${u}/lab-book/student`, '교재 · 학생용', 'student')}${b(`#/${u}/lab-book/teacher`, '교재 · 강사용', 'teacher')}
    <button class="btn" onclick="print()">A4 인쇄</button><span class="sep"></span>
    ${b(`#/${u}/lab-class/self`, '스스로 공부하기', 'self')}${b(`#/${u}/lab-class/teach`, '가르치기 (수업 화면)', 'teach')}</div>`;
}
async function pageLabBook(u, mod, mode) {
  if (!BOOKS[u]) { $app.innerHTML = '<main class="wrap"><p>이 단원의 실험 교재는 준비 중이에요.</p></main>'; return; }
  const [{ chapter, art, media }, { renderChapter, fitPages }, { wireLive }] = await Promise.all([BOOKS[u](), import('./book.js'), import('./live.js')]);
  $app.innerHTML = `<header class="top no-print"><div class="wrap"><a class="back" href="#/">‹ 지도로</a><h1>${esc(chapter.book)} · ${esc(chapter.title)}</h1></div></header>
    <main class="wrap">${labBar(u, mode)}</main>${renderChapter(chapter, art, mod.similar || [], { teacher: mode === 'teacher', live: true, media })}`;
  scrollTo(0, 0);
  const bk = $app.querySelector('.bk'), fit = () => bk.isConnected && fitPages(bk), L = mod.lesson;
  fit(); document.fonts?.ready.then(fit);
  const I = Object.fromEntries([...(mod.similar || []), ...(mod.items || [])].map((i) => [i.id, i]));
  const onAnswer = (kind, p) => {
    if (kind === 'item' && I[p.id]) record(du(u), I[p.id], 'book', p.ok, { picked: p.picked }, MISC);
    if (kind === 'blank' && MISC) { const pseudo = { id: `book:${p.chip}`, taxonomy: { element: MISC.misconceptions[MISC.bookChips?.[p.chip]?.[1]]?.element } };
      record(du(u), pseudo, 'book-concept', p.ok, { chip: p.ok ? null : p.chip, revealed: p.revealed }, MISC); }
  };
  if (L) wireLive(bk, { scene: (el) => mount3D(el, L.engage.scene, { autoplay: true }),
    lab: (el) => mountLabOf(L.explore.lab.kind)(el, { ...L.explore.lab, rows: store.get(u).labRows || [], onRecord: (rows) => store.set(u, { labRows: rows }) }),
    misc: MISC, onAnswer });
}
async function pageLabClass(u, mod, L, mode, idx) {
  if (!BOOKS[u]) { $app.innerHTML = '<main class="wrap"><p>이 단원의 수업 자료는 준비 중이에요.</p></main>'; return; }
  const [{ chapter, art, plan }, { renderDeck }] = await Promise.all([BOOKS[u](), import('./deck.js')]);
  renderDeck($app, { u, ch: chapter, art, plan, similar: mod.similar || [], mode, idx,
    mount3D: (el) => mount3D(el, L.engage.scene, { autoplay: false }),
    mountLab: (el) => mountLabOf(L.explore.lab.kind)(el, { ...L.explore.lab, rows: store.get(u).labRows || [], onRecord: (rows) => store.set(u, { labRows: rows }) }) });
}

// ── 라우터 ──
async function route() {
  const [u, a, b] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!u) return pageHome($app, store, teacher);
  const load = UNITS[u]; if (!load) { $app.innerHTML = '<main class="wrap"><p>단원을 찾을 수 없어요.</p></main>'; return; }
  const mod = await load(); const L = mod.lesson || { title: mod.taxonomy?.title || u }, items = mod.items || []; if (mod.media) L.media = mod.media; FIG = mod.figures || {}; BOOKX = { taxonomy: mod.taxonomy, similar: mod.similar, items }; MISC = mod.misc || null;
  if (a === 'sub') return pageSub(u, L, b);
  if (!mod.lesson && !['print', 'lab-book', 'lab-class'].includes(a)) { location.replace(`#/${u}/sub/E1`); return; } // 5단계 화면이 아직 없는 단원
  if (a === 'kit') return pageKit(u, L);
  if (a === 'diagnose') return MISC ? pageDiagnose(u, L, items, b === 'teacher' ? 'teacher' : 'student') : location.replace(`#/${u}`);
  if (a === 'report') return pageReport(u, L);
  if (a === 'print') return pageBook(u, L, items, b || 'student');
  if (a === 'lab-book') return pageLabBook(u, mod, b || 'student');
  if (a === 'lab-class') return pageLabClass(u, mod, L, b || 'teach', +location.hash.split('/')[4] || 1);
  const step = Math.min(5, Math.max(1, +a || (store.get(u).step ?? 0) + 1));
  if (!a) { location.replace(`#/${u}/${step}`); return; }
  [stepEngage, (u2, L2) => stepExplore(u2, L2, b), stepExplain, stepElaborate, stepEvaluate][step - 1](u, L, items);
}
addEventListener('hashchange', route);
route();
