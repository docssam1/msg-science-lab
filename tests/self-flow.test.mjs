import test from 'node:test';
import assert from 'node:assert/strict';
import {createSelfFlow} from '../sample-v2/self-flow.js';

test('self study preserves the first prediction and record across retries',()=>{
 const flow=createSelfFlow();
 assert.equal(flow.record('before observing'),false);
 assert.equal(flow.predict('처음 예상'),true);
 assert.equal(flow.manipulated(),true);
 assert.equal(flow.record('처음 관찰'),true);
 const restored=createSelfFlow(structuredClone(flow.state));
 assert.equal(restored.recheck(),true);
 assert.equal(restored.predict('다른 예상'),true);
 assert.equal(restored.manipulated(),true);
 assert.equal(restored.record('다시 관찰'),true);
 assert.equal(restored.state.firstPrediction,'처음 예상');
 assert.equal(restored.state.firstRecord.text,'처음 관찰');
 assert.equal(restored.state.records.length,2);
});
