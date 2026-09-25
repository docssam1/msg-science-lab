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
