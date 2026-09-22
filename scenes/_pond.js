// 연못과 물에 사는 식물 모형 — 3D 장면(pond-plants)과 체험 실험실(lab-pond3d)이 함께 쓴다.
// 좌표: 물 표면 y = SURF. 왼쪽이 물가(땅), 오른쪽으로 갈수록 깊어진다. 깊이는 depthAt(x).
import { THREE, mat } from './_kit.js';

export const SURF = 1.0, BANK_X = -1.9, POND = { x0: -2.8, x1: 2.6, z0: -1.1, z1: 1.1 };
export const bottomAt = (x) => (x < BANK_X ? SURF + 0.12 : Math.max(0.05, SURF - Math.min(1, (x - BANK_X) / 1.6) * 0.95));
export const where = (x) => (x < BANK_X ? '땅' : x < BANK_X + 0.7 ? '물가' : '물');

const UP = new THREE.Vector3(0, 1, 0);
const LEAF = 0x3f9a4a, LEAF2 = 0x2f7d3c, STALK = 0x7cb85a, ROOT = 0x6b4a2e;

// 연못 단면: 흙 바닥(물가 쪽이 얕음) + 유리 앞면 + 물 + 풀밭
export function pond() {
  const g = new THREE.Group();
  const N = 60, shape = new THREE.Shape(); shape.moveTo(POND.x0, 0);
  for (let i = 0; i <= N; i++) { const x = POND.x0 + (POND.x1 - POND.x0) * i / N; shape.lineTo(x, bottomAt(x)); }
  shape.lineTo(POND.x1, 0); shape.closePath();
  const soil = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: POND.z1 - POND.z0, bevelEnabled: false }), mat(0x8a6a45, { roughness: 1 }));
  soil.position.z = POND.z0; soil.receiveShadow = true; g.add(soil);
  const grass = new THREE.Mesh(new THREE.BoxGeometry(BANK_X - POND.x0, 0.04, POND.z1 - POND.z0), mat(0x7fb35a));
  grass.position.set((POND.x0 + BANK_X) / 2, SURF + 0.14, 0); g.add(grass);
  const water = new THREE.Mesh(new THREE.BoxGeometry(POND.x1 - BANK_X, SURF - 0.02, POND.z1 - POND.z0), new THREE.MeshPhysicalMaterial({ color: 0x5fa8d8, roughness: 0.08, transparent: true, opacity: 0.32, depthWrite: false }));
  water.position.set((BANK_X + POND.x1) / 2, (SURF - 0.02) / 2 + 0.01, 0); g.add(water);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(POND.x1 - BANK_X, POND.z1 - POND.z0, 40, 16), new THREE.MeshPhysicalMaterial({ color: 0x7fc0e8, roughness: 0.05, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
  top.rotation.x = -Math.PI / 2; top.position.set((BANK_X + POND.x1) / 2, SURF, 0); g.add(top);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(POND.x1 - POND.x0, SURF + 0.2, 0.03), new THREE.MeshPhysicalMaterial({ color: 0xd9e8f2, roughness: 0.1, transparent: true, opacity: 0.12, depthWrite: false }));
  glass.position.set((POND.x0 + POND.x1) / 2, (SURF + 0.2) / 2, POND.z1 + 0.02); g.add(glass);
  g.userData.surface = top;
  g.userData.ripple = (t) => { const p = top.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.sin(x * 3 + t * 1.6) * 0.012 + Math.cos(y * 4 + t * 1.3) * 0.01); } p.needsUpdate = true; };
  return g;
}

const leafMat = (c = LEAF) => mat(c, { roughness: 0.55 });
function roots(n, len, spread = 0.12) {
  const g = new THREE.Group(), m = mat(ROOT, { roughness: 0.9 });
  for (let i = 0; i < n; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, len * (0.7 + 0.3 * Math.sin(i * 7.1)), 5), m); const a = i / n * Math.PI * 2; r.position.set(Math.cos(a) * spread * 0.5, -len / 2, Math.sin(a) * spread * 0.5); r.rotation.z = Math.cos(a) * 0.25; r.rotation.x = Math.sin(a) * 0.25; g.add(r); }
  return g;
}

// 부레옥잠: 잎자루가 공처럼 부풀어 있다(공기주머니) → 물 위에 떠서 산다. 원점 = 물 표면 높이.
export function hyacinth() {
  const g = new THREE.Group(), n = 6;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, arm = new THREE.Group();
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), mat(0x8fcf6a, { roughness: 0.45 })); bulb.scale.set(1, 1.35, 1); bulb.position.set(0.12, 0.08, 0); bulb.userData.bulb = true;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.22, 8), mat(STALK)); stalk.position.set(0.16, 0.24, 0); stalk.rotation.z = -0.35;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 10), leafMat()); leaf.scale.set(1, 0.18, 0.85); leaf.position.set(0.22, 0.4, 0); leaf.rotation.z = -0.5;
    arm.add(bulb, stalk, leaf); arm.rotation.y = a; arm.children.forEach((c) => { c.castShadow = true; }); g.add(arm);
  }
  const flower = new THREE.Group();
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat(0xa98ad8, { roughness: 0.5 })); f.position.set(Math.cos(i * 2.4) * 0.05, 0.5 + i * 0.045, Math.sin(i * 2.4) * 0.05); flower.add(f); }
  const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.5, 6), mat(STALK)); spike.position.y = 0.45; flower.add(spike); g.add(flower);
  const r = roots(14, 0.45, 0.16); r.position.y = 0.02; g.add(r);
  g.userData.kind = 'hyacinth'; return g;
}

