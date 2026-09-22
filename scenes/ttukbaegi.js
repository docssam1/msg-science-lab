// 3부 주제 9 — 뚝배기에 숨겨진 비밀: 비열·열전도, 두께·입구·색·유약 (지도자료의 실측표 사용)
import { PALETTE as P, box, cylinder, label, particles, THREE, mat, heatColor, lerp, relabel } from './_kit.js';

const THICK = [90, 88, 86, 83, 80, 77, 75, 72, 69, 66, 65], THIN = [90, 88, 83, 79, 74, 70, 65, 62, 58, 52, 48]; // 냉각 10분

function pot(rMouth, rBody, h, wall, color, glossy) {
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(rBody * 0.8, 0), new THREE.Vector2(rBody, h * 0.35), new THREE.Vector2(rBody * 0.97, h * 0.75), new THREE.Vector2(rMouth, h), new THREE.Vector2(rMouth - wall, h), new THREE.Vector2(rBody * 0.97 - wall, h * 0.75), new THREE.Vector2(rBody - wall, h * 0.35), new THREE.Vector2(rBody * 0.8 - wall, wall), new THREE.Vector2(0, wall)];
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), mat(color, { roughness: glossy ? 0.25 : 0.9, metalness: glossy ? 0.3 : 0, side: THREE.DoubleSide })); m.castShadow = true; return m;
}

