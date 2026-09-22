// 탐구 과정 한 바퀴 — 지도자료 1부 예시 "물줄기의 굵기·높이에 따라 튀는 물"
// 11가지 탐구 과정 요소(관찰→가설→변인통제→측정→실험→자료해석→예상→추론→의사소통)를 한 실험으로 밟는다.
import { PALETTE as P, box, cylinder, vessel, liquid, label, arrow, barChart, particles, seg, lerp, THREE, relabel } from './_kit.js';

const H15 = 1.5, H35 = 3.5;              // 15cm→1.5, 35cm→3.5 (1cm = 0.1)
const HOLE = { 1: 0.02, 3: 0.045, 5: 0.07, 7: 0.095 };   // 물줄기 반지름(모형)
const DATA15 = { 1: 100.6, 3: 58.7, 5: 25.6, 7: 10.0 }, DATA35 = { 1: 228.3, 3: 195.7, 5: 35.3, 7: 31.7 };
const MAX = 228.3;

export default {
  view: { theta: 0.6, phi: 1.2, dist: 11.5, target: [0.8, 1.9, 0] },
  build(kit, world) {
    // 스탠드
    const stand = new THREE.Group();
    const base = box(1.6, 0.12, 1.2, P.metal); base.position.set(-1.4, 0.06, 0);
    const pole = cylinder(0.05, 0.05, 4.6, P.metal); pole.position.set(-1.9, 2.3, 0);
    stand.add(base, pole); world.add('stand', stand);
    // 위 페트병(거꾸로) — 높이 조절
    const bottle = new THREE.Group();
    const body = vessel(0.32, 1.0, { taper: 0.6, opacity: 0.35 }); body.position.y = 0.5;
    const ink = liquid(0.3, 0.6, 0x5a4fcf, 0.8); ink.position.y = 0.42; ink.setFill(1);
    const arm = box(1.2, 0.05, 0.05, P.metal); arm.position.set(-0.85, 1.0, 0);
    bottle.add(body, ink, arm); bottle.position.y = H15; world.add('bottle', bottle);
    // 아래 접시(잉크 물)
    const dish = new THREE.Group();
    const cup = vessel(0.5, 0.5, { opacity: 0.3 }); cup.position.y = 0.25;
    const pool = liquid(0.48, 0.42, 0x5a4fcf, 0.75); pool.setFill(1); dish.add(cup, pool); world.add('dish', dish);
    // 물줄기
    const stream = cylinder(HOLE[1], HOLE[1], 1, 0x5a4fcf, { opacity: 0.85 }); stream.geometry.translate(0, -0.5, 0);
    world.add('stream', stream);
    // 튄 방울
    const drops = particles(90, 0.035, 0x5a4fcf, { x: 2.4, y: 0.4, z: 2.4 }, { glow: 0.3 }); drops.position.y = 0.55; world.add('drops', drops);
    // 다트판(구간)
    const board = new THREE.Group();
    [[0.5, 0.9, 0xf3d9a4], [0.9, 1.3, 0xe9c48a], [1.3, 1.7, 0xdcae70]].forEach(([a, b, c]) => { const r = new THREE.Mesh(new THREE.RingGeometry(a, b, 48), kit.mat(c, { side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = 0.01; board.add(r); });
    ['0~4cm', '4~8cm', '8~12cm'].forEach((t, i) => { const l = label(t, { size: 0.24 }); l.position.set(0.7 + i * 0.4, 0.15, 1.15 + i * 0.35); board.add(l); });
    world.add('board', board);
    // 라벨류
    const mk = (id, text, pos, size = 0.34) => { const l = label(text, { size }); l.position.set(...pos); world.add(id, l); };
    mk('lbObserve', '관찰: 물줄기가 접시에 닿으면 방울이 튄다', [0.4, 4.6, 0]);
    mk('lbHypo', '가설: 물줄기가 가늘수록 더 많이 튈 것이다', [0.4, 4.6, 0]);
    mk('lbSame', '같게: 높이 15cm · 잉크 25mL · 3회 평균', [2.3, 3.4, 0], 0.3);
    mk('lbDiff', '다르게: 구멍 지름 1·3·5·7mm', [2.3, 2.9, 0], 0.3);
    mk('lbMeasure', '측정: 구간별로 튄 방울 수를 센다', [0.4, 4.6, 0]);
    mk('lbCount', '', [1.6, 1.4, 0.4]);
    mk('lbPredict', '예상: 높이를 35cm로 올리면 더 많이 튈까?', [0.4, 5.4, 0]);
    mk('lbInfer', '추론: 높이·질량이 크면 위치에너지가 커서 더 멀리, 더 많이 튄다', [0.4, 5.4, 0], 0.3);
    mk('lbConclude', '결론: 굵기가 가늘수록, 높이가 높을수록 많이 튄다', [0.4, 5.4, 0]);
    // 높이 화살표
    const hArrow = arrow([1.0, 0.55, 0], [1.0, 0.55 + H15, 0], P.accent2, 0.03); world.add('hArrow', hArrow);
    const hLabel = label('높이 15cm', { size: 0.28 }); hLabel.position.set(1.55, 1.3, 0); world.add('hLabel', hLabel);
    // 차트 두 개
    const c1 = barChart([1, 3, 5, 7].map((k) => ({ label: `${k}mm`, value: DATA15[k] / MAX, text: `${DATA15[k]}`, color: P.accent })), { height: 2.2 });
    c1.position.set(3.8, 0.1, -2.6); c1.rotation.y = -0.5; world.add('chart15', c1);
    const t1 = label('15cm에서 튄 방울 수(3회 평균)', { size: 0.26 }); t1.position.set(3.8, 2.9, -2.6); world.add('chart15t', t1);
    const c2 = barChart([1, 3, 5, 7].map((k) => ({ label: `${k}mm`, value: DATA35[k] / MAX, text: `${DATA35[k]}`, color: P.accent2 })), { height: 2.2 });
    c2.position.set(3.8, 0.1, 2.6); c2.rotation.y = -0.5; world.add('chart35', c2);
    const t2 = label('35cm에서 튄 방울 수', { size: 0.26 }); t2.position.set(3.8, 2.9, 2.6); world.add('chart35t', t2);
    // 상태 헬퍼
    const set = (o, hole, height, intensity) => {
      o.bottle.position.y = height; o.stream.scale.set(HOLE[hole] / HOLE[1], height - 0.55 + 0.02, HOLE[hole] / HOLE[1]); o.stream.position.y = height;
      o.drops.children.forEach((d, i) => { d.visible = i < Math.round(90 * intensity); d.position.copy(d.userData.base).multiplyScalar(0.5 + intensity); d.position.y = d.userData.base.y * 0.6 + 0.1; });
      o.hArrow.setLength(height); o.hLabel.position.y = 0.55 + height * 0.5; relabel(o.hLabel, `높이 ${Math.round(height * 10)}cm`, { size: 0.28 });
    };
    return { set, update(dt, t) { drops.jitter(t, 0.03, 4); } };
  },
  beats: [
    { text: '관찰하기. 페트병의 잉크 물이 가는 줄기로 떨어져 접시에 닿으면, 잉크 방울이 사방으로 튑니다. 어떤 때는 많이, 어떤 때는 적게 튀네요.', show: ['stand', 'bottle', 'dish', 'stream', 'drops', 'lbObserve'], dur: 5, anim(p, o) { o.stream.scale.set(1, (H15 - 0.53) * p, 1); o.stream.position.y = H15; o.drops.children.forEach((d, i) => { d.visible = i < 40 * p; }); } },
    { text: '문제를 찾고 가설을 세우기. "물줄기가 가늘수록 방울이 더 많이 튈 것이다." 이렇게 두 변인의 관계로 말해야 실험으로 확인할 수 있습니다.', show: ['lbHypo'], hide: ['lbObserve'], dur: 5 },
    { text: '변인 통제하기. 높이 15cm, 잉크 양, 실험 횟수는 같게 하고, 구멍의 지름 1·3·5·7mm만 다르게 합니다. 바꾸는 것은 딱 하나여야 원인을 알 수 있습니다.', show: ['lbSame', 'lbDiff', 'hArrow', 'hLabel'], hide: ['lbHypo'], dur: 6, anim(p, o) { o.hArrow.setLength(0.05 + (H15 - 0.05) * p); } },
    { text: '측정하기. 접시 둘레에 반지름 4cm씩 커지는 구간을 그려 두고, 구간마다 튄 방울 수를 세기로 합니다. "많이 튄다"가 아니라 숫자로 재는 것이 측정입니다.', show: ['board', 'lbMeasure'], hide: ['lbSame', 'lbDiff'], dur: 5, anim(p, o) { o.board.scale.set(0.2 + 0.8 * p, 1, 0.2 + 0.8 * p); } },
    { text: '실험하기, 1mm 구멍. 물줄기는 사실 작은 방울들이 이어져 떨어지는 것이라, 방울 하나하나가 수면과 부딪혀 많이 튑니다. 3회 평균 100.6개.', hide: ['lbMeasure'], show: ['lbCount'], dur: 5, anim(p, o, t) { relabel(o.lbCount, '1mm → 100.6개', { size: 0.3 }); o.drops.children.forEach((d, i) => { d.visible = i < 90 * p; d.position.copy(d.userData.base).multiplyScalar(1.4); d.position.y = d.userData.base.y * 0.6 + 0.1; }); } },
    { text: '3mm, 5mm, 7mm로 구멍을 키우면 물줄기가 하나로 이어져 떨어지고, 수면과 부딪히는 횟수가 줄어 방울이 적게 튑니다. 7mm에서는 10개뿐입니다.', dur: 6, anim(p, o) { const hole = p < 0.33 ? 3 : p < 0.66 ? 5 : 7; const n = { 3: 58.7, 5: 25.6, 7: 10 }[hole]; o.stream.scale.x = o.stream.scale.z = HOLE[hole] / HOLE[1]; o.drops.children.forEach((d, i) => { d.visible = i < 90 * n / 100.6; d.position.copy(d.userData.base).multiplyScalar(0.8 + n / 100); d.position.y = d.userData.base.y * 0.6 + 0.1; }); relabel(o.lbCount, `${hole}mm → ${n}개`, { size: 0.3 }); } },
    { text: '자료 해석하기. 표와 그래프로 옮기면 한눈에 보입니다. 굵기가 굵어질수록 튄 방울 수가 줄어듭니다. 가설과 맞습니다.', show: ['chart15', 'chart15t'], hide: ['lbCount'], dur: 5, anim(p, o) { o.chart15.grow(p); } },
    { text: '예상하기. 그러면 높이를 35cm로 올리면 어떻게 될까요? 근거를 들어 예상해 봅니다. "떨어지는 힘이 커져서 더 많이 튈 것이다."', show: ['lbPredict'], dur: 5, anim(p, o) { const h = lerp(H15, H35, p); o.bottle.position.y = h; o.stream.scale.y = h - 0.53; o.stream.position.y = h; o.hArrow.setLength(h); o.hLabel.position.y = 0.55 + h * 0.5; relabel(o.hLabel, `높이 ${Math.round(h * 10)}cm`, { size: 0.28 }); } },
    { text: '다시 실험하기. 35cm에서는 1mm 구멍이 228개, 3mm가 196개까지 늘었습니다. 같은 굵기라도 높이가 높으면 더 많이 튑니다.', show: ['chart35', 'chart35t'], hide: ['lbPredict'], dur: 5, anim(p, o) { o.chart35.grow(p); o.drops.children.forEach((d, i) => { d.visible = i < 90 * p; d.position.copy(d.userData.base).multiplyScalar(1.6); d.position.y = d.userData.base.y * 0.8 + 0.1; }); } },
    { text: '추론하기. 왜 그럴까요? 높이가 높고 방울의 질량이 클수록 위치에너지가 커서, 튄 방울이 더 멀리 날아갑니다. 관찰한 사실과 알고 있는 원리를 연결하는 것이 추론입니다.', show: ['lbInfer'], dur: 6 },
    { text: '의사소통하기. 결론을 번호를 붙여 짧게 씁니다. 하나, 굵기가 가늘수록 많이 튄다. 둘, 높이가 높을수록 많이 튄다. 그리고 발표하고, 반론에 답합니다.', show: ['lbConclude'], hide: ['lbInfer'], dur: 6 },
  ],
};
