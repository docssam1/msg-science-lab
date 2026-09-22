// 4-1 Ⅰ 자석의 이용 — 고리 자석 탑: 같은 극은 밀어 내고(뜸), 다른 극은 끌어당긴다(붙음)
import { PALETTE as P, cylinder, label, arrow, THREE, mat } from './_kit.js';

const R_OUT = 0.9, R_IN = 0.28, T = 0.28;
const COLORS = [0x3b6fd1, 0xf0b429, 0x3fae5b, 0xe0743a];
const N = 0xe24b4a, S = 0x3a6bc6;
const START = ['N', 'S', 'S', 'N'], TALL = ['N', 'S', 'N', 'S'];
const Y0 = [0.3, 0.98, 1.26, 2.09], Y1 = [0.3, 0.98, 1.76, 2.64];

function ring(color) {
  const sh = new THREE.Shape(); sh.absarc(0, 0, R_OUT, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, R_IN, 0, Math.PI * 2, true); sh.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 40 });
  geo.rotateX(-Math.PI / 2);
  const g = new THREE.Group(); const m = new THREE.Mesh(geo, mat(color, { roughness: 0.5 })); m.castShadow = true; g.add(m);
  // 윗면·아랫면 극 표시(얇은 고리) — 처음엔 숨겨 두었다가 설명 비트에서 보인다
  const face = (y, c) => { const f = new THREE.Mesh(new THREE.RingGeometry(R_IN + 0.04, R_OUT - 0.04, 40), mat(c, { side: THREE.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.y = y; f.visible = false; g.add(f); return f; };
  g.userData = { top: face(T + 0.003, N), bot: face(-0.003, S), up: 'N' };
  return g;
}
function setUp(r, up) { r.userData.up = up; r.userData.top.material.color.setHex(up === 'N' ? N : S); r.userData.bot.material.color.setHex(up === 'N' ? S : N); }

export default {
  view: { theta: 0.5, phi: 1.2, dist: 7.5, target: [0, 1.4, 0] },
  build(kit, world) {
    const base = cylinder(1.4, 1.5, 0.3, P.gray); base.position.y = 0.15; world.add('base', base);
    const rod = cylinder(0.2, 0.2, 4.2, P.wood); rod.position.y = 2.4; world.add('rod', rod);
    const rings = COLORS.map((c, i) => { const r = ring(c); r.position.y = 5 + i; world.add('r' + i, r); return r; });
    // 배치 규칙: 이웃한 두 고리의 윗면 극(up)이 서로 다르면 마주 보는 면이 같은 극 → 밀어 냄(뜸), 같으면 붙음.
    // 처음(아래→위) N·S·S·N → 1·2 뜸, 2·3 붙음, 3·4 뜸
    START.forEach((u, i) => setUp(rings[i], u));
    const lbQ = label('왜 어떤 자석은 떠 있을까?', { size: 0.34 }); lbQ.position.set(0, 4.9, 0); world.add('lbQ', lbQ);
    const lbSame = label('마주 보는 면이 같은 극 → 밀어 내요', { size: 0.3 }); lbSame.position.set(0, 4.9, 0); world.add('lbSame', lbSame);
    const lbDiff = label('마주 보는 면이 다른 극 → 끌어당겨요', { size: 0.3 }); lbDiff.position.set(0, 4.9, 0); world.add('lbDiff', lbDiff);
    const lbTop = label('모두 같은 극끼리 → 가장 높은 탑!', { size: 0.34 }); lbTop.position.set(0, 4.9, 0); world.add('lbTop', lbTop);
    const push = arrow([1.3, 0.62, 0], [1.3, 1.0, 0], P.red, 0.04); world.add('push', push);
    const pull = arrow([1.3, 1.62, 0], [1.3, 1.3, 0], P.accent, 0.04); world.add('pull', pull);
    return {};
  },
  beats: [
    { text: '받침에 막대를 세우고 고리 자석 네 개를 준비해요.', show: ['base', 'rod', 'lbQ'], dur: 3,
      reset(o) { START.forEach((u, i) => { const r = o['r' + i]; setUp(r, u); r.position.y = 5 + i; r.userData.top.visible = r.userData.bot.visible = false; }); } },
    { text: '고리 자석을 하나씩 끼워요. 어떤 자석은 떠 있고, 어떤 자석은 붙어 있어요.', show: ['r0', 'r1', 'r2', 'r3'], dur: 5,
      anim(p, o) { Y0.forEach((y, i) => { const q = Math.min(1, Math.max(0, p * 1.6 - i * 0.2)); o['r' + i].position.y = 5 + i + (y - 5 - i) * q; }); } },
    { text: '떠 있는 곳은 마주 보는 면이 같은 극이에요. 서로 밀어 내요.', show: ['lbSame', 'push'], hide: ['lbQ'], dur: 5,
      anim(p, o) { for (let i = 0; i < 4; i++) o['r' + i].userData.top.visible = o['r' + i].userData.bot.visible = p > 0.1; } },
    { text: '붙어 있는 곳은 마주 보는 면이 다른 극이에요. 서로 끌어당겨요.', show: ['lbDiff', 'pull'], hide: ['lbSame', 'push'], dur: 5 },
    { text: '자석을 뒤집어서 모두 같은 극끼리 마주 보게 하면 가장 높은 탑이 돼요.', show: ['lbTop'], hide: ['lbDiff', 'pull'], dur: 6,
      anim(p, o) { (p > 0.35 ? TALL : START).forEach((u, i) => { if (o['r' + i].userData.up !== u) setUp(o['r' + i], u); });
        Y0.forEach((y, i) => { o['r' + i].position.y = y + (Y1[i] - y) * p; }); } },
  ],
};
