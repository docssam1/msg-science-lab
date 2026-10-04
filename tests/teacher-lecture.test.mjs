import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonOneLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity} from '../sample-v2/lesson-stage.js';

const pages=[studentCoverPage,...studentPrintPages];
const firstLesson=Array.from({length:12},(_,index)=>`P${index}`);

test('first lesson has a source-tagged instructor run of show for every projected scene',()=>{
 assert.deepEqual(Object.keys(lessonOneLecture),firstLesson);
 for(const id of firstLesson){
  const lecture=lessonOneLecture[id];
  const page=pages.find(item=>item.printId===id);
  assert(page&&hasLessonStage(page),`${id} must be a real classroom scene`);
  assert(lecture.origin&&lecture.phase&&lecture.check,`${id} needs provenance and a teaching check`);
  assert(lecture.steps.length>=3,`${id} needs a usable teaching sequence`);
 }
});

test('structure → zero → need → five-object prediction → measurement remains the first lesson spine',()=>{
 assert.deepEqual(firstLesson.slice(1,6).map(id=>lessonOneLecture[id].phase),[
  '관찰 · 구조','실험 방법 · 기준','탐구 도입 · 필요성','예상 · 이유 말하기','실험 · 직접 측정'
 ]);
 for(const id of ['P3','P4','P5'])assert.match(lessonOneLecture[id].origin,/추가 탐구/);
 assert.equal(stageActivity(pages[5]),'inquiry');
 assert.match(lessonOneLecture.P5.check,/실험 방법에 오류가 있어요\. 어떤 과정을 다시 살펴봐야 할까요\?/);
 assert.match(lessonOneLecture.P5.check,/정답 단어를 먼저 알려 주지 않/);
});

test('media and assessment cues keep the source and add-on boundaries visible',()=>{
 assert.equal(stageActivity(pages[9]),'watch');
 assert.equal(stageActivity(pages[10]),'spring-film');
 assert.match(lessonOneLecture.P9.origin,/보충 기록영상/);
 assert.match(lessonOneLecture.P10.origin,/가상 이미지/);
 assert.match(lessonOneLecture.P11.origin,/원본 본책 15쪽/);
});
