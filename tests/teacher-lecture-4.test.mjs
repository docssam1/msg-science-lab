import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonFourLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity,renderLessonStage} from '../sample-v2/lesson-stage.js';
import {pages as contentPages,q4,assessmentGroupsByPrint,weightTargets,weightAnswers,weightsGiven} from '../sample-v2/content.js';
import {UNCONFIRMED,lessonRemedyLog} from '../sample-v2/remedy-bank.js';
import {gradeItem,formatKey,itemLabel} from '../sample-v2/daily-grading.js';
import {activityNames} from '../sample-v2/activities.js';
import {weightPlans,isBalanced,leverTorque} from '../sample-v2/physics.js';
import {leverAngle} from '../sample-v2/graphics.js';

const pages=[studentCoverPage,...studentPrintPages];
const lessonFour=Array.from({length:8},(_,index)=>`P${index+33}`);
const MEMO=/검수 메모|검수 대기|충돌|도면 1·2|정답 미인쇄|오탈자|수메르/;

test('fourth lesson has a source-tagged run of show for every scene P33–P40',()=>{
 assert.deepEqual(Object.keys(lessonFourLecture),lessonFour);
 assert.deepEqual(Object.keys(teacherLecture).slice(33),lessonFour);
 for(const id of lessonFour){
  const lecture=lessonFourLecture[id];
  const page=pages.find(item=>item.printId===id);
  assert(page&&page.lesson===4&&hasLessonStage(page),`${id} must be a real lesson-4 scene`);
  assert(lecture.origin&&lecture.phase&&lecture.check,`${id} needs provenance and a teaching check`);
  assert(lecture.steps.length>=3,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}쪽`),`${id} origin must name printed book page ${page.source[0]}`);
 }
});

test('review memos stay in the instructor window and never reach a projected or student scene',()=>{
 for(const id of lessonFour){
  const index=pages.findIndex(item=>item.printId===id),page=pages[index];
  for(const mode of ['teacher','student']){
   const html=renderLessonStage(page,index,mode,{questionIndex:0,answerOpen:true,explanationOpen:true}).replace(/<[^>]+>/g,' ');
   assert.doesNotMatch(html,MEMO,`${id} ${mode} shows memo text`);
  }
 }
 for(const id of ['P36','P38','P39','P40'])assert.match(lessonFourLecture[id].check,/\[검수 메모 · 투사 화면에는 표시하지 않음\]/);
 assert.match(lessonFourLecture.P39.check,/도면 1·2는 본책 30~35쪽에 실려 있지 않습니다/);
 assert.match(lessonFourLecture.P40.check,/교재 33쪽에는 정답이 인쇄돼 있지 않습니다/);
});

test('textbook sentences are carried as printed',()=>{
 const byId=Object.fromEntries(contentPages.map(page=>[page.id,page]));
 const text=id=>byId[id].body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 assert.match(text('l4-level'),/한쪽으로 치우치거나 기울어지지 않고 균형이 맞는 평평한 상태\./);
 assert.match(text('l4-level'),/지구의 중력방향과 수직을 이루는 것/);
 assert.match(text('l4-principle'),/무거운 물체는 받침점에서 가깝고, 가벼운 물체는 받침점에서 멀다\./);
 assert.match(text('l4-formula'),/수평잡기 공식: 무게 × 거리 = 무게 × 거리/);
 assert.match(text('l4-formula'),/거리는 4칸, ②번 물체가 놓여있는 지점에서 받침점까지의 거리는 4칸 이므로/);
 assert.match(text('l4-tilt'),/오른쪽이 더 무거워져 ‘오른쪽으로 기울어진다’/);
 assert.match(text('l4-unequal'),/상자 2개의 무게 × 2칸 = 상자1개의 무게 × 4칸/);
 assert.match(text('l4-wheel'),/굴러가야하는/);   // 교재 표기를 고치지 않는다
 assert.match(text('l4-ramp'),/바퀴의 무게중심은 바닥에 가까워져 가는 것입니다/);
 assert.equal(byId['l4-test'].source[0],33);
});

test('the lever lab uses only the book formula: weight × distance on each side',()=>{
 assert.equal(leverTorque(1,4),leverTorque(1,4));              // ⑤ 4칸과 4칸
 assert.equal(leverTorque(2,2),leverTorque(1,4));              // ⑦ 상자 2개 × 2칸 = 상자 1개 × 4칸
 assert(leverTorque(1,2)<leverTorque(1,4));                    // ⑥ 오른쪽이 더 무겁다
 assert.equal(leverAngle({n:1,a:4},{n:1,b:4}),0);
 assert.equal(leverAngle({n:2,a:2},{n:1,b:4}),0);
 assert(leverAngle({n:1,a:2},{n:1,b:4})>0,'오른쪽으로 기울어짐');
 assert(leverAngle({n:3,a:4},{n:1,b:1})<0,'왼쪽으로 기울어짐');
 for(const id of ['P34','P35','P36','P37'])assert.equal(stageActivity(pages.find(item=>item.printId===id)),'lever',id);
 for(const kind of ['lever','weights'])assert(activityNames[kind],`${kind} needs a name so the lab can open`);
});

test('Daily Test is one drawing item: balanced answers are derived, never matched against a printed key',()=>{
 assert.deepEqual(assessmentGroupsByPrint.P40.map(q=>q.id),['e1']);
 assert.equal(q4.length,1);
 assert.equal(weightTargets.length,13);
 for(const t of weightTargets){
  const plans=weightPlans(t);
  assert.equal(plans.length,1,`${t} g has exactly one arrangement of 1·3·9 g`);
  assert(isBalanced(t,plans[0].left,plans[0].right),`${t} g balances`);
  assert.deepEqual(weightAnswers[t],plans[0]);
 }
 assert.equal(weightPlans(14).length,0);
 assert.deepEqual(weightsGiven,weightAnswers[1],'교재 33쪽의 1g 예와 같다');
 assert(!UNCONFIRMED.has('e1'),'e1 is not locked, it is simply teacher-checked');
 assert.deepEqual(gradeItem(q4[0],''),{status:'review',reason:'draw'});
 assert.doesNotMatch(formatKey(q4[0]),MEMO);
 assert.equal(itemLabel('e1'),'4차시 1번');
 assert.equal(stageActivity(pages.find(item=>item.printId==='P40'),0),'weights');
});

test('lesson-4 diagnosis log only keeps lesson-4 items',()=>{
 const log=[{item:'a1'},{item:'b2'},{item:'c3'},{item:'e1'}];
 assert.deepEqual(lessonRemedyLog(log,4),[{item:'e1'}]);
 assert.deepEqual(lessonRemedyLog(log,3),[{item:'c3'}]);
});
