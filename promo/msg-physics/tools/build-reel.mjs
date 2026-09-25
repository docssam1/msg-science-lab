// 초·과·심 LIVE 쇼릴 — node promo/msg-physics/tools/build-reel.mjs [--retake] [--only id,id] [--assemble]
// 전제: 저장소 루트에서 python3 -m http.server 8790
// 실제 앱을 가상 시계로 한 장씩 찍어(vtake) 끊김 없는 30fps 컷을 만들고, 큰 자막·브랜드 카드·음악·우루사쌤 목소리로 편집한다.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vtake } from './vtake.mjs';
import { recordTake } from './take.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), OUT = join(HERE, '..'), W = join(OUT, 'work', 'reel');
const ROOT = 'http://127.0.0.1:8790/', APP = ROOT + 'sample-v2/', VO = join(HERE, '../../../sample-v2/audio');
const args = process.argv.slice(2), retake = args.includes('--retake'), assemble = args.includes('--assemble'), only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : [];
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

const R = '#mobile-reader';
const answer = async (p) => {   // 데일리 테스트 1차시: 부품 이름 하나를 헷갈리고(×), 3번은 목록 밖 답(검토 필요)
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => document.documentElement.dataset.ready === 'true'); await p.waitForTimeout(900);
  const fill = (n, v) => p.locator(`${R} input[name="${n}"]`).fill(v);
  await fill('a1-0', '영점조절나사'); await fill('a1-1', '용수철'); await fill('a1-2', '눈금'); await fill('a1-3', '고리');
  await p.locator(`${R} input[name="a2"][value="2"]`).check();
  await p.locator(`${R} .question[data-q="a3"] .dt-speak`).click(); await p.locator(`${R} .question[data-q="a3"] .speech-draft`).fill('바늘'); await p.locator(`${R} .question[data-q="a3"] .speech-apply`).click();
  await fill('a4', 'ㄷ'); await p.locator(`${R} input[name="a5"][value="0"]`).check(); await p.locator(`${R} input[name="a6"][value="1"]`).check();
};

