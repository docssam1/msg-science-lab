// 체험형 3D 실험실: 흙 언덕 물길 — 아이가 경사·물의 양을 고르고, 언덕을 눌러 컵 위치를 정한 뒤
// '물 붓기'를 누르고 있는 동안 물이 흘러 흙을 깎고 옮겨 쌓는다(hill-sim.js가 실제로 계산).
// WebGL이 안 되는 기기는 2D 실험실(lab-hill.js)로 돌아간다.
import { mountHill } from './lab-hill.js';
import { createSim, GRID, WATERS, SLOPES, toCells } from './hill-sim.js';

const TIP = '언덕 위쪽을 눌러 컵 자리를 정하고, <b>물 붓기</b>를 누르고 있어요.';

export async function mountHill3D(el, opts = {}) {
  let THREE, Stage;
  try {
    [{ Stage }, THREE] = await Promise.all([import('../engine.js'), import('../../world-explorer/vendor/three.module.js')]);
    const t = document.createElement('canvas'); if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('no webgl');
  } catch (_) { return mountHill(el, opts); }
  const rows = opts.rows || [], onRecord = opts.onRecord;
  let slope = '완만', water = '적게', pouring = false;
  const grp = (name, key, keys, cur) => `<div class="modes" role="group" aria-label="${name}"><span class="lab-lbl">${name}</span>${keys.map((k) => `<button type="button" data-${key}="${k}" aria-pressed="${k === cur}">${k}</button>`).join('')}</div>`;
  el.innerHTML = `
    ${grp('경사', 's', Object.keys(SLOPES), slope)}${grp('물의 양', 'w', Object.keys(WATERS), water)}
    <div class="lab3d">
      <canvas aria-label="흙 언덕 3D 실험. 끌어서 돌려 보고, 언덕을 눌러 컵 자리를 정해요."></canvas>
      <div class="lab3d-read">
        <p class="lab-read"><span>컵에 남은 물</span><b data-r="cup">100</b><small>%</small></p>
        <p class="lab-read"><span>깎인 흙</span><b data-r="cut">0</b><small>칸</small></p>
        <p class="lab-read"><span>쌓인 흙</span><b data-r="pile">0</b><small>칸</small></p>
      </div>
      <p class="lab3d-tip" data-r="tip">${TIP}</p>
      <div class="lab3d-btns">
        <button class="btn primary pour" data-act="pour" type="button">물 붓기 (누르고 있기)</button>
        <button class="btn" data-act="reset" type="button">다시 쌓기</button>
        <button class="btn" data-act="record" type="button">표에 적기</button>
      </div>
    </div>
    <table class="lab-table"><thead><tr><th>경사</th><th>물의 양</th><th>깎인 흙(칸)</th><th>쌓인 흙(칸)</th></tr></thead><tbody></tbody></table>`;
  const $ = (s) => el.querySelector(s), canvas = $('canvas'), tbody = $('tbody');
  let stage;
  try { stage = new Stage(canvas); } catch (_) { return mountHill(el, opts); }
  stage.setView({ theta: 1.15, phi: 1.1, dist: 5.9, target: [0.7, 0.35, 0] });

  const { x0, x1, z0, z1, nx, nz } = GRID, NV = (nx + 1) * (nz + 1);
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.6, metalness: o.m ?? 0, transparent: o.op != null, opacity: o.op ?? 1 });
  // 쟁반
  const tray = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.16, 3.2), mat(0xa9b2bb, { r: 0.45, m: 0.35 })); bed.position.y = -0.08; tray.add(bed);
  for (const [x, z, w, d] of [[0, 1.62, 5.0, 0.06], [0, -1.62, 5.0, 0.06], [2.5, 0, 0.06, 3.3], [-2.5, 0, 0.06, 3.3]]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.24, d), mat(0x98a2ac, { r: 0.4, m: 0.4 })); r.position.set(x, 0.04, z); tray.add(r);
  }
  tray.position.x = 0.65; tray.traverse((o) => { o.receiveShadow = true; }); stage.root.add(tray);
  // 지형(흙)과 물막
  const mkGeo = () => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NV * 3), 3)); return g; };
  const soil = new THREE.Mesh(mkGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97 }));
  soil.castShadow = soil.receiveShadow = true; stage.root.add(soil);
  const film = new THREE.Mesh(mkGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.78 }));
  stage.root.add(film);
  // 물방울(흘러내리는 물)과 컵
  const MAXD = 700, drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.028, 6, 5), mat(0xcfe8ff, { r: 0.05, op: 0.85 }), MAXD);
  drops.count = 0; stage.root.add(drops);
  const cup = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0xf4f4ef, roughness: 0.6, side: THREE.DoubleSide }));
  const inside = new THREE.Mesh(new THREE.CircleGeometry(0.19, 24), mat(0x5fa8e0, { op: 0.85 })); inside.rotation.x = -Math.PI / 2; inside.position.y = 0.05;
  cup.add(wall, inside); cup.traverse((o) => { o.castShadow = true; }); stage.root.add(cup);
  const NF = 12, fall = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), mat(0x9fd0f5, { r: 0.05, op: 0.8 }), NF); fall.count = 0; stage.root.add(fall);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.17, 32), new THREE.MeshBasicMaterial({ color: 0xe23b2e, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; stage.root.add(ring);

  const DRY = new THREE.Color(0xc9a06a), DARK = new THREE.Color(0x9a7246), WET = new THREE.Color(0x6b4c2f), SAND = new THREE.Color(0x2ec4b6);
  const CLEAR = new THREE.Color(0x4f9fdc), MUD = new THREE.Color(0x8b7255), FOAM = new THREE.Color(0xe9f5ff);
  const grain = new Float32Array(NV); for (let k = 0; k < NV; k++) { const s = Math.sin(k * 12.9898) * 43758.5453; grain[k] = s - Math.floor(s); }
  let sim, full, t = 0;
  function paint() {
    const sp = soil.geometry.attributes.position, sc = soil.geometry.attributes.color, fp = film.geometry.attributes.position, fc = film.geometry.attributes.color, c = new THREE.Color();
    for (let k = 0; k < NV; k++) {
      const h = sim.h[k]; sp.setY(k, h);
      c.copy(DRY).lerp(DARK, grain[k] * 0.35).lerp(WET, sim.wet[k] * 0.75).lerp(SAND, sim.sand[k] > 0.12 ? Math.min(0.95, sim.sand[k] * 1.1) : 0);
      sc.setXYZ(k, c.r, c.g, c.b);
      const f = sim.flow[k], on = f > 0.03;
      fp.setY(k, on ? h + 0.012 + f * 0.018 : h - 0.03);
      const i = k % (nx + 1), wave = Math.max(0, Math.sin(i * 0.9 - t * 10 + (k / (nx + 1)) * 0.7)) ** 3;
      c.copy(CLEAR).lerp(MUD, Math.min(0.85, sim.mud[k] * 0.6 + 0.25)).lerp(FOAM, wave * 0.5 * f); fc.setXYZ(k, c.r, c.g, c.b);
    }
    sp.needsUpdate = sc.needsUpdate = fp.needsUpdate = fc.needsUpdate = true;
    soil.geometry.computeVertexNormals();
  }
  function placeCup() {
    const y = sim.heightAt(sim.src.x, sim.src.z);
    ring.position.set(sim.src.x, y + 0.02, sim.src.z);
    cup.position.set(sim.src.x - 0.22, y + 0.55, sim.src.z); cup.rotation.z = pouring ? -0.9 : -0.35;
  }
  function read() {
    const left = Math.max(0, 1 - sim.poured / full);
    $('[data-r=cup]').textContent = Math.round(left * 100);
    $('[data-r=cut]').textContent = toCells(sim.eroded, sim.dx);
    $('[data-r=pile]').textContent = toCells(sim.deposited, sim.dx);
  }
  const tip = (html) => { $('[data-r=tip]').innerHTML = html; };
  function reset() { sim = createSim(slope); full = WATERS[water]; pouring = false; drops.count = 0; fall.count = 0; paint(); placeCup(); read(); tip(TIP); }
  reset();

  const M = new THREE.Matrix4(), LIP = new THREE.Vector3(), HIT = new THREE.Vector3();
  let acc = 0, dirty = 0;
  stage.update = (dt) => {
    t += dt;
    const active = sim.drops.length > 0, canPour = pouring && sim.poured < full;
    if (active || canPour) {
      acc += dt * 120; let n = Math.min(8, Math.floor(acc)); acc -= n;
      while (n-- > 0) { if (pouring && sim.poured < full) sim.spawn(); sim.step(); }
      if (sim.poured >= full && pouring) { pouring = false; placeCup(); }
      dirty = 0.6;
    }
    sim.decay(dt);
    if (dirty > 0) { dirty -= dt; paint(); read(); }
    // 물방울
    const ds = sim.drops, n = Math.min(MAXD, ds.length);
    for (let i = 0; i < n; i++) { const p = sim.world(ds[i]); M.makeTranslation(p.x, p.y + 0.02, p.z); drops.setMatrixAt(i, M); }
    drops.count = n; drops.instanceMatrix.needsUpdate = true;
    // 컵에서 떨어지는 물줄기
    if (pouring && sim.poured < full) {
      LIP.set(sim.src.x - 0.05, cup.position.y - 0.05, sim.src.z); const y0 = ring.position.y;
      for (let i = 0; i < NF; i++) { const q = (i / NF + t * 1.8) % 1; M.makeTranslation(LIP.x + 0.05 * q, LIP.y - (LIP.y - y0) * q, LIP.z); fall.setMatrixAt(i, M); }
      fall.count = NF; fall.instanceMatrix.needsUpdate = true;
    } else fall.count = 0;
    if (!pouring && !active && sim.poured >= full && !el.dataset.done) { el.dataset.done = '1'; tip('다 부었어요! 깎인 흙과 쌓인 흙을 <b>표에 적어</b> 보세요.'); }
    if (sim.poured < full) delete el.dataset.done;
  };

  // 언덕 누르기 → 컵 자리
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || performance.now() - down.t > 400) return;
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera); const hit = ray.intersectObject(soil)[0]; if (!hit) return;
    HIT.copy(hit.point);
    if (sim.heightAt(HIT.x, HIT.z) < sim.HH * 0.35) { tip('더 높은 곳을 눌러 봐요. 물은 <b>언덕 위쪽</b>에서 부어요.'); return; }
    sim.src.x = HIT.x; sim.src.z = HIT.z; placeCup(); tip(TIP);
  });
  // 물 붓기: 누르고 있는 동안
  const $p = $('[data-act=pour]');
  const start = (e) => { e.preventDefault(); if (sim.poured >= full) { tip('컵이 비었어요. <b>다시 쌓기</b>로 새로 시작해요.'); return; } pouring = true; placeCup(); $p.classList.add('on'); };
  const stop = () => { pouring = false; placeCup(); $p.classList.remove('on'); };
  $p.addEventListener('pointerdown', start); $p.addEventListener('pointerup', stop); $p.addEventListener('pointerleave', stop); $p.addEventListener('pointercancel', stop);
  $p.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !pouring) start(e); });
  $p.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  $p.addEventListener('contextmenu', (e) => e.preventDefault());
  $('[data-act=reset]').addEventListener('click', reset);
  const pick = (attr, set) => el.querySelectorAll(`[data-${attr}]`).forEach((b) => b.addEventListener('click', () => {
    set(b.dataset[attr]); el.querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute('aria-pressed', x === b)); reset();
  }));
  pick('s', (v) => { slope = v; }); pick('w', (v) => { water = v; });
  function renderRows() {
    tbody.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.slope}</td><td>${r.water}</td><td>${r.cut}</td><td>${r.pile}</td></tr>`).join('')
      : '<tr><td colspan="4" class="empty">아직 기록이 없어요.</td></tr>';
  }
  $('[data-act=record]').addEventListener('click', () => {
    if (sim.poured < full || sim.drops.length) { tip('컵의 물을 <b>다 부은 뒤</b>에 적어요.'); return; }
    const row = { slope, water, cut: toCells(sim.eroded, sim.dx), pile: toCells(sim.deposited, sim.dx) };
    const i = rows.findIndex((r) => r.slope === slope && r.water === water); if (i >= 0) rows[i] = row; else rows.push(row);
    renderRows(); onRecord?.(rows); tip('적었어요! 경사나 물의 양을 바꿔 한 번 더 해 봐요.');
  });
  renderRows();
  const off = () => { if (!el.isConnected) { stage.dispose(); removeEventListener('hashchange', chk); } };
  const chk = () => setTimeout(off); addEventListener('hashchange', chk);
  return { rows };
}
