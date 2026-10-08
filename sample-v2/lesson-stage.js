// Screen-only lesson scenes. Printed pages stay in lesson-print-pages.js.
// A scene points to the same source page, question and existing activity assets.
import {q1,q2,questionHTML,toolRows,assessmentGroupsByPrint,earth3Items} from './content.js';
import {scaleArt,eyeArt,springArt,springActionArt,factorArt,graphSVG,graphChoices,toolIcon,earthArt,appleTreeArt,gravityUseIcon,weightBarsArt,massWeightGraphSVG} from './graphics.js';
import {inquiryObjects,objectPhoto} from './everyday-objects.js';
import {sourceLessons} from './source-lessons.js';
import {LOCKED,formatKey} from './daily-grading.js';

const assessmentGroups=assessmentGroupsByPrint;
const escapeText=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const objectGallery=()=>`<div class="stage-objects">${inquiryObjects.map(object=>`<figure>${objectPhoto(object)}<figcaption>${escapeText(object.name)}</figcaption></figure>`).join('')}</div>`;
const photo=(file,alt)=>`<img src="./photos/${file}.jpg" alt="${escapeText(alt)}">`;
const visualTiles=(items,extra='')=>`<div class="stage-visual-tiles ${extra}">${items.map(([visual,title,detail])=>`<figure>${visual}<figcaption><strong>${escapeText(title)}</strong>${detail?`<small>${escapeText(detail)}</small>`:''}</figcaption></figure>`).join('')}</div>`;
const futureTiles=()=>visualTiles([
 ['<img src="./art/future-microcoil-concept.png" alt="극소 코일을 설명하는 가상 실사">','극소 코일','설명용 가상 실사'],
 ['<img src="./art/future-4d-printing-concept.png" alt="4D 프린팅을 설명하는 가상 실사">','4D 프린팅','설명용 가상 실사'],
 ['<img src="./art/future-2d-material-concept.png" alt="2D 재료를 설명하는 가상 실사">','2D 재료','설명용 가상 실사'],
]);
const toolTiles=()=>visualTiles(toolRows.map(([id,name])=>[id==='expander'?toolIcon(id):photo(id,name+' 사진'),name,'']),'stage-six-tiles');

