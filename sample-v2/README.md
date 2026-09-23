# MSG Science Lab — 1·2차시 수업 샘플

본문 원본: 《초과심_물리》 printed pp.10–21. 18쪽으로 재편집, 원본 평가 6+12문항.

`index.html`을 HTTP 서버에서 엽니다. `print/student.pdf`, `print/teacher.pdf`는 같은 지면의 인쇄본입니다.

StPageFlip 2.0.7, Three.js 0.184.0과 OrbitControls(MIT)는 vendor에 버전 고정하여 포함했습니다. 라이선스 원문도 동봉했습니다.

## 실제 영상
- HowaWatchWork1949.ogv: Handy(Jam) Organization / Hamilton Watch Company, Prelinger Archives, Public Domain. 5:42–6:21 및 11:20–11:47 발췌, 원음 제거. 원본 400×300 역사영상. https://commons.wikimedia.org/wiki/File:HowaWatchWork1949.ogv
- Hookeslawexample.ogv: Walter Lewin / MIT8.01, CC BY3.0. 0:29–0:43 발췌, 원음 제거, 출력규격 패딩. https://commons.wikimedia.org/wiki/File:Hookeslawexample.ogv / https://creativecommons.org/licenses/by/3.0/
이 관찰영상은 본책의 특정 실험 수치를 검증하는 영상이 아닙니다.

## 음성
20개 학습 지면의 도입, 20개 지면의 전체 본문 읽기, 부품·이야기·영상 관찰 질문과 고정 피드백은 선생님 참조 녹음으로 생성한 OmniVoice 파일을 사용합니다. audio/voice-library.json에 정확한 대사·생성엔진·파일과 읽기 순서를 기록합니다. 음원 누락이나 재생 실패 때 기기 음성으로 대체하지 않으며 자동 진행도 중단합니다. 자유 입력 내용이나 임의의 동적 문장을 합성하는 서비스는 아닙니다. 원본 참조 녹음은 배포 파일에 포함하지 않습니다.

## 출처와 검수
원본 그림/표/문항 대조는 source/의 해당 쪽에서 가능합니다. source-coverage.json을 참조하세요. 역사/미래 원문과 편집 보완 설명을 분리했습니다. 학생 답안은 기기 내 저장만 사용합니다.

## 한계
실물 전자칠판에서의 동시 멀티터치는 별도 확인이 필요합니다. 실험은 이상적 교육 모형입니다. 모든 제품의 실제 내부 구조를 재현한 3D 모델은 아니며, 도구 원리는 개념 도해로 구분합니다.


## Inquiry / QR update
Two authored introduction pages precede the unchanged 18 textbook-based pages (20 printed pages total). Each page has a tested deep-link QR. Prediction and method validity are assessed independently: no preparatory zero verdict, generic method-error feedback only after a submitted faulty measurement, correction and final explanation. Inquiry narration is now generated with OmniVoice; the original18clips are retained.


## Five familiar objects
Replaces anonymous pouches and the 2+3 split with one ordering of five familiar items: one shoe, one apple, two mandarins as one bundle, one phone and a filled pencil case. Detailed vector illustrations and individual 3D models share one transparent carrier. A smooth object-closeup button allows inspection without changing its load. Similar virtual loads use a dedicated 0–5 N scale with 0.1 N graduations; original 30 N textbook activities are unchanged. No weights or calibration verdict precede measurement. The new storage key preserves older inquiry records. Both 20-page QR editions regenerated. These are designed model weights, not empirically measured consumer products.


## Framed guide editions
Restyled from the original lete-on science-lab book CSS: chapter bands, double frames, ribbons, green concept boxes, navy observation panels, yellow cautions and red teacher annotations. Dedicated student.html, teacher.html and book.html entries share the same original20contentpages. Student PDF22pages (cover/navigation+20); instructor PDF27pages (cover/navigation+2lesson plans+2existing-note pages+21content sheets, one dense question section split rather than reduced type). Student routing never inherits instructor key visibility. Instructor projected pages initially conceal keys; explicit reveal opens annotated reading. Existing18questions, source text, five-object inquiry, delayed method feedback, QRtargets, media and physics are unchanged.


## Approved expression and classroom repair
The SVG mouth/tongue overlay was removed. Six whole portrait expressions are cropped from the existing approved teacher sheet; art/expressions/manifest.json records the source hash and crops. Faces change with explanation/question/feedback state, not with a fabricated phoneme animation. All book and class routes share coach.js.

class.html?mode=teach implements landscape teaching with sequential answer/explanation reveal and optional notes (N); class.html?mode=self supports saved student writing, original-question checking, the same experiments and returning to the eBook. Fullscreen (F), keyboard navigation and separate pen mode are included. The 20 source-backed learning pages are segmented without replacing their original18questions. This is an HTML slide course, not a generated PPTX file.

Reference behavior was inspected from docssam1/lete-on science-lab/v2/deck.js at 6b61afc92a24d78cba28b4664bb33db334dd26e4 and the supplied intro page. The other repository is not modified. New slides adapt the interaction pattern, not its volcano/erosion subject matter or its other teacher identity. The existing framed student and teacher PDFs are unchanged.
