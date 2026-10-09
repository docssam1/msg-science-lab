# Codex(GPT) 인수인계 · MSG 초·과·심 물리 1~4차시

기준일: **2026-10-09**. 이 문서는 다음 작업자(Codex/GPT)가 **가장 먼저 읽는 실행 지시서**다. 과거 인수인계서(`CLAUDE-HANDOFF-2026-10-05.md` 등)의 “다음 작업” 목록은 이 문서가 대체한다. 작업을 시작할 때 `git fetch origin` 후 `origin/main`의 실제 커밋과 Pages 배포 상태를 다시 확인한다.

> 한 줄 요약: 1·2·3·4차시(본책 10~35쪽, 41장면)가 `main`에 반영·배포돼 있다. **음성 3차시 32개는 만들어졌지만 사용자 승인 전이라 커밋되지 않았고(이전 작업 폴더에 있음), 4차시 음성은 만들지 않았다.** 다음 단원은 5차시(본책 36쪽~, CHAPTER 06).

## 0. 절대 규칙 (어기면 사고)

1. **교재는 수정하지 않는다.** 교재 문장은 띄어쓰기·구두점 오탈자까지 그대로 옮긴다. 교재의 우려(충돌·오탈자·정답 미인쇄)는 **교사 메모**(`sample-v2/teacher-lecture.js`의 `check`, `[검수 메모 · 투사 화면에는 표시하지 않음]`)와 `docs/lesson-framework/TEACHER-LECTURE-0N-QA.md`, `README.md §7`에만 적고 **투사·학생 화면에는 절대 쓰지 않는다**(테스트가 막는다).
2. **정답이 확인되지 않은 문항은 자동 채점·정답 공개를 잠근다**(`remedy-bank.js`의 `UNCONFIRMED`). 해설 PDF의 무게재기 01~20은 **별도 단원평가**라 Daily Test 정답표가 아니다. 근거 없는 정답·처방·심화 문제를 만들지 않는다.
3. **G: 원본 PDF는 읽기 전용.** 저장소·C:·공개 폴더(`sample-v2/source/`)에 복사하지 않는다. 쪽 이미지를 새로 공개 폴더에 추가하지 않는다(`source/p10~p21.webp`만 기존 것).
4. **새 작업은 E:에서만**, `origin/main`에서 새 worktree를 만들어 한다. 오래된 브랜치(아래 §2)를 통째로 병합하지 않는다.
5. **음성은 로컬 OmniVoice(GPU)로만** 만들고 **사용자가 듣고 승인한 뒤에만 커밋·병합**한다. 클라우드 TTS 금지. 승인 전 음성 파일은 커밋하지 않는다.
6. **3D 자산 정책**: 사용자는 평면 2D 체험을 인정하지 않는다(2026-10-09, “이런 2d 인정못해”). 새 체험은 Three.js 3D로 만든다(`sample-v2/balance3d.js` 참고). 3차시 체험 4개는 아직 2D라 3D화 대기(§5).
7. 결과 보고는 **서로 다른 상태로 구분**한다: ① 코드가 `main`에 반영됨 ② Pages 배포 성공 ③ 자동 검수 통과 ④ 실제 교실·전자칠판·태블릿 사용 승인(아직 없음). “현장 검수 완료”라고 쓰지 않는다. 확인하지 못한 것은 확인하지 못했다고 쓴다.
8. `C:\Users\user\.codex\sessions`는 `E:\Codex\sessions`로 가는 디렉터리 정션이다. 재귀 삭제 금지. 작업 전 `E:\Codex\CODEX_STORAGE_NOTICE.md`, `E:\Codex\CODEX_STORAGE_STATUS.md`를 읽는다(`E:\Codex\AGENTS.md` 지시).

## 1. 현재 상태 (2026-10-09)

