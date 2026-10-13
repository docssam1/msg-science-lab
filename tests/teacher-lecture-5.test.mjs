import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonFiveLecture,teacherLecture} from '../sample-v2/teacher-lecture.js';
import {studentPrintPages,studentCoverPage} from '../sample-v2/lesson-print-pages.js';
import {hasLessonStage,stageActivity,renderLessonStage,stageGradeLabel} from '../sample-v2/lesson-stage.js';
import {pages as contentPages,q5,assessmentGroupsByPrint,questionHTML} from '../sample-v2/content.js';
import {UNCONFIRMED,lessonRemedyLog} from '../sample-v2/remedy-bank.js';
import {gradeItem,formatKey,itemLabel} from '../sample-v2/daily-grading.js';
import {activityNames} from '../sample-v2/activities.js';
import {sourceLessons} from '../sample-v2/source-lessons.js';

const pages=[studentCoverPage,...studentPrintPages];
const lessonFive=Array.from({length:8},(_,index)=>`P${index+41}`);
const MEMO=/검수 메모|정답이 인쇄돼|도출한 답|근거 문장이 없|고치지 않았습니다/;

test('fifth lesson has a source-tagged run of show for every scene P41–P48',()=>{
 assert.deepEqual(Object.keys(lessonFiveLecture),lessonFive);
 assert.deepEqual(Object.keys(teacherLecture).slice(41,49),lessonFive);
 for(const id of lessonFive){
  const lecture=lessonFiveLecture[id];
  const page=pages.find(item=>item.printId===id);
  assert(page&&page.lesson===5&&hasLessonStage(page),`${id} must be a real lesson-5 scene`);
  assert(lecture.origin&&lecture.phase&&lecture.check,`${id} needs provenance and a teaching check`);
  assert(lecture.steps.length>=3,`${id} needs a usable teaching sequence`);
  assert(lecture.origin.includes(`${page.source[0]}쪽`),`${id} origin must name printed book page ${page.source[0]}`);
 }
 assert.deepEqual(pages.filter(p=>p.lesson===5).map(p=>p.source[0]),[36,36,37,37,38,38,39,40]);
 for(const id of lessonFive.slice(0,6))assert(sourceLessons[id]?.teacher,`${id} needs a source cue`);
});

test('review memos stay in the instructor window and never reach a projected or student scene',()=>{
 for(const id of lessonFive){
  const index=pages.findIndex(item=>item.printId===id),page=pages[index];
  const count=assessmentGroupsByPrint[id]?.length||1;
  for(let questionIndex=0;questionIndex<count;questionIndex++)for(const mode of ['teacher','student']){
   const html=renderLessonStage(page,index,mode,{questionIndex,answerOpen:true,explanationOpen:true}).replace(/<[^>]+>/g,' ');
   assert.doesNotMatch(html,MEMO,`${id}#${questionIndex} ${mode} shows memo text`);
  }
 }
 for(const id of ['P41','P43','P45','P46','P47','P48'])assert.match(lessonFiveLecture[id].check,/\[검수 메모 · 투사 화면에는 표시하지 않음\]/);
});

