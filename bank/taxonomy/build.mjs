// data/units/<단원>.taxonomy.js(앱이 쓰는 원본) → bank/taxonomy/<단원>.json(공개 산출물)
// 두 파일이 어긋나면 교재 차례와 문항 태그가 조용히 갈라지므로, 여기서 한 번에 만든다.
// 쓰기: node bank/taxonomy/build.mjs [--check]
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// data/units/*.taxonomy.js가 있는 단원 전부 — 단원이 늘어도 고칠 것이 없게.
const unitsDir = join(here, '..', '..', 'data', 'units');
const UNITS = readdirSync(unitsDir).filter((f) => f.endsWith('.taxonomy.js')).map((f) => f.replace('.taxonomy.js', '')).sort();
const NOTE = '성취기준 문장은 교육부 고시 제2022-33호 [별책 9] 과학과 원문과 아직 대조하지 못했다. '
  + '코드만 두고 text는 null·verified:false로 남긴다(추측 금지). 원문을 확인하면 text를 채우고 verified를 true로 바꾼다.';

let diff = 0;
for (const unit of UNITS) {
  const src = join(here, '..', '..', 'data', 'units', `${unit}.taxonomy.js`);
  const { taxonomy: t } = await import(pathToFileURL(src).href);
  const { similar } = await import(pathToFileURL(join(here, '..', '..', 'data', 'units', `${unit}.similar.js`)).href);

  const bySrc = Object.entries(t.sources);                       // '세트-번호' → [유형, 형식]
  const count = (id) => bySrc.filter(([, v]) => v[0] === id).length;
  const srcOf = (id) => bySrc.filter(([, v]) => v[0] === id).map(([k]) => k);
  const fmtCount = {};
  for (const [, [, f]] of bySrc) fmtCount[f] = (fmtCount[f] || 0) + 1;
  const simCount = (id) => similar.filter((s) => s.taxonomy.type === id).length;

  const out = {
    unit: t.unit, curriculum: t.curriculum, grade: t.grade, semester: t.semester, title: t.title, area: t.area,
    standards: t.standards.map((s) => ({ code: s.code, text: s.text ?? null, verified: Boolean(s.text) })),
    standardsNote: NOTE,
    elements: t.elements,
    types: t.types.map((x) => ({ ...x, sourceCount: count(x.id), similarCount: simCount(x.id), source: srcOf(x.id) })),
    formats: t.formats,
    formatCounts: fmtCount,
    sourceTotal: bySrc.length,
    note: 'data/units/' + unit + '.taxonomy.js에서 만든 파일이다(bank/taxonomy/build.mjs). 직접 고치지 말고 원본을 고친 뒤 다시 만든다. '
      + 'types[].source는 원문의 세트·번호만 담는다 — 원문 문장은 Supabase public.science_bank_source에만 있다.',
  };
  const json = JSON.stringify(out, null, 1) + '\n';
  const dest = join(here, `${unit}.json`);
  if (process.argv.includes('--check')) {
    const cur = existsSync(dest) ? readFileSync(dest, 'utf8') : '';
    if (cur !== json) { console.log(`  ✗ ${unit}.json이 ${unit}.taxonomy.js와 다름 — node bank/taxonomy/build.mjs 로 다시 만들 것`); diff++; }
    else console.log(`  ${unit}.json = ${unit}.taxonomy.js (유형 ${out.types.length} · 원문 ${out.sourceTotal})`);
  } else {
    writeFileSync(dest, json);
    console.log(`${unit}.json 씀 — 내용 요소 ${out.elements.length} · 유형 ${out.types.length} · 원문 ${out.sourceTotal} · 형식 ${JSON.stringify(fmtCount)}`);
  }
}
process.exit(diff ? 1 : 0);
