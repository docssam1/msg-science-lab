import {variantIdentity, selectUnseenVariants} from './variant-selection.js';

const keyFor = teacher => teacher?'msg-ch01-variants-lecture-v1':'msg-ch01-variants-student-v1';
const fresh = () => ({version:1,seen:[],active:null,history:[]});
function read(teacher) {
 const raw=localStorage.getItem(keyFor(teacher));
 if(raw===null)return fresh();
 let state;try{state=JSON.parse(raw);}catch{throw new Error('변형 이력이 손상되어 새 문제 선택을 멈췄어요. 기록을 임의로 초기화하지 않습니다.');}
 if(state?.version!==1||!Array.isArray(state.seen)||!Array.isArray(state.history)||!state.seen.every(v=>typeof v?.semantic==='string'&&v.semantic.length>0&&typeof v?.content==='string'&&v.content.length>0))throw new Error('변형 이력 형식을 확인할 수 없어 새 문제 선택을 멈췄어요.');
 if((state.active&&!state.seen.some(v=>v.semantic===state.active.identity?.semantic&&v.content===state.active.identity?.content))||state.history.some(h=>!state.seen.some(v=>v.semantic===h.identity?.semantic&&v.content===h.identity?.content)))throw new Error('이미 연 문항의 이력이 맞지 않아 새 선택을 멈췄어요.');
 return state;
}
async function locked(teacher,task) {
 if(!navigator.locks?.request)throw new Error('이 브라우저에서는 중복 선택 방지를 보장할 수 없어 새 문제 선택을 멈췄어요.');
 return navigator.locks.request(keyFor(teacher),()=>task(read(teacher)));
}
function save(teacher,state) {localStorage.setItem(keyFor(teacher),JSON.stringify(state));}
const same=(a,b)=>a.semantic===b.semantic||a.content===b.content;
const identical=(a,b)=>a.semantic===b.semantic&&a.content===b.content;
export async function markVariantPresented(question,teacher=false) {
 return locked(teacher,state=>{
  const identity=variantIdentity(question),known=state.seen.some(s=>same(s,identity));
  if(!known){state.seen.push(identity);save(teacher,state);}
  return {known};
 });
}
export async function getMixedState(pool,teacher=false) {
 return locked(teacher,state=>{
  const available=selectUnseenVariants(pool,state.seen,0);
  if(state.active){
   const question=pool.find(q=>q.id===state.active.id);
   if(!question||!identical(variantIdentity(question),state.active.identity))throw new Error('진행 중이던 문항 자료가 바뀌어 새 선택을 멈췄어요.');
  }
  return {...state,remaining:available.remaining,exhausted:available.remaining===0};
 });
}
export async function claimNextVariant(pool,teacher=false) {
 return locked(teacher,state=>{
  if(state.active&&!state.active.submitted)throw new Error('이미 연 문항에 먼저 답해 주세요. 같은 변형을 새로 뽑지 않습니다.');
  const choice=selectUnseenVariants(pool,state.seen,1);
  if(!choice.selected.length)return {...state,remaining:0,exhausted:true};
  const question=choice.selected[0],identity=variantIdentity(question);
  state.seen.push(identity);
  state.active={id:question.id,identity,selectedAt:new Date().toISOString(),submitted:false,answerId:null,correct:null};
  // Reserve and remember before showing the question. Storage failure means no draw.
  save(teacher,state);
  return {...state,remaining:choice.remaining,exhausted:choice.remaining===0};
 });
}
export async function submitMixedVariant(question,answerId,teacher=false) {
 return locked(teacher,state=>{
  if(!state.active||state.active.id!==question.id||!identical(state.active.identity,variantIdentity(question)))throw new Error('현재 문항과 제출할 문항이 다릅니다. 새로 뽑지 않고 현재 상태를 유지합니다.');
  if(state.active.submitted)return state;
  if(!teacher&&!question.options.some(o=>o.id===answerId))throw new Error('답을 하나 고른 뒤 확인해 주세요.');
  state.active={...state.active,submitted:true,answerId:teacher?null:answerId,correct:teacher?null:answerId===question.answerId};
  state.history.push({id:question.id,identity:state.active.identity,at:new Date().toISOString(),correct:state.active.correct});
  // Seen identities are never evicted, refilled or reset by this feature.
  save(teacher,state);return state;
 });
}
