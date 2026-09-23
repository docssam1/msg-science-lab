// Additional teacher-requested inquiry. These are fictional teaching objects.
export const objectSets = {
  pair: [{id:'foam',name:'스펀지 공',shape:'foam'}, {id:'book',name:'두꺼운 책',shape:'book'}],
  trio: [{id:'A',name:'필통 A',shape:'pouch-a'}, {id:'B',name:'필통 B',shape:'pouch-b'}, {id:'C',name:'필통 C',shape:'pouch-c'}]
};
export const objects = [...objectSets.pair,...objectSets.trio];
const forces = {foam:4,book:20,A:12,B:10,C:14};
export function forceFor(id){if(!(id in forces))throw new Error('Unknown teaching object');return forces[id];}
export function initialInquiry(){return {version:1,phase:'pair',pair:null,why:'',prediction:['A','C','B'],lockedPrediction:null,rankWhy:'',zero:2,round:1,roundNotes:[],records:[],events:[],reviewed:false,methodNote:'',conclusion:'',finished:false};}
export function isPermutation(ids){return Array.isArray(ids)&&ids.length===3&&new Set(ids).size===3&&ids.every(x=>['A','B','C'].includes(x));}
export function makeRecord(id,entered,state,round,now=Date.now()){
  if(!objects.some(o=>o.id===id)||!Number.isFinite(entered)||entered<0||entered>30)throw new Error('Invalid observation');
  return {id,entered,round,time:now,zero:state.zero,settled:state.settled,
    eye:state.eye,viewAligned:state.viewAligned,viewMoving:state.viewMoving,
    observed:state.apparentNow,force:state.force};
}
export function latestRecords(records,round){const m=new Map();for(const r of records)if(r.round===round)m.set(r.id,r);return m;}
export function auditRecord(r){const issues=[];
  if(Math.abs(r.zero)>.05)issues.push('initial-reference');
  if(!r.settled)issues.push('moving-indicator');
  if(!r.viewAligned||r.viewMoving)issues.push('viewpoint');
  if(Math.abs(r.entered-r.observed)>.8)issues.push('reading-or-recording');
  return issues;
}
export function inspectRound(s){const m=latestRecords(s.records,s.round),missing=objects.filter(o=>!m.has(o.id)).map(o=>o.id);
  const issues=[...m.values()].flatMap(r=>auditRecord(r).map(code=>({id:r.id,code})));
  for(const r of m.values()){const last=s.events.filter(e=>e.round===s.round&&e.type==='adjust'&&e.time<=r.time).at(-1);if(last?.force>0)issues.push({id:r.id,code:'loaded-adjustment'});}
  return {missing,issues,complete:missing.length===0,valid:missing.length===0&&issues.length===0};
}
export function measuredOrder(s){const m=latestRecords(s.records,s.round);if(!inspectRound(s).valid)return null;
  return objectSets.trio.map(o=>o.id).sort((a,b)=>m.get(a).entered-m.get(b).entered);
}
export const genericMethodFeedback='실험 방법에 점검할 부분이 있어요. 준비부터 기록까지 내가 한 순서를 돌아보고, 방법을 바꾸어 다시 측정해 보세요.';
