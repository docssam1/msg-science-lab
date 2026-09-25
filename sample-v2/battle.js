import {objectPhoto} from './everyday-objects.js';
import {battleObjects, battleRounds, nextBattleRound} from './battle-rounds.js';
import {freshTeam, moveInOrder, canSubmit, gradeVirtualOrder} from './battle-state.js';

const TEAMS = Object.freeze({
  a: Object.freeze({name: 'A팀', tag: 'BLUE TEAM', letter: 'A', light: '#60A5FA', deep: '#1D4ED8'}),
  b: Object.freeze({name: 'B팀', tag: 'ORANGE TEAM', letter: 'B', light: '#FDBA74', deep: '#C2410C'})
});
const NOTE = '사진은 실제 물건의 예시이고 N 값은 가상 수업 설정입니다. 자동 ○/×는 그 설정값 기준이며, 교실 실물 결과는 교사가 직접 표시하세요.';
const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function emblem(id, key) {
  const t = TEAMS[id], gid = `bt-em-${id}-${key}`;
  return `<svg class="bt-emblem" viewBox="0 0 48 54" aria-hidden="true" focusable="false"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.light}"/><stop offset="1" stop-color="${t.deep}"/></linearGradient></defs><path d="M24 2 44 9v17c0 13-9 22-20 26C13 48 4 39 4 26V9z" fill="url(#${gid})"/><path d="M24 6.5 40 12v14c0 10.5-7 18-16 21.5C15 44 8 36.5 8 26V12z" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/><text x="24" y="34" text-anchor="middle" font-size="22" font-weight="900" fill="#fff">${t.letter}</text></svg>`;
}

