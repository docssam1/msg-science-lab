// 오개념 진단 + 유사문제 은행(처방) — 초·과·심 물리 1·2차시(용수철과 무게 재기)
// 규칙(과학 탐구 랩과 같다): 데일리 테스트 첫 시도의 오답이 가리키는 오개념을 기록한다.
//   · 서로 다른 문항 1개 = 의심, 2개 이상 = **확정** → 그 오개념의 유사문제를 처방한다.
//   · 처방 문제를 2개 맞히면 해소. 셀프 체크(학생이 스스로 O/X)는 진단에 넣지 않는다.
//   · 공식 해설 미확인 문항(2차시 9~11번 = b9·b10·b11)은 채점·진단 모두에서 뺀다.
// 유사문제는 원본 교재 문항을 옮기지 않은 창작 문항이다. 정답 보기는 오개념으로 연결하지 않는다.
export const ANSWER_KEY = 'dt-2026-09-26';
export const UNCONFIRMED = new Set(['b9', 'b10', 'b11']);

// 오개념: label = 학생에게 되묻는 말(답을 말하지 않음), fix = 풀고 난 뒤 보여 줄 교정, page = 다시 해 볼 실험 쪽
export const misconceptions = {
  M01: { concept: 'parts', label: '저울 부분의 이름과 하는 일이 헷갈렸나요?', fix: '물체는 <b>고리</b>에 매달고, 눈금은 <b>표시자</b>가 가리키는 곳을 읽어요. 손잡이는 잡거나 고정하는 곳, 영점조절나사는 0을 맞추는 곳이에요.', page: 1 },
  M02: { concept: 'zero', label: '물체를 매달기 전에 할 일을 건너뛰었나요?', fix: '물체를 매달기 <b>전에</b> 빈 저울의 표시자가 0인지 보고, 아니면 영점조절나사로 0에 맞춰요.', page: 5 },
  M03: { concept: 'eye', label: '보는 위치가 달라도 눈금이 똑같이 보일까요?', fix: '표시자와 <b>같은 높이</b>에서 읽어야 해요. 위나 아래에서 비스듬히 보면 실제와 다른 눈금이 보여요.', page: 6 },
  M04: { concept: 'stable', label: '표시자가 움직이는 동안 읽어도 될까요?', fix: '물체를 매달면 표시자가 흔들려요. <b>멈춘 뒤</b>에 읽어요.', page: 5 },
  M05: { concept: 'extend', label: '무게가 커지면 용수철은 어떻게 변할까요?', fix: '같은 용수철에서는 물체가 <b>무거울수록 더 많이</b> 늘어나요.', page: 12 },
  M06: { concept: 'origin', label: '‘늘어난 길이’와 ‘전체 길이’를 구별했나요?', fix: '늘어난 길이는 원래 길이에서 <b>더 늘어난 만큼</b>이라, 아무것도 매달지 않으면 0이에요. 그래서 그래프는 원점에서 시작해요.', page: 16 },
  M07: { concept: 'elastic', label: '힘을 빼면 원래 모양으로 돌아오는 것은 어떤 성질일까요?', fix: '힘을 없애면 원래 모양으로 돌아가려는 성질이 <b>탄성</b>이에요. 찰흙처럼 돌아오지 않는 것은 탄성이 거의 없어요.', page: 12 },
  M08: { concept: 'graph', label: '무게가 2배, 3배가 되면 늘어난 길이는요?', fix: '같은 용수철에서 추의 무게가 2배·3배가 되면 늘어난 길이도 <b>2배·3배</b>가 돼요(비례).', page: 16 },
  M09: { concept: 'data', label: '지금 문제의 표와 앞 실험의 표가 같은 자료인가요?', fix: '본문 실험(10·20·30 g → 3·6·9 cm)과 이 문제의 표(10·20·30 g → 4·8·12 cm)는 <b>다른 용수철</b>의 자료예요. 문제에 주어진 표를 써요.', page: 16 },
};

// 데일리 테스트 오답 → 오개념. 선택형은 보기 번호(0부터), 글자형은 틀리면 any.
export const itemMap = {
  a1: { any: 'M01' }, a3: { any: 'M01' }, a4: { any: 'M03' },
  a2: { choice: { 0: 'M02', 1: 'M02', 3: 'M02', 4: 'M02' } },
  a5: { choice: { 1: 'M03', 2: 'M03' } },
  a6: { choice: { 1: 'M01' } },
  b1: { any: 'M05' },
  b2: { choice: { 0: 'M05', 1: 'M05', 3: 'M05', 4: 'M05' } },
  b3: { choice: { 0: 'M06', 1: 'M06', 3: 'M08' } },
  b4: { choice: { 0: 'M07', 1: 'M07', 3: 'M07', 4: 'M07' } },
  b5: { choice: { 1: 'M07' } },
  b6: { choice: { 1: 'M08' } },
  b7: { choice: { 1: 'M08' } }, b8: { choice: { 1: 'M08' } },
  b12: { graph: { '3,6,9': 'M09', other: 'M06' } },   // 3·6·9를 찍으면 앞 실험 자료를 쓴 것
};

