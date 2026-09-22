// 3부 주제 1 — 씨앗의 발아에 알맞은 온도는?
import { PALETTE as P, box, cylinder, sphere, vessel, liquid, label, heatColor, THREE, mat } from './_kit.js';

const TEMPS = [20, 40, 60, 80, 95];
// 발아 정도(정성): 적온에서 잘 트고, 60℃부터 단백질이 상해 급격히 준다
const GERM = { 20: 0.9, 40: 0.75, 60: 0.25, 80: 0.03, 95: 0 };

export default {
  view: { theta: 0.3, phi: 1.15, dist: 10, target: [0, 1.2, 0] },
  build(kit, world) {
    const rack = box(6.4, 0.12, 1.4, P.wood); rack.position.y = 0.06; world.add('rack', rack);
    TEMPS.forEach((T, i) => {
      const x = -2.6 + i * 1.3; const g = new THREE.Group();
      const bath = vessel(0.5, 1.2, { opacity: 0.25 }); bath.position.y = 0.7; const water = liquid(0.48, 1.0, heatColor((T - 20) / 75).getHex(), 0.6); water.position.y = 0.12; water.setFill(1);
      const tube = vessel(0.16, 1.4, { opacity: 0.4 }); tube.position.y = 1.0; g.add(bath, water, tube);
      const seeds = new THREE.Group(); for (let k = 0; k < 6; k++) { const s = sphere(0.07, P.seed); s.scale.set(1, 0.7, 0.8); s.position.set((k % 2) * 0.1 - 0.05, 0.4 + Math.floor(k / 2) * 0.13, 0); seeds.add(s); } seeds.position.y = 2.6; g.add(seeds);
      const tag = label(`${T}℃`, { size: 0.28 }); tag.position.set(0, 1.75, 0.6); g.add(tag);
      g.position.x = x; g.userData = { seeds, water, T }; world.add('bath' + T, g);
    });
    const lbHeat = label('같은 씨앗을 20·40·60·80·95℃ 물에 같은 시간 담근다 (온도만 다르게)', { size: 0.28 }); lbHeat.position.set(0, 3.4, 0); world.add('lbHeat', lbHeat);
    // 페트리 접시와 싹
    TEMPS.forEach((T, i) => {
      const x = -2.6 + i * 1.3; const g = new THREE.Group();
      const dish = cylinder(0.5, 0.5, 0.12, 0xe8eef2, { opacity: 0.7 }); dish.position.y = 0.06; const cotton = cylinder(0.45, 0.45, 0.08, 0xffffff); cotton.position.y = 0.14; g.add(dish, cotton);
      const sprouts = new THREE.Group(); for (let k = 0; k < 5; k++) { const st = cylinder(0.025, 0.03, 1, P.leaf); st.geometry.translate(0, 0.5, 0); const lf = sphere(0.08, P.leaf); lf.scale.set(1.6, 0.6, 1); lf.position.y = 1; st.add(lf); st.position.set((k - 2) * 0.16, 0.18, (k % 2) * 0.2 - 0.1); st.scale.setScalar(0.001); sprouts.add(st); } g.add(sprouts);
      const tag = label(`${T}℃`, { size: 0.26 }); tag.position.set(0, 0.0, 0.8); g.add(tag);
      g.position.set(x, 0.12, 2.2); g.userData = { sprouts, T }; world.add('dish' + T, g);
    });
    const lbGrow = label('솜에 물을 주고 실온에 두면… 적온(20~40℃)을 거친 씨앗만 잘 튼다', { size: 0.28 }); lbGrow.position.set(0, 3.4, 0); world.add('lbGrow', lbGrow);
    const lbWhy = label('60℃ 이상: 씨앗 속 단백질·효소가 상해 발아 못 함', { size: 0.3 }); lbWhy.position.set(0, 3.9, 0); world.add('lbWhy', lbWhy);
    const lbCold = label('낮은 온도 자극은 견딘다 — 겨울 지난 씨앗이 봄에 트는 이유(휴면 깨기)', { size: 0.28 }); lbCold.position.set(0, 3.4, 0); world.add('lbCold', lbCold);
    const lbFire = label('산불 뒤 새싹: 땅속은 표면만큼 뜨겁지 않고, 일부 씨앗은 열·연기가 휴면을 깬다', { size: 0.26 }); lbFire.position.set(0, 3.9, 0); world.add('lbFire', lbFire);
    const lb3 = label('발아 3조건: 물 · 공기 · 알맞은 온도', { size: 0.32 }); lb3.position.set(0, 3.4, 0); world.add('lb3', lb3);
    return {};
  },
  beats: [
    { text: '과학 시간에 배웠듯 씨앗이 싹트려면 물, 공기, 알맞은 온도가 필요합니다. 그런데 "알맞은" 온도는 몇 도일까요? 뜨거운 물과 찬물에 씨앗을 직접 노출해 봅니다.', show: ['rack', 'lb3', ...TEMPS.map((T) => 'bath' + T)], dur: 6 },
    { text: '변인 통제. 같은 종류의 강낭콩·옥수수·콩나물콩을 같은 개수씩, 같은 시간 동안 담급니다. 다르게 하는 것은 물의 온도뿐. 20, 40, 60, 80, 95도.', show: ['lbHeat'], hide: ['lb3'], dur: 6, anim(p, o) { TEMPS.forEach((T) => { o['bath' + T].userData.seeds.position.y = 2.6 - 2.2 * p; }); } },
    { text: '시험관 안쪽 온도는 바깥 물보다 늦게 오릅니다. 그래서 온도계를 시험관 안에 꽂아 실제 씨앗이 받은 온도를 재야 합니다. 이것이 정확한 측정입니다.', dur: 5 },
    { text: '꺼낸 씨앗을 물 적신 솜 위에 놓고 실온에 둡니다. 며칠 뒤, 20도와 40도를 거친 씨앗은 대부분 싹이 텄습니다.', show: ['lbGrow', ...TEMPS.map((T) => 'dish' + T)], hide: ['lbHeat'], dur: 6, anim(p, o) { TEMPS.forEach((T) => { o['dish' + T].userData.sprouts.children.forEach((s, k) => { const g = GERM[T]; s.scale.setScalar(k < Math.round(5 * g) ? Math.max(0.001, p * (0.6 + 0.4 * g)) : 0.001); }); }); } },
    { text: '60도부터 발아가 크게 줄고, 80도와 95도는 거의 트지 않았습니다. 씨앗 속 단백질과 효소가 열에 상했기 때문입니다. 익은 콩이 싹을 못 틔우는 것과 같습니다.', show: ['lbWhy'], dur: 6 },
    { text: '반대로 낮은 온도 자극은 잘 견딥니다. 겨울 동안 땅속에서 찬 온도를 겪은 씨앗이 봄에 트는 것은, 추위가 씨앗의 휴면을 깨는 신호가 되기 때문입니다.', show: ['lbCold'], hide: ['lbGrow', 'lbWhy'], dur: 6 },
    { text: '산불이 난 숲에 새싹이 돋는 이유도 생각해 봅니다. 땅속은 표면만큼 뜨거워지지 않고, 어떤 씨앗은 오히려 열과 연기가 휴면을 깨는 신호가 됩니다. 토론해 볼 만한 주제입니다.', show: ['lbFire'], dur: 6 },
    { text: '알게 된 점. 발아에는 알맞은 온도 범위가 있고, 고온은 씨앗을 죽이지만 저온 자극은 견딥니다. 발아 후 생장에도 차이가 있는지 이어서 관찰해 봅시다.', show: ['lb3'], hide: ['lbCold', 'lbFire'], dur: 5 },
  ],
};
