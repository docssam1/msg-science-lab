import test from 'node:test';
import assert from 'node:assert/strict';
import {studentPrintPages,studentCover} from '../sample-v2/lesson-print-pages.js';
import {q1,q2} from '../sample-v2/content.js';
import {qrForPage} from '../sample-v2/qr-map.js';

test('student print plan has P0 through P23 and preserves all original questions once',()=>{
 assert.equal(studentPrintPages.length,23);
 assert.deepEqual(studentPrintPages.map(p=>p.printId),Array.from({length:23},(_,i)=>`P${i+1}`));
 assert.match(studentCover(),/data-print-id="P0"/);
 const assessments=studentPrintPages.filter(p=>/^P(11|12|20|21|22|23)$/.test(p.printId));
 for(const q of [...q1,...q2])assert.equal(assessments.filter(p=>p.body.includes(`data-q="${q.id}"`)).length,1,q.id);
});

test('student sequence and P5 prompt are fixed',()=>{
 const ids=studentPrintPages.slice(0,5).map(p=>p.printId);
 assert.deepEqual(ids,['P1','P2','P3','P4','P5']);
 assert.match(studentPrintPages[4].body,/물체를 걸기 전 기준을 확인했나요/);
 assert.doesNotMatch(studentPrintPages[4].body,/실험 방법에 오류/);
 assert.deepEqual(q2[11].answer,[[10,4],[20,8],[30,12]]);
});

test('repeated source scenes keep their own printed QR destination',()=>{
 const p18=studentPrintPages[17],p19=studentPrintPages[18];
 assert.equal(p18.id,p19.id);
 assert.equal(p18.action,'factors');
 assert.equal(p19.action,'tools');
 assert.match(qrForPage(p18),/page=18&activity=factors$/);
 assert.match(qrForPage(p19),/page=19&activity=tools$/);
 assert.notEqual(qrForPage(p18),qrForPage(p19));
});