// 컷: kind = hook | card | 3d | ui ; lines = [초, 모양, html] (3d: 오른쪽 큰 글씨 / ui: 아래 자막)
const cuts = [
  { id: 'hook', kind: 'hook', dur: 5.0, steps: [[0.3, '손으로 든 느낌만으로는'], [2.2, '손으로 든 느낌만으로는<br><em>정확히 알 수 없어요</em>']], sfx: [[0.3, 'pop'], [2.2, 'pop']] },
  { id: 'brand', kind: 'card', dur: 3.8, tag: '초등과학심화, 이제 살아 움직인다', small: '대치 MSG 영재교육', logo: true, sfx: [[0, 'impact']],
    vo: ['l1-structure', 0.35, 3.3], talk: { h: 640, x: 1400, in: 0.05, mood: 'praise' } },   // "안녕하세요. 우루사쌤과 용수철저울을 알아볼까요?" — 로고 오른쪽에서 인사
  { id: 'elastic', kind: '3d', dur: 4.8, num: '01', kicker: '탄성', url: 'student.html?page=12', setup: open,
    script: async (p, at) => { for (let k = 0; k <= 36; k++) { await at(0.2 + k * 0.055); await range(p, k / 36); } await at(3.0); await click(p, '#activity button', '힘을 놓기'); },
    lines: [[0.15, 'k', '실제 구동 · 탄성'], [0.35, 'h', '당기면<br><em>늘어나고</em>'], [2.9, 's', '놓으면 원래 모양으로 돌아와요']], sfx: [[0.25, 'spring'], [3.0, 'tick'], [3.05, 'spring']] },
  { id: 'zero', kind: '3d', dur: 5.2, num: '02', kicker: '용수철저울', url: 'student.html?page=5', setup: predict,
    script: async (p, at) => { await at(0.4); await click(p, '[data-confirm-empty]'); await at(1.4); await hang(p, '#activity .weight-item', '사과 한 개'); },
    lines: [[0.15, 'k', '영점부터'], [0.5, 'h', '매달고,<br>기다리고,<br><em>읽는다</em>']], sfx: [[0.4, 'tick'], [1.4, 'tick'], [1.5, 'clank']] },
  { id: 'measure', kind: '3d', dur: 5.0, num: '03', kicker: '추의 무게와 늘어난 길이', url: 'student.html?page=15', setup: open,
    script: async (p, at) => { for (const [i, g] of ['10 g', '20 g', '30 g'].entries()) { await at(0.3 + i * 1.5); if (i) await click(p, '#activity button', '물체 빼기'); await hang(p, '#activity .weight-item', g); } },
    lines: [[0.15, 'k', '추 10 · 20 · 30 g'], [0.4, 'h', '하나씩 더하면<br><em>3 · 6 · 9 cm</em>']], sfx: [[0.3, 'clank'], [1.8, 'tick'], [1.85, 'clank'], [3.3, 'tick'], [3.35, 'clank']] },
  { id: 'eye', kind: '3d', dur: 4.6, num: '04', kicker: '시선과 눈금', url: 'student.html?page=6', setup: open,
    script: async (p, at) => { for (const [i, v] of ['위에서', '같은 높이', '아래에서', '같은 높이'].entries()) { await at(0.3 + i * 1.05); await click(p, '#activity button', v); } },
    lines: [[0.15, 'k', '눈높이 맞추기'], [0.4, 'h', '보는 곳이 바뀌면<br><em>눈금도 달라 보여요</em>']], sfx: [0.3, 1.35, 2.4, 3.45].map((t) => [t, 'tick']),
    talk: { h: 420, x: 1400, in: 1.0, moods: [[1.0, 'think'], [2.4, 'surprise']], mood: 'surprise' } },   // 말 없이: 갸웃 → '아래에서'로 바뀔 때 흠칫
  { id: 'press', kind: '3d', dur: 4.2, num: '05', kicker: '누르는 힘', url: 'student.html?page=14', setup: open,
    script: async (p, at) => { for (let k = 0; k <= 30; k++) { await at(0.2 + k * 0.06); await range(p, k / 30); } await at(2.8); await click(p, '#activity button', '힘을 없애기'); },
    lines: [[0.15, 'k', '누르는 힘'], [0.4, 'h', '누르면<br><em>짧아져요</em>']], sfx: [[0.2, 'spring'], [2.8, 'tick'], [2.85, 'spring']] },
  { id: 'error', kind: 'ui', dur: 5.4, num: '06', kicker: '스스로 점검', url: 'student.html?page=5', setup: predict,
    script: async (p, at) => { await at(0.5); await hang(p, '#activity .weight-item', '신발 한 짝'); await at(0.9); await p.evaluate(() => document.querySelector('#activity [data-method-review]')?.closest('.lab-controls, .feedback, div')?.scrollIntoView({ block: 'center' })); },
    lines: [[0.3, 'h', '실수하면 답 대신 <em>질문</em>으로']], vo: ['method-error', 0.6], talk: { h: 460, x: 1190, in: 0.5, moods: [[0.5, 'surprise']], mood: 'encourage' }, zoom: [0.68, 0.5, 1.45, 1.2, 2.4], sfx: [[0.5, 'tick'], [0.58, 'buzz'], [1.2, 'swell']],
    // 오류가 난 뒤에만 경고 상자에 주황 빛 테두리(쇼릴에서 눈이 가도록 — 앱 자체는 그대로)
    css: `#activity .lab-controls:has([data-method-review]:not([hidden])) [data-inquiry-feedback]{position:relative;z-index:2;box-shadow:0 0 0 3px #ff8a3d,0 0 30px 8px rgba(255,138,61,.5)!important;animation:reelGlow 1.1s ease-in-out infinite alternate}@keyframes reelGlow{from{box-shadow:0 0 0 3px #ff8a3d,0 0 14px 2px rgba(255,138,61,.35)}to{box-shadow:0 0 0 3px #ff8a3d,0 0 34px 10px rgba(255,138,61,.6)}}` },
  { id: 'grade', kind: 'ui', dur: 5.8, num: '07', kicker: '데일리 테스트 · 자동 채점', url: 'student.html?page=11', setup: answer,
    script: async (p, at) => {
      await at(0.5); await p.evaluate(() => document.querySelector('#guide-action')?.click());
      await at(2.8); await p.evaluate(() => document.querySelector('.dt-card.wrong summary')?.click());
    },
    lines: [[0.3, 'h', '채점하고, <em>왜 틀렸는지</em>까지']], zoom: [0.27, 0.63, 1.9, 2.0, 3.2], sfx: [[0.5, 'tick'], [0.85, 'ding', 0.7], [2.0, 'swell'], [2.8, 'tick']] },
  { id: 'remedy', kind: 'ui', dur: 5.0, num: '08', kicker: '오개념 처방', url: 'student.html?page=11',
    setup: async (p) => { await answer(p); await p.click('#guide-action'); await p.waitForTimeout(1600); },
    script: async (p, at) => {
      await at(0.4); await p.evaluate(() => document.querySelector('#guide-action')?.click());
      await at(0.9); await p.evaluate(() => document.querySelector('[data-rx="s01"]')?.scrollIntoView({ block: 'start' }));
      await at(1.9); await p.evaluate(() => document.querySelector('[data-rx="s01"] [data-rx-opt="0"]')?.click());
      await at(3.4); await p.evaluate(() => document.querySelector('[data-rx="s01"] [data-rx-opt="1"]')?.click());
    },
    lines: [[0.3, 'h', '두 번 헷갈리면 <em>처방 문제</em>']], zoom: [0.26, 0.42, 2.0, 1.0, 1.8], sfx: [[0.4, 'tick'], [1.0, 'swell'], [1.9, 'tick'], [1.95, 'buzz'], [3.4, 'tick'], [3.45, 'ding']] },
  { id: 'graph', kind: 'ui', dur: 4.6, num: '09', kicker: '표에서 그래프로', url: 'student.html?page=16', setup: open,
    script: async (p, at) => { for (const [i, [g, c]] of [[10, 3], [20, 6], [30, 9]].entries()) { await at(0.4 + i * 1.2); await p.evaluate(([g, c]) => { const [a, b] = document.querySelectorAll('#activity input[type=number]'); if (a) { a.value = g; a.dispatchEvent(new Event('input', { bubbles: true })); } if (b) { b.value = c; b.dispatchEvent(new Event('input', { bubbles: true })); } }, [g, c]); await click(p, '#activity button', '점 찍기'); } },
    lines: [[0.3, 'h', '숫자가 점이 되고, <em>관계가 보여요</em>']], sfx: [0.4, 1.6, 2.8].map((t) => [t + 0.05, 'pop']),
    talk: { h: 440, x: 1300, in: 1.0, moods: [[1.0, 'think'], [3.0, 'praise']], mood: 'praise' } },   // 말 없이: 점을 보며 갸웃 → 세 점이 다 찍히면 톡
  { id: 'battle', kind: 'ui', dur: 7.6, num: '10', kicker: '가르치기 · 두 팀', url: 'teacher.html?page=5', setup: async (p) => { await p.click('#battle'); await p.waitForTimeout(3500); },
    // A팀은 가벼운 것부터 바르게 세우고, B팀은 한 칸 어긋나게 — 도장·배너·점수가 한 컷에 다 나온다
    script: async (p, at, fx) => {
      const [A, B] = await p.evaluate(() => [...document.querySelectorAll('[data-battle-team]')].map((e) => e.dataset.battleTeam));
      const tap = (sel) => p.evaluate((sel) => document.querySelector(sel)?.click(), sel);
      await at(0.3); await tap(`[data-zero="${A}"]`); await tap(`[data-zero="${B}"]`); fx('tick');
      await at(0.7); await tap(`[data-object="apple"][data-team="${A}"]`); fx('clank'); await at(0.9); await tap(`[data-object="shoe"][data-team="${B}"]`); fx('clank', 0, 0.8);
      const order = (t) => p.evaluate((t) => [...document.querySelectorAll(`[data-battle-team="${t}"] [data-move="1"]`)].map((b) => b.dataset.id), t);
      const force = await p.evaluate(async () => Object.fromEntries((await import('./battle-rounds.js')).battleObjects.map((o) => [o.id, o.force])));
      let t = 1.5;
      for (let guard = 0; guard < 12; guard++) {   // 버블 정렬 한 칸씩 — 카드가 미끄러지는 게 보이게
        const o = await order(A); const i = o.findIndex((id, k) => k && force[o[k - 1]] > force[id]); if (i < 0) break;
        await at(t); await tap(`[data-battle-team="${A}"] [data-move="-1"][data-id="${o[i]}"]`); fx('tick', 0, 0.7); t += 0.28;
      }
      const ob = await order(B); const bad = ob.findIndex((id, k) => k && force[ob[k - 1]] < force[id]);
      await at(2.1); fx('tick', 0, 0.7); await tap(`[data-battle-team="${B}"] [data-move="-1"][data-id="${ob[Math.max(1, bad)]}"]`);
      await at(Math.max(3.4, t + 0.2)); await tap(`[data-submit="${A}"]`); fx('tick'); await at(Math.max(3.7, t + 0.5)); await tap(`[data-submit="${B}"]`); fx('tick');
      await at(Math.max(4.2, t + 0.9)); await tap('[data-battle-answer]'); fx('tick'); fx('stamp', 0.3); fx('stamp', 0.5, 0.8); fx('sparkle', 1.15);
    },
    lines: [[0.3, 'h', '두 팀이 겨루는 <em>실험 배틀</em>']], vo: ['question-correct', 4.6, 1.4],   // "잘 확인했어요."
    talk: { h: 400, x: 'W-w-4', in: 3.6, moods: [[3.6, 'think']], mood: 'praise' } },
  { id: 'video', kind: 'ui', dur: 4.2, num: '11', kicker: '과학 이야기', url: 'student.html?page=9', real: true, setup: open,
    script: async (p, at) => { await at(0.2); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.currentTime = 6; v.play(); } }); },
    lines: [[0.3, 'h', '책 속에서 바로 <em>영상</em>으로']] },
  { id: 'modes', kind: 'ui', dur: 3.8, num: '12', kicker: '초·과·심 LIVE', url: 'start.html', real: true,
    script: async (p, at) => { for (const [i, s] of ['.card:nth-child(1)', '.card:nth-child(2)', '.card:nth-child(3)'].entries()) { await at(0.4 + i * 0.9); await p.hover(s).catch(() => {}); } },
    lines: [[0.3, 'h', '스스로 공부 · 가르치기 · <em>살아있는 책</em>']], sfx: [0.4, 1.3, 2.2].map((t) => [t, 'tick', 0.6]) },
  { id: 'end', kind: 'card', dur: 5.2, tag: '초등과학심화, 이제 살아 움직인다', small: '대치 MSG 영재교육 · 스스로 공부 · 가르치기 · 살아있는 책 · A4 인쇄', logo: true, sfx: [[0, 'impact', 0.8], [0.5, 'sparkle']],
    vo: ['promo/p16-end', 0.6, 2.0], talk: { h: 640, x: 1400, in: 0.15, moods: [[3.9, 'praise']], mood: 'praise' } },   // "초등 과학 심화가 이제 살아 움직여요." → 톡, 한 번 더 톡
];
const XF = 0.4;
const NUMBERED = cuts.filter((c) => c.num).length;

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

