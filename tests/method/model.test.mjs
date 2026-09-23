import assert from 'node:assert/strict';
import {OBJECTS,inspectAttempt,comparePredictions,METHOD_ERROR} from '../../sample-v2/inquiry-model.js';
const good={force:4,zero:0,reading:4,expectedEye:4,settled:true};
assert.equal(inspectAttempt('ball',good,'4').valid,true);
for(const change of [{zero:2,reading:6,expectedEye:6},{settled:false},{expectedEye:5.2},{force:12}]){
 const result=inspectAttempt('ball',{...good,...change},'4');assert.equal(result.category,'method');assert.equal(result.message,METHOD_ERROR);assert.ok(!/영점|0|zero|기준/.test(result.message));
}
assert.equal(inspectAttempt('ball',good,'5').category,'reading');
assert.equal(inspectAttempt('ball',good,'').category,'entry');
assert.equal(inspectAttempt(null,good,'4').category,'method');
const records=Object.fromEntries(OBJECTS.map(o=>[o.id,{valid:true,value:o.force}]));
const c=comparePredictions({pair:'ball',order:['pouch-d','pouch-c','pouch-e']},records);
assert.deepEqual(c.order,['pouch-c','pouch-e','pouch-d']);assert.equal(c.pairMatches,false);assert.equal(c.orderMatches,false);
// Common calibration bias can preserve ordering; it must still be a procedure error.
for(const o of OBJECTS){const biased={force:o.force,zero:2,reading:o.force+2,expectedEye:o.force+2,settled:true};assert.equal(inspectAttempt(o.id,biased,o.force+2).category,'method');}
assert.equal(comparePredictions({},{}),null);
console.log('method model assertions passed');
