// 초·과·심 LIVE 쇼릴 — node promo/msg-physics/tools/build-reel.mjs [--retake] [--only id,id]
// 전제: 저장소 루트에서 python3 -m http.server 8790
// 실제 앱을 가상 시계로 한 장씩 찍어(vtake) 끊김 없는 30fps 컷을 만들고, 큰 자막·브랜드 카드·음악·우루사쌤 목소리로 편집한다.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vtake } from './vtake.mjs';
import { recordTake } from './take.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), OUT = join(HERE, '..'), W = join(OUT, 'work', 'reel');
const ROOT = 'http://127.0.0.1:8790/', APP = ROOT + 'sample-v2/', VO = join(HERE, '../../../sample-v2/audio');
const args = process.argv.slice(2), retake = args.includes('--retake'), only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : [];
mkdirSync(W, { recursive: true });
const ff = (a) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { encoding: 'utf8', maxBuffer: 1 << 26 }); if (r.status) throw new Error(r.stderr.slice(-3000)); };

// 3D를 화면 왼쪽 절반(960×1080)에 가득 — 녹화 전용 겉모양(앱 동작은 그대로)
const FULL3D = `.activity,#activity,.workspace,.book-pane{transform:none!important;filter:none!important;contain:none!important}
#activity .scene{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;z-index:99999!important;border-radius:0!important;margin:0!important}
#activity .scene canvas{width:100%!important;height:100%!important}#activity .scene .scene-tag,#activity .scene .scene-hint{display:none!important}`;
// 교구의 물체는 click이 아니라 포인터/키로 매단다 — Enter 키로 누른다(드래그 없이 매달기와 같은 경로)
const hang = (p, sel, text) => p.evaluate(([sel, text]) => { const e = [...document.querySelectorAll(sel)].find((x) => !text || x.textContent.replace(/\s+/g, ' ').includes(text)); if (!e) return false; e.focus(); e.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); return true; }, [sel, text]);
const click = (p, sel, text) => p.evaluate(([sel, text]) => { const e = [...document.querySelectorAll(sel)].find((x) => !text || x.textContent.replace(/\s+/g, ' ').includes(text)); e?.click(); return !!e; }, [sel, text]);
const range = (p, v, sel = '#activity input[type=range]') => p.evaluate(([v, sel]) => { const r = document.querySelector(sel); if (!r) return; r.value = String(+r.min + (+r.max - +r.min) * v); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, [v, sel]);
const open = async (p) => { await p.click('#guide-action'); await p.waitForTimeout(2600); };
const predict = async (p) => { await p.click('#guide-action'); await p.waitForTimeout(1300); await p.check('#activity input[type=checkbox]').catch(() => {}); await p.fill('#activity textarea', '사과가 가장 무거울 것 같아요.').catch(() => {}); await click(p, '#activity button', '예상을 기록'); await p.waitForTimeout(2800); };

// 컷: kind = hook | card | 3d | ui ; lines = [초, 모양, html] (3d: 오른쪽 큰 글씨 / ui: 아래 자막)
const cuts = [
  { id: 'hook', kind: 'hook', dur: 5.0, steps: [[0.3, '손으로 든 느낌만으로는'], [2.2, '손으로 든 느낌만으로는<br><em>정확히 알 수 없어요</em>']] },
  { id: 'brand', kind: 'card', dur: 3.8, tag: '초등과학심화, 이제 살아 움직인다', small: '대치 MSG 영재교육', logo: true },
  { id: 'elastic', kind: '3d', dur: 4.8, num: '01', kicker: '탄성', url: 'student.html?page=12', setup: open,
    script: async (p, at) => { for (let k = 0; k <= 36; k++) { await at(0.2 + k * 0.055); await range(p, k / 36); } await at(3.0); await click(p, '#activity button', '힘을 놓기'); },
    lines: [[0.15, 'k', '실제 구동 · 탄성'], [0.35, 'h', '당기면<br><em>늘어나고</em>'], [2.9, 's', '놓으면 원래 모양으로 돌아와요']] },
  { id: 'zero', kind: '3d', dur: 5.2, num: '02', kicker: '용수철저울', url: 'student.html?page=5', setup: predict,
    script: async (p, at) => { await at(0.4); await click(p, '[data-confirm-empty]'); await at(1.4); await hang(p, '#activity .weight-item', '사과 한 개'); },
    lines: [[0.15, 'k', '영점부터'], [0.5, 'h', '매달고,<br>기다리고,<br><em>읽는다</em>']] },
  { id: 'measure', kind: '3d', dur: 5.0, num: '03', kicker: '추의 무게와 늘어난 길이', url: 'student.html?page=15', setup: open,
    script: async (p, at) => { for (const [i, g] of ['10 g', '20 g', '30 g'].entries()) { await at(0.3 + i * 1.5); if (i) await click(p, '#activity button', '물체 빼기'); await hang(p, '#activity .weight-item', g); } },
    lines: [[0.15, 'k', '추 10 · 20 · 30 g'], [0.4, 'h', '하나씩 더하면<br><em>3 · 6 · 9 cm</em>']] },
  { id: 'eye', kind: '3d', dur: 4.6, num: '04', kicker: '시선과 눈금', url: 'student.html?page=6', setup: open,
    script: async (p, at) => { for (const [i, v] of ['위에서', '같은 높이', '아래에서', '같은 높이'].entries()) { await at(0.3 + i * 1.05); await click(p, '#activity button', v); } },
    lines: [[0.15, 'k', '눈높이 맞추기'], [0.4, 'h', '보는 곳이 바뀌면<br><em>눈금도 달라 보여요</em>']] },
  { id: 'press', kind: '3d', dur: 4.2, num: '05', kicker: '누르는 힘', url: 'student.html?page=14', setup: open,
    script: async (p, at) => { for (let k = 0; k <= 30; k++) { await at(0.2 + k * 0.06); await range(p, k / 30); } await at(2.8); await click(p, '#activity button', '힘을 없애기'); },
    lines: [[0.15, 'k', '누르는 힘'], [0.4, 'h', '누르면<br><em>짧아져요</em>']] },
  { id: 'error', kind: 'ui', dur: 5.4, num: '06', kicker: '스스로 점검', url: 'student.html?page=5', setup: predict,
    script: async (p, at) => { await at(0.5); await hang(p, '#activity .weight-item', '신발 한 짝'); await at(0.9); await p.evaluate(() => document.querySelector('#activity [data-method-review]')?.closest('.lab-controls, .feedback, div')?.scrollIntoView({ block: 'center' })); },
    lines: [[0.3, 'h', '실수하면 답 대신 <em>질문</em>으로']], vo: ['method-error', 0.6], zoom: [0.68, 0.5, 1.45, 1.2, 2.4],
    // 오류가 난 뒤에만 경고 상자에 주황 빛 테두리(쇼릴에서 눈이 가도록 — 앱 자체는 그대로)
    css: `#activity .lab-controls:has([data-method-review]:not([hidden])) [data-inquiry-feedback]{position:relative;z-index:2;box-shadow:0 0 0 3px #ff8a3d,0 0 30px 8px rgba(255,138,61,.5)!important;animation:reelGlow 1.1s ease-in-out infinite alternate}@keyframes reelGlow{from{box-shadow:0 0 0 3px #ff8a3d,0 0 14px 2px rgba(255,138,61,.35)}to{box-shadow:0 0 0 3px #ff8a3d,0 0 34px 10px rgba(255,138,61,.6)}}` },
  { id: 'graph', kind: 'ui', dur: 4.6, num: '07', kicker: '표에서 그래프로', url: 'student.html?page=16', setup: open,
    script: async (p, at) => { for (const [i, [g, c]] of [[10, 3], [20, 6], [30, 9]].entries()) { await at(0.4 + i * 1.2); await p.evaluate(([g, c]) => { const [a, b] = document.querySelectorAll('#activity input[type=number]'); if (a) { a.value = g; a.dispatchEvent(new Event('input', { bubbles: true })); } if (b) { b.value = c; b.dispatchEvent(new Event('input', { bubbles: true })); } }, [g, c]); await click(p, '#activity button', '점 찍기'); } },
    lines: [[0.3, 'h', '숫자가 점이 되고, <em>관계가 보여요</em>']] },
  { id: 'battle', kind: 'ui', dur: 6.2, num: '08', kicker: '가르치기 · 두 팀', url: 'teacher.html?page=5', setup: async (p) => { await p.click('#battle'); await p.waitForTimeout(3500); },
    script: async (p, at) => {
      await at(0.5); await p.evaluate(() => document.querySelectorAll('[data-confirm-empty], button').forEach((b) => { if (/빈 저울/.test(b.textContent)) b.click(); }));
      await at(1.6); await p.evaluate(() => { const items = [...document.querySelectorAll('.weight-item, [data-object]')].filter((x) => x.offsetParent); const half = Math.ceil(items.length / 2); items[1]?.click(); items[half + 4]?.click(); });
      await at(4.0); await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => /정답 확인/.test(b.textContent))?.click());
    },
    lines: [[0.3, 'h', '두 팀이 나와 <em>배틀</em>로']], vo: ['question-correct', 4.3, 1.4] },
  { id: 'video', kind: 'ui', dur: 4.2, num: '09', kicker: '과학 이야기', url: 'student.html?page=9', real: true, setup: open,
    script: async (p, at) => { await at(0.2); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.currentTime = 6; v.play(); } }); },
    lines: [[0.3, 'h', '책 속에서 바로 <em>영상</em>으로']] },
  { id: 'modes', kind: 'ui', dur: 3.8, num: '10', kicker: '초·과·심 LIVE', url: 'start.html', real: true,
    script: async (p, at) => { for (const [i, s] of ['.card:nth-child(1)', '.card:nth-child(2)', '.card:nth-child(3)'].entries()) { await at(0.4 + i * 0.9); await p.hover(s).catch(() => {}); } },
    lines: [[0.3, 'h', '스스로 공부 · 가르치기 · <em>살아있는 책</em>']] },
  { id: 'end', kind: 'card', dur: 5.2, tag: '초등과학심화, 이제 살아 움직인다', small: '대치 MSG 영재교육 · 스스로 공부 · 가르치기 · 살아있는 책 · A4 인쇄', logo: true },
];
const XF = 0.4;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const shot = async (q, file, transparent = true) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`${ROOT}promo/msg-physics/tools/frame.html#${encodeURIComponent(JSON.stringify(q))}`);
  await p.waitForFunction(() => document.title === 'ready'); await p.waitForTimeout(250);
  await p.screenshot({ path: file, omitBackground: transparent }); await p.close();
};
// 글 한 줄이 들어오는 움직임: 0.35초 동안 오른쪽에서 60px 밀려오며 나타난다
const slideIn = (inp, t0, dx = 60) => `[${inp}:v]format=rgba,fade=t=in:st=${t0}:d=0.35:alpha=1[l${inp}]`;
const ovX = (t0, dx = 60) => `x='${dx}*max(0\\,1-(t-${t0})/0.35)':y=0:enable='gte(t,${t0})'`;