// ── 말하는 우루사쌤 ── 승인된 전신 표정(expressions-full)을 talker.py로 통째로 바꿔 끼운다(얼굴을 그리지 않는다).
// 컷의 vo = [클립, 컷 안 시작 초, 자를 길이]. 믹스와 입 모양이 같은 소리를 쓰도록 자른 wav 한 개를 둘 다에 넣는다.
const voWav = (id, len) => {
  const f = join(W, 'vo', `${id.replace(/\W+/g, '_')}${len ? `-${len}` : ''}.wav`); mkdirSync(dirname(f), { recursive: true });
  if (!existsSync(f)) ff(['-i', join(VO, `${id}.mp3`), ...(len ? ['-t', String(len)] : []), '-c:a', 'pcm_s16le', f]);
  return f;
};
// 소리가 실제로 나는 구간(앞뒤 무음 제외, 파일 안 초)
const speechSpan = (f) => {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-i', f, '-af', 'silencedetect=n=-35dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const num = (re) => [...r.matchAll(re)].map((m) => +m[1]);
  const st = num(/silence_start: ([\d.]+)/g), en = num(/silence_end: ([\d.]+)/g);
  const dur = (/Duration: (\d+):(\d+):([\d.]+)/.exec(r) || [0, 0, 0, 0]).slice(1).reduce((a, x) => a * 60 + +x, 0);
  const a = st[0] === 0 ? en[0] || 0 : 0;
  const b = st.length && st.at(-1) > a && (en.length < st.length || en.at(-1) >= dur - 0.05) ? st.at(-1) : dur;
  return [a, b];
};
// 캐릭터 트랙(30fps PNG). talk = { h, x, in, mood, moods:[[초, 표정]] }
//  · 말하는 동안(음성 구간)은 입이 움직이는 판, 말하기 전·후는 moods에 적은 표정이 그 시각부터(흠칫·톡이 그 시각에 맞춰) 나온다.
//  · moods가 안 걸리는 곳은 mood(말한 뒤의 표정, praise면 말 끝나고 톡).
const talkTrack = (c, d) => {
  const T = c.talk, N = Math.round(c.dur * 30), run = (name, lead, voice, mood) => {
    const o = join(d, `talk-${name}`);
    const r = spawnSync('python3', [join(HERE, 'talker.py'), o, String(c.dur), String(lead), voice, mood, String(T.h)], { encoding: 'utf8' });
    if (r.status) throw new Error('talker.py: ' + r.stderr.slice(-1500));
    console.log('  ' + r.stdout.trim()); return o;
  };
  const voice = c.vo ? voWav(c.vo[0], c.vo[2]) : null;
  const [sa, sb] = voice ? speechSpan(voice) : [0, 0], on = voice ? c.vo[1] + sa : Infinity, off = voice ? c.vo[1] + sb : Infinity;
  const main = run('main', voice ? c.vo[1] : 0, voice || '-', T.mood || 'listen');
  const segs = (T.moods || []).map(([t0, mood], k) => ({ t0, f0: Math.round(t0 * 30), dir: run(`s${k}`, 0, '-', mood) }));
  const fin = join(d, 'talk'); rmSync(fin, { recursive: true, force: true }); mkdirSync(fin);
  const name = (k) => `${String(k).padStart(5, '0')}.png`;
  for (let i = 0; i < N; i++) {
    const t = i / 30, seg = t >= on && t < off ? null : segs.filter((s) => s.t0 <= t && !(s.t0 < on && t >= on)).at(-1);
    copyFileSync(seg ? join(seg.dir, name(i - seg.f0)) : join(main, name(i)), join(fin, name(i)));
  }
  for (const x of [main, ...segs.map((s) => s.dir)]) rmSync(x, { recursive: true, force: true });
  return ['-framerate', '30', '-i', join(fin, '%05d.png')];
};
// 캐릭터를 화면에 얹는다: 어두운 바탕에서도 보이게 옅은 빛 테두리 + 발은 화면 아래 끝, in 초에 살짝 올라오며 나타난다
const charFx = (c, idx, last, outL) => {
  const T = c.talk, t0 = T.in ?? 0, pos = `x=${T.x}:y='H-h+40*max(0\\,1-(t-${t0})/0.35)':enable='gte(t,${t0})':eof_action=repeat`;
  return `;[${idx}:v]format=rgba,split[ca0][cb0];[cb0]lutrgb=r=230:g=255:b=238,format=gbrap,boxblur=luma_radius=16:luma_power=2:alpha_radius=16:alpha_power=2,colorchannelmixer=aa=0.5,fade=t=in:st=${t0}:d=0.3:alpha=1[cgl];[ca0]fade=t=in:st=${t0}:d=0.3:alpha=1[cch]`
    + `;[${last}][cgl]overlay=${pos}[cw0];[cw0][cch]overlay=${pos}[${outL}]`;
};

