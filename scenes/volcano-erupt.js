// 4-1 Ⅲ 땅의 변화 — 화산 분출. 땅속을 비춰 보면(반투명) 마그마 방과 통로가 보이고, 분출하면 용암 분수·화산재 기둥·
// 암석 조각이 나온다. 용암은 땅 위에서 빨리 식어 현무암, 땅속 마그마는 천천히 식어 화강암이 된다.
import { PALETTE as P, box, sphere, label, mat, THREE, clamp01, lerp } from './_kit.js';

const H = 2.4, R = 2.6, CR = 0.32, Y0 = 2.6;   // Y0: 땅 표면 높이(그 아래가 땅속 단면)                      // 산 높이·밑반지름·분화구 반지름
const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const hash2 = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function noise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return lerp(lerp(hash2(xi, zi), hash2(xi + 1, zi), u), lerp(hash2(xi, zi + 1), hash2(xi + 1, zi + 1), u), v); }
// 산 높이: 원뿔 + 울퉁불퉁 + 분화구 움푹
const hillY = (x, z) => { const d = Math.hypot(x, z); const cone = H * Math.max(0, 1 - d / R) ** 1.15; const crater = d < CR * 1.6 ? -0.35 * Math.max(0, 1 - d / (CR * 1.6)) : 0;
  return Math.max(0, cone + (noise(x * 1.7, z * 1.7) - 0.5) * 0.28 * Math.min(1, cone) + (noise(x * 6, z * 6) - 0.5) * 0.06 + crater); };

