# Claude 작업 기록 — MSG 초·과·심 화면 끌어올리기

브랜치: `claude/jolly-allen-w57yqh` (기준: `review/science-lab-handoff-20260926`). **검수 전 `main` 병합 금지**(REVIEW-HANDOFF 규칙 그대로).
짝 저장소: `docssam1/lete-on`의 과학 탐구 랩(`science-lab/`) — 같은 사람이 같은 기준으로 만든다. 그쪽 기록은 `science-lab/HANDOFF.md` 22~25차.

## 목표 (원장, 2026-09-26)
- "우리 수준으로 끌어올려. 게임이나 3D가 구려." → **우선 구동되는 것처럼 보이도록**(광고 영상을 이 화면으로 찍는다). 기능·원문·정답 데이터는 그대로.
- 다음 차례: 광고 영상 — `lete-on/promo/anssem-hs/anssem-hs-final-10min.html` 형식(1920×1080 슬라이드 + 캐릭터 왼쪽 아래 + 말풍선 자막 + 내레이션, MP4·SRT·포스터 + 소개 페이지).

## 이번에 바꾼 것
- 첫 화면 `sample-v2/start.html`: 우루사쌤·MSG 로고 히어로, 세 모드 카드(학생 카드가 주), PDF 링크. 링크 대상은 그대로.
- 글꼴: `sample-v2/fonts/`(Pretendard 가변, 한글 2,350자 부분집합, OFL) — 외부 글꼴 서버 없이.
- `sample-v2/polish.css`(index.html 마지막에 로드, 화면 전용): 머리 막대 그라데이션, 아래 막대·안내 단추 카드 결, 안내 캐릭터 흰 상자 제거(mix-blend multiply).
- 3D 용수철저울(`lab3d.js`·`everyday-objects-3d.js`)과 2팀 배틀(`battle.js`·`battle.css`)은 별도 작업(아래 기록 참조).

## 지키는 것
- 원본 문장·Daily Test 18문항·정답·저울 값(A 3/6/9 cm, B 4/8/12 cm)은 손대지 않는다.
- 우루사쌤 음성은 기존 OmniVoice MP3만. 교사 화면엔 캐릭터·자동 음성 없음.
- `npm test` 23/23 유지.

## 3D 끌어올림 (2026-09-26, 커밋 ebd6503)
- `lab3d.js`·`everyday-objects-3d.js`: 반사 환경·Neutral 톤·둥근 남색 머리·아크릴 창·한 장짜리 인쇄 눈금판·널링 영점 휠·황동 추, 생활 물건 모양. **9개 모드에서 원본과 눈금 위치·읽음값·드래그 결과 동일**(원본과 나란히 띄워 비교). 남은 약점: 기본 거리에서 눈금 숫자가 작다(카메라 원위치는 눈높이 모드 판정에 쓰여 그대로 둠).

