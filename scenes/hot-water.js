// 3부 주제 2 — 뜨거운 물의 비밀: 컵 재질(열전도), 소금물·설탕물(어는점 내림), 음펨바 효과
import { PALETTE as P, box, cylinder, vessel, liquid, label, arrow, particles, heatColor, THREE, mat } from './_kit.js';

const CUPS = [['종이컵', 0xf1e6cf, 0.35], ['플라스틱', 0xa9d5e8, 0.45], ['스테인리스', 0xb9c2cc, 1.0], ['사기컵', 0xf6f6f6, 0.6]]; // [이름, 색, 열전도(상대)]

export default {
  view: { theta: 0.3, phi: 1.1, dist: 10, target: [0, 1.0, 0] },
  build(kit, world) {
    const freezer = box(7.4, 0.1, 2.4, 0xdfe9f2); freezer.position.y = 0.05; world.add('freezer', freezer);
    const cold = particles(60, 0.03, 0x9fd0f0, { x: 7, y: 2, z: 2 }, { glow: 0.5 }); cold.position.y = 1.3; world.add('cold', cold);
    CUPS.forEach(([name, color, k], i) => {
      const g = new THREE.Group(); const x = -2.7 + i * 1.8;
      const cup = cylinder(0.45, 0.38, 1.1, color, { open: true, side: THREE.DoubleSide, opacity: name === '플라스틱' ? 0.6 : 1 }); cup.position.y = 0.55; const bottom = cylinder(0.38, 0.38, 0.04, color); bottom.position.y = 0.02;
      const water = liquid(0.4, 0.85, P.water, 0.8); water.position.y = 0.05; water.setFill(1); const ice = liquid(0.4, 0.85, 0xe8f4ff, 0.95); ice.position.y = 0.05; ice.setFill(0.001);
      const tag = label(name, { size: 0.26 }); tag.position.set(0, -0.15, 0.7);
      const arrows = new THREE.Group(); for (let a = 0; a < 4; a++) { const ang = a * Math.PI / 2; arrows.add(arrow([Math.cos(ang) * 0.9, 0.6, Math.sin(ang) * 0.9], [Math.cos(ang) * 0.5, 0.6, Math.sin(ang) * 0.5], P.cold, 0.03 * k + 0.01)); } arrows.visible = false;
      g.add(cup, bottom, water, ice, tag, arrows); g.position.x = x; g.userData = { water, ice, k, arrows }; world.add('cup' + i, g);
    });
    const lbA = label('어느 컵에서 가장 빨리 얼까? — 컵의 재질만 다르게', { size: 0.3 }); lbA.position.set(0, 2.8, 0); world.add('lbA', lbA);
    const lbA2 = label('열전도율이 큰 스테인리스가 열을 가장 빨리 빼앗긴다', { size: 0.3 }); lbA2.position.set(0, 2.8, 0); world.add('lbA2', lbA2);
    // 물 종류 3개
    const KINDS = [['맹물', P.water, 0], ['소금물 10g', 0x9fc8de, 1], ['설탕물 10g', 0xbcd3e0, 0.6]];
    KINDS.forEach(([name, color, dep], i) => { const g = new THREE.Group(); const x = -1.8 + i * 1.8; const cup = vessel(0.42, 1.1, { opacity: 0.35 }); cup.position.y = 0.55; const water = liquid(0.4, 0.85, color, 0.8); water.position.y = 0.05; water.setFill(1); const ice = liquid(0.4, 0.85, 0xe8f4ff, 0.95); ice.position.y = 0.05; ice.setFill(0.001); const tag = label(name, { size: 0.26 }); tag.position.set(0, -0.15, 0.7); g.add(cup, water, ice, tag); g.position.set(x, 0, 0); g.userData = { ice, dep }; world.add('kind' + i, g); });
    const lbB = label('무엇이 먼저 얼까? 녹아 있는 입자가 어는 것을 방해한다(어는점 내림)', { size: 0.28 }); lbB.position.set(0, 2.8, 0); world.add('lbB', lbB);
    const lbB2 = label('맹물 0℃ → 설탕물 → 소금물 순으로 언다 (같은 10g이면 소금 입자 수가 더 많다)', { size: 0.26 }); lbB2.position.set(0, 3.2, 0); world.add('lbB2', lbB2);
    // 뜨거운 물 vs 찬물
    const HOT = new THREE.Group(), COLD = new THREE.Group();
    [[HOT, '뜨거운 물 70℃', 1], [COLD, '찬물 25℃', 0.1]].forEach(([g, name, h], i) => { const cup = vessel(0.42, 1.1, { opacity: 0.35 }); cup.position.y = 0.55; const water = liquid(0.4, 0.85, heatColor(h).getHex(), 0.8); water.position.y = 0.05; water.setFill(1); const ice = liquid(0.4, 0.85, 0xe8f4ff, 0.95); ice.position.y = 0.05; ice.setFill(0.001); const tag = label(name, { size: 0.26 }); tag.position.set(0, -0.15, 0.7); g.add(cup, water, ice, tag); g.position.set(-1.2 + i * 2.4, 0, 0); g.userData = { water, ice }; });
    world.add('hot', HOT); world.add('coldcup', COLD);
    const vapor = particles(50, 0.035, 0xffffff, { x: 0.7, y: 1.2, z: 0.7 }, { glow: 0.4 }); vapor.position.set(-1.2, 1.7, 0); world.add('vapor', vapor);
    const lbC = label('뜨거운 물이 먼저 어는 경우가 있다 — 음펨바 효과', { size: 0.3 }); lbC.position.set(0, 2.8, 0); world.add('lbC', lbC);
    const lbC2 = label('증발로 질량이 줄고, 대류가 활발하고, 녹은 기체가 빠져나간다 — 원리는 아직 논쟁 중', { size: 0.26 }); lbC2.position.set(0, 3.2, 0); world.add('lbC2', lbC2);
    const lbD = label('"항상" 뜨거운 물이 먼저 어는 것은 아니다 → 조건을 바꿔 여러 번 재야 한다', { size: 0.26 }); lbD.position.set(0, 2.8, 0); world.add('lbD', lbD);
    return { update(dt, t) { cold.jitter(t, 0.05, 1.5); vapor.jitter(t, 0.06, 3); } };
  },
  beats: [
    { text: '같은 24도 물 50밀리리터를 종이컵, 플라스틱컵, 스테인리스컵, 사기컵에 담아 냉동실에 넣습니다. 어느 컵의 물이 가장 빨리 얼까요?', show: ['freezer', 'cold', 'lbA', 'cup0', 'cup1', 'cup2', 'cup3'], dur: 5 },
    { text: '얼려면 물의 열이 컵 벽을 지나 밖으로 빠져나가야 합니다. 열을 잘 전달하는 재질일수록 빨리 식습니다. 스테인리스가 가장 빨리, 종이컵과 플라스틱이 가장 늦게 얼었습니다.', show: ['lbA2'], hide: ['lbA'], dur: 7, anim(p, o) { for (let i = 0; i < 4; i++) { const u = o['cup' + i].userData; u.arrows.visible = true; u.ice.setFill(Math.max(0.001, Math.min(1, p * 1.6 * u.k))); } } },
    { text: '이번엔 컵은 같게, 물의 종류를 다르게. 맹물, 소금 10그램을 녹인 물, 설탕 10그램을 녹인 물.', show: ['lbB', 'kind0', 'kind1', 'kind2'], hide: ['lbA2', 'cup0', 'cup1', 'cup2', 'cup3'], dur: 5 },
    { text: '녹아 있는 입자가 물 분자가 가지런히 얼음이 되는 것을 방해합니다. 그래서 맹물이 먼저 얼고, 설탕물, 소금물 순입니다. 같은 10그램이라도 소금은 입자 수가 훨씬 많아 더 늦게 업니다.', show: ['lbB2'], dur: 7, anim(p, o) { for (let i = 0; i < 3; i++) { const u = o['kind' + i].userData; u.ice.setFill(Math.max(0.001, Math.min(1, (p - u.dep * 0.5) * 2))); } } },
    { text: '마지막 질문. 뜨거운 물과 찬물 중 어느 것이 먼저 얼까요? 상식으로는 찬물입니다. 그런데 어떤 조건에서는 뜨거운 물이 먼저 어는 일이 있습니다. 음펨바 효과라고 합니다.', show: ['lbC', 'hot', 'coldcup', 'vapor'], hide: ['lbB', 'lbB2', 'kind0', 'kind1', 'kind2'], dur: 7 },
    { text: '왜 그럴까요? 뜨거운 물은 증발이 활발해 질량이 줄고, 대류로 열을 빨리 내보내고, 녹아 있던 기체가 빠져나갑니다. 여러 가설이 있지만 정확한 원리는 아직 밝혀지지 않았습니다.', show: ['lbC2'], dur: 7, anim(p, o) { o.hot.userData.ice.setFill(Math.max(0.001, p)); o.coldcup.userData.ice.setFill(Math.max(0.001, p * 0.7)); o.vapor.children.forEach((d, i) => { d.visible = i < 50 * (1 - p); }); } },
    { text: '그래서 이 실험은 반론이 많이 나옵니다. "한 번 잰 것으로 결론 낼 수 있나요?" 조건을 바꿔 여러 번 재고 평균을 내야 믿을 수 있는 결과가 됩니다.', show: ['lbD'], hide: ['lbC', 'lbC2'], dur: 6 },
  ],
};
