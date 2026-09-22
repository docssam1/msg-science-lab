// 체험형 3D 실험실: 화산 실험실 — 단계를 하나씩 따라 한다.
// ① 화산 모형: 포일 화산 올리기 → 알코올램프 불 붙이기 → 가열하기(누르고 있기) → 불 끄고 굳히기 → 표에 적기
//    (연기 = 화산 가스, 녹아 흘러나온 마시멜로 = 용암, 굳은 것 = 화산 암석)
// ② 식히기: 뜨거운 백반 물 담기 → 얼음물/상자 고르기 → 식히기(누르고 있기) → 결정 살펴보기 → 표에 적기
//    (빨리 식힘 → 작은 결정 많이 = 현무암, 천천히 식힘 → 큰 결정 조금 = 화강암). WebGL이 없으면 글로 하는 실험실.
const HEATS = { 약하게: 12, 강하게: 24 };                 // 가열 속도(°C/s)
const COOLS = { '얼음물(빨리)': 14, '상자(천천히)': 4 };     // 식는 속도(°C/s)
const MELT = 70, FULL = 1;
const STEPS = {
  '화산 모형': ['포일 화산 올리기', '불 붙이기', '가열하기', '불 끄고 굳히기', '표에 적기'],
  '식히기': ['뜨거운 백반 물 담기', '식힐 곳 고르기', '식히기', '결정 살펴보기', '표에 적기'],
};
const GUIDE = {
  '화산 모형': ['삼발이 위에 마시멜로를 넣은 <b>포일 화산</b>을 올려요.', '보호자와 함께 <b>알코올램프</b>에 불을 붙여요.', '불 세기를 고르고 <b>가열하기</b>를 누르고 있어요. 연기와 흘러나오는 것을 봐요.', '<b>불을 끄면</b> 흘러나온 마시멜로가 식으면서 굳어요. 굳을 때까지 지켜봐요.', '연기·흘러나온 것·굳은 것을 <b>표에 적어</b>요. 불 세기를 바꿔 한 번 더 해 봐요.'],
  '식히기': ['뜨거운 물에 백반을 녹인 <b>백반 물</b>을 비커에 담아요.', '<b>얼음물</b>(빨리) 또는 <b>상자</b>(천천히) 중 어디에서 식힐지 골라요.', '<b>식히기</b>를 누르고 있어요. 온도가 내려가면서 결정이 생겨요.', '결정의 <b>크기와 개수</b>를 살펴봐요. 빨리 식힌 것과 천천히 식힌 것이 달라요.', '<b>표에 적어</b>요. 다른 방법으로 식혀 비교해 봐요.'],
};
const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