## 브랜드·소개 영상 (2026-09-26)
- 원장: "초·과·심 = **초등과학심화**", "살아 있는 버전이니 철학은 가져오되 브랜드는 업그레이드". → 디지털판 이름 **초·과·심 LIVE**(가칭, `promo/msg-physics/storyboard.js`의 BRAND 한 곳). 철학 문구 "처음 과학을 만나는 아이의 마음"은 이름 풀이가 아니라 철학으로만.
- 근거 자료: 대치 MSG 영재교육 유튜브 「초.과.심 수업 시작합니다」(여은이 팀장) — 예습→본 수업, 쉬어가기·과학 이야기, 데일리 테스트(교과+영재원형), 과학 계통도(자석의 이용→…→물리Ⅰ·Ⅱ / 물질의 상태→…→에너지의 출입), 교재 맞춤 영상. 학년·수업 횟수·가격은 자료에 없어 넣지 않았다.
- **소개 영상**(안쌤 영상 형식): `promo/msg-physics/` — 대본 `voice-promo.json`(16줄), 장면 `storyboard.js`(17), `tools/build.mjs`. 새 대사 음성은 원장 PC `scripts/local/omnivoice-promo.cmd`(기존 우루사쌤 클립을 참조로 복제) → `sample-v2/audio/promo/*.mp3` 올리면 다시 build. 음성 없으면 무음 초안.
- **쇼릴**: `tools/build-reel.mjs` → `promo/msg-physics/chogwasim-live-showreel.mp4`. 실제 앱을 **가상 시계로 한 장씩** 찍어(`tools/vtake.mjs`) 소프트웨어 렌더링에서도 끊김 없는 30fps. 3D는 왼쪽 960×1080 가득 + 오른쪽 큰 자막, 화면 컷은 천천히 다가가는 카메라 + 아래 자막. 음악은 `tools/music.py`로 합성한 원곡(저작권 없음, 바꿔 끼우기 쉬움) + 우루사쌤 목소리 몇 마디(나올 때 음악 자동 낮춤).
- 영상 속 동영상(시계 기록영상)은 가상 시계가 못 잡아서 실시간 녹화(`take.mjs`)로 찍는다.
  - **녹화 스크립트 주의**: 교구의 물체(`.weight-item`, 추가 탐구 `[data-object]`)는 `click()`으로 **안 매달린다** — 포인터/Enter 키로만 반응한다. `hang()`(Enter 키) 사용. 이걸 몰라 영점·측정·오류 컷이 한동안 빈 저울로 찍혀 있었다. 배틀 화면의 물체는 `<button>`이라 click 된다.
  - 컷에 `zoom: [가로, 세로, 배율, 시작초, 끝초]`를 주면 2배 해상도로 찍고 그 지점으로 다가간다(작은 글자 강조용). `css`는 그 컷 녹화에만 입히는 스타일 — 앱은 그대로.
  - 컷 번호(`07 / 12`)는 `num` 있는 컷 수에서 자동 계산.
  - `tests/two-lesson/file-manifest.json`의 해시는 battle·app 등 수정 뒤 낡았다. 읽는 코드가 없어 그대로 둠.

- **체험 소개 영상 완성(2026-09-26)**: `promo/msg-physics/msg-physics-promo.mp4`(2분 47초) + `msg-physics-promo.html`(소개 영상 ↔ 1분 쇼릴, 직접 체험·살아있는 책 링크). 목소리는 원장 PC에서 만든 `sample-v2/audio/promo/*.mp3` 17줄(커밋 3d9e135).
  - `build.mjs`도 가상 시계 녹화(vtake). 대본 속 `waitForTimeout`은 가상 시간으로 흘려 저울이 멈추고 기록이 된다. `<video>`를 트는 story·media만 실시간.
  - 장면별 `zoom`은 takes.js에(1600×900 좌표). 장면 길이는 대사 길이 + 1.3초라 **대본 시각이 장면보다 길면 잘린다** — 새 대사로 바꾸면 takes 시각부터 볼 것.
  - `--assemble`: 만든 장면으로 이어 붙이기·음악만 다시. 음악은 `music.py ... soft`(북 없이 잔잔한 판), 내레이션이 나오면 자동으로 낮아진다.
  - **말하는 우루사쌤(영상)**: `tools/talker.py`가 내레이션 소리 크기로 말하는 구간을 찾고, 음절 박자(초당 약 5.5번)로 승인된 `explain`(입 벌림) ↔ `listen`(다묾)을 **통째로 바꿔 끼워** 입이 움직이게 한다. 얼굴을 그리거나 합성하지 않는다(expressions/manifest.json 정책). 쉴 때는 장면 표정(storyboard `mood`: think·surprise·encourage·praise…), 말할 때 끄덕임·기울기, praise는 톡 뛰기. 전신 그림은 영상 틀에서 빠지고(`noChar`) 이 트랙이 왼쪽 아래에 겹친다.
