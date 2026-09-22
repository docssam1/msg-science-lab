// 3부 주제 8 — 지하철역에 부는 바람의 세기: 피스톤 효과, 풍속 측정
import { PALETTE as P, box, cylinder, label, arrow, particles, barChart, THREE, mat } from './_kit.js';

export default {
  view: { theta: 0.7, phi: 1.2, dist: 11, target: [0, 1.2, 0] },
  build(kit, world) {
    // 풍속계
    const anem = new THREE.Group(); const pole = cylinder(0.04, 0.04, 1.4, P.metal); pole.position.y = 0.7; const cups = new THREE.Group(); for (let i = 0; i < 3; i++) { const a = i * 2 * Math.PI / 3; const c = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI), mat(P.red)); c.position.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4); c.rotation.y = -a + Math.PI / 2; const arm = cylinder(0.02, 0.02, 0.4, P.metal); arm.rotation.z = Math.PI / 2; arm.position.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2); arm.rotation.y = -a; cups.add(c, arm); } cups.position.y = 1.45; anem.add(pole, cups); anem.position.set(0, 0, 2.6); anem.userData = { cups, speed: 0 }; world.add('anem', anem);
    const lbAnem = label('풍속계: 컵이 도는 속도로 바람의 세기(m/s)를 잰다', { size: 0.3 }); lbAnem.position.set(0, 3.4, 0); world.add('lbAnem', lbAnem);
    // 터널 + 승강장 + 전동차
    const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 10, 32, 1, true, 0, Math.PI), mat(0x6c7a89, { side: THREE.DoubleSide, opacity: 0.35 })); tunnel.rotation.z = Math.PI / 2; tunnel.rotation.y = Math.PI / 2; tunnel.position.set(0, 0.2, 0); world.add('tunnel', tunnel);
    const platform = box(4, 0.3, 1.6, 0xd8d3c7); platform.position.set(2, 0.15, 2.2); world.add('platform', platform);
    const train = new THREE.Group(); const car = box(3.2, 1.3, 1.2, 0x2f7d6d); car.position.y = 0.95; const nose = box(0.4, 1.0, 1.0, 0x1f5a4d); nose.position.set(1.8, 0.9, 0); train.add(car, nose); train.position.set(-6, 0, 0); world.add('train', train);
    const air = particles(80, 0.04, 0x9fd0f0, { x: 1.6, y: 1.4, z: 1.4 }, { glow: 0.5 }); air.position.set(-3.6, 1.0, 0); world.add('air', air);
    const push = arrow([-3.6, 1.0, 1.0], [-1.6, 1.0, 1.0], P.accent, 0.06); world.add('push', push);
    const lbPiston = label('피스톤 효과: 터널을 꽉 채운 전동차가 앞의 공기를 밀어낸다', { size: 0.3 }); lbPiston.position.set(0, 3.4, 0); world.add('lbPiston', lbPiston);
    const lbNarrow = label('터널이 좁고 열차가 빠를수록 바람이 세다 — 안전선 안쪽에 서는 이유', { size: 0.28 }); lbNarrow.position.set(0, 3.8, 0); world.add('lbNarrow', lbNarrow);
    const chart = barChart([{ label: '입으로 불기', value: 0.3, text: '약 2~3', color: P.gray }, { label: '선풍기 강', value: 0.45, text: '약 4', color: P.accent2 }, { label: '아파트 베란다', value: 0.5, text: '4.5', color: P.accent2 }, { label: '달리는 버스 창', value: 0.75, text: '6~7', color: P.accent }, { label: '전동차 진입', value: 1.0, text: '가장 셈', color: P.red }], { height: 2.4, barWidth: 0.55, gap: 0.4, labelSize: 0.24 }); chart.position.set(0, 0.2, 0); world.add('chart', chart);
    const lbChart = label('생활 속 풍속 (m/s, 5회 평균) — 버스는 8.5까지', { size: 0.3 }); lbChart.position.set(0, 3.4, 0); world.add('lbChart', lbChart);
    const lbSame = label('같은 곳도 잴 때마다 다르다 → 5회 평균, 잰 위치·시각을 함께 적는다', { size: 0.28 }); lbSame.position.set(0, 3.8, 0); world.add('lbSame', lbSame);
    const lbWhy = label('바람 = 공기의 움직임. 무엇이 공기를 밀었는지 찾으면 원인이 보인다', { size: 0.28 }); lbWhy.position.set(0, 3.4, 0); world.add('lbWhy', lbWhy);
    const state = { wind: 0 };
    return { state, update(dt, t) { anem.userData.cups.rotation.y += state.wind * dt * 2.2; air.jitter(t, 0.02, 3); } };
  },
  beats: [
    { text: '지하철을 기다리는데 열차가 들어올 때 아주 강한 바람이 붑니다. 얼마나 셀까요? 풍속계를 구해 재 보기로 합니다. 컵이 도는 속도로 바람의 세기를 잽니다.', show: ['anem', 'lbAnem'], dur: 5, anim(p, o) { o.anem.userData.cups.rotation.y += 0.08 * p; } },
    { text: '먼저 기준을 만듭니다. 입으로 불기, 선풍기 약·중·강. 같은 조건에서 5회씩 재어 평균을 냅니다. 측정은 반복해야 믿을 수 있습니다.', dur: 5, anim(p, o) { o.anem.userData.cups.rotation.y += 0.12; } },
    { text: '이제 지하철역. 터널은 좁고 전동차는 터널을 거의 꽉 채웁니다. 전동차가 달려오면 앞의 공기가 옆으로 빠져나가지 못하고 피스톤처럼 밀려 나옵니다.', show: ['tunnel', 'platform', 'train', 'air', 'push', 'lbPiston'], hide: ['lbAnem'], dur: 7, anim(p, o) { o.train.position.x = -6 + 5 * p; o.air.position.x = -3.6 + 4.6 * p; o.push.position.x = -3.6 + 4.6 * p; o.anem.userData.cups.rotation.y += 0.5 * p; } },
    { text: '이것이 피스톤 효과입니다. 터널이 좁을수록, 열차가 빠를수록 밀려 나오는 바람이 셉니다. 승강장에 안전선이 있는 이유입니다.', show: ['lbNarrow'], dur: 6, anim(p, o) { o.anem.userData.cups.rotation.y += 0.5; } },
    { text: '측정값을 모읍니다. 입으로 불면 2~3, 아파트 10층 베란다는 4.5, 달리는 버스 창가는 6~7, 빠르면 8.5미터까지. 전동차가 들어올 때가 가장 셌습니다.', show: ['chart', 'lbChart'], hide: ['tunnel', 'platform', 'train', 'air', 'push', 'lbPiston', 'lbNarrow', 'anem'], dur: 7, anim(p, o) { o.chart.grow(p); } },
    { text: '주의할 점. 같은 곳도 잴 때마다 값이 다릅니다. 5회 평균을 내고, 잰 위치와 시각, 날씨를 함께 적어야 다른 사람이 검증할 수 있습니다.', show: ['lbSame'], dur: 6 },
    { text: '바람은 공기의 움직임입니다. "무엇이 공기를 밀었나?"를 찾으면 원인이 보입니다. 아파트 동 사이의 바람, 건물 모양에 따른 바람도 같은 방법으로 탐구할 수 있습니다.', show: ['lbWhy'], hide: ['lbChart', 'lbSame'], dur: 6 },
  ],
};