export default {
  view: { theta: 0.35, phi: 1.15, dist: 9.5, target: [0, 1.2, 0] },
  build(kit, world) {
    const mk = (x, rMouth, wall, color, name, glossy) => { const g = new THREE.Group(); const p = pot(rMouth, 0.8, 1.0, wall, color, glossy); const soup = cylinder(rMouth - wall - 0.02, 0.6, 0.55, 0xd9a441, { opacity: 0.85 }); soup.position.y = 0.6; const tag = label(name, { size: 0.26 }); tag.position.set(0, -0.2, 1.0); const temp = label('90℃', { size: 0.3, color: '#c94f4f' }); temp.position.set(0, 1.6, 0); const steam = particles(20, 0.04, 0xffffff, { x: 0.8, y: 0.8, z: 0.8 }, { glow: 0.4 }); steam.position.y = 1.5; g.add(p, soup, tag, temp, steam); g.position.x = x; g.userData = { soup, temp, steam }; return g; };
    world.add('thick', mk(-1.5, 0.7, 0.14, 0x3b2a22, '두꺼운 뚝배기', false)); world.add('thin', mk(1.5, 0.7, 0.05, 0x3b2a22, '얇은 뚝배기', false));
    const lbHeat = label('가열: 두꺼운 것은 8분, 얇은 것은 7분 만에 끓는다', { size: 0.3 }); lbHeat.position.set(0, 3.2, 0); world.add('lbHeat', lbHeat);
    const lbCool = label('냉각 10분: 두꺼운 것 90→65℃, 얇은 것 90→48℃', { size: 0.3 }); lbCool.position.set(0, 3.2, 0); world.add('lbCool', lbCool);
    const lbWhy = label('두꺼움 = 질량이 큼 → 가둔 열이 많고, 흙은 열전도율이 낮아 천천히 뺏긴다(비열↑)', { size: 0.26 }); lbWhy.position.set(0, 3.6, 0); world.add('lbWhy', lbWhy);
    world.add('narrow', mk(-1.5, 0.45, 0.1, 0x3b2a22, '입구 좁음', false)); world.add('wide', mk(1.5, 0.85, 0.1, 0x3b2a22, '입구 넓음', false));
    const lbMouth = label('입구가 좁으면 수증기로 나가는 열이 적다 → 불을 꺼도 오래 끓는다', { size: 0.28 }); lbMouth.position.set(0, 3.2, 0); world.add('lbMouth', lbMouth);
    world.add('black', mk(-1.5, 0.7, 0.1, 0x1c1c1c, '검은색', false)); world.add('white', mk(1.5, 0.7, 0.1, 0xf1e9dc, '흰색', false));
    const lbColor = label('검은색이 가장 빨리 데워지고 가장 천천히 식는다 — 빛처럼 열도 검정이 잘 흡수', { size: 0.26 }); lbColor.position.set(0, 3.2, 0); world.add('lbColor', lbColor);
    world.add('glazed', mk(-1.5, 0.7, 0.1, 0x4a3328, '유약 바름', true)); world.add('enamel', mk(1.5, 0.7, 0.04, 0xc9d3dc, '법랑(금속+유약)', true));
    const lbGlaze = label('유약은 수분 흡수를 막아 열 손실을 줄인다 · 법랑은 금속이라 가장 빨리 식는다', { size: 0.26 }); lbGlaze.position.set(0, 3.2, 0); world.add('lbGlaze', lbGlaze);
    const lbSum = label('보온 = 낮은 열전도율 + 큰 질량(비열) + 좁은 입구 + 유약', { size: 0.3 }); lbSum.position.set(0, 3.2, 0); world.add('lbSum', lbSum);
    const lbSalt = label('소금물은 끓는점이 높아 더 천천히 온도가 오른다', { size: 0.28 }); lbSalt.position.set(0, 3.6, 0); world.add('lbSalt', lbSalt);
    const setTemp = (g, T) => { relabel(g.userData.temp, `${Math.round(T)}℃`, { size: 0.3, color: '#c94f4f' }); g.userData.soup.material.color.copy(heatColor((T - 25) / 75)).lerp(new THREE.Color(0xd9a441), 0.4); g.userData.steam.children.forEach((d, i) => { d.visible = i < 20 * Math.max(0, (T - 50) / 50); }); };
    return { setTemp, update(dt, t) { for (const k of ['thick', 'thin', 'narrow', 'wide', 'black', 'white', 'glazed', 'enamel']) { const g = world.get(k); if (g && g.visible) g.userData.steam.jitter(t, 0.05, 2 + (k.length % 3)); } } };
  },
  beats: [
    { text: '뚝배기 찌개는 식탁에 와서도 한참 끓습니다. 왜 그럴까요? 두꺼운 뚝배기와 얇은 뚝배기에 같은 물을 붓고 같은 불로 가열합니다.', show: ['thick', 'thin', 'lbHeat'], dur: 6, },
    { text: '얇은 것은 4분부터 급격히 올라 7분에 끓고, 두꺼운 것은 서서히 올라 8분에 끓었습니다. 두꺼운 그릇이 열을 더 많이 삼키기 때문입니다.', dur: 6, anim(p, o) { relabel(o.thick.userData.temp, `${Math.round(25 + 75 * Math.min(1, p * 0.9))}℃`, { size: 0.3, color: '#c94f4f' }); relabel(o.thin.userData.temp, `${Math.round(25 + 75 * p)}℃`, { size: 0.3, color: '#c94f4f' }); o.thick.userData.steam.children.forEach((d, i) => { d.visible = i < 20 * p * 0.9; }); o.thin.userData.steam.children.forEach((d, i) => { d.visible = i < 20 * p; }); } },
    { text: '불을 끄고 10분간 1분마다 재면, 두꺼운 것은 90도에서 65도로, 얇은 것은 48도까지 떨어졌습니다. 실제 잰 값입니다.', show: ['lbCool'], hide: ['lbHeat'], dur: 8, anim(p, o) { const i = Math.min(10, Math.floor(p * 10.99)); const f = p * 10 - i; const a = lerp(THICK[i], THICK[Math.min(10, i + 1)], f), b = lerp(THIN[i], THIN[Math.min(10, i + 1)], f); relabel(o.thick.userData.temp, `${Math.round(a)}℃ (${i}분)`, { size: 0.3, color: '#c94f4f' }); relabel(o.thin.userData.temp, `${Math.round(b)}℃ (${i}분)`, { size: 0.3, color: '#c94f4f' }); o.thick.userData.steam.children.forEach((d, k) => { d.visible = k < 20 * (a - 50) / 40; }); o.thin.userData.steam.children.forEach((d, k) => { d.visible = k < 20 * (b - 50) / 40; }); } },
    { text: '이유는 둘입니다. 흙은 금속보다 열전도율이 낮아 열을 천천히 뺏깁니다. 그리고 두꺼우면 그릇 자체의 질량이 커서 가둬 둔 열이 많습니다. 비열이 크다고 합니다.', show: ['lbWhy'], dur: 7 },
    { text: '소금물로 하면 끓는점이 물보다 높아 온도가 더 천천히 오릅니다. 같은 조건을 유지하려면 물의 종류도 같게 해야 합니다.', show: ['lbSalt'], hide: ['lbWhy'], dur: 5 },
    { text: '입구 모양. 입구가 넓은 뚝배기는 빨리 데워지고 빨리 식습니다. 수증기로 빠져나가는 열이 많기 때문입니다. 가운데가 볼록하고 입구가 좁을수록 온도 변화가 적습니다.', show: ['narrow', 'wide', 'lbMouth'], hide: ['thick', 'thin', 'lbCool', 'lbSalt'], dur: 7, anim(p, o) { o.wide.userData.steam.children.forEach((d, i) => { d.visible = i < 20; }); o.narrow.userData.steam.children.forEach((d, i) => { d.visible = i < 7; }); } },
    { text: '색깔. 검은색 뚝배기가 가장 빨리 데워지고 가장 천천히 식었습니다. 갈색과 노란색은 차이가 거의 없었습니다. 빛과 마찬가지로 검을수록 열을 잘 흡수합니다.', show: ['black', 'white', 'lbColor'], hide: ['narrow', 'wide', 'lbMouth'], dur: 6 },
    { text: '유약. 유약을 바른 뚝배기는 수분을 빨아들이지 않아 열 손실이 적고 보온이 좋습니다. 금속에 유약을 입힌 법랑은 가장 빨리 데워지고 가장 빨리 식습니다. 금속의 열전도율 때문입니다.', show: ['glazed', 'enamel', 'lbGlaze'], hide: ['black', 'white', 'lbColor'], dur: 7 },
    { text: '정리하면 뚝배기의 보온은 낮은 열전도율, 큰 질량과 비열, 좁은 입구, 그리고 유약의 합작입니다. 변인 네 가지를 하나씩 바꿔 확인했기에 이렇게 말할 수 있습니다.', show: ['lbSum'], hide: ['lbGlaze'], dur: 7 },
  ],
};
