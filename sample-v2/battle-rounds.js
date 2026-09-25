import {inquiryObjects} from './everyday-objects.js';

// Added values are virtual lesson settings, not weights measured from the photos.
export const battleObjects = Object.freeze([
  ...inquiryObjects,
  Object.freeze({id: 'pen', name: '볼펜 한 자루', short: '볼펜', quantity: '한 자루', force: 0.2, kind: 'pen'}),
  Object.freeze({id: 'stapler', name: '스테이플러 한 개', short: '스테이플러', quantity: '한 개', force: 1.3, kind: 'stapler'})
]);

export const battleRounds = Object.freeze([
  Object.freeze({name: '생활 물건', ids: Object.freeze(['shoe', 'apple', 'mandarins', 'phone', 'pencilcase'])}),
  Object.freeze({name: '교실과 생활', ids: Object.freeze(['pen', 'stapler', 'apple', 'phone', 'pencilcase'])}),
  Object.freeze({name: '다른 물건 비교', ids: Object.freeze(['pen', 'stapler', 'mandarins', 'shoe', 'phone'])})
]);

export function nextBattleRound(index) {
  return (index + 1) % battleRounds.length;
}
