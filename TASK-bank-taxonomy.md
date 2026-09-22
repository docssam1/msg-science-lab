# 작업 지시서 — 자석 단원 원본 정리 · 개정 분류 · 유사문항 (Claude Code용)

> 브랜치 `claude/jolly-allen-w57yqh`에서 시작. 먼저 `science-lab/HANDOFF.md` → `DESIGN.md`(학년·수준 규칙) → 이 문서 순서로 읽는다.
> 사용자(관호)는 승인·확인만 한다. 계획은 이 문서로 승인됨 — 중간 확인 질문 없이 끝까지 진행하고, 끝에 결과만 보고한다.

## 절대 규칙
- 단원평가 **원문·정답·원본 그림은 `science-src` 브랜치에만**. `claude/jolly-allen-w57yqh`·`main`에는 창작(authored) 문항만.
- `science-src`는 **main에 병합 금지**(GitHub Pages 공개 방지). 나중에 저장소를 비공개로 잠근다.
- 그림·문장에 **원래 문항 번호가 보이면 안 된다**(세트·번호는 대응표의 `source` 필드에만).
- 4학년 미학습 용어 금지(`bank/audit.mjs`의 EARLY_TERMS). 정답 위치 고르게, 정답이 유일한 최장 보기 금지.

## 입력
- PDF: `G:\내 드라이브\과학 단원평가\4-1\Ⅰ. 자석의 이용\최다빈출 단원평가 세트1~4.pdf` (+ `정답 및 풀이`). 스캔본.
- 원문·정답 80행: Supabase 프로젝트 `fgahqumaldheqettmvqg`, `public.science_bank_source where unit_id='s41-u01'` (item jsonb = 문항 계약, `figures.block` = 옛 그림 경로 → 이번에 새 경로로 교체).
- 도구: `science-lab/bank/tools/crop_blocks.py <PDF폴더> <출력폴더>` — 문항 블록 PNG를 자르고 **번호를 흰색으로 지운다**(검증됨: 80문항 + 묶음 지문 7). `pip install pymupdf opencv-python numpy`.

## 1단계 — 분류 체계 (2022 개정)
`science-lab/bank/taxonomy/s41-u01.json`(git, 공개 가능 — 원문 없음)을 만든다.
```json
{ "unit":"s41-u01", "curriculum":"2022 개정", "grade":4, "semester":1, "title":"자석의 이용",
  "area":"운동과 에너지", "standards":["4과09-01","4과09-02"],
  "elements":[ {"id":"E1","name":"자석과 물체 사이의 힘"}, {"id":"E2","name":"자석의 극"},
               {"id":"E3","name":"자석과 자석 사이의 힘"}, {"id":"E4","name":"자석의 이용(나침반·생활)"} ],
  "types":[ {"id":"T01","element":"E1","name":"자석에 붙는 물체 고르기","desc":"..."}, ... ],
  "formats":["선택형","단답형","표","서술형"] }
```
- 성취기준 문장은 교육부 고시 2022-33호 [별책 9] 과학과 원문과 대조해 `standards`를 `{code,text}`로 채운다(추측 금지 — 못 찾으면 code만 두고 보고).
- 유형(types)은 **원문 80문항을 실제로 분류해서** 10~14개로 만든다. 예: 붙는 물체 고르기 · 재료별 분류표 · 클립으로 극 찾기 · 물에 띄운 자석의 방향 · 같은/다른 극의 힘 · 고리 자석 · 자석 사이에 물체 끼우기(투과·거리) · 나침반 바늘 방향 · 나침반으로 극 추리 · 생활 속 자석 이용 · 실험 설계/조건 · 서술형 설명.

## 2단계 — 원본 정리 (`science-src` 브랜치)
1. `crop_blocks.py`로 자른다. 결과를 눈으로 전수 확인(번호 흔적·잘림·다른 문항 섞임 없어야 함).
2. 각 원문을 분류해 Supabase `item.taxonomy`에 `{grade:4, area, standard, element, type, format, level, track}` 기록.
3. 파일 이름·위치를 분류 기준으로 바꿔 `science-src` 브랜치에 커밋:
   `science-src/4-1/자석의 이용/<E코드 내용요소>/<T코드 유형>/o-<유형 내 순번>.png`, 묶음 지문은 `.../stem-<순번>.png`.
4. 대응표 `science-src/4-1/자석의 이용/index.json`: `{ "<원문 id>": {file, stem?, element, type, format, source:{set, no}} }`.
5. Supabase `figures.block`과 `item.visualModel.figure`(기존 값이 그림 경로인 것)를 새 경로로 update.

## 3단계 — 유사문항 80 (git, authored)
- 원문 1개당 유사문항 1개. 같은 유형·같은 형식·같은 난이도, **상황·물체·보기를 바꿔서**(원문 문장 재사용 금지).
- `science-lab/data/units/s41-u01.js`의 `items`에 추가. id `s41-u01-v001`~`v080`, `status:'authored'`,
  `taxonomy:{grade:4, level, track:'교과', area, standard, element, type, format}`, `sourceRef:{type:'similar', of:'<원문 source_key>'}`(원문 문장은 넣지 않음).
- 그림이 필요한 문항은 `figures`에 **새로 그린 SVG**(원본 트레이스 금지). 기존 `west-n-approach` 등과 같은 방식.
- 정답 위치 사전 배분(①~⑤ 고르게), 오답은 구체적으로(길이 신호 제거).
- `bank/audit.mjs`에 새 필드 검사 추가(element·type이 taxonomy 파일에 존재하는지, 유형별 유사문항 수) 후 **통과**.
- 기존 창작 26문항(a01~a26)에도 element·type 태그를 붙인다.

## 4단계 — 교재 유형별 부분
- `v2/v2.js` `pageBook`에 "유형별 문제" 섹션 추가: 내용 요소 → 유형 순서로, 유형 이름·설명 + 유사문항(학생용 빈칸 / 교사용 정답).
- 원본 그림은 공개 사이트에 싣지 않는다(science-src 전용).
- Playwright로 `#/s41-u01/print/student|teacher|answers` 인쇄 PDF 확인(콘솔 에러 0, 320px 넘침 0).

## 마무리
- `HANDOFF.md`에 진행 기록(무엇을·어디에·검증 결과) 추가, 커밋·푸시(`claude/jolly-allen-w57yqh`, `science-src` 각각).
- 보고: 유형 목록(유형별 원문 수·유사문항 수), 검사 결과, 확인 못 한 것.
