import {objectPhoto} from './everyday-objects.js';
import {battleObjects, battleRounds, nextBattleRound} from './battle-rounds.js';
import {freshTeam, moveInOrder, canSubmit, gradeVirtualOrder} from './battle-state.js';

export async function mountBattle(host, ctx) {
  const {mountLab} = await import('./lab3d.js');
  const teams = ['a', 'b'];
  let roundIndex = Number(ctx.load('battle-v2:round-index', 0));
  if (!Number.isInteger(roundIndex) || roundIndex < 0 || roundIndex >= battleRounds.length) roundIndex = 0;
  let ids, objects, byId, state, labs = {};
  let disposed = false;

  const persist = id => ctx.save(`battle-v2:team:${id}`, state[id]);
  const say = (id, message) => {
    if (disposed) return;
    host.querySelector(`[data-team-status="${id}"]`).textContent = message;
    ctx.status(`${id.toUpperCase()}팀: ${message}`);
  };

  function renderTeam(id) {
    const team = state[id];
    const order = host.querySelector(`[data-team-order="${id}"]`);
    order.innerHTML = team.order.map((objectId, i) => {
      const o = byId[objectId];
      return `<div class="battle-order-card"><b>${i + 1}</b>${objectPhoto(o)}<span>${o.short}</span><div><button data-move="-1" data-id="${objectId}" ${i === 0 ? 'disabled' : ''} aria-label="${o.name} 더 가벼운 쪽으로">←</button><button data-move="1" data-id="${objectId}" ${i === team.order.length - 1 ? 'disabled' : ''} aria-label="${o.name} 더 무거운 쪽으로">→</button></div></div>`;
    }).join('');
    order.querySelectorAll('[data-move]').forEach(button => button.onclick = () => {
      team.order = moveInOrder(team.order, button.dataset.id, Number(button.dataset.move));
      team.submitted = false; team.mark = null; team.checkedBy = null;
      persist(id); renderTeam(id);
    });
    host.querySelector(`[data-team-records="${id}"]`).textContent = objects
      .filter(o => Number.isFinite(team.records[o.id]))
      .map(o => `${o.short} ${team.records[o.id].toFixed(1)} N`).join(' · ') || '기록한 눈금이 아직 없어요.';
    const mark = host.querySelector(`[data-team-mark="${id}"]`);
    mark.textContent = team.mark === null ? '' : team.mark ? '○' : '×';
    mark.dataset.result = team.mark === null ? '' : team.mark ? 'correct' : 'retry';
    mark.title = team.checkedBy === 'real' ? '교사가 실물 실험 결과와 대조' : team.checkedBy === 'virtual' ? '가상 교구 설정값과 대조' : '';
    host.querySelector(`[data-submit="${id}"]`).textContent = team.submitted ? '순서 확정됨' : '줄 세우기 확정';
  }

  function renderRound() {
    const round = battleRounds[roundIndex];
    ids = [...round.ids];
    objects = ids.map(id => battleObjects.find(o => o.id === id));
    byId = Object.fromEntries(objects.map(o => [o.id, o]));
    state = Object.fromEntries(teams.map(id => {
      const saved = ctx.load(`battle-v2:team:${id}`, null);
      return [id, saved && canSubmit(saved, ids) && saved.records && typeof saved.records === 'object'
        ? {...saved, selected: null, zeroConfirmed: false} : freshTeam(ids)];
    }));
    host.innerHTML = `<div class="battle-arena">
      <div class="battle-top"><div><strong>두 팀 무게 줄 세우기 <small>${roundIndex + 1}/${battleRounds.length} · ${round.name}</small></strong><p>새 대결마다 물건 세트가 바뀝니다. 두 팀은 같은 물건으로 각자 실험해요.</p></div><div class="battle-top-actions"><button data-battle-answer>가상 교구 정답 확인</button><button data-battle-reset>새 대결 · 다른 물건</button><button data-battle-close>교재로 돌아가기</button></div></div>
      <div class="battle-grid">${teams.map(id => `<section class="battle-team" data-battle-team="${id}" aria-label="${id.toUpperCase()}팀 실험"><header><h3>${id.toUpperCase()}팀</h3><output class="battle-mark" data-team-mark="${id}" aria-live="polite"></output></header><p class="battle-caption">가벼울 것 같은 순서 → 무거울 것 같은 순서</p><div class="battle-order" data-team-order="${id}"></div><div class="battle-lab"><div class="battle-scene" data-team-scene="${id}"></div><div class="battle-controls"><button data-zero="${id}">빈 저울 0 확인</button><div class="battle-objects">${objects.map(o => `<button data-object="${o.id}" data-team="${id}" aria-label="${o.name} 매달기">${objectPhoto(o)}<span>${o.short}</span></button>`).join('')}</div><div class="battle-reading" data-team-reading="${id}">물체를 골라 측정해요</div><button data-record="${id}">눈금 기록</button><button data-remove="${id}">물체 빼기</button></div></div><p class="battle-records" data-team-records="${id}"></p><div class="battle-finish"><button data-submit="${id}">줄 세우기 확정</button><span>실물로 확인한 교사 표시</span><button data-manual="${id}" data-mark="true" aria-label="${id.toUpperCase()}팀 실물 확인 ○">○</button><button data-manual="${id}" data-mark="false" aria-label="${id.toUpperCase()}팀 실물 확인 ×">×</button></div><p class="battle-status" data-team-status="${id}" role="status">먼저 순서를 예상해 보세요.</p></section>`).join('')}</div>
      <p class="battle-note">사진은 실제 물건의 예시이고 N 값은 가상 수업 설정입니다. 자동 ○/×는 그 설정값 기준이며, 교실 실물 결과는 교사가 직접 표시하세요.</p>
    </div>`;

    for (const id of teams) {
      const team = state[id];
      renderTeam(id);
      const lab = mountLab(host.querySelector(`[data-team-scene="${id}"]`), {
        mode: 'inquiry',
        onAdjust: ({zero}) => {
          if (Math.abs(zero) > .01) { team.zeroConfirmed = false; persist(id); }
        },
        onChange: sample => {
          if (disposed) return;
          const readout = host.querySelector(`[data-team-reading="${id}"]`);
          if (readout) readout.textContent = team.selected
            ? sample.settled ? `${byId[team.selected].short}: ${sample.reading.toFixed(1)} N` : '표시자가 멈추기를 기다려요'
            : '물체를 골라 측정해요';
        }
      });
      labs[id] = lab;
      lab.setZero(0);
      host.querySelector(`[data-zero="${id}"]`).onclick = () => {
        const sample = lab.state();
        team.zeroConfirmed = sample.force === 0 && Math.abs(sample.zero) < .01;
        persist(id);
        say(id, team.zeroConfirmed ? '빈 저울의 0을 확인했어요. 물체를 골라 보세요.' : '물체를 빼고 빈 저울의 0을 다시 확인해요.');
      };
      host.querySelectorAll(`[data-object][data-team="${id}"]`).forEach(button => button.onclick = () => {
        const sample = lab.state();
        if (!team.zeroConfirmed || sample.force > 0 || Math.abs(sample.zero) > .01) {
          say(id, '실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?');
          return;
        }
        const o = byId[button.dataset.object];
        team.selected = o.id;
        team.zeroConfirmed = false;
        lab.setForce(o.force, {object: o.kind});
        persist(id);
        say(id, `${o.name}를 매달았어요. 표시자가 멈추면 눈금을 기록해요.`);
      });
      host.querySelector(`[data-record="${id}"]`).onclick = () => {
        const sample = lab.state();
        if (!team.selected || !sample.settled) { say(id, '물체를 매달고 표시자가 멈춘 뒤 기록해요.'); return; }
        team.records[team.selected] = Number(sample.reading.toFixed(1));
        persist(id); renderTeam(id);
        say(id, `${byId[team.selected].name}의 눈금을 기록했어요. 물체를 빼고 다음 물체를 골라요.`);
      };
      host.querySelector(`[data-remove="${id}"]`).onclick = () => {
        lab.setForce(0); team.selected = null; team.zeroConfirmed = false;
        persist(id); say(id, '물체를 뺐어요. 다음 물체를 걸기 전에 빈 저울의 0을 확인해요.');
      };
      host.querySelector(`[data-submit="${id}"]`).onclick = () => {
        if (!canSubmit(team, ids)) { say(id, '다섯 물건을 모두 한 번씩 줄 세워 주세요.'); return; }
        team.submitted = true; team.mark = null; team.checkedBy = null;
        persist(id); renderTeam(id); say(id, '순서를 확정했어요. 교사가 실물 또는 가상 교구와 대조해요.');
      };
      host.querySelectorAll(`[data-manual="${id}"]`).forEach(button => button.onclick = () => {
        if (!team.submitted) { say(id, '줄 세우기를 먼저 확정해 주세요.'); return; }
        team.mark = button.dataset.mark === 'true'; team.checkedBy = 'real';
        persist(id); renderTeam(id); say(id, `교사가 실물 결과를 보고 ${team.mark ? '○' : '×'}로 표시했어요.`);
      });
    }
    host.querySelector('[data-battle-answer]').onclick = () => {
      if (!teams.every(id => state[id].submitted)) { ctx.status('두 팀 모두 줄 세우기를 확정한 뒤 정답을 확인해요.'); return; }
      for (const id of teams) {
        state[id].mark = gradeVirtualOrder(state[id].order, objects);
        state[id].checkedBy = 'virtual';
        persist(id); renderTeam(id);
        say(id, `가상 교구 설정값 기준 ${state[id].mark ? '○' : '×'}입니다.`);
      }
    };
    host.querySelector('[data-battle-close]').onclick = () => ctx.close();
    host.querySelector('[data-battle-reset]').onclick = () => {
      Object.values(labs).forEach(lab => lab.destroy());
      labs = {};
      roundIndex = nextBattleRound(roundIndex);
      ctx.save('battle-v2:round-index', roundIndex);
      const nextIds = battleRounds[roundIndex].ids;
      for (const id of teams) ctx.save(`battle-v2:team:${id}`, freshTeam(nextIds));
      renderRound();
      ctx.status(`새 대결: ${battleRounds[roundIndex].name} 물건으로 두 팀이 다시 시작해요.`);
    };
  }

  renderRound();
  return {destroy() { disposed = true; Object.values(labs).forEach(lab => lab.destroy()); }};
}
