import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonThreeLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity,renderLessonStage} from '../sample-v2/lesson-stage.js';
import {q3,assessmentGroupsByPrint} from '../sample-v2/content.js';
import {UNCONFIRMED} from '../sample-v2/remedy-bank.js';
import {gradeItem} from '../sample-v2/daily-grading.js';
import {sourceLessons} from '../sample-v2/source-lessons.js';
import {activityNames} from '../sample-v2/activities.js';

const pages=[studentCoverPage,...studentPrintPages];
const lessonThree=Array.from({length:12},(_,index)=>`P${index+21}`);
const byId=Object.fromEntries(q3.map(q=>[q.id,q]));
// Wording that is review memo material: allowed in the instructor window and teacher print, never on a projected or student scene.
const MEMO=/검수 메모|검수 대기|충돌|표기 혼재|등호로 묶은|교재 안에서/;

test('third lesson has a source-tagged run of show for every scene P21–P32',()=>{
 assert.deepEqual(Object.keys(lessonThreeLecture),lessonThree);
 assert.deepEqual(Object.keys(teacherLecture).slice(-12),lessonThree);
 for(const id of lessonThree){
  const lecture=lessonThreeLecture[id];
  const page=pages.find(item=>item.printId===id);
  assert(page&&page.lesson===3&&hasLessonStage(page),`${id} must be a real lesson-3 scene`);
  assert(lecture.origin&&lecture.phase&&lecture.check,`${id} needs provenance and a teaching check`);
  assert(lecture.steps.length>=3,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}쪽`),`${id} origin must name printed book page ${page.source[0]}`);
 }
});

test('review memos stay in the instructor window and never reach a projected or student scene',()=>{
 for(const id of lessonThree){
  const index=pages.findIndex(item=>item.printId===id),page=pages[index];
  const questions=assessmentGroupsByPrint[id]?.length||1;
  for(const mode of ['teacher','student']){
   for(let q=0;q<questions;q++){
    const html=renderLessonStage(page,index,mode,{questionIndex:q,answerOpen:true,explanationOpen:true}).replace(/<[^>]+>/g,' ');
    assert.doesNotMatch(html,MEMO,`${id} ${mode} q${q+1} shows memo text`);
   }
  }
  if(!id.endsWith('32')&&sourceLessons[id])assert.doesNotMatch(JSON.stringify(sourceLessons[id]),MEMO,`${id} source cue`);
 }
 // the concerns are recorded where the instructor reads them
 for(const id of ['P23','P25','P26','P29'])assert.match(lessonThreeLecture[id].check,/\[검수 메모 · 투사 화면에는 표시하지 않음\]/);
 assert.match(lessonThreeLecture.P23.check,/무게와 중력의 뜻은 같지 않다/);
 assert.match(lessonThreeLecture.P26.check,/1Kg = 1Kg·f = 9\.8N/);
 assert.match(lessonThreeLecture.P27.check,/정답을 만들거나 공개하지 않/);
});

test('only book-stated Daily Test 1–8 grade automatically; 9 stays locked; arrows are checked in person',()=>{
 assert.deepEqual(assessmentGroupsByPrint.P32.map(q=>q.id),q3.map(q=>q.id));
 assert.equal(q3.length,9);
 assert(UNCONFIRMED.has('c9'));
 for(const id of ['c1','c2','c3','c4','c5','c6','c7','c8'])assert(!UNCONFIRMED.has(id),id);
 assert.deepEqual(gradeItem(byId.c9,['↑','↑','↑','↑','↑']),{status:'review',reason:'locked'});
 assert.equal(gradeItem(byId.c1,'중력').status,'correct');
 assert.equal(gradeItem(byId.c2,'질량').status,'review');   // unknown wording is never guessed wrong
 assert.equal(gradeItem(byId.c3,['1','9.8']).status,'correct');
 assert.equal(gradeItem(byId.c3,['1','9.8N']).status,'review');
 assert.equal(gradeItem(byId.c5,'60').status,'correct');
 assert.deepEqual(gradeItem(byId.c4,''),{status:'review',reason:'draw'});
 assert.equal(gradeItem(byId.c7,['윗접시저울','양팔저울']).status,'correct');
 assert.equal(gradeItem(byId.c7,['대저울','윗접시 저울']).status,'correct');
 assert.equal(gradeItem(byId.c7,['용수철저울','양팔저울']).status,'wrong');
 assert.equal(gradeItem(byId.c7,['양팔저울','양팔저울']).status,'wrong');
 assert.equal(gradeItem(byId.c7,['양팔저울','']).status,'blank');
 assert.equal(gradeItem(byId.c8,['체중계','가정용 저울']).status,'correct');
 assert.equal(gradeItem(byId.c8,['대저울','체중계']).status,'wrong');
});

test('every lesson-3 activity is registered and wired to its scene',()=>{
 const wanted={P23:'gravity',P25:'elastic',P26:'moon-weight',P29:'weight-mass',P30:'mass-weight-graph'};
 for(const [id,kind] of Object.entries(wanted)){
  const page=pages.find(item=>item.printId===id);
  assert.equal(stageActivity(page),kind,id);
  assert(activityNames[kind],`${kind} needs a name so the lab can open`);
 }
 const test=pages.find(item=>item.printId==='P32');
 assert.equal(stageActivity(test,3),'gravity','Daily Test 4 opens the direction lab');
});
