// 3부 주제 10 — 터널 안에 알맞은 등은?: 눈의 명암 적응, 나트륨등(주황빛)과 안개
// ※ 지도자료 원문(279쪽~)은 이 세션에서 확보하지 못해 제목만 근거로 일반 과학 원리로 구성했다.
import { PALETTE as P, box, cylinder, sphere, label, particles, barChart, THREE, mat } from './_kit.js';

export default {
  view: { theta: 0.9, phi: 1.2, dist: 11, target: [0, 1.4, 0] },
  build(kit, world) {
    const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 12, 32, 1, true, 0, Math.PI), mat(0x4a5560, { side: THREE.DoubleSide, roughness: 1 })); tunnel.rotation.z = Math.PI / 2; tunnel.rotation.y = Math.PI / 2; tunnel.position.set(0, 0.3, 0); world.add('tunnel', tunnel);
    const road = box(12, 0.05, 3.2, 0x2f343a); road.position.y = 0.02; world.add('road', road);
    const lamps = new THREE.Group(); for (let i = 0; i < 7; i++) { const l = sphere(0.14, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.5 }); l.position.set(-5 + i * 1.7, 2.1, 0); l.userData.i = i; lamps.add(l); const pl = new THREE.PointLight(0xffffff, 3, 5, 2); pl.position.copy(l.position); l.add(pl); l.userData.light = pl; } world.add('lamps', lamps);
    const car = new THREE.Group(); const cb = box(1.4, 0.5, 0.8, P.red); cb.position.y = 0.45; const ct = box(0.8, 0.4, 0.7, 0xf2b3b3); ct.position.set(-0.1, 0.9, 0); car.add(cb, ct); car.position.set(-6.5, 0, 0.6); world.add('car', car);
    const fog = particles(140, 0.09, 0xdde3e8, { x: 11, y: 3, z: 3 }, { glow: 0 }); fog.position.y = 1.5; fog.children.forEach((d) => { d.material = mat(0xdde3e8, { opacity: 0.35 }); }); world.add('fog', fog);
    const lbEye = label('눈은 밝기에 적응하는 데 시간이 걸린다 — 밝은 밖에서 어두운 안으로 들어가면 잠깐 안 보인다', { size: 0.25 }); lbEye.position.set(0, 4.0, 0); world.add('lbEye', lbEye);
    const lbZone = label('입구는 밝게, 안쪽으로 갈수록 서서히 어둡게 — 눈이 따라올 시간을 준다', { size: 0.27 }); lbZone.position.set(0, 4.0, 0); world.add('lbZone', lbZone);
    const lbFog = label('안개·먼지 속에서는 푸른빛이 더 많이 흩어진다(산란) → 주황빛이 멀리 간다', { size: 0.26 }); lbFog.position.set(0, 4.0, 0); world.add('lbFog', lbFog);
    const lbNa = label('나트륨등: 주황빛 · 전기 효율 높음 · 색을 구분하기는 어렵다', { size: 0.28 }); lbNa.position.set(0, 4.4, 0); world.add('lbNa', lbNa);
    const lbLED = label('요즘은 흰 LED도 쓴다 — 색 구분과 수명이 좋다. 조건에 따라 알맞은 등이 다르다', { size: 0.26 }); lbLED.position.set(0, 4.0, 0); world.add('lbLED', lbLED);
    const chart = barChart([{ label: '흰 형광등', value: 0.55, color: 0xdddddd }, { label: '나트륨등(주황)', value: 1.0, color: 0xf29b3a }, { label: '흰 LED', value: 0.7, color: 0xeeeeee }], { height: 2.2 }); chart.position.set(0, 0.2, 0.6); world.add('chart', chart);
    const lbChart = label('안개 속 보이는 거리(상대값, 예시) — 모형 안개상자로 직접 잴 수 있다', { size: 0.26 }); lbChart.position.set(0, 3.2, 0.6); world.add('lbChart', lbChart);
    const lbHow = label('탐구 설계: 같은 상자·같은 안개(가습기)·같은 거리, 등의 색만 다르게 → 글자가 읽히는 거리를 잰다', { size: 0.24 }); lbHow.position.set(0, 4.0, 0); world.add('lbHow', lbHow);
    const setColor = (hex, intensity) => lamps.children.forEach((l) => { l.material.color.set(hex); l.material.emissive.set(hex); l.userData.light.color.set(hex); l.userData.light.intensity = intensity; });
    return { setColor, update(dt, t) { fog.jitter(t, 0.03, 0.5); } };
  },
  beats: [
    { text: '터널에 들어가면 주황색 등이 줄지어 있습니다. 왜 흰 등이 아니라 주황색일까요? 그리고 왜 입구 쪽 등은 더 많고 더 밝을까요?', show: ['tunnel', 'road', 'lamps', 'car'], dur: 6, anim(p, o) { o.car.position.x = -6.5 + 3 * p; } },
    { text: '첫째, 눈의 적응입니다. 밝은 밖에서 어두운 터널로 들어가면 눈이 어둠에 익숙해질 때까지 몇 초 동안 잘 안 보입니다. 시속 100km면 그 몇 초에 수십 미터를 달립니다.', show: ['lbEye'], dur: 7, anim(p, o) { o.car.position.x = -3.5 + 2 * p; } },
    { text: '그래서 입구는 밝게, 안쪽으로 갈수록 서서히 어둡게 등을 배치합니다. 눈이 따라올 시간을 주는 것입니다. 나갈 때도 마찬가지입니다.', show: ['lbZone'], hide: ['lbEye'], dur: 6, anim(p, o) { o.lamps.children.forEach((l) => { const k = 1.0 - 0.6 * (l.userData.i / 6) * p; l.userData.light.intensity = 3 * k; l.material.emissiveIntensity = 1.5 * k; }); } },
    { text: '둘째, 안개와 먼지. 터널 안에는 매연과 습기가 차기 쉽습니다. 작은 입자는 파장이 짧은 푸른빛을 더 많이 흩뜨립니다. 하늘이 파란 것과 같은 산란입니다.', show: ['fog', 'lbFog'], hide: ['lbZone'], dur: 7 },
    { text: '주황빛은 파장이 길어 덜 흩어지고 멀리 갑니다. 나트륨등은 주황빛을 내고 전기 효율도 높아 오래 쓰였습니다. 대신 색을 구분하기는 어렵습니다.', show: ['lbNa'], dur: 7, anim(p, o) { const c = new THREE.Color(0xffffff).lerp(new THREE.Color(0xf29b3a), p); o.lamps.children.forEach((l) => { l.material.color.copy(c); l.material.emissive.copy(c); l.userData.light.color.copy(c); }); } },
    { text: '이것을 직접 잴 수 있습니다. 같은 상자에 가습기로 같은 안개를 채우고, 등의 색만 바꿔 가며 글자가 읽히는 거리를 잽니다. 변인은 등의 색 하나뿐이어야 합니다.', show: ['chart', 'lbChart', 'lbHow'], hide: ['lbFog', 'lbNa', 'car', 'tunnel', 'fog', 'lamps', 'road'], dur: 7, anim(p, o) { o.chart.grow(p); } },
    { text: '요즘은 흰 LED도 많이 씁니다. 색 구분이 쉽고 수명이 깁니다. 어느 등이 "알맞은가"는 안개의 양, 전기 요금, 사고 통계까지 따져야 답할 수 있습니다. 토론 주제로 좋습니다.', show: ['lbLED'], hide: ['lbHow'], dur: 7 },
  ],
};
