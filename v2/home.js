// 홈 = 탐구 지도: 학기별로 구불한 길 위에 단원 정거장. 끝낸 곳 깃발, 다음 정거장에 docssam, "이어서 하기".
import { SEMS, READY } from './units-index.js';

const ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ'];
const XS = [24, 50, 76, 50];      // 정거장 가로 위치(%) — 지그재그
const ROW = 118;                   // 정거장 간격(px)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function stateOf(store, id) {
  if (!READY[id]) return { kind: 'locked' };
  const st = store.get(id);
  if (st.passed) return { kind: 'passed', st };
  if ((st.done || []).length) return { kind: 'doing', st };
  return { kind: 'open', st };
}

// 이어서 할 곳: 진행 중인 단원 → 아직 안 끝낸 열린 단원 → 첫 열린 단원
function nextUnit(store) {
  const all = SEMS.flatMap((s) => s.units).filter((u) => READY[u.id]);
  return all.find((u) => stateOf(store, u.id).kind === 'doing') || all.find((u) => stateOf(store, u.id).kind === 'open') || null;
}
const hrefOf = (store, id) => { const st = store.get(id); return `#/${id}/${!st.passed && st.step != null ? st.step + 1 : 1}`; };

export function pageHome($app, store, teacher) {
  const nx = nextUnit(store), nxs = nx && stateOf(store, nx.id);
  const go = nx || SEMS.flatMap((s) => s.units).find((u) => READY[u.id]);
  const cta = !nx ? '다시 보기' : nxs.kind === 'doing' ? '이어서 하기' : '탐구 시작하기';
  $app.innerHTML = `<div class="lab-bg" aria-hidden="true"></div><header class="top"><div class="wrap"><h1>docssam 과학 탐구 랩</h1><a class="intro-link" href="../intro/">교재 소개 ›</a></div></header>
    <main class="wrap home">
      <div id="t"></div>
      ${SEMS.map((s) => {
        const [g, h] = s.sem.split('-');
        const pts = s.units.map((u, i) => [XS[i % 4], i * ROW + 56]);
        const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join(' ');
        return `<section class="sem" aria-label="${g}학년 ${h}학기">
          <h2 class="sem-title">${g}학년 ${h}학기</h2>
          <div class="path" style="height:${s.units.length * ROW}px">
            <svg class="road" viewBox="0 0 100 ${s.units.length * ROW}" preserveAspectRatio="none" aria-hidden="true"><path class="edge" d="${d}" /><path class="lane" d="${d}" /><path class="mid" d="${d}" /></svg>
            ${s.units.map((u, i) => {
              const k = stateOf(store, u.id), [x, y] = pts[i], isNext = nx && u.id === nx.id;
              const done = new Set(k.st?.done || []);
              const body = `<span class="dot">${k.kind === 'passed' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h10l-2 3.5L16 11H8v10z"/></svg>' : ROMAN[u.no - 1]}</span>
                <span class="name">${esc(u.title)}</span>
                ${READY[u.id] ? `<span class="bars" aria-hidden="true">${['실험', '개념', '확장'].map((b, j) => `<i class="${done.has(j + 1) ? 'on' : ''}" title="${b}"></i>`).join('')}</span>` : '<span class="soon">준비 중</span>'}`;
              const label = `${g}학년 ${h}학기 ${ROMAN[u.no - 1]}. ${u.title}${k.kind === 'passed' ? ', 끝냄' : k.kind === 'locked' ? ', 준비 중' : ''}`;
              return `<${READY[u.id] ? `a href="${hrefOf(store, u.id)}"` : 'button type="button"'} class="stop ${k.kind}${isNext ? ' next' : ''}" style="left:${x}%;top:${y}px" aria-label="${esc(label)}">${body}${isNext ? `<img class="guide ${x > 50 ? 'l' : 'r'}" src="../assets/docssam-B4-encourage.webp" alt="">` : ''}</${READY[u.id] ? 'a' : 'button'}>`;
            }).join('')}
          </div></section>`;
      }).join('')}
      <p class="lead home-foot">정거장을 끝내면 깃발이 꽂혀요. 준비 중인 정거장은 곧 열려요.</p>
    </main>
    ${go ? `<div class="bottom"><div class="wrap"><a class="btn primary" href="${hrefOf(store, go.id)}" style="display:flex;align-items:center;justify-content:center;text-decoration:none">${cta} · ${esc(go.title)}</a></div></div>` : ''}
    <div class="toast" role="status" aria-live="polite" hidden></div>
    <div class="sheet-bg" hidden></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t" hidden></section>`;
  const passedN = SEMS.flatMap((s) => s.units).filter((u) => stateOf(store, u.id).kind === 'passed').length;
  teacher(document.getElementById('t'), [passedN
    ? { mood: 'praise', text: `깃발을 ${passedN}개 모았어요! 다음 정거장으로 가 볼까요?` }
    : { mood: 'talk', text: `안녕하세요! 오늘은 ${nx ? nx.title : '과학'} 정거장부터 탐구해요.` }]);
  const $toast = $app.querySelector('.toast'); let tm;
  $app.querySelectorAll('button.stop').forEach((b) => b.addEventListener('click', () => {
    $toast.textContent = '이 정거장은 준비 중이에요. 열리면 알려 줄게요.'; $toast.hidden = false;
    clearTimeout(tm); tm = setTimeout(() => { $toast.hidden = true; }, 2200);
  }));
  // 정거장 → 소단원 시트
  const $sheet = $app.querySelector('.sheet'), $bg = $app.querySelector('.sheet-bg');
  const close = () => { $sheet.hidden = $bg.hidden = true; };
  $bg.addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  $app.querySelectorAll('a.stop').forEach((a) => a.addEventListener('click', (e) => {
    const u = SEMS.flatMap((s) => s.units).find((x) => a.getAttribute('href').startsWith(`#/${x.id}/`)); const r = READY[u.id];
    if (!r?.subs) return; e.preventDefault();
    const k = stateOf(store, u.id), [g, h] = u.id.slice(1, 3).split('');
    $sheet.innerHTML = `<div class="grab" aria-hidden="true"></div><p class="step-label">${g}학년 ${h}학기 ${ROMAN[u.no - 1]}</p><h2 id="sheet-t">${esc(u.title)}</h2>
      ${r.lesson === false ? '<p class="lead">5단계 탐구 화면은 준비 중이에요. 소단원 문제부터 풀어 봐요.</p>' : r.labs ? `<div class="labs">${r.labs.map((l) => { const ks = stateOf(store, l.id).kind; return `<a class="btn primary" href="${hrefOf(store, l.id)}"><b>${esc(l.hero)}</b><small>소단원 ${l.covers.map((c) => r.subs.findIndex((x) => x.id === c) + 1).join('·')} · ${ks === 'doing' ? '이어서 하기' : ks === 'passed' ? '다시 보기' : '5단계 탐구 시작'}</small></a>`; }).join('')}</div>` : `<a class="btn primary" href="${hrefOf(store, u.id)}">${k.kind === 'doing' ? '5단계 탐구 이어서 하기' : '5단계 탐구 시작하기'}</a>`}
      <h3>소단원</h3><ol class="subs">${r.subs.map((s, i) => `<li><a href="#/${u.id}/sub/${s.id}"><span class="sn">${i + 1}</span><span class="st">${esc(s.name)}</span><span class="sc">유형 ${s.types}</span></a></li>`).join('')}</ol>
      <button type="button" class="btn" data-close>닫기</button>`;
    $sheet.querySelector('[data-close]').addEventListener('click', close);
    $sheet.hidden = $bg.hidden = false; $sheet.querySelector('a').focus();
  }));
  // 다음 정거장이 화면에 오도록
  const $n = $app.querySelector('.stop.next');
  if ($n) requestAnimationFrame(() => $n.scrollIntoView({ block: 'center' }));
}