function terrain() {
  const S = 9, N = 140, geo = new THREE.PlaneGeometry(S, S, N, N); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const rock = new THREE.Color(0x4a4038), rock2 = new THREE.Color(0x6e5a4a), red = new THREE.Color(0x7a3b2a), grass = new THREE.Color(0x6f8f4c), grass2 = new THREE.Color(0x8fa565), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = hillY(x, z); pos.setY(i, y);
    const n = noise(x * 3, z * 3), d = Math.hypot(x, z);
    c.copy(grass).lerp(grass2, n); c.lerp(rock.clone().lerp(rock2, n), clamp01((y - 0.15) / 0.6)); c.lerp(red, clamp01(1 - d / 0.9) * 0.6);
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, transparent: true, opacity: 1 }));
  m.castShadow = true; m.receiveShadow = false; m.userData.xray = (t) => { m.material.opacity = lerp(1, 0.18, t); m.material.depthWrite = t < 0.05; m.castShadow = t < 0.5; };
  return m;
}
// 땅속: 잘라 놓은 흙층(카메라 쪽 면) — X-ray 때만 보임
function underground() {
  const g = new THREE.Group(), mats = [];
  // 카메라 쪽 절반을 잘라 낸 지층 단면. 투명 상자 다섯 겹보다 마그마 방과 통로가 또렷하다.
  const layerColors = [0x6f5540, 0x57402f, 0x3f3026];
  for (let i = 0; i < 3; i++) { const m = new THREE.MeshStandardMaterial({ color: layerColors[i], roughness: 1, transparent: true, opacity: 0.98 }); mats.push(m);
    const b = new THREE.Mesh(new THREE.BoxGeometry(9, Y0 / 3, 4.7), m); b.position.set(0, Y0 - (i + 0.5) * (Y0 / 3), -2.25); g.add(b); }
  const ch = sphere(1, 0xff5a1f, { emissive: 0xff3d00, emissiveIntensity: 1, roughness: 0.4 }); ch.scale.set(1.9, 0.85, 1.4); ch.position.y = 0.95; g.add(ch);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.3, H + Y0 - 0.9, 20), mat(0xff6a2a, { emissive: 0xff3d00, emissiveIntensity: 0.9 })); pipe.position.y = 0.95 + (H + Y0 - 0.9) / 2; g.add(pipe);
  const gran = new THREE.Group(); const body = sphere(1, 0xd9cfc2, { roughness: 0.9 }); body.scale.copy(ch.scale); gran.add(body);
  const cols = [0xf2e9dc, 0xe5b5a0, 0x2b2b2b, 0xc9c1b5], gg = new THREE.SphereGeometry(0.09, 6, 5);
  for (let i = 0; i < 90; i++) { const s = new THREE.Mesh(gg, mat(cols[i % 4], { roughness: 0.8 })); const a = hash(i) * Math.PI * 2, b = (hash(i + 90) - 0.5) * Math.PI; s.position.set(Math.cos(a) * Math.cos(b) * 1.9, Math.sin(b) * 0.85, Math.sin(a) * Math.cos(b) * 1.4); gran.add(s); }
  gran.position.copy(ch.position); gran.visible = false; g.add(gran);
  g.userData = { ch, pipe, gran, xray: (t) => { const o = lerp(0.98, 0.78, t); mats.forEach((m) => { m.opacity = o; }); ch.visible = ch.visible && true; [ch, pipe, gran].forEach((x) => { x.traverse((n) => { if (n.material) { n.material.transparent = true; n.material.opacity = 0.15 + 0.85 * t; } }); }); } };
  return g;
}
// 화산재 기둥: 인스턴스 구름. 시간에 따라 계속 솟고 위에서 우산처럼 퍼진다
function ashColumn(n = 620) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8c8c8c, roughness: 1, transparent: true, opacity: 0.92 }), n); m.frustumCulled = false;
  m.count = 0; m.userData.seed = Array.from({ length: n }, (_, i) => ({ t0: hash(i) * 6, a: hash(i + n) * Math.PI * 2, r: hash(i + 2 * n), s: 0.6 + hash(i + 3 * n) * 0.9 }));
  m.userData.color = new THREE.Color(); m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  return m;
}
function setAsh(m, t, strength) {   // strength 0..1 (분출 세기), t 시간
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), dark = new THREE.Color(0x4d4a48), light = new THREE.Color(0xd6d3cf);
  let k = 0; const c = m.userData.color;
  for (const s of m.userData.seed) {
    const life = ((t * 0.55 + s.t0) % 6) / 6; if (life > strength * 0.999) continue;
    const y = H - 0.2 + life * 6.0, spread = 0.3 + life * life * 3.0 + (life > 0.6 ? (life - 0.6) * 5 : 0);
    const wob = Math.sin(t * 1.3 + s.a * 3) * 0.25;
    v.set(Math.cos(s.a) * spread * s.r + wob, y, Math.sin(s.a) * spread * s.r + wob * 0.6); sc.setScalar((0.8 + life * 2.6) * s.s);
    M.compose(v, q, sc); m.setMatrixAt(k, M); c.copy(dark).lerp(light, clamp01(life * 1.3 + s.r * 0.3)); m.setColorAt(k, c); k++;
  }
  m.count = k; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
}
// 용암 분수 + 암석 조각: 포물선으로 튀어 올랐다 떨어진다
function fountain(n, r, color, opts) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 7, 6), mat(color, opts), n); m.frustumCulled = false; m.count = 0;
  m.userData.seed = Array.from({ length: n }, (_, i) => ({ t0: hash(i * 3) * 2.2, a: hash(i * 3 + 1) * Math.PI * 2, vy: 4.5 + hash(i * 3 + 2) * 4, vh: 0.4 + hash(i * 7) * 1.6, s: 0.6 + hash(i * 11) }));
  return m;
}
function setFountain(m, t, strength, period = 2.2) {
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(); let k = 0;
  for (const s of m.userData.seed) {
    const tt = (t + s.t0) % period; if (s.t0 / 2.2 > strength) continue;
    const x = Math.cos(s.a) * s.vh * tt, z = Math.sin(s.a) * s.vh * tt, y = H - 0.15 + s.vy * tt - 4.9 * tt * tt;
    const gy = hillY(x, z); if (y < gy) continue;
    v.set(x, y, z); sc.setScalar(s.s); M.compose(v, q, sc); m.setMatrixAt(k++, M);
  }
  m.count = k; m.instanceMatrix.needsUpdate = true;
}
// 용암류: 산비탈을 따라 흘러내리는 띠 세 줄기(지형 높이를 따라감)
function lavaFlows() {
  const g = new THREE.Group(), N = 60, W = 0.3, hot = new THREE.Color(0xffd166), mid = new THREE.Color(0xff5400), cool = new THREE.Color(0x231d1a), c = new THREE.Color();
  const dirs = [[1, 0.35], [-0.7, 0.75], [0.2, -1]];
  const meshes = dirs.map(([dx, dz], j) => {
    const geo = new THREE.PlaneGeometry(1, 1, 1, N - 1), pos = geo.attributes.position, col = new Float32Array(pos.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xff4d00, emissiveIntensity: 1, roughness: 0.55, side: THREE.DoubleSide }));
    const L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, len = 2.9 + j * 0.4;
    m.userData.set = (p, k) => {
      for (let i = 0; i < pos.count; i++) {
        const row = Math.floor(i / 2), side = i % 2 ? 1 : -1, t = row / (N - 1), d = CR * 0.8 + t * len * p, w = W * (0.7 + 0.5 * Math.sin(t * 7 + j)) * (0.6 + p * 0.4);
        const wig = Math.sin(t * 5 + j * 2) * 0.18 * t;
        const x = ux * d - uz * (side * w + wig), z = uz * d + ux * (side * w + wig);
        pos.setXYZ(i, x, hillY(x, z) + 0.06, z);
        c.copy(hot).lerp(mid, Math.min(1, t * 1.5)).lerp(cool, k * (0.5 + 0.5 * t)); col.set([c.r, c.g, c.b], i * 3);
      }
      pos.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.computeVertexNormals(); m.material.emissiveIntensity = (1 - k) * 1.1; m.visible = p > 0.01;
    };
    m.userData.set(0, 0); g.add(m); return m;
  });
  g.userData.set = (p, k) => meshes.forEach((m) => m.userData.set(p, k));
  return g;
}
// 암석 표본
function rock(kind) {
  const g = new THREE.Group(), dark = kind === 'basalt';
  const slab = box(1.2, 0.5, 0.85, dark ? 0x3a3a3a : 0xd9cfc2, { roughness: 0.9 }); g.add(slab);
  const n = dark ? 300 : 70, r = dark ? 0.018 : 0.065, cols = dark ? [0x1f1f1f, 0x4a4a4a, 0x2c2c2c] : [0xf2e9dc, 0xe5b5a0, 0x2b2b2b, 0xc9c1b5];
  const geo = new THREE.SphereGeometry(r, 6, 5), mats = cols.map((c) => mat(c, { roughness: 0.8 }));
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(geo, mats[i % mats.length]); s.position.set((hash(i * 7) - 0.5) * 1.1, 0.25 + r * 0.6, (hash(i * 7 + 1) - 0.5) * 0.76); s.scale.y = 0.5; g.add(s); }
  if (dark) for (let i = 0; i < 20; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(0x111111)); h.position.set((hash(i * 11) - 0.5) * 1.05, 0.26, (hash(i * 11 + 1) - 0.5) * 0.72); h.scale.y = 0.3; g.add(h); }
  g.traverse((o) => { o.castShadow = true; });
  return g;
}