export async function mountBattle(host, ctx) {
  const {mountLab} = await import('./lab3d.js');
  const teams = ['a', 'b'];
  let roundIndex = Number(ctx.load('battle-v2:round-index', 0));
  if (!Number.isInteger(roundIndex) || roundIndex < 0 || roundIndex >= battleRounds.length) roundIndex = 0;
  let ids, objects, byId, state, labs = {};
  let disposed = false;
  // Match track = ○/× of earlier rounds in this 3-round match (display only; team state stays in battle-state.js).
  let history = {a: [], b: []};
  const timers = new Set();
  let confettiFrame = 0;

  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!disposed) fn(); }, ms); timers.add(t); return t; };
  const clearTimers = () => { timers.forEach(t => clearTimeout(t)); timers.clear(); cancelAnimationFrame(confettiFrame); };
  const $ = sel => host.querySelector(sel);
  const persist = id => ctx.save(`battle-v2:team:${id}`, state[id]);
  const recordedCount = team => objects.filter(o => Number.isFinite(team.records[o.id])).length;
  const scoreOf = id => history[id].filter(v => v === true).length + (state[id].mark === true ? 1 : 0);
  const say = (id, message) => {
    if (disposed) return;
    const el = $(`[data-team-status="${id}"]`);
    if (el) el.textContent = message;
    ctx.status(`${id.toUpperCase()}팀: ${message}`);
  };
  let toastTimer = null;
  const announce = message => {
    if (disposed) return;
    ctx.status(message);
    const toast = $('[data-battle-toast]');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('is-on'); void toast.offsetWidth; toast.classList.add('is-on');
    if (toastTimer) { clearTimeout(toastTimer); timers.delete(toastTimer); }
    toastTimer = later(() => toast.classList.remove('is-on'), 3400);
  };

  function loadHistory() {
    const saved = ctx.load('battle-v2:history', null);
    const clean = list => Array.isArray(list) && list.length === roundIndex && list.every(v => v === true || v === false || v === null) ? [...list] : Array(roundIndex).fill(null);
    history = {a: clean(saved?.a), b: clean(saved?.b)};
  }

  function renderTrack() {
    for (const id of teams) {
      const track = $(`[data-team-track="${id}"]`);
      if (!track) continue;
      track.innerHTML = battleRounds.map((_, i) => {
        const v = i < roundIndex ? history[id][i] : i === roundIndex ? state[id].mark : undefined;
        const kind = v === true ? 'correct' : v === false ? 'retry' : i === roundIndex ? 'now' : i < roundIndex ? 'skip' : '';
        return `<i data-r="${kind}" title="라운드 ${i + 1}">${v === true ? '○' : v === false ? '×' : i + 1}</i>`;
      }).join('');
    }
  }

  function renderScore(animate) {
    for (const id of teams) {
      const el = $(`[data-score="${id}"]`);
      if (!el) continue;
      const next = scoreOf(id), prev = Number(el.dataset.value ?? next);
      el.dataset.value = String(next);
      el.setAttribute('aria-label', `${TEAMS[id].name} ${next}점`);
      if (!animate || next <= prev || calm()) { el.innerHTML = `<span class="bt-digits"><b>${next}</b></span>`; continue; }
      // Count-up: the old number rolls out, the new one rolls in, then the score pops with a +1 tag.
      el.innerHTML = `<span class="bt-digits"><b class="bt-roll-out">${prev}</b><b class="bt-roll-in">${next}</b></span><i class="bt-plus">+${next - prev}</i>`;
      el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop');
      later(() => { el.innerHTML = `<span class="bt-digits"><b>${next}</b></span>`; el.classList.remove('is-pop'); }, 1500);
    }
    renderTrack();
    const lead = scoreOf('a') - scoreOf('b');
    const board = $('.bt-board');
    if (board) board.dataset.lead = lead > 0 ? 'a' : lead < 0 ? 'b' : '';
  }

  function setReadout(id, sample) {
    const el = $(`[data-team-reading="${id}"]`);
    if (!el) return;
    const team = state[id];
    const o = team.selected ? byId[team.selected] : null;
    let mode = 'idle', label = '빈 저울 0 확인 → 물체 매달기 → 멈추면 기록', digits = '-.-';
    if (o && sample && !sample.settled) { mode = 'wait'; label = `${o.short} · 표시자가 멈추기를 기다려요`; }
    else if (o && sample) { mode = 'ready'; label = `${o.short} · 멈췄어요, 눈금을 기록해요`; digits = sample.reading.toFixed(1); }
    if (mode === 'ready' && team.records[o.id] === Number(digits)) { mode = 'saved'; label = `${o.short} · 기록 완료`; }
    const html = `<span class="bt-ro-step">2 측정</span><span class="bt-ro-label">${label}</span><span class="bt-ro-num"><i aria-hidden="true">8.8</i><b>${digits}</b><em>N</em></span>`;
    if (el.dataset.html === html) return;
    el.dataset.html = html; el.dataset.mode = mode; el.innerHTML = html;
  }

  function renderSteps(id) {
    const team = state[id], n = recordedCount(team), total = objects.length;
    const status = [
      n > 0 || team.submitted ? 'done' : 'now',
      team.submitted || n === total ? 'done' : n > 0 ? 'now' : '',
      team.submitted ? 'done' : n === total ? 'now' : ''
    ];
    host.querySelectorAll(`[data-team-steps="${id}"] li`).forEach((li, i) => { li.dataset.state = status[i]; });
    const count = $(`[data-team-count="${id}"]`);
    if (count) count.textContent = `${n}/${total}`;
  }

  function renderTeam(id) {
    const team = state[id];
    const order = $(`[data-team-order="${id}"]`);
    const before = calm() ? null : new Map([...order.querySelectorAll('.battle-order-card')].map(c => [c.dataset.card, c.getBoundingClientRect().left]));
    order.innerHTML = team.order.map((objectId, i) => {
      const o = byId[objectId];
      const value = team.records[objectId];
      return `<div class="battle-order-card" data-card="${objectId}" title="끌어서 순서를 바꿀 수 있어요"><b class="bt-rank">${i + 1}</b>${objectPhoto(o)}<span${o.short.length > 4 ? ' data-long' : ''}>${o.short}</span><small class="bt-card-value">${Number.isFinite(value) ? `${value.toFixed(1)} N` : '&nbsp;'}</small><div class="bt-arrows"><button data-move="-1" data-id="${objectId}" ${i === 0 ? 'disabled' : ''} aria-label="${o.name} 더 가벼운 쪽으로"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg></button><button data-move="1" data-id="${objectId}" ${i === team.order.length - 1 ? 'disabled' : ''} aria-label="${o.name} 더 무거운 쪽으로"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button></div></div>`;
    }).join('');
    if (before && before.size) {
      order.querySelectorAll('.battle-order-card').forEach(card => {
        const was = before.get(card.dataset.card);
        const dx = was === undefined ? 0 : was - card.getBoundingClientRect().left;
        if (Math.abs(dx) >= 1) card.animate([{transform: `translateX(${dx}px)`}, {transform: 'translateX(0)'}], {duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)'});
      });
    }
    order.querySelectorAll('[data-move]').forEach(button => button.onclick = () => {
      applyOrder(id, moveInOrder(team.order, button.dataset.id, Number(button.dataset.move)));
    });
    $(`[data-team-records="${id}"]`).textContent = objects
      .filter(o => Number.isFinite(team.records[o.id]))
      .map(o => `${o.short} ${team.records[o.id].toFixed(1)} N`).join(' · ') || '기록한 눈금이 아직 없어요.';
    host.querySelectorAll(`[data-object][data-team="${id}"]`).forEach(button => {
      const value = team.records[button.dataset.object];
      button.classList.toggle('is-selected', team.selected === button.dataset.object);
      button.classList.toggle('is-recorded', Number.isFinite(value));
      button.querySelector('.bt-tile-value').innerHTML = Number.isFinite(value) ? `${value.toFixed(1)} N` : '&nbsp;';
    });
    const mark = $(`[data-team-mark="${id}"]`);
    mark.textContent = team.mark === null ? '' : team.mark ? '○' : '×';
    mark.dataset.result = team.mark === null ? '' : team.mark ? 'correct' : 'retry';
    mark.title = team.checkedBy === 'real' ? '교사가 실물 실험 결과와 대조' : team.checkedBy === 'virtual' ? '가상 교구 설정값과 대조' : '';
    $(`[data-team-judge="${id}"]`).textContent = team.mark === null
      ? (team.submitted ? '판정 대기' : '')
      : `${team.mark ? '정답' : '다시 도전'} · ${team.checkedBy === 'real' ? '실물 판정' : '가상 설정'}`;
    const submit = $(`[data-submit="${id}"]`);
    submit.textContent = team.submitted ? '순서 확정됨' : '줄 세우기 확정';
    submit.classList.toggle('is-locked', team.submitted);
    const card = $(`[data-battle-team="${id}"]`);
    card.dataset.result = mark.dataset.result;
    card.dataset.submitted = String(team.submitted);
    renderSteps(id);
  }

  function applyOrder(id, order) {
    const team = state[id];
    if (order.join() === team.order.join()) return;
    team.order = order;
    team.submitted = false; team.mark = null; team.checkedBy = null;
    persist(id); renderTeam(id); renderScore(false);
  }

  // Pointer drag on the lineup. The result is applied through moveInOrder, one neighbour swap at a time.
  function enableDrag(id) {
    const container = $(`[data-team-order="${id}"]`);
    let drag = null;
    container.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      const card = event.target.closest('.battle-order-card');
      if (!card) return;
      event.preventDefault();
      const cards = [...container.querySelectorAll('.battle-order-card')];
      const from = cards.indexOf(card);
      drag = {card, cards, from, to: from, x0: event.clientX, pid: event.pointerId, active: false,
        centers: cards.map(c => { const r = c.getBoundingClientRect(); return r.left + r.width / 2; })};
    });
    container.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.pid) return;
      const dx = event.clientX - drag.x0;
      if (!drag.active) {
        if (Math.abs(dx) < 6) return;
        drag.active = true;
        try { container.setPointerCapture(event.pointerId); } catch {}
        drag.card.classList.add('is-dragging');
        container.classList.add('is-sorting');
      }
      const {centers, from} = drag;
      const step = centers.length > 1 ? centers[1] - centers[0] : 0;
      const clamped = Math.max(centers[0] - centers[from] - 14, Math.min(centers.at(-1) - centers[from] + 14, dx));
      const x = centers[from] + clamped;
      let to = 0;
      centers.forEach((c, i) => { if (Math.abs(c - x) < Math.abs(centers[to] - x)) to = i; });
      drag.to = to;
      drag.cards.forEach((c, i) => {
        if (c === drag.card) return;
        const shift = from < to && i > from && i <= to ? -step : from > to && i >= to && i < from ? step : 0;
        c.style.transform = shift ? `translateX(${shift}px)` : '';
      });
      drag.card.style.transform = `translate(${clamped}px,-8px) scale(1.06)`;
    });
    const end = event => {
      if (!drag || event.pointerId !== drag.pid) return;
      const d = drag; drag = null;
      if (!d.active) return;
      container.classList.remove('is-sorting');
      d.cards.forEach(c => { c.style.transform = ''; });
      d.card.classList.remove('is-dragging');
      if (event.type === 'pointercancel' || d.to === d.from) return;
      let next = state[id].order;
      for (let k = 0; k < Math.abs(d.to - d.from); k++) next = moveInOrder(next, d.card.dataset.card, Math.sign(d.to - d.from));
      applyOrder(id, next);
    };
    container.addEventListener('pointerup', end);
    container.addEventListener('pointercancel', end);
  }

  function stamp(id, correct) {
    if (calm()) return;
    const el = $(`[data-team-stamp="${id}"]`);
    const card = $(`[data-battle-team="${id}"]`);
    if (!el || !card) return;
    el.dataset.kind = correct ? 'o' : 'x';
    el.innerHTML = correct
      ? '<span class="bt-stamp-mark"></span><b>정답!</b>'
      : '<span class="bt-stamp-mark"><i></i><i></i></span><b>다시 도전</b>';
    el.classList.remove('is-on'); card.classList.remove('is-hit'); void el.offsetWidth;
    el.classList.add('is-on'); card.classList.add('is-hit');
    later(() => { el.classList.remove('is-on'); card.classList.remove('is-hit'); }, 2000);
  }

  function confetti(tone) {
    if (calm() || tone === 'none') return;
    const arena = $('.battle-arena');
    if (!arena) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'bt-confetti';
    canvas.setAttribute('aria-hidden', 'true');
    arena.append(canvas);
    const w = canvas.width = arena.clientWidth, h = canvas.height = arena.clientHeight;
    const g = canvas.getContext('2d');
    if (!g) { canvas.remove(); return; }
    const palettes = {a: ['#2563EB', '#60A5FA', '#93C5FD', '#FACC15', '#FFFFFF'], b: ['#EA580C', '#FB923C', '#FDBA74', '#FACC15', '#FFFFFF'], both: ['#2563EB', '#60A5FA', '#EA580C', '#FB923C', '#FACC15', '#22C55E']};
    const colors = palettes[tone] || palettes.both;
    const origins = tone === 'a' ? [w * .27] : tone === 'b' ? [w * .73] : [w * .27, w * .73];
    const bits = Array.from({length: 160}, (_, i) => {
      const ox = origins[i % origins.length], angle = -Math.PI / 2 + (Math.random() - .5) * 1.6, speed = 8 + Math.random() * 10;
      return {x: ox + (Math.random() - .5) * 80, y: h * .45, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        r: Math.random() * Math.PI, vr: (Math.random() - .5) * .35, s: 6 + Math.random() * 6, c: colors[i % colors.length], round: Math.random() < .22};
    });
    const t0 = performance.now(), life = 2800;
    cancelAnimationFrame(confettiFrame);
    const tick = now => {
      if (disposed || !canvas.isConnected) return;
      const t = now - t0;
      g.clearRect(0, 0, w, h);
      g.globalAlpha = Math.max(0, Math.min(1, (life - t) / 700));
      for (const p of bits) {
        p.vy += .34; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
        if (p.round) { g.beginPath(); g.arc(0, 0, p.s * .42, 0, Math.PI * 2); g.fill(); }
        else g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * (.35 + Math.abs(Math.sin(p.r * 2))));
        g.restore();
      }
      if (t < life) confettiFrame = requestAnimationFrame(tick); else canvas.remove();
    };
    confettiFrame = requestAnimationFrame(tick);
  }

  function banner() {
    const a = state.a.mark, b = state.b.mark;
    if (a === null || b === null) return;
    const round = battleRounds[roundIndex];
    const last = roundIndex === battleRounds.length - 1;
    const roundTone = a && !b ? 'a' : b && !a ? 'b' : a && b ? 'both' : 'none';
    const roundTitle = {a: 'A팀 승리!', b: 'B팀 승리!', both: '두 팀 모두 정답!', none: '두 팀 모두 다시 도전!'}[roundTone];
    const judged = teams.every(id => state[id].checkedBy === 'virtual') ? '가상 교구 설정값 기준' : '교사 실물 판정 포함';
    const sa = scoreOf('a'), sb = scoreOf('b');
    // The last round closes the match: the headline becomes the match result, the round result moves below.
    const tone = last ? (sa > sb ? 'a' : sb > sa ? 'b' : 'both') : roundTone;
    const title = last ? (sa > sb ? 'A팀 우승!' : sb > sa ? 'B팀 우승!' : '무승부!') : roundTitle;
    const finale = last ? `<p class="bt-banner-final">최종 점수 <b data-t="a">A ${sa}</b> : <b data-t="b">${sb} B</b> · ${battleRounds.length}라운드: ${roundTitle.replace('!', '')}</p>` : '';
    const el = $('[data-battle-banner]');
    if (el._timer) { clearTimeout(el._timer); timers.delete(el._timer); }
    if (el._show) { clearTimeout(el._show); timers.delete(el._show); }
    el.hidden = true; el.classList.remove('is-on');
    // Let the ○/× stamps land first, then bring in the result banner.
    el._show = later(() => showBanner(el, tone, title, finale, judged, round), calm() ? 0 : 1150);
  }

  function showBanner(el, tone, title, finale, judged, round) {
    el.dataset.tone = tone;
    el.innerHTML = `<div class="bt-banner-card"><span class="bt-banner-kicker">${roundIndex === battleRounds.length - 1 ? 'FINAL · 경기 종료' : `ROUND ${roundIndex + 1} RESULT`} · ${round.name}</span><strong>${title}</strong><div class="bt-banner-marks">${teams.map(id => `<span data-t="${id}">${TEAMS[id].name}<b data-result="${state[id].mark ? 'correct' : 'retry'}">${state[id].mark ? '○' : '×'}</b></span>`).join('')}</div>${finale}<small>${judged} · 화면을 누르면 닫혀요</small></div>`;
    el.hidden = false;
    el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on');
    el._timer = later(() => { el.hidden = true; el.classList.remove('is-on'); }, 5200);
    later(() => confetti(tone), 300);
  }

  function splash() {
    if (calm()) return;
    const round = battleRounds[roundIndex];
    const el = document.createElement('div');
    el.className = 'bt-splash';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div><span>NEW BATTLE</span><strong>ROUND ${roundIndex + 1}</strong><em>${round.name}</em></div>`;
    $('.battle-arena').append(el);
    el.addEventListener('animationend', event => { if (event.target === el) el.remove(); });
    later(() => el.remove(), 1900);
  }

  function renderRound() {
    const round = battleRounds[roundIndex];
    ids = [...round.ids];
    objects = ids.map(id => battleObjects.find(o => o.id === id));
    byId = Object.fromEntries(objects.map(o => [o.id, o]));
    state = Object.fromEntries(teams.map(id => {
      const saved = ctx.load(`battle-v2:team:${id}`, null);
      return [id, saved && canSubmit(saved, ids) && saved.records && typeof saved.records === 'object'
        ? {...saved, selected: null, zeroConfirmed: false} : freshTeam(ids)];
    }));
    loadHistory();
    const pips = battleRounds.map((_, i) => `<i data-state="${i < roundIndex ? 'done' : i === roundIndex ? 'now' : ''}"></i>`).join('');
    const side = id => `<div class="bt-side" data-side="${id}">${emblem(id, 'board')}<div class="bt-side-name"><strong>${TEAMS[id].name}</strong><small>${TEAMS[id].tag}</small></div><span class="bt-track" data-team-track="${id}" aria-label="${TEAMS[id].name} 라운드 결과"></span><output class="bt-score" data-score="${id}" title="이번 경기에서 받은 ○ 수"></output></div>`;
    host.innerHTML = `<div class="battle-arena">
      <header class="bt-board" aria-label="두 팀 점수판">${side('a')}<div class="bt-center"><span class="bt-round">ROUND <b>${roundIndex + 1}</b><span>/ ${battleRounds.length}</span></span><span class="bt-vs" aria-hidden="true">VS</span><span class="bt-set"><span class="bt-pips" aria-hidden="true">${pips}</span>${round.name}</span><h2 class="sr-only">두 팀 무게 줄 세우기 ${roundIndex + 1}/${battleRounds.length} · ${round.name}</h2></div>${side('b')}</header>
      <div class="battle-grid">${teams.map(id => `<section class="battle-team" data-battle-team="${id}" aria-label="${TEAMS[id].name} 실험">
        <header class="bt-team-head">${emblem(id, 'card')}<h3>${TEAMS[id].name}</h3>
          <ol class="bt-steps" data-team-steps="${id}" aria-label="${TEAMS[id].name} 진행 단계"><li><i>1</i>예상</li><li><i>2</i>측정<b data-team-count="${id}"></b></li><li><i>3</i>확정</li></ol>
          <div class="bt-result"><span class="bt-judge" data-team-judge="${id}"></span><output class="battle-mark" data-team-mark="${id}" aria-live="polite"></output></div>
        </header>
        <div class="bt-body">
          <div class="bt-stage"><div class="battle-scene" data-team-scene="${id}"></div></div>
          <div class="bt-panel">
            <div class="bt-block bt-lineup"><p class="battle-caption"><span class="bt-cap-step">1 예상</span><span class="bt-cap-scale"><em>가벼움</em><i aria-hidden="true"></i><em>무거움</em></span><span class="bt-cap-hint">끌거나 화살표로 줄 세우기</span></p><div class="battle-order" data-team-order="${id}"></div></div>
            <div class="bt-block bt-measure">
              <div class="battle-reading bt-readout" data-team-reading="${id}"></div>
              <div class="battle-objects">${objects.map(o => `<button data-object="${o.id}" data-team="${id}" aria-label="${o.name} 매달기">${objectPhoto(o)}<span${o.short.length > 4 ? ' data-long' : ''}>${o.short}</span><small class="bt-tile-value">&nbsp;</small></button>`).join('')}</div>
              <div class="bt-measure-actions"><button data-zero="${id}">빈 저울 0 확인</button><button data-record="${id}">눈금 기록</button><button data-remove="${id}">물체 빼기</button></div>
            </div>
          </div>
        </div>
        <div class="battle-finish"><button data-submit="${id}">줄 세우기 확정</button><p class="battle-status" data-team-status="${id}" role="status">먼저 순서를 예상해 보세요.</p><div class="bt-manual"><span>교사<br>실물 판정</span><button data-manual="${id}" data-mark="true" aria-label="${TEAMS[id].name} 실물 확인 ○">○</button><button data-manual="${id}" data-mark="false" aria-label="${TEAMS[id].name} 실물 확인 ×">×</button></div></div>
        <p class="sr-only" data-team-records="${id}"></p>
        <div class="bt-stamp" data-team-stamp="${id}" aria-hidden="true"></div>
      </section>`).join('')}</div>
      <footer class="bt-console"><p class="battle-note"><span aria-hidden="true">i</span>${NOTE}</p><div class="battle-top-actions"><button class="bt-primary" data-battle-answer>가상 교구 정답 확인</button><button data-battle-reset>새 대결 · 다른 물건</button><button class="bt-quiet" data-battle-close>교재로 돌아가기</button></div></footer>
      <div class="bt-toast" data-battle-toast role="status" aria-live="polite"></div>
      <div class="bt-banner" data-battle-banner hidden></div>
    </div>`;

    const bannerEl = $('[data-battle-banner]');
    bannerEl.onclick = () => { bannerEl.hidden = true; bannerEl.classList.remove('is-on'); };
    renderScore(false);

    for (const id of teams) {
      const team = state[id];
      renderTeam(id);
      setReadout(id, null);
      enableDrag(id);
      const lab = mountLab($(`[data-team-scene="${id}"]`), {
        mode: 'inquiry',
        onAdjust: ({zero}) => {
          if (Math.abs(zero) > .01) { team.zeroConfirmed = false; persist(id); }
        },
        onChange: sample => {
          if (disposed) return;
          setReadout(id, sample);
        }
      });
      labs[id] = lab;
      lab.setZero(0);
      $(`[data-zero="${id}"]`).onclick = () => {
        const sample = lab.state();
        team.zeroConfirmed = sample.force === 0 && Math.abs(sample.zero) < .01;
        persist(id);
        say(id, team.zeroConfirmed ? '빈 저울의 0을 확인했어요. 물체를 골라 보세요.' : '물체를 빼고 빈 저울의 0을 다시 확인해요.');
      };
      host.querySelectorAll(`[data-object][data-team="${id}"]`).forEach(button => button.onclick = () => {
        const sample = lab.state();
        if (!team.zeroConfirmed || sample.force > 0 || Math.abs(sample.zero) > .01) {
          say(id, '실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?');
          return;
        }
        const o = byId[button.dataset.object];
        team.selected = o.id;
        team.zeroConfirmed = false;
        lab.setForce(o.force, {object: o.kind});
        persist(id); renderTeam(id); setReadout(id, lab.state());
        say(id, `${o.name}를 매달았어요. 표시자가 멈추면 눈금을 기록해요.`);
      });
      $(`[data-record="${id}"]`).onclick = () => {
        const sample = lab.state();
        if (!team.selected || !sample.settled) { say(id, '물체를 매달고 표시자가 멈춘 뒤 기록해요.'); return; }
        team.records[team.selected] = Number(sample.reading.toFixed(1));
        persist(id); renderTeam(id); setReadout(id, sample);
        say(id, `${byId[team.selected].name}의 눈금을 기록했어요. 물체를 빼고 다음 물체를 골라요.`);
      };
      $(`[data-remove="${id}"]`).onclick = () => {
        lab.setForce(0); team.selected = null; team.zeroConfirmed = false;
        persist(id); renderTeam(id); setReadout(id, null);
        say(id, '물체를 뺐어요. 다음 물체를 걸기 전에 빈 저울의 0을 확인해요.');
      };
      $(`[data-submit="${id}"]`).onclick = () => {
        if (!canSubmit(team, ids)) { say(id, '다섯 물건을 모두 한 번씩 줄 세워 주세요.'); return; }
        team.submitted = true; team.mark = null; team.checkedBy = null;
        persist(id); renderTeam(id); renderScore(false); say(id, '순서를 확정했어요. 교사가 실물 또는 가상 교구와 대조해요.');
      };
      host.querySelectorAll(`[data-manual="${id}"]`).forEach(button => button.onclick = () => {
        if (!team.submitted) { say(id, '줄 세우기를 먼저 확정해 주세요.'); return; }
        team.mark = button.dataset.mark === 'true'; team.checkedBy = 'real';
        persist(id); renderTeam(id); say(id, `교사가 실물 결과를 보고 ${team.mark ? '○' : '×'}로 표시했어요.`);
        stamp(id, team.mark); renderScore(true); banner();
      });
    }
    $('[data-battle-answer]').onclick = () => {
      if (!teams.every(id => state[id].submitted)) { announce('두 팀 모두 줄 세우기를 확정한 뒤 정답을 확인해요.'); return; }
      for (const id of teams) {
        state[id].mark = gradeVirtualOrder(state[id].order, objects);
        state[id].checkedBy = 'virtual';
        persist(id); renderTeam(id);
        say(id, `가상 교구 설정값 기준 ${state[id].mark ? '○' : '×'}입니다.`);
        stamp(id, state[id].mark);
      }
      renderScore(true); banner();
    };
    $('[data-battle-close]').onclick = () => ctx.close();
    $('[data-battle-reset]').onclick = () => {
      Object.values(labs).forEach(lab => lab.destroy());
      labs = {};
      const next = nextBattleRound(roundIndex);
      history = next === 0 ? {a: [], b: []} : {a: [...history.a, state.a.mark], b: [...history.b, state.b.mark]};
      ctx.save('battle-v2:history', history);
      roundIndex = next;
      ctx.save('battle-v2:round-index', roundIndex);
      const nextIds = battleRounds[roundIndex].ids;
      for (const id of teams) ctx.save(`battle-v2:team:${id}`, freshTeam(nextIds));
      clearTimers();
      renderRound();
      splash();
      announce(`새 대결: ${battleRounds[roundIndex].name} 물건으로 두 팀이 다시 시작해요.${roundIndex === 0 ? ' 새 경기라 점수도 0부터예요.' : ''}`);
    };
  }

  renderRound();
  return {destroy() {
    disposed = true;
    clearTimers();
    Object.values(labs).forEach(lab => lab.destroy());
  }};
}
