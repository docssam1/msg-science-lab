// 장면별 실제 조작 대본. setup = 녹화 전 준비, script(page, at) = 녹화 중(at(초)까지 기다림), zoom = 서서히 확대할 영역(1600×900 좌표)
const clickText = (p, t, root = '#activity') => p.evaluate(([t, root]) => { const b = [...document.querySelectorAll(`${root} button, ${root} [role=button]`)].find((x) => x.offsetParent && x.textContent.replace(/\s+/g, ' ').includes(t)); b?.click(); return !!b; }, [t, root]);
const range = async (p, from, to, ms = 2000, sel = '#activity input[type=range]') => { const n = Math.max(6, Math.round(ms / 90)); for (let k = 0; k <= n; k++) { await p.evaluate(([v, sel]) => { const r = document.querySelector(sel); if (!r) return; r.value = String(+r.min + (+r.max - +r.min) * v); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, [from + (to - from) * k / n, sel]); await p.waitForTimeout(ms / n); } };
const typeSlow = async (p, sel, text, cps = 14) => { await p.click(sel); for (const ch of text) { await p.keyboard.type(ch); await p.waitForTimeout(1000 / cps); } };
const openLab = (p) => p.click('#guide-action');
const predict = async (p) => { await openLab(p); await p.waitForTimeout(1200); await p.check('#activity input[type=checkbox]').catch(() => {}); await p.fill('#activity textarea', '사과가 가장 무거울 것 같아요.').catch(() => {}); await clickText(p, '예상을 기록'); await p.waitForTimeout(2200); };
// 교구의 물체(.weight-item, [data-object])는 click이 아니라 포인터/Enter 키로 매달린다 — Enter로 누른다
const hang = (p, name) => p.evaluate((name) => { const el = [...document.querySelectorAll('#activity *')].find((x) => x.offsetParent && x.children.length <= 3 && x.textContent.trim() === name); const t = el?.closest('button,[role=button],label,li,.weight-item') || el; if (!t) return false; if (t.tagName === 'BUTTON') t.click(); else { t.focus(); t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); } return true; }, name);

