export const SOURCE = '초과심_물리 / PART I 무게 재기 / CHAPTER 01';
export const parts = [
  ['handle', '손잡이', '손으로 잡거나 스탠드에 고정하는 부분이에요.'],
  ['zero', '영점조절나사', '물체를 달기 전에 표시자가 0을 가리키도록 조절해요.'],
  ['spring', '용수철', '물체를 매달면 늘어나는 부분이에요. 측정 범위를 넘기지 않아요.'],
  ['pointer', '표시자', '눈금을 가리키는 부분이에요. 이 저울에서는 표시자의 윗부분을 읽어요.'],
  ['scale', '눈금', '측정값과 단위를 확인해요. 이 가상 저울의 단위는 N(뉴턴)이에요.'],
  ['hook', '고리', '무게를 재려는 물체를 매다는 부분이에요.'],
];
export const stages = [
  {id:'predict', label:'예상', title:'손으로 어림한 무게, 같을까요?', page:'10', prompt:'같은 물체를 들어도 사람마다 다르게 느낄까요?', answer:'손으로 어림하면 정확한 무게를 알기 어려워요. 용수철저울로 측정한 값을 비교할 수 있어요.', teacher:'두 학생의 예상과 근거를 먼저 듣습니다. 그림의 크기만 보고 무게를 판단하지 않도록 합니다.'},
  {id:'parts', label:'구조', title:'저울의 각 부분은 어떤 일을 할까요?', page:'10', prompt:'부품을 하나 선택하고, 그 부품이 없다면 어떻게 될지 말해 보세요.', answer:'손잡이로 고정하고, 영점을 맞춘 뒤 고리에 물체를 매달아요. 표시자가 가리키는 눈금을 읽어요.', teacher:'전자칠판에서 한 명씩 부품을 터치하고 친구에게 기능을 설명하게 합니다.'},
  {id:'zero', label:'영점', title:'아무것도 달지 않았는데 0이 아니네요', page:'10', prompt:'영점조절나사를 움직여 표시자의 윗부분을 0에 맞춰 보세요.', answer:'물체를 매달기 전에 영점을 맞춰야 해요. 물체를 매단 상태에서 0으로 맞추면 안 돼요.', teacher:'처음 4 N의 영점 오차가 있습니다. 학생이 직접 − 조절을 두 번 눌러 0으로 맞추게 합니다.'},
  {id:'measure', label:'측정', title:'물체를 걸고 표시자를 관찰해요', page:'10–11', prompt:'물체를 매단 직후에 눈금을 읽어도 될까요?', answer:'표시자의 흔들림이 멈출 때까지 기다려요. 측정 범위를 넘는 물체는 달지 않아요.', teacher:'측정 중에는 읽기 버튼이 잠깁니다. 40 N 물체를 선택해 30 N 범위의 한계를 토론할 수 있습니다.'},
  {id:'eye', label:'눈높이', title:'보는 높이가 바뀌면 눈금도 달라 보여요', page:'11', prompt:'위·같은 높이·아래에서 보며 눈금을 비교해 보세요.', answer:'표시자의 윗부분과 눈높이를 수평으로 맞춰요. 물체는 그대로인데 보는 방향 때문에 눈금이 다르게 보일 수 있어요.', teacher:'가상 모형의 눈금은 아래로 갈수록 커집니다. 눈높이를 바꿔도 실제 힘과 용수철 상태는 변하지 않습니다.'},
  {id:'types', label:'저울 종류', title:'무엇을 재려는지에 따라 저울을 골라요', page:'12', prompt:'실험용 추, 채소, 사람의 몸에는 어떤 저울을 사용할까요?', answer:'용수철저울은 추와 여러 물체, 앉은뱅이저울은 채소 등, 체중계는 사람의 몸을 재는 데 사용해요.', teacher:'종류별 용도와 사용 전 0 확인, 표시가 멈춘 뒤 읽는 공통점을 묻습니다.'},
  {id:'story', label:'과학 이야기', title:'용수철의 과거와 미래', page:'13–14', prompt:'교재의 과학 이야기를 읽고, 용수철을 쓰는 도구를 찾아보세요.', answer:'교재에서 용수철의 이름, 코일 형태의 등장, 앞으로의 활용을 찾아 친구에게 소개해 보세요.', teacher:'역사와 미래 기술의 연대·성능 수치를 새 사실처럼 덧붙이지 않고 원문 읽기로 연결합니다.'},
  {id:'daily', label:'일일평가', title:'내가 이해한 내용을 확인해요', page:'15', prompt:'교재의 daily test 6문항입니다. 답을 쓴 뒤 확인해 보세요.', answer:'제출 후 문항별 풀이와 다시 살펴볼 실험을 확인해요.', teacher:'단원평가 20문항과 별개인 CHAPTER 01의 daily test입니다. 서답형의 답을 학생이 직접 씁니다.'},
];
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function scaleReading(force = 0, zero = 0, eye = 0) {
  if (!Number.isFinite(force) || force < 0 || force > 30) return {overload:true};
  return {overload:false, force, zero, trueReading:force + zero, apparent:force + zero + eye * 2};
}
export function projection(eye, value = 20) {
  const pointerY = 140 + value * 7;
  const eyeY = pointerY - eye * 70;
  // Pointer is in front of the scale. Extend the eye-pointer ray back to the scale.
  const apparentY = pointerY + (pointerY - eyeY) * (32 / 160);
  return {pointerY, eyeY, apparentY};
}
export function normalizeAnswer(s) { return String(s ?? '').normalize('NFKC').replace(/[\s·.,()]/g,'').toLowerCase(); }
export const daily = [
  {id:'d1', kind:'parts', page:15, prompt:'다음 사진의 용수철저울을 가리키고 있는 각 부분의 이름을 ( ) 안에 쓰시오.', answer:['영점조절나사','용수철','표시자','고리'], explanation:'ㄱ 영점조절나사, ㄴ 용수철, ㄷ 표시자, ㄹ 고리입니다.', revisit:1},
  {id:'d2', kind:'choice', page:15, prompt:'용수철저울을 사용할 때 가장 먼저 해야 할 일은 무엇인지 올바른 내용을 고르시오.', options:['무게를 읽는다.','물체를 매단다.','영점을 맞춘다.','그래프를 그린다.','용수철을 잡아당겨 본다.'], answer:'2', explanation:'물체를 달기 전에 영점을 맞춥니다.', revisit:2},
  {id:'d3', kind:'text', page:15, prompt:'다음은 용수철 구조에 대한 설명입니다. ( )에 들어갈 알맞은 용수철의 구조를 쓰시오.', passage:'용수철저울에서 물체를 매달았을 때 눈금을 읽을 수 있는 표시를 해주는 장치를 (          )라고 한다.', answer:'표시자', explanation:'눈금을 가리키는 부분은 표시자입니다.', revisit:1},
  {id:'d4', kind:'eye', page:15, prompt:'다음과 같이 용수철저울로 물체의 무게를 잴 때, 눈금을 읽는 눈높이로 알맞은 곳의 기호를 쓰시오.', answer:'ㄴ', explanation:'표시자의 윗부분과 같은 높이인 ㄴ에서 읽습니다.', revisit:4},
  {id:'d5', kind:'choice', page:15, prompt:'다음 <보기>에 제시된 내용을 읽고 문장에 맞도록 ○표를 하시오.', passage:'용수철저울에서 표시자가 가리키고 있는 숫자가 20N입니다. 만약 눈금을 위에서 내려다보면 (20N초과, 20N, 20N미만)으로 보인다.', options:['20N초과','20N','20N미만'], answer:'0', explanation:'그림처럼 눈금이 아래로 커지고 표시자가 눈금 앞에 있는 저울에서는 위에서 보면 더 큰 눈금을 읽게 됩니다. 눈높이 실험에서 비교해 보세요.', revisit:4},
  {id:'d6', kind:'choice', page:15, prompt:'다음 <보기>에 제시된 내용을 읽고 문장에 맞도록 ○표를 하시오.', passage:'용수철저울에 물체를 매달 때는 (고리, 손잡이)에 매달아 무게를 잽니다.', options:['고리','손잡이'], answer:'0', explanation:'아래쪽 고리에 물체를 매달고 위쪽 손잡이로 저울을 고정합니다.', revisit:1},
];
export function gradeDaily(values) {
  return daily.map(q => {
    const v = values[q.id];
    const correct = Array.isArray(q.answer) ? q.answer.every((a,i) => normalizeAnswer(v?.[i]) === normalizeAnswer(a)) : normalizeAnswer(v) === normalizeAnswer(q.answer);
    return {id:q.id, correct};
  });
}
