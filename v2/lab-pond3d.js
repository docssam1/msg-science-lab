// 체험형 3D 실험실: 부레옥잠 연못 — 식물을 골라 연못의 원하는 곳(땅·물가·깊은 물)을 눌러 심어 본다.
// 식물은 실제 사는 방식대로 움직인다: 부레옥잠은 떠오르고, 수련은 바닥에 뿌리를 내려 잎을 물 위로 띄우고,
// 검정말은 물속에 잠기고, 부들은 얕은 물가에서 선다. 맞지 않는 곳이면 시들거나 잠긴다.
// 부레옥잠은 물속으로 눌러 공기 방울을 보거나, 잎자루를 잘라 공기주머니를 볼 수 있다.
const PLANTS = {
  '부레옥잠': { ok: ['물', '물가'], how: '물에 떠서 살아요', no: { 땅: '물이 없어서 시들어요' } },
  '수련': { ok: ['물'], how: '뿌리는 바닥에, 잎은 물 위에 떠요', no: { 땅: '물이 없어서 시들어요', 물가: '물이 얕아서 잎을 넓게 띄우기 어려워요' } },
  '검정말': { ok: ['물'], how: '물속에 잠겨서 살아요', no: { 땅: '물 밖에서는 말라 버려요', 물가: '물이 얕아서 몸이 물 밖으로 나와요' } },
  '부들': { ok: ['물가'], how: '얕은 물가에 뿌리를 내리고 곧게 서요', no: { 땅: '물이 모자라 잘 못 자라요', 물: '물이 너무 깊어서 잠겨요' } },
};
export const pondResult = (plant, zone) => { const P = PLANTS[plant], ok = P.ok.includes(zone); return { ok, text: ok ? P.how : P.no[zone] }; };

