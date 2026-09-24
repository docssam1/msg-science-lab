// Student print sequence. Source pages and assessment data stay in content.js.
import {pages,q1,q2,questionHTML} from './content.js';
import {inquiryObjects,objectPhoto} from './everyday-objects.js';
import {scaleArt,eyeArt,springArt,graphSVG,toolIcon} from './graphics.js';
import {toolRows} from './content.js';

const byId=Object.fromEntries(pages.map(page=>[page.id,page]));
const base=(id,printId,overrides={})=>({...byId[id],printId,...overrides});
const questions=(items,group)=>`<div class="test-grid">${items.map(q=>questionHTML(q,{print:true})).join('')}</div>${group?`<button class="page-action" data-grade="${group}">답 제출하고 확인하기</button>`:''}`;
const objects=()=>`<div class="print-objects lesson-object-photos">${inquiryObjects.map(o=>`<figure>${objectPhoto(o)}<figcaption>${o.name}</figcaption></figure>`).join('')}</div>`;
const lines=n=>`<div class="write-lines">${'<i></i>'.repeat(n)}</div>`;
const act=(kind,label)=>`<button class="page-action" data-action="${kind}">${label}</button>`;
const weightDiagram=(g,cm)=>{const end=115+cm*12;const zig=Array.from({length:16},(_,i)=>`L${i%2?108:72} ${48+i*(end-58)/16}`).join(' ');return `<svg viewBox="0 0 180 300" role="img" aria-label="${g}그램 추에서 ${cm}센티미터 늘어난 용수철 개념 도해"><path d="M35 20h120" stroke="#294d60" stroke-width="6"/><path d="M90 24v16 ${zig} L90 ${end}" fill="none" stroke="#477b87" stroke-width="3"/><path d="M32 115h110" stroke="#a3b3b7" stroke-width="2" stroke-dasharray="4 4"/><path d="M38 115v${end-115}" stroke="#bd6550" stroke-width="2"/><path d="M31 115h14M31 ${end}h14" stroke="#bd6550" stroke-width="2"/><rect x="65" y="${end}" width="50" height="35" rx="4" fill="#ae8754"/><text x="90" y="${end+24}" text-anchor="middle" font-size="18" fill="white">${g} g</text><text x="35" y="${end+54}" text-anchor="middle" font-size="16">${cm} cm</text></svg>`;};