for (const c of cuts) {
  if (only.length && !only.includes(c.id)) continue;
  const d = join(W, c.id); mkdirSync(d, { recursive: true }); const out = join(d, 'cut.mp4');
  if (c.kind === 'hook') {
    for (const [i, [, html]] of c.steps.entries()) await shot({ mode: 'rhook', html }, join(d, `h${i}.png`), false);
    const ins = c.steps.flatMap((_, i) => ['-loop', '1', '-t', String(c.dur), '-i', join(d, `h${i}.png`)]);
    let fc = `color=c=0x07120c:s=1920x1080:d=${c.dur}[bg]`; let last = 'bg';
    c.steps.forEach(([t0], i) => { fc += `;[${i}:v]format=rgba,fade=t=in:st=${t0}:d=0.45:alpha=1[s${i}];[${last}][s${i}]overlay=0:0:enable='gte(t,${t0})'[o${i}]`; last = `o${i}`; });
    ff([...ins, '-filter_complex', fc + `;[${last}]format=yuv420p[vo]`, '-map', '[vo]', '-t', String(c.dur), '-r', '30', '-c:v', 'libx264', '-crf', '17', out]);
  } else if (c.kind === 'card') {
    await shot({ mode: 'rcard', tag: c.tag, small: c.small, logo: c.logo }, join(d, 'card.png'), false);
    // 살짝 다가오는 카메라(1.0 → 1.05)
    ff(['-loop', '1', '-t', String(c.dur), '-i', join(d, 'card.png'), '-filter_complex', `[0:v]scale=2016:1134,zoompan=z='1+0.05*on/(${c.dur}*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,format=yuv420p[vo]`, '-map', '[vo]', '-t', String(c.dur), '-c:v', 'libx264', '-crf', '17', out]);
  } else {
    const take = join(d, 'take.mp4');
    if (retake || !existsSync(take)) {
      const t0 = Date.now(); const is3d = c.kind === '3d';
      const opts = { url: APP + c.url, seconds: c.dur + 0.3, setup: c.setup, script: c.script, out: take, css: is3d ? FULL3D : (c.css || ''), width: is3d ? 960 : 1920, height: 1080, dpr: c.zoom ? 2 : 1 };
      const r = c.real ? await recordTake(b, { ...opts, width: 1920, height: 1080 }) : await vtake(b, opts);
      console.log(`  녹화 ${c.id}: ${r.frames}장 · ${((Date.now() - t0) / 1000).toFixed(0)}초`, r.errs?.length ? r.errs : '');
    }
    const lines = c.lines || []; const pngs = [];
    for (const [i, [t0, cls, html]] of lines.entries()) {
      const f = join(d, `l${i}.png`); pngs.push([f, t0]);
      if (c.kind === '3d') await shot({ mode: 'rline', cls, html, y: { k: 300, h: 360, s: 760 }[cls] }, f);
      else await shot({ mode: 'rcapt', cls, html }, f);
    }
    const base = join(d, 'base.png');
    if (c.kind === '3d') await shot({ mode: 'rbg', kicker: c.kicker, num: `${c.num} / 10` }, base, false);
    else await shot({ mode: 'rcapbg', kicker: c.kicker, num: `${c.num} / 10` }, base);
    const ins = ['-loop', '1', '-t', String(c.dur), '-i', base, '-i', take, ...pngs.flatMap(([f]) => ['-loop', '1', '-t', String(c.dur), '-i', f])];
    let fc;
    if (c.kind === '3d') fc = `[1:v]scale=960:1080,setpts=PTS-STARTPTS[tk];[0:v][tk]overlay=0:0[b0]`;
    // 화면 녹화 컷: 천천히 다가가는 카메라 + 아래 그라데이션·자막
    else if (!c.zoom) fc = `[1:v]scale=2016:1134,zoompan=z='1+0.06*on/(${c.dur}*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[tk];[tk][0:v]overlay=0:0[b0]`;
    // zoom: [가로 비율, 세로 비율, 배율, 시작 초, 끝 초] — 그 지점으로 부드럽게 다가간다(2배 해상도 녹화라 글자가 선명)
    else { const [cx, cy, Z, t0, t1] = c.zoom, e = `(clip((on/30-${t0})/${t1 - t0},0,1)*clip((on/30-${t0})/${t1 - t0},0,1)*(3-2*clip((on/30-${t0})/${t1 - t0},0,1)))`;
      fc = `[1:v]scale=4032:2268,zoompan=z='1+0.04*on/(${c.dur}*30)+${Z - 1}*${e}':x='clip(iw/2+(${cx}-0.5)*iw*${e}-iw/zoom/2,0,iw-iw/zoom)':y='clip(ih/2+(${cy}-0.5)*ih*${e}-ih/zoom/2,0,ih-ih/zoom)':d=1:s=1920x1080:fps=30[tk];[tk][0:v]overlay=0:0[b0]`; }
    let last = 'b0';
    pngs.forEach(([, t0], i) => { fc += `;[${i + 2}:v]format=rgba,fade=t=in:st=${t0}:d=0.35:alpha=1[t${i}];[${last}][t${i}]overlay=${ovX(t0)}[o${i}]`; last = `o${i}`; });
    ff([...ins, '-filter_complex', fc + `;[${last}]format=yuv420p[vo]`, '-map', '[vo]', '-t', String(c.dur), '-r', '30', '-c:v', 'libx264', '-crf', '17', out]);
  }
  console.log(`컷 ${c.id} ${c.dur}s`);
}
await b.close();
if (only.length) { console.log('일부 컷만 만들었어요.'); process.exit(0); }

