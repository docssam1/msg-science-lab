import test from 'node:test';
import assert from 'node:assert/strict';
import {advancedItems,availableAdvanced,advancedRecord} from '../sample-v2/advanced-bank.js';

test('the authored extension is distinct, source-located and has three response contracts',()=>{
  assert.deepEqual(advancedItems.map(item=>item.type),['number','choice','explanation']);
  assert.equal(new Set(advancedItems.map(item=>item.variantKey)).size,3);
  assert.deepEqual(advancedItems.map(item=>item.lesson),[2,2,1]);
  for(const item of advancedItems){assert.ok([10,17,19].includes(item.sourcePage));assert.ok(item.explanation);}
  assert.equal(3*3,advancedItems[0].answer,'independent B spring calculation in cm');
  assert.equal(advancedItems[1].answer,1,'only material changes while control conditions are fixed');
});
test('first attempt is immutable in the selector, including a failed or duplicated variant',()=>{
  const wrong=advancedRecord('ad01','6');assert.equal(wrong.status,'wrong');
  assert.deepEqual(availableAdvanced([wrong]).map(item=>item.id),['ad02','ad03']);
  assert.deepEqual(availableAdvanced([],1).map(item=>item.id),['ad03']);
  assert.deepEqual(availableAdvanced([],2).map(item=>item.id),['ad01','ad02']);
  assert.equal(availableAdvanced([{id:'old-id',variantKey:wrong.variantKey}]).some(item=>item.id==='ad01'),false);
  assert.deepEqual(availableAdvanced(advancedItems.map(item=>advancedRecord(item.id,item.type==='explanation'?'나의 설명':item.type==='choice'?'1':'9'))),[]);
  assert.throws(()=>availableAdvanced(null),TypeError);
});
test('invalid responses cannot create a first-attempt record; open answer is teacher/self review',()=>{
  assert.equal(advancedRecord('ad01',''),null);
  assert.equal(advancedRecord('ad01','9cm'),null);
  assert.equal(advancedRecord('ad02','5'),null);
  assert.equal(advancedRecord('ad03','  '),null);
  assert.equal(advancedRecord('ad01','9').status,'correct');
  assert.equal(advancedRecord('ad03','크기만으로는 무게를 알 수 없어요').status,'review');
});
