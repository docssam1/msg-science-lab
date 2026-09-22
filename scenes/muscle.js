// 1부 활동 6 — 조기와 돼지고기의 근육 비교: 관찰 → 의문 → 가설, 미오글로빈
import { PALETTE as P, box, cylinder, sphere, label, arrow, THREE, mat } from './_kit.js';

export default {
  view: { theta: 0.25, phi: 1.15, dist: 10, target: [0, 1.3, 0] },
  build(kit, world) {
    // 물속 물고기
    const water = box(3.4, 2.2, 2.2, P.water, { opacity: 0.3 }); water.position.set(-2.4, 1.1, 0); world.add('water', water);
    const fish = new THREE.Group(); const body = sphere(0.5, 0xd8d0c0); body.scale.set(1.8, 0.8, 0.7); const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 3), mat(0xd8d0c0)); tail.rotation.z = Math.PI / 2; tail.position.x = -1.05; fish.add(body, tail); fish.position.set(-2.4, 1.2, 0); world.add('fish', fish);
    const buoy = arrow([-2.4, 1.2, 0.9], [-2.4, 2.2, 0.9], P.accent, 0.04); world.add('buoy', buoy);
    const grav1 = arrow([-2.4, 1.2, 0.9], [-2.4, 0.2, 0.9], P.red, 0.04); world.add('grav1', grav1);
    const lbFish = label('물속: 부력이 몸을 받쳐 준다 → 버티는 근육이 필요 없다', { size: 0.28 }); lbFish.position.set(-2.4, 3.0, 0); world.add('lbFish', lbFish);
    // 땅 위 돼지
    const ground = box(3.4, 0.1, 2.2, P.soil); ground.position.set(2.4, 0.05, 0); world.add('ground', ground);
    const pig = new THREE.Group(); const pb = box(1.6, 0.8, 0.8, 0xe8a9a0); pb.position.y = 0.9; pig.add(pb); [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].forEach(([x, z]) => { const leg = cylinder(0.1, 0.1, 0.5, 0xe8a9a0); leg.position.set(x, 0.35, z); pig.add(leg); }); const head = box(0.5, 0.5, 0.5, 0xe8a9a0); head.position.set(1.0, 1.0, 0); pig.add(head); pig.position.set(2.4, 0, 0); world.add('pig', pig);
    const grav2 = arrow([2.4, 0.9, 0.9], [2.4, -0.1, 0.9], P.red, 0.04); world.add('grav2', grav2);
    const push = arrow([2.4, 0.1, 0.9], [2.4, 0.9, 0.9], P.accent2, 0.04); world.add('push', push);
    const lbPig = label('땅 위: 중력을 이겨 몸을 받쳐야 한다 → 강한 근육', { size: 0.28 }); lbPig.position.set(2.4, 3.0, 0); world.add('lbPig', lbPig);
    // 근섬유 확대: 흰살(짧고 가는 순발력 섬유) vs 붉은살(길고 굵은 지구력 섬유 + 미오글로빈)
    const fibW = new THREE.Group(); for (let i = 0; i < 7; i++) { const f = cylinder(0.07, 0.07, 0.9, 0xf1e9dc); f.rotation.z = Math.PI / 2; f.position.set((i % 4) * 1.0 - 1.5, Math.floor(i / 4) * 0.35, 0); fibW.add(f); } fibW.position.set(-2.4, 1.3, 0); world.add('fibW', fibW);
    const fibR = new THREE.Group(); for (let i = 0; i < 3; i++) { const f = cylinder(0.12, 0.12, 3.0, 0xb84a4a); f.rotation.z = Math.PI / 2; f.position.set(0, i * 0.4 - 0.4, 0); fibR.add(f); for (let k = 0; k < 8; k++) { const d = sphere(0.06, 0x7a1c1c, { emissive: 0x7a1c1c, emissiveIntensity: 0.5 }); d.position.set(-1.3 + k * 0.37, i * 0.4 - 0.4, 0.13); fibR.add(d); } } fibR.position.set(2.4, 1.3, 0); world.add('fibR', fibR);
    const lbW = label('흰살: 짧고 가는 섬유, 잠깐 쓰는 순발력 → 부드럽고 잘 부스러진다', { size: 0.26 }); lbW.position.set(-2.4, 2.6, 0); world.add('lbW', lbW);
    const lbR = label('붉은살: 길고 굵은 섬유 + 미오글로빈(산소 저장, 붉은 철 화합물)', { size: 0.26 }); lbR.position.set(2.4, 2.6, 0); world.add('lbR', lbR);
    const lbMyo = label('미오글로빈 많은 순서: 쇠고기 > 돼지고기 > 닭고기 > 물고기', { size: 0.3 }); lbMyo.position.set(0, 3.6, 0); world.add('lbMyo', lbMyo);
    const lbQ = label('의문: 왜 조기는 부드럽고 하얗고, 돼지고기는 질기고 붉을까?', { size: 0.3 }); lbQ.position.set(0, 3.6, 0); world.add('lbQ', lbQ);
    const lbH = label('가설: 사는 환경(부력 vs 중력)과 쓰는 근육(순발력 vs 지구력)이 다르다', { size: 0.28 }); lbH.position.set(0, 3.6, 0); world.add('lbH', lbH);
    return { update(dt, t) { fish.position.y = 1.2 + Math.sin(t * 1.5) * 0.08; fish.rotation.z = Math.sin(t * 2) * 0.05; } };
  },
  beats: [
    { text: '조기와 돼지고기를 익혀 관찰합니다. 조기는 누르면 부스러지고 살이 하얗습니다. 돼지고기는 탄력이 있고 질기며 붉은 핏물이 나옵니다.', show: ['water', 'fish', 'ground', 'pig'], dur: 5 },
    { text: '관찰한 사실에 "왜?"를 붙입니다. 왜 조기는 부드럽고 하얗고, 돼지고기는 질기고 붉을까? 사소한 것을 지나치지 않는 것이 탐구의 시작입니다.', show: ['lbQ'], dur: 5 },
    { text: '비슷한 경험을 떠올립니다. 생선은 빨리 익고, 고기는 이에 잘 낀다. 할머니 드릴 고기는 잘게 다진다. 이런 경험에서 가설의 실마리를 찾습니다.', dur: 5 },
    { text: '가설 하나. 물고기는 부력이 몸을 받쳐 주니 중력을 버틸 강한 근육이 필요 없습니다.', show: ['buoy', 'grav1', 'lbFish'], hide: ['lbQ'], dur: 5, anim(p, o) { o.buoy.setLength(1.0 * p); } },
    { text: '반면 육상동물은 무거운 몸을 중력에 맞서 받치고 뛰어야 하므로 근육이 강하고 질기게 발달했습니다.', show: ['grav2', 'push', 'lbPig', 'lbH'], dur: 5, anim(p, o) { o.push.setLength(0.8 * p); } },
    { text: '근육 속을 확대해 봅니다. 물고기의 근섬유는 짧고 가늘어 순간적으로 수축했다가 끊어지기 쉽습니다. 도망칠 때 쓰는 순발력 근육이라 회로 먹어도 부드럽습니다.', show: ['fibW', 'lbW'], hide: ['water', 'fish', 'buoy', 'grav1', 'lbFish', 'lbH'], dur: 6, anim(p, o) { o.fibW.scale.setScalar(0.3 + 0.7 * p); } },
    { text: '육상동물의 근섬유는 길고 느리게 수축하는 지구력 근육입니다. 오래 움직이려면 산소를 미리 저장해야 해서, 붉은 철 화합물인 미오글로빈이 많습니다. 그래서 붉은색입니다.', show: ['fibR', 'lbR'], hide: ['ground', 'pig', 'grav2', 'push', 'lbPig'], dur: 6, anim(p, o) { o.fibR.scale.setScalar(0.3 + 0.7 * p); } },
    { text: '미오글로빈은 쇠고기, 돼지고기, 닭고기, 물고기 순으로 적어집니다. 운동할 때 필요한 산소의 양이 동물마다 다르기 때문입니다. 관찰에서 시작해 원리까지 닿았습니다.', show: ['lbMyo'], dur: 5 },
  ],
};
