import test from 'node:test';
import assert from 'node:assert/strict';
import { springModel, mouthFor, rms, mouthForLevel, timelineAt } from '../src/core.js';

test('spring force and extension are consistent in the permitted range', () => {
  for (let n = 0; n <= 4; n++) {
    const result = springModel(n);
    assert.equal(result.length - 6, result.extension);
    assert.equal(result.force * 2, result.extension);
  }
});
test('spring controls clamp invalid and out of range counts', () => {
  assert.equal(springModel(-4).count, 0); assert.equal(springModel(9).count, 4); assert.equal(springModel(NaN).count, 0);
});
test('Korean demo mouth shapes and punctuation', () => {
  assert.equal(mouthFor('아'), 'open'); assert.equal(mouthFor('오'), 'round'); assert.equal(mouthFor('이'), 'half'); assert.equal(mouthFor(' '), 'closed'); assert.equal(mouthFor(''), 'closed');
});
test('silent samples always close mouth', () => {
  assert.equal(rms(new Float32Array(512)), 0); assert.equal(mouthForLevel(0, 1), 'closed'); assert.equal(rms([]), 0);
});
test('non-silent samples produce active mouth', () => {
  assert.equal(rms([1, -1, 1, -1]), 1); assert.notEqual(mouthForLevel(.2, 1), 'closed');
});
test('demo timeline terminates and includes pauses', () => {
  assert.equal(timelineAt(0).mood, 'welcome'); assert.equal(timelineAt(3.7).mouth, 'closed'); assert.equal(timelineAt(4).mood, 'question'); assert.equal(timelineAt(20), null);
});
