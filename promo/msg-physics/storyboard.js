// MSG 초·과·심 물리 소개 영상 — 장면 목록. 내레이션은 기존 우루사쌤 OmniVoice 클립만 쓴다(새 음성 없음).
// view: 'slide'(제목 장면) | 'app'(실제 앱을 자동 조작) · clip: sample-v2/audio/voice-library.json 의 id
// acts: [초, 동작] — 동작은 {click: 선택자} | {text: '단추 글자'} | {eval: 'iframe 안에서 실행할 식'}
export const TITLE = 'MSG 초·과·심 LIVE — 살아 움직이는 초등과학심화';
// 브랜드는 한 곳에서: 이름을 바꾸면 영상 전체(칩·표지·마지막 장)가 따라 바뀐다. 음성 대사는 voice-promo.json.
export const BRAND = { chip: 'MSG 초·과·심 LIVE', name: '초·과·심 LIVE', meaning: '초등과학심화', tagline: '초등과학심화, 이제 살아 움직인다' };
export const demoScenes = [
  { id: 'cover', view: 'slide', clip: 'l1-structure', chip: 'MSG 초·과·심 × 사이언스 랩',
    kicker: '초·과·심 물리 1·2차시', title: ['교재 속 과학을,', '직접 재 보는 수업으로'], sub: '용수철저울 · 영점 · 눈높이 · 탄성 · 그래프', art: 'cover' },
  { id: 'start', view: 'app', url: 'start.html', clip: 'predict-first', label: '처음 화면에서 바로 고르기', note: '학생 스스로 공부 · 교사 가르치기 · 살아있는 책 · A4 인쇄' },
  { id: 'inquiry', view: 'app', url: 'student.html?page=3', clip: 'l1-inquiry', label: '1차시 · 생활 물건 다섯 가지', note: '크기와 모양만 보고 무게를 비교할 수 있을까?',
    acts: [[13, { click: '#guide-action' }]] },
  { id: 'use', view: 'app', url: 'student.html?page=5', clip: 'l1-use', label: '3D 가상 용수철저울', note: '영점 → 매달기 → 멈춘 뒤 읽기', acts: [[0.6, { click: '#guide-action' }]] },
  { id: 'zero', view: 'app', url: 'student.html?page=5', clip: 'method-error', label: '영점 확인을 놓치면', note: '답 대신 "어떤 과정을 다시 볼까?"를 묻는다', acts: [[0.3, { click: '#guide-action' }], [1.6, { eval: 'window.__promoHangWithoutZero?.()' }]] },
  { id: 'record', view: 'app', url: 'student.html?page=5', clip: 'l1-inquiry-record', label: '예상 → 측정 → 비교', note: '처음 예상과 다시 잰 기록을 모두 남긴다', acts: [[0.3, { click: '#guide-action' }]] },
  { id: 'eye', view: 'app', url: 'student.html?page=6', clip: 'l1-eye', label: '눈높이에 따라 달라 보이는 눈금', note: '위 · 같은 높이 · 아래에서 비교', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'watch', view: 'app', url: 'student.html?page=9', clip: 'l1-watch', label: '과학 이야기 · 시계 속 용수철', note: '1949년 기록영상을 책 안에서 바로', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'future', view: 'app', url: 'student.html?page=10', clip: 'l1-future', label: '미래의 용수철', note: '극소 코일 · 4D 프린팅 · 2D 재료', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'elastic', view: 'app', url: 'student.html?page=12', clip: 'l2-elastic', label: '2차시 · 탄성', note: '당겼다 놓으면 원래 모양으로', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'measure', view: 'app', url: 'student.html?page=15', clip: 'l2-measure', label: '같은 추를 하나씩', note: '10 · 20 · 30 g → 늘어난 길이 기록', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'graph', view: 'app', url: 'student.html?page=16', clip: 'l2-graph', label: '표에서 그래프로', note: '숫자가 점이 되고, 관계가 보인다', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'tools', view: 'app', url: 'student.html?page=18', clip: 'l2-tools', label: '생활 속 용수철', note: '볼펜 · 스테이플러 · 트램펄린', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'test', view: 'app', url: 'student.html?page=11', clip: 'l1-test-a', label: '일일 테스트', note: '말로 초안 → 고쳐 쓰기 → 셀프 체크', acts: [[0.5, { click: '#guide-action' }]] },
  { id: 'battle', view: 'app', url: 'teacher.html?page=5', clip: 'measurement-complete', label: '가르치기 · 두 팀 배틀', note: '같은 물건, 두 개의 저울, 한 판 승부', acts: [[0.4, { click: '#battle' }]], hold: 4 },
  { id: 'end', view: 'slide', clip: 'read-l1-inquiry-record-02', chip: 'MSG 초·과·심 × 사이언스 랩',
    kicker: '읽고 · 재고 · 설명하는', title: ['느낌 대신,', '눈금으로 확인하는 과학'], sub: '스스로 공부 · 가르치기 · 살아있는 책 · A4 인쇄 교재', art: 'end' },
];

