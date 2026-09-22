// 4-1 Ⅱ 물의 상태 변화 — 얼음 병 저울: 물이 얼면 부피는 늘고 무게는 그대로, 녹으면 부피가 다시 줄어든다
import { PALETTE as P, cylinder, box, vessel, liquid, label, relabel, arrow, THREE, mat, lerp } from './_kit.js';

const R = 0.55, H = 2.2, FILL = 0.5, GROW = 1.1;         // 병 반지름·높이, 처음 물 높이 비율, 얼 때 부피 배율
const ICE = 0xd6eaf7;

export default {
  view: { theta: 0.55, phi: 1.2, dist: 6.8, target: [0, 1.3, 0] },
  build(kit, world) {
    const scale = new THREE.Group();
    const plate = cylinder(1.0, 1.0, 0.08, P.metal); plate.position.y = 0.34; scale.add(plate);
    const bodyS = box(2.2, 0.3, 1.6, P.gray); bodyS.position.y = 0.15; scale.add(bodyS);
    const screen = box(0.9, 0.2, 0.05, P.black); screen.position.set(0, 0.16, 0.81); scale.add(screen);
    world.add('scale', scale);
    const bottle = vessel(R, H); bottle.position.y = 0.38 + H / 2; world.add('bottle', bottle);
    const water = liquid(R * 0.96, H, P.water, 0.8); water.position.y = 0.39; water.setFill(FILL); world.add('water', water);
    const mark = new THREE.Mesh(new THREE.TorusGeometry(R + 0.02, 0.018, 8, 48), mat(P.red)); mark.rotation.x = Math.PI / 2; mark.position.y = 0.39 + H * FILL; world.add('mark', mark);
    const bath = cylinder(1.25, 1.1, 1.5, 0xeef3f8, { opacity: 0.35, open: true }); bath.position.y = 0.38 + 0.75; world.add('bath', bath);
    const lbW = label('무게 120 g', { size: 0.3 }); lbW.position.set(0, 0.02, 1.3); world.add('lbW', lbW);
    const lbQ = label('얼리면 높이와 무게는?', { size: 0.32 }); lbQ.position.set(0, 3.3, 0); world.add('lbQ', lbQ);
    const lbUp = label('높이가 처음 선보다 올라갔어요', { size: 0.28 }); lbUp.position.set(0, 3.3, 0); world.add('lbUp', lbUp);
    const lbSame = label('무게는 그대로 120 g', { size: 0.3 }); lbSame.position.set(0, 3.3, 0); world.add('lbSame', lbSame);
    const lbBack = label('녹으면 다시 처음 높이로', { size: 0.3 }); lbBack.position.set(0, 3.3, 0); world.add('lbBack', lbBack);
    const up = arrow([1.0, 0.39 + H * FILL, 0], [1.0, 0.39 + H * FILL * GROW + 0.12, 0], P.red, 0.04); world.add('up', up);
    return {};
  },
  beats: [
    { text: '물을 반쯤 담은 병을 저울에 올리고, 물 높이에 빨간 선을 그어요.', show: ['scale', 'bottle', 'water', 'mark', 'lbW', 'lbQ'], dur: 4,
      reset(o) { o.water.setFill(FILL); o.water.material.color.setHex(P.water); relabel(o.lbW, '무게 120 g', { size: 0.3 }); } },
    { text: '병을 소금을 섞은 얼음 속에 넣어 물을 얼려요.', show: ['bath'], dur: 5,
      anim(p, o) { o.water.material.color.set(new THREE.Color(P.water).lerp(new THREE.Color(ICE), p)); o.water.setFill(lerp(FILL, FILL * GROW, p)); } },
    { text: '얼음이 되니 높이가 처음 선보다 높아졌어요. 부피가 늘어났어요.', show: ['up', 'lbUp'], hide: ['bath', 'lbQ'], dur: 5 },
    { text: '다시 저울에 올려 보면 무게는 그대로예요. 물의 양은 변하지 않았으니까요.', show: ['lbSame'], hide: ['lbUp', 'up'], dur: 5 },
    { text: '얼음이 녹으면 높이가 다시 처음 선으로 내려와요. 부피가 줄어들었어요.', show: ['lbBack'], hide: ['lbSame'], dur: 6,
      anim(p, o) { o.water.material.color.set(new THREE.Color(ICE).lerp(new THREE.Color(P.water), p)); o.water.setFill(lerp(FILL * GROW, FILL, p)); } },
  ],
};
