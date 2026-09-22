// 4-1 Ⅲ 땅의 변화 — 흙 언덕 물길: 위쪽은 깎이고(침식) 흙이 옮겨져(운반) 아래쪽에 쌓인다(퇴적)
// 언덕은 높이 함수로 만든 지형(정점 색 = 흙·젖은 흙·색 모래). 물길이 실제로 파이고, 아래쪽에 부채꼴로 쌓인다.
import { PALETTE as P, box, label, arrow, THREE, mat, lerp } from './_kit.js';

const BASE = 0.2, HH = 1.5, SIG = 0.72;                    // 쟁반 윗면 높이, 언덕 높이, 언덕 폭
const X0 = -1.7, X1 = 3.0, Z0 = -1.45, Z1 = 1.45, NX = 110, NZ = 70;
const FAN = { x: 2.05, sx: 0.45, sz: 0.55, h: 0.3 };
const C = { dry: new THREE.Color(0xc9a06a), dark: new THREE.Color(0x9a7246), wet: new THREE.Color(0x6e4f31), sand: new THREE.Color(0x2ec4b6) };

// 값 노이즈(결정적) — 흙 표면의 울퉁불퉁함
const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function noise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return lerp(lerp(hash(xi, zi), hash(xi + 1, zi), u), lerp(hash(xi, zi + 1), hash(xi + 1, zi + 1), u), v);
}
const rough = (x, z) => (noise(x * 3.1, z * 3.1) - 0.5) * 0.07 + (noise(x * 9, z * 9) - 0.5) * 0.025;
const zc = (x) => 0.13 * Math.sin(x * 2.3);                  // 물길 가운데선(살짝 굽이침)
const mound = (x, z) => HH * Math.exp(-(x * x + z * z) / (2 * SIG * SIG));
// 물길 깊이: 꼭대기~중턱에서 깊고 아래로 갈수록 얕아진다
const gully = (x, z, e) => { if (x < -0.05) return 0; const w = Math.exp(-((x - 0.55) ** 2) / (2 * 0.45 ** 2)); return e * 0.26 * w * Math.exp(-((z - zc(x)) ** 2) / (2 * 0.11 ** 2)); };
const fan = (x, z, d) => d * FAN.h * Math.exp(-(((x - FAN.x) / FAN.sx) ** 2 + ((z - zc(x)) / FAN.sz) ** 2) / 2);
const height = (x, z, e, d) => Math.max(0.04, mound(x, z) + rough(x, z) * (mound(x, z) > 0.05 ? 1 : 0.2) - gully(x, z, e) + fan(x, z, d));

function terrain() {
  const geo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ); geo.rotateX(-Math.PI / 2); geo.translate((X0 + X1) / 2, 0, 0);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0 }));
  m.castShadow = true; m.receiveShadow = true; m.position.y = BASE;
  const c = new THREE.Color();
  m.userData.set = (e, d) => {
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = height(x, z, e, d);
      pos.setY(i, h);
      const n = noise(x * 6, z * 6);
      c.copy(C.dry).lerp(C.dark, n * 0.45 + (h < 0.02 ? 0.25 : 0));
      const g = gully(x, z, 1), inCh = Math.min(1, g / 0.12);
      if (e > 0) c.lerp(C.wet, Math.min(1, inCh * 0.85 * Math.min(1, e * 3)));     // 물이 흐른 자리는 젖어 어두움
      const fw = fan(x, z, 1) / FAN.h;
      if (d > 0) c.lerp(C.wet, fw * 0.5 * d);
      const top = Math.max(0, (mound(x, z) - HH * 0.8) / (HH * 0.2));            // 꼭대기 색 모래
      const sandTop = top * (1 - e * Math.min(1, inCh * 1.6 + 0.35));            // 깎인 만큼 사라짐
      const sandFan = d * Math.max(0, fw - 0.35) * 1.4 * (0.35 + 0.65 * noise(x * 16, z * 16));
      c.lerp(C.sand, Math.min(0.95, sandTop * 0.95 + sandFan));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    pos.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.computeVertexNormals();
    m.userData.e = e; m.userData.d = d;
  };
  m.userData.set(0, 0);
  return m;
}