- `origin/main` 최신: **`0097f87`**(PR #17 병합) = 4차시(PR #16) + 안내 음성 도구·런북(PR #17). 3차시는 PR #15(`64bb259`).
- 공개 사이트: https://docssam1.github.io/msg-science-lab/ (앱은 `/sample-v2/`, 예 `student.html?page=32`, `teacher.html?page=36`). GitHub Pages 워크플로 `Deploy MSG Science Lab to GitHub Pages`가 `main` push마다 배포하며 `node scripts/local/build-sample-manifest.mjs --check`가 실패하면 배포가 멈춘다.
- 장면은 위치 순서다: P0 표지, **P1~P11 1차시, P12~P20 2차시, P21~P32 3차시, P33~P40 4차시**(총 41장면). 학생 인쇄 41면, 교사 인쇄 81면(표지 + 장면 × 2).

| 차시 | 본책 쪽 | 장면 | Daily Test | 체험 | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| 1 | 10~15 | P1~P11 | `a1`~`a6`(P11) | 3D 저울(기존), 영점 게이트 P5 | `TEACHER-LECTURE-01-QA.md` |
| 2 | 16~21 | P12~P20 | `b1`~`b12`(P19·P20), **b9~b11 잠금** | 탄성·측정·그래프(기존) | `TEACHER-LECTURE-02-QA.md` |
| 3 | 22~29 | P21~P32 | `c1`~`c9`(P32), **c9 잠금**, c4는 교사 확인 | `gravity`·`moon-weight`·`weight-mass`·`mass-weight-graph` (**2D, 3D화 대기**) | `TEACHER-LECTURE-03-QA.md` |
| 4 | 30~35 | P33~P40 | `e1`(P40, 1문항, **자동 채점 안 함**) | `lever`·`weights` (**3D**, `balance3d.js`) | `TEACHER-LECTURE-04-QA.md` |

- 4차시 Daily Test(33쪽, 1·3·9 g 추로 1~13 g)는 교재에 **정답이 인쇄돼 있지 않다**. 교사 화면의 조합은 평형 조건(물체 + 왼쪽 추 = 오른쪽 추)으로 **내가 도출**한 것이다(유일해). 교재 정답이라고 쓰지 않는다.
- 4차시는 33쪽(Daily Test)이 34~35쪽(과학 이야기)보다 앞에 있지만 수업 흐름상 시험을 **마지막(P40)** 에 두었다.
- 검수 도구 현황(2026-10-09 실행): `npm test` 54/54. 브라우저 테스트 `tests/*-browser.mjs` 17개 중 16개 통과, 화면 점검 164화면(41장면 × 교사/학생 × 2해상도) 통과. 통과하지 않는 1개 `ch01-browser.mjs`는 옛 루트 프로토타입(`http://127.0.0.1:4317/student.html`, 2026-09-22 CH01)을 대상으로 해서 이 앱과 무관하다.

## 2. 저장 위치 (정확히)

| 무엇 | 위치 |
| --- | --- |
| GitHub 저장소 | `docssam1/msg-science-lab` (`origin` = https://github.com/docssam1/msg-science-lab.git). 다른 제품 저장소(`docssam1/lete-on` 독쌤 사이언스 랩)와 섞지 않는다. |
| **git 공통 디렉터리(본 clone)** | `E:\Codex\desktop-archive\2026-10-02\msg-science-lab-livebook-ux\.git` — 이름은 archive지만 **모든 worktree가 이 `.git`을 공유**한다. **이 폴더를 지우거나 옮기면 모든 작업본이 깨진다.** |
| 작업본(worktree) 위치 | `E:\Codex\worktrees\msg-*`. `git worktree list`로 확인. 새 작업은 `git fetch origin; git worktree add -b work/<이름> E:\Codex\worktrees\msg-<이름> origin/main`. |
| 최신 main과 같은 작업본 | `E:\Codex\worktrees\msg-lecture-04-20261009`(이 문서를 쓴 곳; 브랜치는 병합 후 계속 바뀜). **그 폴더에서 바로 작업하지 말고 새 worktree를 만든다.** |
| **미커밋 3차시 음성 작업본** | `E:\Codex\worktrees\msg-lecture-03-20261008`, 브랜치 `work/lecture-03-voice-20261009`, **미커밋 35건**(`sample-v2/app.js`의 `pageVoice` 수정, `sample-v2/source-lessons.js`의 P26·P30 안내 문장, `sample-v2/audio/voice-library.json`(187개), `sample-v2/audio/guide/*.mp3` 32개). **삭제·`git clean`·`git checkout .` 금지.** |
| 3차시 듣기 페이지 | `E:\Codex\visualizations\msg-lecture-03\lesson3-listen.html`(사용자에게 이미 전달) |
| 4차시 음성 대사 목록(음성 없음) | `E:\Codex\visualizations\msg-lecture-04\voice\lesson4-spec.json`(21줄) — `scripts/local/enumerate-guide-lines.mjs --lesson 4`로 다시 만들 수 있다. |
| QA 산출물 | `E:\Codex\visualizations\msg-lecture-0N\`(스크린샷·증거). 저장소에는 넣지 않는다. |
| 원본 교재 | `G:\내 드라이브\과학\` — 본책 `03 (최종)초과심_물리_본문(표지+내지218p).pdf` SHA-256 `B2187A8CDCB37DA707177B722D856CEAF91B60F334C8FCE5B0ABC9D721F32B6F`, 해설 `03 (최종)초과심_물리_정답과해설(표지+내지14p).pdf` SHA-256 `42540D7655FAD2C7ED3F97A88AFFBC0B1632850EBD006365BD9C2188DE2FECCB`(2026-10-09 재확인). 참고파일 `MSG_초과심_물리_참고파일_2026-10-05.md`. PDF는 쪽마다 한 장이고 **인쇄 쪽수 = PDF 쪽수 − 1**, 텍스트 층이 없어 쪽을 이미지로 그려 눈으로 읽는다(PyMuPDF `pymupdf`, 시스템 `python`에 있음). |
| Playwright | `file:///E:/Codex/tmp/hs-library-access-qa/node_modules/playwright-core/index.mjs`(환경 변수 `MSG_PLAYWRIGHT_URL`), 브라우저 `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` |
| `qrcode` 파이썬 패키지(QR 생성용) | `E:\Codex\tmp\pylibs`(`PYTHONPATH`로 지정). 시스템 파이썬에는 없다. |
| OmniVoice | 가상환경 `E:\Codex\tools\science-lab-omnivoice-cuda\Scripts\python.exe`(torch 2.8.0+cu128, omnivoice 0.2.1, GTX 1660 SUPER), 모델 캐시 `E:\Codex\model-cache\fields-omnivoice\hub` |
| 임시 스크립트 | `E:\Codex\tmp\` — 작업 중 임시 파일. **필요한 것은 이미 저장소 `scripts/local/`로 옮겼다**(아래). 이 폴더에 의존하지 않는다(단, Playwright·pylibs 경로는 위 표대로 이곳에 있다). |
| 정리하지 않은 오래된 브랜치 | `work/essay-photo-feedback-boundary-20261003`(**보류한 사진 게이트웨이 커밋 포함, 통째로 병합 금지**), `release/teacher-lecture-handoff-20261005`, `work/teacher-deck-student-guide` — 모두 `main`과 따로 놀던 과거 작업. 건드리지 않는다. |

## 3. 작업 지시가 있는 곳 (읽는 순서)

1. **이 문서**(`docs/lesson-framework/CODEX-HANDOFF-2026-10-09.md`).
2. `docs/lesson-framework/README.md` — 설계 원칙. **§7**에 차시별 “교재대로 반영·교사 메모만” 기록과 `[검수 요청 · 미승인]` 항목(17쪽 “반비례”).
3. 차시별 근거/검수표: `TEACHER-LECTURE-01-QA.md`~`TEACHER-LECTURE-04-QA.md` — 장면↔본책 쪽 대조, Daily Test 정책, 검수 메모, 남은 확인 체크리스트.
4. `docs/lesson-framework/VOICE-RUNBOOK.md` — 음성 규칙·환경·순서·대기 상태.
5. G: 참고파일 `MSG_초과심_물리_참고파일_2026-10-05.md` — 정확한 파일명·해시·주의.
6. `sample-v2/README.md` — 앱 구조·자료·출처.
7. 오래된 문서(참고만, 현재 상태로 믿지 않는다): `CLAUDE-HANDOFF-2026-10-05.md`(1~2차시 시점), `DESIGN-QA.md`(21면·41면 시점), `docs/HANDOFF.md`(CH01, 2026-09-22), `REVIEW-HANDOFF-2026-09-26.md`, `sample-v2/source-coverage.json`(낡음), `tests/browser.mjs`·`tests/ch01-browser.mjs`(옛 루트 프로토타입 대상, 실패하며 무관).

## 4. 코드 지도 (`sample-v2/`)

- `content.js`: 교재 문장(`page(id,lesson,source,…)`), 문항 `q1`~`q4`, `assessmentGroupsByPrint`(평가 묶음 **단일 표**), `narration`, `lessonNames`, `questionHTML`.
- `lesson-print-pages.js`: 학생 인쇄 순서. **`printId`는 위치로 다시 매긴다(`P${index+1}`)** → 새 장면은 항상 **맨 끝**에 추가한다. 중간 삽입 금지.
- `lesson-stage.js`: 투사·학생 장면(`scenes`), 답 공개, `stageActivity`(문항→체험 연결), `stageGradeLabel`.
- `teacher-lecture.js`(교사 노트 진행안 `lessonOne/Two/Three/FourLecture`), `source-lessons.js`(장면별 학생·교사 한 줄), `teacher-notes.js`, `student-guide.js`(체험 안내 문장).
- `activities.js`(체험 분기; `lever`·`weights`는 `balance3d.js`를 지연 로드), `balance3d.js`(3D 체험·정지 그림 렌더러), `graphics.js`(SVG 도해), `physics.js`.
- `daily-grading.js`(채점·첨삭; `set`·`draw` 종류, `itemLabel`), `remedy-bank.js`(`UNCONFIRMED`, `ANSWER_KEY`는 `'dt-2026-09-26'`로 **바꾸지 않는다**), `app.js`, `qr-map.js`, `index.html`/`start.html`.
- 문항 id 규칙: a=1차시, b=2차시, c=3차시, **e=4차시**(d는 확인 질문용이라 비워 둠). 5차시는 다른 글자를 정하고 `itemLabel`·`lessonRemedyLog`·테스트를 함께 고친다.

## 5. 아직 안 끝난 것 (우선순위 순)

1. **3차시 음성 32개 — 사용자 승인 대기**(만들어 둠, 미커밋). 승인되면 그 작업본에서: 커밋 → `build-sample-manifest.mjs` → `--check` → push → PR(`--body-file`) → 병합 → 배포 확인(공개 mp3 해시 비교) → `TEACHER-LECTURE-03-QA.md`의 “음성은 별도 단계” 항목 갱신. 어색한 문장은 그 줄만 `--force`로 다시. **`pageVoice` 수정은 이 작업본에만 있다**(`main`에 없음) — 어느 차시 음성이든 먼저 병합하는 쪽에 반드시 함께 넣는다.
2. **4차시 음성 21줄 — 사용자가 “나중에”로 보류.** 지금은 만들지 않는다(§0-5).
3. **3차시 체험 4종 3D화** — 사용자가 2D를 인정하지 않음. 3D화 시 3차시 안내 문장이 바뀔 수 있어 음성 목록을 다시 뽑아 비교해야 한다. (Claude 세션에서 시작 카드 `task_09163d05`로 제안만 했고 시작 여부는 사용자 결정.)
4. 4차시 보완 후보: P33 수평 도해(`levelArt`)와 Daily Test 칸 그림(`panBalanceMini`)은 교재 도해를 따른 2D 선 그림, P39 바퀴 3D 그림(`ramp-wheel*.jpg`)은 아직 아쉬움 → 사용자 결정 대기.
5. **5차시** = 본책 36쪽부터(CHAPTER 06 용수철저울의 원리 · 앉은뱅이저울의 구조). 시작 전 G: 본책 36쪽부터를 직접 읽고 범위를 사용자와 정한다. 아직 시작하지 않았다.
6. 사용자 검수 게이트(미완): 실제 전자칠판·태블릿·교사 시연, 대상 학년(`learner-fit`), 교육 내용 검수(차시별 QA 문서의 메모), 17쪽 “반비례” 표현, Daily Test 2차시 9~11번·3차시 9번의 공식 근거, 4차시 Daily Test 조합의 교재 대조, 실물 프린터 출력.

## 6. 새 차시를 만드는 표준 절차 (3·4차시에서 쓴 방식)

1. `origin/main`에서 새 worktree. G: 본책 해시 재확인 후 해당 쪽을 이미지로 읽어 범위·문장을 옮긴다(**교재 그대로**).
2. `content.js`에 `page()`·문항·`narration`·`lessonNames`·`assessmentGroupsByPrint`, `lesson-print-pages.js`(맨 끝), `lesson-stage.js` 장면, `teacher-lecture.js`·`source-lessons.js`·`student-guide.js`, 새 체험은 `activities.js`(`activityNames` 등록 필수)·3D는 `balance3d.js`.
3. 하드코딩된 차시·쪽수를 찾아 고친다: `app.js`(`openDailyReport`·`q*`·credits 쪽수), `lesson-stage.js` 표지 개요, `daily-grading.js`(`itemLabel`), `remedy-bank.js`(`lessonRemedyLog`), `qr-map.js`(범위), `scripts/local/build-lesson-qr.py`(범위), `index.html`(차시 버튼·배지)·`start.html` 문구, `sample-v2/README.md`.
4. 테스트 갱신: `tests/lesson-print.test.mjs`(쪽 수·평가 쪽 정규식·문항 id 정규식), `teacher-lecture*.test.mjs`(+새 `teacher-lecture-N.test.mjs`, `package.json`의 test 스크립트에 **공백 포함해** 추가), `screen-sweep-browser`(장면 범위·`okScroll`), `lesson-stage-browser`, `student-guide-browser`, `entry-teacher-browser`(`NN/총장면수`), `print-browser`(학생 N면·교사 2N−1면), 새 `lecture-0N-browser.mjs`·`daily-test-N-browser.mjs`.
5. 정지 그림·QR·PDF: `render-lever-stills.mjs`(3D 정지 그림), `build-lesson-qr.py`, `build-print-pdfs.mjs`.
6. 문서: `TEACHER-LECTURE-0N-QA.md` 신규, `README.md §7`, `sample-v2/README.md`.
7. 커밋 → **`node scripts/local/build-sample-manifest.mjs` 후 `--check`(커밋된 파일 기준이라 커밋한 뒤에 다시 실행)** → push → PR(`--body-file`) → 병합(사용자가 “네가 승인”이라고 해서 검증 후 직접 병합해 왔다. 그 위임이 유효한지 확인) → Pages 성공 확인 → 공개 사이트에서 새 테스트 실행·파일 해시 비교.

## 7. 실행 명령 (PowerShell, 저장소 루트)

```powershell
npm test                                                   # 단위 테스트(54개)
$env:PORT='4320'; node server.mjs                          # 로컬 서버(백그라운드로 실행)
node scripts/local/build-sample-manifest.mjs               # 커밋 뒤 실행
node scripts/local/build-sample-manifest.mjs --check
$env:MSG_PLAYWRIGHT_URL='file:///E:/Codex/tmp/hs-library-access-qa/node_modules/playwright-core/index.mjs'
$env:QA_BASE='http://127.0.0.1:4320/sample-v2/'            # lecture-*, daily-test-*, screen-sweep, lesson-stage, student-guide, teacher-flow, entry-teacher
$env:QA_OUT='E:/Codex/visualizations/msg-lecture-0N/proofs'
node tests/lecture-04-browser.mjs                          # 예시. tests/*-browser.mjs 전부
$env:MSG_BASE_URL='http://127.0.0.1:4320'                  # print-browser, worksheet-browser만: 경로 없는 주소 + MSG_QA_OUT
$env:MSG_QA_OUT='E:/Codex/visualizations/msg-lecture-0N/proofs'
node tests/print-browser.mjs
node scripts/local/render-lever-stills.mjs                 # 4차시 3D 정지 그림 재생성(QA_BASE 필요)
$env:PYTHONPATH='E:\Codex\tmp\pylibs'; python scripts/local/build-lesson-qr.py
node scripts/local/build-print-pdfs.mjs                    # sample-v2/print/*.pdf(MSG_BASE_URL 필요)
```

- **환경 변수가 둘로 갈린다**: `QA_BASE`는 `/sample-v2/`까지 붙은 주소, `MSG_BASE_URL`은 `/sample-v2/`가 **없는** 주소다. 섞으면 `waitForFunction` 시간 초과가 난다.
- 서버는 끝나면 반드시 종료한다(`Get-NetTCPConnection -LocalPort <포트> -State Listen`으로 찾아 `Stop-Process`).

## 8. 알려진 함정

- **PowerShell 5.1**: 파일을 읽을 때 `-Encoding UTF8`을 붙이지 않으면 한글이 깨져 보이지만 파일은 정상이다(`voice-library.json` 등). 쓸 때는 `UTF8Encoding($false)`(BOM 없음). `[IO.File]`의 상대 경로는 PowerShell 현재 위치가 아니라 **프로세스 시작 위치** 기준이라 항상 절대 경로를 쓴다(빈 파일이 엉뚱한 곳에 생긴 적 있음). `R`은 `Invoke-History`의 별칭이라 함수 이름으로 쓰지 않는다. 한 원소짜리 배열은 `@(,@(a,b))`로 감싸야 펼쳐지지 않는다. `gh ... -q`에 공백이 들어가면 쪼개진다. PR 본문은 `%`가 있으면 인라인으로 넣지 말고 `--body-file`.
- 줄 끝: 작업본 파일은 LF이고 git이 CRLF 경고를 낸다(무시해도 됨). 테스트·스크립트 수정은 문자열 전체 일치를 쓰므로 줄 끝이 다르면 못 찾을 수 있다.
- `package.json`의 test 스크립트에 파일을 추가할 때 앞 파일과 **공백**을 빼먹으면 테스트가 조용히 건너뛰어진다(48개 중 42개만 돌았던 적). 추가 후 테스트 개수를 확인한다.
- 장면은 위치 순서이고 평가 묶음은 `assessmentGroupsByPrint` **한 곳**에서만 정한다(예전엔 세 곳에 복사돼 있었다).
- 브라우저 테스트는 Audio를 스텁으로 막는다. 실제 소리·태블릿 재생은 확인된 적 없다.
- GitHub Pages가 가끔 503을 내므로 한 번 실패하면 다시 열어 본다. 배포가 `--check`에서 멈추면 매니페스트를 커밋 뒤에 다시 만든다.
- 학생 안내 말풍선 문구와 화면 문장은 정확히 같아야 음성이 붙는다(`clipByText`). 안내 문장을 고치면 해당 줄 음성을 다시 만들어야 한다.
- `tests/browser.mjs`·`tests/ch01-browser.mjs`는 옛 프로토타입용이라 실패해도 무관하다.

## 9. 사용자가 지금까지 정한 것 (바꾸려면 사용자에게 먼저 확인)

- 가르치기는 한 번 조작 흐름(클릭·Space·→로 답 확인 → 추가 설명 → 다음), 교사용은 무음, 학생용은 우루사쌤 음성·표정. 광고 영상 톤(`deck-look`)·글자 크기 조절(작게/크게)·큰 우루사쌤.
- 17쪽 “반비례”는 교재대로 두고 교사 메모에만 기록(미승인 검수 요청).
- 4차시 Daily Test는 자동 채점하지 않음. 음성은 나중에. 2D 체험 불가.
- 병합은 검증 후 내가 직접 해도 된다고 위임받았다(“네가 승인”, 2026-10-07 시점). 새 위임이 필요한지 의심스러우면 묻는다.