export async function mountVolcano3D(el, opts = {}) {
  let THREE, Stage, watchDetached;
  try {
    [{ Stage, watchDetached }, THREE] = await Promise.all([import('../engine.js'), import('../../world-explorer/vendor/three.module.js')]);
    const t = document.createElement('canvas'); if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('no webgl');
  } catch (_) { return mountVolcano2D(el, opts); }
  const rows = opts.rows || [], onRecord = opts.onRecord;
  let exp = '화산 모형', heat = '강하게', cool = '얼음물(빨리)', holding = false, step = 0;
  const grp = (name, key, keys, cur) => `<div class="modes" role="group" aria-label="${name}"><span class="lab-lbl">${name}</span>${keys.map((k) => `<button type="button" data-${key}="${k}" aria-pressed="${k === cur}">${k}</button>`).join('')}</div>`;
  el.innerHTML = `
    <div class="modes" role="tablist" aria-label="실험"><span class="lab-lbl">실험</span><button type="button" role="tab" data-x="화산 모형" aria-selected="true">① 화산 모형</button><button type="button" role="tab" data-x="식히기" aria-selected="false">② 식히기</button></div>
    <ol class="lab-steps" data-r="steps"></ol>
    <div data-pane="화산 모형">${grp('불 세기', 'h', Object.keys(HEATS), heat)}</div>
    <div data-pane="식히기" hidden>${grp('식힐 곳', 'c', Object.keys(COOLS), cool)}</div>
    <div class="lab3d">
      <canvas aria-label="화산 실험 3D. 끌어서 돌려 볼 수 있어요."></canvas>
      <div class="lab3d-read">
        <p class="lab-read"><span>온도</span><b data-r="temp">20</b><small>°C</small></p>
        <p class="lab-read"><span data-r="l2">연기</span><b data-r="v2">—</b><small></small></p>
        <p class="lab-read"><span data-r="l3">흘러나온 양</span><b data-r="v3">0</b><small data-r="u3">칸</small></p>
      </div>
      <p class="lab3d-tip" data-r="tip"></p>
      <div class="lab3d-btns">
        <button class="btn primary pour" data-act="main" type="button"></button>
        <button class="btn" data-act="reset" type="button">처음부터</button>
        <button class="btn" data-act="record" type="button">표에 적기</button>
      </div>
    </div>
    <table class="lab-table"><thead><tr><th>실험</th><th>조건</th><th>결과</th></tr></thead><tbody></tbody></table>`;
  const $ = (s) => el.querySelector(s), canvas = $('canvas'), tbody = $('tbody'), tip = (h) => { $('[data-r=tip]').innerHTML = h; };
  let stage;
  try { stage = new Stage(canvas); } catch (_) { return mountVolcano2D(el, opts); }
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.6, metalness: o.m ?? 0, transparent: o.op != null, opacity: o.op ?? 1, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide });
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V3 = new THREE.Vector3(), S3 = new THREE.Vector3(), AX = new THREE.Vector3(0.3, 1, 0.2).normalize();

  // ── ① 화산 모형 ──
  const A = new THREE.Group(); stage.root.add(A);
  const table = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 3.4), mat(0xd8cfbf, { r: 0.8 })); table.position.y = -0.06; table.receiveShadow = true; A.add(table);
  const ringY = 1.05;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 10, 40), mat(0x555a60, { r: 0.4, m: 0.7 })); ring.rotation.x = Math.PI / 2; ring.position.y = ringY; A.add(ring);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, ringY, 8), mat(0x555a60, { r: 0.4, m: 0.7 })); leg.position.set(Math.cos(a) * 0.58, ringY / 2, Math.sin(a) * 0.58); A.add(leg); }
  const gauze = new THREE.Mesh(new THREE.CircleGeometry(0.56, 32), mat(0x9aa0a6, { r: 0.5, m: 0.6, op: 0.75, side: THREE.DoubleSide })); gauze.rotation.x = -Math.PI / 2; gauze.position.y = ringY + 0.02; A.add(gauze);
  const lamp = new THREE.Group();
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.45, 24), mat(0xcfe6f2, { r: 0.1, op: 0.55 })); jar.position.y = 0.225; lamp.add(jar);
  const fuel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.26, 24), mat(0xa9d3ea, { r: 0.1, op: 0.7 })); fuel.position.y = 0.14; lamp.add(fuel);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.1, 16), mat(0x8a8f95, { r: 0.4, m: 0.6 })); cap.position.y = 0.5; lamp.add(cap);
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 8), mat(0xeeeeee)); wick.position.y = 0.6; lamp.add(wick);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 12), mat(0xffb03b, { e: 0xff7a00, ei: 1.4, op: 0.9 })); flame.position.y = 0.88; flame.visible = false; lamp.add(flame);
  const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 10), mat(0x7ac6ff, { e: 0x3aa0ff, ei: 1.2, op: 0.9 })); flameCore.position.y = 0.78; flameCore.visible = false; lamp.add(flameCore);
  const flameLight = new THREE.PointLight(0xffa040, 0, 3, 2); flameLight.position.y = 0.9; lamp.add(flameLight);
  A.add(lamp);
  // 포일 화산(구겨진 느낌) + 안의 마시멜로
  const foilGeo = new THREE.ConeGeometry(0.55, 0.75, 44, 6, true); { const p = foilGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z); if (r > 0.02) { const k = 1 + (hash(i) - 0.5) * 0.12; p.setX(i, x * k); p.setZ(i, z * k); } } foilGeo.computeVertexNormals(); }
  const foil = new THREE.Group();
  const foilM = new THREE.Mesh(foilGeo, mat(0xd9dcdf, { r: 0.3, m: 0.85, side: THREE.DoubleSide })); foilM.position.y = 0.375; foil.add(foilM);
  const crater = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), mat(0x3b2a22, { r: 0.9 })); crater.rotation.x = -Math.PI / 2; crater.position.y = 0.752; foil.add(crater);
  const mallow = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 20), mat(0xfff1f3, { r: 0.9 })); mallow.position.y = 0.16; foil.add(mallow);
  foil.position.y = 4; foil.visible = false; A.add(foil);
  // 흘러나온 마시멜로: 분화구에서 비탈을 타고 내려와 받침에 고이는 방울들
  const blobs = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), mat(0xfff4ee, { r: 0.55, e: 0xffb08a, ei: 0.25 }), 90); blobs.frustumCulled = false; blobs.count = 0; A.add(blobs);
  const bcol = new THREE.Color(), cHot = new THREE.Color(0xfff4ee), cSet = new THREE.Color(0xd9a36f);
  const setBlobs = (melt, set) => {
    const n = Math.round(melt * 90); let k = 0;
    for (let i = 0; i < n; i++) {
      const s = i / 90, a = 0.8 + Math.sin(i * 0.37) * 0.25;    // 흘러가는 방향(살짝 흔들림)
      const along = Math.min(1, s * 1.35), r = 0.06 + along * 0.56, y = along < 1 ? ringY + 0.7 - along * 0.7 : ringY;
      const spill = Math.max(0, s * 1.35 - 1), rr = r + spill * 0.5;
      V3.set(Math.cos(a) * rr + (hash(i) - 0.5) * 0.06, y + 0.03 + (spill > 0 ? -0.0 : 0), Math.sin(a) * rr + (hash(i + 90) - 0.5) * 0.06);
      const sc = 0.045 + hash(i + 7) * 0.03 + spill * 0.02; S3.set(sc * 1.3, sc * 0.8, sc * 1.3); M4.compose(V3, Q.identity(), S3); blobs.setMatrixAt(k++, M4);
    }
    blobs.count = k; blobs.instanceMatrix.needsUpdate = true;
    bcol.copy(cHot).lerp(cSet, set); blobs.material.color.copy(bcol); blobs.material.emissiveIntensity = 0.25 * (1 - set);
  };
  const smoke = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 7, 6), mat(0xeeeeee, { r: 1, op: 0.5 }), 120); smoke.frustumCulled = false; smoke.count = 0; A.add(smoke);
  const puffs = [];
  A.traverse((o) => { if (o.isMesh && o !== table) o.castShadow = true; });

  // ── ② 식히기 ──
  const B = new THREE.Group(); B.visible = false; stage.root.add(B);
  B.add(table.clone());
  const bath = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.55, 32, 1, true), mat(0xdde7ee, { r: 0.15, op: 0.6, side: THREE.DoubleSide })); bowl.position.y = 0.275; bath.add(bowl);
  const iceW = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.6, 0.4, 32), mat(0x9fd3ef, { r: 0.1, op: 0.7 })); iceW.position.y = 0.2; bath.add(iceW);
  for (let i = 0; i < 9; i++) { const ice = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.14), mat(0xeaf7ff, { r: 0.1, op: 0.85 })); const a = hash(i) * Math.PI * 2, r = 0.45 + hash(i + 9) * 0.2; ice.position.set(Math.cos(a) * r, 0.4, Math.sin(a) * r); ice.rotation.y = a; bath.add(ice); }
  bath.visible = false; B.add(bath);
  const boxG = new THREE.Group(); const bw = 1.5, bh = 0.5, bd = 1.5, wallM = mat(0xf2f0ea, { r: 0.95 });
  for (const [x, z, w, d] of [[0, -bd / 2, bw, 0.08], [0, bd / 2, bw, 0.08], [-bw / 2, 0, 0.08, bd], [bw / 2, 0, 0.08, bd]]) { const wl = new THREE.Mesh(new THREE.BoxGeometry(w, bh, d), wallM); wl.position.set(x, bh / 2, z); boxG.add(wl); }
  const floorB = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.08, bd), wallM); floorB.position.y = 0.04; boxG.add(floorB);
  boxG.visible = false; B.add(boxG);
  const beaker = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.8, 32, 1, true), mat(0xdbe9f3, { r: 0.05, op: 0.4, side: THREE.DoubleSide })); glass.position.y = 0.4; beaker.add(glass);
  const sol = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.29, 0.55, 32), mat(0xd9e6ee, { r: 0.1, op: 0.42 })); sol.position.y = 0.3; beaker.add(sol);
  const steam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 5), mat(0xffffff, { r: 1, op: 0.45 }), 40); steam.frustumCulled = false; steam.count = 0; beaker.add(steam);
  const crystals = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), mat(0xf7fbff, { r: 0.1, e: 0xcfe4ff, ei: 0.35 }), 160); crystals.frustumCulled = false; crystals.count = 0; beaker.add(crystals);
  const seeds = Array.from({ length: 160 }, (_, i) => ({ x: (hash(i * 5) - 0.5) * 0.5, z: (hash(i * 5 + 1) - 0.5) * 0.5, y: 0.06 + hash(i * 5 + 2) * 0.42, t: hash(i * 5 + 3), r: 0.6 + hash(i * 5 + 4) * 0.8 }));
  const therm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), mat(0xffffff, { r: 0.3 })); therm.position.set(0.18, 0.75, 0); beaker.add(therm);
  const mercury = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.6, 8), mat(0xe23b2e, { e: 0xe23b2e, ei: 0.4 })); mercury.position.set(0.18, 0.5, 0); beaker.add(mercury);
  beaker.position.y = 3; beaker.visible = false; B.add(beaker);
  B.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const setCrystals = (grow, kind) => {
    const fast = kind === '얼음물(빨리)', n = fast ? 150 : 12, size = fast ? 0.028 : 0.11; let k = 0;
    for (let i = 0; i < n; i++) {
      const s = seeds[i], g = Math.max(0, Math.min(1, (grow - s.t * 0.5) / 0.5)); if (g <= 0) continue;
      const sc = size * s.r * (0.3 + 0.7 * g); V3.set(s.x, s.y, s.z); S3.setScalar(sc); Q.setFromAxisAngle(AX, i * 0.7); M4.compose(V3, Q, S3); crystals.setMatrixAt(k++, M4);
    }
    crystals.count = k; crystals.instanceMatrix.needsUpdate = true;
  };

  // ── 상태·단계 ──
  const S = { temp: 20, melt: 0, set: 0, smoke: 0, lit: false, foilY: 4, temp2: 80, grow: 0, beakerY: 3 };
  const viewA = { theta: 0.75, phi: 1.2, dist: 3.5, target: [0.15, 0.95, 0] }, viewB = { theta: 0.6, phi: 1.25, dist: 3.1, target: [0, 0.5, 0] };
  const R = (k, v) => { const e = el.querySelector(`[data-r=${k}]`); if (e) e.textContent = v; };
  const $main = $('[data-act=main]');
  const MAIN = { '화산 모형': ['포일 화산 올리기', '불 붙이기', '가열하기 (누르고 있기)', '불 끄기', '표에 적기'], '식히기': ['백반 물 담기', '고르고 다음으로', '식히기 (누르고 있기)', '살펴보고 다음으로', '표에 적기'] };
  const isHold = () => step === 2;
  const renderSteps = () => {
    $('[data-r=steps]').innerHTML = STEPS[exp].map((t, i) => `<li class="${i < step ? 'done' : i === step ? 'on' : ''}"><span>${i + 1}</span>${t}</li>`).join('');
    $main.textContent = MAIN[exp][step]; $main.classList.toggle('pour', isHold()); tip(GUIDE[exp][step]);
  };
  const goStep = (i) => { step = i; renderSteps(); };
  const applyExp = () => {
    A.visible = exp === '화산 모형'; B.visible = !A.visible; stage.setView(A.visible ? viewA : viewB);
    el.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== exp; });
    R('l2', A.visible ? '연기' : '결정 크기'); R('l3', A.visible ? '흘러나온 양' : '결정 수'); R('u3', A.visible ? '칸' : '개');
    bath.visible = !A.visible && cool === '얼음물(빨리)'; boxG.visible = !A.visible && !bath.visible; refresh();
  };
  const refresh = () => {
    if (A.visible) {
      R('temp', Math.round(S.temp)); R('v2', S.smoke > 0.6 ? '많이' : S.smoke > 0.15 ? '조금' : '—'); R('v3', Math.round(S.melt * 10));
      setBlobs(S.melt, S.set); flame.visible = flameCore.visible = S.lit; const fl = S.lit ? (holding ? (heat === '강하게' ? 1.3 : 0.85) : 0.6) : 0; flame.scale.set(fl, fl, fl); flameCore.scale.set(fl, fl, fl); flameLight.intensity = S.lit ? (holding ? 4 : 1.5) : 0;
      foil.visible = S.foilY < 3.9; foil.position.y = ringY + 0.02 + Math.max(0, S.foilY);
    } else {
      R('temp', Math.round(S.temp2)); R('v2', S.grow < 0.05 ? '—' : cool === '얼음물(빨리)' ? '작다' : '크다'); R('v3', crystals.count);
      mercury.scale.y = Math.max(0.1, (S.temp2 - 10) / 70); mercury.position.y = 0.2 + 0.3 * mercury.scale.y;
      sol.material.color.set(S.temp2 > 50 ? 0xe9dcd0 : 0xd9e6ee); beaker.visible = S.beakerY < 2.9; beaker.position.y = 0.08 + Math.max(0, S.beakerY);
    }
  };
  const resetAll = () => { Object.assign(S, { temp: 20, melt: 0, set: 0, smoke: 0, lit: false, foilY: 4, temp2: 80, grow: 0, beakerY: 3 }); puffs.length = 0; smoke.count = 0; steam.count = 0; setCrystals(0, cool); holding = false; $main.classList.remove('on'); goStep(0); refresh(); };
  stage.update = (dt, t) => {
    if (A.visible) {
      if (S.foilY > 0) { S.foilY = Math.max(0, S.foilY - dt * 4); }
      if (S.lit && holding) { S.temp = Math.min(260, S.temp + HEATS[heat] * dt); flame.scale.y = (heat === '강하게' ? 1.3 : 0.85) * (1 + Math.sin(t * 20) * 0.08); }
      else S.temp = Math.max(20, S.temp - (S.lit ? 6 : 32) * dt);
      const over = Math.max(0, S.temp - MELT) / 120;
      if (over > 0 && S.melt < FULL && holding) { S.melt = Math.min(FULL, S.melt + over * 0.4 * dt); S.set = 0; }
      S.smoke = Math.max(0, Math.min(1, holding && S.lit ? over * 1.6 : S.smoke - dt * 0.6));
      if (!holding && S.melt > 0 && S.temp < 60) S.set = Math.min(1, S.set + dt * 0.5);
      if (S.smoke > 0.05 && puffs.length < 120 && Math.random() < S.smoke * 0.9) puffs.push({ a: Math.random() * Math.PI * 2, r: Math.random() * 0.05, y: 0, s: 0.4 + Math.random() * 0.5, v: 0.35 + S.smoke * 0.5 });
      let k = 0; for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; p.y += p.v * dt; p.r += dt * 0.16; if (p.y > 2.2) { puffs.splice(i, 1); continue; }
        V3.set(Math.cos(p.a) * p.r, ringY + 0.8 + p.y, Math.sin(p.a) * p.r); S3.setScalar(p.s * (0.6 + p.y * 0.7)); M4.compose(V3, Q.identity(), S3); smoke.setMatrixAt(k++, M4); }
      smoke.count = k; smoke.instanceMatrix.needsUpdate = true;
      if (step === 2 && S.melt >= FULL && !holding) { goStep(3); tip('마시멜로가 다 흘러나왔어요. <b>불 끄기</b>를 눌러요.'); }
      if (step === 3 && !S.lit && S.set >= 1) { goStep(4); tip('굳었어요! 연기(화산 가스)·흘러나온 것(용암)·굳은 것(화산 암석)을 <b>표에 적어</b>요.'); }
    } else {
      if (S.beakerY > 0) S.beakerY = Math.max(0, S.beakerY - dt * 3);
      if (holding && S.temp2 > 20) S.temp2 = Math.max(20, S.temp2 - COOLS[cool] * dt);
      S.grow = Math.max(S.grow, Math.min(1, (60 - S.temp2) / 40)); setCrystals(S.grow, cool);
      let k = 0; if (S.temp2 > 55 && S.beakerY <= 0) for (let i = 0; i < 40; i++) { const life = ((t * 0.5 + hash(i)) % 1); V3.set((hash(i + 40) - 0.5) * 0.4, 0.62 + life * 0.7, (hash(i + 80) - 0.5) * 0.4); S3.setScalar(0.5 + life * 1.2); M4.compose(V3, Q.identity(), S3); steam.setMatrixAt(k++, M4); }
      steam.count = k; steam.instanceMatrix.needsUpdate = true;
      if (step === 2 && S.temp2 <= 20) { goStep(3); tip(`다 식었어요. ${cool === '얼음물(빨리)' ? '<b>작은 결정이 많이</b>' : '<b>큰 결정이 조금</b>'} 생겼어요. 돌려 보며 살펴보고 다음으로 가요.`); }
    }
    refresh();
  };
  // 주 버튼: 단계에 따라 누르기 / 누르고 있기
  const start = (e) => { e.preventDefault(); if (!isHold()) return; if (A.visible && !S.lit) return; holding = true; $main.classList.add('on'); };
  const stop = () => { if (!holding) return; holding = false; $main.classList.remove('on'); refresh(); };
  $main.addEventListener('pointerdown', start); $main.addEventListener('pointerup', stop); $main.addEventListener('pointerleave', stop); $main.addEventListener('pointercancel', stop);
  $main.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !holding && isHold()) start(e); });
  $main.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  $main.addEventListener('contextmenu', (e) => e.preventDefault());
  $main.addEventListener('click', () => {
    if (isHold()) return;
    if (A.visible) {
      if (step === 0) { S.foilY = 3.8; goStep(1); }
      else if (step === 1) { S.lit = true; goStep(2); }
      else if (step === 3) { if (S.lit) { S.lit = false; tip('불을 껐어요. 흘러나온 마시멜로가 식으면서 <b>굳어 가요</b>. 잠깐 기다려요.'); } }
      else if (step === 4) record();
    } else {
      if (step === 0) { S.beakerY = 2.8; goStep(1); }
      else if (step === 1) goStep(2);
      else if (step === 3) goStep(4);
      else if (step === 4) record();
    }
    refresh();
  });
  $('[data-act=reset]').addEventListener('click', resetAll);
  el.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => { exp = b.dataset.x; el.querySelectorAll('[data-x]').forEach((x) => x.setAttribute('aria-selected', x === b)); resetAll(); applyExp(); }));
  const pick = (attr, set) => el.querySelectorAll(`[data-${attr}]`).forEach((b) => b.addEventListener('click', () => { set(b.dataset[attr]); el.querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute('aria-pressed', x === b)); if (step > 2) resetAll(); applyExp(); }));
  pick('h', (v) => { heat = v; }); pick('c', (v) => { cool = v; });
  const renderRows = () => { tbody.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.exp}</td><td>${r.cond}</td><td>${r.result}</td></tr>`).join('') : '<tr><td colspan="3" class="empty">아직 기록이 없어요.</td></tr>'; };
  function record() {
    let row;
    if (A.visible) {
      if (step < 4) { tip(step < 2 ? '먼저 화산을 올리고 불을 붙여요.' : step === 2 ? '<b>가열하기</b>를 눌러 마시멜로를 다 흘러나오게 해요.' : '<b>불 끄기</b>를 누르고 굳을 때까지 기다려요.'); return; }
      row = { exp: '화산 모형', cond: `불 ${heat}`, result: `연기 ${heat === '강하게' ? '많이' : '조금'}, 흘러나온 양 ${Math.round(S.melt * 10)}칸, 식으니 굳음` };
    } else {
      if (step < 3) { tip('<b>식히기</b>를 눌러 다 식힌 뒤에 적어요.'); return; }
      row = { exp: '식히기', cond: cool, result: cool === '얼음물(빨리)' ? `작은 결정 ${crystals.count}개` : `큰 결정 ${crystals.count}개` };
    }
    const i = rows.findIndex((r) => r.exp === row.exp && r.cond === row.cond); if (i >= 0) rows[i] = row; else rows.push(row);
    renderRows(); onRecord?.(rows); tip('적었어요! 조건을 바꿔 다시 하거나(처음부터), 다른 실험으로 가요.');
  }
  $('[data-act=record]').addEventListener('click', record);
  renderRows(); resetAll(); applyExp();
  watchDetached(el, () => stage.dispose());
  return { rows };
}

// WebGL이 없는 기기: 조건을 고르면 결과를 읽는 실험실
function mountVolcano2D(el, opts = {}) {
  const rows = opts.rows || [], onRecord = opts.onRecord;
  const R = { '불 약하게': ['화산 모형', '연기 조금, 흘러나온 양 4칸, 식으니 굳음'], '불 강하게': ['화산 모형', '연기 많이, 흘러나온 양 9칸, 식으니 굳음'], '얼음물(빨리)': ['식히기', '작은 결정 150개'], '상자(천천히)': ['식히기', '큰 결정 12개'] };
  el.innerHTML = `<p class="lead">이 기기에서는 3D를 보여 줄 수 없어요. 조건을 고르면 실험 결과를 알려 줘요.</p>
    <div class="modes">${Object.keys(R).map((k) => `<button type="button" data-k="${k}">${k}</button>`).join('')}</div><p class="lab3d-tip" data-r="tip">조건을 골라요.</p>
    <table class="lab-table"><thead><tr><th>실험</th><th>조건</th><th>결과</th></tr></thead><tbody></tbody></table>`;
  const tbody = el.querySelector('tbody'), render = () => { tbody.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.exp}</td><td>${r.cond}</td><td>${r.result}</td></tr>`).join('') : '<tr><td colspan="3" class="empty">아직 기록이 없어요.</td></tr>'; };
  el.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k, row = { exp: R[k][0], cond: k, result: R[k][1] };
    const i = rows.findIndex((r) => r.cond === k); if (i >= 0) rows[i] = row; else rows.push(row); render(); onRecord?.(rows); el.querySelector('[data-r=tip]').textContent = `${k}: ${R[k][1]}`;
  }));
  render(); return { rows };
}