// 유사문제 은행: m = 이 문제가 확인하는 오개념, wrong = 오답 보기 → 오개념(정답 보기는 없음)
export const bank = [
  { id: 's01', m: 'M01', q: '용수철저울에서 눈금을 가리켜 무게를 읽게 해 주는 부분은 어느 것일까요?', options: ['고리', '표시자', '손잡이', '영점조절나사'], answer: 1, why: '표시자가 가리키는 눈금을 읽어요.' },
  { id: 's02', m: 'M01', q: '무게를 재려는 물체는 용수철저울의 어느 부분에 매달까요?', options: ['손잡이', '영점조절나사', '고리', '눈금판'], answer: 2, why: '물체는 아래쪽 고리에 매달고, 손잡이는 저울을 잡거나 고정해요.' },
  { id: 's03', m: 'M02', q: '빈 용수철저울의 표시자가 0보다 조금 아래를 가리키고 있어요. 물체를 매달기 전에 가장 먼저 할 일은 무엇일까요?', options: ['그대로 물체를 매단다.', '영점조절나사로 표시자를 0에 맞춘다.', '저울을 세게 흔들어 본다.', '읽은 값을 그대로 기록한다.'], answer: 1, why: '측정 전에 영점을 맞춰야 정확한 무게를 읽을 수 있어요.' },
  { id: 's04', m: 'M02', q: '빈 저울이 이미 1 N을 가리키는데 영점을 맞추지 않고 사과를 달아 3 N을 읽었어요. 어떻게 된 걸까요?', options: ['사과의 무게가 정확히 3 N이다.', '영점을 맞추지 않아 실제보다 크게 읽었다.', '저울의 눈금이 모두 지워졌다.', '사과가 너무 가벼워서 잴 수 없다.'], answer: 1, why: '출발점이 1 N이었으니 사과 때문에 늘어난 만큼보다 1 N 크게 읽은 거예요.' },
  { id: 's05', m: 'M03', q: '표시자가 가리키는 눈금을 읽을 때 눈의 위치로 알맞은 것은 어느 것일까요?', options: ['표시자보다 위에서', '표시자와 같은 높이에서', '표시자보다 아래에서', '어디에서 봐도 똑같다'], answer: 1, why: '표시자와 눈높이를 나란히 맞춰야 정확하게 읽어요.' },
  { id: 's06', m: 'M03', q: '같은 물체를 같은 저울에 달았는데 친구마다 읽은 값이 조금씩 달랐어요. 가장 먼저 확인할 것은 무엇일까요?', options: ['물체의 색깔', '눈금을 읽은 눈높이', '교실의 밝기', '저울을 산 곳'], answer: 1, why: '보는 높이가 다르면 같은 표시자도 다른 눈금에 있는 것처럼 보여요.' },
  { id: 's07', m: 'M04', q: '물체를 매단 직후 표시자가 위아래로 흔들려요. 언제 눈금을 읽어야 할까요?', options: ['가장 아래로 내려갔을 때', '가장 위로 올라갔을 때', '표시자가 멈춘 뒤', '매단 바로 그 순간'], answer: 2, why: '흔들리는 동안에는 값이 계속 바뀌어요. 멈춘 뒤 읽어요.' },
  { id: 's08', m: 'M05', q: '같은 용수철에 더 무거운 물체를 매달면 용수철은 어떻게 될까요?', options: ['덜 늘어난다.', '더 많이 늘어난다.', '길이가 그대로이다.', '더 짧아진다.'], answer: 1, why: '같은 용수철에서는 무거울수록 더 많이 늘어나요.' },
  { id: 's09', m: 'M05', q: '같은 용수철에 가벼운 공과 무거운 책을 차례로 매달았어요. 옳은 설명은 어느 것일까요?', options: ['공을 달았을 때 더 많이 늘어난다.', '책을 달았을 때 더 많이 늘어난다.', '둘 다 똑같이 늘어난다.', '둘 다 전혀 늘어나지 않는다.'], answer: 1, why: '더 무거운 책이 용수철을 더 많이 늘려요.' },
  { id: 's10', m: 'M06', q: '추를 하나도 매달지 않았을 때 용수철의 ‘늘어난 길이’는 얼마일까요?', options: ['0 cm', '용수철의 전체 길이만큼', '1 cm', '알 수 없다'], answer: 0, why: '늘어난 길이는 원래 길이에서 더 늘어난 만큼이라, 아무것도 달지 않으면 0이에요.' },
  { id: 's11', m: 'M06', q: '‘추의 무게–늘어난 길이’ 그래프에서 무게가 0일 때의 점은 어디에 있을까요?', options: ['원점 (0, 0)', '세로축의 가운데', '가로축의 끝', '그래프에 찍을 수 없다'], answer: 0, why: '무게가 0이면 늘어난 길이도 0이라 원점에 있어요.' },
  { id: 's12', m: 'M07', q: '힘을 뺐을 때 원래 모양으로 돌아가려는 성질이 가장 뚜렷한 것은 어느 것일까요?', options: ['찰흙', '고무줄', '구긴 종이', '알루미늄 포일'], answer: 1, why: '고무줄은 늘였다 놓으면 원래 모양으로 돌아가요. 탄성이에요.' },
  { id: 's13', m: 'M07', q: '용수철을 당겼다가 놓으면 원래 길이로 돌아와요. 이 성질을 무엇이라고 할까요?', options: ['탄성', '소성', '부력', '마찰'], answer: 0, why: '원래 모양으로 돌아가려는 성질은 탄성이에요.' },
  { id: 's14', m: 'M08', q: '10 g 추 하나에 2 cm 늘어나는 용수철에, 같은 추 3개를 매달면 늘어난 길이는 얼마일까요?', options: ['2 cm', '4 cm', '6 cm', '9 cm'], answer: 2, why: '무게가 3배이면 늘어난 길이도 3배, 2 × 3 = 6 cm예요.' },
  { id: 's15', m: 'M08', q: '같은 용수철에서 추의 무게가 2배가 되면 늘어난 길이는 어떻게 될까요?', options: ['절반이 된다.', '2배가 된다.', '그대로이다.', '4배가 된다.'], answer: 1, why: '늘어난 길이는 추의 무게에 비례해요.' },
  { id: 's16', m: 'M09', q: '어떤 용수철은 10 g에 4 cm, 20 g에 8 cm 늘어났어요. 30 g을 매달면 늘어난 길이는 얼마일까요?', options: ['9 cm', '10 cm', '12 cm', '16 cm'], answer: 2, why: '이 용수철은 10 g마다 4 cm씩 늘어나요. 4 × 3 = 12 cm예요.', wrong: { 0: 'M09' } },
  { id: 's17', m: 'M09', q: '실험 A는 10 g에 3 cm, 실험 B는 10 g에 4 cm 늘어났어요. 옳은 생각은 어느 것일까요?', options: ['두 실험의 용수철은 같은 것이다.', '같은 무게에서 늘어난 길이가 다르니, 두 자료를 섞어 쓰면 안 된다.', '실험 A가 틀렸다.', '실험 B가 틀렸다.'], answer: 1, why: '용수철마다 늘어나는 정도가 달라요. 문제에 주어진 자료를 따로 써요.' },
];
// 선택형 은행 문항: 따로 적지 않은 오답은 그 문항의 오개념으로 본다.
for (const it of bank) { it.wrong = it.wrong || {}; it.options.forEach((_, j) => { if (j !== it.answer && !(j in it.wrong)) it.wrong[j] = it.m; }); }

