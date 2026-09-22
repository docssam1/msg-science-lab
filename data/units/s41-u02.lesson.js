// 4-1 Ⅱ 물의 상태 변화 — 5E 화면·교재 구성(문항 id는 s41-u02.js의 items 참조)
// docssam 말풍선은 한 문장·25자 안팎·~해요체. mood: talk|surprised|thinking|praise|encourage
export const lesson = {
  unitId: 's41-u02', grade: 4, title: '물의 상태 변화', hero: '얼음 병 저울',
  engage: {
    say: [{ mood: 'surprised', text: '어? 얼린 페트병이 뚱뚱해졌어요!' }, { mood: 'thinking', text: '물이 얼면 무엇이 달라질까요?' }],
    scene: 'freeze-bottle',
    question: '물을 반쯤 담은 병을 얼리면 높이와 무게는 어떻게 될까요?',
    predictions: [
      { id: 'both', text: '높이도 올라가고 무게도 늘어난다' },
      { id: 'height', text: '높이는 올라가고 무게는 그대로다' },
      { id: 'down', text: '높이는 내려가고 무게는 줄어든다' },
    ],
    answer: 'height',
    wrongNote: '실험 결과는 달랐어요. 얼면 부피만 늘고 무게는 그대로였어요.',
  },
  explore: {
    say: [{ mood: 'talk', text: '물을 얼렸다 녹이며 재어 봐요.' }],
    modes: ['lab', 'scene', 'home'],
    lab: {
      kind: 'freeze', amounts: [60, 100, 140],
      goal: '물의 양을 고르고, 얼리기 전과 후의 높이·무게를 표에 적어 보세요.',
      columns: ['상태', '물의 양(mL)', '높이(칸)', '무게(g)'],
      rowText: (r) => `${r.state} ${r.ml} mL → 높이 ${r.height}칸, 무게 ${r.mass} g`,
    },
    home: {
      title: '얼음 병 저울 실험', minutes: 20, guardian: true,
      materials: [
        { name: '주방 저울', qty: '1개', have: 'buy', buy: { coupangUrl: null, query: '주방 전자저울 1g', priceKRW: null, rocket: true } },
        { name: '작은 플라스틱 병(뚜껑 있는 것)', qty: '1개', have: 'home' },
        { name: '유성 매직', qty: '1개', have: 'home' },
        { name: '냉동실', qty: '', have: 'home' },
      ],
      steps: [
        '플라스틱 병에 물을 반쯤 넣고 뚜껑을 닫아요.',
        '물 높이에 매직으로 선을 긋고, 저울로 무게를 재어 적어요.',
        '병을 냉동실에 넣고 물이 다 얼 때까지 기다려요(반나절 정도).',
        '꺼내서 얼음 높이를 선과 비교하고, 바로 무게를 다시 재어 적어요.',
        '얼음이 다 녹으면 높이와 무게를 한 번 더 재어 봐요.',
      ],
      safety: ['유리병은 쓰지 않아요. 얼면서 깨질 수 있어요.', '병을 가득 채우지 말고 반쯤만 넣어요.', '꺼낸 병 겉에 맺힌 물방울은 닦고 무게를 재요(응결한 물이 무게에 더해져요).'],
      kitUrl: 'https://lete-on.gfieldacademy.net/science-lab/v2/#/s41-u02/kit',
      qr: '../assets/qr-s41-u02-kit.svg',
    },
  },
  explain: {
    say: [{ mood: 'talk', text: '물의 상태 변화를 정리해 볼까요?' }],
    analogy: '물은 모습만 바꾸는 변신 선수예요. 얼음·물·수증기로 모습이 바뀌어도 물의 양은 그대로예요.',
    principle: '물이 얼면 부피는 늘어나고 무게는 변하지 않아요. 얼음이 녹으면 부피가 다시 줄어들어요.',
    fromData: (rows) => {
      const pair = rows.map((w) => [w, rows.find((i) => i.state === '얼음' && i.ml === w.ml)]).find(([w, i]) => w.state === '물' && i);
      if (!pair) return rows.length ? '물과 얼음을 같은 양으로 한 번씩 적으면 비교해 줄게요.' : '';
      const [w, i] = pair;
      return `네 기록: 물 ${w.ml} mL가 얼었더니 높이는 ${w.height}칸에서 ${i.height}칸으로 늘었지만, 무게는 ${w.mass} g 그대로였어요.`;
    },
    cards: ['s41-u02-b01', 's41-u02-b02', 's41-u02-b03', 's41-u02-b04'],
    table: 's41-u02-b05',
    miniTest: ['s41-u02-b06'],
  },
  elaborate: {
    say: [{ mood: 'thinking', text: '얼음은 왜 물에 뜰까요?' }],
    items: ['s41-u02-b07', 's41-u02-b08', 's41-u02-b09', 's41-u02-b14'],
    reading: {
      title: '공기에서 물을 모으는 탑',
      text: '비가 적은 곳에서는 대나무와 그물로 높은 탑을 세우기도 해요. 밤에 차가워진 그물에 공기 중의 수증기가 닿아 물방울로 맺히고, 물방울이 흘러내려 아래 통에 모여요. 응결을 이용해 마실 물을 얻는 거예요.',
    },
    report: true,
  },
  evaluate: {
    say: [{ mood: 'praise', text: '마지막으로 세 문제만 풀어 봐요!' }],
    items: ['s41-u02-b10', 's41-u02-b11', 's41-u02-b12', 's41-u02-b13'], pass: 3,
  },
  report: {
    title: '얼음 병 저울 탐구보고서',
    sections: [
      { key: 'wonder', label: '① 궁금한 점', from: 'engage.question' },
      { key: 'problem', label: '② 탐구 문제', hint: '예) 물이 얼면 부피와 무게는 어떻게 변할까?' },
      { key: 'hypothesis', label: '③ 가설(내 예상)', from: 'engage.prediction' },
      { key: 'vars', label: '④ 조건', hint: '바꿀 조건 / 같게 할 조건 / 측정할 것', default: '바꿀 조건: 물의 상태(물, 얼음)\n같게 할 조건: 물의 양, 병, 저울\n측정할 것: 높이, 무게' },
      { key: 'materials', label: '⑤ 준비물', from: 'explore.home.materials' },
      { key: 'steps', label: '⑥ 실험 과정', from: 'explore.home.steps' },
      { key: 'result', label: '⑦ 결과', from: 'explore.lab.table' },
      { key: 'conclusion', label: '⑧ 결론', hint: '결과에서 알 수 있는 것을 써요.' },
      { key: 'more', label: '⑨ 더 알고 싶은 점·아쉬운 점' },
    ],
    checks: ['바꾼 조건이 하나뿐인가요?', '얼기 전과 후의 무게를 같은 저울로 쟀나요?', '결론이 결과에서 나왔나요?'],
  },
};
