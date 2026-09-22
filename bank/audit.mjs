// 과학 문제은행 감사: node science-lab/bank/audit.mjs
// 검사: id 중복 · 필수 태그(grade·level·track) · 객관식 정답 위치 분포 · 정답이 유일한 최장 보기 · 학년에 이른 용어
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const unitsDir = join(here, '..', 'data', 'units');
// 학년별로 아직 배우지 않은 용어(본문 금지, answerContract.rubric.preview 안에서만 허용)
const EARLY_TERMS = {
  3: ['자기장', '자기력선', '전자석', '전류', '코일', '자화', '원자', '분자', '에너지 전환'],
  4: ['자기장', '자기력선', '전자석', '전류', '코일', '자화', '원자', '분자', '에너지 전환'],
  5: ['자기장', '자기력선', '전자석', '코일', '원자', '분자'],
  6: ['자기력선', '원자', '분자'],
};
const LEVELS = new Set(['기본', '심화', '영재']);
const TRACKS = new Set(['교과', '영재성']);

let fail = 0;
const err = (m) => { fail++; console.log('  ✗ ' + m); };
for (const f of readdirSync(unitsDir).filter((x) => x.endsWith('.js') && !/\.(lesson|similar|taxonomy)\.js$/.test(x))) {
  const { unit, items } = await import(pathToFileURL(join(unitsDir, f)).href);
  console.log(`${unit.id} ${unit.title}: ${items.length}문항`);
  const ids = new Set();
  const pos = [0, 0, 0, 0, 0];
  for (const it of items) {
    const t = it.taxonomy || {};
    if (ids.has(it.id)) err(`${it.id} id 중복`); ids.add(it.id);
    if (it.status !== 'authored') err(`${it.id} git에는 authored만 (status=${it.status})`);
    if (!t.grade) err(`${it.id} grade 없음`);
    if (!LEVELS.has(t.level)) err(`${it.id} level=${t.level}`);
    if (!TRACKS.has(t.track)) err(`${it.id} track=${t.track}`);
    const body = [it.prompt, JSON.stringify(it.givens ?? ''), JSON.stringify(it.choices ?? ''), it.explanation,
      it.answerContract?.sample ?? '', JSON.stringify(it.answerContract?.blanks ?? '')].join(' ');
    for (const w of EARLY_TERMS[t.grade] ?? []) if (body.includes(w)) err(`${it.id} ${t.grade}학년에 이른 용어 "${w}"`);
    if (it.answerContract?.type === 'single-choice') {
      const a = it.answerContract.answer, L = it.choices.map((c) => c.length);
      pos[a]++;
      if (L[a] === Math.max(...L) && L.filter((x) => x === L[a]).length === 1 && Math.max(...L) - [...L].sort((x, y) => y - x)[1] >= 3)
        err(`${it.id} 정답이 눈에 띄게 가장 긴 보기`);
    }
  }
  const sc = pos.reduce((a, b) => a + b, 0);
  console.log(`  객관식 ${sc}개 정답 위치 ①~⑤ = ${pos.join('·')}`);
  if (sc >= 5 && Math.max(...pos) - Math.min(...pos) > 2) err('정답 위치 쏠림');
  const cnt = (k) => items.reduce((m, i) => ((m[i.taxonomy[k]] = (m[i.taxonomy[k]] || 0) + 1), m), {});
  console.log('  수준', JSON.stringify(cnt('level')), '갈래', JSON.stringify(cnt('track')));
}
// 유사문항: <단원>.similar.js + <단원>.taxonomy.js
for (const f of readdirSync(unitsDir).filter((x) => x.endsWith('.similar.js'))) {
  const u = f.replace('.similar.js', '');
  const { similar } = await import(pathToFileURL(join(unitsDir, f)).href);
  const { taxonomy: tx } = await import(pathToFileURL(join(unitsDir, `${u}.taxonomy.js`)).href);
  const types = new Set(tx.types.map((t) => t.id)), els = new Set(tx.elements.map((e) => e.id));
  console.log(`${u} 유사문항: ${similar.length}개`);
  const seen = new Set(), pos = [0, 0, 0, 0, 0], perType = {};
  for (const it of similar) {
    const t = it.taxonomy;
    if (seen.has(it.id)) err(`${it.id} id 중복`); seen.add(it.id);
    if (it.status !== 'authored') err(`${it.id} authored 아님`);
    if (!types.has(t.type) || !els.has(t.element)) err(`${it.id} 분류 없음 ${t.element}/${t.type}`);
    const key = `${it.sourceRef.of.set}-${it.sourceRef.of.no}`;
    if (!tx.sources[key] || tx.sources[key][0] !== t.type) err(`${it.id} 원문 ${key}와 유형 불일치`);
    perType[t.type] = (perType[t.type] || 0) + 1;
    const body = JSON.stringify([it.prompt, it.givens, it.choices, it.explanation, it.answerContract]);
    for (const w of EARLY_TERMS[t.grade] ?? []) if (body.includes(w)) err(`${it.id} ${t.grade}학년에 이른 용어 "${w}"`);
    if (it.answerContract.type === 'single-choice') {
      const a = it.answerContract.answer, L = it.choices.map((c) => c.length), so = [...L].sort((x, y) => y - x);
      pos[a]++; if (so[0] >= 12 && L[a] === so[0] && so[0] - so[1] >= 3) err(`${it.id} 정답이 눈에 띄게 가장 긴 보기`);
    }
  }
  const missing = Object.keys(tx.sources).filter((k) => !similar.some((it) => `${it.sourceRef.of.set}-${it.sourceRef.of.no}` === k));
  if (missing.length) err(`유사문항 없는 원문: ${missing.join(', ')}`);
  console.log(`  단일 선택 정답 위치 ①~⑤ = ${pos.join('·')}`);
  if (Math.max(...pos) - Math.min(...pos) > 2) err('유사문항 정답 위치 쏠림');
  console.log('  유형별', JSON.stringify(perType));
  for (const [id, ty] of Object.entries(tx.authored || {})) if (!types.has(ty)) err(`창작 ${id} 유형 ${ty} 없음`);
}
// 공개 산출물(bank/taxonomy/*.json)이 앱이 쓰는 *.taxonomy.js와 어긋나지 않는지.
// 어긋나면 교재 차례와 문항 태그가 조용히 갈라진다.
{
  const { execFileSync } = await import('node:child_process');
  try {
    const out = execFileSync(process.execPath, [join(here, 'taxonomy', 'build.mjs'), '--check'], { encoding: 'utf8' });
    process.stdout.write(out);
  } catch (e) {
    process.stdout.write(e.stdout || '');
    err('분류 체계 JSON이 원본과 다름 — node bank/taxonomy/build.mjs 로 다시 만들 것');
  }
}
console.log(fail ? `실패 ${fail}건` : '통과');
process.exit(fail ? 1 : 0);
