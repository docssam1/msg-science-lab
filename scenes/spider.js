// 1부 활동 7 — 거미와 거미줄: 변인 찾기와 통제, 공정한 실험 설계
import { PALETTE as P, box, cylinder, sphere, label, barChart, THREE, mat, relabel } from './_kit.js';

export default {
  view: { theta: 0.15, phi: 1.25, dist: 10, target: [0, 1.8, 0] },
  build(kit, world) {
    // 거미줄(기초줄 사각 + 세로줄 + 가로줄)
    const web = new THREE.Group(); const R = 1.7; const lineMat = new THREE.LineBasicMaterial({ color: 0x8a8f96 });
    const frame = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-R, -R], [R, -R], [R, R], [-R, R]].map(([x, y]) => new THREE.Vector3(x, y, 0))), new THREE.LineBasicMaterial({ color: 0x555b63, linewidth: 2 }));
    web.add(frame); const spokes = new THREE.Group(), rings = new THREE.Group();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * R * 1.35, Math.sin(a) * R * 1.35, 0)]; spokes.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat)); }
    for (let r = 0.3; r < R; r += 0.3) { const pts = []; for (let i = 0; i <= 12; i++) { const a = i * Math.PI / 6; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); } rings.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xb0b6bd }))); }
    web.add(spokes, rings); web.position.set(0, 2.2, 0); web.userData = { spokes, rings, frame }; world.add('web', web);
    const spider = new THREE.Group(); const ab = sphere(0.18, P.black), hd = sphere(0.11, P.black); hd.position.x = 0.22; spider.add(ab, hd); for (let i = 0; i < 8; i++) { const l = cylinder(0.02, 0.02, 0.45, P.black); const s = i < 4 ? 1 : -1; l.position.set(-0.15 + (i % 4) * 0.12, 0, s * 0.22); l.rotation.x = s * 1.1; spider.add(l); } spider.position.set(0.6, 2.4, 0.05); world.add('spider', spider);
    const lbF = label('기초줄(바깥 틀)', { size: 0.24 }); lbF.position.set(-1.9, 4.2, 0); world.add('lbF', lbF);
    const lbS = label('세로줄(중심→틀)', { size: 0.24 }); lbS.position.set(1.9, 3.6, 0); world.add('lbS', lbS);
    const lbR = label('가로줄(끈끈한 나선)', { size: 0.24 }); lbR.position.set(1.9, 1.0, 0); world.add('lbR', lbR);
    // 관찰 목록 → 의문
    const lbObs = label('관찰 10가지: 다리 8개, 몸 검은색, 줄 굵기가 거미마다 다르다…', { size: 0.28 }); lbObs.position.set(0, 4.7, 0); world.add('lbObs', lbObs);
    const lbWhy = label('왜? 거미줄의 굵기는 왜 거미마다 다를까?', { size: 0.3 }); lbWhy.position.set(0, 4.7, 0); world.add('lbWhy', lbWhy);
    const lbHyp = label('가설: 큰 거미의 줄이 굵고, 견디는 무게도 클 것이다', { size: 0.3 }); lbHyp.position.set(0, 4.7, 0); world.add('lbHyp', lbHyp);
    // 변인표
    const vt = new THREE.Group(); [['조작 변인(다르게)', '거미줄의 굵기', 0xd9a441], ['종속 변인(측정)', '끊어질 때까지 매단 무게', 0x2f7d6d], ['통제 변인(같게)', '줄의 길이·추 무게·매다는 방법', 0x6c7a89]].forEach(([k, v, c], i) => { const a = label(k, { size: 0.26, color: '#fff', bg: '#' + c.toString(16).padStart(6, '0') }); a.position.set(-1.7, 4.4 - i * 0.5, 0); const b = label(v, { size: 0.26 }); b.position.set(1.4, 4.4 - i * 0.5, 0); vt.add(a, b); }); world.add('vars', vt);
    // 무게 실험 장치: 줄 하나에 종이 추(30mg)를 붙여 간다
    const rig = new THREE.Group(); const bar = box(2.4, 0.08, 0.08, P.wood); bar.position.y = 3.3; const thread = cylinder(0.012, 0.012, 1.6, 0x9aa3ad); thread.position.y = 2.5; rig.add(bar, thread);
    const weights = new THREE.Group(); for (let i = 0; i < 12; i++) { const w = box(0.3, 0.05, 0.3, 0xf2eee4); w.position.y = 1.7 - i * 0.06; w.visible = false; weights.add(w); } rig.add(weights); rig.userData = { thread, weights }; world.add('rig', rig);
    const lbW = label('', { size: 0.28 }); lbW.position.set(1.6, 2.4, 0); world.add('lbW', lbW);
    const chart = barChart([{ label: '기초줄', value: 1.44 / 1.5, text: '1.44g', color: 0x555b63 }, { label: '세로줄', value: 0.72 / 1.5, text: '0.72g', color: 0x8a8f96 }, { label: '가로줄', value: 0.54 / 1.5, text: '0.54g', color: 0xb0b6bd }], { height: 2.4 }); chart.position.set(0, 0.2, 0.5); world.add('chart', chart);
    const lbC = label('산왕거미(그물 3.4cm): 기초줄 > 세로줄 > 가로줄', { size: 0.3 }); lbC.position.set(0, 3.4, 0.5); world.add('lbC', lbC);
    const lbC2 = label('거미가 클수록 모든 줄이 더 세다 — 가설 확인', { size: 0.3 }); lbC2.position.set(0, 3.9, 0.5); world.add('lbC2', lbC2);
    return { update(dt, t) { spider.position.x = 0.6 + Math.sin(t * 0.7) * 0.15; } };
  },
  beats: [
    { text: '야외에서 거미와 거미줄을 관찰해 열 가지 이상 적습니다. 다리는 8개, 한 거미줄에 한 마리, 거미줄의 굵기는 거미마다 다르다.', show: ['web', 'spider', 'lbObs'], dur: 5, anim(p, o) { o.web.userData.rings.children.forEach((r, i) => { r.visible = i < 6 * p; }); } },
    { text: '관찰한 사실에 "왜?"를 붙여 다시 씁니다. 그중 꼭 알고 싶은 한 가지를 고릅니다. 거미줄의 굵기는 왜 거미마다 다를까?', show: ['lbWhy'], hide: ['lbObs'], dur: 5 },
    { text: '가설을 세웁니다. 큰 거미일수록 먹이가 많이 걸려야 하고 자기 몸무게도 버텨야 하니, 줄이 굵고 견디는 무게도 클 것이다.', show: ['lbHyp'], hide: ['lbWhy'], dur: 5 },
    { text: '실험 전에 변인을 정리합니다. 다르게 할 것은 거미줄의 굵기, 측정할 것은 끊어질 때까지 매단 무게, 같게 할 것은 줄의 길이와 추의 무게입니다. 바꾸는 것은 하나뿐이어야 공정한 실험입니다.', show: ['vars'], hide: ['lbHyp', 'web', 'spider'], dur: 7 },
    { text: '거미줄에는 종류가 있습니다. 바깥 틀이 되는 기초줄, 중심에서 뻗는 세로줄, 그 위를 도는 끈끈한 가로줄. 줄마다 따로 잽니다.', show: ['web', 'spider', 'lbF', 'lbS', 'lbR'], hide: ['vars'], dur: 5 },
    { text: '1cm 방안지에 양면테이프를 붙인 30mg 종이 추를 줄이 끊어질 때까지 하나씩 붙입니다. 끊어진 순간의 추 무게가 그 줄의 세기입니다.', show: ['rig', 'lbW'], hide: ['web', 'spider', 'lbF', 'lbS', 'lbR'], dur: 6, anim(p, o) { const n = Math.floor(12 * p); o.rig.userData.weights.children.forEach((w, i) => { w.visible = i < n; }); relabel(o.lbW, `종이 추 ${n}개 = ${(n * 0.03).toFixed(2)}g`, { size: 0.28 }); o.rig.userData.thread.scale.x = o.rig.userData.thread.scale.z = 1 - 0.5 * p; } },
    { text: '결과입니다. 가장 큰 산왕거미의 그물에서 기초줄은 1.44g, 세로줄은 0.72g, 가로줄은 0.54g을 견뎠습니다. 기초줄은 여러 가닥이라 가장 튼튼합니다.', show: ['chart', 'lbC'], hide: ['rig', 'lbW'], dur: 6, anim(p, o) { o.chart.grow(p); } },
    { text: '거미 다섯 마리를 비교하니 거미가 클수록 모든 줄이 더 셌습니다. 가설이 맞았습니다. 반론도 준비합니다. "거미의 실제 크기를 왜 안 쟀나요?" "줄마다 3~4번 재어 평균을 냈어야 하지 않나요?"', show: ['lbC2'], dur: 7 },
  ],
};