export async function mountPond3D(el, opts = {}) {
  let THREE, Stage, K, KIT;
  try {
    [{ Stage }, THREE, K, KIT] = await Promise.all([import('../engine.js'), import('../../world-explorer/vendor/three.module.js'), import('../scenes/_pond.js'), import('../scenes/_kit.js')]);
    const t = document.createElement('canvas'); if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('no webgl');
  } catch (_) { el.innerHTML = '<p class="lab3d-tip">이 기기에서는 3D 실험실을 열 수 없어요. 3D 장면으로 관찰해 보세요.</p>'; return {}; }
  const rows = opts.rows || [], onRecord = opts.onRecord;
  let pick = '부레옥잠', last = null;
  el.innerHTML = `
    <div class="modes" role="group" aria-label="식물"><span class="lab-lbl">식물</span>${Object.keys(PLANTS).map((k) => `<button type="button" data-p="${k}" aria-pressed="${k === pick}">${k}</button>`).join('')}</div>
    <div class="lab3d">
      <canvas aria-label="연못 3D 실험. 식물을 고르고 연못을 눌러 심어요. 끌어서 돌려 볼 수 있어요."></canvas>
      <p class="lab3d-tip" data-r="tip">식물을 고르고, 연못에서 <b>땅·물가·깊은 물</b> 중 한 곳을 눌러 심어 보세요.</p>
      <div class="lab3d-btns">
        <button class="btn primary pour" data-act="push" type="button" disabled>부레옥잠을 물속으로 누르기 (누르고 있기)</button>
        <button class="btn" data-act="cut" type="button" disabled>잎자루 잘라 보기</button>
        <button class="btn" data-act="record" type="button">표에 적기</button>
      </div>
    </div>
    <table class="lab-table"><thead><tr><th>식물</th><th>심은 곳</th><th>어떻게 되었나</th></tr></thead><tbody></tbody></table>`;
  const $ = (s) => el.querySelector(s), canvas = $('canvas'), tbody = $('tbody'), tip = (h) => { $('[data-r=tip]').innerHTML = h; };
  let stage; try { stage = new Stage(canvas); } catch (_) { el.querySelector('.lab3d').innerHTML = '<p class="lab3d-tip">이 기기에서는 3D를 열 수 없어요.</p>'; return {}; }
  stage.setView({ theta: 0.12, phi: 1.12, dist: 6.9, target: [-0.35, 0.8, 0] });
  const { SURF, BANK_X, POND, bottomAt, where } = K;
  const pondG = K.pond(); stage.root.add(pondG);
  const hit = new THREE.Mesh(new THREE.PlaneGeometry(POND.x1 - POND.x0, POND.z1 - POND.z0), new THREE.MeshBasicMaterial({ visible: false }));
  hit.rotation.x = -Math.PI / 2; hit.position.set((POND.x0 + POND.x1) / 2, SURF + 0.1, 0); stage.root.add(hit);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.16, 32), new THREE.MeshBasicMaterial({ color: 0xe23b2e, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.visible = false; stage.root.add(ring);
  const bub = K.bubbles(30); stage.root.add(bub);
  for (const [txt, x] of [['땅', (POND.x0 + BANK_X) / 2], ['물가', BANK_X + 0.35], ['깊은 물', 1.4]]) { const l = KIT.label(txt, { size: 0.22 }); l.position.set(x, SURF + 0.45, POND.z1 - 0.1); stage.root.add(l); }
  // 잎자루 단면
  const sec = new THREE.Group();
  { const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 40), new THREE.MeshStandardMaterial({ color: 0xa6d884, roughness: 0.6 })); disc.rotation.x = Math.PI / 2; sec.add(disc);
    const hm = new THREE.MeshStandardMaterial({ color: 0x3d6b2a, roughness: 0.9 });
    for (let i = 0; i < 32; i++) { const r = Math.sqrt((i + 0.5) / 32) * 0.29, a = i * 2.39996; const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.055, 12), hm); h.rotation.x = Math.PI / 2; h.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.002); sec.add(h); } }
  sec.visible = false; stage.root.add(sec);

  const planted = {};           // 식물 이름 → { g, zone, ok, x, z, t0 }
  const make = { '부레옥잠': () => K.hyacinth(), '수련': () => K.waterLily(), '검정말': () => K.hydrilla(0.6), '부들': () => K.cattail(1.4) };
  function plant(name, x, z) {
    if (planted[name]) stage.root.remove(planted[name].g);
    const zone = where(x), res = pondResult(name, zone), g = make[name]();
    g.traverse((o) => { if (o.material && !res.ok) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0x9a8a5a), 0.55); } });
    const floor = bottomAt(x);
    const P = { g, zone, ok: res.ok, text: res.text, x, z, t0: performance.now() / 1000, floor };
    g.position.set(x, SURF + 1.0, z); stage.root.add(g); planted[name] = P; last = { name, ...P };
    ring.position.set(x, (x < BANK_X ? SURF + 0.17 : SURF + 0.01), z); ring.visible = true;
    tip(`<b>${name}</b>을 <b>${zone === '물' ? '깊은 물' : zone}</b>에 심었어요 → ${res.ok ? '' : '<b style="color:#c0392b">'}${res.text}${res.ok ? '' : '</b>'}`);
    $('[data-act=push]').disabled = !planted['부레옥잠']?.ok; $('[data-act=cut]').disabled = !planted['부레옥잠'];
  }
  // 떨어지는 동작과 사는 모습
  let push = 0, pushV = 0, pressing = false, bubT = -1, t = 0;
  stage.update = (dt) => {
    t += dt; pondG.userData.ripple(t);
    for (const [name, P] of Object.entries(planted)) {
      const g = P.g, age = performance.now() / 1000 - P.t0, drop = Math.min(1, age / 0.9), e = 1 - (1 - drop) ** 3;
      if (name === '부레옥잠') {
        const land = P.zone === '땅' ? SURF + 0.16 : SURF;
        let y = SURF + 1.0 + (land - SURF - 1.0) * e;
        if (P.ok && drop >= 1) { y = land + Math.sin(t * 1.4) * 0.015 - push * 0.5; }
        g.position.y = y; if (!P.ok) g.scale.set(1, 0.75, 1);
      } else if (name === '수련') {
        g.position.y = SURF + 1.0 + (P.floor - SURF - 1.0) * e;
        const depth = Math.max(0.05, SURF - P.floor); g.userData.place(P.zone === '땅' ? 0.08 : depth * Math.min(1, Math.max(0, (age - 0.9) / 1.5)) + (P.zone === '땅' ? 0 : 0.02));
        if (P.zone === '땅') g.scale.set(0.8, 0.8, 0.8);
      } else if (name === '검정말') {
        g.position.y = SURF + 1.0 + (P.floor - SURF - 1.0) * e; g.userData.sway(t);
        if (P.zone === '땅') g.rotation.z = Math.min(1.3, age * 1.2);
      } else if (name === '부들') {
        g.position.y = SURF + 1.0 + (P.floor - SURF - 1.0) * e;
        if (P.zone === '땅') g.scale.set(1, Math.max(0.55, 1 - age * 0.2), 1);
      }
    }
    // 누르기: 스프링처럼 눌렸다가 떠오른다
    const target = pressing ? 1 : 0; pushV += (target - push) * 18 * dt - pushV * 6 * dt; push = Math.max(0, Math.min(1.1, push + pushV * dt * 4));
    const H = planted['부레옥잠'];
    if (H && pressing && push > 0.5 && bubT < 0) bubT = 0;
    if (bubT >= 0) { bubT += dt / 2.2; bub.position.set(H ? H.x : 0, 0, H ? H.z : 0); bub.userData.play(Math.min(1, bubT), SURF - 0.45); if (bubT > 1) { bubT = pressing ? 0 : -1; } }
    else bub.children.forEach((b) => { b.visible = false; });
    if (sec.visible && H) { sec.position.set(H.x - 0.1, SURF + 0.95, H.z + 0.3); sec.rotation.y = Math.sin(t * 0.8) * 0.3; }
  };
  // 연못 누르기 → 심기
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || performance.now() - down.t > 400) return;
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera); const h = ray.intersectObject(hit)[0]; if (!h) return;
    plant(pick, Math.max(POND.x0 + 0.2, Math.min(POND.x1 - 0.25, h.point.x)), Math.max(POND.z0 + 0.25, Math.min(POND.z1 - 0.25, h.point.z)));
  });
  el.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => {
    pick = b.dataset.p; el.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    tip(`<b>${pick}</b>을 심을 곳을 연못에서 눌러 보세요.`);
  }));
  const $p = $('[data-act=push]');
  const start = (e) => { e.preventDefault(); if ($p.disabled) return; pressing = true; $p.classList.add('on'); tip('잎자루에서 <b>공기 방울</b>이 나와요! 손을 떼 보세요.'); };
  const stop = () => { if (!pressing) return; pressing = false; $p.classList.remove('on'); tip('손을 떼니 부레옥잠이 <b>다시 떠올라요</b>. 잎자루 속 공기 덕분이에요.'); };
  $p.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => $p.addEventListener(ev, stop));
  $p.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !pressing) start(e); });
  $p.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  $p.addEventListener('contextmenu', (e) => e.preventDefault());
  $('[data-act=cut]').addEventListener('click', () => { if (!planted['부레옥잠']) return; sec.visible = !sec.visible; tip(sec.visible ? '잎자루 단면: 스펀지처럼 작은 <b>공기주머니</b>가 가득해요.' : '단면을 닫았어요.'); });
  function renderRows() {
    tbody.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.plant}</td><td>${r.where}</td><td>${r.result}</td></tr>`).join('')
      : '<tr><td colspan="3" class="empty">아직 기록이 없어요.</td></tr>';
  }
  $('[data-act=record]').addEventListener('click', () => {
    if (!last) { tip('먼저 식물을 연못에 심어 보세요.'); return; }
    const row = { plant: last.name, where: last.zone === '물' ? '깊은 물' : last.zone, result: last.text, ok: last.ok };
    const i = rows.findIndex((r) => r.plant === row.plant && r.where === row.where); if (i >= 0) rows[i] = row; else rows.push(row);
    renderRows(); onRecord?.(rows); tip('적었어요! 다른 식물이나 다른 곳에도 심어 봐요.');
  });
  renderRows();
  const chk = () => setTimeout(() => { if (!el.isConnected) { stage.dispose(); removeEventListener('hashchange', chk); } }); addEventListener('hashchange', chk);
  return { rows };
}
