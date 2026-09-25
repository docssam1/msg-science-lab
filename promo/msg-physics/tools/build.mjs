// MSG 소개 영상 만들기: node promo/msg-physics/tools/build.mjs [--retake] [--only id,id] [--assemble]
// --assemble: 만들어 둔 장면으로 이어 붙이기·음악만 다시
// 전제: 저장소 루트에서 python3 -m http.server 8790 이 떠 있을 것(앱·틀 모두 이 주소로 연다).
// 1) 장면별 PNG(배경·제목·캐릭터·자막) 2) 실제 앱 녹화(takes.js) 3) ffmpeg 합성 4) 이어 붙이기 + SRT + 포스터
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenes as introScenes, demoScenes, BRAND } from '../storyboard.js';
import { takes } from './takes.js';
import { recordTake } from './take.mjs';
import { vtake } from './vtake.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), OUT = join(HERE, '..'), WORK = join(OUT, 'work');
const ROOT = 'http://127.0.0.1:8790/', AUDIO = join(HERE, '../../../sample-v2/audio');
const args = process.argv.slice(2), retake = args.includes('--retake'), assemble = args.includes('--assemble'), only = (args[args.indexOf('--only') + 1] || '').split(',').filter((x) => args.includes('--only') && x);
mkdirSync(WORK, { recursive: true });
const scenes = args.includes('--demo') ? demoScenes : introScenes;
const lib = JSON.parse(readFileSync(join(AUDIO, 'voice-library.json'), 'utf8')).clips;
// 소개 내레이션(voice-promo.json): 원장 PC에서 만든 mp3가 sample-v2/audio/promo/<id>.mp3 에 있으면 그것을, 없으면 초안(무음, 글자 수로 길이 추정)
const PROMO = JSON.parse(readFileSync(join(OUT, 'voice-promo.json'), 'utf8'));
const probe = (f) => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout.trim();
let drafts = 0;
function clipOf(id) {
  if (lib[id]) return { ...lib[id], file: join(AUDIO, lib[id].path.replace('./audio/', '')) };
  const l = PROMO.lines.find((x) => x.id === id); if (!l) throw new Error(`클립 없음: ${id}`);
  const f = join(AUDIO, 'promo', `${id}.mp3`);
  if (existsSync(f)) return { text: l.text, seconds: probe(f), file: f };
  drafts++; return { text: l.text, seconds: Math.max(3, l.text.replace(/\s/g, '').length * 0.155), file: null };
}
const LEAD = 0.5, TAIL = 0.8;
const VIDEO_SCENES = new Set(['story', 'media']);
const ff = (a) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { encoding: 'utf8', maxBuffer: 1 << 26 }); if (r.status) throw new Error(r.stderr.slice(-2000)); };

// 자막: 문장 단위, 길면 쉼표·띄어쓰기에서 나눈다. 시간은 글자 수 비례.
function chunks(text) {
  const out = [];
  for (let s of text.replace(/\s+/g, ' ').trim().split(/(?<=[.?!])\s+/)) {
    while (s.length > 46) { let k = s.lastIndexOf(', ', 42); if (k < 12) k = s.lastIndexOf(' ', 42); if (k < 12) k = 42; out.push(s.slice(0, k + 1).trim()); s = s.slice(k + 1).trim(); }
    if (s) out.push(s);
  }
  return out;
}

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const shot = async (q, file) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`${ROOT}promo/msg-physics/tools/frame.html#${encodeURIComponent(JSON.stringify(q))}`);
  await p.waitForFunction(() => document.title === 'ready'); await p.waitForTimeout(300);
  await p.screenshot({ path: file, omitBackground: q.mode === 'chrome' || q.mode === 'bubble' }); await p.close();
};
// 둥근 모서리 가림판
const MASK = join(WORK, 'mask.png');
if (!existsSync(MASK)) spawnSync('python3', ['-c', `from PIL import Image,ImageDraw\nm=Image.new('L',(1440,810),0);ImageDraw.Draw(m).rounded_rectangle((0,0,1439,809),26,fill=255);m.save('${MASK}')`]);

