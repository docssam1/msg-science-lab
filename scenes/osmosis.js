// 3부 주제 4 — 소금이 많을까? 설탕이 많을까?: 삼투, 입자 수
import { PALETTE as P, box, cylinder, sphere, vessel, liquid, label, arrow, particles, THREE, mat } from './_kit.js';

export default {
  view: { theta: 0.3, phi: 1.15, dist: 9.5, target: [0, 1.2, 0] },
  build(kit, world) {
    const mkCup = (x, name, grainColor) => { const g = new THREE.Group(); const cup = vessel(0.8, 1.3, { opacity: 0.3 }); cup.position.y = 0.65; const radish = cylinder(0.55, 0.55, 0.5, 0xf6f6f0); radish.position.y = 0.3; const skin = cylinder(0.56, 0.56, 0.12, 0xdfe6da); skin.position.y = 0.49; const water = liquid(0.78, 1.0, P.water, 0.7); water.position.y = 0.02; water.setFill(0.001); const grains = particles(40, 0.04, grainColor, { x: 0.9, y: 0.1, z: 0.9 }, { glow: 0.2 }); grains.position.y = 0.62; grains.visible = false; const tag = label(name, { size: 0.28 }); tag.position.set(0, -0.2, 1.1); g.add(cup, radish, skin, water, grains, tag); g.position.x = x; g.userData = { water, grains, radish }; return g; };
    world.add('salt', mkCup(-1.6, '무 + 소금 5g', 0xffffff)); world.add('sugar', mkCup(1.6, '무 + 설탕 5g', 0xfff2c2));
    const lbQ = label('같은 무게의 소금과 설탕 — 어느 쪽이 물을 더 많이 뽑아낼까?', { size: 0.3 }); lbQ.position.set(0, 3.2, 0); world.add('lbQ', lbQ);
    const lbWater = label('1시간 뒤: 소금 쪽 물이 더 많다', { size: 0.3 }); lbWater.position.set(0, 3.2, 0); world.add('lbWater', lbWater);
    // 세포막 확대
    const cell = new THREE.Group(); const mem = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 2.4), mat(P.leaf, { side: THREE.DoubleSide })); cell.add(mem);
    for (let i = 0; i < 6; i++) { const hole = box(0.1, 0.12, 0.2, P.paper); hole.position.y = -1.0 + i * 0.4; cell.add(hole); }
    const inside = particles(24, 0.06, P.water, { x: 1.6, y: 2.0, z: 0.4 }); inside.position.x = -1.1; cell.add(inside);
    const outsideNa = particles(14, 0.07, 0xd9a441, { x: 1.4, y: 2.0, z: 0.4 }, { glow: 0.3 }); outsideNa.position.x = 1.1; const outsideCl = particles(14, 0.07, 0x5aa0d6, { x: 1.4, y: 2.0, z: 0.4 }, { glow: 0.3 }); outsideCl.position.x = 1.1; cell.add(outsideNa, outsideCl);
    const bigSugar = particles(6, 0.16, 0xc9a35b, { x: 1.2, y: 1.8, z: 0.3 }); bigSugar.position.x = 1.1; bigSugar.visible = false; cell.add(bigSugar);
    cell.position.set(0, 1.5, 0); cell.userData = { inside, outsideNa, outsideCl, bigSugar }; world.add('cell', cell);
    const lbIn = label('무 세포 안(물 많음)', { size: 0.26 }); lbIn.position.set(-1.2, 2.75, 0); world.add('lbIn', lbIn);
    const lbOut = label('바깥(입자 많음)', { size: 0.26 }); lbOut.position.set(1.2, 2.75, 0); world.add('lbOut', lbOut);
    const lbMem = label('세포막: 물은 통과, 큰 입자는 못 통과(반투막)', { size: 0.28 }); lbMem.position.set(0, 3.5, 0); world.add('lbMem', lbMem);
    const osmo = arrow([-0.6, 0.4, 0.3], [0.6, 0.4, 0.3], P.accent, 0.05); world.add('osmo', osmo);
    const lbOsmo = label('삼투: 물이 입자가 적은 쪽 → 많은 쪽으로 이동', { size: 0.3 }); lbOsmo.position.set(0, 3.5, 0); world.add('lbOsmo', lbOsmo);
    const lbNa = label('소금(NaCl)은 물에서 Na⁺와 Cl⁻ 두 입자로 갈라진다', { size: 0.28 }); lbNa.position.set(0, 3.5, 0); world.add('lbNa', lbNa);
    const lbSug = label('설탕은 크고 무거운 분자 하나로 남는다 → 같은 5g이면 입자 수가 훨씬 적다', { size: 0.26 }); lbSug.position.set(0, 3.5, 0); world.add('lbSug', lbSug);
    const lbAns = label('입자 수가 많을수록 물을 세게 끌어당긴다 → 소금이 물을 더 많이 뽑는다', { size: 0.28 }); lbAns.position.set(0, 3.2, 0); world.add('lbAns', lbAns);
    const lbKimchi = label('김치 절이기: 너무 짜면 세포가 다 죽고, 너무 싱거우면 물이 안 빠진다 → 알맞은 양이 있다', { size: 0.25 }); lbKimchi.position.set(0, 3.6, 0); world.add('lbKimchi', lbKimchi);
    return { update(dt, t) { inside.jitter(t, 0.03, 3); outsideNa.jitter(t, 0.04, 4); outsideCl.jitter(t, 0.04, 4); bigSugar.jitter(t, 0.02, 2); } };
  },
  beats: [
    { text: '무를 같은 크기로 썰어 두 컵에 넣고, 한쪽엔 소금 5그램, 다른 쪽엔 설탕 5그램을 뿌립니다. 어느 쪽에서 물이 더 많이 나올까요?', show: ['salt', 'sugar', 'lbQ'], dur: 5, anim(p, o) { o.salt.userData.grains.visible = p > 0.3; o.sugar.userData.grains.visible = p > 0.3; } },
    { text: '한 시간 뒤 주사기로 물을 재어 보면, 소금을 뿌린 쪽에서 물이 더 많이 나왔습니다. 무도 더 흐물흐물해졌습니다.', show: ['lbWater'], hide: ['lbQ'], dur: 5, anim(p, o) { o.salt.userData.water.setFill(0.6 * p); o.sugar.userData.water.setFill(0.35 * p); o.salt.userData.radish.scale.y = 1 - 0.25 * p; o.sugar.userData.radish.scale.y = 1 - 0.12 * p; } },
    { text: '무 세포를 확대합니다. 세포막은 물은 통과시키지만 큰 입자는 통과시키지 않는 반투막입니다. 안쪽은 물이 많고, 바깥은 소금 입자가 많습니다.', show: ['cell', 'lbIn', 'lbOut', 'lbMem'], hide: ['salt', 'sugar', 'lbWater'], dur: 6, anim(p, o) { o.cell.scale.setScalar(0.3 + 0.7 * p); } },
    { text: '물은 입자가 적은 쪽에서 많은 쪽으로 막을 건너갑니다. 이것이 삼투입니다. 그래서 무 속의 물이 밖으로 빠져나옵니다.', show: ['osmo', 'lbOsmo'], hide: ['lbMem'], dur: 5, anim(p, o) { o.cell.userData.inside.children.forEach((d, i) => { if (i < 12) d.userData.base.x = Math.min(2.2, d.userData.base.x + 0.02 * p * 60 * (i % 3 + 1) / 3); }); } },
    { text: '그런데 왜 소금이 더 셀까요? 소금은 물에 녹으면 나트륨 이온과 염화 이온, 두 입자로 갈라집니다. 5그램이면 입자 수가 아주 많습니다.', show: ['lbNa'], hide: ['lbOsmo'], dur: 6 },
    { text: '설탕은 크고 무거운 분자 하나로 남습니다. 소금 알갱이 하나 무게로 설탕 분자는 여섯 개도 안 됩니다. 같은 5그램이면 입자 수가 훨씬 적습니다.', show: ['lbSug'], hide: ['lbNa'], dur: 6, anim(p, o) { const u = o.cell.userData; u.outsideNa.visible = p < 0.5; u.outsideCl.visible = p < 0.5; u.bigSugar.visible = p >= 0.5; } },
    { text: '물을 끌어당기는 힘은 입자의 종류가 아니라 입자 수에 달렸습니다. 그래서 같은 무게라면 소금이 설탕보다 물을 훨씬 많이 뽑아냅니다.', show: ['lbAns'], hide: ['lbSug', 'lbIn', 'lbOut'], dur: 6, anim(p, o) { const u = o.cell.userData; u.outsideNa.visible = true; u.outsideCl.visible = true; u.bigSugar.visible = false; } },
    { text: '김치 절이기에 알맞은 소금 양이 있을까요? 너무 짜면 세포가 다 죽어 흐물거리고, 너무 싱거우면 물이 안 빠져 금방 상합니다. 양을 바꿔 가며 실험해 볼 주제입니다.', show: ['lbKimchi'], dur: 6 },
  ],
};
