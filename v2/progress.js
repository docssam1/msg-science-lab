// 학습 기록 + 오개념 진단. 학생이 고른 오답 보기·잘못 쓴 답·뒤바꾼 표 칸을 오개념표(data/units/<u>.misc.js)로 읽어 기기에 쌓고,
// 같은 오개념이 서로 다른 문항에서 되풀이되면 '확정', 한 번이면 '의심', 그 뒤 두 번 연속 맞히면 '해소'로 판정한다.
const KEY = 'sciLab.log';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* 저장 불가 기기 */ } };

export function log(u) { return read()[u] || []; }
export function clearLog(u) { const a = read(); delete a[u]; write(a); }

// 문항 하나의 결과를 오개념으로 읽는다. detail: { picked, typed, cells, revealed }
export function classify(it, misc, ok, detail = {}) {
  if (ok) return { ok: true, m: [] };
  const ms = new Set();
  const D = misc?.distractors?.[it.id];
  if (D && detail.picked != null) for (const i of [].concat(detail.picked)) if (D[i]) ms.add(D[i]);
  const T = misc?.typed?.[it.id];
  if (T && detail.typed) { let hit = false; for (const [re, m] of T.pats || []) if (re.test(detail.typed)) { ms.add(m); hit = true; } if (!hit && T.any) ms.add(T.any); }
  const C = misc?.cloze?.[it.id];
  if (C && detail.wrongBlanks?.length) ms.add(C.wrong);
  const X = misc?.cells?.[it.id];
  if (X && detail.wrongCells) ms.add(X);
  if (detail.chip && misc?.bookChips?.[detail.chip]) ms.add(misc.bookChips[detail.chip][1]);
  return { ok: false, m: [...ms], kind: detail.revealed ? 'reveal' : ms.size ? 'mis' : 'slip' };
}

// 기록 한 줄: { id, stage, type, element, ok, m, kind, picked, typed, at }
export function record(u, it, stage, ok, detail, misc) {
  const c = classify(it, misc, ok, detail);
  const e = { id: it.id, stage, type: it.taxonomy?.type, element: it.taxonomy?.element, ok: c.ok, m: c.m, kind: c.kind,
    picked: detail?.picked ?? null, typed: detail?.typed ?? null, chip: detail?.chip ?? null, at: Date.now() };
  const a = read(); (a[u] = a[u] || []).push(e); if (a[u].length > 600) a[u] = a[u].slice(-600); write(a);
  return e;
}

// 어떤 문항이 오개념 M을 '확인하는' 문항인가(그 오개념이 오답 보기·오답 패턴·칩으로 들어 있음)
export function bearers(misc) {
  const B = {};
  const add = (m, id) => { (B[m] = B[m] || new Set()).add(id); };
  for (const [id, D] of Object.entries(misc.distractors || {})) for (const m of Object.values(D)) add(m, id);
  for (const [id, T] of Object.entries(misc.typed || {})) { if (T.any) add(T.any, id); for (const [, m] of T.pats || []) add(m, id); }
  for (const [id, C] of Object.entries(misc.cloze || {})) add(C.wrong, id);
  for (const [id, m] of Object.entries(misc.cells || {})) add(m, id);
  return B;
}

// 진단: 오개념마다 { status:'confirmed'|'suspected'|'resolved', wrong:[근거], streak } + 유형·소단원별 정답률
export function analyze(u, misc) {
  const L = log(u), B = bearers(misc), out = {};
  for (const m of Object.keys(misc.misconceptions || {})) {
    const bear = B[m] || new Set();
    const wrong = [], seenWrong = new Set(); let streak = 0, lastWrongAt = 0;
    for (const e of L) {
      if (!e.ok && e.m?.includes(m)) { if (!seenWrong.has(e.id)) { seenWrong.add(e.id); wrong.push(e); } streak = 0; lastWrongAt = e.at; }
      else if (e.ok && bear.has(e.id) && lastWrongAt) streak++;
    }
    if (!wrong.length) continue;
    const status = streak >= 2 ? 'resolved' : seenWrong.size >= 2 ? 'confirmed' : 'suspected';
    out[m] = { status, wrong, streak, last: lastWrongAt };
  }
  const acc = (key) => { const t = {}; for (const e of L) { const k = e[key]; if (!k) continue; t[k] = t[k] || { ok: 0, tot: 0 }; t[k].tot++; if (e.ok) t[k].ok++; } return t; };
  const slips = L.filter((e) => !e.ok && e.kind === 'slip').length, reveals = L.filter((e) => e.kind === 'reveal').length;
  return { mis: out, byType: acc('type'), byElement: acc('element'), total: L.length, right: L.filter((e) => e.ok).length, slips, reveals,
    order: Object.entries(out).sort((a, b) => rank(b[1]) - rank(a[1]) || b[1].wrong.length - a[1].wrong.length).map(([m]) => m) };
}
const rank = (r) => (r.status === 'confirmed' ? 3 : r.status === 'suspected' ? 2 : 1);

// 처방 문항: 오개념 M을 확인하는 문항 중 아직 안 풀었거나 틀린 것 먼저, 그다음 맞힌 것. n개.
export function remedyItems(u, m, misc, pool, n = 3) {
  const B = bearers(misc)[m] || new Set(), L = log(u), last = {};
  for (const e of L) last[e.id] = e.ok;
  const cand = pool.filter((it) => B.has(it.id) && it.answerContract.type !== 'written-explanation');
  const w = (it) => (last[it.id] === undefined ? 0 : last[it.id] === false ? 1 : 2);
  return cand.sort((a, b) => w(a) - w(b) || Math.random() - 0.5).slice(0, n);
}
