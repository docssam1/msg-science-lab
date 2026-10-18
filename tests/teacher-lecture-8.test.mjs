import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonEightLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity,renderLessonStage,stageGradeLabel} from '../sample-v2/lesson-stage.js';
import {pages as contentPages,q8,assessmentGroupsByPrint,questionHTML} from '../sample-v2/content.js';
import {UNCONFIRMED,lessonRemedyLog} from '../sample-v2/remedy-bank.js';
import {gradeItem,formatKey,itemLabel} from '../sample-v2/daily-grading.js';
import {activityNames} from '../sample-v2/activities.js';
import {sourceLessons} from '../sample-v2/source-lessons.js';
import {trafficSigns,speedSigns,tripTotals,routePoints,routeLength,straightLength} from '../sample-v2/motion8.js';

const pages=[studentCoverPage,...studentPrintPages];
const lessonEight=Array.from({length:8},(_,index)=>`P${index+67}`);
const MEMO=/검수 메모|고치지 않았습니다|공식 정답이 아닙니다|가상의 값입니다|편집 보완|검증하지 않았습니다/;

test('eighth lesson has a source-tagged run of show for every scene P67–P74',()=>{
 assert.deepEqual(Object.keys(lessonEightLecture),lessonEight);
 assert.deepEqual(Object.keys(teacherLecture).slice(67),lessonEight);
 for(const id of lessonEight){
  const lecture=lessonEightLecture[id],page=pages.find(item=>item.printId===id);
  assert(page&&page.lesson===8&&hasLessonStage(page),`${id} must be a real lesson-8 scene`);
  assert(lecture.steps.length>=3&&lecture.check&&lecture.phase,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}`),`${id} origin must name printed book page ${page.source[0]}`);
 }
 assert.deepEqual(pages.filter(p=>p.lesson===8).map(p=>p.source[0]),[58,59,61,61,62,62,63,63]);
 for(const id of lessonEight.slice(0,6))assert(sourceLessons[id]?.teacher,`${id} needs a source cue`);
 for(const id of ['P69','P70','P72'])assert.match(lessonEightLecture[id].check,/인쇄돼 있지 않습니다/,id);
 assert.match(lessonEightLecture.P68.check,/검증하지 않았습니다/,'news figures are flagged as unverified');
});

test('review memos stay in the instructor window and never reach a projected or student scene',()=>{
 for(const id of lessonEight){
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
 assert.match(text('l8-signs'),/주로 원형 모양, 빨간색 테두리가 있는 흰색 바탕으로 통행을 금지하거나 제한하는 것을 도로이용자에게 알리는 표지판\./);
 for(const [name] of trafficSigns)assert(text('l8-signs').includes(name),name);
 assert.match(text('l8-hypertube'),/서울에서 부산까지 20분 만에 주행할 수 있다\./);
 assert.match(text('l8-hypertube'),/시속 603km를 기록하고 있다\./);
 assert.match(text('l8-velocity'),/물체의 빠르기를 이동한 방향과 함께 나타낸다는 점에서 속력과 차이가 있다\./);
 assert.match(text('l8-vector'),/면적 시간 등이 그것이며, 이와 같은 양을 ‘스칼라’라고 부른다 /);
 assert.match(text('l8-trip'),/목표지점은 E구간을 돌아 다시 D까지 오는 동안의 속력과 속도를 구하시오\./);
 const p73=studentPrintPages.find(p=>p.printId==='P73');
 assert.match(p73.title,/^Daily Test 01–04$/);
 assert.equal(trafficSigns.length,24);assert(speedSigns.every(n=>trafficSigns.some(t=>t[0]===n)));
});

test('Daily Test 01–08: unit symbols and speeds graded, symbol/velocity items locked',()=>{
 assert.equal(q8.length,8);
 assert.deepEqual(['P73','P74'].map(id=>assessmentGroupsByPrint[id].map(q=>q.n)),[[1,2,3,4],[5,6,7,8]]);
 for(const id of ['i2','i3','i4'])assert(UNCONFIRMED.has(id),id);
 const [i1,i2,i3,i4,i5,i6,i7,i8]=q8;
 assert.equal(gradeItem(i1,['s','m','h']).status,'correct');assert.equal(gradeItem(i1,['sec','min','hr']).status,'correct');
 assert.equal(gradeItem(i1,['m','s','h']).status,'wrong','swapped symbols');
 for(const q of [i2,i3,i4]){assert.equal(gradeItem(q,'아무 답').status,'review');assert.match(questionHTML(q),/공식 해설 대조 필요/);}
 assert.equal(gradeItem(i5,'4 m/s').status,'correct');assert.equal(gradeItem(i6,'5').status,'correct');
 assert.equal(gradeItem(i7,'3m/s').status,'correct');assert.equal(gradeItem(i7,'2m/s').status,'review');
 assert.equal(gradeItem(i8,'50 m/s').status,'correct');
 assert.equal(itemLabel('i8'),'8차시 8번');
 assert.equal(formatKey(i1),'초 s · 분 m · 시 h');
 assert.equal(stageGradeLabel(pages.find(p=>p.printId==='P73')),'네 문항 채점하기');
 assert.deepEqual(lessonRemedyLog([{item:'h1'},{item:'i5'}],8),[{item:'i5'}]);
});

test('lesson-8 labs are registered, scenes open them, and the trip numbers follow the figure',()=>{
 for(const kind of ['traffic-signs','hypertube','routes','cycle-trip'])assert(activityNames[kind],kind);
 const act=(id,i)=>stageActivity(pages.find(item=>item.printId===id),i);
 assert.deepEqual(lessonEight.slice(0,6).map(id=>act(id)),['traffic-signs','hypertube','routes','routes','routes','cycle-trip']);
 assert.equal(act('P73',0),'speed-units');assert.equal(act('P73',1),null);assert.equal(act('P74',2),'cycle-trip');
 // 62쪽: 200·200·200·300m, A→E→D, 구간마다 10초
 assert.deepEqual(tripTotals,{dist:1200,time:50,disp:600,speed:24,velocity:12});
 const p72=pages.find(p=>p.printId==='P72'),i72=pages.indexOf(p72);
 assert.match(renderLessonStage(p72,i72,'teacher',{answerOpen:true}),/24m\/s/);
 for(const pts of routePoints)assert(routeLength(pts)>straightLength,'every route is longer than the straight arrow');
});
