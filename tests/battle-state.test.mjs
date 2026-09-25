import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTeam, moveInOrder, canSubmit, gradeVirtualOrder} from '../sample-v2/battle-state.js';
import {inquiryObjects} from '../sample-v2/everyday-objects.js';
import {battleObjects, battleRounds, nextBattleRound} from '../sample-v2/battle-rounds.js';

test('two teams can reorder and record without changing each other', () => {
  const ids = inquiryObjects.map(o => o.id);
  const a = freshTeam(ids);
  const b = freshTeam(ids);
  a.order = moveInOrder(a.order, ids[2], -1);
  a.records[ids[2]] = 1.8;
  assert.notDeepEqual(a.order, b.order);
  assert.deepEqual(b.order, ids);
  assert.deepEqual(b.records, {});
  assert.equal(canSubmit(a, ids), true);
});

test('virtual result uses configured values and never infers real object weights', () => {
  const expected = [...inquiryObjects].sort((a, b) => a.force - b.force).map(o => o.id);
  assert.equal(gradeVirtualOrder(expected, inquiryObjects), true);
  assert.equal(gradeVirtualOrder([...expected].reverse(), inquiryObjects), false);
});

test('new battle cycles through distinct five-object sets shared by both teams', () => {
  assert.equal(battleRounds.length, 3);
  for (let i = 0; i < battleRounds.length; i++) {
    const round = battleRounds[i];
    const next = battleRounds[nextBattleRound(i)];
    assert.equal(round.ids.length, 5);
    assert.equal(new Set(round.ids).size, 5);
    assert.notDeepEqual(round.ids, next.ids);
    assert.ok(round.ids.every(id => battleObjects.some(o => o.id === id)));
    assert.ok(round.ids.every(id => battleObjects.find(o => o.id === id).force <= 5));
  }
  assert.equal(nextBattleRound(2), 0);
});
