import {esc} from './graphics.js';

const valid=s=>s&&Array.isArray(s.records)&&typeof s.prediction==='string'&&typeof s.stage==='string';
export function createSelfFlow(existing){
 const state=valid(existing)?existing:{stage:'predict',prediction:'',firstPrediction:null,records:[],firstRecord:null};
 return {
  state,
  predict(text){const value=String(text).trim();if(!value)return false;state.prediction=value;if(state.firstPrediction===null)state.firstPrediction=value;state.stage='manipulate';return true;},
  manipulated(){if(state.stage!=='manipulate')return false;state.stage='record';return true;},
  record(text){const value=String(text).trim();if(!value||state.stage!=='record')return false;const entry={text:value,at:Date.now(),attempt:state.records.length+1};state.records.push(entry);if(state.firstRecord===null)state.firstRecord={...entry};state.stage='feedback';return true;},
  recheck(){if(state.stage!=='feedback')return false;state.stage='manipulate';return true;}
 };
}

export function mountSelfFlow(host,ctx,page){
 const key=`self-flow:${page.printId}`;
 const flow=createSelfFlow(ctx.load(key,null));
 const save=()=>ctx.save(key,flow.state);
 function render(){
  const s=flow.state;
  host.innerHTML=`<div class="self-flow"><small>${esc(page.printId)} · ${esc(page.title.replace('\n',' '))}</small><h3>${{predict:'먼저 예상해요',manipulate:'직접 조작해요',record:'본 것을 기록해요',feedback:'예상과 기록을 비교해요'}[s.stage]}</h3><div class="self-steps">예상 → 조작 → 기록 → 피드백 → 재확인</div>${s.stage==='predict'?`<label>내 예상<textarea id="self-input" rows="4" maxlength="500">${esc(s.prediction)}</textarea></label><button id="self-submit">예상 저장</button>`:''}${s.stage==='manipulate'?`<p>예상: ${esc(s.firstPrediction)}</p>${page.action?`<button id="self-action">활동 열기</button>`:''}<button id="self-done">조작을 마쳤어요</button><p>활동과 영상이 끝나도 다음 단계로 자동 이동하지 않아요.</p>`:''}${s.stage==='record'?`<label>직접 본 변화와 읽은 값을 적어요<textarea id="self-input" rows="4" maxlength="500"></textarea></label><button id="self-submit">관찰 기록 저장</button>`:''}${s.stage==='feedback'?`<div class="self-compare"><section><b>처음 예상</b><p>${esc(s.firstPrediction)}</p></section><section><b>처음 기록</b><p>${esc(s.firstRecord?.text||'')}</p></section></div><p>예상과 관찰이 달랐나요? 어떤 조건을 다시 확인할지 생각해 보세요.</p><button id="self-recheck">다시 조작·확인하기</button><p>재확인 기록: ${s.records.length}회</p>`:''}</div>`;
  host.querySelector('#self-submit')?.addEventListener('click',()=>{const text=host.querySelector('#self-input').value;const done=s.stage==='predict'?flow.predict(text):flow.record(text);if(!done){ctx.status('내 생각을 먼저 적어 주세요.');return;}save();render();});
  host.querySelector('#self-action')?.addEventListener('click',()=>{save();ctx.open(page.action);});
  host.querySelector('#self-done')?.addEventListener('click',()=>{flow.manipulated();save();render();});
  host.querySelector('#self-recheck')?.addEventListener('click',()=>{flow.recheck();save();render();});
 }
 render();return {destroy(){save();}};
}
