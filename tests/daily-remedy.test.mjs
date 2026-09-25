import test from 'node:test';
import assert from 'node:assert/strict';
import { q1, q2 } from '../sample-v2/content.js';
import { itemMap, bank, diagnose, prescribe, firstAttemptRecord, bankRecord, UNCONFIRMED, ANSWER_KEY } from '../sample-v2/remedy-bank.js';
import { gradeItem, summarize, ANSWER_KEY_VERSION } from '../sample-v2/daily-grading.js';

const all = [...q1, ...q2];
const correctValue = (q) => q.kind === 'choice' ? String(q.answer) : q.answer;

test('a correct answer is never mapped to a misconception', () => {
  for (const q of all) {
    if (UNCONFIRMED.has(q.id)) continue;
    assert.equal(gradeItem(q, correctValue(q)).status, 'correct', q.id);
    assert.equal(firstAttemptRecord(q.id, correctValue(q), true).m, null, q.id);
    if (q.kind === 'choice') assert.equal(itemMap[q.id]?.choice?.[q.answer], undefined, `${q.id} maps its correct option`);
  }
  for (const b of bank) {
    assert.equal(b.answer in b.wrong, false, `${b.id} maps its correct option`);
    assert.equal(bankRecord(b.id, b.answer).m, null, b.id);
  }
});

test('unconfirmed items 9-11 are never scored or diagnosed', () => {
  for (const id of ['b9', 'b10', 'b11']) {
    const q = all.find((x) => x.id === id);
    assert.equal(gradeItem(q, correctValue(q)).status, 'review');
    assert.equal(firstAttemptRecord(id, '1', false), null);
  }
  const dx = diagnose([{ item: 'b9', ok: false, m: 'M07', src: 'test' }, { item: 'b10', ok: false, m: 'M07', src: 'test' }]);
  assert.equal(dx.M07.status, 'none');
  const s = summarize(q2.map((q) => ({ q, ...gradeItem(q, correctValue(q)) })));
  assert.deepEqual([s.correct, s.confirmed, s.review], [9, 9, 3]);
  assert.equal(ANSWER_KEY_VERSION, ANSWER_KEY);
});

test('a misconception is confirmed only by two distinct items and resolved by two bank items', () => {
  const same = [{ item: 'a1', ok: false, m: 'M01', src: 'test' }, { item: 'a1', ok: false, m: 'M01', src: 'test' }];
  assert.equal(diagnose(same).M01.status, 'suspected');
  const two = [...same, { item: 'a6', ok: false, m: 'M01', src: 'test' }];
  assert.equal(diagnose(two).M01.status, 'confirmed');
  assert.deepEqual(prescribe(diagnose(two)).map((b) => b.id), ['s01', 's02']);
  const fixed = [...two, bankRecord('s01', 1), bankRecord('s02', 2)];
  assert.equal(diagnose(fixed).M01.status, 'resolved');
});

test('written answers: spacing is ignored, another listed term is wrong, anything else waits for review', () => {
  const [a1, , a3, a4] = q1;
  assert.equal(gradeItem(a3, '표시 자').status, 'correct');
  assert.equal(gradeItem(a3, '고리').status, 'wrong');
  assert.equal(gradeItem(a3, '바늘').status, 'review');
  assert.equal(gradeItem(a4, '(ㄴ)').status, 'correct');
  assert.equal(gradeItem(a4, 'ㄷ번').status, 'review');
  assert.equal(gradeItem(a1, ['영점 조절 나사', '용수철', '표시자', '고리']).status, 'correct');
  assert.equal(gradeItem(q2[11], []).status, 'pending');
  assert.equal(firstAttemptRecord('b12', [[30, 9], [10, 3], [20, 6]], false).m, 'M09');
});
