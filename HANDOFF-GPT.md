# 과학 탐구 랩: GPT 인수인계서 (2026-09-22부터 1주일)

> 이 문서 하나만 읽고 일을 시작할 수 있게 썼다. 더 자세한 내용이 필요하면 아래 "읽는 순서"를 따른다.
> 이번 주 담당: **GPT**. 원장(관호)의 역할은 **승인과 확인**뿐이다.

---

## 0. 원장 작업 규칙 (가장 먼저 지킬 것)
1. **계획이나 의견을 먼저 보고하고, 승인을 받은 뒤에만 작업한다.** 승인 전에는 파일 수정·업로드·커밋·푸시를 하지 않는다.
2. 더 빠르고 쉬운 방법이 있으면 **그 방법을 먼저 제안**한다.
3. 토큰을 아낀다. 바뀐 **부분(diff)**만 쓰고, 파일 전체를 다시 쓰지 않는다. 기존에 잘 되는 기능은 건드리지 않는다.
4. 쓸데없는 확인 질문을 하지 않는다.
5. 수정 기록은 PATCH.md 방식을 따른다: 바뀐 조각만 적고, 파일 경로와 전후, 변경 요약을 쓴다. 절차는 PATCH.md 읽기 → GitHub 기존 파일 가져오기 → 그 조각만 교체 → 푸시 → GitHub Pages 확인.
6. 푸시하기 전에 해당 파일의 SHA를 새로 받는다: `curl -s "https://api.github.com/repos/docssam1/lete-on/contents/<path>"`
7. **라이선스 원문(교재 지문·단원평가 원문·정답)은 절대 git에 올리지 않는다.** Supabase에만 둔다. git에는 우리가 새로 만든(창작) 문항만 둔다.

## 1. 주소
| 무엇 | 주소 |
|---|---|
| 저장소 | https://github.com/docssam1/lete-on (작업은 `main`, PR로 squash merge) |
| 운영 도메인 | https://lete-on.gfieldacademy.net/ (GitHub Pages, `.github/workflows/deploy-pages.yml`) |
| 광고 책(체험 페이지) | https://lete-on.gfieldacademy.net/science-lab/intro/ |
| 학습 화면 v2(단원) | https://lete-on.gfieldacademy.net/science-lab/v2/#/s41-u03b/1 (화산), `#/s41-u01/1` (자석) |
| 교재 인쇄본 | `/science-lab/v2/#/s41-u03b/lab-book/student` · `/teacher` |
| 오개념 진단 | `/science-lab/v2/#/s41-u03b/diagnose` |
| 1차 버전(구) | `/science-lab/` (지도자료 15유닛, v1) |
| Supabase | https://fgahqumaldheqettmvqg.supabase.co (원문 테이블 `science_bank_source`, 음성 Storage `audio/science-lab/`) |
| 원본 그림 | lete-on 저장소의 `science-src` 브랜치 (`science-src/4-1/<단원>/<E코드>/<T코드>/o-NN.png`) |
| 최근 PR | #251(17차 오개념 u01) · #252(18차 광고 책 Ⅶ·Ⅷ) · 이번 19차 PR(Ⅸ 자유형 견본 + 이 문서) |
| 상담 링크(책 뒤표지) | https://open.kakao.com/me/gfield · 02-3453-7772 |

## 2. 읽는 순서 (저장소 안)
1. **이 문서**
2. `science-lab/HANDOFF.md` (1~19차 전체 기록과 "⚠ 새 세션은 여기부터" 절)
3. `science-lab/DESIGN.md` (5E 설계) → `data/source-toc.md` (단원 축과 원천 교재 매핑) → `UX-TEST-2026-09-19.md`
4. 저장소 루트 `CLAUDE.md`의 "과학 탐구 랩" 절 (저장소 전체 규칙: 원문 분리, 검사기, 음성 캐시)

## 3. 무엇을 만들고 있나 (한 문단)
**GFIELD SCIENCE LAB / 「GFIELD 실험 과학 영재」**: 초3~6 교과 연계 실험 과학 교재다. 한 단원을 5E(궁금 → 실험 → 개념 → 확장 → 점검)로 진행하고, 3D 조작 실험실, 실제 사진·영상, 문제은행(원문은 Supabase, 유사문항은 git)을 갖춘다. **오개념 진단**은 어떤 보기를 골랐는지로 오개념을 판정하고(확정/의심/해소), 처방 문제를 낸다. A4 학생용·강사용 교재도 인쇄된다. 캐릭터는 **docssam(독쌤)**이다. 광고 책(`/intro/`)은 판타지 마법서 콘셉트이고, 책장이 3D로 넘어가며 독쌤이 설명한다.

