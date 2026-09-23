// Authored extension questions. They never replace the original 18 questions.
// Canonical content fingerprints are insensitive to option order or item ID.
import {esc} from './graphics.js';
export const concepts={
 parts:['부품의 역할','parts','눈금을 가리키는 표시자와 물체를 매다는 고리를 구별해요.'],
 zero:['영점 확인 순서','zero','아무것도 매달지 않은 상태에서 먼저 0에 맞춰요.'],
 eye:['눈높이와 시차','eye','표시자의 윗부분과 같은 높이에서 읽어요. 물체와 시선의 변화는 달라요.'],
 extend:['전체 길이와 늘어난 길이','measure','늘어난 길이는 힘을 준 뒤 전체 길이에서 원래 길이를 뺀 값이에요.'],
 elastic:['탄성의 뜻','elastic','힘을 없앴을 때 원래 모양으로 돌아가려는 성질을 확인해요.'],
 graph:['자료와 그래프','graph','가로축과 세로축, 원점, 이번 문제의 표를 각각 확인해요.'],
 material:['비교 조건','tools','재질·철사 굵기·코일 지름과 색깔을 구별하고 다른 조건은 같게 해요.'],
 force:['정지 상태의 힘','target','일정하게 늘어난 채 정지한 상태에서 잡아당기는 힘과 탄성력은 크기가 같아요.']
};
const item=(id,c,p,o,a,why)=>({id,c,p,o,a,why});
export const bank=[
 item('p1','parts','물체를 저울 아래쪽에 매달려고 합니다. 사용할 부분은?',['고리','손잡이','눈금'],0,'고리는 물체를 매다는 부분이에요.'),
 item('p2','parts','저울을 스탠드에 고정할 부분은?',['표시자','손잡이','눈금'],1,'위쪽 손잡이로 저울을 고정해요.'),
 item('p3','parts','눈금을 직접 가리키는 부분을 무엇이라고 하나요?',['용수철','표시자','고리'],1,'표시자가 가리키는 눈금을 읽어요.'),
 item('p4','parts','물체를 달았을 때 늘어나는 저울 속 부분은?',['손잡이','눈금판','용수철'],2,'용수철의 늘어나는 성질을 이용해요.'),
 item('z1','zero','빈 저울이 2 N을 가리킵니다. 다음 행동은?',['물체부터 걸기','빈 상태에서 0에 맞추기','2 N을 답으로 쓰기'],1,'물체를 달기 전에 영점을 맞춰요.'),
 item('z2','zero','영점을 맞출 때 고리에 있어야 하는 것은?',['재려는 물체','아무것도 없음','가장 무거운 추'],1,'물체가 없는 저울의 기준을 맞춥니다.'),
 item('z3','zero','어떤 순서로 측정하나요?',['영점→매달기→안정 후 읽기','매달기→영점→읽기','읽기→매달기→영점'],0,'측정의 기준을 먼저 맞춥니다.'),
 item('z4','zero','새 물체를 달기 전 빈 저울을 보니 0 N입니다. 다음은?',['물체를 매단다','손잡이에 물체를 올린다','무조건 4 N으로 바꾼다'],0,'영점을 확인한 뒤 고리에 물체를 매달아요.'),
 item('e1','eye','눈높이를 바꾸는 실험에서 그대로 유지할 것은?',['고리에 매단 물체','보는 위치','눈의 높이'],0,'물체는 그대로 두고 시선만 바꿔요.'),
 item('e2','eye','올바르게 읽을 때 눈과 맞출 부분은?',['저울 손잡이','표시자의 윗부분','고리 맨 아래'],1,'표시자의 윗부분과 눈높이를 수평으로 맞춰요.'),
 item('e3','eye','표시자가 아직 흔들립니다. 지금 할 일은?',['아무 값이나 기록','멈출 때까지 관찰','영점을 다시 돌림'],1,'흔들림이 멈춘 뒤 눈높이를 맞춰 읽어요.'),
 item('e4','eye','위에서 봤더니 값이 달라 보입니다. 물체를 바꾸지 않았다면?',['물체의 힘이 변한 것이다','시선 때문에 달라 보일 수 있다','용수철이 사라진 것이다'],1,'시차와 물체의 실제 변화를 구별해요.'),
 item('x1','extend','원래 5 cm였던 용수철이 8 cm가 되었습니다. 늘어난 길이는?',['3 cm','8 cm','13 cm'],0,'8−5=3 cm예요.'),
 item('x2','extend','원래 4 cm, 매단 뒤 10 cm입니다. 늘어난 길이는?',['14 cm','6 cm','10 cm'],1,'10−4=6 cm예요.'),
 item('x3','extend','같은 용수철에 같은 추를 하나씩 더 달 때 본문 실험 결과는?',['일정한 길이만큼 더 늘어난다','늘어난 길이가 0으로 된다','색깔에 따라 매번 달라진다'],0,'같은 추의 무게만큼 힘이 일정하게 더해져요.'),
 item('x4','extend','원래 7 cm, 늘어난 길이 6 cm입니다. 전체 길이는?',['1 cm','6 cm','13 cm'],2,'전체 길이=원래 길이+늘어난 길이예요.'),
 item('a1','elastic','탄성을 확인하려면 힘을 준 뒤 무엇을 관찰하나요?',['힘을 없애면 돌아오는지','색깔이 바뀌는지','이름이 길어지는지'],0,'원래 모양으로 돌아가려는 성질을 살펴요.'),
 item('a2','elastic','힘을 없애도 새 모양이 그대로 남습니다. 탄성의 설명과 같나요?',['같다','다르다'],1,'탄성은 원래 모양으로 돌아가려는 성질이에요.'),
 item('a3','elastic','같은 용수철을 조금 눌렀다가 놓으면 어떤 변화가 예상되나요?',['원래 길이로 돌아가려 한다','계속 짧아지기만 한다','무게가 없어진다'],0,'측정·탄성 범위 안에서 생각해요.'),
 item('a4','elastic','탄성을 이용하는 것으로 본책에서 든 예는?',['고무줄','색종이의 색','눈금의 숫자'],0,'고무줄·용수철·고무공·태엽이 제시돼 있어요.'),
 item('g1','graph','이 표에서 10 g→4 cm입니다. 10 g의 점을 찍을 높이는?',['3 cm','4 cm','10 cm'],1,'지금 주어진 표를 사용해요. 앞의 3 cm와 섞지 않아요.'),
 item('g2','graph','세로축이 ‘늘어난 길이’일 때 물체를 매달지 않은 값은?',['원래 길이','0','언제나 5'],1,'아직 늘어나지 않았으므로 0이에요.'),
 item('g3','graph','표: 10 g→3 cm, 20 g→6 cm, 30 g→9 cm. (20, 6)은 무슨 뜻인가요?',['20 cm일 때 6 g','20 g일 때 6 cm 늘어남','전체 길이 26 cm'],1,'가로축이 무게, 세로축이 늘어난 길이예요.'),
 item('g4','graph','10 g→4 cm, 20 g→8 cm일 때 같은 비례 관계의 30 g 값은?',['9 cm','10 cm','12 cm'],2,'추의 무게가 세 배이면 늘어난 길이도 세 배예요.'),
 item('m1','material','색깔만 다르게 칠한 같은 용수철을 비교했습니다. 탄성력 변화의 근거가 충분한가요?',['충분하다','색깔만으로는 부족하다'],1,'재질이나 철사 굵기 같은 조건을 확인해요.'),
 item('m2','material','철사 굵기의 영향을 보려면 다른 조건은?',['가능하면 같게','모두 다르게','관찰하지 않기'],0,'한 번에 하나의 조건만 바꿔요.'),
 item('m3','material','교재가 제시한 용수철의 변화 요인이 아닌 것은?',['재질','철사 굵기','이름표의 색깔'],2,'교재에는 재질·굵기·지름이 제시돼 있어요.'),
 item('m4','material','두 용수철의 굵기를 비교할 때 함께 확인할 것은?',['변형량과 다른 조건','이름의 글자 수','놓인 책의 색'],0,'탄성력을 비교하려면 변형량 같은 조건도 맞춰요.'),
 item('f1','force','용수철을 당긴 채 움직이지 않고 유지합니다. 두 힘의 크기는?',['같다','잡아당기는 힘만 있다','탄성력만 있다'],0,'정지 상태에서는 두 힘의 크기가 같아요.'),
 item('f2','force','당긴 용수철에 힘을 놓았을 때 원래 모양으로 돌아가려는 힘은?',['탄성력','눈금','손잡이'],0,'용수철이 원래 모양으로 돌아가려 해요.'),
 item('f3','force','두 힘의 크기가 같다고 판단한 조건은?',['늘어난 채 정지해 있다','빠르게 흔들린다','물체가 떨어진다'],0,'정지한 상태와 진동 중인 상태는 구별해요.'),
 item('f4','force','아래로 당겨 정지시킨 용수철의 탄성력 방향은?',['아래로만','위로 되돌아가는 방향','표시자 글자 방향'],1,'변형을 되돌리는 방향으로 작용해요.')
];
export function fingerprint(q){return JSON.stringify([q.c,q.p.normalize('NFKC').replace(/\s+/g,''),q.o.map(t=>t.normalize('NFKC').replace(/\s+/g,'')).sort(),q.o[q.a]]);}
export function takeUnused(concept,used){return bank.find(q=>q.c===concept&&!used.has(fingerprint(q)))||null;}
export function mountReview(host,concept,ctx){
 const [title,lab,fix]=concepts[concept]||concepts.parts;
 let stopped=false,stage=0,right=0;
 const saved=ctx.load('review-used',null);
 let used;
 try{used=new Set(saved||[]);}catch{used=null;}
 function start(){
  if(!ctx.writable||!used){host.innerHTML='<div class="concept-review"><h3>기록을 저장할 수 없어 새 변형 선택을 멈췄습니다.</h3><p>중복 방지 이력을 보존할 수 없습니다. 브라우저의 저장 권한을 확인해 주세요. 원본 문제와 해설은 계속 사용할 수 있습니다.</p></div>';return;}
  const q=takeUnused(concept,used);
  if(!q){host.innerHTML=`<div class="concept-review"><h3>${title} · 준비된 변형 완료</h3><p>이 기기에서 아직 사용하지 않은 변형을 모두 확인했습니다. 같은 문제를 다시 뽑지 않습니다.</p><button data-lab>관련 실험 다시 보기</button></div>`;host.querySelector('[data-lab]').onclick=()=>ctx.open(lab);return;}
  used.add(fingerprint(q));if(!ctx.save('review-used',[...used])){used=null;start();return;}
  host.innerHTML=`<div class="concept-review"><div class="eyebrow">원본과 구분한 추가 연습 · ${['이유 확인','유사문제로 확인','다시 확인'][stage]}</div><h3>${title}</h3><p>한 번 틀렸다는 이유만으로 오개념을 단정하지 않습니다.</p><div class="review-question">${q.p}</div><div class="review-options">${q.o.map((x,i)=>`<button data-rx="${i}">${esc(x)}</button>`).join('')}</div><div data-rf></div><button data-rnext hidden>${stage<2?'다음 확인 문제':'확인 결과 보기'}</button><button data-lab>관련 실험</button></div>`;
  let answered=false;
  host.querySelectorAll('[data-rx]').forEach(b=>b.onclick=()=>{if(answered||stopped)return;answered=true;const ok=+b.dataset.rx===q.a;if(ok)right++;host.querySelector('[data-rf]').innerHTML=`<p><b>${ok?'확인했어요':'다시 살펴봐요'}</b> · ${esc(q.why)}</p>`;host.querySelectorAll('[data-rx]').forEach(x=>x.disabled=true);host.querySelector('[data-rnext]').hidden=false;ctx.save('review-last',{concept,id:q.id,correct:ok,at:new Date().toISOString()});});
  host.querySelector('[data-lab]').onclick=()=>ctx.open(lab);
  host.querySelector('[data-rnext]').onclick=()=>{if(stage<2){stage++;start();}else{host.innerHTML=`<div class="concept-review"><h3>세 번의 확인을 마쳤습니다.</h3><p>${right} / 3 확인 문제 정답</p><p>${right===3?'이번 확인에서는 개념을 바르게 적용했습니다.':'다시 확인할 개념: '+fix}</p><p>이 결과는 자동 확정 진단이 아닙니다. 학생의 설명도 함께 들어 주세요.</p><button data-lab>관련 실험 돌아보기</button></div>`;host.querySelector('[data-lab]').onclick=()=>ctx.open(lab);}};
 }
 start();return {destroy(){stopped=true;}};
}
