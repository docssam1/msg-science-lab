// 4-1 Ⅲ 땅의 변화 — 두 번째 5단계 수업 「화산 실험실」(소단원 E3~E6). 문항은 s41-u03.js의 items를 같이 쓴다.
// docssam 말풍선은 한 문장·25자 안팎·~해요체. mood: talk|surprised|thinking|praise|encourage
export const lesson = {
  unitId: 's41-u03b', grade: 4, title: '땅의 변화 · 화산', hero: '화산 실험실', parent: 's41-u03', elements: ['E3', 'E4', 'E5', 'E6'],
  engage: {
    say: [{ mood: 'surprised', text: '산꼭대기에서 연기와 불이 솟아요!' }, { mood: 'thinking', text: '화산에서는 무엇이 나올까요?' }],
    scene: 'volcano-erupt',
    question: '화산이 분출할 때 나오는 것을 상태별로 나누면 몇 가지일까요?',
    predictions: [
      { id: 'one', text: '뜨거운 용암 한 가지만 나온다' },
      { id: 'three', text: '기체·액체·고체 세 가지가 나온다' },
      { id: 'two', text: '연기와 불, 두 가지가 나온다' },
    ],
    answer: 'three',
    wrongNote: '3D를 다시 봐요. 기체인 화산 가스, 액체인 용암, 고체인 화산재와 암석 조각이 나왔어요.',
  },
  explore: {
    say: [{ mood: 'talk', text: '화산 모형을 가열하고, 식혀도 봐요.' }],
    modes: ['lab', 'scene', 'home'],
    lab: {
      kind: 'volcano',
      goal: '① 화산 모형: 불 세기를 고르고 가열하기를 누르고 있어요. 연기와 흘러나온 마시멜로를 봐요. ② 식히기: 뜨거운 백반 물을 얼음물과 상자에서 식혀 결정 크기를 비교해요.',
      columns: ['실험', '조건', '결과'],
      rowText: (r) => `${r.exp}(${r.cond}) → ${r.result}`,
    },
    home: {
      title: '마시멜로 화산 만들기', minutes: 25, guardian: true,
      materials: [
        { name: '마시멜로', qty: '3개', have: 'buy', buy: { coupangUrl: null, query: '마시멜로 대용량', priceKRW: null, rocket: true } },
        { name: '알루미늄 포일', qty: '한 장', have: 'home' },
        { name: '양초(또는 알코올램프)', qty: '1개', have: 'home' },
        { name: '삼발이 또는 빈 깡통 받침', qty: '1개', have: 'home' },
        { name: '식용 색소(빨강)', qty: '조금', have: 'buy', buy: { coupangUrl: null, query: '식용색소 빨강', priceKRW: null, rocket: true } },
        { name: '얼음물과 작은 그릇 2개', qty: '', have: 'home' },
      ],
      steps: [
        '알루미늄 포일을 산 모양으로 접고 꼭대기에 작은 구멍(분화구)을 뚫어요.',
        '포일 안에 마시멜로를 넣고 빨간 색소를 조금 떨어뜨린 뒤, 삼발이 위에 올려요.',
        '보호자와 함께 양초로 아래를 가열하며 연기·흘러나오는 것·굳는 것을 관찰해요.',
        '흘러나온 마시멜로 일부는 얼음물 그릇에, 일부는 그대로 두고 어느 쪽이 먼저 굳는지 비교해요.',
        '관찰한 것을 화산 가스·용암·화산 암석과 짝지어 표에 적어요.',
      ],
      safety: ['불은 반드시 보호자와 함께 다뤄요.', '가열한 포일과 마시멜로는 아주 뜨거워요. 식을 때까지 만지지 않아요.', '실험한 마시멜로는 먹지 않아요.'],
      kitUrl: 'https://lete-on.gfieldacademy.net/science-lab/v2/#/s41-u03b/kit',
      qr: '../assets/qr-s41-u03b-kit.svg',
    },
  },
  explain: {
    say: [{ mood: 'talk', text: '화산이 내놓는 것과 만든 돌을 정리해요.' }],
    analogy: '화산은 땅속 마그마가 뚜껑을 열고 나오는 커다란 주전자예요. 김(화산 가스)이 먼저 새고, 끓는 물(용암)이 넘치고, 튀는 물방울(화산재·암석 조각)이 날아가요.',
    principle: '화산 분출물은 기체인 화산 가스, 액체인 용암, 고체인 화산재·화산 암석 조각이에요. 마그마가 땅속에서 천천히 식으면 알갱이가 큰 화강암, 땅 위에서 빨리 식으면 알갱이가 작은 현무암이 돼요.',
    fromData: (rows) => {
      if (!rows.length) return '';
      const v = rows.filter((r) => r.exp === '화산 모형'), c = rows.filter((r) => r.exp === '식히기');
      const a = v.length ? `화산 모형에서 ${v.map((r) => `${r.cond}일 때 ${r.result}`).join(', ')}.` : '';
      const b = c.length ? ` 식히기에서 ${c.map((r) => `${r.cond} ${r.result}`).join(', ')}.` : '';
      return `네 기록: ${a}${b} 불이 셀수록 연기와 흘러나온 양이 많고, 천천히 식힐수록 결정이 커요.`;
    },
    cards: ['s41-u03-b03', 's41-u03-b04'],
    table: 's41-u03-b05',
    miniTest: ['s41-u03-b11'],
  },
  elaborate: {
    say: [{ mood: 'thinking', text: '지진은 왜 어떤 곳만 피해가 클까요?' }],
    items: ['s41-u03-b16', 's41-u03-b15', 's41-u03-b09'],
    reading: {
      title: '백두산과 한라산도 화산이에요',
      text: '백두산 꼭대기에는 화산 분출로 생긴 커다란 분화구에 물이 고여 천지가 되었어요. 한라산 꼭대기의 백록담도 분화구예요. 제주도 곳곳의 검은 돌은 용암이 땅 위에서 빨리 식어 생긴 현무암이라 알갱이가 작고 구멍이 많아요. 화산이 있는 곳에는 온천이 많고, 땅속의 열로 전기를 만들기도 해요. 반대로 화산재가 하늘을 덮으면 비행기가 뜨지 못하고 농작물이 상하기도 해요.',
    },
    report: true,
  },
  evaluate: {
    say: [{ mood: 'praise', text: '화산과 지진, 세 문제로 확인해요!' }],
    items: ['s41-u03-b13', 's41-u03-b17', 's41-u03-b12'], pass: 2,
  },
  report: {
    title: '화산 실험실 탐구보고서',
    sections: [
      { key: 'wonder', label: '① 궁금한 점', from: 'engage.question' },
      { key: 'problem', label: '② 탐구 문제', hint: '예) 불이 셀수록 흘러나오는 것이 많을까? 천천히 식힐수록 결정이 클까?' },
      { key: 'hypothesis', label: '③ 가설(내 예상)', from: 'engage.prediction' },
      { key: 'vars', label: '④ 조건', hint: '바꿀 조건 / 같게 할 조건 / 관찰할 것', default: '바꿀 조건: 불 세기(또는 식히는 빠르기)\n같게 할 조건: 마시멜로 양, 포일 모양, 가열 시간\n관찰할 것: 연기, 흘러나온 양, 굳은 뒤 알갱이 크기' },
      { key: 'materials', label: '⑤ 준비물', from: 'explore.home.materials' },
      { key: 'steps', label: '⑥ 실험 과정', from: 'explore.home.steps' },
      { key: 'result', label: '⑦ 결과', from: 'explore.lab.table' },
      { key: 'conclusion', label: '⑧ 결론', hint: '모형의 연기·흘러나온 것·굳은 것을 실제 화산 분출물과 짝지어 써요.' },
      { key: 'more', label: '⑨ 더 알고 싶은 점·아쉬운 점' },
    ],
    checks: ['바꾼 조건이 하나뿐인가요?', '모형에서 나온 것을 실제 화산과 짝지었나요?', '결론이 결과에서 나왔나요?'],
  },
};
