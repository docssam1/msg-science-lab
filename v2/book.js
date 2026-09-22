// GFIELD 실험 과학 영재 — 실험 한 장(chapter)을 웹과 A4 인쇄 둘 다로 그린다.
// 쪽 구성: 머리띠(색 띠) · 본문 · 옆날개(플러스 노트·용어풀이·빈칸 답) · 단원 손잡이 탭 · 쪽 번호.
// 홀수 쪽은 옆날개가 오른쪽, 짝수 쪽은 왼쪽(책을 펼쳤을 때 바깥쪽).
// 학생용은 빈칸·쓰는 줄, 교사용(teacher)은 같은 자리에 답·채점 기준을 빨간 글씨로 넣는다.
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NUM = ['①', '②', '③', '④', '⑤', '⑥'];
const BL = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝ';

export function renderChapter(ch, art, similar, { teacher = false, live = false, media = null } = {}) {
  let pageNo = 0;
  // live: 웹 화면용 — 영상이 쪽 안에서 재생되고, 누르면 3D·실험실이 책 밖으로 튀어나온다. 인쇄에는 늘 그림·QR만 남는다.
  const web = (h) => (live ? `<div class="bk-web">${h}</div>` : '');
  const pop = (kind, label) => (live ? `<button type="button" class="bk-pop-btn" data-pop="${kind}">▶ ${esc(label)}</button>` : '');
  const videoPop = (v, label) => (live && v ? `<button type="button" class="bk-video-link" data-video data-src="${esc(v.src)}" data-mp4="${esc(v.mp4 || '')}" data-full="${esc(v.full)}" data-page="${esc(v.page)}" data-title="${esc(v.title)}" data-credit="${esc(v.credit)}" data-prompt="${esc(v.prompt || '')}">▶ ${esc(label)}</button>` : '');
  const G = Object.fromEntries((ch.glossary || []).map((g) => [g[0], g]));
  const ans = (a, lines = 2) => (teacher ? `<div class="bk-ans">${esc(a)}</div>` : `<div class="bk-lines">${'<i></i>'.repeat(lines)}</div>`);
  // 빈칸: {{답}} → 학생 ⓐ____ / 교사 빨간 답. 이 쪽의 빈칸 답은 옆날개 아래에 모은다.
  let keys = [];
  const blank = (s) => esc(s).replace(/\{\{(.+?)\}\}/g, (_, a) => {
    const m = BL[keys.length % BL.length]; keys.push([m, a]);
    return teacher ? `<span class="bk-blank t">${a}</span>` : `<span class="bk-blank" data-a="${a}" style="min-width:${Math.max(3, a.length * 1.3)}em"><i>${m}</i></span>`;
  });
  const rail = (n) => {
    const r = (ch.rail || {})[n] || [];
    const notes = r.filter((x) => x.h).map((x) => `<div class="bk-rn"><h5>${esc(x.h)}</h5><p>${esc(x.t)}</p></div>`).join('');
    const gl = r.flatMap((x) => x.g || []).map((k) => G[k]).filter(Boolean);
    const glHtml = gl.length ? `<div class="bk-gl"><h5>용어풀이</h5>${gl.map(([w, h, m, d]) => `<p><b>${esc(w)}</b>(${esc(h)} · ${esc(m)}) ${esc(d)}</p>`).join('')}</div>` : '';
    const key = keys.length && !teacher ? `<div class="bk-key">${keys.map(([m, a]) => `${m} ${esc(a)}`).join('  ')}</div>` : '';
    return `<aside class="bk-rail"><div class="bk-rail-tag">플러스 노트</div>${notes}${glHtml}${key}</aside>`;
  };
  const page = (body, { cls = '', band = '' } = {}) => {
    const n = ++pageNo, side = n % 2 ? 'odd' : 'even';
    const html = `<section class="bk-page ${side} ${cls}">
      <div class="bk-band">${band || `<span class="bk-band-no">${String(ch.no).padStart(2, '0')}</span><span class="bk-band-t">${esc(ch.title)}</span><span class="bk-band-u">교과 연계 실험 · ${esc(ch.link.unit)}</span>`}</div>
      <div class="bk-thumb">${esc(ch.link.unit)}</div>
      <div class="bk-grid"><div class="bk-main">${body}</div>${rail(n)}</div>
      <footer class="bk-foot"><span class="bk-pn">${n}</span><span>${n % 2 ? `${String(ch.no).padStart(2, '0')} ${esc(ch.title)}` : `${esc(ch.book)} ${esc(ch.vol)}`}</span>${teacher ? '<em>교사용</em>' : ''}</footer></section>`;
    keys = [];
    return html;
  };
  const banner = (t, kind = '') => `<div class="bk-banner ${kind}"><span>${esc(t)}</span></div>`;
  const step = (n, t) => `<h3 class="bk-step"><span>STEP ${n}</span>${esc(t)}</h3>`;
  const qr = (src, label, kind) => `<figure class="bk-qr">${kind ? pop(kind, label) : ''}<img src="${src}" alt="${esc(label)} QR"><figcaption>${esc(label)}</figcaption></figure>`;
  const out = [];

  // 1. 장 첫 쪽
  out.push(page(`
    ${live && media?.engage ? `${web(`<div class="bk-video" data-src="${media.engage.src}" data-mp4="${media.engage.mp4 || ''}" data-full="${media.engage.full}" data-page="${media.engage.page}"><img src="${media.engage.poster || ''}" alt=""><button type="button" class="bk-play">▶ 실제 영상 보기</button><small>${esc(media.engage.credit)}</small></div>`)}<div class="bk-art wide bk-print">${art.opener}</div>` : `<div class="bk-art wide">${art.opener}</div>`}
    ${ch.intro.map((p) => `<p class="bk-p">${esc(p)}</p>`).join('')}
    <div class="bk-box think"><h4>미리 생각하기</h4><ol>${ch.think.map((t) => `<li>${esc(t.q)}${ans(t.a, 2)}</li>`).join('')}</ol></div>
    <div class="bk-road"><div class="bk-road-steps">${['가설', '설계', '실험', '결과·결론', '개념 정리', '창의·토의', '영재성', '확인 문제'].map((t, i) => `<span><b>${i + 1}</b>${t}</span>`).join('')}</div>${qr(ch.qr.scene, '3D로 먼저 보기', 'scene')}</div>`, { cls: 'first', band: `
      <div class="bk-open"><div class="bk-no">${String(ch.no).padStart(2, '0')}</div><div><p class="bk-kicker">${esc(ch.link.topics[0])}</p><h2>${esc(ch.title)}</h2></div>
      <div class="bk-vol">${esc(ch.book)}<b>${esc(ch.vol)}</b></div></div>` }));

  // 2. 탐구 설계
  const d = ch.design;
  out.push(page(`${banner('탐구 설계하기', 'design')}
    <p class="bk-goal">${esc(ch.goal)}</p>
    <div class="bk-two"><div class="bk-tag"><b>탐구 요소</b> ${ch.skills.map(esc).join(', ')}</div>
      <div class="bk-mat"><b>준비물</b><p>${ch.materials.kit.map(esc).join(', ')}</p><p><b>학생 준비물</b> ${ch.materials.student.map(esc).join(', ')}</p></div></div>
    ${step(1, '가설 세우기')}<p class="bk-hint">${esc(ch.hypothesis.hint)}</p>${ans(ch.hypothesis.a, 3)}
    ${step(2, '실험 설계하기')}
    <table class="bk-tbl design"><tbody>${[d.change, d.same, d.measure].map((r) => `<tr><th>${esc(r.q)}</th><td>${teacher ? `<span class="bk-ans">${esc(r.a)}</span>` : ''}</td></tr>`).join('')}</tbody></table>`));

  // 3~4. 실험하기
  const stepCard = (s, i) => `<div class="bk-stepcard"><div class="bk-art">${art[s.art]}${pop('lab', '3D 실험실에서 해 보기')}</div><div><span class="bk-n">${i + 1}</span><p>${esc(s.text)}</p><p class="bk-tip">${esc(s.tip)}</p></div></div>`;
  out.push(page(`${banner('탐구력 기르기', 'lab')}${step(3, '실험하기')}${ch.steps.slice(0, 3).map(stepCard).join('')}`));
  out.push(page(`${ch.steps.slice(3).map((s, i) => stepCard(s, i + 3)).join('')}
    ${media?.explore ? web(`<div class="bk-video-compare"><b>실제 용암과 비교해요</b>${videoPop(media.explore, '용암이 흐르고 굳는 영상')}</div>`) : ''}
    <div class="bk-box q"><h4>Q. 이런 경우는?</h4><p>${esc(ch.wonder.q)}</p>${ans(ch.wonder.a, 2)}</div>
    <div class="bk-box caution"><h4>주의하세요!</h4><ul>${ch.caution.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div class="bk-qrs">${qr(ch.qr.lab, '3D 실험실에서 해 보기', 'lab')}${qr(ch.qr.kit, '집에서 하는 준비물')}</div>`));

  // 5. 결과 · 결론
  const res = ch.results.map((r) => `<li>${esc(r.q)}
      ${r.art ? `<div class="bk-art mid">${art[r.art]}</div>` : ''}
      ${r.table ? `<table class="bk-tbl"><thead><tr>${r.table.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${r.rows.map((rw) => `<tr><th>${esc(rw)}</th>${r.table.slice(1).map(() => '<td></td>').join('')}</tr>`).join('')}</tbody></table>` : ''}
      ${ans(r.a, r.art || r.table ? 1 : 2)}</li>`).join('');
  out.push(page(`${step(4, '결과 기록하기')}<ol class="bk-ol">${res}</ol>
    ${step(5, '결론 내리기')}<ol class="bk-ol">${ch.conclusion.map((c) => `<li>${esc(c.q)}${ans(c.a, 2)}</li>`).join('')}</ol>`));

  // 6. 개념 정리(빈칸)
  const cp = ch.concept.map((c) => `<section class="bk-cs"><h3><span class="bk-letter">${c.tag}</span>${esc(c.title)}</h3>
    ${c.lines ? `<ol class="bk-cl">${c.lines.map(([k, v]) => `<li><b>${esc(k)}</b> : ${blank(v)}</li>`).join('')}</ol>` : ''}
    ${c.table ? `<div class="bk-two art-l"><div class="bk-art">${art[ch.note.art]}</div><table class="bk-tbl note"><thead><tr>${c.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${c.table.rows.map((r) => `<tr>${r.map((x, i) => (i ? `<td>${blank(x)}</td>` : `<th>${esc(x)}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>` : ''}</section>`).join('');
  const flow = ch.flow ? `<div class="bk-flow">${ch.flow.map(([a, b, c]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span><small>${esc(c)}</small></div>`).join('<i>➜</i>')}</div>` : '';
  out.push(page(`${banner('개념 정리', 'concept')}${cp.replace('</ol>', `</ol>${flow}`)}
    <div class="bk-more"><h4>${esc(ch.more.title)}</h4><p>${esc(ch.more.text)}</p></div>`));

  // 7. 창의사고력 기르기: 휘어진 강 → 창의 문제 → 토의
  const n = ch.note;
  out.push(page(`${banner('창의사고력 기르기', 'think')}
    <div class="bk-read"><div class="bk-two art-r"><div><h4>${esc(n.plus.title)}</h4><p>${esc(n.plus.text)}</p></div><div class="bk-art">${art[n.plus.art]}</div></div></div>
    ${step(6, '창의력 키우기')}<p class="bk-p">${esc(ch.creative.q)}</p>${ans(ch.creative.a, 5)}
    ${step(7, '개념 넓혀 토의하기')}<p class="bk-p">${esc(ch.discuss.q)}</p>${ans(ch.discuss.a, 5)}`));

  // 8. 영재성 기르기 + 탐구 돌아보기
  const g = ch.gifted;
  const self = ['가설을 “~할수록 ~할 것이다”로 썼나요?', '바꿀 조건을 하나만 정했나요?', '결과를 표에 빠짐없이 적었나요?', '결론을 실험 결과로 설명했나요?', '실험 결과를 실제 강과 이어 생각했나요?'];
  out.push(page(`${banner('영재성 기르기', 'gift')}
    <p class="bk-goal">${esc(g.title)}</p><p class="bk-p">${esc(g.lead)}</p>
    <table class="bk-tbl"><tbody>${g.rows.map((r) => `<tr><th>${esc(r)}</th><td class="tall">${teacher ? `<span class="bk-ans">예) ${esc(g.a[r])}</span>` : ''}</td></tr>`).join('')}</tbody></table>
    ${teacher ? `<div class="bk-rubric"><b>채점 기준</b><ul>${g.rubric.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>` : ''}
    <div class="bk-box self"><h4>나의 탐구 돌아보기</h4><table class="bk-tbl chk"><tbody>${self.map((s) => `<tr><td>${esc(s)}</td><td class="st">☆ ☆ ☆</td></tr>`).join('')}</tbody></table></div>`));

  const itemHtml = (it, i) => {
    const ac = it.answerContract, gv = it.givens;
    const givens = gv ? Object.entries(gv).map(([k, v]) => `<div class="bk-given">${/^(설명|내용|text|문항|자료|글|지문)$/.test(k) ? '' : k === '보기' ? '<b>〈보기〉</b><br>' : `<b>${esc(k)}</b> `}${Array.isArray(v) ? v.map(esc).join('<br>') : esc(typeof v === 'object' ? JSON.stringify(v) : v)}</div>`).join('') : '';
    const kk = ac.type === 'single-choice' ? [ac.answer] : ac.type === 'multi-choice' ? ac.answers : [];
    const choices = it.choices ? `<ol class="bk-choices" data-key="${kk.join(',')}" data-id="${it.id}">${it.choices.map((c, j) => `<li data-j="${j}"><span>${NUM[j]}</span>${esc(c)}</li>`).join('')}</ol>` : '';
    const key = ac.type === 'single-choice' ? NUM[ac.answer] : ac.type === 'multi-choice' ? ac.answers.map((a) => NUM[a]).join(', ') : ac.type === 'short-text' ? ac.answer : ac.sample;
    return `<li class="bk-item"><span class="bk-qn">${String(i + 1).padStart(2, '0')}</span><p>${esc(it.prompt)}</p>${givens}${choices}${it.choices ? (teacher ? `<div class="bk-ans">정답 ${esc(key)} — ${esc(it.explanation)}</div>` : '') : ans(`${key} — ${it.explanation}`, ac.type === 'written-explanation' ? 3 : 1)}</li>`;
  };
  // 9. 탐구보고서(학생이 채워 제출하는 한 장)
  if (ch.report) {
    const R = ch.report;
    out.push(page(`${banner('탐구보고서', 'report')}
      <table class="bk-tbl rep"><tbody><tr><th>단원</th><td>${esc(ch.link.unit)}</td><th>실험</th><td>${esc(ch.title)}</td></tr>
        <tr><th>이름</th><td></td><th>날짜</th><td></td></tr></tbody></table>
      <ol class="bk-rep">${R.sections.map((r) => `<li><b>${esc(r.label)}</b>${r.hint ? `<span class="bk-hint">${esc(r.hint)}</span>` : ''}${teacher && r.a ? `<div class="bk-ans">${esc(r.a)}</div>` : `<div class="bk-lines">${'<i></i>'.repeat(r.lines || 2)}</div>`}</li>`).join('')}</ol>
      <div class="bk-box self tight"><h4>스스로 점검</h4><table class="bk-tbl chk"><tbody>${R.checks.map((c) => `<tr><td>${esc(c)}</td><td class="st">☆ ☆ ☆</td></tr>`).join('')}</tbody></table></div>`));
  }

  // 10. 형성평가(수업 끝 5분 · 성취기준 확인)
  if (ch.formative) {
    const F = ch.formative, pickF = F.items.map((k) => similar.find((s) => `${s.sourceRef.of.set}-${s.sourceRef.of.no}` === k)).filter(Boolean);
    out.push(page(`${banner('형성평가', 'check')}<p class="bk-hint">수업을 마치며 5분 동안 풀어요. 맞은 개수로 다음 공부를 정해요.</p>
      <ol class="bk-items">${pickF.map(itemHtml).join('')}</ol>
      <div class="bk-box self"><h4>성취기준 확인</h4><table class="bk-tbl chk"><tbody>${F.standards.map((c) => `<tr><td>${esc(c)}</td><td class="st">○ △ ✕</td></tr>`).join('')}</tbody></table>
        <p class="bk-hint">○ 잘 안다 · △ 조금 더 · ✕ 다시 배우기 — △·✕는 개념 정리 쪽으로 돌아가 다시 읽어요.</p></div>`, { cls: 'check' }));
  }

  // 11. 교과 확인 문제
  const pick = ch.check.map((k) => similar.find((s) => `${s.sourceRef.of.set}-${s.sourceRef.of.no}` === k)).filter(Boolean);
  out.push(page(`${banner('교과 확인 문제', 'check')}<ol class="bk-items">${pick.map(itemHtml).join('')}</ol>`, { cls: 'check' }));

  return `<div class="bk ${teacher ? 'bk-t' : ''} ${live ? 'live' : ''}" style="--bk-theme:${ch.theme || '#2F7D4F'};--bk-thumb-top:${60 + (ch.no - 1) * 22}mm">${out.join('')}</div>`;
}

// 쪽 맞춤: 쪽마다 본문이 A4 한 장에 알맞게 차도록 조정한다(휴대폰의 한 줄 읽기 화면은 건너뜀).
//  빈자리가 남으면 → 쓰는 줄을 늘리고, 그래도 남으면 꼭지 사이 간격을 고르게 벌린다.
//  넘치면 → 글자를 0.25pt씩 줄인다(최소 9pt).
export function fitPages(root) {
  if (matchMedia('(max-width: 700px)').matches && !root.classList.contains('a4')) return;
  const mm = (() => { const d = document.createElement('div'); d.style.width = '100mm'; root.appendChild(d); const w = d.getBoundingClientRect().width / 100; d.remove(); return w; })();
  root.querySelectorAll('.bk-page').forEach((pg) => {
    const grid = pg.querySelector('.bk-grid'), main = pg.querySelector('.bk-main');
    main.style.cssText = ''; main.querySelectorAll('.bk-lines i.fit').forEach((i) => i.remove()); main.querySelectorAll('.bk-stepcard, td, .bk-two, .bk-main > *').forEach((x) => x.removeAttribute('style'));
    const avail = () => grid.clientHeight - parseFloat(getComputedStyle(grid).paddingTop);
    main.style.alignSelf = 'start';
    const used = () => main.scrollHeight;
    // 넘치면 글자 줄이기
    for (let pt = 10.25; used() > avail() && pt >= 9; pt -= 0.25) main.style.fontSize = `${pt}pt`;
    // 빈자리에 쓰는 줄 더하기(칸마다 최대 3줄)
    const lines = [...main.querySelectorAll('.bk-lines')], lh = 7.2 * mm;
    for (let round = 0; round < 2 && lines.length; round++) {
      for (const l of lines) {
        if (avail() - used() < lh + 4 * mm) break;
        const i = document.createElement('i'); i.className = 'fit'; l.appendChild(i);
      }
    }
    const free = () => avail() - used();
    // 실험 그림을 키워 채우기
    const cards = [...main.querySelectorAll('.bk-stepcard')];
    for (let w = 62; cards.length && w <= 86 && free() > 6 * mm; w += 3) cards.forEach((c) => { c.style.gridTemplateColumns = `${w}mm 1fr`; });
    if (cards.length && free() < 0) cards.forEach((c) => { c.style.gridTemplateColumns = `${parseFloat(c.style.gridTemplateColumns) - 3}mm 1fr`; });
    // 쓰는 칸(표의 빈칸)을 키워 채우기
    const cells = [...main.querySelectorAll('.bk-tbl.design td, .bk-tbl td.tall, .bk-tbl:not(.note):not(.chk) tbody td:empty')];
    if (cells.length && free() > 4 * mm) {
      const add = Math.min(22 * mm, (free() - 3 * mm) / cells.length);
      cells.forEach((c) => { c.style.height = `${c.getBoundingClientRect().height + add}px`; });
    }
    // 남은 자리는 꼭지 사이에 고르게(최대 7mm씩), 나머지는 아래에 둔다
    const kids = [...main.children].slice(1);
    if (kids.length && free() > 3 * mm) {
      const g = Math.min(10 * mm, (free() - 2 * mm) / kids.length);
      kids.forEach((k) => { k.style.marginTop = `calc(${getComputedStyle(k).marginTop} + ${g}px)`; });
    }
  });
}
