export function freshTeam(ids) {
  return {order: [...ids], records: {}, zeroConfirmed: false, selected: null, submitted: false, mark: null, checkedBy: null};
}

export function moveInOrder(order, id, direction) {
  const from = order.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= order.length) return [...order];
  const next = [...order];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function canSubmit(team, ids) {
  return team.order.length === ids.length && new Set(team.order).size === ids.length &&
    ids.every(id => team.order.includes(id));
}

export function gradeVirtualOrder(order, objects) {
  const expected = [...objects].sort((a, b) => a.force - b.force).map(o => o.id);
  return order.length === expected.length && order.every((id, i) => id === expected[i]);
}
