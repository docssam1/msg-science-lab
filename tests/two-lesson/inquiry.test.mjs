import assert from 'node:assert/strict';
import {pages,narration} from '../../sample-v2/content.js';
import {qrLinks} from '../../sample-v2/qr-links.js';
import {objects,forceFor,initialInquiry,isPermutation,makeRecord,inspectRound,measuredOrder,auditRecord,genericMethodFeedback} from '../../sample-v2/inquiry-model.js';
let s=initialInquiry();assert.equal(pages.length,20);assert.equal(pages[0].id,'l1-intro');assert.equal(pages[1].id,'l1-inquiry-record');assert.equal(objects.length,5);
assert.ok(isPermutation(['B','A','C']));assert.ok(!isPermutation(['A','A','B']));
assert.ok(!/영점|0에|0을/.test(narration['l1-intro'].text+narration['l1-inquiry-record'].text+genericMethodFeedback));
for(const p of pages){const u=new URL(qrLinks[p.id].url);assert.equal(u.searchParams.get('p'),p.id);assert.equal(u.searchParams.get('lab'),p.action);}
const observation=(f,z=0)=>({zero:z,settled:true,eye:'front',viewAligned:true,viewMoving:false,apparentNow:f+z,force:f});
for(const o of objects)s.records.push(makeRecord(o.id,forceFor(o.id)+2,observation(forceFor(o.id),2),1));
assert.ok(inspectRound(s).complete);assert.ok(!inspectRound(s).valid);assert.equal(measuredOrder(s),null);
// The common offset changes values, NOT the ordering. Don't manufacture a ranking reversal.
const order=(records)=>records.filter(r=>['A','B','C'].includes(r.id)).sort((a,b)=>a.entered-b.entered).map(r=>r.id);
assert.deepEqual(order(s.records),['B','A','C']);
s.round=2;
for(const o of objects)s.records.push(makeRecord(o.id,forceFor(o.id),observation(forceFor(o.id)),2));
assert.ok(inspectRound(s).valid);assert.deepEqual(measuredOrder(s),['B','A','C']);assert.equal(s.records.length,10);
assert.ok(auditRecord({...s.records.at(-1),settled:false}).includes('moving-indicator'));
assert.ok(auditRecord({...s.records.at(-1),viewAligned:false}).includes('viewpoint'));
assert.ok(auditRecord({...s.records.at(-1),viewMoving:true}).includes('viewpoint'));
assert.ok(auditRecord({...s.records.at(-1),entered:20}).includes('reading-or-recording'));
assert.throws(()=>makeRecord('A',NaN,observation(12),1));
assert.ok(!inspectRound(initialInquiry()).valid);
console.log('Inquiry: 5 objects; prediction before measurement; biased values retained; no cause disclosure; corrected procedure; original 18 questions untouched; 20 stable QR routes.');
