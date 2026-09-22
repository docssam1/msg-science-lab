// 4-2 Ⅰ 식물의 생활 — 부레옥잠 연못: 강이나 연못의 식물은 사는 곳에 알맞은 생김새를 가졌다.
// 부레옥잠은 잎자루의 공기주머니 덕분에 물에 떠서 산다(물속에서 누르면 공기 방울이 나온다).
import { label, THREE, mat, lerp } from './_kit.js';
import { SURF, pond, bottomAt, hyacinth, waterLily, hydrilla, cattail, bubbles } from './_pond.js';

const HX = 1.3, LX = 0.35, GX = 2.1, CX = -1.55;

function section() {                                   // 잎자루 단면: 스펀지처럼 구멍(공기주머니)이 많다
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 40), mat(0xa6d884, { roughness: 0.6 })); disc.rotation.x = Math.PI / 2; g.add(disc);
  const hm = mat(0x3d6b2a, { roughness: 0.9 });
  for (let i = 0; i < 38; i++) { const r = Math.sqrt((i + 0.5) / 38) * 0.36, a = i * 2.39996; const h = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.065, 12), hm); h.rotation.x = Math.PI / 2; h.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.002); g.add(h); }
  return g;
}

export default {
  view: { theta: 0.18, phi: 1.3, dist: 5.6, target: [0.35, 0.85, 0] },
  build(kit, world) {
    const p = pond(); world.add('pond', p);
    const hy = hyacinth(); hy.position.set(HX, SURF, 0); world.add('hy', hy);
    const li = waterLily(); li.position.set(LX, bottomAt(LX), -0.2); li.userData.place(SURF - bottomAt(LX)); world.add('lily', li);
    const gr = hydrilla(0.6); gr.position.set(GX, bottomAt(GX), 0.1); world.add('grass', gr);
    const ct = cattail(1.5); ct.position.set(CX, bottomAt(CX), -0.3); world.add('cat', ct);
    const bb = bubbles(); bb.position.set(HX, 0, 0); world.add('bub', bb);
    const sec = section(); sec.position.set(HX - 0.2, SURF + 1.05, 0.3); world.add('sec', sec);
    const L = (id, text, x, y, z = 0.3, size = 0.24) => { const l = label(text, { size }); l.position.set(x, y, z); world.add(id, l); };
    L('lbQ', '연못 식물들은 어떻게 살까?', 0.2, 2.35, 0, 0.3);
    L('lbHy', '부레옥잠: 물에 떠서 살아요', HX, SURF + 0.85);
    L('lbBulb', '잎자루가 공처럼 볼록해요', HX, SURF + 0.85);
    L('lbPush', '물속으로 누르면 공기 방울!', HX, SURF + 0.85);
    L('lbSec', '잘라 보면 공기주머니가 가득', HX - 0.2, SURF + 1.62);
    L('lbLi', '수련: 잎이 물 위에 떠요', LX, SURF + 0.45);
    L('lbGr', '검정말: 물속에 잠겨 살아요', GX - 0.6, SURF - 0.3, 0.5, 0.22);
    L('lbCt', '부들: 물가에 살아요', CX + 0.55, SURF + 1.2);
    let t = 0; const U = hy.userData; U.push = 0;
    return { update(dt) { t += dt; p.userData.ripple(t); gr.userData.sway(t); if (!U.push) { hy.position.y = SURF + Math.sin(t * 1.4) * 0.015; hy.rotation.y = Math.sin(t * 0.3) * 0.2; } } };
  },
  beats: [
    { text: '연못에 여러 식물이 살아요. 사는 곳이 저마다 달라요.', show: ['pond', 'hy', 'lily', 'grass', 'cat', 'lbQ'], dur: 4,
      reset(o) { o.hy.userData.push = 0; o.hy.position.y = SURF; o.bub.userData.play(0, 0); } },
    { text: '부레옥잠은 뿌리가 바닥에 닿지 않고 물에 떠서 살아요.', show: ['lbHy'], hide: ['lbQ'], dur: 4 },
    { text: '잎자루를 보면 공처럼 볼록하게 부풀어 있어요.', show: ['lbBulb'], hide: ['lbHy'], dur: 4,
      anim(p, o) { o.hy.traverse((c) => { if (c.userData.bulb) c.scale.set(1 + 0.25 * Math.sin(p * Math.PI), 1.35 + 0.3 * Math.sin(p * Math.PI), 1 + 0.25 * Math.sin(p * Math.PI)); }); } },
    { text: '물속으로 눌러 보면 잎자루에서 공기 방울이 나와요. 손을 떼면 다시 떠올라요.', show: ['lbPush', 'bub'], hide: ['lbBulb'], dur: 6,
      anim(p, o) { const d = p < 0.5 ? p / 0.5 : 1 - (p - 0.5) / 0.5; o.hy.userData.push = p < 0.98 ? 1 : 0; o.hy.position.y = SURF - 0.45 * d; o.bub.userData.play(Math.min(1, p * 1.3), SURF - 0.45); } },
    { text: '잎자루를 잘라 보면 스펀지처럼 작은 공기주머니가 가득해요. 그래서 물에 뜰 수 있어요.', show: ['sec', 'lbSec'], hide: ['lbPush', 'bub'], dur: 6,
      anim(p, o) { const s = Math.max(0.01, p); o.sec.scale.set(s, s, s); o.sec.rotation.y = lerp(1.2, 0.2, p); } },
    { text: '수련은 잎이 물 위에 뜨고, 검정말은 물속에 잠겨 살고, 부들은 물가에 살아요. 사는 곳에 알맞게 적응했어요.', show: ['lbLi', 'lbGr', 'lbCt'], hide: ['sec', 'lbSec'], dur: 7 },
  ],
};
