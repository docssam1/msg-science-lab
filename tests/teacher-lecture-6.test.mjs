import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonSixLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity,renderLessonStage,stageGradeLabel} from '../sample-v2/lesson-stage.js';
import {pages as contentPages,q6,assessmentGroupsByPrint,questionHTML} from '../sample-v2/content.js';
import {UNCONFIRMED,lessonRemedyLog} from '../sample-v2/remedy-bank.js';
import {gradeItem,formatKey,itemLabel} from '../sample-v2/daily-grading.js';
import {activityNames} from '../sample-v2/activities.js';
import {sourceLessons} from '../sample-v2/source-lessons.js';

const pages=[studentCoverPage,...studentPrintPages];
const lessonSix=Array.from({length:8},(_,index)=>`P${index+49}`);
const MEMO=/검수 메모|서로 반대|고치지 않았습니다|가상의 값입니다/;
// 해설 PDF(정답과 해설 2~3쪽, 01 무게재기)에 인쇄된 정답 — 보기 번호 ①=0
const OFFICIAL=[1,5,2,2,3,2,3,2,3,5,1,2,4,3,1,2,5,2,4,4];

test('sixth lesson has a source-tagged run of show for every scene P49–P56',()=>{
 assert.deepEqual(Object.keys(lessonSixLecture),lessonSix);
 assert.deepEqual(Object.keys(teacherLecture).slice(49),lessonSix);
 for(const id of lessonSix){
  const lecture=lessonSixLecture[id],page=pages.find(item=>item.printId===id);
  assert(page&&page.lesson===6&&hasLessonStage(page),`${id} must be a real lesson-6 scene`);
  assert(lecture.steps.length>=3&&lecture.check&&lecture.phase,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}쪽`),`${id} origin must name printed book page ${page.source[0]}`);
 }
 assert.deepEqual(pages.filter(p=>p.lesson===6).map(p=>p.source[0]),[41,41,41,42,44,45,46,47]);
 for(const id of lessonSix.slice(0,4))assert(sourceLessons[id]?.teacher,`${id} needs a source cue`);
 assert.match(lessonSixLecture.P52.check,/서로 반대/,'the left/right conflict on p.42 is recorded for the teacher');
});

test('review memos stay in the instructor window and never reach a projected or student scene',()=>{
 for(const id of lessonSix){
  const index=pages.findIndex(item=>item.printId===id),page=pages[index];
  const count=assessmentGroupsByPrint[id]?.length||1;
  for(let questionIndex=0;questionIndex<count;questionIndex++)for(const mode of ['teacher','student']){
   const html=renderLessonStage(page,index,mode,{questionIndex,answerOpen:true,explanationOpen:true}).replace(/<[^>]+>/g,' ');
   assert.doesNotMatch(html,MEMO,`${id}#${questionIndex} ${mode} shows memo text`);
  }
 }
});

test('textbook sentences are carried as printed',()=>{
 const byId=Object.fromEntries(contentPages.map(page=>[page.id,page]));
 const text=id=>byId[id].body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 assert.match(text('l6-spring-make'),/⑥ 접시에 추를 1개씩 올려놓으면서 용수철 끝의 위치에 따라 흰색 테이프 표면에 추의 개수를 표시한다\./);
 assert.match(text('l6-spring-make'),/용수철의 늘어난 길이를 알 수 있도록 눈금을 표시 할 수 있어야 한다\./);
 assert.match(text('l6-spring-check'),/추를 접시에 올려놓지 않았을 때 용수철 끝이‘0’을 가리키는지 확인한다\./);
 assert.match(text('l6-balance-make'),/수평이 맞지 않는다면\?\? 고무 찰흙을 붙여 수평이 되게 한다\./);
 assert.match(text('l6-balance-use'),/양팔 저울의 왼쪽 접시에 올려놓습니다\./);
 assert.match(text('l6-balance-use'),/기준물체는 관찰자를 기준으로 해서 오른쪽에 놓는다\./);
 const p53=studentPrintPages.find(p=>p.printId==='P53');
 assert.match(p53.title,/^단원 평가 01–06$/);assert.match(p53.body,/unit-test-banner/);assert.match(p53.body,/\[06~07\] 다음 표는/);
});

test('unit test 01–20 is scored with the official answer key',()=>{
 assert.equal(q6.length,20);
 assert.deepEqual(q6.map(q=>q.answer+1),OFFICIAL);
 assert.deepEqual(['P53','P54','P55','P56'].map(id=>assessmentGroupsByPrint[id].map(q=>q.n)),[[1,2,3,4,5,6],[7,8,9,10,11,12],[13,14,15,16,17],[18,19,20]]);
 for(const q of q6){
  assert(!UNCONFIRMED.has(q.id),`${q.id} has an official answer`);
  assert.equal(gradeItem(q,q.answer).status,'correct',q.id);
  assert.equal(gradeItem(q,(q.answer+1)%q.options.length).status,'wrong',q.id);
  assert.equal(q.key,'official',q.id);
 }
 assert.equal(formatKey(q6[17]),'② 〈');
 assert.equal(itemLabel('g20'),'6차시 20번');
 for(const q of [q6[5],q6[6]])assert.match(questionHTML(q),/추의 개수\(개\)/,`${q.id} shows the spring table`);
 for(const q of [q6[13],q6[14]])assert.doesNotMatch(questionHTML(q),/<i>①<\/i>①/,'picture options are not doubled');
 assert.equal(stageGradeLabel(pages.find(p=>p.printId==='P55')),'다섯 문항 채점하기');
});

test('lesson-6 labs are registered and scenes and items open them',()=>{
 for(const kind of ['make-spring-scale','make-balance','make-balance-compare'])assert(activityNames[kind],kind);
 const act=(id,i)=>stageActivity(pages.find(item=>item.printId===id),i);
 assert.equal(act('P49'),'make-spring-scale');assert.equal(act('P51'),'make-balance');assert.equal(act('P52'),'make-balance-compare');
 assert.equal(act('P53',0),'parts');assert.equal(act('P55',3),'lever');
 assert.deepEqual(lessonRemedyLog([{item:'f1'},{item:'g3'}],6),[{item:'g3'}]);
});
