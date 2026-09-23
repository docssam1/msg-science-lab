import {objectGraphic} from './inquiry.js';
const lines=n=>'<div class="write-lines">'+'<i></i>'.repeat(n)+'</div>';
const card=(id,name)=>`<div>${objectGraphic(id)}<strong>${name}</strong></div>`;
export const introPages=[
 {id:'intro-predict',lesson:1,source:[10],extension:true,kicker:'PREDICT · 추가 탐구',title:'저울은 왜\n필요할까요?',lead:'두 물체 비교 → 비슷한 세 물체 줄 세우기',action:'inquiry',
  body:`<section class="unit-section"><h3><span>01</span>어느 것이 더 무거울까요?</h3><p>무게 차이가 큰 두 가상 물체입니다. 더 무거울 것 같은 물체에 표시하고 이유를 말해 봅시다.</p><div class="intro-object-row">${card('ball','A · 공')}${card('metal','B · 금속 추')}</div><p>나의 예상: __________　그렇게 생각한 이유:</p>${lines(1)}</section><section class="unit-section"><h3><span>02</span>가벼운 것부터 줄 세워요.</h3><p>겉모양이 같고 무게가 비슷한 세 주머니입니다. C·D·E를 예상한 순서대로 써 보세요.</p><div class="intro-object-row three">${card('pouch-c','C · 주머니')}${card('pouch-d','D · 주머니')}${card('pouch-e','E · 주머니')}</div><p>가벼울 것 같은 순서: ______ → ______ → ______</p>${lines(1)}</section><button class="page-action" data-action="inquiry">예상하고 직접 측정하기</button><div class="teacher-answer">예상 단계에서는 정답을 공개하지 않습니다. 가상 설정은 A 4 N, B 12 N, C 8 N, D 10 N, E 9 N입니다. 측정한 뒤에만 B가 더 무겁고 C→E→D 순임을 비교합니다.</div>`,
  teacher:'원본 문항이 아닌 추가 탐구입니다. 두 물체의 무게 차이, 세 물체의 미세한 차이를 예상하게 하고 이유를 듣습니다. 맞고 틀림을 미리 평가하지 않고 모든 예상을 남깁니다.'},
 {id:'intro-method',lesson:1,source:[10],extension:true,kicker:'INVESTIGATE · 추가 탐구',title:'예상과 측정,\n어떻게 다를까요?',lead:'용수철저울로 확인하고 실험 방법을 점검해요.',action:'inquiry',
  body:`<section class="unit-section"><h3><span>03</span>물체를 재고 내 눈금 기록하기</h3><p>앞에서 예상한 다섯 물체를 용수철저울에 차례로 매달아 봅시다. 읽은 눈금과 내 실험 방법을 기록하세요.</p><table class="book-table"><thead><tr><th>물체</th><th>첫 기록(N)</th><th>다시 잰 기록(N)</th></tr></thead><tbody>${['A · 공','B · 금속 추','C · 주머니','D · 주머니','E · 주머니'].map(n=>`<tr><th>${n}</th><td></td><td></td></tr>`).join('')}</tbody></table></section><section class="inquiry"><b>“실험 방법에 오류가 있어요. 과정을 다시 점검해 보세요.”</b><p>이 안내가 나오면 어디에서 문제가 생겼을지 스스로 찾아봅니다. 처음 기록을 지우지 말고 바꾼 방법과 새 기록을 나란히 남기세요.</p><p>내가 한 일 → 문제라고 생각한 과정 → 바꿀 방법</p>${lines(2)}</section><section class="unit-section"><h3><span>04</span>예상과 결과 비교하기</h3><p>더 무거운 물체는 ______ . 세 주머니를 가벼운 것부터 놓으면 ______ → ______ → ______ 입니다.</p><p>저울이 필요한 까닭과 실험 방법을 점검해야 하는 까닭은 무엇일까요?</p>${lines(2)}</section><button class="page-action" data-action="inquiry">탐구 실험실 열기</button><div class="teacher-answer">시작할 때 영점 확인 여부를 말하거나 자동으로 맞추지 않습니다. 실제 조작 기록으로 빈 저울 기준, 진동이 멈췄는지, 관찰 위치, 매단 물체를 점검합니다. 학생에게 첫 오류 원인을 공개하지 않습니다. 같은 기준 오차는 순서를 그대로 둘 수도 있으므로 ‘순서가 맞음’과 ‘측정 방법이 타당함’을 구분합니다.</div>`,
  teacher:'탐구 시작 시 기준 오차 2 N이 있습니다. 오류 안내는 측정 제출 후에만 내보내며 ‘영점이 안 맞았다’는 원인을 자동으로 알려주지 않습니다. 진동 중 읽기와 눈높이 오류도 실제 상태로 판단합니다. 학생이 수정 방법을 설명하고 재측정하게 합니다.'}
];
export const introNarration={
 'intro-predict':{id:'intro-predict',text:'저울은 왜 필요할까요? 먼저 두 물체 중 어느 것이 더 무거울지 예상해 보세요. 다음에는 비슷한 세 주머니를 가벼울 것 같은 순서대로 놓아 봅시다. 예상을 남긴 다음 저울로 확인해요.'},
 'intro-method':{id:'intro-method',text:'예상한 다섯 물체를 직접 재 보세요. 측정 기록을 제출하면 실험 방법도 함께 점검합니다. 문제가 있다고 나오면 내가 한 과정을 되짚고 같은 물체를 다시 재 봅시다.'}
};