const srt = [], parts = [], sceneDur = []; let T = 0;
const ts = (s) => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${x.toFixed(3).padStart(6, '0').replace('.', ',')}`; };
for (const [n, s] of scenes.entries()) {
  const clip = clipOf(s.clip);
  const dur = +(LEAD + clip.seconds + TAIL + (s.hold || 0)).toFixed(2), dir = join(WORK, s.id); mkdirSync(dir, { recursive: true });
  const cs = chunks(clip.text), total = cs.reduce((a, c) => a + c.length, 0); let t = LEAD;
  const subs = cs.map((c) => { const d = clip.seconds * c.length / total, r = { text: c, a: t, b: t + d }; t += d; return r; });
  subs.forEach((x) => srt.push({ a: T + x.a, b: T + x.b, text: x.text }));
  const out = join(dir, 'scene.mp4');
  if ((!only.length || only.includes(s.id)) && !(assemble && existsSync(out))) {
    for (const [i, x] of subs.entries()) await shot({ mode: 'bubble', text: x.text }, join(dir, `sub${i}.png`));
    // 말하는 우루사쌤: 승인된 표정 그림을 소리에 맞춰 바꿔 끼운다(talker.py). 장면 표정 = s.mood
    const TALK = join(dir, 'talk');
    spawnSync('python3', [join(HERE, 'talker.py'), TALK, String(dur), String(LEAD), clip.file || '-', s.mood || 'listen', '330'], { stdio: 'inherit' });
    const talkIn = ['-framerate', '30', '-i', join(TALK, '%05d.png')];
    const audioIn = clip.file ? ['-i', clip.file] : ['-f', 'lavfi', '-t', String(dur), '-i', 'anullsrc=r=48000:cl=stereo'];
    const subIn = subs.flatMap((x, i) => ['-loop', '1', '-t', String(dur), '-i', join(dir, `sub${i}.png`)]);
    let fc, ins;
    if (s.view === 'slide' || s.view === 'deck') {
      await shot({ mode: s.view, ...s, noChar: true }, join(dir, 'slide.png'));
      ins = ['-loop', '1', '-t', String(dur), '-i', join(dir, 'slide.png'), ...subIn, ...audioIn, ...talkIn];
      fc = '[0:v]format=rgba[v0]'; subs.forEach((x, i) => { fc += `;[v${i}][${i + 1}:v]overlay=0:0:enable='between(t,${x.a.toFixed(2)},${(i + 1 < subs.length ? subs[i + 1].a : dur).toFixed(2)})'[v${i + 1}]`; });
      fc += `;[v${subs.length}][${subs.length + 2}:v]overlay=4:H-h:eof_action=repeat[vc];[vc]format=yuv420p[vo];[${subs.length + 1}:a]adelay=${LEAD * 1000}|${LEAD * 1000},apad,atrim=0:${dur}[ao]`;
    } else {
      await shot({ mode: 'bg', n: `${n}/${scenes.length - 1}`, chip: BRAND.chip }, join(dir, 'bg.png'));
      await shot({ mode: 'chrome', ...s, noChar: true }, join(dir, 'chrome.png'));
      const take = join(WORK, `${s.id}.take.mp4`);
      if (retake || !existsSync(take)) {
        const T0 = takes[s.id] || {};
        // 가상 시계로 한 장씩(느린 컴퓨터에서도 매끈한 30fps). 대본 속 waitForTimeout도 가상 시간으로 흘려 애니메이션이 제대로 진행되게 한다.
        // 영상(<video>)을 트는 장면은 가상 시계가 못 움직이므로 실시간 녹화.
        const rec = VIDEO_SCENES.has(s.id) || T0.real ? recordTake : (br, o) => vtake(br, { ...o, script: o.script && ((p, at) => { let now = 0; const at2 = async (x) => { now = Math.max(now, x); await at(now); };
          const pp = new Proxy(p, { get: (t, k) => (k === 'waitForTimeout' ? (ms) => at2(now + ms / 1000) : typeof t[k] === 'function' ? t[k].bind(t) : t[k]) });
          return o.script(pp, at2); }) });
        const r = await rec(b, { url: ROOT + 'sample-v2/' + s.url, seconds: dur, out: take, width: 1600, height: 900, setup: T0.setup, focusSel: T0.focus?.sel, script: T0.script || (async (p, at) => { for (const [sec, a] of s.acts || []) { await at(sec); if (a.click) await p.click(a.click).catch(() => {}); } }) });
        console.log(`  녹화 ${s.id}: ${r.frames}프레임 (${(r.fps || 0).toFixed(1)}fps)`, r.errs.length ? r.errs : '');
        if (r.rect) writeFileSync(take + '.rect.json', JSON.stringify(r.rect));
      }
      let z = takes[s.id]?.zoom;
      const F = takes[s.id]?.focus;   // {sel, from, to, pad} → 녹화 때 잰 요소 영역을 16:9로 넓혀 확대
      if (!z && F && existsSync(take + '.rect.json')) { let [x, y, w, h] = JSON.parse(readFileSync(take + '.rect.json', 'utf8')); const pad = F.pad ?? 40; x -= pad; y -= pad; w += pad * 2; h += pad * 2;
        if (w / h < 16 / 9) { const nw = h * 16 / 9; x -= (nw - w) / 2; w = nw; } else { const nh = w * 9 / 16; y -= (nh - h) / 2; h = nh; }
        w = Math.min(1600, Math.max(480, w)); h = w * 9 / 16; x = Math.max(0, Math.min(1600 - w, x)); y = Math.max(0, Math.min(900 - h, y)); z = [F.from, F.to, Math.round(x), Math.round(y), Math.round(w), Math.round(h)]; }   // [시작초, 끝초, x, y, w, h] — 1600×900 녹화 좌표에서 이 영역으로 서서히 확대
      const crop = z ? `crop=w='if(lt(t,${z[0]}),1600,if(lt(t,${z[1]}),1600-(1600-${z[4]})*(t-${z[0]})/(${z[1]}-${z[0]}),${z[4]}))':h='ow*9/16':x='if(lt(t,${z[0]}),0,if(lt(t,${z[1]}),${z[2]}*(t-${z[0]})/(${z[1]}-${z[0]}),${z[2]}))':y='if(lt(t,${z[0]}),0,if(lt(t,${z[1]}),${z[3]}*(t-${z[0]})/(${z[1]}-${z[0]}),${z[3]}))',` : '';
      ins = ['-loop', '1', '-t', String(dur), '-i', join(dir, 'bg.png'), '-i', take, '-loop', '1', '-i', MASK, '-loop', '1', '-t', String(dur), '-i', join(dir, 'chrome.png'), ...subIn, ...audioIn, ...talkIn];
      fc = `[1:v]${crop}scale=1440:810:flags=lanczos,format=rgba[tk];[2:v]format=gray[mk];[tk][mk]alphamerge[tkm];[0:v][tkm]overlay=420:112:shortest=0[b0];[b0][3:v]overlay=0:0[v0]`;
      subs.forEach((x, i) => { fc += `;[v${i}][${i + 4}:v]overlay=0:0:enable='between(t,${x.a.toFixed(2)},${(i + 1 < subs.length ? subs[i + 1].a : dur).toFixed(2)})'[v${i + 1}]`; });
      fc += `;[v${subs.length}][${subs.length + 5}:v]overlay=4:H-h:eof_action=repeat[vc];[vc]format=yuv420p[vo];[${subs.length + 4}:a]adelay=${LEAD * 1000}|${LEAD * 1000},apad,atrim=0:${dur}[ao]`;
    }
    ff([...ins, '-filter_complex', fc, '-map', '[vo]', '-map', '[ao]', '-t', String(dur), '-r', '30', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', out]);
    console.log(`장면 ${n + 1}/${scenes.length} ${s.id} ${dur}s`);
  }
  parts.push(out); sceneDur.push(dur); T += dur;
}
await b.close();
if (only.length) { console.log('일부 장면만 만들었어요(이어 붙이기 생략).'); process.exit(0); }
writeFileSync(join(WORK, 'parts.txt'), parts.map((p) => `file '${p}'`).join('\n'));
const FINAL = join(OUT, 'msg-physics-promo.mp4'), RAW = join(WORK, 'promo-raw.mp4');
ff(['-f', 'concat', '-safe', '0', '-i', join(WORK, 'parts.txt'), '-c', 'copy', RAW]);
// 소리: 우루사쌤 내레이션 + 잔잔한 배경음악(말할 때 더 낮아짐) + 장면이 바뀔 때 작은 '휙'
const MUS = join(WORK, 'promo-music.wav'), FX = join(WORK, 'promo-sfx.wav'), EVF = join(WORK, 'promo-sfx.json');
spawnSync('python3', [join(HERE, 'music.py'), MUS, T.toFixed(2), '0', 'soft'], { stdio: 'inherit' });
let acc = 0; const ev = []; scenes.forEach((s, i) => { if (i) ev.push([acc - 0.2, 'whoosh', 0.45]); acc += sceneDur[i]; });
ev.push([0, 'impact', 0.5]); ev.push([T - sceneDur.at(-1), 'sparkle', 0.7]);
writeFileSync(EVF, JSON.stringify(ev)); spawnSync('python3', [join(HERE, 'sfx.py'), FX, T.toFixed(2), EVF], { stdio: 'inherit' });
ff(['-i', RAW, '-i', MUS, '-i', FX, '-filter_complex',
  `[0:a]asplit[n1][n2];[1:a]volume=0.06[m];[m][n1]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=600[md];[2:a]volume=0.45[fx];[n2][md][fx]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[ao]`,
  '-map', '0:v', '-map', '[ao]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', FINAL]);
writeFileSync(join(OUT, 'msg-physics-promo.srt'), srt.map((x, i) => `${i + 1}\n${ts(x.a)} --> ${ts(x.b)}\n${x.text}\n`).join('\n'));
ff(['-ss', '2', '-i', join(WORK, scenes[0].id, 'scene.mp4'), '-frames:v', '1', '-q:v', '3', join(OUT, 'msg-physics-promo-poster.jpg')]);
console.log(`완성: ${FINAL} · ${T.toFixed(1)}초${drafts ? ` · 초안(음성 없는 장면 ${drafts}개 — 원장 PC에서 omnivoice-promo.cmd 실행 후 다시 build)` : ''}`);
