// 3부 주제 6 — 돌아라! 팽이: 관성 모멘트, 무게중심
import { PALETTE as P, box, cylinder, sphere, label, arrow, barChart, THREE, mat } from './_kit.js';

export default {
  view: { theta: 0.4, phi: 1.2, dist: 9, target: [0, 1.0, 0] },
  build(kit, world) {
    const mkTop = (x, discR, discY, color) => { const g = new THREE.Group(); const axis = cylinder(0.05, 0.02, 2.0, P.wood); axis.position.y = 1.0; const disc = cylinder(discR, discR, 0.12, color); disc.position.y = discY; const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 12), mat(P.ink)); tip.rotation.x = Math.PI; tip.position.y = 0.06; g.add(axis, disc, tip); g.position.x = x; g.userData = { disc, discR, spin: 0, tilt: 0 }; return g; };
    world.add('small', mkTop(-2.2, 0.5, 0.7, P.accent2)); world.add('big', mkTop(0, 0.9, 0.7, P.accent)); world.add('high', mkTop(2.2, 0.9, 1.5, P.red));
    const lbQ = label('원판의 크기·질량·위치를 바꾸면 도는 시간이 어떻게 달라질까?', { size: 0.3 }); lbQ.position.set(0, 3.4, 0); world.add('lbQ', lbQ);
    const lbI = label('관성 모멘트: 질량이 축에서 멀수록 회전을 바꾸기 어렵다 (I ∝ m·r²)', { size: 0.28 }); lbI.position.set(0, 3.4, 0); world.add('lbI', lbI);
    const rArrow = arrow([0, 0.85, 0], [0.9, 0.85, 0], P.ink, 0.03); world.add('rArrow', rArrow);
    const lbR = label('r', { size: 0.26 }); lbR.position.set(0.45, 1.1, 0); world.add('lbR', lbR);
    const lbBig = label('큰 원판·무거운 원판: 같은 힘으로 돌리면 더 오래 돈다', { size: 0.3 }); lbBig.position.set(0, 3.4, 0); world.add('lbBig', lbBig);
    const lbHigh = label('원판이 높으면 무게중심이 높아 조금만 기울어도 쓰러진다', { size: 0.3 }); lbHigh.position.set(0, 3.4, 0); world.add('lbHigh', lbHigh);
    const lbLow = label('원판이 낮으면 무게중심이 낮아 안정 — 그러나 너무 낮으면 바닥에 닿는다', { size: 0.28 }); lbLow.position.set(0, 3.4, 0); world.add('lbLow', lbLow);
    const lArrow = arrow([0, 0.2, 1.2], [0, 2.4, 1.2], P.accent, 0.04); world.add('L', lArrow);
    const lbL = label('각운동량: 빨리 돌수록 축이 넘어지지 않으려 한다(세차운동)', { size: 0.28 }); lbL.position.set(0, 3.8, 0); world.add('lbL', lbL);
    const chart = barChart([{ label: '작은 원판', value: 0.45, text: '짧다', color: P.accent2 }, { label: '큰 원판', value: 1.0, text: '길다', color: P.accent }, { label: '원판 높음', value: 0.6, text: '금방 쓰러짐', color: P.red }], { height: 2.2 }); chart.position.set(0, 0.2, 0.6); world.add('chart', chart);
    const lbC = label('초시계로 도는 시간 3회 평균 (정성 예시 — 실제 값은 직접 잰다)', { size: 0.26 }); lbC.position.set(0, 3.2, 0.6); world.add('lbC', lbC);
    const lbSwing = label('그네·널뛰기: 같은 운동을 반복하며 힘을 더하면 운동량이 쌓인다(진동)', { size: 0.27 }); lbSwing.position.set(0, 3.4, 0); world.add('lbSwing', lbSwing);
    const state = { spin: false, speeds: { small: 0, big: 0, high: 0 }, tilt: { small: 0, big: 0, high: 0 } };
    return { state, update(dt, t) { for (const k of ['small', 'big', 'high']) { const g = world.get(k); if (!g) continue; g.rotation.y += state.speeds[k] * dt; g.rotation.z = state.tilt[k]; g.rotation.x = state.tilt[k] * Math.sin(t * 3) * 0.6; } } };
  },
  beats: [
    { text: '우드락 원판에 성냥개비 축을 꽂아 팽이를 만듭니다. 원판의 크기, 질량, 축에서의 위치를 바꾸면 도는 시간이 어떻게 달라질까요? 초시계로 잽니다.', show: ['small', 'big', 'high', 'lbQ'], dur: 5 },
    { text: '같은 힘으로 돌립니다. 작은 원판은 금방 멈추고, 큰 원판은 오래 돕니다.', hide: ['lbQ'], dur: 6, anim(p, o, t) { o.small.rotation.y += (1 - p) * 0.35; o.big.rotation.y += (1 - p * 0.5) * 0.35; } },
    { text: '이유는 관성 모멘트입니다. 회전하는 물체는 질량이 축에서 멀리 있을수록 회전 상태를 바꾸기 어렵습니다. 반지름이 두 배면 관성 모멘트는 네 배입니다.', show: ['lbI', 'rArrow', 'lbR'], dur: 6, anim(p, o) { o.big.rotation.y += 0.25; o.rArrow.setLength(0.9 * p); } },
    { text: '그래서 크고 무거운 원판일수록, 그리고 질량이 바깥쪽에 몰려 있을수록 한 번 돌기 시작하면 오래 돕니다. 자전거 바퀴가 무거운 테를 가진 것도 같은 이유입니다.', show: ['lbBig'], hide: ['lbI'], dur: 6, anim(p, o) { o.big.rotation.y += 0.25; } },
    { text: '원판의 위치를 바꿔 봅니다. 원판이 축 위쪽에 있으면 무게중심이 높아, 조금만 기울어도 쓰러집니다.', show: ['lbHigh'], hide: ['lbBig', 'rArrow', 'lbR'], dur: 6, anim(p, o) { o.high.rotation.y += 0.3 * (1 - p); o.high.rotation.z = 0.5 * p; } },
    { text: '원판이 낮으면 무게중심이 낮아 안정적으로 돕니다. 다만 너무 낮으면 원판이 바닥에 닿습니다. 알맞은 위치를 찾는 것이 탐구입니다.', show: ['lbLow'], hide: ['lbHigh'], dur: 6, anim(p, o) { o.high.rotation.z = 0.5 * (1 - p); o.high.userData.disc.position.y = 1.5 - 0.9 * p; o.high.rotation.y += 0.3 * p; } },
    { text: '빨리 도는 팽이는 기울어도 바로 넘어지지 않고 축이 천천히 원을 그립니다. 각운동량이 회전축을 지키려 하기 때문입니다. 세차운동이라고 합니다.', show: ['L', 'lbL'], dur: 6, anim(p, o, t) { o.big.rotation.y += 0.3; o.big.rotation.z = 0.15; o.big.rotation.x = 0.15 * Math.sin(t * 2.5); } },
    { text: '결과를 표로 정리합니다. 원판이 클수록 오래 돌고, 원판이 높으면 금방 쓰러집니다. 그네를 탈 때 발을 구르면 점점 높이 올라가는 것도 힘이 운동에 쌓이는 같은 원리입니다.', show: ['chart', 'lbC', 'lbSwing'], hide: ['small', 'big', 'high', 'L', 'lbL', 'lbLow'], dur: 7, anim(p, o) { o.chart.grow(p); } },
  ],
};