// 수련: 뿌리는 바닥 흙에, 긴 잎자루 끝의 둥근 잎이 물 위에 떠 있다. place(depth)로 줄기 길이를 맞춘다. 원점 = 바닥.
export function waterLily() {
  const g = new THREE.Group(), pads = [], stems = [];
  const padGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.012, 28, 1, false, 0.3, Math.PI * 2 - 0.3);
  for (let i = 0; i < 4; i++) {
    const pad = new THREE.Mesh(padGeo, leafMat(i % 2 ? LEAF : LEAF2)); pad.castShadow = true; pads.push(pad); g.add(pad);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), mat(0x6f8f3a)); stems.push(st); g.add(st);
  }
  const flower = new THREE.Group();
  for (let i = 0; i < 10; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 6), mat(i < 5 ? 0xf6f0f5 : 0xf2b8cf)); p.scale.set(0.5, 0.25, 1); const a = i / 5 * Math.PI * 2; p.position.set(Math.cos(a) * 0.06, 0.03 + (i >= 5 ? 0.03 : 0), Math.sin(a) * 0.06); p.rotation.y = -a; flower.add(p); }
  g.add(flower); const r = roots(8, 0.12, 0.1); g.add(r);
  g.userData.place = (depth) => {
    const off = [[0.25, 0.1], [-0.22, 0.18], [0.05, -0.28], [-0.15, -0.12]];
    pads.forEach((p, i) => { p.position.set(off[i][0], depth + 0.008, off[i][1]); p.rotation.y = i * 1.3; });
    stems.forEach((s, i) => { const [x, z] = off[i], v = new THREE.Vector3(x, depth, z); s.scale.y = v.length(); s.position.copy(v).multiplyScalar(0.5); s.quaternion.setFromUnitVectors(UP, v.normalize()); });
    flower.position.set(0, depth + 0.02, 0);
  };
  g.userData.place(0.8); g.userData.kind = 'lily'; return g;
}

// 검정말: 가는 줄기에 작은 잎이 돌려나고, 물속에 잠겨서 산다. 원점 = 바닥.
export function hydrilla(h = 0.7) {
  const g = new THREE.Group(), lm = leafMat(0x2f6f35);
  for (let s = 0; s < 3; s++) {
    const stem = new THREE.Group(); const H = h * (0.8 + s * 0.12);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, H, 6), mat(0x4f7f3a)); st.position.y = H / 2; stem.add(st);
    for (let k = 1; k < 12; k++) for (let j = 0; j < 3; j++) { const lf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.006, 0.018), lm); const a = j / 3 * Math.PI * 2 + k; lf.position.set(Math.cos(a) * 0.04, H * k / 12, Math.sin(a) * 0.04); lf.rotation.y = -a; lf.rotation.z = 0.5; stem.add(lf); }
    stem.position.set((s - 1) * 0.1, 0, (s % 2) * 0.08); stem.rotation.z = (s - 1) * 0.12; g.add(stem);
  }
  g.userData.sway = (t) => g.children.forEach((c, i) => { c.rotation.z = (i - 1) * 0.12 + Math.sin(t * 1.2 + i) * 0.08; });
  g.userData.kind = 'hydrilla'; return g;
}

// 부들: 물가 얕은 곳에 뿌리를 내리고 키가 크다. 갈색 소시지 모양 이삭. 원점 = 바닥.
export function cattail(h = 1.6) {
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) { const lf = new THREE.Mesh(new THREE.BoxGeometry(0.035, h * (0.75 + 0.3 * Math.sin(i * 3)), 0.008), leafMat(i % 2 ? LEAF : 0x5a9a3a)); lf.geometry.translate(0, lf.geometry.parameters.height / 2, 0); lf.rotation.y = i * 0.9; lf.rotation.z = Math.sin(i * 2.1) * 0.12; lf.castShadow = true; g.add(lf); }
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, h * 1.05, 6), mat(0x6f8f3a)); st.position.y = h * 0.52; g.add(st);
  const spike = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.24, 6, 12), mat(0x6b4226, { roughness: 0.95 })); spike.position.y = h * 0.92; spike.castShadow = true; g.add(spike);
  g.userData.kind = 'cattail'; return g;
}

// 공기 방울(부레옥잠 잎자루를 물속에서 누를 때)
export function bubbles(n = 24) {
  const g = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.7 });
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.03 + (i % 4) * 0.01, 10, 8), m); b.userData.seed = [Math.sin(i * 12.9) * 0.14, i / n, Math.cos(i * 7.3) * 0.14]; b.visible = false; g.add(b); }
  // p: 0~1 진행, 원점에서 떠올라 SURF까지
  g.userData.play = (p, fromY) => g.children.forEach((b) => { const [x, d, z] = b.userData.seed; const q = p * 1.6 - d * 0.6; b.visible = q > 0 && q < 1; b.position.set(x + Math.sin(q * 9 + d * 20) * 0.02, fromY + (SURF - fromY) * Math.max(0, Math.min(1, q)), z); });
  return g;
}
