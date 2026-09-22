// 가상 실험실: 얼음 병 저울 — 물의 양을 고르고 얼리거나 녹여서, 높이(칸)와 무게(g)를 표에 적는다.
// 모델: 물이 얼면 부피가 약 1.1배로 늘어난다(높이 늘어남). 무게는 변하지 않는다. 병 무게 20 g, 물 1 mL = 1 g.
const BOTTLE_G = 20, GROW = 1.1;
export function freezeModel(ml, frozen) {
  const water = ml / 10;                                  // 물 높이(칸) — 10 mL = 1칸
  const height = Math.round((frozen ? water * GROW : water) * 10) / 10;
  return { height, mass: BOTTLE_G + ml };
}

export function mountFreeze(el, { amounts = [60, 100, 140], onRecord, rows = [] } = {}) {
  let ml = amounts[1], frozen = false, busy = false;
  el.innerHTML = `
    <div class="modes" role="group" aria-label="물의 양">${amounts.map((a) => `<button type="button" data-ml="${a}" aria-pressed="${a === ml}">${a} mL</button>`).join('')}</div>
    <div class="lab">
      <svg class="lab-svg" viewBox="0 0 220 300" role="img" aria-label="눈금이 있는 병과 저울"></svg>
      <div class="lab-side">
        <p class="lab-read"><span>상태</span><b data-r="state">물</b></p>
        <p class="lab-read"><span>높이</span><b data-r="h">0</b><small>칸</small></p>
        <p class="lab-read"><span>무게</span><b data-r="m">0</b><small>g</small></p>
        <button class="btn primary" data-act="toggle" type="button">얼리기</button>
        <button class="btn" data-act="record" type="button" style="margin-top:6px">표에 적기</button>
      </div>
    </div>
    <table class="lab-table"><thead><tr><th>상태</th><th>물의 양(mL)</th><th>높이(칸)</th><th>무게(g)</th></tr></thead><tbody></tbody></table>`;
  const svg = el.querySelector('svg'), tbody = el.querySelector('tbody'), $t = el.querySelector('[data-act=toggle]');
  const X = 70, W = 80, BASE = 236, UNIT = 11;              // 병 안쪽 x, 폭, 바닥 y, 1칸 = 11px

  function draw(h, t) {                                    // t: 0 물 ~ 1 얼음 (색 섞기)
    const top = BASE - h * UNIT, mark = BASE - (ml / 10) * UNIT;
    const ticks = Array.from({ length: 17 }, (_, i) => `<line x1="${X - 10}" x2="${X - (i % 5 ? 4 : 1)}" y1="${BASE - i * UNIT}" y2="${BASE - i * UNIT}" stroke="#5B6577" stroke-width="1.5"/>${i % 5 ? '' : `<text x="${X - 14}" y="${BASE - i * UNIT + 4}" font-size="10" text-anchor="end" fill="#5B6577">${i}</text>`}`).join('');
    const water = `rgb(${Math.round(127 + (214 - 127) * t)},${Math.round(179 + (234 - 179) * t)},${Math.round(213 + (247 - 213) * t)})`;
    svg.innerHTML = `${ticks}
      <rect x="${X}" y="${top}" width="${W}" height="${BASE - top}" fill="${water}"/>
      ${t > 0.5 ? `<path d="M${X + 12} ${top + 10}l10 8M${X + 44} ${top + 24}l8 -6M${X + 28} ${top + 48}l12 4" stroke="#fff" stroke-width="2" opacity=".8"/>` : ''}
      <line x1="${X - 4}" x2="${X + W + 4}" y1="${mark}" y2="${mark}" stroke="#E23B2E" stroke-width="2" stroke-dasharray="5 4"/>
      <text x="${X + W + 6}" y="${mark + 4}" font-size="10" fill="#E23B2E">처음</text>
      <path d="M${X} 50 V${BASE} H${X + W} V50" fill="none" stroke="#1E3A78" stroke-width="3"/>
      <rect x="${X + 24}" y="36" width="${W - 48}" height="16" rx="3" fill="#1E3A78"/>
      <rect x="30" y="${BASE + 4}" width="160" height="16" rx="4" fill="#9aa3ad"/>
      <rect x="44" y="${BASE + 20}" width="132" height="30" rx="6" fill="#262B36"/>
      <text x="110" y="${BASE + 41}" font-size="16" font-weight="700" text-anchor="middle" fill="#7CFFB2">${freezeModel(ml, frozen).mass} g</text>`;
  }
  function read() {
    const m = freezeModel(ml, frozen);
    el.querySelector('[data-r=state]').textContent = frozen ? '얼음' : '물';
    el.querySelector('[data-r=h]').textContent = m.height;
    el.querySelector('[data-r=m]').textContent = m.mass;
    $t.textContent = frozen ? '녹이기' : '얼리기';
  }
  function animate(to) {
    const h0 = freezeModel(ml, !to).height, h1 = freezeModel(ml, to).height, t0 = performance.now(), D = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1400;
    busy = true;
    const step = (now) => { const p = D ? Math.min(1, (now - t0) / D) : 1; draw(h0 + (h1 - h0) * p, to ? p : 1 - p);
      if (p < 1) requestAnimationFrame(step); else { busy = false; frozen = to; read(); draw(h1, to ? 1 : 0); } };
    requestAnimationFrame(step);
  }
  el.querySelectorAll('[data-ml]').forEach((b) => b.addEventListener('click', () => {
    if (busy) return; ml = +b.dataset.ml; frozen = false;
    el.querySelectorAll('[data-ml]').forEach((x) => x.setAttribute('aria-pressed', x === b)); read(); draw(freezeModel(ml, false).height, 0);
  }));
  $t.addEventListener('click', () => { if (!busy) animate(!frozen); });
  function renderRows() {
    tbody.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.state}</td><td>${r.ml}</td><td>${r.height}</td><td>${r.mass}</td></tr>`).join('')
      : '<tr><td colspan="4" class="empty">아직 기록이 없어요.</td></tr>';
  }
  el.querySelector('[data-act=record]').addEventListener('click', () => {
    if (busy) return; const m = freezeModel(ml, frozen);
    const row = { state: frozen ? '얼음' : '물', ml, height: m.height, mass: m.mass };
    if (!rows.some((r) => r.state === row.state && r.ml === row.ml)) rows.push(row);
    renderRows(); onRecord?.(rows);
  });
  read(); draw(freezeModel(ml, false).height, 0); renderRows();
  return { rows };
}