// 진단: log = [{ item, ok, m, src:'test'|'bank' }] (첫 시도만) → 오개념별 상태
export function diagnose(log) {
  const out = {};
  for (const [k, v] of Object.entries(misconceptions)) out[k] = { ...v, code: k, items: new Set(), bankOk: new Set(), status: 'none' };
  for (const r of log) {
    if (UNCONFIRMED.has(r.item)) continue;
    if (!r.ok && r.m && out[r.m]) out[r.m].items.add(r.item);
    if (r.ok && r.src === 'bank') { const b = bank.find((x) => x.id === r.item); if (b) out[b.m].bankOk.add(b.id); }
  }
  for (const d of Object.values(out)) d.status = d.bankOk.size >= 2 ? 'resolved' : d.items.size >= 2 ? 'confirmed' : d.items.size === 1 ? 'suspected' : 'none';
  return out;
}
// 처방: 확정된 오개념마다 아직 맞히지 않은 유사문제
export const prescribe = (dx) => Object.values(dx).filter((d) => d.status === 'confirmed').flatMap((d) => bank.filter((b) => b.m === d.code && !d.bankOk.has(b.id)));
// 오답 → 오개념
export function misconceptionOf(item, answer) {
  const map = itemMap[item]; if (!map) return null;
  if (map.any) return map.any;
  if (map.choice) return map.choice[answer] ?? null;
  if (map.graph) { const key = (answer || []).map((p) => p[1]).join(','); return map.graph[key] || map.graph.other; }
  return null;
}

// ── 도우미(앱 연결용, 위 자료는 그대로) ──
// 데일리 테스트 첫 시도 한 문항 → 진단 기록. 맞힌 답은 오개념으로 잇지 않는다. 미확인 문항은 기록하지 않는다.
export function firstAttemptRecord(item, answer, ok) {
  if (UNCONFIRMED.has(item)) return null;
  const sorted = Array.isArray(answer) && Array.isArray(answer[0]) ? answer.slice().sort((a, b) => a[0] - b[0]) : answer;
  return { item, ok: !!ok, m: ok ? null : misconceptionOf(item, sorted), src: 'test', answerKey: ANSWER_KEY };
}
// 처방 문제 첫 시도 → 진단 기록
export function bankRecord(id, choice) {
  const b = bank.find((x) => x.id === id); if (!b) return null;
  const ok = Number(choice) === b.answer;
  return { item: id, ok, m: ok ? null : (b.wrong[choice] || b.m), src: 'bank', answerKey: ANSWER_KEY };
}
