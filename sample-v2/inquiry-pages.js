import {inquiryObjectArt as obj} from './inquiry-art.js';
const lines=n=>`<div class="write-lines">${'<i></i>'.repeat(n)}</div>`;
const action=`<button class="page-action" data-action="inquiry">↗ 예상하고 직접 재 보기</button>`;
export const inquiryPages=[
 {id:'l1-intro',lesson:1,source:[10],added:true,kicker:'PREDICT · 추가 도입 탐구',title:'저울은\n왜 필요할까요?',lead:'느낌으로 예상한 뒤, 측정한 값으로 확인해요.',action:'inquiry',teacher:'처음에는 영점·흔들림·눈높이를 설명하거나 확인 여부를 알려 주지 않습니다. 두 물체 비교와 세 물체 줄 세우기 예상에 이유를 묻고 기록을 남깁니다. 이어지는 측정에서 방법을 스스로 점검하게 합니다.',body:`
 <section class="inquiry-lead"><span>01 · 두 물건 비교</span><h3>어느 것이 더 무거울까요?</h3><div class="inquiry-objects pair"><figure>${obj('foam')}<figcaption>스펀지 공</figcaption></figure><figure>${obj('book')}<figcaption>두꺼운 책</figcaption></figure></div><p>더 무거울 것 같은 물건: <span class="blank-line"></span><br>그렇게 생각한 까닭:</p>${lines(1)}</section>
 <section class="inquiry-lead"><span>02 · 비슷한 세 물건 줄 세우기</span><h3>겉모양만 보고 순서를 정할 수 있을까요?</h3><div class="inquiry-objects trio">${['A','C','B'].map(id=>`<figure>${obj(id)}<figcaption>필통 ${id}</figcaption></figure>`).join('')}</div><div class="rank-print">가벼울 것 같은 쪽 <b> (　　) → (　　) → (　　) </b> 무거울 것 같은 쪽</div><p>얼마나 확신하나요? □ 확실해요　□ 아직 모르겠어요</p></section>
 ${action}<p class="fiction-note">본책 10쪽과 연결한 추가 탐구입니다. 실제 제품을 측정한 값이 아닌, 서로 다른 무게를 가진 가상 물건을 사용합니다. 예상이 틀려도 감점하지 않습니다.</p>`},
 {id:'l1-inquiry-record',lesson:1,source:[10,11],added:true,kicker:'INVESTIGATE · 추가 도입 탐구',title:'재 보고, 비교하고,\n방법을 돌아봐요.',lead:'먼저 한 예상은 지우지 않고, 측정한 값을 나란히 기록합니다.',action:'inquiry',teacher:'가상 물건의 참값은 공 4 N, 책 20 N, 필통 A 12 N·B 10 N·C 14 N입니다. 빈 저울은 처음에 +2 N 오차가 있지만 학생에게 선제적으로 알리지 않습니다. 기록 제출 후에만 일반적인 실험 방법 점검 안내를 보냅니다. 같은 영점 오차는 순서를 바꾸지 않고 측정값 전체를 이동시키므로, 비교 순서가 맞아도 측정법이 타당한지 별도로 확인합니다. 진동·시점·물체를 단 채 조절도 실제 행동 기록으로 확인합니다.',body:`
 <section class="inquiry-lead"><span>03 · 용수철저울로 확인</span><p>다섯 물건을 차례로 매달아 읽은 값을 적어 보세요. 스스로 정한 방법과 순서를 설명합니다.</p><table class="book-table inquiry-record-table"><thead><tr><th>물건</th><th>첫 측정 (N)</th><th>방법을 바꾼 뒤 (N)</th></tr></thead><tbody>${['스펀지 공','두꺼운 책','필통 A','필통 B','필통 C'].map(n=>`<tr><th>${n}</th><td></td><td></td></tr>`).join('')}</tbody></table></section>
 <section class="inquiry-lead"><span>04 · 방법 돌아보기</span><p><b>준비 → 매달기 → 관찰 → 읽기 → 기록</b> 중 무엇을 점검했나요?</p>${lines(2)}<p>어떤 방법을 바꾸었고, 결과는 어떻게 달라졌나요?</p>${lines(2)}</section>
 <section class="inquiry-lead"><span>05 · 증거로 설명</span><p>측정 뒤 필통의 순서: (　　) → (　　) → (　　)<br>손으로 느낀 무게 대신 저울의 값으로 비교하면 좋은 점은?</p>${lines(1)}</section>
 <p class="teacher-answer inquiry-teacher-note"><b>교사용:</b> 학생에게 처음부터 점검할 부품이나 원인을 알려 주지 않습니다. 방법을 바꾸기 전후의 기록과 그 이유를 함께 평가합니다. 예상과 결과가 달라도 감점하지 않습니다.</p>
 ${action}<p class="fiction-note">처음 결과와 다시 잰 결과는 모두 남습니다. 추가 활동의 가상 수치이며 본책의 실험·평가 자료와 별개입니다.</p>`}
];
export const inquiryNarration={
 'l1-intro':{id:'l1-intro',text:'저울은 왜 필요할까요? 스펀지 공과 두꺼운 책 중 어느 것이 더 무거울지 예상해 보세요. 이번에는 비슷하게 생긴 필통 세 개를 가벼울 것 같은 순서로 줄 세워 봅시다. 먼저 정한 예상은 남겨 두고, 저울로 확인해 봐요.'},
 'l1-inquiry-record':{id:'l1-inquiry-record',text:'먼저 예상한 순서를 지우지 마세요. 물건을 하나씩 재고, 읽은 값을 그대로 기록해 봅시다. 결과를 모은 뒤에는 준비부터 기록까지 내가 어떤 방법으로 실험했는지 돌아보세요. 방법을 바꿨다면, 다시 잰 결과도 함께 남깁니다.'}
};
