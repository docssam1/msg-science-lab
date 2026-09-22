// GFIELD 실험 과학 영재 — 화면 수업 자료(교안). 교재와 같은 chapter 데이터를 16:9 슬라이드로 보여 준다.
//  teach(가르치기·강사용): 클릭/→/스페이스로 빈칸 답이 차례로 열리고, N으로 강사 발문 노트, F로 전체 화면.
//  self (스스로 공부하기·학생용): 내 생각을 쓰고 '예시 답 보기', 확인 문제는 눌러서 바로 채점.
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NUM = ['①', '②', '③', '④', '⑤', '⑥'];
const KEY = 'sciLab.deck';
const memo = { all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
  get(k) { return this.all()[k] ?? ''; }, set(k, v) { try { const a = this.all(); a[k] = v; localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* 저장 불가 */ } } };
let notesOn = true;

export function buildSlides(ch, art, plan, similar, mode) {
  const teach = mode === 'teach', S = [];
  let n = 0;
  // 답 자리: 가르치기는 클릭으로 열리는 답, 스스로는 쓰기 칸 + 예시 답 보기
  const ans = (a, id) => (teach ? `<div class="dk-ans rv">${esc(a)}</div>`
    : `<div class="dk-self" data-k="${id}"><textarea class="dk-in" rows="2" placeholder="내 생각을 써 보세요"></textarea><button class="dk-chk" type="button">예시 답 보기</button><div class="dk-ans" hidden>${esc(a)}</div></div>`);
  const add = (id, phase, title, body, extra = {}) => S.push({ id, phase, title, body, ...extra });
  const ph = Object.fromEntries(plan.phases.map((p) => [p.id, p]));

  add('cover', 'open', '', `<div class="dk-cover"><p class="dk-kick">${esc(ch.book)} · ${esc(ch.vol)}</p><div class="dk-bign">${ch.no}</div><h1>${esc(ch.title)}</h1>
    <p class="dk-link"><b>교과 연결</b> ${esc(ch.link.course)} ${esc(ch.link.unit)}</p></div><div class="dk-art cover">${art.opener}</div>`, { say: 'cover', layout: 'cover' });
  if (teach) add('plan', 'open', '수업 흐름 · 90분', `<ol class="dk-plan">${plan.phases.map((p) => `<li><b>${esc(p.name)}</b><span>${p.min}분</span><em>${esc(p.aim)}</em></li>`).join('')}</ol>
    <p class="dk-sub">탐구 요소 · ${ch.skills.map(esc).join(' · ')}</p>`);
  add('intro', 'open', '이런 모습 본 적 있나요?', `<div class="dk-two"><div class="dk-art">${art.opener}</div><div>${ch.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div>`, { layout: 'intro' });
  ch.think.forEach((t, i) => add(`think${i + 1}`, 'open', `미리 생각하기 ${i + 1}`, `<p class="dk-q">${esc(t.q)}</p>${ans(t.a, `think${i}`)}`, { say: 'think' }));
  add('scene', 'open', '3D로 먼저 보기', `<div class="dk-3d" data-mount="scene"></div>`, { say: 'scene', mount: 'scene', layout: 'media' });

  add('goal', 'design', '탐구 목표', `<p class="dk-goal">${esc(ch.goal)}</p><div class="dk-two"><div class="dk-card"><h3>준비물</h3><p>${ch.materials.kit.map(esc).join(', ')}</p></div>
    <div class="dk-card"><h3>학생 준비물</h3><p>${ch.materials.student.map(esc).join(', ')}</p></div></div>`);
  add('hypo', 'design', 'STEP 1 · 가설 세우기', `<p class="dk-q">${esc(ch.hypothesis.hint)}</p>${ans(ch.hypothesis.a, 'hypo')}`, { say: 'hypo' });
  const d = ch.design;
  add('design', 'design', 'STEP 2 · 실험 설계하기', `<table class="dk-tbl">${[d.change, d.same, d.measure].map((r, i) => `<tr><th>${esc(r.q)}</th><td>${ans(r.a, `design${i}`)}</td></tr>`).join('')}</table>
    <p class="dk-sub">알맞은 실험은 바꿀 조건을 하나만 정하고, 나머지는 모두 같게 해요.</p>`, { say: 'design' });

  ch.steps.forEach((s, i) => add(`step${i + 1}`, 'lab', `STEP 3 · 실험하기 ${i + 1}/${ch.steps.length}`,
    `<div class="dk-two wide-art"><div class="dk-art">${art[s.art]}</div><div><p class="dk-big">${esc(s.text)}</p><p class="dk-tip rv">도움말 · ${esc(s.tip)}</p></div></div>`, { say: `step${i + 1}` }));
  add('lab', 'lab', '3D 실험실 · 기울기와 물의 양 바꿔 보기', `<div class="dk-3d" data-mount="lab"></div>`, { say: 'lab', mount: 'lab', layout: 'media' });
  add('wonder', 'lab', 'Q. 이런 경우는?', `<p class="dk-q">${esc(ch.wonder.q)}</p>${ans(ch.wonder.a, 'wonder')}
    <div class="dk-caution"><h3>주의하세요!</h3><ul>${ch.caution.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>`, { say: 'wonder' });

  ch.results.forEach((r, i) => add(`res${i + 1}`, 'result', `STEP 4 · 결과 ${i + 1}`, `<p class="dk-q">${esc(r.q)}</p>
    ${r.art ? `<div class="dk-art mid">${art[r.art]}</div>` : ''}
    ${r.table ? `<table class="dk-tbl"><tr>${r.table.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${r.rows.map((rw) => `<tr><th>${esc(rw)}</th>${r.table.slice(1).map(() => '<td></td>').join('')}</tr>`).join('')}</table>` : ''}
    ${ans(r.a, `res${i}`)}`, { say: 'res' }));
  add('concl', 'result', 'STEP 5 · 결론 내리기', `<ol class="dk-list">${ch.conclusion.map((c, i) => `<li><p>${esc(c.q)}</p>${ans(c.a, `concl${i}`)}</li>`).join('')}</ol>`, { say: 'concl' });

  const nt = ch.note;
  add('note', 'concept', `개념 노트 · ${nt.title}`, `<div class="dk-two"><div class="dk-art">${art[nt.art]}</div>
    <table class="dk-tbl note"><tr>${nt.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${nt.table.rows.map((r) => `<tr><th>${esc(r[0])}</th>${r.slice(1).map((c) => `<td><span class="${teach ? 'rv' : ''}">${esc(c)}</span></td>`).join('')}</tr>`).join('')}</table></div>
    <ul class="dk-points">${nt.points.map((p) => `<li class="${teach ? 'rv' : ''}">${esc(p)}</li>`).join('')}</ul>`, { say: 'note' });
  add('plus', 'concept', `개념 플러스 · ${nt.plus.title}`, `<div class="dk-two"><div class="dk-art">${art[nt.plus.art]}</div><p class="dk-big">${esc(nt.plus.text)}</p></div>`, { say: 'plus' });

  add('discuss', 'extend', 'STEP 6 · 개념 넓혀 토의하기', `<p class="dk-q">${esc(ch.discuss.q)}</p>${ans(ch.discuss.a, 'discuss')}`, { say: 'discuss' });
  add('creative', 'extend', 'STEP 7 · 창의력 키우기', `<p class="dk-q">${esc(ch.creative.q)}</p>${ans(ch.creative.a, 'creative')}`);
  const g = ch.gifted;
  add('gifted', 'extend', `영재성 기르기`, `<p class="dk-q"><b>${esc(g.title)}</b><br>${esc(g.lead)}</p>
    <table class="dk-tbl">${g.rows.map((r) => `<tr><th>${esc(r)}</th><td>${ans(g.a[r], `gifted-${r}`)}</td></tr>`).join('')}</table>
    ${teach ? `<div class="dk-rubric rv"><b>채점 기준</b> ${g.rubric.map(esc).join(' / ')}</div>` : ''}`, { say: 'gifted' });

  const pick = ch.check.map((k) => similar.find((s) => `${s.sourceRef.of.set}-${s.sourceRef.of.no}` === k)).filter(Boolean);
  pick.forEach((it, i) => {
    const ac = it.answerContract, gv = it.givens;
    const givens = gv ? Object.entries(gv).map(([k, v]) => `<div class="dk-given">${/^(설명|내용|text|문항|자료|글|지문)$/.test(k) ? '' : k === '보기' ? '<b>〈보기〉</b><br>' : `<b>${esc(k)}</b> `}${Array.isArray(v) ? v.map(esc).join('<br>') : esc(typeof v === 'object' ? JSON.stringify(v) : v)}</div>`).join('') : '';
    const key = ac.type === 'single-choice' ? [ac.answer] : ac.type === 'multi-choice' ? ac.answers : null;
    const text = key ? key.map((a) => NUM[a]).join(', ') : ac.type === 'short-text' ? ac.answer : ac.sample;
    const choices = it.choices ? `<ol class="dk-choices" data-key="${key ? key.join(',') : ''}" data-multi="${ac.type === 'multi-choice'}">${it.choices.map((c, j) => `<li><button type="button" data-j="${j}"><span>${NUM[j]}</span>${esc(c)}</button></li>`).join('')}</ol>` : '';
    const reveal = teach ? `<div class="dk-ans rv">정답 ${esc(text)} — ${esc(it.explanation)}</div>`
      : it.choices ? `<div class="dk-ans" hidden>정답 ${esc(text)} — ${esc(it.explanation)}</div>` : ans(`${text} — ${it.explanation}`, `test${i}`);
    add(`test${i + 1}`, 'check', `교과 확인 문제 ${i + 1}/${pick.length}`, `<p class="dk-q">${esc(it.prompt)}</p>${givens}${choices}${reveal}`, { say: 'test', test: !!it.choices, layout: 'dense' });
  });
  add('end', 'check', '', `<div class="dk-cover"><h1>오늘 배운 것</h1><ul class="dk-points big"><li>흐르는 물은 땅을 <b>깎고(침식)</b> · <b>옮기고(운반)</b> · <b>쌓아요(퇴적)</b>.</li>
    <li>물이 많고 경사가 급할수록 더 많이 깎이고 옮겨져요.</li><li>강 상류는 침식, 강 하류는 퇴적이 활발해요.</li></ul>
    <p class="dk-sub">과제 · 교재 ${ch.no}장 교과 확인 문제와 영재성 기르기를 마무리해 오세요.</p></div>`, { layout: 'cover' });
  S.forEach((s) => { s.n = ++n; s.phaseObj = ph[s.phase]; });
  return S;
}

export function renderDeck($app, { u, ch, art, plan, similar, mode, idx, mount3D, mountLab }) {
  const teach = mode === 'teach', S = buildSlides(ch, art, plan, similar, mode);
  const i = Math.min(S.length - 1, Math.max(0, (idx || 1) - 1)), s = S[i], p = s.phaseObj;
  const go = (k) => { location.hash = `#/${u}/lab-class/${mode}/${k + 1}`; };
  const phases = plan.phases.map((x) => `<span class="${x.id === s.phase ? 'on' : ''}">${esc(x.name)}${teach ? ` ${x.min}′` : ''}</span>`).join('');
  $app.innerHTML = `<div class="dk dk-${mode}">
    <div class="dk-top no-print"><a href="#/${u}/lab-book/${teach ? 'teacher' : 'student'}">‹ 교재</a><b>${esc(ch.title)}</b><span class="dk-mode">${teach ? '가르치기 · 강사용' : '스스로 공부하기 · 학생용'}</span>
      <nav class="dk-phases">${phases}</nav></div>
    <div class="dk-stage-wrap"><section class="dk-stage ${s.layout || ''}" aria-live="polite">
      ${s.title ? `<h2 class="dk-h">${esc(s.title)}</h2>` : ''}<div class="dk-body">${s.body}</div>
      <footer class="dk-foot"><span>${esc(ch.book)}</span><span>${s.n} / ${S.length}</span></footer></section></div>
    <div class="dk-bar no-print"><button class="btn" data-a="prev" ${i ? '' : 'disabled'}>‹ 이전</button>
      <span class="dk-count">${s.n} / ${S.length} · ${esc(p?.name || '')}</span>
      <button class="btn primary" data-a="next">${i === S.length - 1 ? '처음으로' : teach ? '다음 ›' : '다음 ›'}</button>
      ${teach ? `<button class="btn" data-a="notes" aria-pressed="${notesOn}">노트</button>` : ''}<button class="btn" data-a="full">전체 화면</button></div>
    ${teach ? `<aside class="dk-notes no-print" ${notesOn ? '' : 'hidden'}><b>${esc(p?.name)} · ${p?.min}분</b> ${esc(p?.aim)}${s.say && plan.say[s.say] ? `<p>발문 · ${esc(plan.say[s.say])}</p>` : ''}<small>→ / 스페이스 / 화면 클릭: 답 열기·다음 · ← 이전 · N 노트 · F 전체 화면</small></aside>` : ''}
  </div>`;
  const stage = $app.querySelector('.dk-stage');
  const hidden = () => [...stage.querySelectorAll('.rv:not(.on)')];
  const next = () => { const h = hidden(); if (teach && h.length) { h[0].classList.add('on'); return; } go(i === S.length - 1 ? 0 : i + 1); };
  const prev = () => { const on = [...stage.querySelectorAll('.rv.on')]; if (teach && on.length) { on.at(-1).classList.remove('on'); return; } if (i) go(i - 1); };
  $app.querySelector('[data-a=next]').onclick = next;
  $app.querySelector('[data-a=prev]').onclick = prev;
  $app.querySelector('[data-a=full]').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch { /* 지원 안 함 */ } };
  const $notes = $app.querySelector('.dk-notes');
  const toggleNotes = () => { notesOn = !notesOn; if ($notes) $notes.hidden = !notesOn; $app.querySelector('[data-a=notes]')?.setAttribute('aria-pressed', notesOn); };
  $app.querySelector('[data-a=notes]')?.addEventListener('click', toggleNotes);
  if (teach) stage.addEventListener('click', (e) => { if (!e.target.closest('button,canvas,a,input,textarea,.dk-3d')) next(); });
  const onKey = (e) => {
    if (!document.body.contains(stage)) { removeEventListener('keydown', onKey); return; }
    if (e.target.closest?.('textarea,input')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'f' || e.key === 'F') $app.querySelector('[data-a=full]').click();
    else if (teach && (e.key === 'n' || e.key === 'N')) toggleNotes();
  };
  addEventListener('keydown', onKey);
  addEventListener('hashchange', () => removeEventListener('keydown', onKey), { once: true });

  // 스스로 공부하기: 쓴 내용은 기기에 남기고, 예시 답은 눌러서 확인
  stage.querySelectorAll('.dk-self').forEach((b) => {
    const k = `${u}:${b.dataset.k}`, ta = b.querySelector('textarea'), a = b.querySelector('.dk-ans'), btn = b.querySelector('.dk-chk');
    ta.value = memo.get(k); ta.addEventListener('input', () => memo.set(k, ta.value));
    btn.onclick = () => { a.hidden = !a.hidden; btn.textContent = a.hidden ? '예시 답 보기' : '예시 답 숨기기'; };
  });
  // 확인 문제: 스스로는 눌러서 채점, 가르치기는 정답 공개 때 표시
  stage.querySelectorAll('.dk-choices').forEach((ol) => {
    const key = ol.dataset.key.split(',').filter(Boolean).map(Number), multi = ol.dataset.multi === 'true', picked = new Set();
    const mark = () => ol.querySelectorAll('button').forEach((b) => b.classList.toggle('ok', key.includes(+b.dataset.j)));
    ol.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      if (teach) return;
      const j = +b.dataset.j; if (multi) { picked.has(j) ? picked.delete(j) : picked.add(j); b.classList.toggle('pick'); if (picked.size < key.length) return; } else picked.add(j);
      const right = key.length === picked.size && key.every((x) => picked.has(x));
      ol.querySelectorAll('button').forEach((x) => { x.disabled = true; if (picked.has(+x.dataset.j) && !key.includes(+x.dataset.j)) x.classList.add('no'); });
      mark(); const a = stage.querySelector('.dk-ans'); a.hidden = false; a.insertAdjacentHTML('afterbegin', `<b class="${right ? 'dk-right' : 'dk-wrong'}">${right ? '맞았어요!' : '다시 보기'}</b> `);
    }));
    if (teach) { const a = stage.querySelector('.dk-ans.rv'); new MutationObserver(() => a.classList.contains('on') && mark()).observe(a, { attributes: true }); }
  });
  const m = stage.querySelector('[data-mount]');
  if (m?.dataset.mount === 'scene') mount3D(m);
  if (m?.dataset.mount === 'lab') mountLab(m);
}
