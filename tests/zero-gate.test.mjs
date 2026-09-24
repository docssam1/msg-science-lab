import test from 'node:test';
import assert from 'node:assert/strict';
import {createZeroGate,methodErrorText} from '../sample-v2/zero-gate.js';

test('P5 rejects attachment immediately before force and preserves the first attempt',()=>{
 const gate=createZeroGate();
 const first=gate.attach('apple',0);
 assert.equal(first.accepted,false);
 assert.equal(first.event.forceApplied,false);
 assert.equal(first.message,methodErrorText);
 assert.equal(first.message.includes('영점'),false);
 const snapshot={...gate.state.firstAttempt};
 assert.equal(gate.confirm(0).accepted,true);
 const next=gate.attach('apple',0);
 assert.equal(next.accepted,true);
 assert.equal(next.event.previousAttemptId,snapshot.attemptId);
 assert.deepEqual(gate.state.firstAttempt,snapshot);
 assert.deepEqual(gate.state.events.map(e=>e.type),['attach-rejected','confirm-empty','attach-accepted']);
});

test('P5 requires reconfirmation after adjustment and removal',()=>{
 const gate=createZeroGate();
 assert.equal(gate.confirm(.2).accepted,false);
 gate.adjust(0);
 assert.equal(gate.attach('apple',0).accepted,false);
 gate.confirm(0);
 assert.equal(gate.attach('apple',0).accepted,true);
 gate.remove();
 assert.equal(gate.attach('shoe',0).accepted,false);
});