const scenes={
 P0:{cover:true},
 P1:{question:'용수철저울에는 어떤 부분이 있을까요?',answer:'손잡이 · 영점조절나사 · 용수철 · 표시자 · 눈금 · 고리',student:'인쇄한 교재에서 여섯 부분을 찾아 짚어 보세요.',activity:'parts',activityLabel:'3D 저울에서 부분 찾기',visual:()=>scaleArt({force:0,labels:false,showWeight:false})},
 P2:{question:'물체를 매달기 전에 무엇부터 확인해야 할까요?',answer:'물체가 없는 저울의 표시자가 0을 가리키는지 확인합니다.',student:'교재의 네 장면을 손가락으로 따라가고, 빈 저울을 직접 조절해 보세요.',activity:'zero',activityLabel:'빈 저울의 기준 조절하기',visual:()=>scaleArt({force:0,labels:false,showWeight:false})},
 P3:{question:'크기와 모양만 보고 다섯 물건의 무게를 알 수 있을까요?',answer:'겉모습만으로 정확한 무게를 알 수 없습니다. 먼저 예상하고 저울로 확인합니다.',student:'교재의 다섯 물건을 보고 가벼울 것 같은 순서를 예상해 보세요.',activity:'inquiry',activityLabel:'다섯 물건 예상하기',visual:objectGallery},
 P4:{question:'다섯 물건을 가벼울 것 같은 순서로 놓아 볼까요?',answer:'예상에 정해진 정답은 없습니다. 이유를 듣고 실제 측정 결과와 비교합니다.',student:'교재에 순서와 까닭을 적은 뒤 화면에서 물건을 움직여 보세요.',activity:'inquiry',activityLabel:'물건 순서 바꾸기',visual:objectGallery},
 P5:{question:'예상을 확인하려면 어떤 순서로 재야 할까요?',answer:'빈 저울 확인 → 물체 매달기 → 흔들림이 멈춘 뒤 눈금 읽기 → 기록',student:'교재의 표를 펼쳐 두고, 화면에서 잰 다섯 물건의 값을 기록해 보세요.',activity:'inquiry',activityLabel:'3D 저울로 직접 재기',visual:()=>`<div class="stage-p5-visual">${scaleArt({force:0,labels:false,showWeight:false})}${objectGallery()}</div>`},
 P6:{question:'어느 눈높이에서 읽어야 정확할까요?',answer:'표시자의 윗부분과 눈높이를 수평으로 맞춰 정면에서 읽습니다.',student:'교재 7쪽의 위·정면·아래 그림을 비교하고, 같은 물체인데 눈금이 어떻게 달라 보이는지 확인해 보세요.',activity:'eye',activityLabel:'세 시점 비교하기',visual:eyeArt},
 P7:{question:'세 저울은 물체를 어디에 놓거나 매달까요?',answer:'용수철저울은 고리에 매답니다. 앉은뱅이저울은 접시에 올리고, 체중계에는 사람이 올라섭니다.',student:'교재 8쪽의 실사 사진에서 물체를 놓는 자리와 눈금을 읽는 부분을 짚어 보세요.',activity:'types',activityLabel:'물건에 맞는 저울 고르기',visual:()=>visualTiles([[photo('scale-spring','용수철저울 실사'),'용수철저울','고리에 매달기'],[photo('scale-table','앉은뱅이저울 실사'),'앉은뱅이저울','접시에 올리기'],[photo('scale-person','체중계 실사'),'체중계','사람이 올라서기']])},
 P8:{question:'돌돌 말리지 않은 판도 용수철처럼 움직일까요?',answer:'원문은 비코일 스프링, 판스프링, 시계 속 코일의 변화를 차례로 소개합니다. 핵심은 모양이 달라도 휘거나 늘어난 뒤 되돌아가는 성질입니다.',student:'교재 9쪽의 이름풀이와 역사 이야기를 읽고, 되돌아오는 성질을 나타내는 문장을 찾아보세요. 연대는 원문 서술로 구분합니다.',activity:'watch',activityLabel:'시계 속 태엽 기록영상 보기',visual:()=>visualTiles([['<img src="./art/historical-engraving.png" alt="원본 교재의 옛 도구 그림">','원본 역사 그림','원문 p13'],[toolIcon('leaf'),'판스프링','모양을 비교해요'],[photo('watch-mainspring-real','실제 시계 속 태엽 사진'),'시계 속 태엽','실제 사진']]),caution:'연대와 발명 순서는 원본 교재의 서술이며 별도 역사 검증을 마친 연표가 아닙니다.'},
 P9:{question:'시계 속 태엽은 풀릴 때 어떻게 움직일까요?',answer:'감겨 있던 태엽이 풀리며 움직임을 전달합니다. 작은 밸런스 스프링은 별도 부품입니다.',student:'교재의 실제 태엽 사진을 보고, 영상에서 움직이는 방향을 찾아보세요.',activity:'watch',activityLabel:'기록영상 크게 보기',visual:()=>'<img class="stage-film-poster" src="./photos/watch-mainspring-real.jpg" alt="실제 자동 시계 안에 감긴 태엽 사진">'},
 P10:{question:'원문이 전망한 미래의 용수철은 무엇이 달라질까요?',answer:'원문은 극소 코일, 4D 프린팅, 2D 재료를 미래의 형태·재료 가능성으로 제시합니다. 집필 당시의 전망이며 현재의 성능으로 단정하지 않습니다.',student:'교재 11쪽의 세 낱말을 읽고, 지금의 용수철과 무엇이 달라지는지 자기 말로 설명해 보세요. 그림은 실제 연구 사진이 아닙니다.',activity:'spring-film',activityLabel:'지금의 용수철 운동 영상 보기',visual:futureTiles,caution:'그림은 설명용 가상 실사입니다. 원문의 기관·성능 수치를 최신 연구 사실로 단정하지 않습니다.'},
 P12:{question:'용수철을 당기고 놓으면 모양이 어떻게 변할까요?',answer:'당기면 길어지고 누르면 짧아지며, 힘을 없애면 원래 모양으로 돌아가려 합니다.',student:'교재 13쪽 그림을 먼저 보며 당기기·누르기·놓기를 예상한 뒤 직접 조작해 보세요.',activity:'elastic',activityLabel:'직접 당기고 놓아 보기',visual:()=>visualTiles([[springActionArt('pull'),'당기기','길어져요'],[springActionArt('compress'),'누르기','짧아져요'],[springActionArt('release'),'놓기','돌아가려 해요']])},
 P13:{question:'힘을 없애면 원래 모양으로 돌아가려는 성질은 무엇일까요?',answer:'탄성입니다. 이 수업의 가상 모형은 탄성 범위 안의 변화를 다룹니다.',student:'교재 14쪽의 그림과 정의를 읽고, 힘을 주기 전과 놓은 뒤의 모습을 비교해 보세요.',activity:'elastic',activityLabel:'탄성 관찰하기',visual:()=>springArt({large:true})},
 P14:{question:'전체 길이와 줄어든 길이는 같은 말일까요?',answer:'전체 길이는 양 끝 사이의 현재 길이이고, 줄어든 길이는 처음 길이에서 짧아진 만큼입니다.',student:'교재 15쪽에 두 길이를 다른 색으로 표시해 보세요. 힘이 커질 때 각각 어떻게 변하는지도 말해 보세요.',activity:'compression',activityLabel:'누르는 힘과 길이 비교하기',visual:()=>springArt({mode:'compress',large:true}),explain:'줄어든 길이는 누르는 힘이 커질수록 함께 커지고, 전체 길이는 그만큼 짧아집니다. 두 길이를 다른 색으로 표시하게 하고, 교재 17쪽 ④의 세 문장을 교재 표현 그대로 읽습니다.'},
 P15:{question:'추를 10·20·30 g으로 늘리면 늘어난 길이는 얼마일까요?',answer:'본문 실험 A: 10 g→3 cm, 20 g→6 cm, 30 g→9 cm입니다. 원래 길이와 늘어난 길이를 구분합니다.',student:'교재 16쪽의 표를 읽고, 같은 추를 더할 때 늘어난 길이가 어떻게 바뀌는지 실험해 보세요.',activity:'measure',activityLabel:'추를 하나씩 더해 재기',visual:()=>`<div class="stage-measure-visual">${springArt({large:true})}<table><thead><tr><th>추의 무게</th><th>10 g</th><th>20 g</th><th>30 g</th></tr></thead><tbody><tr><th>늘어난 길이</th><td>3 cm</td><td>6 cm</td><td>9 cm</td></tr></tbody></table></div>`},
 P16:{question:'표의 세 값을 그래프의 어디에 찍을까요?',answer:'가로축은 추의 무게, 세로축은 늘어난 길이입니다. (10,3), (20,6), (30,9)를 찍습니다.',student:'교재 17쪽의 빈 그래프에 (10,3), (20,6), (30,9)를 직접 표시한 다음 화면에서도 확인해 보세요.',activity:'graph',activityLabel:'표의 점을 그래프에 찍기',visual:({mode,answerOpen})=>`<div class="stage-graph-visual">${graphSVG({points:mode==='teacher'&&answerOpen?[[10,3],[20,6],[30,9]]:[],max:9,step:3,labels:true})}<p>본문 실험 A · 10/20/30 g → 3/6/9 cm</p></div>`},
 P17:{question:'용수철을 비교할 때 무엇을 하나씩 바꿔야 할까요?',answer:'재질, 철사 굵기, 코일 지름 중 하나만 바꾸고 다른 조건은 같게 둡니다.',student:'교재 18쪽의 세 조건 중 하나를 고르고, 무엇을 같게 둘지 먼저 말해 보세요.',activity:'factors',activityLabel:'한 조건씩 바꿔 비교하기',visual:()=>visualTiles([[factorArt('material'),'재질','한 조건만 변경'],[factorArt('wire'),'철사 굵기','한 조건만 변경'],[factorArt('diameter'),'코일 지름','한 조건만 변경']])},
 P21:{question:'사과는 왜 아래로 떨어질까요?',answer:'뉴턴은 사과를 아래로 떨어지게 만드는 힘, 즉 중력이 작용하기 때문이라고 생각했습니다. 만유인력은 질량을 가지고 있는 물체들이 서로 끌어당기는 힘입니다.',student:'교재 22쪽을 보고 사과가 아래로 떨어지는 까닭을 먼저 말해 보세요.',activity:null,activityLabel:'',visual:appleTreeArt},
 P22:{question:'중력은 어느 방향으로 작용할까요?',answer:'중력은 지구 중심을 향합니다. 추를 실에 매달아 가만히 들고 있을 때 추가 가리키는 방향(연직 방향)과 같습니다.',student:'교재 23쪽의 그림에서 화살표가 모두 어디를 가리키는지 찾아보세요.',activity:null,activityLabel:'',visual:()=>earthArt({items:[{angle:300,kind:'ball'},{angle:35,kind:'beach'},{angle:150,kind:'tennis'}]})},
 P23:{question:'①~④ 위치에서 물체를 놓으면 어느 방향으로 떨어질까요?',answer:'어느 위치에서도 지구 중심을 향해 떨어집니다. 그림에서 ①은 아래쪽, ②는 오른쪽, ③은 위쪽, ④는 왼쪽으로 떨어집니다.',student:'교재 24쪽의 ①~④에 떨어지는 방향을 화살표로 그린 다음 화면에서 확인해 보세요.',activity:'gravity',activityLabel:'위치마다 떨어지는 방향 고르기',visual:({mode,answerOpen})=>earthArt({items:[{angle:0,kind:'num',n:1},{angle:270,kind:'num',n:2},{angle:180,kind:'num',n:3},{angle:90,kind:'num',n:4}],arrows:mode==='teacher'&&answerOpen})},
 P24:{question:'중력 때문에 일어나는 일에는 무엇이 있고, 중력을 이용한 것에는 무엇이 있을까요?',answer:'번지점프·놓은 물체·운석은 아래로 떨어지고 물은 높은 곳에서 낮은 곳으로 흐릅니다. 물레방아와 수력 발전소는 이런 중력을 이용합니다.',student:'교재 25쪽에서 중력에 의한 현상과 중력을 이용한 것을 나누어 찾아보세요.',activity:null,activityLabel:'',visual:()=>visualTiles([['bungee','번지점프를 하면 아래로 떨어진다'],['drop','놓은 물체가 땅으로 떨어진다'],['meteor','운석이 지구로 떨어진다'],['water','물이 높은 곳에서 낮은 곳으로 흐른다'],['mill','물레방아는 떨어지는 물을 이용한다'],['dam','수력 발전소는 흘러가는 물로 전기를 만든다']].map(([k,t])=>[gravityUseIcon(k),t,'']),'stage-six-tiles')},
 P25:{question:'무게란 무엇이고 어떤 단위로 나타낼까요?',answer:'무게는 물체에 작용하는 중력의 크기이고, 단위는 N(뉴턴)입니다. 용수철이 많이 늘어날수록 매달린 물체의 무게가 큽니다.',student:'교재 26쪽을 읽고, 무거운 물체를 매달면 용수철이 어떻게 되는지 말해 보세요.',activity:'elastic',activityLabel:'용수철로 무게의 크기 느껴 보기',visual:()=>springArt({large:true})},
 P26:{question:'같은 물체를 달에서 재면 무게는 어떻게 될까요?',answer:'달에서 중력은 지구 중력의 1/6배라서 달에서 잰 무게도 지구의 1/6배입니다. 지구에서 58.8 N인 물체는 달에서 9.8 N입니다.',student:'교재 27쪽에서 지구와 달의 무게를 비교하고, 달에서 무게가 줄어드는 까닭을 말해 보세요.',activity:'moon-weight',activityLabel:'지구와 달의 무게 비교하기',visual:()=>weightBarsArt([['지구',58.8],['달',9.8]])},
 P27:{question:'높은 곳에 올라가면 중력·기압·기온·끓는점은 어떻게 달라질까요?',answer:'이 칸의 정답은 교재에 인쇄되어 있지 않습니다. 학생의 예상과 까닭을 먼저 듣고 기록하며, 공식 정답을 확인하기 전까지 정답을 공개하지 않습니다.',student:'교재 28쪽의 빈칸에 ‘크다’ 또는 ‘작다’로 먼저 예상을 쓰고, 그렇게 생각한 까닭을 말해 보세요.',activity:null,activityLabel:'',visual:()=>`<div class="stage-measure-visual"><table><thead><tr><th>높이</th><th>중력</th><th>기압</th><th>기온</th><th>끓는점</th></tr></thead><tbody><tr><th>높다</th><td>(  )</td><td>(  )</td><td>(  )</td><td>(  )</td></tr><tr><th>낮다</th><td>(  )</td><td>(  )</td><td>(  )</td><td>(  )</td></tr></tbody></table></div>`},
 P28:{question:'질량은 무게와 어떻게 다를까요?',answer:'질량은 장소에 따라 변하지 않는 물체의 고유한 양(단위 kg, g)이고, 같은 장소에서 무게는 질량이 클수록 큽니다. 질량 1 kg의 지구 무게는 약 9.8 N, 6 kg은 약 58.8 N입니다.',student:'교재 29쪽을 읽고, 장소가 바뀌어도 변하지 않는 것이 무엇인지 찾아보세요.',activity:null,activityLabel:'',visual:()=>visualTiles([[`<div class="stage-term">질량</div>`,'장소에 따라 변하지 않는 고유한 양','kg · g'],[`<div class="stage-term">무게</div>`,'물체에 작용하는 중력의 크기','N'],[`<div class="stage-term">9.8 N</div>`,'질량 1 kg의 지구 무게(교재의 예)','6 kg → 약 58.8 N']])},
 P29:{question:'60 kg인 사람이 달에 가면 질량과 무게는 어떻게 될까요?',answer:'질량은 60 kg 그대로입니다. 무게는 지구의 1/6로 줄어, 교재 표에서는 588 N의 1/6인 98 N이 됩니다.',student:'교재 30쪽의 비교 표에서 질량과 무게의 다른 점을 찾아보세요.',activity:'weight-mass',activityLabel:'지구와 달에서 질량·무게 비교하기',visual:()=>`<div class="stage-measure-visual"><table><thead><tr><th>구분</th><th>질량</th><th>무게</th></tr></thead><tbody><tr><th>뜻</th><td>물체의 고유한 양</td><td>물체에 작용하는 중력의 크기</td></tr><tr><th>기호</th><td>m (mass)</td><td>W (weight)</td></tr><tr><th>단위</th><td>kg, g</td><td>N, kg.f, kg중</td></tr><tr><th>달에서 (60 kg)</th><td>60 kg</td><td>588 N → 98 N</td></tr><tr><th>측정 도구</th><td>윗접시·양팔·대저울</td><td>용수철·앉은뱅이·체중계</td></tr></tbody></table></div>`},
 P30:{question:'질량과 무게의 관계를 그래프로 그리면 어떤 모양일까요?',answer:'질량이 증가하면 무게도 증가하고, 둘은 비례 관계라서 원점을 지나는 직선입니다. 교재의 값은 1 kg → 9.8 N, 6 kg → 58.8 N입니다.',student:'교재 31쪽의 그래프에 (1, 9.8), (6, 58.8)을 직접 표시한 다음 화면에서도 확인해 보세요.',activity:'mass-weight-graph',activityLabel:'질량과 무게 점 찍기',visual:({mode,answerOpen})=>`<div class="stage-graph-visual">${massWeightGraphSVG({points:mode==='teacher'&&answerOpen?[[1,9.8],[6,58.8]]:[],line:mode==='teacher'&&answerOpen})}<p>교재의 값 · 1 kg → 9.8 N, 6 kg → 58.8 N</p></div>`},
 P31:{question:'손으로 어림하면 어떤 점이 좋고 어떤 점이 어려울까요? 기준물체는 무엇일까요?',answer:'장점은 무게 차이가 큰 두 물체를 비교하기 쉽다는 점이고, 단점은 차이가 작은 물체를 정확하게 비교하기 어렵다는 점입니다. 기준물체는 모양·크기·무게가 모두 일정한 물체입니다.',student:'교재 32쪽에서 기준물체로 쓸 수 있는 것과 없는 것을 나누어 말해 보세요.',activity:null,activityLabel:'',visual:()=>visualTiles([[`<div class="stage-term">손 어림</div>`,'차이가 크면 쉽고 작으면 어렵다',''],[`<div class="stage-term">쓸 수 있어요</div>`,'클립 · 못 · 같은 종류의 동전','모양·크기·무게가 일정'],[`<div class="stage-term">쓸 수 없어요</div>`,'사용한 연필 · 여러 모양의 단추','모양이나 크기가 제각각']])},
 P18:{question:'이 도구들에서 용수철은 어떤 일을 할까요?',answer:'스테이플러·볼펜·트램펄린 등에서 누르거나 당긴 뒤 돌아가려는 성질을 활용합니다. 실제 제품마다 내부 구조는 다를 수 있습니다.',student:'교재 19쪽의 여섯 도구 사진을 보고, 어느 부분이 눌리거나 늘어났다가 돌아오는지 찾아보세요.',activity:'tools',activityLabel:'생활 속 도구 살펴보기',visual:toolTiles},
};

