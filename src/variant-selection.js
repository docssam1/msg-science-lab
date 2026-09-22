/**
 * Pure, finite, no-replacement selection for CH01's separately authored variants.
 * Approval contract: original questions stay unchanged; this helper never creates
 * questions, clears history, refills an exhausted pool, or writes student data.
 * Content/learner-fit approval belongs to the independent content verifier.
 */
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// Ignore formatting-only differences, but preserve case: mN and MN are not equal.
function normalized(value, field) {
  if (typeof value !== 'string') throw new TypeError(`${field} must be a non-empty string`);
  const text = value.normalize('NFKC').replace(/\s+/gu, '');
  if (!text) throw new TypeError(`${field} must be a non-empty string`);
  return text;
}

function inspectItem(item, field) {
  if (!isRecord(item)) throw new TypeError(`${field} must be a question object`);
  const id = normalized(item.id, `${field}.id`);
  const semantic = normalized(item.variantKey, `${field}.variantKey`);
  const prompt = normalized(item.prompt, `${field}.prompt`);
  if (!Array.isArray(item.options) || item.options.length < 2) {
    throw new TypeError(`${field}.options must contain at least two options`);
  }
  const optionIds = new Set(), labels = [];
  for (let index = 0; index < item.options.length; index++) {
    const option = item.options[index], at = `${field}.options[${index}]`;
    if (!isRecord(option)) throw new TypeError(`${at} must be an option object`);
    const optionId = normalized(option.id, `${at}.id`);
    if (optionIds.has(optionId)) throw new TypeError(`${field} contains duplicate option id: ${option.id}`);
    optionIds.add(optionId);
    labels.push(normalized(option.label, `${at}.label`));
  }
  if (new Set(labels).size !== labels.length) {
    throw new TypeError(`${field} contains indistinguishable option labels`);
  }
  normalized(item.answerId, `${field}.answerId`);
  // Exact ID equality also matches the UI's submitted answer comparison.
  const correctIndex = item.options.findIndex(option => option.id === item.answerId);
  if (correctIndex === -1) throw new TypeError(`${field}.answerId must match an option id exactly`);
  const content = JSON.stringify({prompt, options: [...labels].sort(), answer: labels[correctIndex]});
  return {id, item, identity: {semantic, content}};
}

/** Identity ignores item/option IDs and option order, never the correct meaning. */
export function variantIdentity(item) {
  return inspectItem(item, 'item').identity;
}

function inspectPool(pool) {
  if (!Array.isArray(pool)) throw new TypeError('pool must be an array');
  const ids = new Set();
  return Array.from(pool, (item, index) => {
    const record = inspectItem(item, `pool[${index}]`);
    if (ids.has(record.id)) throw new TypeError(`pool contains duplicate item id: ${item.id}`);
    ids.add(record.id);
    return record;
  });
}

/** Validate every item, even when no draw is requested. Returns only identities. */
export function validateVariantPool(pool) {
  return inspectPool(pool).map(record => record.identity);
}

function inspectSeen(seen) {
  if (!Array.isArray(seen)) throw new TypeError('seen must be an array of variant identities');
  const semantic = new Set(), content = new Set();
  for (let index = 0; index < seen.length; index++) {
    const identity = seen[index], at = `seen[${index}]`;
    if (!isRecord(identity)) throw new TypeError(`${at} must be a variant identity object`);
    semantic.add(normalized(identity.semantic, `${at}.semantic`));
    if (typeof identity.content !== 'string' || !identity.content.trim()) {
      throw new TypeError(`${at}.content must be a non-empty fingerprint string`);
    }
    content.add(identity.content);
  }
  return {semantic, content};
}

function unseenGroups(records, seen) {
  // An alias can share semantic with A and content with B. Treat that entire
  // connected group as one variant; choosing the bridge cannot reopen an alias.
  const parents = records.map((_, index) => index);
  const root = index => {
    let top = index;
    while (parents[top] !== top) top = parents[top];
    while (parents[index] !== index) {
      const next = parents[index];
      parents[index] = top;
      index = next;
    }
    return top;
  };
  const semanticOwner = new Map(), contentOwner = new Map();
  records.forEach((record, index) => {
    for (const [owners, value] of [[semanticOwner, record.identity.semantic], [contentOwner, record.identity.content]]) {
      if (owners.has(value)) parents[root(index)] = root(owners.get(value));
      else owners.set(value, index);
    }
  });
  const groups = new Map();
  records.forEach((record, index) => {
    const key = root(index);
    if (!groups.has(key)) groups.set(key, {representative: record, seen: false});
    const group = groups.get(key);
    if (seen.semantic.has(record.identity.semantic) || seen.content.has(record.identity.content)) group.seen = true;
  });
  return [...groups.values()].filter(group => !group.seen).map(group => group.representative);
}

/**
 * Select distinct unseen variant groups. Remaining counts groups, not aliases.
 * count=0 reports availability without consuming randomness. A depleted pool
 * returns [] and exhausted=true; there is deliberately no retry/refill path.
 * The caller persists variantIdentity(selectedItem) before presenting an item.
 */
export function selectUnseenVariants(pool, seen = [], count = 1, random = Math.random) {
  if (!Number.isInteger(count) || count < 0) throw new RangeError('count must be a finite non-negative integer');
  if (typeof random !== 'function') throw new TypeError('random must be a function');
  const records = inspectPool(pool), history = inspectSeen(seen);
  const available = unseenGroups(records, history);
  const selected = [], target = Math.min(count, available.length);
  for (let draw = 0; draw < target; draw++) {
    const value = random();
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError('random must return a finite number in [0, 1)');
    }
    const index = Math.floor(value * available.length);
    selected.push(available.splice(index, 1)[0].item);
  }
  return {selected, exhausted: available.length === 0, remaining: available.length};
}
