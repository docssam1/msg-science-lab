// 가상 시계 녹화 — 소프트웨어 렌더링(느린 컴퓨터)에서도 끊김 없는 30fps.
// 페이지의 시간(requestAnimationFrame·setTimeout·setInterval·performance.now·Date·CSS 애니메이션)을
// 우리가 1/30초씩 직접 넘기고, 넘길 때마다 한 장씩 찍는다. 실제로 몇 초가 걸리든 영상은 매끈하다.
// 사용: await vtake(browser, { url, seconds, setup, script: async (p, at) => {...}, css, out, width, height })
//   at(초): 가상 시계가 그 시각이 될 때까지 프레임을 찍으며 진행. script 안에서는 at()만 쓴다(실시간 대기 금지).
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SHIM = `(() => {
  const R = { raf: window.requestAnimationFrame.bind(window), caf: window.cancelAnimationFrame.bind(window), st: window.setTimeout.bind(window), si: window.setInterval.bind(window), ct: window.clearTimeout.bind(window), ci: window.clearInterval.bind(window), now: performance.now.bind(performance), dnow: Date.now };
  let on = false, vt = 0, base = 0, id = 1e6; const rafs = new Map(), timers = new Map();
  window.requestAnimationFrame = (cb) => on ? (rafs.set(++id, cb), id) : R.raf(cb);
  window.cancelAnimationFrame = (h) => { rafs.delete(h); R.caf(h); };
  window.setTimeout = (cb, ms = 0, ...a) => on ? (timers.set(++id, { cb, a, t: vt + Math.max(0, +ms || 0) }), id) : R.st(cb, ms, ...a);
  window.setInterval = (cb, ms = 0, ...a) => on ? (timers.set(++id, { cb, a, t: vt + Math.max(1, +ms || 1), every: Math.max(1, +ms || 1) }), id) : R.si(cb, ms, ...a);
  window.clearTimeout = (h) => { timers.delete(h); R.ct(h); }; window.clearInterval = (h) => { timers.delete(h); R.ci(h); };
  performance.now = () => on ? vt : R.now();
  Date.now = () => on ? base + vt : R.dnow();
  window.__vt = {
    start() { vt = R.now(); base = R.dnow() - vt; on = true; document.getAnimations().forEach((a) => a.pause()); },
    step(ms) {
      const end = vt + ms;
      for (;;) {   // 이 구간 안에 끝나는 타이머를 시간 순서대로
        let next = null; for (const [k, x] of timers) if (x.t <= end && (!next || x.t < next[1].t)) next = [k, x];
        if (!next) break; const [k, x] = next; vt = Math.max(vt, x.t);
        if (x.every) x.t += x.every; else timers.delete(k);
        try { x.cb(...x.a); } catch (e) { console.error(e); }
      }
      vt = end;
      const cbs = [...rafs.values()]; rafs.clear(); for (const cb of cbs) { try { cb(vt); } catch (e) { console.error(e); } }
      for (const a of document.getAnimations()) { try { if (a.playState !== 'finished') { a.pause(); a.currentTime = (a.currentTime || 0) + ms; } } catch {} }
      return vt;
    },
    get t() { return vt; },
  };
})();`;

export async function vtake(browser, { url, seconds, setup, script, css = '', out, width = 1920, height = 1080, fps = 30, warm = 1800 }) {
  const dir = out + '.frames'; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await ctx.addInitScript(SHIM);
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(warm);
  if (setup) { await setup(page).catch((e) => errs.push('setup: ' + e.message)); await page.waitForTimeout(800); }
  if (css) { await page.addStyleTag({ content: css }); await page.evaluate(() => dispatchEvent(new Event('resize'))); await page.waitForTimeout(700); }
  const cdp = await ctx.newCDPSession(page);
  await page.evaluate(() => window.__vt.start());
  let n = 0; const total = Math.round(seconds * fps), dt = 1000 / fps;
  const frame = async () => {
    await page.evaluate((ms) => window.__vt.step(ms), dt);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, captureBeyondViewport: false });
    writeFileSync(join(dir, `${String(n).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64')); n++;
  };
  const at = async (s) => { while (n < Math.min(total, Math.round(s * fps))) await frame(); };
  if (script) await script(page, at).catch((e) => errs.push('script: ' + e.message));
  await at(seconds);
  await ctx.close();
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', join(dir, '%05d.jpg'), '-vf', `scale=${width}:${height}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', out], { encoding: 'utf8' });
  if (r.status) errs.push('ffmpeg: ' + r.stderr);
  rmSync(dir, { recursive: true, force: true });
  return { frames: n, errs };
}