test('textbook sentences are carried as printed',()=>{
 const byId=Object.fromEntries(contentPages.map(page=>[page.id,page]));
 const text=id=>byId[id].body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 assert.match(text('l5-kitchen'),/앉은뱅이저울은 2009년도 교육과정에서 가정용저울로 표기되어 사용되다가 2015 교육과정에서 앉은뱅이저울로 표기 변경 되었다\./);
 assert.match(text('l5-kitchen'),/관찰①_접시를 누르면 바늘의 위치와 저울 안의 용수철 길이가 변한다\./);
 assert.match(text('l5-kitchen'),/관찰②_영점 조절 나사를 돌리면 저울의 바늘이 움직인다\./);
 assert.match(text('l5-kitchen'),/용수철이 늘어나고 줄어듦에 따라 용수철과 연결된 저울의 바늘이 움직인다\./);
 assert.match(text('l5-kitchen-use'),/① 편평한 곳에 위치시킨다\. ② 바늘이 0을 가리키는지 확인한다\. ③ 물체를 올리고, 눈금을 읽어 무게 측정한다\./);
 assert.match(text('l5-toppan'),/팔이 크게 움직이는 것을 막아 주는 역할을 한다\./);
 assert.match(text('l5-toppan-use'),/분동은 집게를 사용하여 무거운 것부터 가벼운 것 순으로 올려놓는다\./);
 assert.match(text('l5-toppan-use'),/분동을 내려놓을 때는 거꾸로 가벼운 것부터 무거운 것 순으로 내려놓는다\./);
 assert.match(text('l5-brass'),/분동은 항상 양팔저울에서 관찰자기준으로 오른쪽!!/);   // 교재 표기를 고치지 않는다
 assert.match(text('l5-speed'),/윗접시 저울이 수평이 되면 분동의 무게 합이 물체의 무게라고 합니다\./);
 const p41=studentPrintPages.find(p=>p.printId==='P41').body.replace(/<[^>]+>/g,' ');
 assert.match(p41,/양쪽의 표현법을 모두 알아 둘 필요가 있다\./);
});

test('Daily Test 01–12: only book-grounded choices are scored, essays are teacher-checked, 5·7·11 stay locked',()=>{
 assert.equal(q5.length,12);
 assert.deepEqual(assessmentGroupsByPrint.P47.map(q=>q.id),['f1','f2','f3','f4','f5','f6']);
 assert.deepEqual(assessmentGroupsByPrint.P48.map(q=>q.id),['f7','f8','f9','f10','f11','f12']);
 const key=Object.fromEntries(q5.filter(q=>q.kind==='choice').map(q=>[q.id,q.options[q.answer]]));
 assert.deepEqual(key,{f1:'분동',f2:'㉡, ㉢',f3:'양쪽 팔의 길이가 같기 때문에',f4:'팔받침',f6:'추가 1개 필요하다.',f8:'추',f9:'가벼운',f10:'무거운'});
 for(const id of ['f5','f7','f11'])assert(UNCONFIRMED.has(id),`${id} must stay locked`);
 assert(!UNCONFIRMED.has('f12'));
 const byId=Object.fromEntries(q5.map(q=>[q.id,q]));
 for(const id of ['f5','f7','f11'])assert.deepEqual(gradeItem(byId[id],'아무 답'),{status:'review',reason:'locked'});
 assert.deepEqual(gradeItem(byId.f12,'팔의 길이가 같아서'),{status:'review',reason:'essay'});
 assert.match(formatKey(byId.f12),/39쪽 01번/);
 assert.equal(gradeItem(byId.f9,1).status,'correct');
 assert.equal(gradeItem(byId.f10,1).status,'wrong');
 assert.equal(itemLabel('f12'),'5차시 12번');
 for(const q of q5.filter(q=>q.kind==='essay'))assert.match(questionHTML(q),new RegExp(`<textarea name="${q.id}" data-answer-field`));
 assert.match(questionHTML(byId.f1,{print:true}),/inline-test-option/);
 assert.equal(stageGradeLabel(pages.find(p=>p.printId==='P47')),'여섯 문항 채점하기');
});

test('lesson-5 labs are registered and the scenes open them',()=>{
 for(const kind of ['kitchen-scale','top-pan','top-pan-weigh'])assert(activityNames[kind],`${kind} needs a name so the lab can open`);
 const act=id=>stageActivity(pages.find(item=>item.printId===id));
 assert.equal(act('P41'),'kitchen-scale');assert.equal(act('P42'),'kitchen-scale');
 assert.equal(act('P43'),'top-pan');assert.equal(act('P44'),'top-pan-weigh');
 const p47=pages.find(p=>p.printId==='P47');
 assert.equal(stageActivity(p47,1),'lever');
 assert.equal(stageActivity(p47,3),'top-pan');
});

test('lesson-5 diagnosis log only keeps lesson-5 items',()=>{
 const log=[{item:'a1'},{item:'e1'},{item:'f3'}];
 assert.deepEqual(lessonRemedyLog(log,5),[{item:'f3'}]);
 assert.deepEqual(lessonRemedyLog(log,4),[{item:'e1'}]);
});
