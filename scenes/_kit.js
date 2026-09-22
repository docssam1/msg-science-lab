// 공용 3D 키트 — 모든 장면이 같은 재질·라벨·차트 도구를 쓴다.
// 좌표는 항상 "모델"에서 계산하고(높이·비율), 눈대중 숫자는 두지 않는다.
import * as THREE from '../../world-explorer/vendor/three.module.js';

export const PALETTE = {
  ink: 0x1f2a37, paper: 0xf7f2e8, board: 0xe9e2d3,
  water: 0x7fb3d5, glass: 0xd9e8f2, wood: 0xb08b5a, metal: 0xb9c2cc,
  soil: 0x7a5a3a, leaf: 0x5aa86a, seed: 0xc99a5b, warm: 0xe0743a,
  cold: 0x6aa6d8, accent: 0x2f7d6d, accent2: 0xd9a441, red: 0xc94f4f,
  gray: 0x9aa3ad, black: 0x2b2b2b, white: 0xfafafa, orange: 0xf29b3a,
};

export const ease = {
  io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  lin: (t) => t,
};
export const clamp01 = (t) => Math.max(0, Math.min(1, t));
export const lerp = (a, b, t) => a + (b - a) * t;
// 구간 [a,b] 안에서의 진행률(0~1)
export const seg = (t, a, b) => clamp01((t - a) / (b - a));

export function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: opts.roughness ?? 0.75, metalness: opts.metalness ?? 0.05,
    transparent: !!opts.opacity && opts.opacity < 1, opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide, emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
  });
}
export function glassMat(color = PALETTE.glass, opacity = 0.35) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.15, metalness: 0, transparent: true, opacity,
    transmission: 0, side: THREE.DoubleSide, depthWrite: false,
  });
}

export function box(w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.castShadow = true; m.receiveShadow = true; return m;
}
export function cylinder(rTop, rBot, h, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, opts.seg ?? 32, 1, !!opts.open), mat(color, opts));
  m.castShadow = true; m.receiveShadow = true; return m;
}
export function sphere(r, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, opts.seg ?? 24, opts.seg ?? 16), mat(color, opts));
  m.castShadow = true; return m;
}
export function plane(w, h, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(color, { side: THREE.DoubleSide, ...opts }));
  m.receiveShadow = true; return m;
}
// 유리 비커/시험관: 옆면 + 바닥, 속에 물기둥을 따로 넣는다.
export function vessel(r, h, opts = {}) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r * (opts.taper ?? 1), h, 40, 1, true), glassMat(opts.color, opts.opacity ?? 0.3));
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(r * (opts.taper ?? 1), 40), glassMat(opts.color, 0.45));
  bottom.rotation.x = -Math.PI / 2; bottom.position.y = -h / 2;
  g.add(wall, bottom);
  return g;
}
// 물기둥: fill(0~1)로 높이를 바꾼다. 원점을 바닥에 둔다.
export function liquid(r, hMax, color = PALETTE.water, opacity = 0.75) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 36), mat(color, { opacity, roughness: 0.3 }));
  m.geometry.translate(0, 0.5, 0);
  m.scale.y = hMax * 0.001; m.userData.hMax = hMax;
  m.setFill = (f) => { m.scale.y = Math.max(0.001, hMax * clamp01(f)); return m; };
  return m;
}

// 라벨 스프라이트 — 캔버스에 한글을 그려 붙인다. size는 월드 단위 높이.
const _labelCache = new Map();
export function label(text, opts = {}) {
  const size = opts.size ?? 0.42, color = opts.color ?? '#1f2a37', bg = opts.bg ?? 'rgba(255,255,255,0.86)';
  const key = `${text}|${size}|${color}|${bg}`;
  let tex = _labelCache.get(key);
  if (!tex) {
    const c = document.createElement('canvas'); const ctx = c.getContext('2d');
    const fs = 44; ctx.font = `600 ${fs}px "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
    const w = Math.ceil(ctx.measureText(text).width) + 44, h = fs + 30;
    c.width = w * 2; c.height = h * 2; ctx.scale(2, 2);
    ctx.font = `600 ${fs}px "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
    ctx.fillStyle = bg; roundRect(ctx, 0, 0, w, h, 14); ctx.fill();
    ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.fillText(text, 22, h / 2 + 2);
    tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    tex.userData = { w, h }; _labelCache.set(key, tex);
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  const { w, h } = tex.userData; s.scale.set(size * w / h, size, 1); s.renderOrder = 10;
  s.userData.isLabel = true; return s;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// 화살표: from→to. 굵기는 월드 단위.
export function arrow(from, to, color = PALETTE.accent, radius = 0.04) {
  const f = new THREE.Vector3(...from), t = new THREE.Vector3(...to);
  const dir = t.clone().sub(f), len = dir.length(); dir.normalize();
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, Math.max(0.01, len - radius * 5), 12), mat(color, { emissive: color, emissiveIntensity: 0.25 }));
  shaft.position.y = (len - radius * 5) / 2;
  const head = new THREE.Mesh(new THREE.ConeGeometry(radius * 2.6, radius * 5, 16), mat(color, { emissive: color, emissiveIntensity: 0.25 }));
  head.position.y = len - radius * 2.5;
  g.add(shaft, head);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  g.position.copy(f);
  g.setLength = (L) => { shaft.scale.y = Math.max(0.01, (L - radius * 5)) / Math.max(0.01, len - radius * 5); shaft.position.y = (L - radius * 5) / 2; head.position.y = L - radius * 2.5; };
  return g;
}

