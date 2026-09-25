import test from 'node:test';
import assert from 'node:assert/strict';
import {studentPrintPages,studentCover} from '../sample-v2/lesson-print-pages.js';
import {q1,q2,history1,history2,history3,coilHistory,future} from '../sample-v2/content.js';
import {qrForPage} from '../sample-v2/qr-map.js';

test('source-layout print plan has P0 through P20 and preserves all original questions once',()=>{
 assert.equal(studentPrintPages.length,20);
 assert.deepEqual(studentPrintPages.map(p=>p.printId),Array.from({length:20},(_,i)=>`P${i+1}`));
 assert.match(studentCover(),/data-print-id="P0"/);
 const assessments=studentPrintPages.filter(p=>/^P(11|19|20)$/.test(p.printId));
 for(const q of [...q1,...q2])assert.equal(assessments.filter(p=>p.body.includes(`data-q="${q.id}"`)).length,1,q.id);
 assert.deepEqual(assessments.map(p=>[...p.body.matchAll(/data-q="([ab]\d+)"/g)].map(m=>m[1])),[
  q1.map(q=>q.id),q2.slice(0,6).map(q=>q.id),q2.slice(6,12).map(q=>q.id)
 ]);
 for(const page of assessments)assert.match(page.body,/source-test-columns/);
});

test('student sequence and P5 prompt are fixed',()=>{
 const ids=studentPrintPages.slice(0,5).map(p=>p.printId);
 assert.deepEqual(ids,['P1','P2','P3','P4','P5']);
 assert.match(studentPrintPages[4].body,/물체를 걸기 전 기준을 확인했나요/);
 assert.doesNotMatch(studentPrintPages[4].body,/실험 방법에 오류/);
 assert.deepEqual(q2[11].answer,[[10,4],[20,8],[30,12]]);
});

test('repeated source scenes keep their own printed QR destination',()=>{
 const p17=studentPrintPages[16],p18=studentPrintPages[17];
 assert.equal(p17.id,p18.id);
 assert.equal(p17.action,'factors');
 assert.equal(p18.action,'tools');
 assert.match(qrForPage(p17),/page=17&activity=factors$/);
 assert.match(qrForPage(p18),/page=18&activity=tools$/);
 assert.notEqual(qrForPage(p17),qrForPage(p18));
});

test('reading spreads retain every source sentence and open the intended existing footage',()=>{
 const stories=[
  [studentPrintPages[7],[history1,history2,history3],'watch'],
  [studentPrintPages[8],[coilHistory],'watch'],
  [studentPrintPages[9],[future],'spring-film']
 ];
 for(const [page,passages,video] of stories){
  const visible=page.body.replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
  for(const passage of passages){
   for(const sentence of passage.match(/[^.!?]+[.!?]?/g)){
    if(sentence.trim())assert.ok(visible.includes(sentence.trim()),`${page.printId}: ${sentence.slice(0,32)}`);
   }
  }
  assert.match(page.body,new RegExp(`data-action="${video}"`));
  assert.match(qrForPage(page),new RegExp(`activity=${video}$`));
  assert.doesNotMatch(visible,/본책 13쪽|본책 14쪽/);
 }
});
