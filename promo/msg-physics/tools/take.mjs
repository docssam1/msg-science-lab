// 실제 앱 화면 녹화(한 장면) — Chrome 화면 전송(CDP screencast)으로 받은 프레임을 시간표대로 30fps 영상으로 만든다.
// 사용: import { recordTake } from './take.mjs'; await recordTake(browser, { url, seconds, script: async (page, t) => {...}, out })
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export async function recordTake(browser, { url, seconds, script, setup, out, focusSel, width = 1600, height = 900, warm = 1500 }) {
  const dir = out + '.frames'; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(warm);
  if (setup) { await setup(page).catch((e) => errs.push('setup: ' + e.message)); await page.waitForTimeout(600); }   // 녹화 전에 준비(예상 기록 등)
  const cdp = await ctx.newCDPSession(page); const frames = [];
  cdp.on('Page.screencastFrame', async (f) => {
    const i = frames.length; writeFileSync(join(dir, `${String(i).padStart(5, '0')}.jpg`), Buffer.from(f.data, 'base64'));
    frames.push(f.metadata.timestamp); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: width, maxHeight: height, everyNthFrame: 1 });
  const t0 = Date.now() / 1000;
  // 움직임이 없어도 프레임이 오도록 아주 작은 표시를 깜빡인다(화면 밖)
  await page.evaluate(() => { const d = document.createElement('i'); d.style.cssText = 'position:fixed;left:-9px;top:-9px;width:1px;height:1px;opacity:.01'; document.body.appendChild(d); setInterval(() => { d.style.opacity = d.style.opacity === '0.01' ? '0.02' : '0.01'; }, 100); });
  const run = script ? script(page, (s) => page.waitForTimeout(Math.max(0, (t0 + s) * 1000 - Date.now()))) : Promise.resolve();
  await Promise.race([run.catch((e) => errs.push('script: ' + e.message)), new Promise((r) => setTimeout(r, seconds * 1000 + 200))]);
  await page.waitForTimeout(Math.max(0, (t0 + seconds) * 1000 - Date.now()));
  // 확대할 요소(예: 3D 캔버스)의 위치 — 합성할 때 서서히 이 영역으로 들어간다
  const rect = focusSel ? await page.evaluate((sel) => { const e = [...document.querySelectorAll(sel)].find((x) => x.offsetParent); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }, focusSel).catch(() => null) : null;
  await cdp.send('Page.stopScreencast'); await ctx.close();
  // 프레임별 표시 시간 → concat 목록 → 30fps 영상
  const lines = []; const first = frames[0] ?? t0;
  for (let i = 0; i < frames.length; i++) {
    const start = Math.max(0, frames[i] - Math.max(first, t0)), end = i + 1 < frames.length ? frames[i + 1] - Math.max(first, t0) : seconds;
    lines.push(`file '${String(i).padStart(5, '0')}.jpg'`, `duration ${Math.max(0.001, end - start).toFixed(4)}`);
  }
  if (frames.length) lines.push(`file '${String(frames.length - 1).padStart(5, '0')}.jpg'`);
  writeFileSync(join(dir, 'list.txt'), lines.join('\n'));
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-vf', `fps=30,scale=${width}:${height}:flags=lanczos,format=yuv420p`, '-t', String(seconds), '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', out], { encoding: 'utf8' });
  if (r.status) errs.push('ffmpeg: ' + r.stderr);
  rmSync(dir, { recursive: true, force: true });
  return { frames: frames.length, fps: frames.length / seconds, errs, rect };
}
