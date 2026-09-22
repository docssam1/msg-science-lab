// 3부 주제 5 — 숨을 쉬는 옹기와 음식물의 저장성
import { PALETTE as P, box, cylinder, label, particles, THREE, mat, lerp } from './_kit.js';

export default {
  view: { theta: 0.3, phi: 1.15, dist: 10, target: [0, 1.3, 0] },
  build(kit, world) {
    const mkJar = (x, color, name, glossy) => { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.LatheGeometry([[0.45, 0], [0.75, 0.3], [0.85, 0.9], [0.7, 1.5], [0.55, 1.7], [0.6, 1.8]].map(([r, y]) => new THREE.Vector2(r, y)), 40), mat(color, { roughness: glossy ? 0.2 : 0.9, metalness: glossy ? 0.5 : 0 })); body.castShadow = true; const lid = cylinder(0.65, 0.6, 0.12, color, { roughness: glossy ? 0.2 : 0.9, metalness: glossy ? 0.5 : 0 }); lid.position.y = 1.86; const tag = label(name, { size: 0.28 }); tag.position.set(0, -0.2, 1.0); g.add(body, lid, tag); g.position.x = x; g.userData = { body }; return g; };
    world.add('onggi', mkJar(0, 0x6e4a2f, '옹기', false));
    world.add('plastic', mkJar(-2.6, 0xd0e4f0, '플라스틱', true));
    world.add('steel', mkJar(2.6, 0xb9c2cc, '스테인리스', true));
    // 옹기 벽 확대: 미세 기공
    const wall = new THREE.Group(); const slab = box(0.5, 2.0, 2.4, 0x6e4a2f); wall.add(slab);
    for (let i = 0; i < 24; i++) { const pore = cylinder(0.03, 0.03, 0.56, 0x2a1a10); pore.rotation.z = Math.PI / 2; pore.position.set(0, -0.85 + (i % 8) * 0.25, -0.9 + Math.floor(i / 8) * 0.9); wall.add(pore); }
    wall.position.set(0, 1.3, 0); world.add('wall', wall);
    const air = particles(50, 0.04, 0x9fd0f0, { x: 1.6, y: 1.8, z: 2.2 }, { glow: 0.5 }); air.position.set(1.4, 1.3, 0); air.children.forEach((d) => { d.userData.start = d.userData.base.clone(); d.userData.into = new THREE.Vector3(-1.0 - Math.random() * 1.2, d.userData.base.y, d.userData.base.z); }); world.add('air', air);
    const lbWall = label('옹기 벽: 흙을 구울 때 생긴 미세한 구멍 → 공기가 드나든다', { size: 0.3 }); lbWall.position.set(0, 3.4, 0); world.add('lbWall', lbWall);
    const lbFerm = label('산소가 조금씩 들어오면 발효 미생물이 알맞게 자란다 (플라스틱·스텐은 막힘)', { size: 0.27 }); lbFerm.position.set(0, 3.4, 0); world.add('lbFerm', lbFerm);
    // 온도 조건 3개(김치 산성도)
    const mkTemp = (x, name, rate, colorHex) => { const g = new THREE.Group(); const jar = cylinder(0.5, 0.45, 1.0, 0x6e4a2f, { roughness: 0.9 }); jar.position.y = 0.5; const litmus = box(0.16, 0.7, 0.02, 0x3a6fd8); litmus.position.set(0, 0.55, 0.52); const tag = label(name, { size: 0.26 }); tag.position.set(0, -0.2, 0.9); g.add(jar, litmus, tag); g.position.x = x; g.userData = { litmus, rate, base: colorHex }; return g; };
    world.add('t1', mkTemp(-2.4, '상온 25~30℃', 1.0)); world.add('t2', mkTemp(0, '냉장 5~15℃', 0.3)); world.add('t3', mkTemp(2.4, '냉동 0℃ 이하', 0.05));
    const lbTemp = label('푸른 리트머스가 붉어지는 속도 = 김치가 시어지는 속도', { size: 0.3 }); lbTemp.position.set(0, 3.0, 0); world.add('lbTemp', lbTemp);
    const lbTemp2 = label('상온은 2일 만에, 냉장은 6일 뒤 조금, 냉동은 살얼음만 — 발효가 멈춘다', { size: 0.27 }); lbTemp2.position.set(0, 3.4, 0); world.add('lbTemp2', lbTemp2);
    const lbSun = label('햇빛: 된장은 양달에서 잘 익고, 김치는 응달에서 천천히 익어야 오래 간다', { size: 0.27 }); lbSun.position.set(0, 3.0, 0); world.add('lbSun', lbSun);
    const lbSoy = label('간장 pH: 옹기는 조금씩 낮아지고(산소 공급), 다른 그릇은 조금씩 높아졌다', { size: 0.27 }); lbSoy.position.set(0, 3.4, 0); world.add('lbSoy', lbSoy);
    const lbVeg = label('생야채는 세 그릇 모두 시들었다 — 옹기가 조금 느릴 뿐, 발효 식품만큼은 아니다', { size: 0.26 }); lbVeg.position.set(0, 3.0, 0); world.add('lbVeg', lbVeg);
    return { update(dt, t) { air.jitter(t, 0.03, 3); } };
  },
  beats: [
    { text: '요즘은 좋은 그릇이 많은데, 왜 김치와 된장은 여전히 옹기에 담을까요? 옹기, 플라스틱, 스테인리스 그릇에 같은 김치를 담아 비교합니다.', show: ['onggi', 'plastic', 'steel'], dur: 5 },
    { text: '옹기 벽을 확대해 봅니다. 흙을 구울 때 생긴 미세한 구멍이 무수히 있어 공기가 아주 조금씩 드나듭니다. 그래서 "숨 쉬는 그릇"이라고 합니다.', show: ['wall', 'air', 'lbWall'], hide: ['onggi', 'plastic', 'steel'], dur: 6, anim(p, o) { o.wall.scale.setScalar(0.3 + 0.7 * p); } },
    { text: '산소가 조금씩 들어오면 발효를 돕는 미생물이 알맞게 자랍니다. 플라스틱과 스테인리스는 공기를 완전히 막아 발효가 다르게 진행됩니다.', show: ['lbFerm'], hide: ['lbWall'], dur: 6, anim(p, o) { o.air.children.forEach((d, i) => { if (i % 2) d.userData.base.copy(d.userData.start).lerp(d.userData.into, p); }); } },
    { text: '간장을 담아 산도를 재 보니, 옹기의 pH는 시간이 갈수록 조금씩 낮아지고 다른 그릇은 조금씩 높아졌습니다. 산소가 공급되는 옹기 쪽이 알맞게 숙성되는 것입니다.', show: ['lbSoy'], hide: ['lbFerm'], dur: 6 },
    { text: '이번엔 온도. 같은 김치를 상온, 냉장, 냉동에 두고 이틀마다 푸른 리트머스로 산성화를 봅니다. 리트머스가 붉어지는 속도가 김치가 시어지는 속도입니다.', show: ['t1', 't2', 't3', 'lbTemp'], hide: ['wall', 'air', 'lbSoy'], dur: 6 },
    { text: '상온은 2일 만에 붉어지고 흰 거품이 낍니다. 냉장은 6일이 지나야 조금 변합니다. 냉동은 살얼음만 생기고 발효가 멈춥니다. 저장에 가장 좋은 온도는 5에서 15도입니다.', show: ['lbTemp2'], dur: 7, anim(p, o) { ['t1', 't2', 't3'].forEach((k) => { const u = o[k].userData; u.litmus.material.color.set(0x3a6fd8).lerp(new THREE.Color(0xd7302e), Math.min(1, p * u.rate * 1.2)); }); } },
    { text: '햇빛도 변인입니다. 된장 같은 발효 식품은 양달에서 잘 익지만, 김치는 직사광선보다 응달에서 천천히 익어야 오래 갑니다. 식품마다 알맞은 조건이 다릅니다.', show: ['lbSun'], hide: ['lbTemp', 'lbTemp2'], dur: 6 },
    { text: '한 가지 반론. 생야채는 세 그릇 모두 시들었고 옹기가 조금 느렸을 뿐입니다. 옹기의 장점은 발효 식품에서 나타나지, 모든 음식에 다 좋은 것은 아닙니다. 결론은 실험 결과 그대로 씁니다.', show: ['lbVeg'], hide: ['lbSun'], dur: 7 },
  ],
};