export const takes = {
  start: { script: async (p, at) => { for (const [i, s] of ['.card:nth-child(1)', '.card:nth-child(2)', '.card:nth-child(3)'].entries()) { await at(0.6 + i * 1.3); await p.hover(s).catch(() => {}); } } },
  inquiry: { script: async (p, at) => {
    await at(1.5); await openLab(p);
    await at(4); for (const k of [0, 2, 1]) { await p.evaluate((k) => { const cards = [...document.querySelectorAll('#activity button')].filter((b) => b.textContent.trim() === '→' && b.offsetParent && !b.disabled); cards[k]?.click(); }, k); await p.waitForTimeout(700); }
    await at(8); await p.check('#activity input[type=checkbox]').catch(() => {});
    await at(9); await typeSlow(p, '#activity textarea', '사과는 작아도 꽉 차 있어서 무거울 것 같아요.');
    await at(15); await clickText(p, '예상을 기록');
  } },
  use: { setup: predict, script: async (p, at) => {
    await at(0.8); await clickText(p, '빈 저울의 기준 확인');
    await at(2.6); await hang(p, '사과 한 개');
    await at(6.5); await clickText(p, '눈금 확대');
  }, focus: { sel: '#activity canvas', from: 3.2, to: 4.6, pad: 30 } },
  zero: { setup: predict, script: async (p, at) => { await at(0.8); await hang(p, '신발 한 짝'); }, zoom: [1.6, 2.6, 100, 315, 1040, 585] },   // 우루사쌤 말풍선의 '실험 방법에 오류가 있어요'로
  record: { setup: predict, script: async (p, at) => {
    await at(0.5); await clickText(p, '빈 저울의 기준 확인');
    for (const [i, n] of ['신발 한 짝', '귤 두 개', '휴대폰 한 개'].entries()) { await at(1.5 + i * 4.5); await hang(p, n); await p.waitForTimeout(1800); await p.fill('#activity input[type=number]', String(3 + i * 4)).catch(() => {}); await clickText(p, '측정 기록 제출'); }
  } },
  eye: { script: async (p, at) => { await at(0.5); await openLab(p); for (const [i, v] of ['위에서', '같은 높이', '아래에서', '같은 높이'].entries()) { await at(3 + i * 2.2); await clickText(p, v); } }, focus: { sel: '#activity canvas', from: 2.4, to: 3.4, pad: 30 } },
  watch: { script: async (p, at) => { await at(0.5); await openLab(p); await at(2.5); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.play(); } }); } },
  future: { script: async (p, at) => { await at(0.5); await openLab(p); await at(4); await p.evaluate(() => document.querySelector('#activity .activity-content, #activity-content')?.scrollBy({ top: 420, behavior: 'smooth' })); } },
  elastic: { script: async (p, at) => { await at(0.5); await openLab(p); await at(3); await range(p, 0, 1, 3200); await at(7.5); await clickText(p, '힘을 놓기'); await at(9.5); await range(p, 0, 0.6, 1500); }, focus: { sel: '#activity canvas', from: 3.2, to: 4.4, pad: 30 } },
  measure: { script: async (p, at) => { await at(0.5); await openLab(p);
    for (const [i, n] of ['10 g', '20 g', '30 g'].entries()) { await at(3 + i * 3.2); if (i) await clickText(p, '물체 빼기'); await hang(p, n); await p.waitForTimeout(1500); await p.fill('#activity input[type=number]', String(3 * (i + 1))).catch(() => {}); await clickText(p, '읽은 값 기록하기'); } }, focus: { sel: '#activity canvas', from: 2.6, to: 3.8, pad: 30 } },
  graph: { script: async (p, at) => { await at(0.5); await openLab(p);
    for (const [i, [g, c]] of [[10, 3], [20, 6], [30, 9]].entries()) { await at(2.5 + i * 2.6); const ins = await p.$$('#activity input[type=number]'); await ins[0]?.fill(String(g)); await ins[1]?.fill(String(c)); await clickText(p, '점 찍기'); } } },
  tools: { script: async (p, at) => { await at(0.5); await openLab(p); await at(4); await range(p, 0, 1, 2500).catch(() => {}); } },
  // 데일리 테스트 페이지(여기서 안내 단추는 '채점하기'라 누르지 않는다) — 문제지로 다가간다
  test: { script: async (p, at) => { await at(8); }, zoom: [0.6, 2.2, 400, 90, 800, 450] },
  // 두 팀 배틀(새 화면): A팀은 가벼운 것부터 바르게, B팀은 한 칸 어긋나게 → 도장·점수·승리 배너
  battle: { setup: async (p) => { await p.click('#battle'); await p.waitForTimeout(3500); }, script: async (p, at) => {
    const [A, B] = await p.evaluate(() => [...document.querySelectorAll('[data-battle-team]')].map((e) => e.dataset.battleTeam));
    const tap = (sel) => p.evaluate((sel) => document.querySelector(sel)?.click(), sel);
    await at(0.6); await tap(`[data-zero="${A}"]`); await at(0.9); await tap(`[data-zero="${B}"]`);
    await at(1.4); await tap(`[data-object="apple"][data-team="${A}"]`); await at(1.8); await tap(`[data-object="shoe"][data-team="${B}"]`);
    const order = (t) => p.evaluate((t) => [...document.querySelectorAll(`[data-battle-team="${t}"] [data-move="1"]`)].map((b) => b.dataset.id), t);
    const force = await p.evaluate(async () => Object.fromEntries((await import('./battle-rounds.js')).battleObjects.map((o) => [o.id, o.force])));
    let t = 3.0;
    for (let guard = 0; guard < 12; guard++) { const o = await order(A); const i = o.findIndex((id, k) => k && force[o[k - 1]] > force[id]); if (i < 0) break; await at(t); await tap(`[data-battle-team="${A}"] [data-move="-1"][data-id="${o[i]}"]`); t += 0.4; }
    const ob = await order(B); const bad = ob.findIndex((id, k) => k && force[ob[k - 1]] < force[id]);
    await at(3.4); await tap(`[data-battle-team="${B}"] [data-move="-1"][data-id="${ob[Math.max(1, bad)]}"]`);
    await at(Math.max(5.2, t + 0.3)); await tap(`[data-submit="${A}"]`); await at(Math.max(5.6, t + 0.7)); await tap(`[data-submit="${B}"]`);
    await at(Math.max(6.3, t + 1.3)); await tap('[data-battle-answer]');
  } },
};

