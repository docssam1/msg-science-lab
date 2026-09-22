// 3D 장면·체험 실험실을 어느 화면에서나(5단계 화면·수업 화면·교재·광고 페이지) 같은 방식으로 띄운다.
import { mountRingTower } from './lab-ring-tower.js';
import { mountFreeze } from './lab-freeze.js';
import { mountHill3D } from './lab-hill3d.js';
import { mountPond3D } from './lab-pond3d.js';
import { mountVolcano3D } from './lab-volcano3d.js';
export const LABS = { 'ring-tower': mountRingTower, freeze: mountFreeze, hill: mountHill3D, pond: mountPond3D, volcano: mountVolcano3D };
export const mountLabOf = (kind) => LABS[kind] || mountRingTower;
const REDUCED = matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// 3D (기존 engine.js 재사용)
export async function mount3D(el, sceneName, { autoplay, preview = false }) {
  el.innerHTML = `<div class="stage3d"><div class="stage3d-view"><canvas aria-label="3D 실험 장면. 끌어서 돌려 볼 수 있어요."></canvas><span class="stage3d-hint">끌어서 회전 · 두 손가락으로 확대</span></div><p class="cap"><b class="stage3d-step">1/1</b><span>장면을 준비하고 있어요…</span></p>
    <div class="ctl"><button class="btn primary" data-a="play">재생</button><button class="btn" data-a="prev">이전</button><button class="btn" data-a="next">다음</button></div></div>`;
  try {
    const [{ Stage, Player, watchDetached }, mod] = await Promise.all([import('../engine.js'), import(`../scenes/${sceneName}.js`)]);
    if (!el.isConnected) return;
    const stage = new Stage(el.querySelector('canvas')), player = new Player(stage);
    const $cap = el.querySelector('.cap span'), $step = el.querySelector('.stage3d-step'), $play = el.querySelector('[data-a=play]');
    player.onChange = () => { $cap.textContent = player.beats[player.index]?.text || ''; $step.textContent = `${player.index + 1}/${player.beats.length}`; $play.textContent = player.playing ? '멈춤' : '재생'; };
    await player.load(mod.default);
    if (preview) { player.beats = player.beats.slice(0, 3); player.speed = 1.15; }
    player.onChange();
    el.querySelector('[data-a=play]').onclick = () => player.toggle();
    el.querySelector('[data-a=prev]').onclick = () => player.prev();
    el.querySelector('[data-a=next]').onclick = () => player.next();
    if (autoplay && !REDUCED) player.play();
    watchDetached(el, () => { player.stop(); stage.dispose(); });
  } catch (e) {
    el.querySelector('.cap').textContent = '이 기기에서는 3D를 보여 줄 수 없어요. 가상 실험실로 해 봐요.';
  }
}