export const studentPrintPages=[
 base('l1-structure','P1',{title:'용수철저울의 구조',lead:'여섯 부분을 그림에서 찾아보세요.',body:`<figure class="lesson-hero"><img src="./../assets/ch01/source-structure.png" alt="원본 교재의 용수철저울 구조 그림"><figcaption>원본 교재의 용수철저울 구조 그림</figcaption></figure><div class="part-labels">손잡이 · 영점조절나사 · 용수철 · 표시자 · 눈금 · 고리</div>`}),
 base('l1-use','P2',{title:'영점을 맞추고 사용해요',lead:'빈 저울 → 0 확인 → 매달기 → 멈춘 뒤 읽기',body:`<div class="step-cards lesson-four">${[['물체가 없어요',0],['0을 확인해요',0],['물체를 걸어요',12],['멈춘 뒤 읽어요',12]].map(([t,n],i)=>`<figure><b>${i+1}</b>${scaleArt({force:n,labels:false})}<figcaption>${t}</figcaption></figure>`).join('')}</div><p class="short-check">물체를 걸기 전 기준을 확인했나요?</p>${act('zero','빈 저울의 기준 확인하기')}`}),
 base('l1-inquiry','P3',{title:'저울은 왜 필요할까요?',body:`<h2>크기와 모양만으로 무게를 비교할 수 있을까요?</h2><div class="p3-objects">${objects()}</div><p>신발 한 짝 · 사과 한 개 · 귤 두 개 한 묶음 · 휴대폰 한 개 · 필기구가 든 필통</p>${lines(2)}`}),
 base('l1-inquiry','P4',{title:'어느 것이 더 무거울까요?',body:`${objects()}<h2>가벼울 것 같은 순서대로 다섯 물건을 모두 쓰세요.</h2><div class="prediction-slots">${Array.from({length:5},(_,i)=>`<div>${i+1}<i></i></div>`).join('')}</div><p>□ 순서를 확신하기 어려워요.</p><h2>그렇게 생각한 까닭은 무엇인가요?</h2>${lines(3)}`}),
 base('l1-inquiry-record','P5',{title:'직접 측정해 봐요',body:`<h2>물체를 걸기 전 기준을 확인했나요?</h2><p>□ 빈 저울을 살펴보았습니다.</p><div class="p5-visual"><figure>${scaleArt({force:0,labels:false})}<figcaption>빈 저울의 표시부터 살펴보세요.</figcaption></figure>${objects()}</div><table class="book-table inquiry-log"><thead><tr><th>물건</th><th>처음 측정 (N)</th><th>다시 측정 (N)</th></tr></thead><tbody>${inquiryObjects.map(o=>`<tr><th>${o.name}</th><td></td><td></td></tr>`).join('')}</tbody></table><h2>예상과 측정은 어떻게 달랐나요?</h2>${lines(2)}`}),
 base('l1-eye','P6',{title:'눈금은 어떻게 읽을까요?',lead:'위 · 정면 · 아래 시점을 비교하세요.',body:`<figure class="lesson-hero eye-hero">${eyeArt()}<figcaption>표시자의 윗부분과 눈높이를 맞추세요.</figcaption></figure><h2>어느 눈높이에서 읽어야 할까요?</h2>${lines(3)}${act('eye','세 시점 비교하기')}`}),
 base('l1-scales','P7',{title:'물건에 맞는 저울을 골라요',lead:'어디에 놓거나 매달까요?',body:`<div class="scale-photo-three">${[['scale-spring','용수철저울','작은 물체를 매달아요.'],['scale-table','앉은뱅이저울','위에 올려놓아요.'],['scale-person','체중계','몸의 무게를 재요.']].map(([file,name,caption])=>`<figure><img src="./photos/${file}.jpg" alt="${name} 실사 사진"><figcaption><b>${name}</b><small>${caption}</small></figcaption></figure>`).join('')}</div>${act('types','알맞은 저울 고르기')}`}),
 base('l1-past','P8',{title:'용수철의 과거',lead:'옛 도구에는 어떤 모양이 있었을까요?',body:`<div class="history-photos"><figure><img src="./art/historical-engraving.png" alt="용수철의 과거를 보여 주는 역사 기록 그림"><figcaption>역사 기록 그림</figcaption></figure><figure>${springArt()}<figcaption>판처럼 휘는 모양 · 개념 도해</figcaption></figure></div><h2>두 모양은 힘을 없애면 어떻게 될까요?</h2>${lines(3)}${act('history','과거 자료 살펴보기')}`}),
 base('l1-watch','P9',{title:'시계 속 용수철',lead:'태엽이 움직이는 장면을 찾아보세요.',body:`<figure class="lesson-hero watch-hero"><img src="./media/watch-poster.jpg" alt="1949년 시계 기록영상 장면"><figcaption>1949년 시계 기록영상 · 낮은 해상도의 원본을 그대로 표시</figcaption></figure>${act('watch','기존 기록영상 보기')}`}),
 base('l1-future','P10',{title:'용수철의 미래',lead:'새 재료와 쓰임을 살펴보세요.',body:`<div class="future-visual">${[['작은 코일','작은 장치 속 움직임'],['새 재료','재료의 성질 연구'],['4D 프린팅','시간에 따른 모양 변화']].map(([t,d])=>`<section>${springArt()}<h2>${t}</h2><p>${d}</p></section>`).join('')}</div><p class="lesson-caption">미래 전망을 설명하는 개념 도해입니다. 실제 제품 사진이 아닙니다.</p>${act('future','교재의 미래 이야기 보기')}`}),
 base('l1-test-a','P11',{body:questions(q1.slice(0,3),'p11')}),
 base('l1-test-b','P12',{body:questions(q1.slice(3,6),'p12')}),
 base('l2-elastic','P13',{title:'힘을 주면 어떻게 변할까요?',lead:'관찰한 뒤 움직임을 기록하세요.',body:`<div class="lesson-three">${[['잡아당기기','pull'],['누르기','compress'],['놓기','pull']].map(([t,m])=>`<figure>${springArt({mode:m})}<figcaption>${t}</figcaption></figure>`).join('')}</div><h2>손을 놓으면 어떤 일이 일어날까요?</h2>${lines(4)}`}),
 base('l2-elastic','P14',{title:'다시 돌아오는 성질',lead:'관찰한 움직임에 이름을 붙여 보세요.',body:`<div class="lesson-large-art">${springArt({large:true})}</div><div class="definition"><b>탄성</b><p>힘을 없애면 원래 모양으로 돌아가려는 성질</p></div><h2>다른 물체에서도 볼 수 있을까요?</h2>${lines(3)}`}),
 base('l2-compress','P15',{title:'전체 길이와 변한 길이',lead:'두 길이를 구분해 표시하세요.',body:`<div class="lesson-large-art">${springArt({mode:'compress',large:true})}</div><div class="length-pair"><section><b>전체 길이</b><p>용수철의 양 끝 사이</p></section><section><b>줄어든 길이</b><p>처음보다 짧아진 만큼</p></section></div><h2>힘을 더 크게 주면 어느 길이가 달라질까요?</h2>${lines(3)}`}),
 base('l2-measure','P16',{title:'추를 하나씩 더해 측정해요',lead:'같은 용수철의 10 · 20 · 30 g 결과를 기록하세요.',body:`<div class="lesson-three weight-trio">${[10,20,30].map((g,i)=>`<figure>${weightDiagram(g,3*(i+1))}<figcaption>${g} g · ${3*(i+1)} cm</figcaption></figure>`).join('')}</div><table class="book-table"><thead><tr><th>추의 무게 (g)</th><th>10</th><th>20</th><th>30</th></tr></thead><tbody><tr><th>늘어난 길이 (cm)</th><td>3</td><td>6</td><td>9</td></tr></tbody></table><p>본문 실험 A · 그림은 개념 도해입니다.</p>${lines(3)}`}),
 base('l2-graph','P17',{title:'표를 그래프로 나타내요',lead:'본문 실험 A의 점을 직접 옮겨 보세요.',body:`<table class="book-table"><thead><tr><th>추의 무게 (g)</th><th>10</th><th>20</th><th>30</th></tr></thead><tbody><tr><th>늘어난 길이 (cm)</th><td>3</td><td>6</td><td>9</td></tr></tbody></table><div class="lesson-graph">${graphSVG({points:[],max:9,step:3,labels:true})}</div><p>가로축: 추의 무게 (g) · 세로축: 늘어난 길이 (cm)</p><aside class="extension"><b>확장 탐구</b> 같은 관계가 이어진다고 가정하면, 40 g에서는 얼마나 늘어날까요?</aside>`}),
 base('l2-tools','P18',{title:'용수철이 달라지면?',lead:'한 번에 한 조건만 바꿔 비교하세요.',action:'factors',body:`<div class="lesson-three factor-trio">${[['재질','같은 모양에서 재료 바꾸기'],['철사 굵기','같은 재료에서 굵기 바꾸기'],['코일 지름','같은 철사에서 지름 바꾸기']].map(([t,d])=>`<section>${springArt()}<h2>${t}</h2><p>${d}</p></section>`).join('')}</div><h2>무엇을 같게 두어야 할까요?</h2>${lines(4)}${act('factors','한 조건씩 비교하기')}`}),
 base('l2-tools','P19',{title:'생활 속 용수철',lead:'도구마다 용수철이 하는 일을 살펴보세요.',body:`<div class="lesson-six tool-photos">${toolRows.map(([id,name,desc])=>`<figure>${id==='expander'?toolIcon(id):`<img src="./photos/${{stapler:'stapler',pen:'pen',pogo:'pogo',trampoline:'trampoline',trap:'trap'}[id]}.jpg" alt="${name} 실사 사진">`}<figcaption><b>${name}</b><small>${desc}</small></figcaption></figure>`).join('')}</div><p>완력기는 구조를 보여 주는 개념 도해입니다. 제품마다 내부 구조는 다를 수 있습니다.</p>${act('tools','도구의 역할 비교하기')}`}),
 base('l2-test-a','P20',{body:questions(q2.slice(0,3),'p20')}),
 base('l2-test-b','P21',{body:questions(q2.slice(3,6),'p21')}),
 base('l2-test-b','P22',{body:questions(q2.slice(6,9),'p22')}),
 base('l2-test-graph','P23',{body:questions(q2.slice(9,12))})
];

export function studentCover(){
 return `<article class="paper original-cover" data-book-page="0" data-print-id="P0" aria-label="초과심 물리 원본 앞표지"><img src="./art/original-physics-cover.png" alt="사용자 제공 초과심 물리 교재의 원본 앞표지"></article>`;
}
export const studentCoverPage={id:'original-cover',printId:'P0',lesson:0,source:[],kicker:'원본 표지',title:'초·과·심',lead:'',body:'',action:null,teacher:''};