// 소개판(storyboard scenes) 장면 이름 → 위의 실제 조작 대본
Object.assign(takes, {
  design: { script: async (p, at) => { for (const k of [0, 1, 2, 3]) { await at(1.6 + k * 2.4); await p.click('#next').catch(() => {}); } }, zoom: [0.6, 2.0, 380, 175, 840, 473] },   // 책 펼침면으로 다가간다
  story: { script: async (p, at) => { await at(0.5); await openLab(p); await at(2.5); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.play(); } }); } },
  // 데일리 테스트: 부품 이름 하나를 헷갈린 채 채점 → 첨삭 펼치기 → 처방 문제(첫 오답은 질문만, 다시 고르면 정답)
  // 소개 영상의 '스스로 공부' 장면(약 7.7초)에 맞춘 짧은 판: 줄 세우기 → 체크 → 이유 쓰기 → 기록, 활동판으로 다가간다
  self: { script: async (p, at) => {
    await at(0.6); await openLab(p);
    await at(2.0); for (const k of [0, 2]) { await p.evaluate((k) => { const cards = [...document.querySelectorAll('#activity button')].filter((b) => b.textContent.trim() === '→' && b.offsetParent && !b.disabled); cards[k]?.click(); }, k); await p.waitForTimeout(450); }
    await at(3.4); await p.check('#activity input[type=checkbox]').catch(() => {});
    await at(3.8); await typeSlow(p, '#activity textarea', '사과는 작아도 꽉 차 있어 무거울 것 같아요.', 16);
    await at(6.6); await clickText(p, '예상을 기록');
  }, zoom: [1.6, 2.6, 360, 90, 880, 495] },
  grade: { setup: async (p) => {
    const R = '#mobile-reader', fill = (n, v) => p.locator(`${R} input[name="${n}"]`).fill(v);
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
    await fill('a1-0', '영점조절나사'); await fill('a1-1', '용수철'); await fill('a1-2', '눈금'); await fill('a1-3', '고리');
    await p.locator(`${R} input[name="a2"][value="2"]`).check(); await fill('a4', 'ㄷ');
    await p.locator(`${R} .question[data-q="a3"] .dt-speak`).click(); await p.locator(`${R} .question[data-q="a3"] .speech-draft`).fill('바늘'); await p.locator(`${R} .question[data-q="a3"] .speech-apply`).click();
    await p.locator(`${R} input[name="a5"][value="0"]`).check(); await p.locator(`${R} input[name="a6"][value="1"]`).check();
  }, script: async (p, at) => {
    await at(0.8); await p.click('#guide-action').catch(() => {});
    await at(3.2); await p.evaluate(() => document.querySelector('.dt-card.wrong summary')?.click());
    await at(6.0); await p.click('#guide-action').catch(() => {});
    await at(7.6); await p.evaluate(() => document.querySelector('[data-rx="s01"] [data-rx-opt="0"]')?.click());
    await at(9.3); await p.evaluate(() => document.querySelector('[data-rx="s01"] [data-rx-opt="1"]')?.click());
  }, zoom: [1.6, 2.6, 20, 40, 1100, 619] },
  screen: takes.start, lab: takes.use, voice: takes.elastic, mistake: takes.zero,
  media: { script: async (p, at) => { await at(0.5); await openLab(p); await at(2.5); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.play(); } }); } },
});