// 막대 차트: values는 0~1 정규화, labels는 한글. grow(p)로 자라게 한다.
export function barChart(items, opts = {}) {
  const g = new THREE.Group(); const w = opts.barWidth ?? 0.5, gap = opts.gap ?? 0.35, hMax = opts.height ?? 2.2;
  const total = items.length * w + (items.length - 1) * gap; const bars = [];
  items.forEach((it, i) => {
    const x = -total / 2 + w / 2 + i * (w + gap);
    const b = box(w, 1, w, it.color ?? PALETTE.accent); b.geometry.translate(0, 0.5, 0);
    b.position.set(x, 0, 0); b.scale.y = 0.001; b.userData.h = hMax * it.value; bars.push(b); g.add(b);
    const l = label(it.label, { size: opts.labelSize ?? 0.3 }); l.position.set(x, -0.35, 0.3); g.add(l);
    if (it.text) { const v = label(it.text, { size: 0.26, bg: 'rgba(255,255,255,0.7)' }); v.position.set(x, hMax * it.value + 0.35, 0.3); v.userData.top = true; v.visible = false; b.userData.valueLabel = v; g.add(v); }
  });
  const base = box(total + gap, 0.06, w + 0.4, PALETTE.gray); base.position.y = -0.03; g.add(base);
  g.grow = (p, which) => bars.forEach((b, i) => { if (which != null && i !== which) return; b.scale.y = Math.max(0.001, b.userData.h * ease.out(p)); if (b.userData.valueLabel) b.userData.valueLabel.visible = p > 0.95; });
  g.bars = bars; return g;
}

// 입자 무리: n개의 작은 구를 한 그룹에. jitter(t)로 흔들고, spread로 퍼뜨린다.
export function particles(n, r, color, region = { x: 1, y: 1, z: 1 }, opts = {}) {
  const g = new THREE.Group(); const geo = new THREE.SphereGeometry(r, 10, 8); const m = mat(color, { emissive: color, emissiveIntensity: opts.glow ?? 0.15 });
  for (let i = 0; i < n; i++) {
    const s = new THREE.Mesh(geo, m);
    s.userData.base = new THREE.Vector3((Math.random() - 0.5) * region.x, (Math.random() - 0.5) * region.y, (Math.random() - 0.5) * region.z);
    s.userData.phase = Math.random() * Math.PI * 2; s.position.copy(s.userData.base); g.add(s);
  }
  g.jitter = (time, amp = 0.05, speed = 3) => g.children.forEach((s) => { const b = s.userData.base, p = s.userData.phase; s.position.set(b.x + Math.sin(time * speed + p) * amp, b.y + Math.cos(time * speed * 0.9 + p) * amp, b.z + Math.sin(time * speed * 1.1 + p * 2) * amp); });
  return g;
}

// 온도색: 0(차가움)→1(뜨거움)
export function heatColor(t) { return new THREE.Color(PALETTE.cold).lerp(new THREE.Color(PALETTE.warm), clamp01(t)); }

// 좌표 헬퍼
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export { THREE };

// 라벨 글자 바꾸기 — 스프라이트를 새로 만들지 않고 캐시된 텍스처만 교체한다(매 프레임 호출해도 안전).
export function relabel(sprite, text, opts = {}) {
  if (!sprite || !sprite.userData || !sprite.userData.isLabel) return sprite;
  if (sprite.userData.text === text) return sprite;
  const fresh = label(text, opts); sprite.material.map = fresh.material.map; sprite.scale.copy(fresh.scale); sprite.userData.text = text;
  fresh.material.dispose(); return sprite;
}