const ST = { xray: 0, erupt: 0, cool: 0, t: 0 };

export default {
  view: { theta: 0.5, phi: 1.15, dist: 12.5, target: [0, Y0 + 1.2, 0] },
  build(kit, world) {
    const ter = terrain(); world.add('terrain', ter);
    const ug = underground(); world.add('under', ug);
    const ash = ashColumn(); world.add('ash', ash);
    const fire = fountain(120, 0.075, 0xffb347, { emissive: 0xff5a00, emissiveIntensity: 1.4 }); world.add('fire', fire);
    const bombs = fountain(26, 0.13, 0x4a3f38, { roughness: 1 }); world.add('bombs', bombs);
    const flows = lavaFlows(); world.add('flows', flows);
    const glow = new THREE.PointLight(0xff6a00, 0, 9, 2); glow.position.set(0, H + 0.6, 0); world.add('glow', glow);
    const lbM = label('땅속 마그마 방', { size: 0.48, color: '#7f1d0f', bg: 'rgba(255,238,218,0.96)' }); lbM.position.set(0, 1.05, 2.7); world.add('lbM', lbM);
    const lbQ = label('화산에서는 무엇이 나올까?', { size: 0.48, color: '#1E3A78' }); lbQ.position.set(0, H + 1.2, 0); world.add('lbQ', lbQ);
    const lbG = label('화산 가스 — 기체', { size: 0.46, color: '#1E3A78', bg: 'rgba(230,240,255,0.96)' }); lbG.position.set(-3.2, H + 4.2, 0); world.add('lbG', lbG);
    const lbA = label('화산재·암석 조각 — 고체', { size: 0.46, bg: 'rgba(245,245,245,0.97)' }); lbA.position.set(3.3, H + 2.6, 0); world.add('lbA', lbA);
    const lbL = label('용암 — 액체', { size: 0.46, color: '#8b1e1e', bg: 'rgba(255,225,200,0.97)' }); lbL.position.set(2.9, 1.1, 1.6); world.add('lbL', lbL);
    const bas = rock('basalt'); bas.position.set(3.6, 0.3, 2.6); world.add('basalt', bas);
    const lbB = label('땅 위에서 빨리 식음 → 현무암 (알갱이 작음)', { size: 0.4 }); lbB.position.set(3.6, 1.25, 2.6); world.add('lbB', lbB);
    const gra = rock('granite'); gra.position.set(-3.6, 0.3, 2.6); world.add('granite', gra);
    const lbGr = label('땅속에서 천천히 식음 → 화강암 (알갱이 큼)', { size: 0.4 }); lbGr.position.set(-3.6, 1.25, 2.6); world.add('lbGr', lbGr);
    // 지표와 분출물은 Y0 위, 마그마 방과 지층은 Y0 아래에 둔다.
    for (const o of [ter, ash, fire, bombs, flows, glow, lbQ, lbG, lbA, lbL, bas, lbB, gra, lbGr]) o.position.y += Y0;
    const st = ST; Object.assign(st, { xray: 0, erupt: 0, cool: 0, t: 0 });
    return { update(dt, t) {
      st.t = t; ter.userData.xray(st.xray); ug.userData.xray(st.xray);
      ug.userData.ch.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.25; ug.userData.pipe.material.emissiveIntensity = 0.7 + Math.sin(t * 6) * 0.25;
      const e = st.erupt * (1 - st.cool);
      setAsh(ash, t, e); setFountain(fire, t, e); setFountain(bombs, t * 0.8, e, 2.6);
      glow.intensity = e * (26 + Math.sin(t * 9) * 8) + (st.erupt > 0 ? 3 * (1 - st.cool) : 0);
      flows.userData.set(Math.min(1, st.erupt * 1.15), st.cool);
    } };
  },
  beats: [
    { text: '산처럼 보이지만, 땅속을 비춰 보면 뜨거운 마그마가 모여 있는 방과 통로가 있어요.', show: ['terrain', 'under', 'lbM', 'lbQ'], dur: 5,
      reset(o) { Object.assign(ST, { xray: 1, erupt: 0, cool: 0 }); o.under.userData.gran.visible = false; o.under.userData.ch.visible = true; o.under.userData.pipe.visible = true; },
      anim(p, o, t) { ST.xray = 1; } },
    { text: '마그마가 통로를 타고 솟구쳐요. 화산이 분출해요! 용암이 분수처럼 튀고 화산재가 하늘로 치솟아요.', show: ['ash', 'fire', 'bombs', 'flows', 'glow'], hide: ['lbQ', 'lbM'], dur: 7,
      anim(p, o, t) { ST.xray = 1 - Math.min(1, p * 4); ST.erupt = p; } },
    { text: '나오는 것은 세 가지예요. 기체인 화산 가스, 액체인 용암, 고체인 화산재와 암석 조각.', show: ['lbG', 'lbL', 'lbA'], dur: 7,
      anim(p, o, t) { ST.erupt = 1; } },
    { text: '흘러나온 용암은 땅 위에서 빨리 식어 알갱이가 작고 어두운 현무암이 돼요. 구멍은 가스가 빠져나간 자리예요.', show: ['basalt', 'lbB'], hide: ['lbG', 'lbA', 'lbL'], dur: 7,
      anim(p, o, t) { ST.cool = p; } },
    { text: '땅속에 남은 마그마는 아주 천천히 식어 알갱이가 큰 화강암이 돼요.', show: ['granite', 'lbGr'], hide: ['basalt', 'lbB'], dur: 7,
      anim(p, o, t) { ST.cool = 1; ST.xray = Math.min(1, p * 3); const g = p > 0.5; o.under.userData.gran.visible = g; o.under.userData.ch.visible = !g; } },
  ],
};