for (const c of cuts) {
  if (only.length && !only.includes(c.id)) continue;
  const d = join(W, c.id); mkdirSync(d, { recursive: true }); const out = join(d, 'cut.mp4');
  if (assemble && existsSync(out)) continue;   // --assemble: 만들어 둔 컷으로 이어 붙이기·소리만 다시
  if (c.kind === 'hook') {
    for (const [i, [, html]] of c.steps.entries()) await shot({ mode: 'rhook', html }, join(d, `h${i}.png`), false);
    const ins = c.steps.flatMap((_, i) => ['-loop', '1', '-t', String(c.dur), '-i', join(d, `h${i}.png`)]);
    let fc = `color=c=0x07120c:s=1920x1080:d=${c.dur}[bg]`; let last = 'bg';
    c.steps.forEach(([t0], i) => { fc += `;[${i}:v]format=rgba,fade=t=in:st=${t0}:d=0.45:alpha=1[s${i}];[${last}][s${i}]overlay=0:0:enable='gte(t,${t0})'[o${i}]`; last = `o${i}`; });
    ff([...ins, '-filter_complex', fc + `;[${last}]format=yuv420p[vo]`, '-map', '[vo]', '-t', String(c.dur), '-r', '30', '-c:v', 'libx264', '-crf', '17', out]);
  } else if (c.kind === 'card') {
    await shot({ mode: 'rcard', tag: c.tag, small: c.small, logo: c.logo }, join(d, 'card.png'), false);
    // 살짝 다가오는 카메라(1.0 → 1.05)
    const chIn = c.talk ? talkTrack(c, d) : [];
    let fc = `[0:v]scale=2016:1134,zoompan=z='1+0.05*on/(${c.dur}*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[cz]`, last = 'cz';
    if (c.talk) { fc += charFx(c, 1, last, 'czc'); last = 'czc'; }
    ff(['-framerate', '30', '-loop', '1', '-t', String(c.dur), '-i', join(d, 'card.png'), ...chIn, '-filter_complex', fc + `;[${last}]format=yuv420p[vo]`, '-map', '[vo]', '-t', String(c.dur), '-r', '30', '-c:v', 'libx264', '-crf', '17', out]);
  } else {
    const take = join(d, 'take.mp4');
    if (retake || !existsSync(take)) {
      const t0 = Date.now(); const is3d = c.kind === '3d';
      let now = 0; const ev = [];   // 녹화 중 실제 동작 시각에 맞춘 효과음 기록(배틀처럼 시각이 그때그때 정해지는 컷)
      const script = c.script && ((p, at) => c.script(p, async (s) => { now = s; await at(s); }, (k, dt = 0, g = 1) => ev.push([+(now + dt).toFixed(3), k, g])));
      const opts = { url: APP + c.url, seconds: c.dur + 0.3, setup: c.setup, script, out: take, css: is3d ? FULL3D : (c.css || ''), width: is3d ? 960 : 1920, height: 1080, dpr: c.zoom ? 2 : 1 };
      const r = c.real ? await recordTake(b, { ...opts, width: 1920, height: 1080 }) : await vtake(b, opts);
      if (ev.length) writeFileSync(join(d, 'sfx.json'), JSON.stringify(ev));
      console.log(`  녹화 ${c.id}: ${r.frames}장 · ${((Date.now() - t0) / 1000).toFixed(0)}초`, r.errs?.length ? r.errs : '');
    }
    const lines = c.lines || []; const pngs = [];
    for (const [i, [t0, cls, html]] of lines.entries()) {
      const f = join(d, `l${i}.png`); pngs.push([f, t0]);
      if (c.kind === '3d') await shot({ mode: 'rline', cls, html, y: { k: 300, h: 360, s: 760 }[cls] }, f);
      else await shot({ mode: 'rcapt', cls, html }, f);
    }
    const base = join(d, 'base.png');
    if (c.kind === '3d') await shot({ mode: 'rbg', kicker: c.kicker, num: `${c.num} / ${NUMBERED}` }, base, false);
    else await shot({ mode: 'rcapbg', kicker: c.kicker, num: `${c.num} / ${NUMBERED}` }, base);
    const ins = ['-loop', '1', '-t', String(c.dur), '-i', base, '-i', take, ...pngs.flatMap(([f]) => ['-loop', '1', '-t', String(c.dur), '-i', f]), ...(c.talk ? talkTrack(c, d) : [])];
    let fc;
    if (c.kind === '3d') fc = `[1:v]scale=960:1080,setpts=PTS-STARTPTS[tk];[0:v][tk]overlay=0:0[b0]`;
    // 화면 녹화 컷: 천천히 다가가는 카메라 + 아래 그라데이션·자막
    else if (!c.zoom) fc = `[1:v]scale=2016:1134,zoompan=z='1+0.06*on/(${c.dur}*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[tk];[tk][0:v]overlay=0:0[b0]`;
    // zoom: [가로 비율, 세로 비율, 배율, 시작 초, 끝 초] — 그 지점으로 부드럽게 다가간다(2배 해상도 녹화라 글자가 선명)
    else { const [cx, cy, Z, t0, t1] = c.zoom, e = `(clip((on/30-${t0})/${t1 - t0},0,1)*clip((on/30-${t0})/${t1 - t0},0,1)*(3-2*clip((on/30-${t0})/${t1 - t0},0,1)))`;
      fc = `[1:v]scale=4032:2268,zoompan=z='1+0.04*on/(${c.dur}*30)+${Z - 1}*${e}':x='clip(iw/2+(${cx}-0.5)*iw*${e}-iw/zoom/2,0,iw-iw/zoom)':y='clip(ih/2+(${cy}-0.5)*ih*${e}-ih/zoom/2,0,ih-ih/zoom)':d=1:s=1920x1080:fps=30[tk];[tk][0:v]overlay=0:0[b0]`; }
    let last = 'b0';
    pngs.forEach(([, t0], i) => { fc += `;[${i + 2}:v]format=rgba,fade=t=in:st=${t0}:d=0.35:alpha=1[t${i}];[${last}][t${i}]overlay=${ovX(t0)}[o${i}]`; last = `o${i}`; });
    if (c.talk) { fc += charFx(c, pngs.length + 2, last, 'oc'); last = 'oc'; }   // 우루사쌤은 맨 위(자막과 안 겹치는 자리에 둔다)
    ff([...ins, '-filter_complex', fc + `;[${last}]format=yuv420p[vo]`, '-map', '[vo]', '-t', String(c.dur), '-r', '30', '-c:v', 'libx264', '-crf', '17', out]);
  }
  console.log(`컷 ${c.id} ${c.dur}s`);
}
await b.close();
if (only.length) { console.log('일부 컷만 만들었어요.'); process.exit(0); }

