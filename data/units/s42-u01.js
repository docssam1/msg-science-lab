// 4-2 Ⅰ. 식물의 생활 — 단원 파일(창작 문항). 5E 화면(개념 카드·정리표·확장·점검)이 쓰는 문항.
// 단원평가 원문·정답은 Supabase public.science_bank_source (unit_id='s42-u01')에만 있다. git 금지.

export const unit = {
  id: 's42-u01', course: '4-2', no: 1, title: '식물의 생활', domain: '생명',
  sources: { bank: ['supabase:science_bank_source:s42-u01'] },
};

const LEVEL = { 1: '기본', 2: '심화', 3: '영재' };
const T = (element, type, concept, level, track = '교과') =>
  ({ curriculum: '2022 개정', domain: '생명', area: '생명', course: '4-2', grade: 4, unit: 'u01', element, type, concept, level: LEVEL[level], track });
const base = (no, t, prompt, extra = {}) => ({
  id: `s42-u01-b${String(no).padStart(2, '0')}`, status: 'authored', sourceRef: { sourceId: 'authored', course: '4-2', unit: 'u01', originalNo: no },
  taxonomy: t, prompt, givens: extra.givens ?? null, choices: null, visualModel: null, variantRules: null,
  evidence: { checkedBy: 'Claude', date: '2026-09-20', gates: ['science', 'answer'] },
});
const cloze = (no, t, text, blanks, explanation) => ({ ...base(no, t, text), responseContract: 'cloze', answerContract: { type: 'cloze', blanks }, explanation });
const choice = (no, t, prompt, choices, answer, explanation, extra) => ({ ...base(no, t, prompt, extra), choices,
  responseContract: 'single-choice', answerContract: { type: 'single-choice', answer, accepted: [answer] }, explanation });
const written = (no, t, prompt, required, sample, explanation, extra) => ({ ...base(no, t, prompt, extra),
  responseContract: 'written-explanation', answerContract: { type: 'written-explanation', sample, rubric: { required, pass: '채점 기준을 모두 담으면 정답', ...(extra?.bonus ? { bonus: extra.bonus } : {}) } }, explanation });

