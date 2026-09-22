// 4-1 Ⅰ. 자석의 이용 — 단원 파일 = 문제은행 (DESIGN.md §문제은행)
// 문항 계약: 스킬 gfield-science-question-bank. 이 파일의 문항은 전부 status:'authored'(창작).
// 단원평가 원문·정답은 Supabase public.science_bank_source (unit_id='s41-u01')에만 있다. git 금지.

export const unit = {
  id: 's41-u01', course: '4-1', no: 1, title: '자석의 이용', domain: '운동과 에너지',
  sources: { theory: ['3-1-1:Ⅳ', '3-1-2:Ⅰ', '3-1-2:Ⅱ'], lab: ['3-A-4', '3-B-1', '3-B-2'], bank: ['supabase:science_bank_source:s41-u01'] },
};

const LEVEL = { 1: '기본', 2: '심화', 3: '영재' };
const T = (topic, concept, inquirySkill, itemType, level, track = '교과') =>
  ({ domain: '운동과 에너지', course: '4-1', grade: 4, unit: 'u01', topic, concept, inquirySkill, itemType, level: LEVEL[level] ?? level, track });
const A = (no) => ({ sourceId: 'authored', course: '4-1', unit: 'u01', originalNo: no });

// ── 그림(창작, 초기 상태만 — 정답 방향은 그리지 않는다) ──
const needle = (cx, cy, ang, r) => `<g transform="translate(${cx},${cy}) rotate(${ang})"><polygon points="0,${-r} 5,0 -5,0" fill="#E24B4A"/><polygon points="0,${r} 5,0 -5,0" fill="#3A6BC6"/></g>`;
const compass = (cx, cy, ang) => `<g><circle cx="${cx}" cy="${cy}" r="52" fill="#f2f2f2" stroke="#888" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="44" fill="#fff" stroke="#bbb"/>
<text x="${cx}" y="${cy - 26}" font-size="12" font-weight="700" text-anchor="middle" fill="#E24B4A">북</text><text x="${cx}" y="${cy + 36}" font-size="12" font-weight="700" text-anchor="middle" fill="#3A6BC6">남</text>
<text x="${cx + 32}" y="${cy + 4}" font-size="12" font-weight="700" text-anchor="middle">동</text><text x="${cx - 32}" y="${cy + 4}" font-size="12" font-weight="700" text-anchor="middle">서</text>
${ang === null ? `<text x="${cx}" y="${cy + 7}" font-size="20" font-weight="800" text-anchor="middle">?</text>` : needle(cx, cy, ang, 26) + `<circle cx="${cx}" cy="${cy}" r="3" fill="#666"/>`}</g>`;
const bar = (x, y, left, right) => {
  const c = { N: '#E24B4A', S: '#3A6BC6' };
  return `<rect x="${x}" y="${y}" width="80" height="32" fill="${c[left]}"/><rect x="${x + 80}" y="${y}" width="80" height="32" fill="${c[right]}"/><rect x="${x}" y="${y}" width="160" height="32" fill="none" stroke="#222" stroke-width="2"/>
<text x="${x + 12}" y="${y + 23}" fill="#fff" font-size="18" font-weight="800">${left}</text><text x="${x + 136}" y="${y + 23}" fill="#fff" font-size="18" font-weight="800">${right}</text>`;
};
const svg = (w, h, label, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" font-family="Pretendard,'Noto Sans KR',sans-serif">${body}</svg>`;
const arrow = (x, y, dir) => dir === 'right'
  ? `<polygon points="${x + 50},${y} ${x + 30},${y - 15} ${x + 30},${y - 7} ${x},${y - 7} ${x},${y + 7} ${x + 30},${y + 7} ${x + 30},${y + 15}" fill="#7ED36B" stroke="#2f7a22" stroke-width="2"/>`
  : `<polygon points="${x},${y} ${x + 20},${y - 15} ${x + 20},${y - 7} ${x + 50},${y - 7} ${x + 50},${y + 7} ${x + 20},${y + 7} ${x + 20},${y + 15}" fill="#7ED36B" stroke="#2f7a22" stroke-width="2"/>`;

export const figures = {
  // 나침반(바늘 북쪽) 서쪽에서 막대자석 N극을 가까이 가져감
  'west-n-approach': svg(420, 140, '나침반의 서쪽에서 막대자석의 N극을 가까이 가져가는 모습',
    bar(10, 54, 'S', 'N') + arrow(190, 70, 'right') + compass(330, 70, 0)),
  // 막대자석 S극 오른쪽(동쪽)에 놓은 나침반, 바늘은 ?로 가림
  'east-of-s': svg(360, 130, '막대자석의 S극 오른쪽에 놓인 나침반, 바늘은 가려져 있음',
    bar(20, 49, 'N', 'S') + compass(270, 65, null)),
};

const choice = (no, t, prompt, choices, answerIndex, explanation, extra = {}) => ({
  id: `s41-u01-a${String(no).padStart(2, '0')}`, status: 'authored', sourceRef: A(no), taxonomy: t,
  prompt, givens: extra.givens ?? null, choices, visualModel: extra.figure ? { kind: 'authored-svg', figure: extra.figure } : null,
  responseContract: 'single-choice', answerContract: { type: 'single-choice', answer: answerIndex, accepted: [answerIndex] },
  explanation, variantRules: extra.variantRules ?? null, evidence: { checkedBy: 'Claude', date: '2026-09-19', gates: ['science', 'answer'] },
});
const cloze = (no, t, text, blanks, explanation) => ({
  id: `s41-u01-a${String(no).padStart(2, '0')}`, status: 'authored', sourceRef: A(no), taxonomy: t,
  prompt: text, givens: null, choices: null, visualModel: null,
  responseContract: 'cloze', answerContract: { type: 'cloze', blanks }, explanation, variantRules: null,
  evidence: { checkedBy: 'Claude', date: '2026-09-19', gates: ['science', 'answer'] },
});
const written = (no, t, prompt, rubric, sample, explanation, givens = null) => ({
  id: `s41-u01-a${String(no).padStart(2, '0')}`, status: 'authored', sourceRef: A(no), taxonomy: t,
  prompt, givens, choices: null, visualModel: null,
  responseContract: 'written-explanation', answerContract: { type: 'written-explanation', rubric, sample }, explanation, variantRules: null,
  evidence: { checkedBy: 'Claude', date: '2026-09-19', gates: ['science', 'answer'] },
});

export const items = [
  // ── cloze 6 (③ 개념 카드) ──
  cloze(1, T('자석에 붙는 물체', '철로 만든 물체가 자석에 붙는다', 'concept and terminology', 'cloze', 1),
    '쇠못·옷핀·클립처럼 ( ① )(으)로 만든 물체는 자석에 붙고, 유리·고무·종이로 만든 물체는 붙지 않아요.',
    [{ answer: '철', accepted: ['철', '쇠'] }],
    '자석은 철로 만든 물체를 끌어당겨요. 쇠못·옷핀·클립은 모두 철이에요.'),
  cloze(2, T('자석의 극', '극의 정의와 위치', 'concept and terminology', 'cloze', 1),
    '자석에서 철로 만든 물체가 가장 많이 붙는 부분을 ( ① )(이)라고 해요. 막대자석에서는 ( ② )에 있어요.',
    [{ answer: '극', accepted: ['극', '자석의 극'] }, { answer: '양쪽 끝', accepted: ['양쪽 끝', '양 끝', '양끝', '두 끝'] }],
    '막대자석을 클립 더미에 넣었다 들면 양쪽 끝에 클립이 가장 많이 매달려요. 그곳이 극이에요.'),
  cloze(3, T('극 사이의 힘', '같은 극은 밀고 다른 극은 당긴다', 'cause and effect', 'cloze', 1),
    '두 자석을 가까이 하면 같은 극끼리는 서로 ( ① ), 다른 극끼리는 서로 ( ② ).',
    [{ answer: '밀어 내요', accepted: ['밀어 내요', '밀어낸다', '밀어 낸다', '밀어내요', '밀어 냄'] },
     { answer: '끌어당겨요', accepted: ['끌어당겨요', '끌어당긴다', '당긴다', '당겨요'] }],
    'N극과 N극, S극과 S극은 밀어 내고, N극과 S극은 끌어당겨요.'),
  cloze(4, T('자석이 가리키는 방향', 'N극·S극의 이름', 'concept and terminology', 'cloze', 1),
    '물에 띄운 막대자석이 멈추면 ( ① )쪽을 가리키는 극을 N극, ( ② )쪽을 가리키는 극을 S극이라고 해요.',
    [{ answer: '북', accepted: ['북', '북쪽'] }, { answer: '남', accepted: ['남', '남쪽'] }],
    '자유롭게 움직이는 자석은 늘 북쪽과 남쪽을 가리키며 멈춰요. 북쪽 극이 N극이에요.'),
  cloze(5, T('나침반', '나침반 바늘은 자석이다', 'concept and terminology', 'cloze', 1),
    '나침반 바늘은 ( ① )(이)라서, 가까이에 막대자석을 가져가면 바늘이 ( ② ).',
    [{ answer: '자석', accepted: ['자석', '작은 자석'] }, { answer: '움직여요', accepted: ['움직여요', '움직인다', '돌아가요', '돌아간다'] }],
    '나침반 바늘도 N극과 S극이 있는 자석이라 다른 자석의 극에 끌리거나 밀려요.'),
  cloze(6, T('자석의 힘', '물체를 사이에 두어도, 떨어져 있어도 힘이 작용한다', 'evidence-based conclusion', 'cloze', 2),
    '자석과 클립 사이에 얇은 종이를 끼워도 클립이 ( ① ). 자석과 클립 사이가 멀어질수록 끌어당기는 힘은 ( ② ).',
    [{ answer: '끌려와요', accepted: ['끌려와요', '붙어요', '붙는다', '끌려온다'] }, { answer: '약해져요', accepted: ['약해져요', '약해진다', '작아진다', '작아져요'] }],
    '자석의 힘은 종이·플라스틱을 사이에 두어도 작용하지만, 거리가 멀어질수록 약해져요.'),

  // ── table-fill 1 (③ 정리표) ──
  { id: 's41-u01-a07', status: 'authored', sourceRef: A(7),
    taxonomy: T('자석에 붙는 물체', '재료에 따라 자석에 붙는지가 정해진다', 'classification by observable properties', 'table-fill', 1),
    prompt: '물체마다 만든 재료와 자석에 붙는지를 골라 표를 채워 보세요.', givens: null, choices: null, visualModel: null,
    responseContract: 'table-fill',
    answerContract: { type: 'table-fill',
      columns: ['재료', '자석에 붙나요?'],
      options: { '재료': ['철', '유리', '고무', '나무'], '자석에 붙나요?': ['붙는다', '붙지 않는다'] },
      rows: [
        { label: '쇠못', answer: ['철', '붙는다'] },
        { label: '유리컵', answer: ['유리', '붙지 않는다'] },
        { label: '고무줄', answer: ['고무', '붙지 않는다'] },
        { label: '나무젓가락', answer: ['나무', '붙지 않는다'] },
        { label: '옷핀', answer: ['철', '붙는다'] },
      ] },
    explanation: '재료가 철인 쇠못과 옷핀만 자석에 붙어요. 모양이나 크기가 아니라 재료가 결정해요.',
    variantRules: '행 순서 섞기 허용. 철 2~3행 유지.', evidence: { checkedBy: 'Claude', date: '2026-09-19', gates: ['science', 'answer'] } },

  // ── single-choice (정답 위치 분포·보기 길이는 bank/audit.mjs가 검사) ──
  choice(8, T('자석에 붙는 물체', '알루미늄은 자석에 붙지 않는다', 'classification by observable properties', 'single-choice', 1),
    '자석을 가까이 했을 때 자석에 붙지 않는 물체는 어느 것인가요?',
    ['쇠로 된 병뚜껑', '철사 한 토막', '알루미늄 포일', '쇠 숟가락', '스테이플러 심'], 2,
    '알루미늄은 금속이지만 철이 아니라서 자석에 붙지 않아요. 나머지는 모두 철로 만들었어요.'),
  choice(9, T('자석의 극', '철가루는 양 끝에 많이 붙는다', 'observation', 'single-choice', 1),
    '막대자석을 철가루 접시에 굴린 뒤 들어 올렸어요. 철가루가 가장 많이 붙은 곳은 어디인가요?',
    ['막대자석의 양쪽 끝', '막대자석의 한가운데', '막대자석의 한쪽 끝만', '막대자석 전체에 고르게', '막대자석의 옆면 가운데'], 0,
    '철가루는 극이 있는 양쪽 끝에 가장 많이 붙고 가운데는 거의 붙지 않아요.'),
  choice(10, T('자석의 극', '자석을 잘라도 조각마다 두 극이 생긴다', 'prediction with stated conditions', 'single-choice', 2),
    '막대자석을 가운데에서 반으로 잘랐어요. 잘린 두 조각은 어떻게 될까요?',
    ['한 조각은 N극, 다른 조각은 S극만 갖는다', '두 조각 모두 자석의 성질을 잃는다', '잘린 면에서만 철을 끌어당긴다', '원래 N극이 있던 조각만 자석이 된다', '조각마다 N극과 S극이 모두 생긴다'], 4,
    '자석은 아무리 잘라도 조각마다 N극과 S극이 함께 생겨요. 극이 하나만 있는 자석은 없어요.'),
  choice(11, T('극 사이의 힘', '떠 있는 고리 자석 = 같은 극 마주 봄', 'cause and effect', 'single-choice', 2),
    '막대에 고리 자석 두 개를 끼웠더니 위쪽 자석이 아래쪽 자석 위에 떠 있었어요. 그 까닭은 무엇인가요?',
    ['두 자석의 크기가 서로 달라서', '마주 보는 면이 같은 극이라서', '마주 보는 면이 다른 극이라서', '막대가 위 자석을 끌어당겨서', '위 자석이 아래 자석보다 가벼워서'], 1,
    '같은 극끼리 밀어 내는 힘이 위쪽 자석을 받쳐서 떠 있어요. 다른 극이었다면 딱 붙었을 거예요.'),
  choice(12, T('나침반과 자석', '다른 극끼리 끌어당겨 바늘이 돈다', 'prediction with stated conditions', 'single-choice', 2),
    '북쪽을 가리키던 나침반의 서쪽에서 막대자석의 N극을 가까이 가져갔어요. 나침반 바늘은 어떻게 될까요?',
    ['바늘이 전혀 움직이지 않는다', '빨간색 부분이 북쪽을 계속 가리킨다', '바늘이 쉬지 않고 빙글빙글 돈다', '빨간색 부분이 동쪽을 가리킨다', '파란색 부분이 남쪽을 가리킨다'], 3,
    '바늘의 파란색(S극)이 서쪽의 N극에 끌려가 서쪽을 가리키고, 빨간색(N극)은 반대인 동쪽을 가리켜요.',
    { figure: 'west-n-approach', givens: { 실험: '나침반 서쪽에서 막대자석의 N극을 가까이 가져간다.' } }),
  choice(13, T('자석의 극', '양 끝과 가운데를 대어 보면 자석을 가릴 수 있다', 'evidence-based conclusion', 'single-choice', 3, '영재성'),
    '생김새가 같은 쇠막대 A, B가 있어요. A의 끝을 B의 가운데에 대면 붙고, B의 끝을 A의 가운데에 대면 붙지 않았어요. 알맞은 것은 어느 것인가요?',
    ['B만 자석이다', 'A만 자석이다', 'A와 B 모두 자석이다', 'A와 B 모두 자석이 아니다', '이 실험으로는 알 수 없다'], 1,
    '자석의 가운데는 힘이 거의 없어요. A의 끝(극)이 B를 끌어당겼고, B의 끝은 A를 당기지 못했으니 A만 자석이에요.',
    { givens: { 결과: 'A 끝 → B 가운데: 붙음 / B 끝 → A 가운데: 붙지 않음' } }),
  choice(14, T('자석의 이용', '생활 속 자석', 'real-world application', 'single-choice', 1),
    '우리 생활에서 자석을 이용한 물건이 아닌 것은 어느 것인가요?',
    ['냉장고 메모꽂이', '가방의 자석 단추', '자석 칠판', '나침반', '고무지우개'], 4,
    '고무지우개에는 자석이 없어요. 나머지는 자석이 철이나 다른 자석을 끌어당기는 성질을 이용해요.'),
  choice(15, T('자석의 힘', '바꾸는 조건과 같게 할 조건', 'manipulated, responding, and controlled variables', 'single-choice', 2),
    '종이를 몇 장 끼우느냐에 따라 자석이 클립을 끌어당기는 힘이 달라지는지 알아보려고 해요. 실험에서 다르게 해야 하는 조건은 어느 것인가요?',
    ['끼우는 종이의 장수', '사용하는 막대자석', '매다는 클립의 종류', '끼우는 종이의 종류', '자석을 가까이 하는 방법'], 0,
    '알아보려는 것이 종이 장수의 영향이므로 종이 장수만 바꾸고, 자석·클립·종이 종류·방법은 같게 해야 공정한 실험이에요.'),
  choice(16, T('자석이 가리키는 방향', '북쪽을 가리키는 극 = N극', 'evidence-based conclusion', 'single-choice', 1),
    '극 표시가 지워진 막대자석을 물에 띄웠더니 한쪽 끝이 북쪽을 가리키며 멈췄어요. 이 끝은 무슨 극인가요?',
    ['S극', '극이 아니다', 'N극', 'N극과 S극 모두', '알 수 없다'], 2,
    '자석이 멈췄을 때 북쪽을 가리키는 극을 N극이라고 해요. 표시가 없어도 이렇게 극을 알아낼 수 있어요.'),
  choice(17, T('나침반과 자석', '막대자석 S극 옆 나침반', 'diagram interpretation', 'single-choice', 2),
    '막대자석 S극의 오른쪽에 나침반을 놓았어요. 나침반 바늘은 어떻게 멈출까요?',
    ['빨간색 부분이 동쪽을 가리킨다', '파란색 부분이 서쪽을 가리킨다', '빨간색 부분이 북쪽을 가리킨다', '빨간색 부분이 서쪽을 가리킨다', '파란색 부분이 북쪽을 가리킨다'], 3,
    '바늘의 빨간색(N극)이 막대자석의 S극에 끌려 서쪽(자석 쪽)을 가리키고, 파란색은 동쪽을 가리켜요.',
    { figure: 'east-of-s' }),

  // ── written-explanation 3 (④ 확장) ──
  written(18, T('자석이 가리키는 방향', '극 표시 없는 자석의 극 찾기', 'experiment purpose or hypothesis', 'written-explanation', 2),
    '극 표시가 지워진 막대자석이 있어요. 이 자석의 N극이 어느 쪽인지 알아내는 방법을 한 가지 쓰세요.',
    { required: ['방법(나침반·물에 띄우기·극 표시된 자석 중 하나)', '관찰 결과로 극을 판단하는 근거'],
      pass: '방법과 판단 근거가 모두 있으면 정답',
      accepted: ['물에 띄워 북쪽을 가리키는 끝이 N극', '나침반에 가까이 해 바늘의 S극(파란색)이 끌려오는 끝이 N극', '극 표시된 자석의 N극에 대어 밀어 내는 끝이 N극'] },
    '자석을 물에 띄운 접시에 올려 두고, 멈췄을 때 북쪽을 가리키는 끝이 N극이에요.',
    '자석은 북쪽을 가리키는 성질, 같은 극은 밀고 다른 극은 당기는 성질이 있어요. 이 가운데 하나를 쓰고 근거를 함께 적으면 돼요.'),
  written(19, T('자석의 이용', '자석 방충망의 원리', 'real-world application', 'written-explanation', 2),
    '자석 방충망은 가운데 틈에 자석이 들어 있어 손을 떼면 저절로 닫혀요. 어떤 자석의 성질을 이용했는지 설명하세요.',
    { required: ['양쪽 자석이 서로 끌어당긴다', '다른 극끼리(또는 자석과 철이) 마주 본다'],
      pass: '끌어당기는 성질 + 마주 보는 극(또는 철) 언급 시 정답' },
    '양쪽 틈에 다른 극끼리 마주 보도록 자석을 넣어서, 서로 끌어당기는 힘으로 닫혀요.',
    '다른 극끼리는 끌어당기므로, 틈 양쪽에 다른 극이 마주 보게 넣으면 가까워질 때 서로 붙어 닫혀요.'),
  written(20, T('자석의 힘', '자석 세기 비교 실험 설계', 'manipulated, responding, and controlled variables', 'written-explanation', 3, '영재성'),
    '크기가 다른 두 막대자석 중 어느 쪽 힘이 센지 클립을 이용해 비교하려고 해요. 실험 방법을 쓰고, 공정하게 비교하려면 같게 해야 할 조건을 두 가지 쓰세요.',
    { required: ['매달리는 클립 수(또는 끌려오는 거리)로 비교', '같게 할 조건 2개(클립 종류·매다는 방법·자석의 같은 부분(극) 사용 등)'],
      pass: '측정 방법 1 + 통제 조건 2 모두 있으면 정답' },
    '각 자석의 극에 같은 클립을 하나씩 이어 매달아 몇 개까지 매달리는지 센다. 같은 클립을 쓰고, 두 자석 모두 극 부분에 같은 방법으로 매단다.',
    '비교하려는 것(자석) 말고는 모두 같게 해야 차이가 자석 때문이라고 말할 수 있어요.'),
  // ── 영재성 (4학년 눈높이 — 중등 용어는 쓰지 않고 풀어서, 미리보기 한 줄만) ──
  written(21, T('자석의 힘', '자석의 힘이 미치는 공간(철가루 무늬)', 'observation versus inference', 'written-explanation', 3, '영재성'),
    '막대자석 위에 종이를 덮고 철가루를 골고루 뿌린 뒤 종이를 톡톡 두드렸더니 철가루가 무늬를 만들었어요. 무늬를 보고 알 수 있는 것을 두 가지 쓰세요.',
    { required: ['관찰: 양쪽 끝(극) 근처에 철가루가 많이 모인다', '추론: 자석에서 떨어진 곳에도 힘이 미친다 / 극에서 극으로 이어지는 선 모양'],
      pass: '관찰 1 + 추론 1 이상이면 정답', preview: '중학교에서는 자석의 힘이 미치는 공간을 "자기장"이라고 불러요.' },
    '양쪽 끝에 철가루가 가장 많이 모이고, 끝과 끝을 잇는 둥근 선 모양이 생긴다. 자석에 닿지 않은 철가루도 움직였으니 자석의 힘은 떨어진 곳까지 미친다.',
    '보이는 것(철가루가 모인 곳, 선 모양)과 그것으로 알 수 있는 것(떨어진 곳에도 힘이 미침)을 나누어 써요.'),
  choice(22, T('극 사이의 힘', '같은 극끼리 밀어 내는 힘으로 뜨는 물체', 'real-world application', 'single-choice', 3, '영재성'),
    '자기부상 열차 장난감은 레일과 열차 바닥에 자석이 있어서 열차가 레일 위에 살짝 떠서 달려요. 열차가 뜨려면 레일과 열차 바닥의 자석을 어떻게 놓아야 할까요?',
    ['레일과 열차 바닥이 서로 다른 극으로 마주 보게', '레일에만 자석을 두고 열차에는 철판을 붙이게', '레일과 열차 바닥이 서로 같은 극으로 마주 보게', '열차 바닥의 자석을 나무판으로 모두 감싸게', '레일의 자석을 가운데 부분만 열차 쪽으로 향하게'], 2,
    '같은 극끼리 밀어 내는 힘이 열차를 위로 받쳐 줘요. 고리 자석 탑이 떠 있는 것과 같은 원리예요.',
    { variantRules: '정답 위치는 배포 시 섞음(정답 letter 재계산).' }),
  written(23, T('자석의 이용', '자석의 성질로 생활 속 불편 해결하기', 'real-world application', 'written-explanation', 3, '영재성'),
    '자석의 성질을 이용해 우리 생활의 불편한 점을 해결하는 물건을 떠올려 보세요. 되도록 많이 쓰고, 각각 어떤 성질을 이용했는지 함께 쓰세요.',
    { required: ['물건 아이디어 3개 이상(유창성)', '각 아이디어에 이용한 성질(철을 끌어당김 / 같은 극은 밀고 다른 극은 당김 / 일정한 방향을 가리킴)'],
      pass: '3개 이상 + 성질 연결', bonus: '남들이 잘 떠올리지 않는 아이디어(독창성), 서로 다른 성질을 골고루 사용(융통성)' },
    '예) 떨어진 압정을 한 번에 줍는 자석 빗자루(철을 끌어당김), 저절로 닫히는 자석 문(다른 극끼리 당김), 서로 밀어 내서 흔들리지 않는 자석 받침(같은 극끼리 밀어 냄).',
    '영재성 채점 기준(지필드 실험편 "영재성 기르기")으로 아이디어 수(유창성), 새로움(독창성), 성질의 다양함(융통성)을 봐요.'),
  choice(24, T('자석의 극', '철 클립만으로 극 찾기', 'evidence-based conclusion', 'single-choice', 2),
    '극 표시가 없는 둥근기둥 모양 자석이 있어요. 철 클립이 든 상자에 넣었다가 꺼냈을 때 극이 있는 곳은 어떻게 알 수 있을까요?',
    ['철 클립이 하나도 붙지 않는 곳', '철 클립이 고르게 조금씩 붙은 곳', '자석의 색깔이 진하게 칠해진 곳', '철 클립이 가장 많이 붙어 있는 곳', '자석이 가장 무겁게 느껴지는 곳'], 3,
    '철로 만든 물체가 가장 많이 붙는 곳이 자석의 극이에요. 모양이 달라도 극은 두 곳이에요.'),
  written(25, T('나침반과 자석', '나침반으로 자석 주위 방향 알아보기', 'experiment design', 'written-explanation', 3, '영재성'),
    '나침반 하나와 막대자석 하나가 있어요. 막대자석 주위의 여러 곳에서 나침반 바늘이 어느 쪽을 가리키는지 알아보는 방법을 순서대로 쓰세요.',
    { required: ['막대자석을 움직이지 않게 놓는다', '나침반을 자석 주위의 여러 자리로 옮기며 바늘 방향을 기록한다(그림·화살표)', '자석에서 떨어진 곳과 가까운 곳을 비교한다'],
      pass: '고정 + 여러 자리 기록 포함 시 정답' },
    '막대자석을 종이 위에 고정하고 둘레를 따라 나침반을 조금씩 옮기면서, 자리마다 빨간 바늘이 가리키는 방향을 화살표로 그린다.',
    '바꾸는 것은 나침반의 자리 하나뿐이고, 자석은 그대로 두어야 비교할 수 있어요.'),
  cloze(26, T('나침반과 자석', '가까운 자석이 나침반 바늘 방향을 바꾼다', 'cause and effect', 'cloze', 2),
    '나침반은 보통 ( ① )쪽을 가리키지만, 가까이에 자석이 있으면 바늘이 ( ② ) 쪽을 가리켜서 방향을 잘못 알 수 있어요.',
    [{ answer: '북', accepted: ['북', '북쪽'] }, { answer: '자석', accepted: ['자석', '자석 있는'] }],
    '나침반 바늘도 자석이라서, 가까이 있는 자석에 끌리거나 밀려 방향이 바뀌어요. 방향을 찾을 때는 자석을 멀리 두어요.'),
];