// ── 프로그램 소개판(기본) — 내레이션 p01~p16 = voice-promo.json(원장 PC에서 우루사쌤 목소리로 생성), 중간 한 장면은 실제 수업 음성 ──
const C = BRAND.chip;
export const scenes = [
  { id: 'cover', view: 'slide', clip: 'p01-hello', chip: C, kicker: '대치 MSG 영재교육', title: ['초·과·심 LIVE', '살아 움직이는 과학'], sub: '초등과학심화 · 읽고, 직접 재고, 설명하는 수업', art: 'cover' },
  { id: 'name', view: 'deck', clip: 'p02-name', chip: C, layout: 'meaning', kicker: '초·과·심이란', title: '초등 과학 심화', items: [['초', '초등'], ['과', '과학'], ['심', '심화']], phil: '처음 과학을 만나는 아이의 마음으로 만들었어요' },
  { id: 'who', view: 'deck', clip: 'p03-who', chip: C, layout: 'cards', kicker: '이런 아이와 함께', title: '두 아이 모두, 여기서 시작해요',
    items: [{ n: 'A', t: '과학이 어렵고 관심이 없던 아이', p: '재미있는 그림과 실험으로 첫걸음을 가볍게' }, { n: 'B', t: '과학 이야기는 좋아하지만 내용이 아쉬운 아이', p: '정확한 개념과 심화로 탄탄하게', hl: true }] },
  { id: 'design', view: 'app', url: 'book.html?page=1', clip: 'p04-design', kicker: '교재 철학', label: '보기 편한 교재', note: '넉넉한 여백 · 선명한 그림과 사진' },
  { id: 'story', view: 'app', url: 'student.html?page=9', clip: 'p05-story', kicker: '쉬어가기 · 과학 이야기', label: '배운 개념에서 이어지는 심화', note: '읽다 보면 다음 개념이 궁금해진다' },
  { id: 'test', view: 'app', url: 'student.html?page=11', clip: 'p06-test', kicker: '데일리 테스트', label: '교과 + 영재원 스타일', note: '쉬운 문제부터 깊이 생각할 문제까지' },
  { id: 'howto', view: 'deck', clip: 'p07-howto', chip: C, layout: 'flow', kicker: '수업은 이렇게', title: '읽어 오고, 함께 고민하고, 직접 해 본다',
    items: [{ t: '예습', p: '교재를 한 번 읽어 오기 — 다 알 필요는 없어요' }, { t: '본 수업', p: '그림과 내용을 함께 고민하기', hl: true }, { t: '직접 해 보기', p: '3D 실험과 기록으로 확인하기' }] },
  { id: 'screen', view: 'app', url: 'start.html', clip: 'p08-screen', kicker: '초·과·심 LIVE', label: '처음 화면에서 바로 고르기', note: '스스로 공부 · 가르치기 · 살아있는 책 · A4 인쇄' },
  { id: 'self', view: 'app', url: 'student.html?page=3', clip: 'p09-self', kicker: '스스로 공부하기', label: '우루사쌤이 한 단계씩', note: '예상 → 측정 → 기록 → 다시 확인' },
  { id: 'lab', view: 'app', url: 'student.html?page=5', clip: 'p10-lab', kicker: '3D 가상 실험', label: '진짜처럼 움직이는 용수철저울', note: '영점 → 매달기 → 눈금 읽기' },
  { id: 'voice', view: 'app', url: 'student.html?page=12', clip: 'l2-elastic', kicker: '실제 수업 음성', label: '당겼다 놓으면?', note: '실험하면서 우루사쌤이 바로 옆에서' },
  { id: 'mistake', view: 'app', url: 'student.html?page=5', clip: 'p11-mistake', kicker: '과정을 스스로 점검', label: '답 대신 질문으로', note: '"어떤 과정을 다시 살펴볼까?"' },
  { id: 'grade', view: 'app', url: 'student.html?page=11', clip: 'p11b-grade', kicker: '데일리 테스트', label: '채점 · 첨삭 · 처방 문제', note: '두 번 헷갈리면 비슷한 문제로 다시' },
  { id: 'battle', view: 'app', url: 'teacher.html?page=5', clip: 'p12-battle', kicker: '가르치기', label: '두 팀 배틀', note: '같은 물건, 두 개의 저울, 한 판 승부', hold: 2 },
  { id: 'tree', view: 'deck', clip: 'p13-tree', chip: C, layout: 'tree', kicker: '과학 계통도 · 물리', title: '초·과·심에서 고등 물리까지',
    items: [{ s: '초·과·심', t: '자석의 이용' }, { s: '심화', t: '자기장 · 자기력선' }, { s: '중학교 2학년', t: '전기와 자기' }, { s: '통합과학', t: '물질과 전자기장' }, { s: '고등', t: '물리 Ⅰ · Ⅱ' }] },
  { id: 'tree2', view: 'deck', clip: 'p14-tree2', chip: C, layout: 'tree', kicker: '과학 계통도 · 화학', title: '물질의 상태에서 에너지의 출입까지',
    items: [{ s: '초·과·심', t: '물질의 상태' }, { s: '초등', t: '물의 상태 변화' }, { s: '중학교', t: '물질의 상태 변화' }, { s: '중학교 3학년', t: '물리 변화 · 화학 변화' }, { s: '심화', t: '에너지의 출입' }] },
  { id: 'media', view: 'app', url: 'student.html?page=10', clip: 'p15-video', kicker: '영상 · 인쇄', label: '교재에 맞춘 영상', note: '화면 그대로 A4 교재로 인쇄' },
  { id: 'end', view: 'slide', clip: 'p16-end', chip: C, kicker: '대치 MSG 영재교육', title: ['초등과학심화,', '이제 살아 움직인다'], sub: '초·과·심 LIVE — 스스로 공부 · 가르치기 · 살아있는 책', art: 'cover' },
];