export const items = [
  // ── ③ 개념 카드 ──
  cloze(1, T('E1', 'T01', '잎의 구조', 1),
    '잎의 넓은 부분을 ( ① ), 잎몸과 줄기를 이어 주는 부분을 ( ② ), 잎몸에 퍼져 있는 가는 줄을 ( ③ )(이)라고 해요.',
    [{ answer: '잎몸', accepted: ['잎몸'] }, { answer: '잎자루', accepted: ['잎자루'] }, { answer: '잎맥', accepted: ['잎맥'] }],
    '잎맥은 잎몸 전체에 그물처럼 또는 나란히 퍼져 있어요. 잎을 관찰할 때 세 부분을 나누어 보면 비교하기 쉬워요.'),
  cloze(2, T('E2', 'T04', '풀과 나무', 1),
    '풀은 나무보다 키가 ( ① ) 줄기가 가늘어요. 나무는 모두 ( ② ) 식물이라 겨울에도 줄기가 살아 있어요.',
    [{ answer: '작고', accepted: ['작고', '작다', '작아요', '작음'] }, { answer: '여러해살이', accepted: ['여러해살이'] }],
    '풀 중에는 한 해만 사는 한해살이 풀도 있고 여러 해를 사는 여러해살이 풀도 있어요.'),
  cloze(3, T('E3', 'T06', '부레옥잠의 공기주머니', 1),
    '부레옥잠은 잎자루에 ( ① )이/가 있어서 물에 ( ② ) 살 수 있어요.',
    [{ answer: '공기주머니', accepted: ['공기주머니', '공기 주머니'] }, { answer: '떠서', accepted: ['떠서', '뜰 수 있어', '떠'] }],
    '부레옥잠의 잎자루를 잘라 보면 스펀지처럼 작은 공기주머니가 가득해요.'),
  cloze(4, T('E4', 'T09', '적응의 뜻', 1),
    '생물이 오랜 기간에 걸쳐 사는 곳의 환경에 알맞게 변해 가는 것을 ( ① )(이)라고 해요.',
    [{ answer: '적응', accepted: ['적응'] }],
    '선인장의 가시, 부레옥잠의 공기주머니 모두 사는 곳에 적응한 결과예요.'),
  // ── ③ 정리표 ──
  { ...base(5, T('E3', 'T07', '사는 곳에 따른 식물', 1), '식물이 어떻게 사는지 골라 표를 채워 보세요.'),
    responseContract: 'table-fill',
    answerContract: { type: 'table-fill', rowHead: '식물', columns: ['사는 모습'],
      options: { '사는 모습': ['물에 떠서 산다', '잎이 물 위에 떠 있다', '물속에 잠겨 산다', '물가에 산다', '사막에 산다'] },
      rows: [
        { label: '부레옥잠', answer: ['물에 떠서 산다'] },
        { label: '수련', answer: ['잎이 물 위에 떠 있다'] },
        { label: '검정말', answer: ['물속에 잠겨 산다'] },
        { label: '부들', answer: ['물가에 산다'] },
        { label: '선인장', answer: ['사막에 산다'] },
      ] },
    explanation: '강이나 연못의 식물은 물에 떠서, 잎만 물 위에 띄워서, 물속에 잠겨서, 물가에서 사는 식물로 나눌 수 있어요.' },
  // ── ③ 잠깐 확인 ──
  choice(6, T('E4', 'T08', '선인장 줄기의 물 저장', 1),
    '선인장의 줄기가 굵고 통통한 까닭으로 가장 알맞은 것은 어느 것입니까?',
    ['곤충이 줄기를 갉아 먹지 못하게 하려고', '줄기 속에 물을 저장해 두려고', '햇빛을 막아 줄기를 시원하게 하려고', '바람이 불어도 쓰러지지 않게 하려고', '씨를 줄기 속에 넣어 멀리 퍼뜨리려고'], 1,
    '비가 거의 오지 않는 사막에서 선인장은 굵은 줄기에 물을 저장해요. 잎은 가시 모양이라 물이 잘 빠져나가지 않아요.'),
  // ── ④ 확장 ──
  choice(7, T('E3', 'T06', '공기주머니를 누르면 덜 뜬다', 2),
    '부레옥잠 잎자루를 손으로 꾹꾹 눌러 속의 공기를 빼낸 뒤 물에 다시 넣었습니다. 어떻게 될지 가장 알맞은 것은 어느 것입니까?',
    ['잎자루가 더 커져서 물 위로 높이 떠오른다', '잎이 모두 떨어지고 뿌리만 물에 뜬다', '처음과 똑같이 물 위에 떠서 흔들린다', '물에 뜨는 힘이 약해져 전보다 물에 잠긴다', '뿌리가 바닥으로 자라 땅에 박힌다'], 3,
    '물에 뜨게 해 주던 공기가 빠져나가면 뜨는 힘이 약해져서 전보다 물에 잠겨요. 공기주머니가 부레옥잠을 띄우는 역할을 한다는 것을 알 수 있어요.'),
  written(8, T('E5', 'T10', '연잎을 닮은 물건 설계', 3, '영재성'),
    '연잎 위에 떨어진 물방울은 스며들지 않고 동글동글 굴러떨어져요. 연잎의 이 특징을 활용한 물건을 하나 생각해 보고, 어디에 쓰면 좋은지 쓰세요.',
    ['연잎처럼 물에 젖지 않는 특징을 쓴다', '물건과 쓰임을 알맞게 쓴다'],
    '연잎처럼 물이 스며들지 않는 우산이나 비옷을 만들면 비를 맞아도 젖지 않고 물이 굴러떨어져 금방 마른다.',
    '물에 젖지 않는 옷감, 김이 서리지 않는 유리, 비가 스며들지 않는 페인트 등이 연잎의 특징을 따라 만든 것이에요.'),
  written(9, T('E5', 'T10', '도꼬마리 열매의 갈고리가 주는 도움', 3, '영재성'),
    '도꼬마리 열매의 가시 끝은 갈고리처럼 휘어 있어 동물의 털에 잘 붙어요. 이 특징이 도꼬마리에게 어떤 도움이 되는지 쓰세요.',
    ['동물의 털에 붙어 옮겨진다', '씨가 멀리 퍼질 수 있다'],
    '열매가 동물의 털에 붙어 다른 곳으로 옮겨지기 때문에 씨가 멀리 퍼져 새로운 곳에서 자랄 수 있다.',
    '식물은 스스로 움직일 수 없어서 바람·물·동물의 도움으로 씨를 퍼뜨려요. 도꼬마리는 동물을 이용하는 식물이에요.'),
  // ── ⑤ 점검 ──
  choice(10, T('E1', 'T03', '분류 기준 정하기', 1),
    '식물의 잎을 분류하는 기준으로 가장 알맞은 것은 어느 것입니까?',
    ['잎의 가장자리가 톱니 모양인가?', '잎이 예쁘게 생겼는가?', '잎을 보면 기분이 좋아지는가?', '잎의 모양이 신기하게 생겼는가?', '잎의 색깔이 마음에 드는가?'], 0,
    '분류 기준은 누가 분류해도 같은 결과가 나오도록 정해야 해요. 예쁘다·신기하다처럼 사람마다 다르게 느끼는 기준은 알맞지 않아요.'),
  choice(11, T('E3', 'T07', '물속에 잠겨 사는 식물', 1),
    '검정말처럼 물속에 잠겨서 사는 식물의 특징으로 알맞은 것은 어느 것입니까?',
    ['잎자루에 공기주머니가 있어 물에 떠 있다', '잎이 넓고 둥글어 물 위에 떠 있다', '줄기가 굵고 단단해 물가에 곧게 서 있다', '뿌리 없이 물 위를 이리저리 떠다니며 산다', '잎이 좁고 길어 물의 흐름에 따라 잘 휘어진다'], 4,
    '물속에 잠겨 사는 식물은 잎이 좁고 길거나 가늘게 갈라져 있어서 물이 흘러도 잘 찢어지지 않아요.'),
  choice(12, T('E5', 'T10', '찍찍이 테이프', 1),
    '옷이나 신발에 쓰는 찍찍이 테이프는 어떤 식물의 특징을 본떠 만든 것입니까?',
    ['연꽃잎', '단풍나무 열매', '도꼬마리 열매', '선인장 가시', '민들레 씨'], 2,
    '도꼬마리 열매의 가시 끝이 갈고리처럼 휘어 있어 털이나 옷에 잘 붙는 특징을 본떠 찍찍이 테이프를 만들었어요.'),
];
