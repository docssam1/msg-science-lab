import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parts,stages,daily,gradeDaily,scaleReading,projection} from '../src/ch01-model.js';
test('chapter source coverage',()=>{assert.equal(stages.length,8);assert.equal(parts.length,6);assert.equal(daily.length,6);assert.deepEqual(stages.map(x=>x.page),['10','10','10','10–11','11','12','13–14','15']);});
test('zero offset is independent of true force',()=>{const m=scaleReading(20,4,0);assert.equal(m.force,20);assert.equal(m.trueReading,24);assert.equal(scaleReading(0,0,0).trueReading,0);});
test('all supported force and eye states agree with ray geometry',()=>{for(let force=0;force<=30;force+=2)for(const eye of [-1,0,1]){const p=projection(eye,force);assert.equal((p.apparentY-140)/7,scaleReading(force,0,eye).apparent);assert.equal(p.pointerY,140+force*7);}});
test('overload and invalid values are never displayed as valid readings',()=>{for(const force of [31,40,-1,NaN,Infinity])assert.equal(scaleReading(force).overload,true);});
test('original daily answers independently checked',()=>{const values={d1:['영점 조절 나사','용수철','표시자','고리'],d2:'2',d3:'표시자',d4:'ㄴ',d5:'0',d6:'0'};assert(gradeDaily(values).every(x=>x.correct));values.d1[2]='눈금';values.d4='ㄱ';assert.equal(gradeDaily(values).filter(x=>x.correct).length,4);});
test('blank responses cannot pass',()=>assert(gradeDaily({}).every(x=>!x.correct)));