// 물: 물길을 따라 흐르는 물띠(밝은 물결 무늬가 아래로 흘러감) + 물방울 + 흙탕물 웅덩이 + 컵에서 떨어지는 물줄기
const PATH_N = 80, px = (k) => lerp(0.02, 2.55, k);
const CLEAR = new THREE.Color(0x4f9fdc), MUD = new THREE.Color(0x8a7458), FOAM = new THREE.Color(0xe6f4ff);
function water(hill) {
  const g = new THREE.Group();
  const W = 0.1, geo = new THREE.BufferGeometry(), NV = (PATH_N + 1) * 2, v = new Float32Array(NV * 3), vc = new Float32Array(NV * 3), idx = [];
  for (let k = 0; k < PATH_N; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3)); geo.setAttribute('color', new THREE.BufferAttribute(vc, 3)); geo.setIndex(idx);
  const ribbon = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.8, roughness: 0.08, metalness: 0.1, side: THREE.DoubleSide }));
  g.add(ribbon);
  const ND = 90, drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), mat(0xd8eeff, { opacity: 0.7, roughness: 0.05 }), ND);
  const NG = 30, grains = new THREE.InstancedMesh(new THREE.SphereGeometry(0.024, 6, 4), mat(0x2ec4b6, { roughness: 0.8 }), NG);
  const NF = 14, fall = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), mat(0x9fd0f5, { opacity: 0.8, roughness: 0.05 }), NF);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 40), mat(0x6f8fa8, { opacity: 0.6, roughness: 0.05 }));
  pool.rotation.x = -Math.PI / 2; pool.scale.set(0.01, 0.01, 1);
  g.add(drops, grains, fall, pool); g.position.y = BASE;
  const at = (s, off = 0) => { const x = px(s), z = zc(x) + off; return [x, height(x, z, hill.userData.e, hill.userData.d) + 0.02, z]; };
  const U = g.userData; U.front = 0; U.carry = 0; U.t = 0;
  U.refresh = () => {
    for (let k = 0; k <= PATH_N; k++) {
      const s = Math.min(k / PATH_N, U.front), w = W * (0.7 + 1.0 * s) * (k / PATH_N > U.front ? 0.2 : 1);
      const [x1, y1, z1] = at(s, -w), [x2, y2, z2] = at(s, w); v.set([x1, y1, z1, x2, y2, z2], k * 6);
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
    const [fx, fy, fz] = at(0.96); pool.position.set(fx, fy - 0.008, fz);
    const r = Math.max(0.01, (U.front - 0.92) / 0.08) * (0.2 + 0.1 * U.carry); pool.scale.set(r * 1.4, r, 1);
    pool.material.color.copy(CLEAR).lerp(MUD, U.carry * 0.8);
  };
  const M = new THREE.Matrix4(), S = new THREE.Vector3(), c = new THREE.Color(), seeds = Array.from({ length: ND + NG }, (_, i) => [hash(i, 1), (hash(i, 2) - 0.5) * 0.14]);
  const LIP = new THREE.Vector3(-0.05, HH + 0.5, 0), PEAK = new THREE.Vector3(0.02, HH + 0.02, 0);
  U.tick = (dt) => {
    U.t += dt; const t = U.t;
    // 물결 무늬: 밝은 줄이 위에서 아래로 흘러간다. 흙을 깎는 동안은 흙탕물 색.
    const base = c.copy(CLEAR).lerp(MUD, U.carry * 0.75), foam = FOAM.clone().lerp(MUD, U.carry * 0.4);
    for (let k = 0; k <= PATH_N; k++) {
      const s = k / PATH_N, wave = Math.max(0, Math.sin(s * 46 - t * 9)) ** 3 * 0.7 + Math.max(0, Math.sin(s * 23 - t * 6 + 1.3)) ** 4 * 0.3;
      const col = base.clone().lerp(foam, wave);
      for (const j of [0, 1]) vc.set([col.r, col.g, col.b], (k * 2 + j) * 3);
    }
    geo.attributes.color.needsUpdate = true;
    for (let i = 0; i < ND; i++) { const [s0, o] = seeds[i], s = (s0 + t * 0.55) % 1;
      if (s > U.front) { M.makeScale(0, 0, 0); } else { const [x, y, z] = at(s, o * (0.6 + s)); M.makeTranslation(x, y + 0.012, z); }
      drops.setMatrixAt(i, M); }
    drops.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NG; i++) { const [s0, o] = seeds[ND + i], s = (s0 + t * 0.3) % 1;
      const k = s > U.front ? 0 : U.carry; const [x, y, z] = at(s, o * 0.8); M.makeTranslation(x, y + 0.014, z).scale(S.set(k, k, k)); grains.setMatrixAt(i, M); }
    grains.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NF; i++) { const q = (i / NF + t * 1.6) % 1; const p = LIP.clone().lerp(PEAK, q); p.y -= q * q * 0.1; M.makeTranslation(p.x, p.y, p.z); fall.setMatrixAt(i, M); }
    fall.instanceMatrix.needsUpdate = true;
  };
  return g;
}

