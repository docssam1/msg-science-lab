export const methodErrorText='실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?';

export function createZeroGate(existing={}){
 const state={revision:existing.revision||0,confirmedRevision:-1,sequence:existing.sequence||0,events:[...(existing.events||[])],firstAttempt:existing.firstAttempt||null};
 function log(type,details={}){const event={eventId:`p5-${++state.sequence}`,sequence:state.sequence,type,pageId:'P5',timestamp:Date.now(),calibrationRevision:state.revision,confirmedRevision:state.confirmedRevision,...details};state.events.push(event);return event;}
 return {
  state,
  adjust(offset,loaded=false){state.revision++;state.confirmedRevision=-1;return log(loaded?'loaded-adjustment-rejected':'adjust-empty',{zeroOffsetTicks:Math.round(offset*10),forceApplied:false});},
  confirm(offset,loaded=false){if(loaded||Math.round(offset*10)!==0)return {accepted:false,event:log('confirm-rejected',{zeroOffsetTicks:Math.round(offset*10),forceApplied:false})};state.confirmedRevision=state.revision;return {accepted:true,event:log('confirm-empty',{zeroOffsetTicks:0,forceApplied:false})};},
  attach(objectId,offset,loaded=false){const valid=!loaded&&state.confirmedRevision===state.revision&&Math.round(offset*10)===0;const event=log(valid?'attach-accepted':'attach-rejected',{objectId,zeroOffsetTicks:Math.round(offset*10),forceApplied:valid,attemptId:`attempt-${state.sequence+1}`,previousAttemptId:state.firstAttempt?.attemptId||null});if(!state.firstAttempt)state.firstAttempt=Object.freeze({...event});if(valid)state.confirmedRevision=-1;return {accepted:valid,event,message:valid?'':methodErrorText};},
  remove(){state.confirmedRevision=-1;return log('remove-object',{forceApplied:false});},
  reflect(text){return log('self-check',{reflection:text,forceApplied:false});}
 };
}
