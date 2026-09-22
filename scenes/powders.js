// 1부 활동 5 — 생활 속의 여러 가지 물질: 관찰과 분류(조작 관찰)
import { PALETTE as P, box, cylinder, sphere, label, particles, THREE, mat } from './_kit.js';

const ITEMS = [
  { id: 'flour', name: '밀가루', color: 0xf3ecd8, starch: true, acid: false, sugar: false },
  { id: 'starch', name: '옥수수 전분', color: 0xf8f4e6, starch: true, acid: false, sugar: false },
  { id: 'soda', name: '베이킹 소다', color: 0xfbfbfb, starch: false, acid: false, sugar: false, base: true },
  { id: 'powder', name: '베이킹 파우더', color: 0xf6f6f2, starch: true, acid: true, sugar: false },
  { id: 'sugar', name: '설탕', color: 0xffffff, starch: false, acid: false, sugar: true },
  { id: 'sweet', name: '인공 감미료', color: 0xfdfdfd, starch: false, acid: false, sugar: false },
];

export default {
  view: { theta: 0.2, phi: 1.05, dist: 9.5, target: [0, 0.8, 0] },
  build(kit, world) {
    const foil = box(7.2, 0.04, 2.6, 0xd9dde3, { metalness: 0.6, roughness: 0.35 }); foil.position.y = 0.02; world.add('foil', foil);
    const piles = {}; ITEMS.forEach((it, i) => {
      const g = new THREE.Group(); const x = -3 + i * 1.2;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.5, 28), mat(it.color, { roughness: 1 })); cone.position.y = 0.29; cone.castShadow = true; g.add(cone);
      const tag = label(it.name, { size: 0.24 }); tag.position.set(0, -0.05, 0.75); g.add(tag);
      g.position.set(x, 0, 0); g.userData = { cone, it, baseColor: new THREE.Color(it.color) }; piles[it.id] = g; world.add('pile-' + it.id, g);
    });
    // 돋보기
    const lens = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 12, 40), mat(P.ink)); const glass = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), kit.glassMat(0xcfe6ff, 0.35)); const handle = cylinder(0.05, 0.05, 0.9, P.wood); handle.position.set(0.55, -0.55, 0); handle.rotation.z = Math.PI / 4;
    lens.add(ring, glass, handle); lens.rotation.x = -Math.PI / 2; lens.position.set(-3, 1.2, 0); world.add('lens', lens);
    // 스포이트
    const dropper = new THREE.Group(); const tube = cylinder(0.05, 0.02, 0.9, 0xcfd8dc, { opacity: 0.8 }); const bulb = sphere(0.14, P.red); bulb.position.y = 0.5; dropper.add(tube, bulb); dropper.position.set(-3, 1.6, 0); world.add('dropper', dropper);
    const drop = sphere(0.06, P.water); world.add('drop', drop);
    // 거품 입자(베이킹 소다·파우더)
    const fizz = particles(50, 0.035, 0xffffff, { x: 0.7, y: 0.6, z: 0.7 }, { glow: 0.4 }); fizz.position.set(-0.6, 0.6, 0); world.add('fizz', fizz);
    // 리트머스 종이
    const litmus = box(0.2, 0.02, 0.8, 0xd7302e); litmus.position.set(-0.6, 0.62, 0.3); world.add('litmus', litmus);
    // 이스트 봉지(설탕 옆)
    const bag = box(0.6, 0.8, 0.18, 0xffffff, { opacity: 0.75 }); bag.position.set(1.8, 0.45, 0.9); world.add('bag', bag);
    const bag2 = box(0.6, 0.8, 0.18, 0xffffff, { opacity: 0.75 }); bag2.position.set(3.0, 0.45, 0.9); world.add('bag2', bag2);
    // 라벨
    const mk = (id, t, y = 3.0, size = 0.32) => { const l = label(t, { size }); l.position.set(0, y, -0.4); world.add(id, l); };
    mk('lbObs', '오감으로 관찰: 돋보기로 알갱이, 손끝 촉감, 살짝 냄새');
    mk('lbWater', '물 한두 방울: 스며드는가, 굴러 떨어지는가, 거품이 나는가');
    mk('lbIodine', '요오드 희석액: 전분이 있으면 보라·검정으로 변한다');
    mk('lbVinegar', '식초: 베이킹 파우더·소다는 이산화탄소 거품이 인다');
    mk('lbLitmus', '리트머스: 붉은 종이가 푸르게 → 염기성');
    mk('lbYeast', '이스트+따뜻한 물: 당이 있으면 이산화탄소가 봉지를 부풀린다');
    mk('lbClass', '분류: 전분 있음 / 염기성 / 당 있음 — 기준을 세워 나눈다');
    // 분류 받침
    const bases = new THREE.Group(); const groups = { starch: [0, 1, 3], base: [2, 3], sugar: [4] };
    const mkBase = (idx, color, y) => idx.forEach((i) => { const b = box(1.0, 0.06, 0.9, color, { opacity: 0.8 }); b.position.set(-3 + i * 1.2, y, 0); bases.add(b); });
    mkBase(groups.starch, 0x8e6bc6, 0.05); mkBase(groups.base, 0x5aa0d6, 0.12); mkBase(groups.sugar, 0xd9a441, 0.05);
    ['전분', '염기성', '당'].forEach((t, i) => { const l = label(t, { size: 0.26, color: '#fff', bg: ['#8e6bc6', '#5aa0d6', '#d9a441'][i] }); l.position.set(-2.2 + i * 2.2, 1.9, 0.6); bases.add(l); });
    world.add('bases', bases);
    return { piles, update(dt, t) { fizz.jitter(t, 0.06, 5); }, ITEMS };
  },
  beats: [
    { text: '집에 있는 하얀 가루들입니다. 밀가루, 옥수수 전분, 베이킹 소다, 베이킹 파우더, 설탕, 인공 감미료. 겉으로는 다 비슷해 보입니다.', show: ['foil', ...ITEMS.map((i) => 'pile-' + i.id)], dur: 5 },
    { text: '먼저 오감으로 관찰합니다. 돋보기로 알갱이 모양을 보고, 손가락으로 문질러 촉감을 느끼고, 살짝 냄새를 맡습니다. 정성적 관찰입니다.', show: ['lens', 'lbObs'], dur: 5, anim(p, o) { o.lens.position.x = -3 + 6 * p; } },
    { text: '조작 관찰. 물 한두 방울을 떨어뜨려 봅니다. 스며드는지, 방울이 되어 구르는지, 기포가 나는지. 대상에 조작을 가해야 숨은 성질이 드러납니다.', show: ['dropper', 'drop', 'lbWater'], hide: ['lens', 'lbObs'], dur: 5, anim(p, o) { o.dropper.position.x = -3 + 6 * p; o.drop.position.set(o.dropper.position.x, 1.15 - 0.6 * ((p * 6) % 1), 0); } },
    { text: '요오드 희석액을 떨어뜨리면 전분이 든 가루는 보라색이나 검은색으로 변합니다. 밀가루, 옥수수 전분, 그리고 전분이 섞인 베이킹 파우더가 변했습니다.', show: ['lbIodine'], hide: ['lbWater', 'drop'], dur: 5, anim(p, o) { ITEMS.forEach((it) => { const g = o['pile-' + it.id]; g.userData.cone.material.color.copy(g.userData.baseColor).lerp(new THREE.Color(0x4a2a7a), it.starch ? p * 0.85 : 0); }); o.dropper.position.x = -3; } },
    { text: '식초를 떨어뜨리면 베이킹 소다와 베이킹 파우더에서 이산화탄소 거품이 일어납니다. 산과 염기가 만나는 반응입니다.', show: ['fizz', 'lbVinegar'], hide: ['lbIodine'], dur: 5, anim(p, o) { o.fizz.children.forEach((d, i) => { d.visible = i < 50 * p; }); o.fizz.position.x = -0.6; } },
    { text: '리트머스 종이로 산성인지 염기성인지 봅니다. 베이킹 소다 용액은 붉은 리트머스를 푸르게 만드는 염기성입니다.', show: ['litmus', 'lbLitmus'], hide: ['fizz', 'lbVinegar'], dur: 5, anim(p, o) { o.litmus.material.color.set(0xd7302e).lerp(new THREE.Color(0x3a6fd8), p); } },
    { text: '이스트와 따뜻한 물을 지퍼백에 넣고 15분. 당이 있으면 이스트가 이산화탄소를 내놓아 봉지가 부풉니다. 설탕은 부풀고, 인공 감미료는 거의 부풀지 않습니다.', show: ['bag', 'bag2', 'lbYeast'], hide: ['litmus', 'lbLitmus'], dur: 6, anim(p, o) { o.bag.scale.z = 1 + 3.2 * p; o.bag.scale.x = 1 + 0.4 * p; o.bag2.scale.z = 1 + 0.3 * p; } },
    { text: '이제 분류합니다. 자기 기준을 세우고 근거를 대는 것이 분류입니다. 전분이 있는 것, 염기성인 것, 당이 있는 것. 한 가루가 두 무리에 들 수도 있습니다.', show: ['bases', 'lbClass'], hide: ['bag', 'bag2', 'lbYeast', 'dropper'], dur: 6, anim(p, o) { o.bases.scale.set(1, 1, 0.1 + 0.9 * p); } },
  ],
};