export function hasLessonStage(page){return !!(page&&(scenes[page.printId]||assessmentGroups[page.printId]));}
export function stageQuestionCount(page){return assessmentGroups[page?.printId]?.length||1;}
export function stageQuestion(page,index=0){const group=assessmentGroups[page?.printId];return group?.[Math.max(0,Math.min(group.length-1,index))]||null;}
export function stageActivity(page,index=0){
 if(assessmentGroups[page?.printId])return {a1:'parts',a4:'eye',b3:'graph',b12:'assessment-graph',c4:'gravity'}[stageQuestion(page,index)?.id]||null;
 return scenes[page?.printId]?.activity||null;
}
function answerFor(question){
 return LOCKED.has(question.id)?'공식 해설 대조 필요':formatKey(question);
}
function questionVisual(question,{mode='teacher',answerOpen=false}={}){
 const image=question.image?`<img class="stage-question-image" src="./art/${escapeText(question.image)}" alt="${question.id==='a1'?'ㄱ·ㄴ·ㄷ·ㄹ이 표시된 원본 용수철저울 그림':'ㄱ·ㄴ·ㄷ 눈높이가 표시된 원본 그림'}">`:'';
 const graphic=question.graphic?graphChoices():question.kind==='graph'?graphSVG({step:4,labels:false}):'';
 const passage=question.passage?`<p class="stage-passage">${escapeText(question.passage)}</p>`:'';
 const options=question.options&&!question.passage&&!question.graphic?`<ol class="stage-options">${question.options.map(option=>`<li>${escapeText(option)}</li>`).join('')}</ol>`:'';
 const draw=question.kind==='draw'?`<div class="stage-draw">${earthArt({items:earth3Items,arrows:mode==='teacher'&&answerOpen})}</div>`:'';
 const slots=question.kind==='pair'&&question.slots?`<ul class="stage-slots">${question.slots.map(slot=>`<li>${escapeText(slot)} <b>${(question.choices||[]).map(escapeText).join(' / ')}</b></li>`).join('')}</ul>`:'';
 const body=`${image}${graphic}${passage}${options}${draw}${slots}`;
 return body||`<div class="stage-question-note"><b>${question.n}번</b><span>인쇄한 교재에서 먼저 풀어 보세요</span></div>`;
}
function stageHeader(page,index,mode,questionIndex){
 const label=mode==='teacher'?'가르치기 · 투사 화면':'스스로 공부하기';
 const number=assessmentGroups[page.printId]?` · 원본 ${questionIndex+1}/${stageQuestionCount(page)}번`:'';
 return `<header class="lesson-stage-head"><div><span>${label}</span><h1>${escapeText(page.title.replace('\n',' '))}</h1></div><div class="stage-size" role="group" aria-label="화면 글자 크기"><button type="button" data-stage-size="-1" aria-label="글자 작게">작게 −</button><output data-stage-size-label>100%</output><button type="button" data-stage-size="1" aria-label="글자 크게">크게 +</button></div><strong>${index===0?'원본 표지':`교재 ${String(index+1).padStart(2,'0')}쪽${number}`}</strong></header>`;
}
function stageFooter(page,questionIndex,mode){
 const nav=assessmentGroups[page.printId]?`<div class="stage-question-nav"><button type="button" data-stage-question="prev" ${questionIndex===0?'disabled':''}>이전 문항</button><span>${questionIndex+1} / ${stageQuestionCount(page)}</span><button type="button" data-stage-question="next" ${questionIndex===stageQuestionCount(page)-1?'disabled':''}>다음 문항</button></div>`:'';
 return `<footer class="lesson-stage-foot"><span>MSG 초·과·심 · ${mode==='teacher'?'교사용 교안':'학생용 수업'} · ${page.printId==='P0'?'사용자 제공 원본 앞표지':`원본 본책 ${page.source.join('·')}쪽`}</span>${nav}</footer>`;
}
export function renderLessonStage(page,index,mode,{questionIndex=0,answerOpen=false,explanationOpen=false,studentBody=html=>html}={}){
 if(!hasLessonStage(page))return '';
 if(page.printId==='P0'){
  const teacher=mode==='teacher';
  const message=teacher?'교재의 질문을 먼저 보여 주고, 자료·실험·영상을 필요한 순간에 공개합니다.':'인쇄한 책의 표지를 펼쳐 보세요. 우루사쌤 안내를 들으며 같은 쪽의 활동을 함께 해요.';
  return `<article class="lesson-stage deck-look ${teacher?'teacher-deck':'student-lesson'} stage-cover" data-stage-page="P0" aria-label="${teacher?'교사용 강의 시작':'스스로 공부하기 시작'}">${stageHeader(page,index,mode,0)}<div class="lesson-stage-body"><div class="lesson-stage-visual"><img class="stage-cover-image" src="./art/original-physics-cover.png" alt="사용자 제공 초과심 물리 교재의 원본 앞표지"></div><section class="lesson-stage-content"><span class="stage-eyebrow">MSG 초·과·심 · 물리</span><h2>무게 재기</h2><p>${message}</p><ol class="stage-cover-outline"><li>1차시 · 저울의 구조와 영점 → 예상 → 직접 측정</li><li>2차시 · 탄성과 길이 변화 → 표와 그래프 → 생활 속 도구</li><li>3차시 · 중력 → 무게 → 질량 → 그래프</li></ol><button type="button" class="stage-primary" data-stage-next>첫 장면 시작 →</button></section></div>${stageFooter(page,0,mode)}</article>`;
 }
 const question=stageQuestion(page,questionIndex),scene=scenes[page.printId];
 const media=stageActivity(page,questionIndex);
 const mediaLabel=question?media?'그림을 눌러 관련 실험 열기':'':scene.activityLabel;
 const visual=question?questionVisual(question,{mode,answerOpen}):scene.visual({mode,answerOpen});
 const prompt=question?question.q:scene.question;
 const answer=question?answerFor(question):scene.answer;
 const locked=!!(question&&LOCKED.has(question.id));
 const explanation=locked?'공식 해설과 원문을 대조한 뒤 공개합니다.':question?question.why:(scene?.explain||sourceLessons[page.printId]?.teacher||page.teacher||'학생의 예상과 관찰을 비교한 뒤 정리합니다.');
 const visualMarkup=media?`<button type="button" class="lesson-stage-visual media-trigger" data-stage-media="${media}" aria-label="${escapeText(mediaLabel)}">${visual}<span>${escapeText(mediaLabel)} ↗</span></button>`:`<div class="lesson-stage-visual">${visual}</div>`;
 const lastQuestion=questionIndex>=stageQuestionCount(page)-1;
 const nextLabel=locked?(lastQuestion?'다음 장면 ▶':'다음 문항 ▶'):!answerOpen?'답 확인 ▶':!explanationOpen?'추가 설명 ▶':(lastQuestion?'다음 장면 ▶':'다음 문항 ▶');
 if(mode==='teacher')return `<article class="lesson-stage deck-look teacher-deck" data-stage-page="${page.printId}" aria-label="교사용 강의 장면">${stageHeader(page,index,mode,questionIndex)}<div class="lesson-stage-body">${visualMarkup}<section class="lesson-stage-content"><span class="stage-eyebrow">학생에게 먼저 물어보세요</span><h2>${escapeText(prompt)}</h2><div class="stage-teacher-controls"><button type="button" class="stage-advance" data-stage-advance>${escapeText(nextLabel)}</button><button type="button" data-stage-reveal aria-expanded="${answerOpen}" ${locked?'disabled':''}>${locked?'공식 해설 검토 중':answerOpen?'답 숨기기':'답 확인하기'}</button><button type="button" data-stage-explain aria-expanded="${explanationOpen}" ${answerOpen&&!locked?'':'disabled'}>${explanationOpen?'추가 설명 숨기기':'추가 설명'}</button></div><div class="stage-answer" ${answerOpen&&!locked?'':'hidden'}><strong>${page.printId==='P4'?'예상과 측정 비교':'확인할 내용'}</strong><p>${escapeText(answer)}</p></div><div class="stage-explanation" ${explanationOpen&&!locked?'':'hidden'}><strong>교사 설명</strong><p>${escapeText(explanation)}</p></div>${scene?.caution?`<p class="stage-context">${escapeText(scene.caution)}</p>`:''}</section></div>${stageFooter(page,questionIndex,mode)}</article>`;
 const task=question?`<div class="stage-question-paper">${studentBody(questionHTML(question,{print:true}))}</div>`:`<div class="stage-student-task"><span class="stage-eyebrow">책에서 먼저 해 보세요</span><h2>${escapeText(prompt)}</h2><p>${escapeText(scene.student)}</p>${['P3','P4'].includes(page.printId)?`<label class="stage-note-label">내 생각<textarea data-stage-note="${page.printId}" rows="3" placeholder="교재에 적은 생각을 여기에도 남길 수 있어요."></textarea></label>`:''}</div>`;
 const action=media&&!question?`<button type="button" class="stage-primary" data-stage-media="${media}">${escapeText(mediaLabel)} →</button>`:'';
 const grade=assessmentGroups[page.printId]&&questionIndex===stageQuestionCount(page)-1?`<button type="button" class="stage-primary" data-stage-grade="${page.printId.toLowerCase()}">${['고','한','두','세','네','다섯','여섯','일곱','여덟','아홉'][stageQuestionCount(page)]||stageQuestionCount(page)} 문항 채점하기</button>`:'';
 return `<article class="lesson-stage deck-look student-lesson" data-stage-page="${page.printId}" data-stage-question-visual="${!!(question?.image||question?.graphic||question?.kind==='graph')}" data-stage-question-text="${!!(question&&!question.image&&!question.graphic&&question.kind!=='graph')}" aria-label="우루사쌤과 스스로 공부하기">${stageHeader(page,index,mode,questionIndex)}<div class="lesson-stage-body">${visualMarkup}<section class="lesson-stage-content">${task}${scene?.caution?`<p class="stage-context">${escapeText(scene.caution)}</p>`:''}<div class="stage-student-actions">${action}${grade}</div></section></div>${stageFooter(page,questionIndex,mode)}</article>`;
}
