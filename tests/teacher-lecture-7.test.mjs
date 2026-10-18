import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonSevenLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity,renderLessonStage,stageGradeLabel} from '../sample-v2/lesson-stage.js';
import {pages as contentPages,q7,assessmentGroupsByPrint,questionHTML} from '../sample-v2/content.js';
import {UNCONFIRMED,lessonRemedyLog} from '../sample-v2/remedy-bank.js';
import {gradeItem,formatKey,itemLabel} from '../sample-v2/daily-grading.js';
import {activityNames} from '../sample-v2/activities.js';
import {sourceLessons} from '../sample-v2/source-lessons.js';
import {positionAnswer,positionRows,checkUnitReading} from '../sample-v2/motion7.js';

const pages=[studentCoverPage,...studentPrintPages];
const lessonSeven=Array.from({length:10},(_,index)=>`P${index+57}`);
const MEMO=/검수 메모|고치지 않았습니다|공식 정답이 아닙니다|가상의 값입니다|편집 보완/;

test('seventh lesson has a source-tagged run of show for every scene P57–P66',()=>{
 assert.deepEqual(Object.keys(lessonSevenLecture),lessonSeven);
 assert.deepEqual(Object.keys(teacherLecture).slice(57,67),lessonSeven);
 for(const id of lessonSeven){
  const lecture=lessonSevenLecture[id],page=pages.find(item=>item.printId===id);
  assert(page&&page.lesson===7&&hasLessonStage(page),`${id} must be a real lesson-7 scene`);
  assert(lecture.steps.length>=3&&lecture.check&&lecture.phase,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}쪽`),`${id} origin must name printed book page ${page.source[0]}`);
 }
 assert.deepEqual(pages.filter(p=>p.lesson===7).map(p=>p.source[0]),[50,51,52,53,54,54,55,56,57,57]);
 for(const id of lessonSeven.slice(0,8))assert(sourceLessons[id]?.teacher,`${id} needs a source cue`);
 // 교재에 답이 없는 Speed Question은 공식 정답이 아님을 교사 메모에 남긴다
 for(const id of ['P58','P60','P63','P64'])assert.match(lessonSevenLecture[id].check,/인쇄돼 있지 않습니다/,id);
});

test('review memos stay in the instructor window and never reach a projected or student scene',()=>{
 for(const id of lessonSeven){
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
 assert.match(text('l7-motion'),/① 정지 · 단위 시간동안 물체의 위치가 변하지 않는 운동 상태/);
 assert.match(text('l7-motion-q'),/다음 그림에서 물체가 운동하고 있지 않다” 라고 생각하는 이유를 설명해보세요\./);
 assert.match(text('l7-position'),/‘대치엠에스지’는 우루사 동굴에서 서쪽으로 3km 떨어져 있다/);
 assert.match(text('l7-position'),/〈올바른 표현〉 선생님은 칠판에서 앞쪽, 1m 떨어진 곳에 계십니다\./);
 assert.match(text('l7-place'),/공간의 특정한 기준점으로부터의 방향과 직선거리로 설명되는 공간의 한 지점을 나타내는 것/);
 assert.match(text('l7-bear'),/〈방법2〉 인형은 정지 상태, 배경을 뒤로 움직이기/);
 assert.match(text('l7-speed'),/A는 1초 동안 1m 이동했으므로, 속력 = 1m\/1s 라면, 1m\/s의 빠르기를 가진다\./);
 assert.match(text('l7-units'),/일 킬로미터 퍼 아워/);
 const p65=studentPrintPages.find(p=>p.printId==='P65');
 assert.match(p65.title,/^Daily Test 01–05$/);assert.match(p65.body,/daily-test-banner/);
});

test('Daily Test 01–10: book-backed answers only, the symbol item stays locked',()=>{
 assert.equal(q7.length,10);
 assert.deepEqual(['P65','P66'].map(id=>assessmentGroupsByPrint[id].map(q=>q.n)),[[1,2,3,4,5],[6,7,8,9,10]]);
 assert(UNCONFIRMED.has('h1'),'h1 (속력의 기호) has no basis in pp.50–57');
 assert.equal(gradeItem(q7[0],'v').status,'review');
 assert.match(questionHTML(q7[0]),/공식 해설 대조 필요/);
 const [, h2, h3, h4, h5, h6, h7, h8, h9, h10]=q7;
 assert.equal(gradeItem(h2,0).status,'correct');assert.equal(gradeItem(h2,1).status,'wrong');
 assert.equal(gradeItem(h3,1).status,'correct');assert.equal(gradeItem(h3,0).status,'wrong');
 assert.equal(gradeItem(h4,['이동 거리','시간']).status,'correct');
 assert.equal(gradeItem(h4,['이동거리','걸린 시간']).status,'correct');
 assert.equal(gradeItem(h4,['시간','이동거리']).status,'wrong','swapped numerator and denominator');
 assert.equal(gradeItem(h4,['거리','시간']).status,'review','unknown wording is left to the teacher');
 for(const v of ['80m/s','80 m/s','80'])assert.equal(gradeItem(h5,v).status,'correct',v);
 assert.equal(gradeItem(h5,'2000m/s').status,'review');
 assert.equal(gradeItem(h6,'미터 퍼 세크').status,'correct');assert.equal(gradeItem(h6,'일 미터 퍼 세크').status,'correct');
 assert.equal(gradeItem(h6,'킬로미터 퍼 아워').status,'wrong');
 assert.equal(gradeItem(h7,'킬로미터 퍼 아워').status,'correct');assert.equal(gradeItem(h7,'미터 퍼 세크').status,'wrong');
 for(const q of [h8,h9,h10]){assert.equal(q.kind,'essay');assert.equal(gradeItem(q,'아무 답').status,'review');assert(formatKey(q).includes('56쪽'),q.id);}
 assert.equal(itemLabel('h10'),'7차시 10번');
 assert.equal(stageGradeLabel(pages.find(p=>p.printId==='P65')),'다섯 문항 채점하기');
 assert.deepEqual(lessonRemedyLog([{item:'g1'},{item:'h3'}],7),[{item:'h3'}]);
});

test('lesson-7 labs are registered, scenes open them, and derived answers follow the figure',()=>{
 for(const kind of ['motion-time','position-map','relative-motion','speed-graph','speed-units'])assert(activityNames[kind],kind);
 const act=(id,i)=>stageActivity(pages.find(item=>item.printId===id),i);
 assert.deepEqual(['P57','P58','P59','P60','P61','P62','P63','P64'].map(id=>act(id)),['motion-time','motion-time','position-map','position-map','position-map','relative-motion','speed-graph','speed-units']);
 assert.equal(act('P65',1),'motion-time');assert.equal(act('P65',3),'speed-graph');assert.equal(act('P66',0),'speed-units');assert.equal(act('P65',0),null);
 // 53쪽 그림: 집 0 · 병원 4 · 카페 5 · 회사 13 (km, 서쪽 → 동쪽)
 assert.deepEqual(positionRows.map(([t,r])=>positionAnswer('map',t,r)),[{dir:'동쪽',km:4},{dir:'서쪽',km:13},{dir:'동쪽',km:9},{dir:'동쪽',km:5},{dir:'서쪽',km:9}]);
 assert.deepEqual(positionAnswer('example','대치엠에스지','우루사 동굴'),{dir:'서쪽',km:3});
 const p60=pages.find(p=>p.printId==='P60'),i60=pages.indexOf(p60);
 assert.match(renderLessonStage(p60,i60,'teacher',{answerOpen:true}),/동쪽 4km · ② 집은 회사에서 서쪽 13km/);
 assert(checkUnitReading(0,'백 미터 퍼 세크'));assert(checkUnitReading(1,'천 킬로미터 퍼 아워'));assert(checkUnitReading(2,'오 센티미터 퍼 세크'));
 assert(!checkUnitReading(0,'백 킬로미터 퍼 세크'));assert(!checkUnitReading(2,'오 미터 퍼 세크'));
});