## 4. 원장 철학·결정 (바꾸지 말 것)
- **공부는 책에서 한다.** 초등학생에게 타자 입력은 맞지 않는다. 인쇄 교재의 서술형 칸은 화면에서는 타자 입력란이고, 인쇄하면 **원고지 칸 + 학생 QR**이 된다.
- **사진 한 장 → 첨삭** 흐름: QR로 누구의 몇 쪽인지 자동 인식 → 글씨 전사 → 학생이 읽은 글 확인 → 1차 첨삭 → 고쳐 쓰기 → 2차 첨삭 → 오개념 판정 → **유사 문제(처방 한 장)**.
- **알림·타이머는 없다.** 제출 시각만 저장한다. 부모 폰 알림도 없다. 초점은 **첨삭과 유사 문제** 두 가지뿐이다.
- **B2B가 중요하다.** 강사가 답안지 더미를 연속 촬영하면 학생별로 자동 분류되고, 성적이 전송되고, 처방 PDF가 인쇄된다. B2C(학부모)도 같은 파이프라인을 쓴다.
- 입구는 세 개(웹 = 타자, 종이 = 원고지 사진, 앱 = 폰 사진)지만 **채점 파이프라인은 하나**다.
- **AI 채점은 제미나이(또는 무료 API) 우선이고, 어댑터로 교체할 수 있게** 만든다. Claude API는 비용 때문에 쓰지 않는다. **Report3**(텔레그램 → GCS → 제미나이 비전, 저장소 `docssam1/gfield-report`)를 재사용하고, QR 해독과 판정 JSON 스키마 프롬프트만 추가한다.
- 서술형은 **정답과 비교**한다(판정 JSON: `verdict / matched / missing / explanation / spelling`). 자유형(주제 글쓰기)은 **루브릭**(내용·구성·표현·맞춤법 각 5점)으로 채점한다.
- 첨삭 표현: 학생 글씨는 흐린 연필 손글씨, 첨삭은 그 위에 빨간 펜 손글씨(두 줄 긋기, 고칠 말, 점수, `의심` 도장, **학년 맞춤 낱말 추천**).
- 독쌤 목소리: 밝은 남자 목소리. 현재 Google TTS(`ko-KR-Chirp3-HD-Puck`)를 쓴다. 원장은 **OmniVoice 복제**로 바꾸고 싶어 한다(루트 `CLAUDE.md` "OmniVoice 검토" 절, `scripts/local/omnivoice-clone.cmd`).
- 디자인: 판타지 마법서(만화책 느낌 아님), 폰트는 Gaegu 700 + Pretendard, 이모지 아이콘은 쓰지 않는다.

## 5. 지금 상태 (2026-09-22, 19차까지)
### 끝난 것 (다시 만들지 말 것)
- 단원 4개: `s41-u01` 자석의 이용 · `s41-u02` 물의 상태 변화 · `s41-u03` 땅의 변화(+`s41-u03b` 화산 실험실) · `s42-u01` 식물의 생활. 각 단원에 문항·5E 구성·분류(taxonomy)·유사문항 80개가 있다.
- 오개념 진단 파일(`*.misc.js`): **s41-u01, s41-u03만** 있다.
- 3D 실험실: 고리 자석 탑, 흙 언덕, 화산, 얼음(freeze), 연못.
- 살아 있는 교재: s41-u03·s41-u03b (`data/book/*.book.js`).
- 광고 책 `/intro/`: **27쪽**. 표지 → 소개 Ⅰ~Ⅵ → **Ⅶ 사진 첨삭(서술형)** → **Ⅷ 처방 한 장** → **Ⅸ 자유형 루브릭 첨삭** → FAQ → 봉인 해제 → 살아 있는 교재 → 진단 보고서 → 처방 샘플 → 뒤표지.

### 광고 책 코드 지도 (`science-lab/intro/`)
- `intro.js`
  - `ads()`: 광고 쪽 목록
  - `AD_SAY`: 쪽마다 독쌤이 할 말의 id. 쪽 순서와 같고 표지 포함. **쪽을 추가하면 여기에도 한 칸 추가**한다.
  - `PAPER`·`paperMock()`: Ⅶ 서술형 견본
  - `phoneMock()`: 폰 화면 3컷
  - `remedyMock()`: Ⅷ 처방 한 장
  - `FREE`·`freeMock()`: Ⅸ 자유형 견본
  - `manuscript()`: 원고지 칸
  - `fakeQr()`: 가짜 QR. 진짜 QR은 인쇄 라우트가 만들어야 한다.
- `intro.css`: 기본 스타일. `intro-paper.css`: 손글씨·빨간 펜·루브릭 스타일(덮어쓰기용).
- `narration.json`: 독쌤 대사. 문장을 고치면 해시가 바뀌어 새 MP3가 필요하다. **`generate-audio.yml`의 paths에 이 파일이 없어서** 나레이션만 고쳐 올리면 음성이 자동으로 만들어지지 않는다. Actions의 **Generate Audio를 수동 실행**해야 하고, 그전까지는 기기 음성이 나온다. (`photo`·`remedy`·`free` 세 줄은 2026-09-22에 수동 실행으로 생성 완료.)

