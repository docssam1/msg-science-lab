// MSG 창작 심화 미니세트. 원본 단원평가가 아니며, 가상 자료는 실측값이 아니다.
// 서로 다른 답안 형식의 첫 시도만 저장한다. 개방형은 자동 점수로 환산하지 않는다.
export const advancedItems = Object.freeze([
  Object.freeze({id:'ad01',variantKey:'extension:two-springs-b-30',lesson:2,type:'number',sourcePage:17,
    prompt:'가상 실험 A에서는 10 g마다 2 cm, 가상 실험 B에서는 10 g마다 3 cm 늘어났어요. 같은 조건에서 B에 30 g을 매달면 늘어난 길이는 몇 cm일까요?',
    answer:9,unit:'cm',explanation:'B의 자료만 씁니다. 30 g은 10 g의 3배이므로 3 cm × 3 = 9 cm예요. 용수철이 탄성 범위에서 일정하게 늘어난다는 이 문제의 가정입니다.'}),
  Object.freeze({id:'ad02',variantKey:'extension:one-variable-material',lesson:2,type:'choice',sourcePage:19,
    prompt:'용수철의 재질만 바꿨을 때 늘어난 길이가 달라지는지 비교하려고 해요. 같은 추를 쓰는 두 용수철의 조건으로 가장 알맞은 것은?',
    options:['재질·철사 굵기·코일 지름을 모두 다르게 한다.','재질만 다르게 하고 철사 굵기와 코일 지름은 같게 한다.','철사 굵기만 다르게 하고 재질과 코일 지름은 같게 한다.','재질과 철사 굵기를 다르게 하고 코일 지름만 같게 한다.'],
    answer:1,explanation:'재질의 영향만 알아보려면 재질 이외의 조건과 매다는 추를 같게 해야 해요.'}),
  Object.freeze({id:'ad03',variantKey:'extension:fair-weighing-explanation',lesson:1,type:'explanation',sourcePage:10,
    prompt:'겉보기에 큰 물건 A가 작은 물건 B보다 꼭 무거울까요? 저울이 필요한 까닭과, 두 물건을 공정하게 재기 위한 과정을 내 말로 설명해 보세요.',
    rubric:['크기만으로 무게를 단정하지 않는다.','각 측정 전에 빈 저울의 기준을 확인한다.','각 물건을 매단 뒤 표시자가 멈추고 눈높이를 맞춰 읽는다.'],
    explanation:'예시: 겉보기 크기만으로 무게를 알 수 없어요. 빈 저울의 표시가 0인지 확인하고 각 물건을 매단 뒤 표시자가 멈추면 같은 높이에서 눈금을 읽어 비교해요. 실제 물건의 무게는 이 문제에서 정하지 않았어요.'}),
]);

export function availableAdvanced(log,lesson){
  if(!Array.isArray(log))throw new TypeError('심화 문항 선택에는 첫 시도 기록이 필요합니다.');
  if(lesson!==undefined&&![1,2].includes(lesson))throw new TypeError('차시를 확인해 주세요.');
  const byId=new Map(advancedItems.map(item=>[item.id,item.variantKey]));
  const used=new Set(log.map(row=>row.variantKey||byId.get(row.id)||row.id));
  const emitted=new Set();
  return advancedItems.filter(item=>{if((lesson!==undefined&&item.lesson!==lesson)||used.has(item.variantKey)||emitted.has(item.variantKey))return false;emitted.add(item.variantKey);return true;});
}

export function advancedRecord(id,response){
  const item=advancedItems.find(entry=>entry.id===id);
  if(!item)return null;
  const value=String(response??'').trim();
  if(!value||value.length>500)return null;
  let status='review';
  if(item.type==='number'){
    if(!/^\d+(?:\.\d+)?$/.test(value))return null;
    status=Number(value)===item.answer?'correct':'wrong';
  }else if(item.type==='choice'){
    if(!/^[0-3]$/.test(value))return null;
    status=Number(value)===item.answer?'correct':'wrong';
  }
  return {id:item.id,variantKey:item.variantKey,response:value,status,at:Date.now()};
}