## 우루사쌤을 책·실험 안으로 + Daily Test 채점·첨삭·처방 (2026-09-26)
- 원장: "자동 채점·첨삭 기능 예시도 우리 사이언스랩처럼. UI가 구리면 안 돼. 교재와 실험 안에 캐릭터가 들어가 있어야지." + "첨삭 기능도 넣어야지. 유사문제 은행도, 오개념이 2개가 되면…"
- **캐릭터 위치(표시만 이동)** `coach-stage.js` + `stage.css`: 스스로 공부하기·살아있는 책에서 오른쪽 별도 상자(teacher-dock)를 없애고, 같은 요소를 책 영역 아래(책 가장자리에 걸친 전신 `art/urusaem.png` + 말풍선)와 열린 실험 패널 아래 띠로 옮긴다. 3D 실험에서는 무대 왼쪽 아래로 올라서고, 글·표·영상 패널에서는 띠 가장자리에서 빼꼼(단추를 가리지 않게). 안내 문장·음성·반짝이는 단추 로직은 그대로. 실험 상태 문장(#activity-status)은 말풍선 둘째 줄로 비추고, 영점 게이트 경고면 말풍선이 주황(check)으로. 760px 이하는 동그란 얼굴 + 말풍선 한 줄 띠. 교사용은 변화 없음.
- **Daily Test 문항 도구 줄** `assessment-speech.js`: 크던 '말하고·고치고·확인하기' 상자를 문항 아래 한 줄(말로 답하기 서랍 · 스스로 체크 ○/△)로. 스스로 체크는 정답을 보여 주지 않고 점수·진단에 넣지 않는다(이전의 '답 확인' 선공개는 제거 — REVIEW-HANDOFF §2 "채점하기 전에는 정답·해설을 숨긴다").
- **채점** `daily-grading.js`: 확인된 정답과 같으면 ○, 원문 어휘(P1 부분 이름 6개·4번 그림 기호 ㄱㄴㄷ)의 다른 답이면 ×, 그 밖의 글자 답은 '검토 필요'(추측하지 않음). 2차시 9–11번은 항상 '검토 필요' — 점수·분모·진단에서 제외. 12번 그래프는 점을 찍은 뒤에만. 결과마다 `answerKey: 'dt-2026-09-26'`(remedy-bank의 ANSWER_KEY)와 원래 답을 저장해 정답표가 고쳐지면 다시 채점할 수 있다(`results`, `grading-log`).
- **첨삭·진단·처방** (`remedy-bank.js` 자료는 코디네이터 작성, 도우미 `firstAttemptRecord`·`bankRecord`만 추가): 첫 시도 오답 → 오개념 기록(`remedy-log`). 틀린 카드 = 오개념 되묻기 → '해설 보기'에 why + 바로잡기(fix) + 관련 실험 쪽. 진단 카드 = 의심/확정/해소 + 근거 문항. 확정되면 '처방 문제 풀기'(말풍선 단추로도) — 첫 오답은 되묻기만, 풀이 보기는 한 번 푼 뒤, 첫 시도만 기록, 두 개 맞히면 해소.
- 테스트: `tests/daily-remedy.test.mjs`(4) 추가 → `npm test` 27/27. Edge용 `tests/student-guide-browser.mjs`를 새 도구 줄·채점에 맞게 고쳤고 Chromium으로 통과.

## main 반영 (2026-09-26, 원장 승인)
- `claude/jolly-allen-w57yqh` → main. 이 브랜치는 review 스냅샷에서 출발해 main과 이력이 이어져 있지 않았다(스냅샷이 main 내용을 모두 포함함을 파일별로 확인). `git merge -s ours --allow-unrelated-histories origin/main`으로 main 이력을 부모로 남기고 내용은 브랜치 그대로 올렸다(b408dac).
- 배포(`.github/workflows/pages.yml`)는 공개 후 `tests/two-lesson/file-manifest.json`의 해시로 검증한다 — **sample-v2 파일을 바꾸면 이 목록도 다시 만들 것**(안 그러면 배포는 되지만 검증이 빨간불). 이번에 291개로 갱신.
- Pages에 `promo/msg-physics`(영상 페이지·영상·포스터·자막)도 올린다. 공개 주소: https://docssam1.github.io/msg-science-lab/promo/msg-physics/msg-physics-promo.html

