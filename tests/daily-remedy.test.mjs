import test from 'node:test';
import assert from 'node:assert/strict';
import { q1, q2 } from '../sample-v2/content.js';
import { itemMap, bank, probeBank, misconceptions, diagnose, prescribe, pendingProbes, firstAttemptRecord, bankRecord, probeRecord, UNCONFIRMED, ANSWER_KEY } from '../sample-v2/remedy-bank.js';
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
  assert.deepEqual(prescribe(diagnose(two), two).map((b) => b.id), ['s01', 's02']);
  const fixed = [...two, bankRecord('s01', 1), bankRecord('s02', 2)];
  assert.equal(diagnose(fixed).M01.status, 'resolved');
});

test('fixed remedy variants are never selected again after a first attempt', () => {
  assert.throws(() => prescribe(diagnose([])), /첫 시도 기록/);
  const original = [
    { item: 'a1', ok: false, m: 'M01', src: 'test' },
    { item: 'a3', ok: false, m: 'M01', src: 'test' },
  ];
  assert.deepEqual(prescribe(diagnose(original), original).map((b) => b.id), ['s01', 's02']);
  const missed = [...original, bankRecord('s01', 0)];
  const formerSelection = bank.filter((b) => b.m === 'M01' && !diagnose(missed).M01.bankOk.has(b.id));
  assert.equal(formerSelection.some((b) => b.id === 's01'), true, 'negative control: old rule repeats a miss');
  assert.deepEqual(prescribe(diagnose(missed), missed).map((b) => b.id), ['s02']);
  const exhausted = [...missed, bankRecord('s02', 0)];
  assert.deepEqual(prescribe(diagnose(exhausted), exhausted), []);
  assert.equal(diagnose(exhausted).M01.status, 'confirmed', 'failure is not mastery');
  const passed = [...original, bankRecord('s01', 1), bankRecord('s02', 2)];
  assert.equal(diagnose(passed).M01.status, 'resolved');
  assert.deepEqual(prescribe(diagnose(passed), passed), []);
  const mixed = [
    ...original,
    { item: 'a2', ok: false, m: 'M02', src: 'test' },
    probeRecord('d02', 0),
    bankRecord('s01', 0),
    bankRecord('s03', 0),
  ];
  assert.deepEqual(prescribe(diagnose(mixed), mixed).map((b) => b.id), ['s02', 's04']);
});

test('a separate probe can confirm a one-source-item suspicion without reusing a variant', () => {
  const zero = [{ item: 'a2', ok: false, m: 'M02', src: 'test' }];
  assert.equal(diagnose(zero).M02.status, 'suspected');
  assert.deepEqual(pendingProbes(diagnose(zero), zero).map((p) => p.id), ['d02']);
  const correct = [...zero, probeRecord('d02', 1)];
  assert.equal(diagnose(correct).M02.status, 'suspected', 'one correct probe is not mastery');
  assert.deepEqual(pendingProbes(diagnose(correct), correct), []);
  const wrong = [...zero, probeRecord('d02', 0)];
  assert.equal(diagnose(wrong).M02.status, 'confirmed');
  assert.deepEqual(pendingProbes(diagnose(wrong), wrong), []);
  assert.deepEqual(prescribe(diagnose(wrong), wrong).map((p) => p.id), ['s03', 's04']);
  const data = [{ item: 'b12', ok: false, m: 'M09', src: 'test' }];
  assert.deepEqual(pendingProbes(diagnose(data), data).map((p) => p.id), ['d09']);
  assert.equal(diagnose([...data, probeRecord('d09', 0)]).M09.status, 'confirmed');
  assert.deepEqual(pendingProbes(diagnose([]), []), [], 'M04 must not appear without evidence');
});

test('probe bank has unique answerable choices and never maps a correct answer to an error', () => {
  assert.throws(() => pendingProbes(diagnose([])), /첫 시도 기록/);
  assert.equal(new Set(probeBank.map((p) => p.id)).size, probeBank.length);
  assert.equal(new Set([...bank, ...probeBank].map((p) => p.id)).size, bank.length + probeBank.length);
  for (const p of probeBank) {
    assert.ok(Number.isInteger(p.answer) && p.answer >= 0 && p.answer < p.options.length, p.id);
    assert.equal(new Set(p.options).size, p.options.length, p.id);
    assert.equal(probeRecord(p.id, p.answer).m, null, p.id);
    assert.equal(probeRecord(p.id, (p.answer + 1) % p.options.length).m, p.m, p.id);
  }
  assert.equal(probeRecord('d02', -1), null);
  assert.equal(probeRecord('d02', ''), null);
  assert.equal(probeRecord('d02', 'not-a-choice'), null);
  assert.equal(bankRecord('s03', ''), null);
  assert.equal(bankRecord('s03', 99), null);
  for (const code of Object.keys(misconceptions)) {
    assert.ok(bank.filter((item) => item.m === code).length >= 2, `${code} lacks two distinct remedies`);
  }
  assert.equal(new Set([...bank, ...probeBank].map((item) => item.q)).size, bank.length + probeBank.length);
  for (const item of bank) assert.ok(item.why && new Set(item.options).size === item.options.length, item.id);
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
