// 4-2 Ⅰ 식물의 생활 — 5E 화면·교재 구성(문항 id는 s42-u01.js의 items 참조)
// docssam 말풍선은 한 문장·25자 안팎·~해요체. mood: talk|surprised|thinking|praise|encourage
export const lesson = {
  unitId: 's42-u01', grade: 4, title: '식물의 생활', hero: '부레옥잠 연못',
  engage: {
    say: [{ mood: 'surprised', text: '어? 부레옥잠은 물에 동동 떠 있어요!' }, { mood: 'thinking', text: '어떻게 가라앉지 않을까요?' }],
    scene: 'pond-plants',
    question: '부레옥잠은 뿌리가 바닥에 닿지 않는데 어떻게 물에 떠서 살까요?',
    predictions: [
      { id: 'air', text: '잎자루에 공기가 들어 있어서' },
      { id: 'root', text: '뿌리가 물을 밀어내서' },
      { id: 'light', text: '잎이 아주 얇고 가벼워서' },
    ],
    answer: 'air',
    wrongNote: '실험 결과는 달랐어요. 볼록한 잎자루 속 공기주머니 덕분에 떠요.',
  },
  explore: {
    say: [{ mood: 'talk', text: '식물을 연못 여기저기에 심어 봐요.' }],
    modes: ['lab', 'scene', 'home'],
    lab: {
      kind: 'pond',
      goal: '식물을 고르고 연못의 땅·물가·깊은 물 중 한 곳을 눌러 심어 보세요. 부레옥잠은 물속으로 눌러 보고, 잎자루도 잘라 보세요.',
      columns: ['식물', '심은 곳', '어떻게 되었나'],
      rowText: (r) => `${r.plant}을 ${r.where}에 심음 → ${r.result}`,
    },
    home: {
      title: '부레옥잠 잎자루 관찰', minutes: 20, guardian: true,
      materials: [
        { name: '부레옥잠', qty: '1포기', have: 'buy', buy: { coupangUrl: null, query: '부레옥잠 수생식물', priceKRW: null, rocket: false } },
        { name: '투명한 그릇이나 수조', qty: '1개', have: 'home' },
        { name: '물', qty: '', have: 'home' },
        { name: '돋보기', qty: '1개', have: 'home' },
        { name: '어린이용 가위(보호자와 함께)', qty: '1개', have: 'home' },
      ],
      steps: [
        '투명한 그릇에 물을 담고 부레옥잠을 띄운 뒤 어떻게 떠 있는지 관찰해요.',
        '볼록한 잎자루를 손가락으로 살짝 눌러 보고 느낌을 적어요.',
        '부레옥잠을 물속으로 꾹 눌러 잎자루에서 무엇이 나오는지 관찰해요.',
        '보호자와 함께 잎자루 하나를 가로로 잘라 돋보기로 단면을 관찰해요.',
        '잘라 낸 잎자루 조각을 물에 넣어 뜨는지 가라앉는지 확인해요.',
      ],
      safety: ['가위는 보호자와 함께 써요.', '관찰한 부레옥잠은 하천이나 저수지에 버리지 않아요(다른 식물이 사는 곳을 덮을 수 있어요).'],
      kitUrl: 'https://lete-on.gfieldacademy.net/science-lab/v2/#/s42-u01/kit',
      qr: '../assets/qr-s42-u01-kit.svg',
    },
  },
  explain: {
    say: [{ mood: 'talk', text: '식물이 사는 곳과 생김새를 정리해요.' }],
    analogy: '부레옥잠의 잎자루는 구명조끼 같아요. 속에 공기가 가득 차 있어서 물에 둥둥 떠요.',
    principle: '식물은 사는 곳의 환경에 알맞은 생김새를 가지고 있어요. 이것을 적응이라고 해요.',
    fromData: (rows) => {
      if (!rows.length) return '';
      const ok = rows.filter((r) => r.ok), bad = rows.filter((r) => !r.ok);
      const a = ok.length ? `잘 산 곳: ${ok.map((r) => `${r.plant}(${r.where})`).join(', ')}` : '';
      const b = bad.length ? `살기 어려웠던 곳: ${bad.map((r) => `${r.plant}(${r.where})`).join(', ')}` : '';
      return `네 기록 — ${[a, b].filter(Boolean).join(' / ')}. 식물마다 알맞은 곳이 달랐어요.`;
    },
    cards: ['s42-u01-b01', 's42-u01-b02', 's42-u01-b03', 's42-u01-b04'],
    table: 's42-u01-b05',
    miniTest: ['s42-u01-b06'],
  },
  elaborate: {
    say: [{ mood: 'thinking', text: '식물에게서 배운 발명품이 있대요.' }],
    items: ['s42-u01-b07', 's42-u01-b08', 's42-u01-b09'],
    reading: {
      title: '도꼬마리가 준 선물, 찍찍이',
      text: '산책을 다녀온 한 사람이 강아지 털과 옷에 잔뜩 붙은 도꼬마리 열매를 들여다봤어요. 가시 끝이 작은 갈고리처럼 휘어 있었지요. 이 모양을 본떠 한쪽에는 갈고리, 다른 쪽에는 고리를 만든 것이 찍찍이 테이프예요. 식물의 생김새를 본떠 물건을 만드는 것을 생체 모방이라고 해요.',
    },
    report: true,
  },
  evaluate: {
    say: [{ mood: 'praise', text: '마지막으로 세 문제만 풀어 봐요!' }],
    items: ['s42-u01-b10', 's42-u01-b11', 's42-u01-b12'], pass: 2,
  },
  report: {
    title: '부레옥잠 연못 탐구보고서',
    sections: [
      { key: 'wonder', label: '① 궁금한 점', from: 'engage.question' },
      { key: 'problem', label: '② 탐구 문제', hint: '예) 부레옥잠이 물에 뜨는 까닭은 무엇일까?' },
      { key: 'hypothesis', label: '③ 가설(내 예상)', from: 'engage.prediction' },
      { key: 'vars', label: '④ 관찰할 것', hint: '잎자루 모양 / 눌렀을 때 나오는 것 / 잘랐을 때 보이는 것', default: '관찰할 것: 잎자루의 모양, 물속에서 눌렀을 때 나오는 것, 잎자루를 잘랐을 때 보이는 것' },
      { key: 'materials', label: '⑤ 준비물', from: 'explore.home.materials' },
      { key: 'steps', label: '⑥ 관찰 과정', from: 'explore.home.steps' },
      { key: 'result', label: '⑦ 결과', from: 'explore.lab.table' },
      { key: 'conclusion', label: '⑧ 결론', hint: '관찰 결과에서 알 수 있는 것을 써요.' },
      { key: 'more', label: '⑨ 더 알고 싶은 점·아쉬운 점' },
    ],
    checks: ['관찰한 사실과 내 생각을 나누어 썼나요?', '잎자루를 누를 때와 자를 때를 모두 관찰했나요?', '결론이 관찰 결과에서 나왔나요?'],
  },
};
