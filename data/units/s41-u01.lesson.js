// 4-1 Ⅰ 자석의 이용 — 5E 화면·교재 구성(문항 id는 s41-u01.js의 items 참조)

// ── 5E 학습 흐름 (v2 화면·교재가 같은 데이터를 쓴다) ──
// docssam 말풍선은 한 문장·25자 안팎·~해요체. mood: talk|surprised|thinking|praise|encourage
export const lesson = {
  unitId: 's41-u01', grade: 4, title: '자석의 이용', hero: '고리 자석 탑',
  engage: {
    say: [{ mood: 'surprised', text: '어? 자석이 공중에 떠 있어요!' }, { mood: 'thinking', text: '왜 떠 있을까요? 먼저 예상해 봐요.' }],
    scene: 'ring-tower',
    question: '막대에 끼운 고리 자석이 어떤 것은 떠 있고, 어떤 것은 붙어 있어요. 왜 그럴까요?',
    predictions: [
      { id: 'light', text: '떠 있는 자석이 더 가벼워서' },
      { id: 'pole', text: '마주 보는 면이 서로 밀어 내서' },
      { id: 'rod', text: '막대가 자석을 붙잡아서' },
    ],
    answer: 'pole',
  },
  explore: {
    say: [{ mood: 'talk', text: '고리를 뒤집어서 탑을 쌓아 봐요.' }],
    modes: ['lab', 'scene', 'home'],
    lab: {
      kind: 'ring-tower', rings: 4,
      goal: '가장 높은 탑과 가장 낮은 탑을 만들어 보세요.',
      columns: ['쌓은 모양(아래→위)', '떠 있는 층', '탑 높이(칸)'],
    },
    home: {
      title: '고리 자석 탑 쌓기', minutes: 15, guardian: false,
      materials: [
        { name: '고리 자석', qty: '4개 이상', have: 'buy', buy: { coupangUrl: null, query: '고리자석 링자석 페라이트', priceKRW: null, rocket: true } },
        { name: '연필 또는 나무젓가락', qty: '1개', have: 'home' },
        { name: '지우개 또는 찰흙(받침)', qty: '1개', have: 'home' },
        { name: '자', qty: '1개', have: 'home' },
      ],
      steps: [
        '지우개나 찰흙에 연필을 똑바로 꽂아 받침을 만들어요.',
        '고리 자석을 하나씩 연필에 끼워요.',
        '자석이 뜨면 그대로, 붙으면 뒤집어서 다시 끼워 봐요.',
        '자로 탑의 높이를 재어 표에 적어요.',
        '가장 높은 탑과 가장 낮은 탑을 만든 방법을 비교해요.',
      ],
      safety: ['자석을 입에 넣지 않아요. 작은 자석은 삼키면 위험해요.', '자석끼리 세게 부딪치면 깨질 수 있어요.', '휴대폰·카드 가까이에 두지 않아요.'],
      kitUrl: 'https://lete-on.gfieldacademy.net/science-lab/v2/#/s41-u01/kit',
      qr: '../assets/qr-s41-u01-kit.svg',
    },
  },
  explain: {
    say: [{ mood: 'talk', text: '실험에서 본 것을 정리해 볼까요?' }],
    analogy: '자석의 두 극은 서로 다른 성격의 친구예요. 같은 극끼리는 밀어 내고, 다른 극끼리는 끌어당겨요.',
    fromData: '네가 만든 가장 높은 탑에서는 {floating}층이 떠 있었어요. 마주 보는 면이 같은 극이었기 때문이에요.',
    cards: ['s41-u01-a02', 's41-u01-a03', 's41-u01-a04', 's41-u01-a06'],
    table: 's41-u01-a07',
    miniTest: ['s41-u01-a11'],
  },
  elaborate: {
    say: [{ mood: 'thinking', text: '이 원리로 무엇을 만들 수 있을까요?' }],
    items: ['s41-u01-a22', 's41-u01-a21', 's41-u01-a23'],
    reading: {
      title: '떠서 달리는 열차',
      text: '자기부상 열차는 레일과 열차 바닥의 자석이 서로 밀어 내는 힘으로 떠서 달려요. 바퀴가 레일에 닿지 않아서 소리가 작고 흔들림이 적어요.',
    },
    report: true,
  },
  evaluate: {
    say: [{ mood: 'praise', text: '마지막으로 세 문제만 풀어 봐요!' }],
    items: ['s41-u01-a08', 's41-u01-a16', 's41-u01-a24'], pass: 2,
  },
  report: {
    title: '고리 자석 탑 탐구보고서',
    sections: [
      { key: 'wonder', label: '① 궁금한 점', from: 'engage.question' },
      { key: 'problem', label: '② 탐구 문제', hint: '예) 고리 자석을 어떻게 쌓으면 탑이 가장 높아질까?' },
      { key: 'hypothesis', label: '③ 가설(내 예상)', from: 'engage.prediction' },
      { key: 'vars', label: '④ 조건', hint: '바꿀 조건 / 같게 할 조건 / 측정할 것', default: '바꿀 조건: 고리 자석을 끼우는 방향\n같게 할 조건: 고리 자석의 개수·크기, 연필\n측정할 것: 탑 높이, 떠 있는 층 수' },
      { key: 'materials', label: '⑤ 준비물', from: 'explore.home.materials' },
      { key: 'steps', label: '⑥ 실험 과정', from: 'explore.home.steps' },
      { key: 'result', label: '⑦ 결과', from: 'explore.lab.table' },
      { key: 'conclusion', label: '⑧ 결론', hint: '결과에서 알 수 있는 것을 써요.' },
      { key: 'more', label: '⑨ 더 알고 싶은 점·아쉬운 점' },
    ],
    checks: ['바꾼 조건이 하나뿐인가요?', '결론이 결과에서 나왔나요?', '표에 숫자를 정확히 적었나요?'],
  },
};
