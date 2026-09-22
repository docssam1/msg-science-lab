// 가상 실험실: 고리 자석 탑 — 고리를 눌러 뒤집고, 탑 높이·떠 있는 층을 기록한다.
// 모델(3D 장면과 같음): 이웃한 두 고리의 윗면 극이 서로 다르면 마주 보는 면이 같은 극 → 밀어 내서 뜬다.
// 뜨는 간격은 위에 얹힌 고리가 많을수록 좁아진다(아래쪽 간격이 가장 좁다).

const RING_H = 1;            // 고리 두께 = 1칸
const GAP = 1.1;             // 위에 고리가 하나뿐일 때 뜨는 간격(칸)

export function towerModel(ups) {
  const n = ups.length, y = [0];
  let floating = 0;
  for (let i = 1; i < n; i++) {
    const repel = ups[i - 1] !== ups[i];
    const load = n - i; // 이 틈 위에 얹힌 고리 수
    const gap = repel ? GAP / (1 + 0.45 * (load - 1)) : 0;
    if (repel) floating++;
    y.push(y[i - 1] + RING_H + gap);
  }
  const height = Math.round((y[n - 1] + RING_H) * 10) / 10;
  return { y, floating, height };
}

export function mountRingTower(el, { rings = 4, onRecord, rows = [] } = {}) {
  const ups = Array.from({ length: rings }, (_, i) => (i % 3 === 0 ? 'N' : 'S'));
  const colors = ['#3b6fd1', '#f0b429', '#3fae5b', '#e0743a', '#8e5bd1'];
  el.innerHTML = `
    <div class="lab">
      <svg class="lab-svg" viewBox="0 0 220 300" role="img" aria-label="고리 자석 탑. 고리를 누르면 뒤집혀요."></svg>
      <div class="lab-side">
        <p class="lab-read"><span>떠 있는 층</span><b data-r="floating">0</b></p>
        <p class="lab-read"><span>탑 높이</span><b data-r="height">0</b><small>칸</small></p>
        <p class="lab-tip">고리를 누르면 뒤집혀요.</p>
        <button class="btn" data-act="record" type="button">표에 적기</button>
      </div>
    </div>
    <table class="lab-table"><thead><tr><th>쌓은 모양(아래→위)</th><th>떠 있는 층</th><th>탑 높이(칸)</th></tr></thead><tbody></tbody></table>`;
  const svg = el.querySelector('svg'), tbody = el.querySelector('tbody');
  const SCALE = 26, BASE_Y = 270, W = 150, CX = 110;

  function draw() {
    const m = towerModel(ups);
    const parts = [`<rect x="${CX - 70}" y="${BASE_Y}" width="140" height="14" rx="4" fill="#9aa3ad"/>`,
      `<rect x="${CX - 5}" y="30" width="10" height="${BASE_Y - 30}" rx="4" fill="#b08b5a"/>`];
    ups.forEach((u, i) => {
      const top = BASE_Y - (m.y[i] + RING_H) * SCALE, h = RING_H * SCALE;
      const topC = u === 'N' ? '#E24B4A' : '#3A6BC6', botC = u === 'N' ? '#3A6BC6' : '#E24B4A';
      parts.push(`<g class="ring" data-i="${i}" tabindex="0" role="button" aria-label="${i + 1}번째 고리, 윗면 ${u}극. 눌러서 뒤집기">
        <rect x="${CX - W / 2}" y="${top}" width="${W}" height="${h}" rx="6" fill="${colors[i]}"/>
        <rect x="${CX - W / 2 + 4}" y="${top}" width="${W - 8}" height="4" rx="2" fill="${topC}"/>
        <rect x="${CX - W / 2 + 4}" y="${top + h - 4}" width="${W - 8}" height="4" rx="2" fill="${botC}"/>
        <text x="${CX - W / 2 + 12}" y="${top + h / 2 + 5}" font-size="13" font-weight="700" fill="#fff">${u}</text>
        <text x="${CX + W / 2 - 14}" y="${top + h / 2 + 5}" font-size="12" fill="#fff" text-anchor="end">↻</text></g>`);
    });
    svg.innerHTML = parts.join('');
    el.querySelector('[data-r=floating]').textContent = m.floating;
    el.querySelector('[data-r=height]').textContent = m.height;
    svg.querySelectorAll('.ring').forEach((g) => {
      const flip = () => { const i = +g.dataset.i; ups[i] = ups[i] === 'N' ? 'S' : 'N'; draw(); };
      g.addEventListener('click', flip);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    });
    return m;
  }
  function renderRows() {
    tbody.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.shape}</td><td>${r.floating}</td><td>${r.height}</td></tr>`).join('')
      : '<tr><td colspan="3" class="empty">아직 기록이 없어요.</td></tr>';
  }
  el.querySelector('[data-act=record]').addEventListener('click', () => {
    const m = towerModel(ups);
    const row = { shape: ups.map((u) => u + '위').join(' · '), floating: m.floating, height: m.height };
    if (!rows.some((r) => r.shape === row.shape)) rows.push(row);
    renderRows(); onRecord?.(rows);
  });
  draw(); renderRows();
  return { rows };
}