## 6. 앞으로 할 일 (우선순위 순. 하나씩 원장 승인을 받고 진행)
1. **[완료 2026-09-22]** `HANDOFF-18.md`와 이 문서의 19차 기록을 `HANDOFF.md`의 17차 위로 합치고, `HANDOFF-18.md`를 삭제했다.
2. **오개념 진단을 나머지 두 단원으로 확장**한다: `s41-u02.misc.js`, `s42-u01.misc.js`. 17차 패턴을 그대로 반복한다(오개념 정의 → distractors/typed/cloze/cells → remedy → 검증 스크립트 → `v2/v2.js` 로더에 `misc` 한 줄 추가 → 화면 확인). 주의: "틀린 것 고르기" 부정 발문 문항은 오답 인덱스 방향이 반대다.
3. **실구현 설계서를 먼저 쓰고 승인을 받는다.** 서술형과 자유형이 같이 쓰는 채점 계약을 정한다:
   - 입력: `{student, unit, item|prompt, type: 'written'|'free', images[], typed?}`
   - 서술형 출력: `verdict/matched/missing/explanation/spelling/score`
   - 자유형 출력: `rubric[{k, score, why}], rewrite, words[], spelling[]`
   - 어댑터 인터페이스: `grade(input) → output`, 제미나이 구현을 기본으로 한다.
4. 실구현 1단계: **학생별 QR 인쇄 라우트**(QR = 학생 id · 단원 · 쪽 · 문항 · 장 번호). 인쇄 교재의 서술형 칸에 원고지 칸을 만든다.
5. 실구현 2단계: **처방지 인쇄 라우트** `#/<단원>/remedy/print` (진단 결과 → 처방 문제 한 장, AI 호출 없음).
6. 실구현 3단계: **사진 → 전사 → 채점** 워크플로(n8n 또는 Report3 확장, 제미나이 비전). 전사 결과는 학생이 확인하는 단계를 반드시 거친다.
7. 남은 정리:
   - `.github/workflows/generate-audio.yml`의 `paths:`에 `- 'science-lab/intro/narration.json'` 한 줄 추가(대사를 고치면 독쌤 음성 자동 생성). Claude 연동은 워크플로 파일 수정 권한이 없어 못 했다
   - 성취기준 문장을 고시 원문과 대조
   - 소단원 이름을 출판사 표기로 바꿀지 결정
   - 문제은행 어댑터 등록(`bank/science-bank-adapter.js`)
   - 원본 그림 중 `pending-crop`·`pending-upload` 처리
   - docssam 말풍선 `.bubble`이 모바일 320px에서 가로로 넘치는 문제(기존 버그)
   - `science-lab/assets/docssam.png` 1.2MB는 어디서도 쓰지 않는다. 삭제할지 원장에게 확인.
8. 다음 단원: 같은 방식으로 단원 파일, 5E, 유사문항, misc, 교재를 만든다. 원천 자료는 Drive `과학 단원평가`, 지필드 이론편·실험2(라이선스 없음, 원문 사용 가능).

## 7. 검증 방법 (작업 후 매번)
- 로컬 서버: 저장소 루트에서 `python3 -m http.server 8765` → `http://localhost:8765/science-lab/intro/`
- Playwright로 확인할 것: 콘솔·페이지 오류 0건, 광고 쪽 넘침 0(A4 한 쪽 1123px 안에 내용이 들어가야 함), 320px 가로 넘침 0.
- 문제은행: `node science-lab/bank/audit.mjs` 통과. 공개용 `bank/taxonomy/*.json`은 `build.mjs`로 만들고 직접 고치지 않는다.
- 배포 확인: PR merge 후 1~2분 기다린 뒤 운영 URL에서 강력 새로고침(Ctrl+Shift+R).
- 배포할 때 `.md` 파일은 사이트에서 빠진다(`deploy-pages.yml`). 그래서 이 문서는 공개 사이트에 노출되지 않는다. 다만 저장소 자체는 공개이니 비밀번호·키는 쓰지 않는다.

## 8. 19차에서 한 일 (2026-09-22, Cowork)
- 광고 책에 **CHAPTER Ⅸ 「정답 없는 글도 기준표로 첨삭」**(`a12`)을 추가했다. 내용: 유준의 주제 글쓰기 "화산이 우리에게 주는 것"(원고지 20칸×5줄, 2장 중 1장), 빨간 펜(부셔요 두 줄 긋기 → 여백에 "부순다", 좋은 근거 밑줄 ✓, 마지막 문장 물결 밑줄), 총점 14/20, 루브릭 표(내용 4·구성 3·표현 3·맞춤법 4와 그 이유), 고쳐 쓸 문장, 4학년 낱말 칩, 장 번호 QR.
- 쪽 번호를 하드코딩하지 않게 바꿨다: `state.pages`는 `adSecs.length`로 계산하고, 나레이션은 `AD_SAY` 배열을 쓴다. 이제 광고 쪽을 추가해도 숫자를 고칠 곳이 없다.
- 나레이션 `free` 한 줄을 추가했다.
- 검증: 27쪽, 오류 0, a8·a9·a12 넘침 0, 쪽 순서와 대사 매칭 확인.
