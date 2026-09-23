// Teacher-designed extension; these are hypothetical classroom-model forces, not real product weights.
export const OBJECTS = Object.freeze([
  {id:'ball', name:'A · 공', shape:'ball', force:4, group:'pair'},
  {id:'metal', name:'B · 금속 추', shape:'weight', force:12, group:'pair'},
  {id:'pouch-c', name:'C · 주머니', shape:'case', force:8, group:'triple'},
  {id:'pouch-d', name:'D · 주머니', shape:'case', force:10, group:'triple'},
  {id:'pouch-e', name:'E · 주머니', shape:'case', force:9, group:'triple'}
]);
export const METHOD_ERROR = '실험 방법에 오류가 있어요. 과정을 다시 점검해 보세요.';
// Internal evidence is not rendered in student feedback. Only simulated/observed actions are evaluated.
export function inspectAttempt(objectId, snapshot, entry) {
  const object = OBJECTS.find(o=>o.id===objectId);
  const codes=[];
  if(!object || !Number.isFinite(snapshot.force) || Math.abs(snapshot.force-object.force)>.01) codes.push('load');
  if(!Number.isFinite(snapshot.zero) || Math.abs(snapshot.zero)>.01) codes.push('reference');
  if(snapshot.settled!==true) codes.push('motion');
  if(!Number.isFinite(snapshot.expectedEye) || !Number.isFinite(snapshot.reading) || Math.abs(snapshot.expectedEye-snapshot.reading)>.30) codes.push('view');
  if(codes.length) return {valid:false,category:'method',codes,message:METHOD_ERROR};
  if(entry===null || entry==='' || !Number.isFinite(Number(entry))) return {valid:false,category:'entry',codes:[],message:'읽은 눈금과 단위를 기록해 보세요.'};
  if(Math.abs(Number(entry)-snapshot.reading)>.35) return {valid:false,category:'reading',codes:[],message:'선택한 눈금과 적은 값을 다시 비교해 보세요.'};
  return {valid:true,category:'valid',codes:[],message:'이 모형에서 점검한 실험 방법에 오류가 없어요. 기록을 모아 예상과 비교해 보세요.'};
}
export function comparePredictions(predictions, records) {
  if(OBJECTS.some(o=>!records[o.id]?.valid)) return null;
  const pair=OBJECTS.filter(o=>o.group==='pair').sort((a,b)=>records[b.id].value-records[a.id].value)[0].id;
  const order=OBJECTS.filter(o=>o.group==='triple').sort((a,b)=>records[a.id].value-records[b.id].value).map(o=>o.id);
  return {pair,order,pairMatches:predictions.pair===pair,orderMatches:JSON.stringify(predictions.order)===JSON.stringify(order)};
}
