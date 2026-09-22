// 3부 주제 3 — 수분을 조절하는 숯: 다공질 구조, 흡습·방습
import { PALETTE as P, box, cylinder, label, particles, barChart, THREE, mat } from './_kit.js';

export default {
  view: { theta: 0.35, phi: 1.15, dist: 9.5, target: [0, 1.3, 0] },
  build(kit, world) {
    // 숯 덩어리
    const lump = box(1.6, 1.0, 0.9, 0x1e1e1e, { roughness: 0.95 }); lump.position.set(-2.4, 0.5, 0); world.add('lump', lump);
    const lbLump = label('숯: 나무를 산소 없이 태워 탄소만 남긴 것', { size: 0.3 }); lbLump.position.set(0, 3.6, 0); world.add('lbLump', lbLump);
    // 확대 단면: 관다발 흔적 = 무수한 구멍
    const cut = new THREE.Group(); const slab = box(3.0, 2.0, 0.3, 0x2a2a2a); cut.add(slab);
    for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) { const pore = cylinder(0.11, 0.11, 0.34, 0x0a0a0a); pore.rotation.x = Math.PI / 2; pore.position.set(-1.3 + i * 0.32, -0.8 + j * 0.32, 0); cut.add(pore); }
    cut.position.set(1.0, 1.4, 0); world.add('cut', cut);
    const lbPore = label('확대하면 구멍투성이 — 1g의 표면적이 운동장만큼 넓다', { size: 0.3 }); lbPore.position.set(0, 3.6, 0); world.add('lbPore', lbPore);
    // 수증기 입자
    const vapor = particles(70, 0.04, 0x7fb3d5, { x: 3.4, y: 2.2, z: 1.6 }, { glow: 0.5 }); vapor.position.set(1.0, 1.4, 1.2); vapor.children.forEach((d) => { d.userData.start = d.userData.base.clone(); d.userData.into = new THREE.Vector3((Math.random() - 0.5) * 2.8, (Math.random() - 0.5) * 1.8, -1.2 - Math.random() * 0.4); }); world.add('vapor', vapor);
    const lbWet = label('습할 때: 공기 중 물 분자가 구멍 벽에 달라붙는다(흡습)', { size: 0.3 }); lbWet.position.set(0, 3.6, 0); world.add('lbWet', lbWet);
    const lbDry = label('건조할 때: 붙어 있던 물 분자가 다시 나온다(방습)', { size: 0.3 }); lbDry.position.set(0, 3.6, 0); world.add('lbDry', lbDry);
    // 숯 종류 비교(정성) — 통 안에서 무게 변화
    const chart = barChart([{ label: '비장탄', value: 0.55, color: 0x333 }, { label: '참나무 숯', value: 0.8, color: 0x444 }, { label: '대나무 숯', value: 1.0, color: 0x555 }, { label: '잡숯', value: 0.65, color: 0x666 }], { height: 2.2 }); chart.position.set(0, 0.2, 0.4); world.add('chart', chart);
    const lbChart = label('밀폐 통에서 무게 변화로 흡습량 비교 — 구멍이 많고 고를수록 크다', { size: 0.28 }); lbChart.position.set(0, 3.3, 0.4); world.add('lbChart', lbChart);
    const lbNote = label('(막대는 원리를 보여 주는 예시 — 실제 값은 직접 재어 표로 적는다)', { size: 0.22, bg: 'rgba(255,240,200,0.9)' }); lbNote.position.set(0, 2.9, 0.4); world.add('lbNote', lbNote);
    const lbUse = label('해인사 장경판전: 바닥에 숯·소금·횟가루를 묻어 습도를 조절 → 800년 보존', { size: 0.27 }); lbUse.position.set(0, 3.6, 0); world.add('lbUse', lbUse);
    const lbUse2 = label('우물 바닥의 숯, 냉장고 탈취, 논에 뿌리는 숯 — 같은 원리', { size: 0.28 }); lbUse2.position.set(0, 3.1, 0); world.add('lbUse2', lbUse2);
    return { update(dt, t) { vapor.jitter(t, 0.02, 4); } };
  },
  beats: [
    { text: '숯은 나무를 공기 없이 태워 탄소만 남긴 것입니다. 겉보기엔 그냥 검은 덩어리인데, 옛사람들은 우물 바닥에도, 집 지을 때도, 장 담글 때도 숯을 썼습니다. 왜일까요?', show: ['lump', 'lbLump'], dur: 6 },
    { text: '현미경으로 단면을 보면 답이 보입니다. 나무가 물을 나르던 관의 흔적이 그대로 남아 구멍투성이입니다. 숯 1그램의 구멍 표면적을 다 펴면 운동장만큼 넓습니다.', show: ['cut', 'lbPore'], hide: ['lbLump'], dur: 6, anim(p, o) { o.cut.scale.setScalar(0.2 + 0.8 * p); } },
    { text: '공기가 습하면 물 분자가 이 구멍의 넓은 벽에 달라붙습니다. 흡습입니다. 그래서 습한 날 숯은 무거워집니다.', show: ['vapor', 'lbWet'], hide: ['lbPore'], dur: 6, anim(p, o) { o.vapor.children.forEach((d) => { d.userData.base.copy(d.userData.start).lerp(d.userData.into, p); }); } },
    { text: '공기가 건조해지면 붙어 있던 물 분자가 다시 공기 중으로 나옵니다. 방습입니다. 숯은 이렇게 습도를 스스로 조절합니다. 숨을 쉬는 셈입니다.', show: ['lbDry'], hide: ['lbWet'], dur: 6, anim(p, o) { o.vapor.children.forEach((d) => { d.userData.base.copy(d.userData.into).lerp(d.userData.start, p); }); } },
    { text: '숯의 종류에 따라 차이가 있을까요? 대나무 숯, 참나무 숯, 비장탄, 잡숯을 밀폐 통에 넣고 무게 변화를 잽니다. 구멍이 많고 고를수록 더 많이 빨아들입니다.', show: ['chart', 'lbChart', 'lbNote'], hide: ['cut', 'vapor', 'lbDry', 'lump'], dur: 7, anim(p, o) { o.chart.grow(p); } },
    { text: '해인사 장경판전은 팔만대장경을 800년 넘게 보존했습니다. 바닥에 숯과 소금, 횟가루를 묻어 습도를 조절한 덕입니다. 우물 바닥의 숯, 냉장고 속 숯도 같은 원리입니다.', show: ['lbUse', 'lbUse2'], hide: ['lbChart', 'lbNote'], dur: 7 },
  ],
};