// 이어 붙이기: 훅→브랜드는 음악 드롭에 맞춰 짧게, 나머지는 0.4초 교차
const ins = cuts.flatMap((c) => ['-i', join(W, c.id, 'cut.mp4')]);
let fc = '[0:v]settb=AVTB,setsar=1,fps=30,format=yuv420p[n0]', last = 'n0', off = 0; const starts = [0];
for (let i = 1; i < cuts.length; i++) {
  const x = i === 1 ? 0.15 : XF, kind = i === 1 ? 'fadewhite' : ['smoothleft', 'fade', 'slideleft', 'fade'][i % 4];
  off += cuts[i - 1].dur - x; starts.push(off);
  fc += `${fc ? ';' : ''}[${i}:v]settb=AVTB,setsar=1,fps=30,format=yuv420p[n${i}];[${last}][n${i}]xfade=transition=${kind}:duration=${x}:offset=${off.toFixed(3)}[x${i}]`; last = `x${i}`;
}
const TOTAL = off + cuts.at(-1).dur;
// 소리: 음악(드롭 = 브랜드 카드 시작) + 우루사쌤 목소리 몇 마디(나올 때 음악을 살짝 낮춤)
const MUSIC = join(W, 'music.wav');
spawnSync('python3', [join(HERE, 'music.py'), MUSIC, String(TOTAL.toFixed(2)), String(starts[1].toFixed(2))], { stdio: 'inherit' });
// 효과음: 컷마다 적어 둔 것 + 녹화 때 기록한 것 + 장면 전환 휙 + 큰 자막 들어올 때 톡
const events = [];
cuts.forEach((c, i) => {
  const rec = join(W, c.id, 'sfx.json');
  for (const [t, k, g = 1] of [...(c.sfx || []), ...(existsSync(rec) ? JSON.parse(readFileSync(rec, 'utf8')) : [])]) events.push([starts[i] + t, k, g]);
  for (const [t0, cls] of c.lines || []) if (cls === 'h') events.push([starts[i] + t0, 'pop', 0.7]);
  if (i >= 2) events.push([starts[i] - 0.12, 'whoosh', 0.8]);
});
const SFX = join(W, 'sfx.wav'), EV = join(W, 'sfx-events.json');
writeFileSync(EV, JSON.stringify(events));
spawnSync('python3', [join(HERE, 'sfx.py'), SFX, String(TOTAL.toFixed(2)), EV], { stdio: 'inherit' });
// 목소리: 컷의 vo(브랜드 인사·오류·배틀·마지막 장). 캐릭터 입 모양(talker)과 같은 자른 wav를 그대로 쓴다.
const vos = []; cuts.forEach((c, i) => { if (c.vo) vos.push([voWav(c.vo[0], c.vo[2]), starts[i] + c.vo[1]]); });
const aIns = ['-i', MUSIC, ...vos.flatMap(([f]) => ['-i', f]), '-i', SFX];
let afc = '';
vos.forEach(([, t], i) => { afc += `[${cuts.length + 1 + i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=1.6,adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[v${i}];`; });
afc += `${vos.map((_, i) => `[v${i}]`).join('')}amix=inputs=${vos.length}:normalize=0,apad=whole_dur=${TOTAL.toFixed(2)}[vox];[vox]asplit[vx1][vx2];[${cuts.length}:a]volume=0.38[mus];[mus][vx1]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[duck];[${cuts.length + 1 + vos.length}:a]volume=0.65[fx];[duck][vx2][fx]amix=inputs=3:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11[ao]`;
const FINAL = join(OUT, 'chogwasim-live-showreel.mp4');
ff([...ins, ...aIns, '-filter_complex', `${fc};[${last}]format=yuv420p[vo];${afc}`, '-map', '[vo]', '-map', '[ao]', '-t', TOTAL.toFixed(2), '-r', '30', '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', FINAL]);
ff(['-ss', String((starts[2] + 1.6).toFixed(2)), '-i', FINAL, '-frames:v', '1', '-q:v', '2', join(OUT, 'chogwasim-live-showreel-poster.jpg')]);
writeFileSync(join(W, 'timeline.json'), JSON.stringify(cuts.map((c, i) => ({ id: c.id, start: +starts[i].toFixed(2), dur: c.dur })), null, 1));
console.log(`쇼릴 완성: ${FINAL} · ${TOTAL.toFixed(1)}초`);
