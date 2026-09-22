// 가상 실험실: 흙 언덕 물길 — 경사와 물의 양을 고르고 물을 흘려보내, 위쪽에서 깎인 흙과 아래쪽에 쌓인 흙을 표에 적는다.
// 모델: 깎인 흙(칸) = 2 × 경사 배율(완만 1, 가파름 1.8) × 물 배율(적게 1, 많이 2)을 반올림. 깎인 흙은 모두 아래로 옮겨져 쌓인다(흙의 양은 그대로).
const SLOPE = { '완만': 1, '가파름': 1.8 }, WATER = { '적게': 1, '많이': 2 };
export function hillModel(slope, water) {
  const cut = Math.round(2 * SLOPE[slope] * WATER[water]);
  return { cut, pile: cut };
}

export function mountHill(el, { onRecord, rows = [] } = {}) {
  let slope = '완만', water = '적게', done = false, busy = false;
  const grp = (name, keys, cur) => `<div class="modes" role="group" aria-label="${name}"><span class="lab-lbl">${name}</span>${keys.map((k) => `<button type="button" data-${name === '경사' ? 's' : 'w'}="${k}" aria-pressed="${k === cur}">${k}</button>`).join('')}</div>`;
  el.innerHTML = `
    ${grp('경사', Object.keys(SLOPE), slope)}${grp('물의 양', Object.keys(WATER), water)}
    <div class="lab">
      <svg class="lab-svg" viewBox="0 0 300 220" role="img" aria-label="흙 언덕 옆모습"></svg>
      <div class="lab-side">
        <p class="lab-read"><span>위쪽 깎인 흙</span><b data-r="cut">0</b><small>칸</small></p>
        <p class="lab-read"><span>아래쪽 쌓인 흙</span><b data-r="pile">0</b><small>칸</small></p>
        <button class="btn primary" data-act="pour" type="button">물 흘려보내기</button>
        <button class="btn" data-act="record" type="button" style="margin-top:6px">표에 적기</button>
      </div>
    </div>
    <table class="lab-table"><thead><tr><th>경사</th><th>물의 양</th><th>깎인 흙(칸)</th><th>쌓인 흙(칸)</th></tr></thead><tbody></tbody></table>`;
  const svg = el.querySelector('svg'), tbody = el.querySelector('tbody'), $p = el.querySelector('[data-act=pour]');
  const G = 190;                                             // 쟁반 바닥 y

  function draw(p) {                                        // p: 0 흘리기 전 ~ 1 다 흘린 뒤
    const m = hillModel(slope, water), steep = slope === '가파름';
    const topY = steep ? 40 : 80, topX = 90, footX = steep ? 190 : 240;
    const cut = m.cut * 4 * p, fan = m.pile * 5 * p;         // 1칸 = 위 4px 깎임 / 아래 부채꼴 5px
    const hill = `M20 ${G} L${topX - 20} ${topY + cut} Q${topX} ${topY - 6 + cut} ${topX + 20} ${topY + cut} L${footX} ${G} Z`;
    const pile = fan ? `<path d="M${footX - 30} ${G} Q${footX + 10} ${G - fan} ${footX + 30 + fan * 2} ${G} Z" fill="#c9a36b" stroke="#8a6a3e"/>` : '';
    const sandTop = `<path d="M${topX - 20} ${topY + cut} Q${topX} ${topY - 6 + cut} ${topX + 20} ${topY + cut}" stroke="#2EC4B6" stroke-width="${Math.max(0, 7 * (1 - p))}" fill="none" stroke-linecap="round"/>`;
    const sandLow = p > 0 ? `<circle cx="${footX + 8}" cy="${G - fan * 0.5 - 3}" r="${3 + 4 * p}" fill="#2EC4B6" opacity="${p}"/>` : '';
    const stream = busy ? `<path d="M${topX + 6} ${topY + cut - 4} L${footX + 12} ${G - 4}" stroke="#4E9BE0" stroke-width="${water === '많이' ? 6 : 3}" stroke-dasharray="8 6" stroke-dashoffset="${-p * 80}" opacity=".85"/>` : '';
    svg.innerHTML = `
      <rect x="6" y="${G}" width="288" height="12" rx="4" fill="#9aa3ad"/>
      <path d="${hill}" fill="#d9b886" stroke="#8a6a3e" stroke-width="1.5"/>
      ${pile}${sandTop}${sandLow}${stream}
      <text x="${topX}" y="${topY - 14}" font-size="11" text-anchor="middle" fill="#5B6577">위쪽</text>
      <text x="${footX + 20}" y="${G + 26}" font-size="11" text-anchor="middle" fill="#5B6577">아래쪽</text>`;
  }
  function read() {
    const m = hillModel(slope, water);
    el.querySelector('[data-r=cut]').textContent = done ? m.cut : 0;
    el.querySelector('[data-r=pile]').textContent = done ? m.pile : 0;
    $p.textContent = done ? '다시 쌓기' : '물 흘려보내기';
  }
  function pour() {
    if (done) { done = false; read(); draw(0); return; }
    const t0 = performance.now(), D = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1600;
    busy = true;
    const step = (now) => { const p = D ? Math.min(1, (now - t0) / D) : 1; draw(p);
      if (p < 1) requestAnimationFrame(step); else { busy = false; done = true; read(); draw(1); } };
    requestAnimationFrame(step);
  }
  const pick = (attr, set) => el.querySelectorAll(`[data-${attr}]`).forEach((b) => b.addEventListener('click', () => {
    if (busy) return; set(b.dataset[attr]); done = false;
    el.querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute('aria-pressed', x === b)); read(); draw(0);
  }));
  pick('s', (v) => { slope = v; }); pick('w', (v) => { water = v; });
  $p.addEventListener('click', () => { if (!busy) pour(); });
  function renderRows() {
    tbody.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.slope}</td><td>${r.water}</td><td>${r.cut}</td><td>${r.pile}</td></tr>`).join('')
      : '<tr><td colspan="4" class="empty">아직 기록이 없어요.</td></tr>';
  }
  el.querySelector('[data-act=record]').addEventListener('click', () => {
    if (busy || !done) return; const m = hillModel(slope, water);
    const row = { slope, water, cut: m.cut, pile: m.pile };
    if (!rows.some((r) => r.slope === slope && r.water === water)) rows.push(row);
    renderRows(); onRecord?.(rows);
  });
  read(); draw(0); renderRows();
  return { rows };
}
