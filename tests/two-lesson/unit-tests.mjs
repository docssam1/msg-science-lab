import assert from 'node:assert/strict';
import {pages,questions} from '../../sample-v2/content.js';
import {SpringMotion,apparentReading,gradePoints,dataLesson,dataAssessment,gradeQuestion} from '../../sample-v2/physics.js';
import {bank,fingerprint,takeUnused,concepts} from '../../sample-v2/review.js';
assert.equal(pages.length,18);assert.equal(questions.length,18);
assert.deepEqual([...new Set(pages.flatMap(p=>p.source))].sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+10));
for(const q of questions){assert.ok(gradeQuestion(q,q.answer));}
assert.ok(gradePoints(dataLesson,dataLesson));assert.ok(gradePoints(dataAssessment,dataAssessment));assert.ok(!gradePoints(dataLesson,dataAssessment));
assert.equal(new Set(bank.map(fingerprint)).size,bank.length);
let n=0;for(const c of Object.keys(concepts)){const used=new Set;let q;while((q=takeUnused(c,used))){let f=fingerprint(q);assert.ok(!used.has(f));used.add(f);n++;assert.equal(f,fingerprint({...q,id:'other',o:[...q.o].reverse(),a:q.o.length-1-q.a}));}assert.equal(used.size,4);assert.equal(takeUnused(c,used),null);}assert.equal(n,32);
for(const force of [0,6,12,20,30]){const m=new SpringMotion; m.set(force);for(let i=0;i<1800;i++)m.update(1/120);assert.ok(m.settled);assert.equal(m.value,force);m.set(0);for(let i=0;i<1800;i++)m.update(1/120);assert.equal(m.value,0);}
const py=1.2-20*.07;
const above=apparentReading({force:20,cameraY:py+1.35,cameraZ:3.2}).value;
const same=apparentReading({force:20,cameraY:py,cameraZ:3.2}).value;
const below=apparentReading({force:20,cameraY:py-1.35,cameraZ:3.2}).value;
assert.ok(above>same&&same>below);assert.ok(Math.abs(same-20)<1e-8);
console.log(JSON.stringify({pages:pages.length,originalQuestions:questions.length,sourcePages:12,finiteVariants:n,physics:'passed',parallax:{above,same,below},graphIsolation:'passed'}));
