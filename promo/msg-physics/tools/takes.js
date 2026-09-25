// 장면별 실제 조작 대본. setup = 녹화 전 준비, script(page, at) = 녹화 중(at(초)까지 기다림), zoom = 서서히 확대할 영역(1600×900 좌표)
const clickText = (p, t, root = '#activity') => p.evaluate(([t, root]) => { const b = [...document.querySelectorAll(`${root} button, ${root} [role=button]`)].find((x) => x.offsetParent && x.textContent.replace(/\s+/g, ' ').includes(t)); b?.click(); return !!b; }, [t, root]);
const range = async (p, from, to, ms = 2000, sel = '#activity input[type=range]') => { const n = Math.max(6, Math.round(ms / 90)); for (let k = 0; k <= n; k++) { await p.evaluate(([v, sel]) => { const r = document.querySelector(sel); if (!r) return; r.value = String(+r.min + (+r.max - +r.min) * v); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, [from + (to - from) * k / n, sel]); await p.waitForTimeout(ms / n); } };
const typeSlow = async (p, sel, text, cps = 14) => { await p.click(sel); for (const ch of text) { await p.keyboard.type(ch); await p.waitForTimeout(1000 / cps); } };
const openLab = (p) => p.click('#guide-action');
const predict = async (p) => { await openLab(p); await p.waitForTimeout(1200); await p.check('#activity input[type=checkbox]').catch(() => {}); await p.fill('#activity textarea', '사과가 가장 무거울 것 같아요.').catch(() => {}); await clickText(p, '예상을 기록'); await p.waitForTimeout(2200); };
const hang = (p, name) => p.evaluate((name) => { const el = [...document.querySelectorAll('#activity *')].find((x) => x.offsetParent && x.children.length <= 3 && x.textContent.trim() === name && (x.closest('button,[role=button],label,li,.weight-item') || x)); (el?.closest('button,[role=button],label,li,.weight-item') || el)?.click(); return !!el; }, name);

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
  zero: { setup: predict, script: async (p, at) => { await at(0.8); await hang(p, '신발 한 짝'); } },
  record: { setup: predict, script: async (p, at) => {
    await at(0.5); await clickText(p, '빈 저울의 기준 확인');
    for (const [i, n] of ['신발 한 짝', '귤 두 개', '휴대폰 한 개'].entries()) { await at(1.5 + i * 4.5); await hang(p, n); await p.waitForTimeout(1800); await p.fill('#activity input[type=number]', String(3 + i * 4)).catch(() => {}); await clickText(p, '측정 기록 제출'); }
  } },
  eye: { script: async (p, at) => { await at(0.5); await openLab(p); for (const [i, v] of ['위에서', '같은 높이', '아래에서', '같은 높이'].entries()) { await at(3 + i * 2.2); await clickText(p, v); } }, focus: { sel: '#activity canvas', from: 2.4, to: 3.4, pad: 30 } },
  watch: { script: async (p, at) => { await at(0.5); await openLab(p); await at(2.5); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.play(); } }); } },
  future: { script: async (p, at) => { await at(0.5); await openLab(p); await at(4); await p.evaluate(() => document.querySelector('#activity .activity-content, #activity-content')?.scrollBy({ top: 420, behavior: 'smooth' })); } },
  elastic: { script: async (p, at) => { await at(0.5); await openLab(p); await at(3); await range(p, 0, 1, 3200); await at(7.5); await clickText(p, '힘을 놓기'); await at(9.5); await range(p, 0, 0.6, 1500); }, focus: { sel: '#activity canvas', from: 3.2, to: 4.4, pad: 30 } },
  measure: { script: async (p, at) => { await at(0.5); await openLab(p);
    for (const [i, n] of ['10 g', '20 g', '30 g'].entries()) { await at(3 + i * 3.2); await clickText(p, n); await p.waitForTimeout(1500); await p.fill('#activity input[type=number]', String(3 * (i + 1))).catch(() => {}); await clickText(p, '읽은 값 기록하기'); } }, focus: { sel: '#activity canvas', from: 2.6, to: 3.8, pad: 30 } },
  graph: { script: async (p, at) => { await at(0.5); await openLab(p);
    for (const [i, [g, c]] of [[10, 3], [20, 6], [30, 9]].entries()) { await at(2.5 + i * 2.6); const ins = await p.$$('#activity input[type=number]'); await ins[0]?.fill(String(g)); await ins[1]?.fill(String(c)); await clickText(p, '점 찍기'); } } },
  tools: { script: async (p, at) => { await at(0.5); await openLab(p); await at(4); await range(p, 0, 1, 2500).catch(() => {}); } },
  test: { script: async (p, at) => { await at(0.5); await openLab(p); await at(3.5); await p.evaluate(() => document.querySelector('#activity-content')?.scrollBy({ top: 300, behavior: 'smooth' })); } },
  battle: { script: async (p, at) => {
    await at(0.4); await p.click('#battle');
    await at(3); for (const team of [0, 1]) { await p.evaluate((team) => { const panels = document.querySelectorAll('.battle-team, [data-team]'); const btn = [...(panels[team] || document).querySelectorAll('button')].find((b) => /빈 저울|0 확인/.test(b.textContent)); btn?.click(); }, team); }
    await at(5); await p.evaluate(() => { document.querySelectorAll('.battle-team, [data-team]').forEach((pn, i) => { const b = [...pn.querySelectorAll('button')].find((x) => x.textContent.includes(i ? '필통' : '사과')); b?.click(); }); });
  } },
};

// 소개판(storyboard scenes) 장면 이름 → 위의 실제 조작 대본
Object.assign(takes, {
  design: { script: async (p, at) => { for (const k of [0, 1, 2, 3]) { await at(1.6 + k * 2.4); await p.click('#next').catch(() => {}); } } },
  story: { script: async (p, at) => { await at(0.5); await openLab(p); await at(2.5); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.play(); } }); } },
  // 데일리 테스트: 부품 이름 하나를 헷갈린 채 채점 → 첨삭 펼치기 → 처방 문제(첫 오답은 질문만, 다시 고르면 정답)
  grade: { setup: async (p) => {
    const R = '#mobile-reader', fill = (n, v) => p.locator(`${R} input[name="${n}"]`).fill(v);
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
    await fill('a1-0', '영점조절나사'); await fill('a1-1', '용수철'); await fill('a1-2', '눈금'); await fill('a1-3', '고리');
    await p.locator(`${R} input[name="a2"][value="2"]`).check(); await fill('a4', 'ㄷ');
    await p.locator(`${R} input[name="a5"][value="0"]`).check(); await p.locator(`${R} input[name="a6"][value="1"]`).check();
  }, script: async (p, at) => {
    await at(1.0); await p.click('#guide-action').catch(() => {});
    await at(4.0); await p.evaluate(() => document.querySelector('.dt-card.wrong summary')?.click());
    await at(7.5); await p.click('#guide-action').catch(() => {});
    await at(9.5); await p.evaluate(() => document.querySelector('[data-rx="s01"] [data-rx-opt="0"]')?.click());
    await at(11.5); await p.evaluate(() => document.querySelector('[data-rx="s01"] [data-rx-opt="1"]')?.click());
  } },
  screen: takes.start, self: takes.inquiry, lab: takes.use, voice: takes.elastic, mistake: takes.zero,
  media: { script: async (p, at) => { await at(0.5); await openLab(p); await at(2.5); await p.evaluate(() => { const v = document.querySelector('#activity video'); if (v) { v.muted = true; v.play(); } }); } },
});