// 이어 붙이기: 훅→브랜드는 음악 드롭에 맞춰 짧게, 나머지는 0.4초 교차
const ins = cuts.flatMap((c) => ['-i', join(W, c.id, 'cut.mp4')]);
let fc = '', last = '0:v', off = 0; const starts = [0];
for (let i = 1; i < cuts.length; i++) {
  const x = i === 1 ? 0.15 : XF, kind = i === 1 ? 'fadewhite' : ['smoothleft', 'fade', 'slideleft', 'fade'][i % 4];
  off += cuts[i - 1].dur - x; starts.push(off);
  fc += `${fc ? ';' : ''}[${last}][${i}:v]xfade=transition=${kind}:duration=${x}:offset=${off.toFixed(3)}[x${i}]`; last = `x${i}`;
}
const TOTAL = off + cuts.at(-1).dur;
// 소리: 음악(드롭 = 브랜드 카드 시작) + 우루사쌤 목소리 몇 마디(나올 때 음악을 살짝 낮춤)
const MUSIC = join(W, 'music.wav');
spawnSync('python3', [join(HERE, 'music.py'), MUSIC, String(TOTAL.toFixed(2)), String(starts[1].toFixed(2))], { stdio: 'inherit' });
const vos = [['l1-structure', starts[1] + 0.35, 3.3]];
cuts.forEach((c, i) => { if (c.vo) vos.push([c.vo[0], starts[i] + c.vo[1], c.vo[2]]); });
const aIns = ['-i', MUSIC, ...vos.flatMap(([id]) => ['-i', join(VO, `${id}.mp3`)])];
let afc = '';
vos.forEach(([, t, len], i) => { afc += `[${cuts.length + 1 + i}:a]${len ? `atrim=0:${len},` : ''}aresample=48000,aformat=channel_layouts=stereo,volume=1.6,adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[v${i}];`; });
afc += `${vos.map((_, i) => `[v${i}]`).join('')}amix=inputs=${vos.length}:normalize=0[vox];[vox]asplit[vx1][vx2];[${cuts.length}:a]volume=0.55[mus];[mus][vx1]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[duck];[duck][vx2]amix=inputs=2:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11[ao]`;
const FINAL = join(OUT, 'chogwasim-live-showreel.mp4');
ff([...ins, ...aIns, '-filter_complex', `${fc};[${last}]format=yuv420p[vo];${afc}`, '-map', '[vo]', '-map', '[ao]', '-t', TOTAL.toFixed(2), '-r', '30', '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', FINAL]);
ff(['-ss', String((starts[2] + 1.6).toFixed(2)), '-i', FINAL, '-frames:v', '1', '-q:v', '2', join(OUT, 'chogwasim-live-showreel-poster.jpg')]);
writeFileSync(join(W, 'timeline.json'), JSON.stringify(cuts.map((c, i) => ({ id: c.id, start: +starts[i].toFixed(2), dur: c.dur })), null, 1));
console.log(`쇼릴 완성: ${FINAL} · ${TOTAL.toFixed(1)}초`);
