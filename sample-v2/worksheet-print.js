import {esc} from './graphics.js';

const titles={remedy:'테스트 연계 유사문제 워크지',advanced:'테스트 연계 심화 워크지'};
const marks=['①','②','③','④','⑤'];

// 공개용 인쇄 지면에는 오직 발문·보기·답안 공간만 복사한다. 정답·해설·진단 로그는 넣지 않는다.
export function buildWorksheetDocument({lesson,kind,items}){
 if(![1,2].includes(lesson)||!Object.hasOwn(titles,kind)||!Array.isArray(items)||!items.length)throw new TypeError('워크지 종류·차시·문항을 확인해 주세요.');
 const seen=new Set();
 const questions=items.map((item,index)=>{
  const key=item.variantKey||item.id;
  const itemLesson=item.lesson??(item.m?(/^M0[1-4]$/.test(item.m)?1:/^M0[5-9]$/.test(item.m)?2:undefined):undefined);
  if(itemLesson===undefined||itemLesson!==lesson)throw new TypeError('다른 차시의 문항을 섞을 수 없습니다.');
  if(!key||seen.has(key))throw new TypeError('워크지에 같은 변형이 중복됐습니다.');
  seen.add(key);
  const prompt=item.q||item.prompt;
  if(typeof prompt!=='string'||!prompt.trim())throw new TypeError('워크지 발문이 없습니다.');
  const options=Array.isArray(item.options)?`<ol class="choices">${item.options.map((value,i)=>`<li><span>${marks[i]||i+1}</span>${esc(value)}</li>`).join('')}</ol>`:'';
  const answer=item.type==='explanation'?'<p class="reason-label">내 설명</p><div class="writing-lines"><i></i><i></i><i></i><i></i></div>':item.type==='number'?`<p class="reason-label">풀이</p><div class="writing-lines short"><i></i><i></i></div><p class="answer-line">답 <span></span> ${esc(item.unit||'')}</p>`:'<p class="answer-line">내가 고른 답 <span></span></p><p class="reason-label">고른 까닭</p><div class="writing-lines short"><i></i><i></i></div>';
  return `<section class="question"><h2>${String(index+1).padStart(2,'0')}</h2><div><p class="prompt">${esc(prompt)}</p>${options}${answer}</div></section>`;
 }).join('');
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${titles[kind]} · ${lesson}차시</title><style>
@page{size:A4;margin:16mm 16mm 18mm}*{box-sizing:border-box}body{margin:0;color:#183329;font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif;font-size:11pt;line-height:1.55}header{border-top:9px solid #287b50;border-bottom:2px solid #287b50;padding:10mm 0 5mm;margin-bottom:7mm}header small{display:block;font-size:9pt;color:#41755a;font-weight:700}h1{font-size:22pt;margin:2mm 0 0}header p{margin:3mm 0 0;font-size:9pt;color:#50675a}.identity{display:flex;gap:14mm;border-bottom:1px solid #b7cabc;padding-bottom:6mm;margin-bottom:5mm}.identity span{min-width:55mm}.identity b{font-weight:400;border-bottom:1px solid #9cb5a4;display:inline-block;width:38mm}.question{display:grid;grid-template-columns:11mm 1fr;gap:3mm;padding:6mm 0;border-bottom:1px solid #d7e3da;break-inside:avoid}.question h2{font-size:16pt;color:#257148;margin:0}.prompt{font-weight:700;margin:0 0 3mm}.choices{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:2mm 5mm}.choices li{display:flex;gap:2mm;align-items:start}.choices li span{font-weight:800;color:#287b50}.answer-line{margin:5mm 0 0}.answer-line span{display:inline-block;border-bottom:1px solid #60836d;min-width:32mm}.reason-label{font-size:9pt;color:#416a51;margin:5mm 0 0;font-weight:700}.writing-lines{margin-top:1mm}.writing-lines i{display:block;height:9mm;border-bottom:1px solid #bdcec2}footer{font-size:8pt;color:#66786c;margin-top:8mm;border-top:1px solid #b7cabc;padding-top:3mm}button{display:none}@media screen{body{max-width:210mm;margin:auto;padding:16mm;background:#fff;box-shadow:0 0 25px #ccd8ce}}
</style></head><body><header><small>MSG 초·과·심 · ${lesson}차시 Daily Test 이후</small><h1>${titles[kind]}</h1><p>교재 테스트 결과와 연결한 추가 연습입니다. 독립 문제은행이나 원본 단원평가가 아닙니다.</p></header><div class="identity"><span>이름 <b></b></span><span>날짜 <b></b></span></div><main>${questions}</main><footer>먼저 책과 이 워크지에 직접 풀어 보세요. 정답과 해설은 인쇄본에 포함되지 않습니다.</footer></body></html>`;
}

export function openWorksheetPrint(args){
 const html=buildWorksheetDocument(args);
 const popup=window.open('','_blank');
 if(!popup)return false;
 popup.opener=null;
 popup.document.open();popup.document.write(html);popup.document.close();
 popup.focus();
 setTimeout(()=>popup.print(),150);
 return true;
}