export default {
  view: { theta: 1.02, phi: 1.08, dist: 7.0, target: [0.8, 0.95, 0] },
  build(kit, world) {
    const tray = new THREE.Group();
    const bed = box(5.0, 0.16, 3.2, 0xa9b2bb, { roughness: 0.45, metalness: 0.35 }); bed.position.y = 0.12; tray.add(bed);
    [[0, 1.62, 5.0, 0.06], [0, -1.62, 5.0, 0.06]].forEach(([x, z, w, d]) => { const r = box(w, 0.22, d, 0x98a2ac, { roughness: 0.4, metalness: 0.4 }); r.position.set(x, 0.21, z); tray.add(r); });
    [[2.5, 0], [-2.5, 0]].forEach(([x, z]) => { const r = box(0.06, 0.22, 3.3, 0x98a2ac, { roughness: 0.4, metalness: 0.4 }); r.position.set(x, 0.21, z); tray.add(r); });
    tray.position.x = 0.65; tray.traverse((o) => { o.receiveShadow = true; }); world.add('tray', tray);
    const hill = terrain(); world.add('hill', hill);
    const wat = water(hill); world.add('water', wat);
    const cup = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.46, 32, 1, true), mat(0xf2f2ee, { roughness: 0.6, side: THREE.DoubleSide }));
    const inside = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), mat(0x5fa8e0, { opacity: 0.8 })); inside.rotation.x = -Math.PI / 2; inside.position.y = 0.02;
    cup.add(wall, inside); cup.rotation.z = -0.75; cup.position.set(-0.28, BASE + HH + 0.62, 0); cup.traverse((o) => { o.castShadow = true; }); world.add('cup', cup);
    const lbQ = label('색 모래는 어디로 갈까?', { size: 0.3 }); lbQ.position.set(0.5, 2.55, 0); world.add('lbQ', lbQ);
    const lbCut = label('위쪽은 깎여요 — 침식', { size: 0.28 }); lbCut.position.set(0.1, 2.35, 0); world.add('lbCut', lbCut);
    const lbMove = label('흙이 물을 따라 옮겨져요 — 운반', { size: 0.26 }); lbMove.position.set(1.2, 1.75, 0); world.add('lbMove', lbMove);
    const lbPile = label('아래쪽에 쌓여요 — 퇴적', { size: 0.28 }); lbPile.position.set(2.1, 0.95, 0); world.add('lbPile', lbPile);
    const down = arrow([0.35, BASE + 1.55, 0.55], [1.9, BASE + 0.45, 0.55], P.red, 0.035); world.add('down', down);
    return { update(dt) { if (wat.visible) wat.userData.tick(dt); } };
  },
  beats: [
    { text: '쟁반에 흙 언덕을 만들고, 꼭대기에 색 모래를 뿌려요.', show: ['tray', 'hill', 'lbQ'], dur: 4,
      reset(o) { o.hill.userData.set(0, 0); Object.assign(o.water.userData, { carry: 0, front: 0 }); o.water.userData.refresh(); } },
    { text: '컵으로 언덕 위쪽에서 물을 천천히 흘려보내요. 물이 언덕을 타고 흘러내려요.', show: ['cup', 'water'], dur: 5,
      anim(p, o) { o.water.userData.front = p; o.water.userData.refresh(); } },
    { text: '물이 흐르면서 위쪽의 흙과 색 모래를 깎아 내요.', show: ['lbCut'], hide: ['lbQ'], dur: 5,
      anim(p, o) { o.hill.userData.set(p, 0); Object.assign(o.water.userData, { carry: p, front: 1 }); o.water.userData.refresh(); } },
    { text: '깎인 흙은 흐르는 물을 따라 아래로 옮겨져요.', show: ['down', 'lbMove'], hide: ['lbCut'], dur: 5,
      anim(p, o) { o.hill.userData.set(1, 0.35 * p); Object.assign(o.water.userData, { carry: 1, front: 1 }); o.water.userData.refresh(); } },
    { text: '물이 느려지는 아래쪽에 흙과 색 모래가 쌓여요.', show: ['lbPile'], hide: ['lbMove', 'down'], dur: 6,
      anim(p, o) { o.hill.userData.set(1, lerp(0.35, 1, p)); o.water.userData.refresh(); } },
  ],
};
