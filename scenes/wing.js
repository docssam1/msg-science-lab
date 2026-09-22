// 3부 주제 7 — 떴다 떴다 비행기: 양력, 날개 크기·모양, 베르누이
import { PALETTE as P, box, cylinder, label, arrow, particles, barChart, THREE, mat } from './_kit.js';

function airfoil(chord, span, color) {
  const s = new THREE.Shape(); const pts = []; for (let i = 0; i <= 30; i++) { const x = i / 30; const yt = 0.16 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4); pts.push([x, yt]); }
  s.moveTo(0, 0); pts.forEach(([x, y]) => s.lineTo(x * chord, y * chord * 1.3)); s.lineTo(chord, 0); s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: span, bevelEnabled: false }); g.translate(-chord * 0.4, 0, -span / 2);
  const m = new THREE.Mesh(g, mat(color)); m.castShadow = true; return m;
}

export default {
  view: { theta: 0.5, phi: 1.25, dist: 9.5, target: [0, 1.4, 0] },
  build(kit, world) {
    const wing = airfoil(2.6, 2.0, 0xc9d6e3); wing.position.set(0, 1.2, 0); world.add('wing', wing);
    const lbCut = label('날개 단면: 아래는 평평, 위는 볼록', { size: 0.3 }); lbCut.position.set(0, 3.3, 0); world.add('lbCut', lbCut);
    // 공기 흐름: 위쪽은 빠르게(간격 넓게), 아래는 느리게
    const above = particles(40, 0.035, 0x5aa0d6, { x: 5, y: 0.3, z: 1.8 }, { glow: 0.4 }); above.position.set(0, 1.85, 0); above.children.forEach((d) => { d.userData.speed = 2.4; }); world.add('above', above);
    const below = particles(40, 0.035, 0x5aa0d6, { x: 5, y: 0.3, z: 1.8 }, { glow: 0.4 }); below.position.set(0, 0.95, 0); below.children.forEach((d) => { d.userData.speed = 1.3; }); world.add('below', below);
    const lbFlow = label('위쪽 공기가 더 빠르다 → 압력이 낮다 (베르누이)', { size: 0.3 }); lbFlow.position.set(0, 3.3, 0); world.add('lbFlow', lbFlow);
    const pUp = arrow([0, 0.5, 1.2], [0, 1.05, 1.2], P.red, 0.05); world.add('pUp', pUp); const pDown = arrow([0, 2.4, 1.2], [0, 2.1, 1.2], P.cold, 0.04); world.add('pDown', pDown);
    const lift = arrow([0.2, 1.5, 1.4], [0.2, 3.0, 1.4], P.accent, 0.06); world.add('lift', lift);
    const lbLift = label('양력 = 아래에서 미는 힘 − 위에서 누르는 힘', { size: 0.3 }); lbLift.position.set(0, 3.3, 0); world.add('lbLift', lbLift);
    const lbNewton = label('또 하나의 설명: 날개가 공기를 아래로 밀면 공기는 날개를 위로 민다(작용·반작용)', { size: 0.26 }); lbNewton.position.set(0, 3.7, 0); world.add('lbNewton', lbNewton);
    // 선풍기 실험 장치
    const fan = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 12, 40), mat(P.metal)); const hub = cylinder(0.12, 0.12, 0.2, P.ink); hub.rotation.x = Math.PI / 2; const blades = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = box(0.2, 0.65, 0.04, P.gray); b.position.y = 0.4; const h = new THREE.Group(); h.add(b); h.rotation.z = i * 2 * Math.PI / 3; blades.add(h); } fan.add(ring, hub, blades); fan.position.set(-3.6, 1.4, 0); fan.rotation.y = Math.PI / 2; fan.userData = { blades }; world.add('fan', fan);
    const scale = box(0.6, 0.15, 0.6, P.metal); scale.position.set(0, 0.08, 0); world.add('scale', scale);
    const lbRig = label('선풍기 바람 + 저울: 날개를 실로 매달아 양력의 세기를 잰다', { size: 0.28 }); lbRig.position.set(0, 3.3, 0); world.add('lbRig', lbRig);
    // 날개 크기 비교
    const wingBig = airfoil(2.6, 3.2, 0xc9d6e3); wingBig.position.set(0, 1.2, 0); world.add('wingBig', wingBig);
    const chart = barChart([{ label: '작은 날개', value: 0.5, color: P.accent2 }, { label: '큰 날개', value: 1.0, color: P.accent }, { label: '평평한 판', value: 0.35, color: P.gray }], { height: 2.0 }); chart.position.set(3.2, 0.2, 0.8); chart.rotation.y = -0.4; world.add('chart', chart);
    const lbSize = label('양력은 날개 넓이에 비례 · 곡면 날개가 평판보다 크다', { size: 0.3 }); lbSize.position.set(0, 3.3, 0); world.add('lbSize', lbSize);
    const lbAoA = label('받음각: 날개를 살짝 들면 양력↑, 너무 들면 흐름이 떨어져 실속', { size: 0.28 }); lbAoA.position.set(0, 3.3, 0); world.add('lbAoA', lbAoA);
    const lbWin = label('비행기 창문이 둥근 이유: 네모 모서리는 힘이 몰려 금이 간다', { size: 0.28 }); lbWin.position.set(0, 3.7, 0); world.add('lbWin', lbWin);
    return { update(dt, t) { [above, below].forEach((g) => g.children.forEach((d) => { d.position.x += d.userData.speed * dt; if (d.position.x > 2.6) d.position.x = -2.6; d.position.y = d.userData.base.y * 0.5 + (g === above ? 0.25 * Math.exp(-(d.position.x ** 2) / 1.2) : -0.05); })); fan.userData.blades.rotation.z += dt * 12; } };
  },
  beats: [
    { text: '수백 톤짜리 비행기가 어떻게 뜰까요? 답은 날개의 모양에 있습니다. 단면을 보면 아래는 평평하고 위는 볼록합니다.', show: ['wing', 'lbCut'], dur: 5 },
    { text: '공기가 날개를 지나면 위쪽은 볼록한 길을 돌아가느라 더 빨라지고, 아래쪽은 상대적으로 느립니다. 빠르게 흐르는 곳은 압력이 낮아집니다. 베르누이 원리입니다.', show: ['above', 'below', 'lbFlow'], hide: ['lbCut'], dur: 7 },
    { text: '아래쪽의 높은 압력이 날개를 위로 밀고, 위쪽의 낮은 압력은 덜 누릅니다. 그 차이가 양력입니다.', show: ['pUp', 'pDown', 'lift', 'lbLift'], hide: ['lbFlow'], dur: 6, anim(p, o) { o.lift.setLength(1.5 * p); o.pUp.setLength(0.55 * p); } },
    { text: '또 다른 설명도 있습니다. 날개가 지나가며 공기를 아래로 밀어내면, 공기는 날개를 위로 밉니다. 작용과 반작용입니다. 두 설명은 같은 현상을 다른 쪽에서 본 것입니다.', show: ['lbNewton'], dur: 6 },
    { text: '직접 재 봅니다. 선풍기 앞에 날개를 실로 매달고 저울로 양력의 세기를 잽니다. 바람 세기는 같게 하고 날개만 바꿉니다.', show: ['fan', 'scale', 'lbRig'], hide: ['above', 'below', 'pUp', 'pDown', 'lbLift', 'lbNewton'], dur: 6 },
    { text: '날개를 넓히면 양력이 커집니다. 양력은 날개 넓이에 거의 비례합니다. 그리고 같은 넓이라도 곡면 날개가 평평한 판보다 큰 양력을 냅니다.', show: ['wingBig', 'chart', 'lbSize'], hide: ['wing', 'lbRig'], dur: 6, anim(p, o) { o.chart.grow(p); o.lift.setLength(1.5 + 0.8 * p); } },
    { text: '날개 앞을 살짝 들어 올리면 양력이 더 커집니다. 받음각입니다. 하지만 너무 들면 위쪽 흐름이 날개에서 떨어져 나가 양력이 갑자기 사라집니다. 실속이라고 합니다.', show: ['lbAoA'], hide: ['lbSize', 'chart'], dur: 7, anim(p, o) { o.wingBig.rotation.z = 0.25 * Math.sin(p * Math.PI); o.lift.setLength(2.3 + 0.6 * Math.sin(p * Math.PI) - (p > 0.85 ? 2.0 : 0)); } },
    { text: '보너스. 비행기 창문은 왜 둥글까요? 네모난 창의 모서리에는 힘이 몰려 금이 가기 쉽습니다. 옛날 제트기의 사고에서 배운 것입니다. 관찰한 것에 "왜?"를 붙이면 어디든 탐구가 됩니다.', show: ['lbWin'], hide: ['lbAoA'], dur: 7, anim(p, o) { o.wingBig.rotation.z = 0; o.lift.setLength(2.3); } },
  ],
};
