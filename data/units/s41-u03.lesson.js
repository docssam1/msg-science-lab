// 4-1 Ⅲ 땅의 변화 — 5E 화면·교재 구성(문항 id는 s41-u03.js의 items 참조)
// docssam 말풍선은 한 문장·25자 안팎·~해요체. mood: talk|surprised|thinking|praise|encourage
export const lesson = {
  unitId: 's41-u03', grade: 4, title: '땅의 변화', hero: '흙 언덕 물길',
  engage: {
    say: [{ mood: 'surprised', text: '비 온 뒤 운동장에 물길이 생겼어요!' }, { mood: 'thinking', text: '흐르는 물은 흙을 어떻게 바꿀까요?' }],
    scene: 'hill-stream',
    question: '흙 언덕 꼭대기에 뿌린 색 모래는 물을 흘려보내면 어디로 갈까요?',
    predictions: [
      { id: 'stay', text: '꼭대기에 그대로 남아 있다' },
      { id: 'down', text: '물을 따라 내려가 아래쪽에 쌓인다' },
      { id: 'gone', text: '물에 녹아 없어진다' },
    ],
    answer: 'down',
    wrongNote: '실험 결과는 달랐어요. 색 모래는 깎여서 아래쪽에 쌓였어요.',
  },
  explore: {
    say: [{ mood: 'talk', text: '경사와 물의 양을 바꿔 흘려 봐요.' }],
    modes: ['lab', 'scene', 'home'],
    lab: {
      kind: 'hill',
      goal: '경사와 물의 양을 고르고, 언덕 위쪽을 눌러 컵 자리를 정한 뒤 물 붓기를 누르고 있어요. 컵이 비면 깎인 흙과 쌓인 흙을 표에 적어요.',
      columns: ['경사', '물의 양', '깎인 흙(칸)', '쌓인 흙(칸)'],
      rowText: (r) => `경사 ${r.slope}, 물 ${r.water} → 깎인 흙 ${r.cut}칸, 쌓인 흙 ${r.pile}칸`,
    },
    home: {
      title: '쟁반 흙 언덕 실험', minutes: 20, guardian: true,
      materials: [
        { name: '색 모래', qty: '한 줌', have: 'buy', buy: { coupangUrl: null, query: '색모래 만들기 재료', priceKRW: null, rocket: true } },
        { name: '넓은 쟁반(가장자리 있는 것)', qty: '1개', have: 'home' },
        { name: '화분 흙이나 모래', qty: '두 컵', have: 'home' },
        { name: '종이컵(바닥에 작은 구멍)', qty: '1개', have: 'home' },
        { name: '물', qty: '한 컵', have: 'home' },
      ],
      steps: [
        '쟁반 한쪽에 흙을 쌓아 언덕을 만들고, 반대쪽은 비워 둬요.',
        '언덕 꼭대기에 색 모래를 얇게 뿌려요.',
        '구멍 난 종이컵에 물을 붓고, 언덕 꼭대기에서 물이 천천히 흐르게 해요.',
        '색 모래와 흙이 어디로 가서 쌓이는지 관찰해 그림으로 그려요.',
        '언덕을 더 가파르게 다시 쌓고 같은 양의 물을 흘려 비교해 봐요.',
      ],
      safety: ['바닥에 신문지를 깔고 해요.', '흙 묻은 손으로 눈을 비비지 않아요.', '다 쓴 흙은 하수구에 버리지 말고 화분이나 흙에 돌려줘요.'],
      kitUrl: 'https://lete-on.gfieldacademy.net/science-lab/v2/#/s41-u03/kit',
      qr: '../assets/qr-s41-u03-kit.svg',
    },
  },
  explain: {
    say: [{ mood: 'talk', text: '흐르는 물이 한 일을 정리해 봐요.' }],
    analogy: '흐르는 물은 땅을 고치는 일꾼이에요. 높은 곳에서 흙을 깎아 싣고 가서, 낮고 느린 곳에 내려놓아요.',
    principle: '흐르는 물은 경사가 급한 위쪽을 깎고(침식), 흙을 옮겨(운반), 경사가 완만한 아래쪽에 쌓아요(퇴적).',
    fromData: (rows) => {
      if (!rows.length) return '';
      const when = (r) => `경사가 ${r.slope === '가파름' ? '가파르고' : '완만하고'} 물이 ${r.water === '많이' ? '많을' : '적을'} 때`;
      const hi = rows.reduce((a, b) => (b.cut > a.cut ? b : a)), lo = rows.reduce((a, b) => (b.cut < a.cut ? b : a));
      if (hi.cut === lo.cut) return `네 기록: ${when(hi)} 위쪽에서 ${hi.cut}칸이 깎여 아래쪽에 ${hi.pile}칸 쌓였어요. 조건을 바꿔 한 번 더 해 봐요.`;
      return `네 기록: ${when(hi)} ${hi.cut}칸으로 가장 많이 깎였고, ${when(lo)} ${lo.cut}칸으로 가장 적었어요. 깎인 만큼 아래에 쌓였어요.`;
    },
    cards: ['s41-u03-b01', 's41-u03-b02', 's41-u03-b03', 's41-u03-b04'],
    table: 's41-u03-b05',
    miniTest: ['s41-u03-b06'],
  },
  elaborate: {
    say: [{ mood: 'thinking', text: '굽은 강은 어느 쪽이 깎일까요?' }],
    items: ['s41-u03-b07', 's41-u03-b08', 's41-u03-b09'],
    reading: {
      title: '돌하르방은 왜 구멍투성이일까',
      text: '제주도의 돌하르방은 현무암으로 만들어요. 현무암은 용암이 땅 위에서 빨리 식어 생긴 암석이라 알갱이가 작고 어두워요. 용암 속 가스가 빠져나간 자리가 구멍으로 남아 표면이 숭숭 뚫려 있어요.',
    },
    report: true,
  },
  evaluate: {
    say: [{ mood: 'praise', text: '마지막으로 세 문제만 풀어 봐요!' }],
    items: ['s41-u03-b10', 's41-u03-b11', 's41-u03-b12'], pass: 2,
  },
  report: {
    title: '흙 언덕 물길 탐구보고서',
    sections: [
      { key: 'wonder', label: '① 궁금한 점', from: 'engage.question' },
      { key: 'problem', label: '② 탐구 문제', hint: '예) 경사가 급할수록 흙이 더 많이 깎일까?' },
      { key: 'hypothesis', label: '③ 가설(내 예상)', from: 'engage.prediction' },
      { key: 'vars', label: '④ 조건', hint: '바꿀 조건 / 같게 할 조건 / 측정할 것', default: '바꿀 조건: 언덕의 경사\n같게 할 조건: 흙의 양, 물의 양, 물을 붓는 빠르기\n측정할 것: 깎인 흙과 쌓인 흙의 양' },
      { key: 'materials', label: '⑤ 준비물', from: 'explore.home.materials' },
      { key: 'steps', label: '⑥ 실험 과정', from: 'explore.home.steps' },
      { key: 'result', label: '⑦ 결과', from: 'explore.lab.table' },
      { key: 'conclusion', label: '⑧ 결론', hint: '결과에서 알 수 있는 것을 써요.' },
      { key: 'more', label: '⑨ 더 알고 싶은 점·아쉬운 점' },
    ],
    checks: ['바꾼 조건이 하나뿐인가요?', '물의 양과 붓는 빠르기를 같게 했나요?', '결론이 결과에서 나왔나요?'],
  },
};
