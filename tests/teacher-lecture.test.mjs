import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonOneLecture,lessonTwoLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
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

const secondLesson=Array.from({length:9},(_,index)=>`P${index+12}`);

test('second lesson has a source-tagged run of show for every projected scene and joins the notes map',()=>{
 assert.deepEqual(Object.keys(lessonTwoLecture),secondLesson);
 assert.deepEqual(Object.keys(teacherLecture),[...firstLesson,...secondLesson]);
 for(const id of secondLesson){
  const lecture=lessonTwoLecture[id];
  const page=pages.find(item=>item.printId===id);
  assert(page&&hasLessonStage(page),`${id} must be a real classroom scene`);
  assert(lecture.origin&&lecture.phase&&lecture.check,`${id} needs provenance and a teaching check`);
  assert(lecture.steps.length>=3,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}쪽`),`${id} origin must name printed book page ${page.source[0]}`);
 }
});

test('A/B data stay separate and the unverified 반비례 and Daily Test 9–11 stay locked in the notes',()=>{
 assert.match(lessonTwoLecture.P15.check,/Daily Test 12번\(4·8·12 cm\)/);
 assert.match(lessonTwoLecture.P15.check,/추당 2 cm/);
 assert.match(lessonTwoLecture.P16.check,/12번 그래프용 눈금\(4·8·12\)/);
 assert.match(lessonTwoLecture.P14.check,/반비례/);
 assert.match(lessonTwoLecture.P14.check,/가르치지 않습니다/);
 const p20=JSON.stringify(lessonTwoLecture.P20);
 assert.match(p20,/9~11번은 공식 해설과 원문 대조가 끝나기 전까지 답과 추가 설명을 공개하지 않습니다/);
 assert.doesNotMatch(p20,/굵을수록|탄성력은 (크다|작다)|(같다|다르다)\)/);
 assert.doesNotMatch(JSON.stringify(lessonTwoLecture.P17),/굵을수록/);
 assert.equal(stageActivity(pages[19]),null,'P19 starts on question 1, which has no embedded activity');
});
