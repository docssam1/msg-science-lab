import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonNineLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity,renderLessonStage,stageGradeLabel} from '../sample-v2/lesson-stage.js';
import {pages as contentPages,q9,assessmentGroupsByPrint,questionHTML} from '../sample-v2/content.js';
import {UNCONFIRMED,lessonRemedyLog} from '../sample-v2/remedy-bank.js';
import {gradeItem,itemLabel} from '../sample-v2/daily-grading.js';
import {activityNames} from '../sample-v2/activities.js';
import {sourceLessons} from '../sample-v2/source-lessons.js';
import {timeCars,distCars,events,racers,raceOrder} from '../sample-v2/motion9.js';

const pages=[studentCoverPage,...studentPrintPages];
const lessonNine=Array.from({length:6},(_,index)=>`P${index+75}`);
const MEMO=/검수 메모|고치지 않았습니다|공식 정답이 아닙니다|글자 인식|바로잡았습니다/;

test('ninth lesson has a source-tagged run of show for every scene P75–P80',()=>{
 assert.deepEqual(Object.keys(lessonNineLecture),lessonNine);
 assert.deepEqual(Object.keys(teacherLecture).slice(75),lessonNine);
 for(const id of lessonNine){
  const lecture=lessonNineLecture[id],page=pages.find(item=>item.printId===id);
  assert(page&&page.lesson===9&&hasLessonStage(page),`${id} must be a real lesson-9 scene`);
  assert(lecture.steps.length>=3&&lecture.check&&lecture.phase,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}쪽`),`${id} origin must name printed book page ${page.source[0]}`);
 }
 assert.deepEqual(pages.filter(p=>p.lesson===9).map(p=>p.source[0]),[64,64,65,65,66,67]);
 for(const id of lessonNine.slice(0,4))assert(sourceLessons[id]?.teacher,`${id} needs a source cue`);
 for(const id of ['P76','P78'])assert.match(lessonNineLecture[id].check,/인쇄돼 있지 않습니다/,id);
});

test('review memos stay in the instructor window and never reach a projected or student scene',()=>{
 for(const id of lessonNine){
  const index=pages.findIndex(item=>item.printId===id),page=pages[index];
  const count=assessmentGroupsByPrint[id]?.length||1;
  for(let questionIndex=0;questionIndex<count;questionIndex++)for(const mode of ['teacher','student']){
   const html=renderLessonStage(page,index,mode,{questionIndex,answerOpen:true,explanationOpen:true}).replace(/<[^>]+>/g,' ');
   assert.doesNotMatch(html,MEMO,`${id}#${questionIndex} ${mode} shows memo text`);
  }
 }
});

test('textbook sentences are carried as printed (OCR checked against the page)',()=>{
 const byId=Object.fromEntries(contentPages.map(page=>[page.id,page]));
 const text=id=>byId[id].body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 assert.match(text('l9-time'),/10초 동안 이동한 거리 측정했을 때, 더 멀리 이동한 장난감의 속력이 빠르다/);
 assert.match(text('l9-time'),/A자동차 〉 B자동차 이다\./);
 assert.match(text('l9-event'),/종목/);assert.doesNotMatch(text('l9-event'),/종복/,'OCR error fixed');
 assert.match(text('l9-dist'),/이동시간 적게 걸린 장난감의 속력이 빠르다\./);
 assert.match(text('l9-race'),/9초 8초 5초 12초 10초/,'8초, not the OCR 8조');
 const p79=studentPrintPages.find(p=>p.printId==='P79');
 assert.match(p79.title,/^Daily Test 01–05$/);assert.match(p79.body,/\[04~06\] 자전거가 일정한 시간 동안/);
 assert.match(studentPrintPages.find(p=>p.printId==='P80').body,/\[09~10\] 다음은 여러 동물들의/);
});

test('Daily Test 01–10: book-backed choices and calculations, the stone count stays locked',()=>{
 assert.equal(q9.length,10);
 assert.deepEqual(['P79','P80'].map(id=>assessmentGroupsByPrint[id].map(q=>q.n)),[[1,2,3,4,5],[6,7,8,9,10]]);
 assert(UNCONFIRMED.has('j6'));
 assert.deepEqual(q9.filter(q=>q.kind==='choice').map(q=>[q.id,q.answer]),[['j1',0],['j2',1],['j4',4],['j5',1],['j7',3],['j8',0],['j9',4],['j10',3]]);
 for(const q of q9.filter(q=>q.kind==='choice')){assert.equal(gradeItem(q,q.answer).status,'correct',q.id);assert.equal(gradeItem(q,(q.answer+1)%q.options.length).status,'wrong',q.id);}
 assert.equal(gradeItem(q9[2],'12cm/s').status,'correct');assert.equal(gradeItem(q9[2],'12 cm/초').status,'correct');
 assert.equal(gradeItem(q9[5],'2').status,'review');assert.match(questionHTML(q9[5]),/공식 해설 대조 필요/);
 for(const q of [q9[3],q9[4],q9[5]])assert.match(questionHTML(q),/1초마다 이동한 거리/,`${q.id} shows the bicycle table`);
 for(const q of [q9[8],q9[9]])assert.match(questionHTML(q),/치타/,`${q.id} shows the animal table`);
 assert.equal(itemLabel('j10'),'9차시 10번');
 assert.equal(stageGradeLabel(pages.find(p=>p.printId==='P79')),'다섯 문항 채점하기');
 assert.deepEqual(lessonRemedyLog([{item:'i1'},{item:'j1'}],9),[{item:'j1'}]);
});

test('lesson-9 labs use only the book values',()=>{
 for(const kind of ['compare-time','compare-dist','speed-marks'])assert(activityNames[kind],kind);
 const act=(id,i)=>stageActivity(pages.find(item=>item.printId===id),i);
 assert.deepEqual(['P75','P76','P77','P78'].map(id=>act(id)),['compare-time','compare-time','compare-dist','compare-dist']);
 assert.equal(act('P79',2),'speed-marks');assert.equal(act('P80',0),null);
 assert.deepEqual(timeCars.map(c=>[c[1],c[2]]),[[500,10],[300,10]]);
 assert.deepEqual(distCars.map(c=>[c[1],c[2]]),[[500,5],[500,20]]);
 assert.deepEqual(events.map(e=>e[1]),[10,15,30]);
 assert.deepEqual(racers.map(r=>r[2]),[9,8,5,12,10]);
 assert.deepEqual(raceOrder,['순희','영수','진홍','주홍','지영']);
});
