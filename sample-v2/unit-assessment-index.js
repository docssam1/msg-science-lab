// PART I 단원평가의 출처 색인이다. 원본 문항·그림·정답을 옮긴 온라인 문제은행이 아니다.
// 학생용 앱에 정답이 선공개되지 않도록 이 파일에는 문항 본문과 정답을 넣지 않는다.
export const unitAssessmentSource = Object.freeze({
  title: '초과심_물리 PART I 무게 재기 · 단원평가',
  learnerStage: '초등과학심화 · 초과심_물리 PART I 학습 후 (학년 미지정)',
  studentPdfSha256: 'B2187A8CDCB37DA707177B722D856CEAF91B60F334C8FCE5B0ABC9D721F32B6F',
  answerPdfSha256: '42540D7655FAD2C7ED3F97A88AFFBC0B1632850EBD006365BD9C2188DE2FECCB',
  printedPages: [44, 45, 46, 47],
  sourceKind: 'original',
  release: 'locked',
});

// printedPage는 책의 쪽 번호다. PDF 뷰어의 1부터 시작하는 페이지는 +1이다.
// answerPrintedPage 역시 해설책 인쇄 쪽 번호다. 원본 문제와 별도 보존한다.
const entries = [
  [1, 44, 2, 'parts', true],
  [2, 44, 2, 'zero', false],
  [3, 44, 2, 'hand-measurement', false],
  [4, 44, 2, 'reading-procedure', false],
  [5, 44, 2, 'tool-selection', false],
  [6, 44, 2, 'extension-table', true],
  [7, 45, 2, 'extension-table', true],
  [8, 45, 2, 'weight-extension', false],
  [9, 45, 2, 'gravity', false],
  [10, 45, 2, 'spring-force', false],
  [11, 45, 2, 'spring-applications', true],
  [12, 45, 3, 'spring-applications', false],
  [13, 46, 3, 'balance-state', false],
  [14, 46, 3, 'balance-choice', true],
  [15, 46, 3, 'balance-arm', true],
  [16, 46, 3, 'seesaw-reasoning', true],
  [17, 46, 3, 'spring-difference', false],
  [18, 47, 3, 'balance-comparison', true],
  [19, 47, 3, 'balance-placement', false],
  [20, 47, 3, 'mobile-comparison', true],
];

export const unitAssessmentIndex = Object.freeze(entries.map(([number, printedPage, answerPrintedPage, topic, visual]) => Object.freeze({
  id: `part1-u01-${String(number).padStart(2, '0')}`,
  number,
  printedPage,
  pdfPage: printedPage + 1,
  answerPrintedPage,
  answerPdfPage: answerPrintedPage + 1,
  topic,
  visual,
  responseType: 'choice',
  answerState: number === 17 ? 'conflict-review' : 'pending-independent-check',
  onlineGrading: false,
})));
