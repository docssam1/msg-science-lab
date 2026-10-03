import test from 'node:test';
import assert from 'node:assert/strict';
import { unitAssessmentIndex, unitAssessmentSource } from '../sample-v2/unit-assessment-index.js';

test('the original PART I assessment has 20 separate, source-located locked entries', () => {
  assert.equal(unitAssessmentSource.sourceKind, 'original');
  assert.equal(unitAssessmentSource.release, 'locked');
  assert.equal(unitAssessmentIndex.length, 20);
  assert.equal(new Set(unitAssessmentIndex.map((item) => item.id)).size, 20);
  assert.deepEqual(unitAssessmentIndex.map((item) => item.number), Array.from({ length: 20 }, (_, i) => i + 1));
  assert.deepEqual(unitAssessmentIndex.map((item) => item.printedPage), [
    ...Array(6).fill(44), ...Array(6).fill(45), ...Array(5).fill(46), ...Array(3).fill(47),
  ]);
  for (const item of unitAssessmentIndex) {
    assert.equal(item.pdfPage, item.printedPage + 1, item.id);
    assert.equal(item.answerPdfPage, item.answerPrintedPage + 1, item.id);
    assert.equal(item.onlineGrading, false, item.id);
    assert.equal(Object.hasOwn(item, 'answer'), false, item.id);
    assert.equal(Object.hasOwn(item, 'question'), false, item.id);
  }
  assert.equal(unitAssessmentIndex[16].answerState, 'conflict-review');
  assert.equal(unitAssessmentIndex.filter((item) => item.answerState === 'conflict-review').length, 1);
});
