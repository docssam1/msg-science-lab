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
