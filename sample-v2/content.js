import {inquiryPages,inquiryNarration} from './inquiry-pages.js';
import {scaleArt, springArt, eyeArt, graphSVG, graphChoices, toolIcon, loadArt} from './art3d.js';
import {weightPlans} from './physics.js';
import {UNCONFIRMED} from './remedy-bank.js';
export const section=(n,title,body)=>`<section class="unit-section"><h3><span>${n}</span>${title}</h3>${body}</section>`;
const note=(title,text)=>`<aside class="editor-note"><b>${title}</b><p>${text}</p></aside>`;
const ask=(text,lines=2)=>`<section class="inquiry"><div class="eyebrow">THINK & EXPLAIN</div><b>${text}</b><div class="write-lines">${'<i></i>'.repeat(lines)}</div></section>`;
const act=(kind,label)=>`<button class="page-action" data-action="${kind}"><span>↗</span>${label}</button>`;
const art=(h,cls='')=>`<figure class="art ${cls}">${h}</figure>`;
const table=(heads,rows)=>`<table class="book-table"><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((t,i)=>`<${i?'td':'th'}>${t}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table>`;
export const pages=[];
const page=(id,lesson,source,kicker,title,lead,body,action,teacher,extra={})=>pages.push({id,lesson,source,kicker,title,lead,body,action,teacher,...extra});

page('l1-structure',1,[10],'OBSERVE · 구조 관찰','느낌 대신,\n눈금으로 비교해요.','용수철저울의 구조 익히기',`
<div class="split structure"><div>${section('01','용수철저울의 구조',`<p>눈금이 움직이는 저울 안에는 어떤 장치가 있을까요? 각 부분의 이름과 역할을 연결해 봅시다.</p><dl class="parts-list"><dt>손잡이</dt><dd>손으로 잡거나 스탠드에 고정하는 부분</dd><dt>영점조절나사</dt><dd>저울의 눈금이 0을 가리키도록 조정하는 나사</dd><dt>용수철</dt><dd>물체를 매달면 늘어나는 부분</dd><dt>표시자</dt><dd>눈금을 가리키는 부분</dd><dt>눈금</dt><dd>물체의 무게를 나타내는 표시</dd><dt>고리</dt><dd>물체를 매달 때 사용하는 부분</dd></dl>`)}</div><div>${art(scaleArt({force:12}), 'scale-large')}</div></div>
${act('parts','부품을 확대하며 이름 맞히기')}${ask('표시자가 없다면 무엇이 어려울까요?',1)}`,'parts','부품 이름을 먼저 노출하지 않고 한 부분을 확대합니다. 학생이 이름과 역할을 말하면 확인을 눌러 설명을 공개합니다. 본문 그림에서 제시한 여섯 부분을 다룹니다.');

page('l1-use',1,[10],'MEASURE · 올바른 사용','매달기 전에,\n먼저 0을 확인해요.','장점·단점부터 사용 순서까지',`
<div class="advantages"><section><small>장점</small><p>손으로 어림할 때보다 정확한 무게를 측정할 수 있습니다.</p></section><section><small>주의할 점</small><p>저울의 종류마다 측정 범위가 정해져 있고, 큰 힘에 의해 변형되기 쉽습니다.</p></section></div>
${section('02','용수철저울의 사용방법',`<ol class="process"><li><b>0에 맞추기</b><p>물체를 달지 않은 상태에서 영점조절나사를 이용해 눈금이 0을 가리키도록 합니다.</p></li><li><b>고리에 매달기</b><p>물체를 아래쪽 고리에 매답니다. 저울의 측정 범위를 먼저 확인합니다.</p></li><li><b>멈춘 뒤 읽기</b><p>위아래로 움직이던 표시자가 멈추면 눈높이를 맞춘 후 눈금을 읽습니다.</p></li></ol>`)}
<div class="trio-art">${art(scaleArt({force:0,labels:false}))}${art(scaleArt({force:10,labels:false}))}${art(scaleArt({force:20,labels:false}))}</div>
<div class="page-actions">${act('zero','영점 조절하기')}${act('compare','예상 · 줄 세우기 · 비교 실험')}${act('target','목표 눈금에 맞춰 당기기')}</div>
${note('가상 교구의 설정','3D 저울의 범위는 0~30 N, 작은 눈금은 1 N입니다. 이 값은 추가한 실험의 설정이며 본책의 교구 수치를 바꾼 것이 아닙니다.')}`,'zero','물체를 매단 채 영점을 맞추는 오류를 확인합니다. 목표 맞추기는 원본 문제가 아닌 확장 활동입니다. 안정된 측정값과 관찰 중인 값을 구분합니다.');

page('l1-eye',1,[11],'VIEWPOINT · 시선과 눈금','같은 물체,\n달라 보이는 눈금.','표시자의 윗부분과 눈높이를 수평으로 맞추기',`
${section('03','눈금을 올바르게 읽는 방법',`<ol><li>물체를 매단 후 표시자의 진동이 멈출 때까지 기다립니다.</li><li>표시자의 윗부분과 눈높이가 수평이 되도록 합니다.</li><li>눈금에 표시된 숫자를 읽습니다.</li></ol>`)}
${art(eyeArt(),'wide')}<div class="page-actions">${act('eye','시선을 움직이고 눈금 찍기')}</div>
<section class="inquiry"><div class="eyebrow">SPEED QUESTION · 원본 활동</div><b>올바르게 읽는 눈의 위치를 ①, ②, ③에서 골라 보세요.</b>
${table(['눈높이의 위치','각 위치에서 읽은 눈금의 크기'],[['① 위에서 보면',''],['② 같은 높이에서 보면',''],['③ 아래에서 보면','']])}</section>
${note('관찰할 것','물체와 표시자의 위치는 바뀌지 않습니다. 눈금판 앞에 있는 표시자를 어느 방향에서 바라보느냐가 달라집니다.')}`,'eye','원본 그림처럼 눈금이 아래로 커지는 저울에서는 위에서 보면 더 큰 눈금을 읽습니다. 3D는 실제 시선과 눈금판의 교차점으로 값을 계산합니다.');

page('l1-scales',1,[12],'EVERYDAY SCIENCE · 쉬어가기','재려는 물체에 맞게\n저울을 골라요.','용수철 저울의 종류',`
<div class="scale-types">
<section>${art(scaleArt({force:10,labels:false}))}<div><h3>용수철저울</h3><p><b>사용</b> 학교 과학시간의 실험·실습에 주로 사용하며, 추 또는 여러 물체의 무게를 잽니다.</p><ol><li>물체가 없을 때 눈금이 0인지 확인합니다.</li><li>고리에 물체를 걸고 표시자가 진동을 멈출 때까지 기다립니다.</li><li>눈높이와 수평인 위치에서 표시자의 눈금을 읽습니다.</li></ol></div></section>
<section>${art(toolIcon('kitchen'))}<div><h3>앉은뱅이저울</h3><p><b>사용</b> 가정에서 사용하는 ‘가정용 저울’이라고도 하며, 육류·채소 등의 무게를 잽니다.</p><ol><li>빈 접시 상태에서 바늘의 눈금이 0인지 확인합니다.</li><li>접시 위에 물체를 올리고 바늘이 움직이지 않을 때 바늘 끝의 눈금을 읽습니다.</li></ol></div></section>
<section>${art(toolIcon('body'))}<div><h3>체중계</h3><p><b>사용</b> 가정에서 몸의 체중(무게)을 잽니다.</p><ol><li>사용 전 0인지 확인합니다.</li><li>바늘저울은 바늘이 멈췄을 때 끝이 가리키는 눈금을, 전자저울은 숫자의 변화가 없을 때 숫자를 읽습니다.</li></ol></div></section></div>
${act('types','물체에 맞는 저울 선택하기')}`,'types','용도만 묻지 않고 물체를 두는 위치와 읽는 표시를 비교합니다. 그림은 구조 이해를 위한 재구성 도해입니다.');

const history1=`스프링의 과거는 매우 보잘것없는 것이었다. 청동기 시대부터 사용되던 눈썹용 집게 등의 비코일 스프링(Non-Coil Spring)이 현대 스프링의 시초라고 알려져 있다. 스프링은 그야말로 산전수전을 겪으며 변화에 변화를 거듭해왔다. 하지만 현재 우리가 가지고 있는 스프링 관련 기술은 당시 발견된 것과 크게 다르지 않으며, 아주 조금 발전한 것에 불과하다.`;
// Transcribed from the supplied scanned original.
const history2=`예를 들어 기원전 3세기에는 알렉산드리아의 발명가 크테시비오스가 스프링을 적용한 투석기를 개발했다. 물론 당시의 스프링은 돌을 던질 수 있을 정도로 강하지 않았다. 비록 이 발명 자체는 난항을 겪었지만, 오늘날 우리는 이 기술이 발전한 형태인 판스프링(Leaf Spring)을 사용하고 있다. 자동차 서스펜션에서 흔히 볼 수 있는 제품이다. 스프링에 대한 기술 이해도와 작동방법에 대한 이해도가 높아지면서 복잡성이 높아지고 작동 방식에 변주가 더해졌다. 이는 더 많은 산업에 스프링을 적용할 수 있게 되었음을 의미한다.`;
const history3=`이 중에서도 주목할 만한 발전은 15세기 초 경 일어난 코일 스프링의 개발이다. 코일 스프링은 당시 휴대용 시계를 개발하는 과정에서 등장한 제품이었다. 이전까지는 휴대용 시계 대신 무겁고 큰 추시계가 시간을 알렸다. 하지만 스프링 기술의 도약에도 불구하고 당시의 ‘휴대용’ 시계는 3in. 이상의 지름과 두께를 가지고 있었으며, 철 혹은 스테인리스강 소재로 제작되어 상당한 무게를 가지고 있었다. 이후 4세기 동안이나 손목 시계가 등장하지 못했던 결정적 이유였다.`;
page('l1-name',1,[13],'SCIENCE STORY · 과학 이야기','용의 수염처럼,\n다시 돌아오는 힘.','용수철의 이름이 붙여진 유래',`
<div class="name-hero"><div class="hanja">龍<span>용</span>鬚<span>수염</span>鐵<span>쇠</span></div>${art(toolIcon('watch'))}</div>
<div class="source-prose"><p>동양의 한자문화권에서 쓰는 龍鬚鐵(용수철)은 용수(龍鬚)의 성질을 가진 쇠를 가리킨다. 이때 용수는 돌돌 말린 용의 수염을 일컫는데, 이 용의 수염을 잡아당겨 길게 펴더라도 돌돌 말린 모양으로 되돌아간다고 전해진다. 용수철이란 이름은 이러한 탄성체의 복원력을 빗대어 붙여진 이름이다.</p></div>
${note('교재의 이름풀이','실제 동물의 수염을 실험한 이야기가 아니라, 원래 모양으로 돌아오는 성질을 비유한 교재의 설명입니다.')}
${section('01','용수철의 과거',`<p class="source-prose">${history1}</p>`)}
${act('history','이야기를 움직이는 도해로 보기')}${ask('돌돌 말린 모양이 아니어도 용수철의 역할을 할 수 있을까요?',1)}`,'history','원문 p13의 역사 서술을 읽되 확정된 과학사 연대로 암기시키지 않습니다. 판독하기 어려운 표현은 원문 보기에서 함께 확인합니다. 이름풀이와 역사 자료를 구분합니다.',{dense:true});

page('l1-past',1,[13],'SCIENCE STORY · 과학 이야기','구부러진 판에서\n작은 시계까지.','용수철의 과거 — 원문의 이야기를 이어 읽기',`
<div class="history-strip"><figure><img src="./art/historical-engraving.png" alt="본책에 실린 옛 도구 그림"><figcaption>본책의 역사 그림</figcaption></figure>${art(toolIcon('leaf'))}${art(toolIcon('watch'))}</div>
<div class="source-prose"><p>${history2}</p><p>${history3}</p></div>
${note('원문과 검증의 구분','이 페이지의 연대·소재·발명 순서는 본책의 서술입니다. 역사적 사실을 새로 검증한 연표가 아니므로, 관련 문제의 정답 근거로 확대 적용하지 않습니다.')}
${act('history','판스프링과 태엽의 움직임 비교')}`,'history','역사적 서술 중 연대와 소재는 별도 검증 대상으로 표시했습니다. 원문을 누락하지 않고 읽을 수 있도록 편집했으며, 독립적인 사실 검증을 마쳤다고 표시하지 않습니다.',{dense:true});

const coilHistory=`코일이 없는 단순한 용수철은 인류 역사 속에서 화살과 같은 데에 사용되었다. 청동기 시대에는 여러 문화에 핀셋이 널리 쓰인 것으로 보아 더 복잡한 용수철 장치들이 사용되었음을 알 수 있다. 알렉산드리아의 크테시비우스는 주석의 비중을 높여 청과 합금하여 주조한 뒤에 두들겨 단단하게 만들어냄으로써 용수철과 같은 특성이 있는 청동을 만드는 방법을 개발하였다. 코일 형태의 용수철은 15세기에 나타났다. 최초의 용수철로 동작하는 회중시계는 1524년에 피터 헨레인이 발명하였다. 이에 이어 1556년에는 Taqi al-Din과 헨레인이 용수철로 동작하는 시계를 처음 만들어 냈다. 또, 1559년에는 al-Din이 용수철로 동작하는 천문 시계를 처음으로 발명하였다. 크리스티안 하위헌스도 1675년에 용수철을 발명하였다.`;
page('l1-watch',1,[14],'ARCHIVE FILM · 과학 이야기','시계 속 용수철이\n움직이는 순간.','코일 형태 용수철의 등장',`
<div class="film-poster"><img src="./media/watch-poster.jpg" alt="시계 속 태엽을 확대하여 설명하는 기록영상의 한 장면"><div><small>기록영상 · 1949</small><strong>HOW A WATCH WORKS</strong><span>태엽이 에너지를 저장하고 풀리는 모습</span></div></div>
<div class="page-actions">${act('watch','태엽 기록영상 39초 보기')}${act('balance','작은 용수철의 반복 운동 보기')}</div>
<div class="source-prose compact"><p>${coilHistory}</p></div>
${note('자료 출처','본책 p14: MSD(Motion System Design). 외부 기록영상: Handy (Jam) Organization / Prelinger Archives, Public Domain. 원음을 제거한 발췌 영상이며 본책의 연대 서술을 입증하는 자료는 아닙니다.')}`,'watch','재생이 끝나면 관찰 질문으로 이어집니다. 태엽(에너지 저장)과 밸런스 스프링(반복 운동 조절)을 같은 부품처럼 설명하지 않습니다. 원문의 역사 서술은 검증 대기로 별도 표시합니다.',{dense:true});

const future=`스프링이 세상에 등장한 지 수천 년이 지났다. 수천 년 전과 현재의 모습이 다르듯, 오늘날의 스프링과 앞으로의 스프링 역시 전혀 다른 모습을 하고 있을 것이다. 지난 수십 년 동안 극소 코일(Minuscule Coils)에 대한 요구가 증가하고 있다. 극소 코일 제품군이 휴대전화·터치패드·여타 전자기기 등에 탑재되기 때문이다. 이를 미루어 보았을 때 미래에 등장할 기술 역시 원활한 작동을 위해 새로운 종류의 스프링을 필요로 할 수 있다. 형태든, 기능이든 스프링 제조 및 설계의 다음 단계는 4D 프린팅과 2D 재료를 포함할 것으로 보인다. 전자의 경우 현재 매사추세츠 공과대학교에서 연구 중에 있다. 객체 생성은 물론, 시간 경과에 따른 변형이나 자기 조립도 수행할 수 있는 제품에 대한 연구가 이어지고 있다. 후자는 원자 한두 개만큼의 두께를 가진 재료에 대한 것이다. ‘2D 재료’라는 용어가 이 재료의 흥미로운 특성을 함축하고 있다. 현재는 비용을 줄이고 생산량을 늘릴 수 있는 2D 재료 생산 방법을 연구하고 있다. 이러한 재료를 바탕으로 만들어진 스프링은 그 활용 범위가 상상을 초월한다. 예를 들어 그래핀과 같은 탄소 결정 동소체(Carbon Crystalline Allotrope)는 무게 측면에서 대부분의 철보다 수백 배 강하며, 탄성 계수의 안정성 측면에서 최대 480%의 큰 증가를 보였다. 또한 정전기 효과에 따라 신축(늘어나고 줄어듦)에 대한 작용력이 커 손쉽게 복원이 가능하다. 그래핀 섬유 스프링에 대한 연구는 여전히 진행 중이다. 하지만 향후의 스프링 기술 측면에서 큰 잠재력을 가지고 있음은 분명하다.`;
page('l1-future',1,[14],'FUTURE LAB · 과학 이야기','더 작게, 더 새롭게.\n미래의 용수철.','극소 코일 · 4D 프린팅 · 2D 재료',`
<div class="future-tags"><div><b>01</b><strong>극소 코일</strong><span>전자기기 속 작은 구조</span></div><div><b>02</b><strong>4D 프린팅</strong><span>시간에 따른 형태 변화</span></div><div><b>03</b><strong>2D 재료</strong><span>원자 한두 개 두께</span></div></div>
<div class="source-prose compact"><p>${future}</p></div>
${note('교재의 미래 전망을 읽는 방법','‘현재 연구 중’과 ‘최대 480%’는 교재 집필 당시의 표현입니다. 최신 현황이나 모든 그래핀 제품의 성능으로 단정하지 않습니다. 아래 활동은 원리를 설명하는 가상 도해입니다.')}
${act('future','재료와 형태가 바뀌는 개념 도해')}`,'future','숫자·기관·전망을 누락하지 않고 원문으로 남겼습니다. 최신 기술 사실과 혼동하지 않도록 출판 당시 서술이라고 표시하고, 4D와 2D의 뜻을 학생이 자기 말로 설명하게 합니다.',{dense:true});

export const q1=[
{id:'a1',n:1,kind:'parts',q:'다음 사진의 용수철저울을 가리키고 있는 각 부분의 이름을 (   ) 안에 쓰시오.',image:'daily-parts.png',answer:['영점조절나사','용수철','표시자','고리'],concept:'parts',why:'ㄱ 영점조절나사, ㄴ 용수철, ㄷ 표시자, ㄹ 고리입니다.'},
{id:'a2',n:2,kind:'choice',q:'용수철저울을 사용할 때 가장 먼저 해야 할 일은 무엇인지 올바른 내용을 고르시오.',options:['무게를 읽는다.','물체를 매단다.','영점을 맞춘다.','그래프를 그린다.','용수철을 잡아당겨 본다.'],answer:2,concept:'zero',why:'물체를 매달기 전에 영점을 맞춥니다.'},
{id:'a3',n:3,kind:'text',q:'다음은 용수철 구조에 대한 설명입니다. (   )에 들어갈 알맞은 용수철의 구조를 쓰시오.',passage:'용수철저울에서 물체를 매달았을 때 눈금을 읽을 수 있는 표시를 해주는 장치를 (   )라고 한다.',answer:'표시자',concept:'parts',why:'눈금을 가리키는 장치는 표시자입니다.'},
{id:'a4',n:4,kind:'text',q:'다음과 같이 용수철로 물체의 무게를 잴 때, 눈금을 읽는 눈높이로 알맞은 곳의 기호를 쓰시오.',image:'daily-eye.png',answer:'ㄴ',concept:'eye',why:'표시자의 윗부분과 같은 높이인 ㄴ에서 읽습니다.'},
{id:'a5',n:5,kind:'choice',q:'다음 <보기>에 제시된 내용을 읽고 문장에 맞도록 ○표를 하시오.',passage:'용수철저울에서 표시자가 가리키고 있는 숫자가 20N입니다. 만약 눈금을 위에서 내려다보면 (20N초과, 20N, 20N미만)으로 보인다.',options:['20N초과','20N','20N미만'],answer:0,concept:'eye',why:'눈금이 아래로 커지고 표시자가 눈금 앞에 있는 이 그림의 저울에서는 위에서 보면 더 큰 눈금을 읽습니다.'},
{id:'a6',n:6,kind:'choice',q:'다음 <보기>에 제시된 내용을 읽고 문장에 맞도록 ○표를 하시오.',passage:'용수철저울에 물체를 매달 때는 (고리, 손잡이)에 매달아 무게를 잽니다.',options:['고리','손잡이'],answer:0,concept:'parts',why:'아래 고리에 물체를 매답니다. 위쪽 손잡이로 저울을 고정합니다.'}
];
export const q2=[
{id:'b1',n:1,kind:'pair',q:'다음 제시된 내용을 읽고 문장에 맞도록 ○표를 하시오.',passage:'한 개의 용수철에 여러 가지 물체를 매달았을 때 물체의 무게가 무거울수록 용수철이 ㉠(조금, 많이) 늘어나고 물체의 무게가 가벼울수록 용수철이 ㉡(조금, 많이) 늘어납니다.',answer:['많이','조금'],concept:'extend',why:'같은 용수철에서는 무거운 물체일수록 더 많이 늘어납니다.'},
{id:'b2',n:2,kind:'choice',q:'용수철저울에 물체를 매달았을 때 용수철의 상태를 올바르게 예측한 것을 고르시오.',options:['아무 변화가 없다.','용수철의 길이가 줄어든다.','용수철의 길이가 늘어난다.','용수철의 굵기가 굵어진다.','용수철의 굵기가 가늘어진다.'],answer:2,concept:'extend',why:'물체를 매달면 용수철의 길이가 늘어납니다.'},
{id:'b3',n:3,kind:'choice',q:'다음 중 물체의 무게와 용수철이 늘어난 길이 사이의 관계를 바르게 나타낸 그래프를 고르시오.',graphic:'choices',options:['①','②','③','④'],answer:2,concept:'graph',why:'늘어난 길이는 추를 매달지 않았을 때 0이고, 같은 용수철에서 무게에 비례합니다. 원점을 지나는 증가 그래프 ③입니다.'},
{id:'b4',n:4,kind:'choice',q:'힘을 주어 늘어나게 하거나 줄어들게 하여도 힘이 사라지면 원래의 모양으로 되돌아가려는 성질이 가장 강한 것은 어느 것인지 고르시오.',options:['실','철사','용수철','색종이','고무 찰흙'],answer:2,concept:'elastic',why:'보기 중 탄성을 나타내는 대표적인 물체는 용수철입니다.'},
{id:'b5',n:5,kind:'choice',q:'다음 문장에 맞는 표현에 ○표를 하시오.',passage:'물체에 준 힘을 제거하면 원래 모양으로 되돌아가는 성질을 (탄성, 소성)이라고 한다.',options:['탄성','소성'],answer:0,concept:'elastic',why:'힘을 없애면 원래 모양으로 돌아가려는 성질은 탄성입니다.'},
{id:'b6',n:6,kind:'choice',q:'다음 문장에 맞는 표현에 ○표를 하시오.',passage:'용수철에 매단 추의 개수가 증가하면 용수철 길이는 (일정하게, 불규칙하게) 늘어난다.',options:['일정하게','불규칙하게'],answer:0,concept:'extend',why:'무게가 같은 추를 하나씩 더 매다는 본문의 조건에서는 일정하게 늘어납니다.'},
{id:'b7',n:7,kind:'choice',q:'다음 문장에 맞는 표현에 ○표를 하시오.',passage:'용수철의 늘어난 길이와 추의 무게는 (비례, 반비례) 관계이다.',options:['비례','반비례'],answer:0,concept:'graph',why:'추의 무게가 두 배, 세 배이면 늘어난 길이도 두 배, 세 배입니다.'},
{id:'b8',n:8,kind:'choice',q:'다음 문장에 맞는 표현에 ○표를 하시오.',passage:'용수철의 늘어난 길이와 추의 개수는 (비례, 반비례) 관계이다.',options:['비례','반비례'],answer:0,concept:'graph',why:'무게가 같은 추를 사용하는 본문의 조건에서 비례합니다.'},
{id:'b9',n:9,kind:'choice',q:'다음 문장에 맞는 표현에 ○표를 하시오.',passage:'용수철의 굵기가 굵을수록 탄성력은 (크다, 작다).',options:['크다','작다'],answer:0,concept:'material',why:'원문의 기대 답은 크다입니다. 비교 설명에서는 다른 조건과 변형량을 같게 두고 철사의 굵기를 비교해야 합니다.'},
{id:'b10',n:10,kind:'choice',q:'다음 문장에 맞는 표현에 ○표를 하시오.',passage:'용수철의 탄성력의 크기는 용수철의 (색깔, 굵기)에 따라 다르다.',options:['색깔','굵기'],answer:1,concept:'material',why:'색이 아니라 용수철을 이루는 철사의 굵기와 같은 구조 조건이 관계있습니다.'},
{id:'b11',n:11,kind:'choice',q:'다음 문장에 맞는 표현에 ○표를 하시오.',passage:'용수철을 잡아당겨서 일정한 길이를 늘어나게 했을 때 용수철에 작용한 힘과 탄성력의 크기는 (같다, 다르다).',options:['같다','다르다'],answer:0,concept:'force',why:'늘어난 상태로 정지해 있는 상황에서는 잡아당기는 힘과 탄성력의 크기가 같습니다.'},
{id:'b12',n:12,kind:'graph',q:'다음 표는 용수철에 매단 추의 무게에 따라 늘어난 용수철의 길이를 측정한 결과이다. 이 결과 표를 이용해 다음 그래프를 완성하시오.',answer:[[10,4],[20,8],[30,12]],concept:'graph',why:'(10,4), (20,8), (30,12)를 표시합니다. 본문 실험의 3·6·9 cm가 아니라 이 문항의 4·8·12 cm를 사용해야 합니다.'}
];
export function questionHTML(q,{print=false}={}){
 const inlineOptions=print&&q.kind==='choice'&&q.passage&&q.options&&q.passage.includes(`(${q.options.join(', ')})`);
 const prefix=`<div class="question" data-q="${q.id}"><header><span>${String(q.n).padStart(2,'0')}</span>${inlineOptions?'':`<p>${q.q}</p>`}</header>`;
 const passage=inlineOptions?q.passage.replace(`(${q.options.join(', ')})`,`(${q.options.map((option,i)=>`<label class="inline-test-option"><input type="radio" name="${q.id}" value="${i}" data-answer-field>${option}</label>`).join(', ')})`):q.passage;
 let b=passage?`<div class="given">${passage}</div>`:'';
 if(q.image)b+=`<img class="q-image ${q.kind==='parts'?'parts':''} ${q.image.endsWith('.jpg')?'still3d':''}" src="./art/${q.image}" alt="${q.alt||(q.id==='a1'?'ㄱ·ㄴ·ㄷ·ㄹ을 표시한 원본 용수철저울 그림':'ㄱ·ㄴ·ㄷ의 눈높이를 표시한 원본 그림')}">`;
 if(q.graphic)b+=art(graphChoices(),'q-graphs');
 if(q.table)b+=table(q.table[0],q.table.slice(1));
 if(q.kind==='choice'&&!inlineOptions)b+=`<div class="q-options${q.pictureOptions?' picture-options':q.options.every(o=>o.length<=6)?' short-options':''}">${q.options.map((t,i)=>`<label><input type="radio" name="${q.id}" value="${i}" data-answer-field><span>${q.graphic||q.pictureOptions?'':`<i>${'①②③④⑤'[i]}</i>`}${t}</span></label>`).join('')}</div>`;
 if(q.kind==='text')b+=`<label class="short-answer">답 <input name="${q.id}" data-answer-field autocomplete="off" maxlength="40"></label>`;
 if(q.kind==='essay')b+=`<label class="essay-answer">답 <textarea name="${q.id}" data-answer-field rows="3" maxlength="400" placeholder="교재에 쓴 답을 여기에도 옮겨 써 보세요."></textarea></label>`;
 if(q.kind==='parts')b+=`<div class="parts-answers">${(q.slots||['ㄱ','ㄴ','ㄷ','ㄹ']).map((v,i)=>`<label>${v}<input name="${q.id}-${i}" data-answer-field autocomplete="off" maxlength="20"></label>`).join('')}</div>`;
 if(q.kind==='pair')b+=`<div class="pair-answers">${(q.slots||['㉠','㉡']).map((v,i)=>`<label>${v}<select name="${q.id}-${i}" data-answer-field><option value="">선택</option>${(q.choices||['조금','많이']).map(c=>`<option>${c}</option>`).join('')}</select></label>`).join('')}</div>`;
 if(q.kind==='set')b+=`<div class="parts-answers">${Array.from({length:q.count},(_,i)=>`<label>${'①②③④'[i]}<input name="${q.id}-${i}" data-answer-field autocomplete="off" maxlength="20"></label>`).join('')}</div>`;
 if(q.kind==='draw'&&q.figure==='pans')b+=`<div class="student-graphic">${art(weightsSheet(false),'print-graph pans-graph')}</div><div class="teacher-graphic">${art(weightsSheet(true),'print-graph pans-graph')}</div><p class="draw-note">추를 접시에 그려 넣거나, 양팔저울 체험에서 평형이 되는 조합을 찾아보세요.</p><button class="page-action" data-action="weights">양팔저울 체험 열기</button>`;
 else if(q.kind==='draw'){const items=earth3Items;b+=`<div class="student-graphic">${art(`<img class="still3d" src="./art/l3-earth-daily4.jpg" alt="지구 주변의 물체 세 개 3D 그림">`,'print-graph')}</div><div class="teacher-graphic">${art(`<img class="still3d" src="./art/l3-earth-daily4-arrows.jpg" alt="지구 주변 물체 세 개와 지구 중심을 향한 화살표 3D 그림">`,'print-graph')}</div><p class="draw-note">화살표는 교재에 직접 그리거나, 중력의 방향 체험에서 확인해 보세요.</p><button class="page-action" data-action="gravity">중력의 방향 체험 열기</button>`;}
 if(q.kind==='graph')b+=table(['추의 무게(g)','10','20','30'],[['늘어난 길이(cm)','4','8','12']])+`<div class="student-graphic">${art(graphSVG({step:4,labels:false}),'print-graph')}</div><div class="teacher-graphic">${art(graphSVG({step:4,points:[[10,4],[20,8],[30,12]]}),'print-graph')}</div>`+`<button class="page-action" data-action="assessment-graph">그래프에 점 찍고 제출하기</button>`;
 const answer=UNCONFIRMED.has(q.id)?'공식 해설 대조 필요':q.kind==='essay'?'서술형 · 교재 근거로 선생님이 확인':q.kind==='draw'?(q.figure==='pans'?'1~13 g를 모두 그림으로 나타내기 (물체 + 왼쪽 추 = 오른쪽 추가 되는 조합)':'세 물체 모두 지구 중심 방향으로 화살표'):Array.isArray(q.answer)?JSON.stringify(q.answer):q.options?q.options[q.answer]:q.answer;
 return prefix+b+`<div class="teacher-answer">정답: ${answer}<p>${UNCONFIRMED.has(q.id)?'공식 해설과 원문을 대조한 뒤 공개합니다.':q.why}</p></div><div class="question-feedback" data-feedback="${q.id}" hidden></div></div>`;
}
page('l1-test-a',1,[15],'DAILY TEST · 일일평가','내가 이해한 내용을\n확인해요.','1차시 · 원본 1~3번',q1.slice(0,3).map(q=>questionHTML(q)).join('')+`<button class="page-action" data-grade="1a">1~3번 제출하고 확인</button>`,'assessment','학생용은 답안을 제출하기 전 정답을 표시하지 않습니다. 1번의 네 부품을 각각 확인하며 한 번의 오답으로 오개념을 단정하지 않습니다.',{assessment:true});
page('l1-test-b',1,[15],'DAILY TEST · 일일평가','어디에서 읽고,\n어디에 매달까요?','1차시 · 원본 4~6번',q1.slice(3).map(q=>questionHTML(q)).join('')+`<button class="page-action" data-grade="1b">4~6번 제출하고 확인</button>`,'assessment','원본 그림의 기호와 N 단위를 그대로 보존했습니다. 눈높이 그림을 보지 않고 추측하지 않도록 합니다.',{assessment:true});

page('l2-elastic',2,[16],'OBSERVE · 모양의 변화','당겼다가 놓으면,\n어떻게 될까요?','추의 무게에 따른 용수철의 길이 변화',`
${section('01','힘을 줄 때 용수철의 모양 변화 관찰하기',art(springArt(), 'wide')+`<p>물체를 매달기 전, 매단 후, 손으로 잡아당겼을 때의 모습을 비교해 봅시다.</p>`)}
${section('02','용수철의 성질',`<div class="definition"><b>탄성</b><p>힘을 주어 변형된 용수철(물체)이 <span class="blank" data-reveal="원래 모양">__________</span>으로 돌아가려는 성질</p><small>예: 고무줄, 용수철, 고무공, 태엽</small></div>`)}
${section('03','잡아당겼을 때의 변화',`<p>고정된 용수철의 한쪽 끝을 잡아당기면 <b>늘어난 길이</b>는 잡아당긴 힘의 크기에 비례합니다.</p><ul><li>작은 힘으로 잡아당기면 조금 늘어납니다.</li><li>큰 힘으로 잡아당기면 많이 늘어납니다.</li><li>작용한 힘의 크기는 화살표의 길이로 표현합니다.</li></ul>`)}
${act('elastic','직접 당기고 놓아 관찰하기')}`,'elastic','본책의 범위 안에서 탄성과 변형을 설명합니다. 탄성 한계를 넘는 실제 변형은 이 모형의 적용 범위가 아님을 구분합니다.');

page('l2-compress',2,[17],'COMPARE · 누르는 힘','전체 길이와\n줄어든 길이는 달라요.','용수철을 눌렀을 때의 변화',`
${art(springArt({mode:'compress'}),'wide')}
${section('04','용수철을 눌렀을 때의 변화',`<p>손으로 용수철을 누르면 줄어든 길이는 누른 힘의 크기에 비례합니다.</p><ol><li>누르는 힘이 클수록 용수철의 전체 길이는 짧아집니다.</li><li>원문: “누른 힘은 용수철의 전체 길이와 반비례 관계이다.”</li><li>누른 힘은 용수철의 줄어든 길이와 비례 관계입니다.</li></ol>`)}
${note('원문 표현을 확인해요','원문에는 ‘전체 길이와 반비례’라고 쓰여 있습니다. 이 샘플은 그 문장을 남기되, ‘힘이 커질수록 전체 길이가 짧아진다’와 수학적 반비례를 같다고 자동 채점하지 않습니다. 실험에서는 전체 길이와 줄어든 길이를 따로 표시합니다.')}
${act('compression','누르는 힘과 두 길이 비교하기')}
${ask('힘을 더 크게 주었을 때 커지는 것은 전체 길이인가요, 줄어든 길이인가요?',2)}`,'compression','검토 필요: 일반적인 탄성 범위에서 F=kΔL, L=L0−ΔL이므로 전체 길이 L이 F에 역비례하는 식은 아닙니다. 원문은 보존하고 학습 설명에 별도 주석을 둡니다.');

page('l2-measure',2,[17],'EXPERIMENT · 관찰과 기록','같은 추를 하나씩.\n늘어난 길이를 기록해요.','추를 매단 개수와 용수철의 늘어난 길이',`
${section('05','추를 매단 개수에 따른 변화',art(loadArt(),'wide')+`<p>같은 무게의 추를 하나씩 더 매달면 용수철이 늘어난 길이도 일정하게 증가합니다. 위의 1 N·2 N·3 N 그림은 힘을 비교하는 본문의 개념 그림입니다.</p>`)}
${section('06','추의 무게와 늘어난 길이 사이의 관계',table(['추의 무게(g)','10','20','30'],[['늘어난 길이(cm)','3','6','9']]))}
${note('두 자료를 섞지 않아요','위 그림의 N과 아래 실험 표의 g는 서로 다른 자료입니다. 10 g을 1 N으로 바꾸지 않습니다. 실험에서는 본책 표의 10·20·30 g → 3·6·9 cm 관계를 사용합니다.')}
<div class="page-actions">${act('measure','추를 매달고 자로 읽기')}${act('spring-film','실제 용수철 운동 영상 보기')}</div>
${ask('추의 무게가 두 배가 되면 늘어난 길이는 어떻게 될까요?',1)}`,'measure','원래 길이와 전체 길이를 구분하도록 기준선을 표시합니다. 실험에서는 원래 길이를 5 cm로 둔 추가 모형임을 명시하고, 늘어난 길이는 본책 데이터를 따릅니다.');

page('l2-graph',2,[18],'DATA · 표에서 그래프로','숫자가 점이 되고,\n관계가 보여요.','가로축: 추의 무게 / 세로축: 늘어난 길이',`
<div class="student-graphic">${art(graphSVG(),'graph-full')}</div><div class="teacher-graphic">${art(graphSVG({points:[[10,3],[20,6],[30,9]]}),'graph-full')}</div>
${act('graph','표를 보고 그래프에 점 찍기')}
<div class="conclusion"><h3>결론</h3><p>① 추의 무게가 <b>일정하게 늘어나면</b> 용수철의 길이도 <b>일정하게 늘어납니다.</b></p><p>② 추의 개수가 <b>일정하게 늘어나면</b> 용수철의 길이도 <b>일정하게 늘어납니다.</b></p></div>
<section class="inquiry"><div class="eyebrow">SPEED QUESTION</div><p>추의 무게가 일정하게 증가하면 용수철의 길이도 일정하게 증가한다. 이런 관계를 (<button class="inline-choice" data-quick="비례">비례</button>, <button class="inline-choice" data-quick="반비례">반비례</button>) 관계라고 한다.</p><div class="quick-result"></div><div class="write-lines"><i></i></div></section>`,'graph','앞의 표 10 g→3 cm, 20 g→6 cm, 30 g→9 cm를 그대로 점으로 옮깁니다. 세로축은 전체 길이가 아니라 늘어난 길이입니다.');

const toolRows=[['stapler','스테이플러','용수철의 길이가 줄었다 늘어날 때 심을 밀어 준다.'],['pen','볼펜','용수철의 길이가 줄었다 늘어날 때 볼펜심을 안으로 들어가게 한다.'],['pogo','스카이 콩콩','용수철의 길이가 줄었다 늘어날 때 뛰어 오른다.'],['trampoline','트램펄린','용수철의 길이가 늘어난 후 되돌아오면서 뛰어 오른다.'],['expander','완력기','용수철의 길이가 늘어난 후 되돌아오는 원리로 운동을 할 수 있다.'],['trap','쥐덫','용수철의 길이가 늘어난 후 되돌아오면서 덫이 작동하여 쥐를 잡아준다.']];
export {toolRows};
page('l2-tools',2,[19],'EVERYDAY SCIENCE · 쉬어가기','도구 안의 용수철은\n어떤 일을 할까요?','용수철이 사용된 도구',`
${section('01','늘어나는 길이 변화에 영향을 줄 수 있는 요소',`<div class="factor-row"><b>재질</b><b>철사의 굵기</b><b>용수철의 지름</b></div>`)}
<p class="small-text">원문은 ‘용수철의 재질·굵기·지름’을 제시합니다. 아래 설명은 본책의 분류이며 실제 도구는 구조와 모델에 따라 다를 수 있습니다.</p>
<div class="tools-grid">${toolRows.map(([k,t,d])=>`<section>${art(toolIcon(k))}<h3>${t}</h3><p>${d}</p></section>`).join('')}</div>
${note('같은 조건으로 비교하기','재질·철사 굵기·코일 지름 중 한 조건만 바꾸고 나머지는 같게 둡니다. 색깔만 바꾸는 것은 같은 실험이 아닙니다.')}
${act('tools','도구를 확대하고 역할 분류하기')}`,'tools','원문의 쥐덫·스테이플러 설명은 제품 구조에 따라 달라질 수 있습니다. 샘플은 본책 분류를 보존하고 도해에 ‘개념 모형’임을 표시합니다. 원본 인용을 모든 실제 제품에 일반화하지 않습니다.',{dense:true});

page('l2-test-a',2,[20],'DAILY TEST · 일일평가','변화와 그래프를\n연결해 봅시다.','2차시 · 원본 1~4번',`<div class="test-grid">${q2.slice(0,4).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="2a">1~4번 제출하고 확인</button>`,'assessment','3번 보기 ②는 증가하지만 원점을 지나지 않습니다. ‘늘어난 길이’ 조건 때문에 ③을 고르는지 확인합니다.',{assessment:true,dense:true});
page('l2-test-b',2,[20,21],'DAILY TEST · 일일평가','문장 속 개념을\n정확하게 골라요.','2차시 · 원본 5~11번',`<div class="test-grid compact-test">${q2.slice(4,11).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="2b">5~11번 제출하고 확인</button>`,'assessment','6·8번은 같은 무게의 추라는 문맥, 9번은 같은 변형량에서 철사 굵기를 비교하는 조건, 11번은 정지해 있는 상태를 확인합니다.',{assessment:true,dense:true});
page('l2-test-graph',2,[21],'DAILY TEST · 일일평가','이번에는 다른 표.\n새 그래프를 완성해요.','2차시 · 원본 12번',questionHTML(q2[11])+ask('앞의 본문 실험 그래프와 무엇이 다른지 설명해 보세요.',2),'assessment-graph','이 문제는 본문과 다른 데이터입니다. 반드시 10·20·30 g→4·8·12 cm를 사용합니다. 표를 다시 읽지 않고 앞의 3·6·9를 기억해서 쓰는지 확인합니다.',{assessment:true});

// ── 3차시: 본책 22~29쪽 (CHAPTER 03 중력 · CHAPTER 04 무게와 질량의 비교 · Daily Test 01~09) ──
// 교재는 수정하지 않고 교재대로 옮긴다. 우려되는 표현은 teacher 메모에만 남긴다(투사·학생 화면 비표시).
const bookLine=text=>`<p class="source-line">${text}</p>`;
page('l3-newton',3,[22],'GRAVITY · 만유인력','사과는 왜\n아래로 떨어질까요?','만유인력은 뉴턴의 사과이다',`${bookLine('뉴턴은 사과가 아래로 떨어지게 만드는 힘, 즉 중력이 작용하기 때문에 사과가 아래로 떨어지는 것이고, 중력은 우주에 있는 모든 물체 사이에 존재하는 힘이라고 생각하였습니다.')}${bookLine('만유인력은 뉴턴이 처음으로 이야기한 것으로 질량을 가지고 있는 물체들이 서로 끌어당기는 힘을 말합니다.')}`,null,'교재 22쪽 ①을 그대로 읽습니다. “우주의 모든 물체 사이의 힘”과 “지구가 지구 위 물체를 끌어당기는 힘”을 한 문장에 섞지 않고 교재 순서대로 소개합니다.');
page('l3-gravity',3,[22],'GRAVITY · 중력','중력은\n어디를 향할까요?','중력의 뜻 · 방향 · 크기',`${bookLine('지구가 지구 위 물체를 지구의 중심으로 잡아당기는 힘')}${bookLine('중력은 지구 중심을 향하는데, 이것은 추를 실에 매달아 가만히 들고 있을 때 추가 가리키는 방향과 같다. (연직 방향)')}${bookLine('물체의 질량이 클수록 물체에 작용하는 중력이 크고, 지구의 중심에서 멀어 질수록 중력은 작아진다. 또, 중력은 측정 장소에 따라 그 크기가 달라진다.')}`,null,'교재 22쪽 ②의 세 가지 표현(뜻)을 먼저 말해 보게 하고, 방향과 크기는 교재 문장 그대로 정리합니다.');
page('l3-direction',3,[23],'EXPERIMENT · 중력의 방향','어느 위치에서든\n지구 중심 쪽으로.','Speed Question · ①~④ 위치에서 떨어지는 방향',`${bookLine('①~④번의 위치에서 물체를 놓으면 떨어지는 방향을 화살표로 표시 하시오.')}`,'gravity','교재 23쪽의 Speed Question을 그대로 씁니다. 교재 23쪽과 25쪽에 “무게와 중력의 뜻은 같지 않다”는 주의가 있는데, 25쪽 ①은 무게를 “물체에 작용하는 중력의 크기”라고 합니다. 교재 안에서 충돌하는 표현이라 교재대로 두고 검수 대기로 남깁니다(교사 메모, 학생·투사 화면에는 표시하지 않음).');
page('l3-uses',3,[24],'EVERYDAY SCIENCE · 쉬어가기','중력 때문에 일어나는 일,\n중력을 이용한 것들.','중력에 의한 현상을 이용해 본 것들',`${bookLine('번지점프를 하면 아래로 떨어진다. · 들고 있던 물체를 놓으면 땅으로 떨어진다. · 운석이 지구로 떨어진다. · 물이 높은 곳에서 낮은 곳으로 흐른다.')}${bookLine('물레방아, 수력 발전소, 스키·다이빙·번지점프·스카이다이빙은 중력을 이용하고, 역도·높이뛰기 등은 중력을 극복하는 능력을 겨루는 스포츠이다.')}`,null,'교재 24쪽의 서술을 그대로 읽습니다. 도해는 서술을 나타내는 개념 그림이며 사진이 아닙니다.');
page('l3-weight',3,[25],'WEIGHT · 무게','무게는\n어떻게 나타낼까요?','무게의 뜻 · 단위 · 용수철로 무게의 크기 표현하기',`${bookLine('‘무게’의 뜻: 물체에 작용하는 중력의 크기')}${bookLine('무게의 단위: N (뉴턴)')}${bookLine('용수철의 길이가 많이 늘어날수록 매달린 물체의 무게가 크다. 무게 10 g의 추가 매달렸을 때보다 무게 100 g의 추가 매달렸을 때 용수철의 길이가 더 많이 늘어난다.')}`,'elastic','교재 25쪽 ①~③을 그대로 씁니다. 같은 쪽의 주의 문구(“무게와 중력의 뜻은 같지 않습니다”)와 ① 무게의 뜻이 교재 안에서 충돌해, 이 장면에서는 ①의 정의를 기준으로 가르치고 충돌은 교사 메모로만 남깁니다(검수 대기).');
page('l3-place',3,[25,26],'WEIGHT · 측정과 장소','장소가 바뀌면\n무게는 어떻게 될까요?','무게의 측정 방법 · 측정하는 장소에 따른 무게 변화',`${bookLine('측정방법: 용수철저울의 원리를 이용한 측정 기구들을 사용한다. 측정도구: 용수철저울, 체중계, 앉은뱅이저울(가정용 저울)')}${bookLine('1Kg = 1Kg·f = 9.8N')}${bookLine('달에서 중력은 지구 중력의 1/6배이다. 달에서 측정한 무게는 지구에서 측정한 무게의 1/6배가 된다. (예) 지구에서 무게가 58.8N인 물체를 달에서 측정하면 지구 1/6인 9.8N이 된다.')}`,'moon-weight','교재 25쪽 ④와 26쪽 ⑤를 그대로 씁니다. “1Kg = 1Kg·f = 9.8N”은 질량 단위(kg)와 힘 단위(kgf, N)를 등호로 묶은 교재 표기입니다. 교재 표기를 그대로 두고 표기 문제는 검수 대기(교사 메모)로 남깁니다. 수치는 교재의 58.8 N → 9.8 N만 사용합니다.');
page('l3-height',3,[26],'THINK · 중력과 관계되는 것들','높은 곳에서는\n무엇이 달라질까요?','중력과 관계되는 것들의 증가와 감소 변화',`${bookLine('몸무게가 100kg인 ‘우루사쌤’이 전자저울을 가지고 산 정상에 올라가서 몸무게를 측정하였더니 변함없이 100kg 이었습니다. 바늘로 몸무게를 가리키는 아날로그 체중계로 다시 측정하였더니 97.2kg을 가리켰습니다. 왜 이런 일이 벌어질지 예측해보고 아래의 ( )에 ‘크다’, ‘작다’는 표현을 써서 알맞게 채워 넣으세요.')}${bookLine('높이 · 중력 · 기압 · 기온 · 끓는점의 높다/낮다 변화를 ( )에 써 넣기')}${bookLine('Speed Question: 창준과 인호는 취사가 되는 ‘우루산’으로 등산하기 위해 준비하고 있습니다. 이 때 ①쌀, ②고기 중 한 가지만 선택해 가지고 가야 한다면 무엇을 선택할 수 있을까요? 그 이유는 무엇일까요?')}`,null,'교재 26쪽 ⑥ 빈칸의 정답은 교재에 인쇄돼 있지 않아 공식 근거 전까지 정답을 만들거나 공개하지 않습니다. 학생의 예상과 까닭을 먼저 듣고 기록합니다. Speed Question(쌀/고기)도 열린 질문이라 정답을 만들지 않습니다. 전자저울 100 kg · 아날로그 체중계 97.2 kg은 교재가 소개한 사례로만 읽습니다.');
page('l3-mass',3,[27],'MASS · 질량','질량은\n무게와 어떻게 다를까요?','질량의 뜻 · 단위 · 측정 방법 · 무게와의 관계',`${bookLine('질량의 뜻: 장소에 따라 변하지 않는 물체의 고유한 양')}${bookLine('질량의 단위: kg(킬로그램), g(그램)')}${bookLine('측정방법: 수평잡기 원리를 이용한 측정 기구들을 사용하여 측정. 측정도구: 윗접시저울, 양팔저울, 대저울')}${bookLine('질량은 어느 곳에서나 같다. 같은 장소에서 무게는 질량이 클수록 크다. 즉, 질량이 1kg인 물체가 지구에서의 무게가 약 9.8N이므로 질량이 6kg인 물체는 지구에서 무게가 약 9.8N×6=58.8N이 된다.')}`,null,'교재 27쪽 ⑦~⑩을 그대로 씁니다. 질량 1 kg ↔ 약 9.8 N, 6 kg ↔ 약 58.8 N은 교재가 든 예입니다. 수평잡기 원리는 4차시(30쪽~)에서 배우므로 이 장면에서는 도구 이름만 소개합니다.');
page('l3-compare',3,[27],'COMPARE · 무게와 질량','같은 사람, 다른 장소.\n무엇이 달라질까요?','무게와 질량의 비교',`${bookLine('질량: 물체의 고유한 양 · m (mass) · kg, g · 측정 도구 윗접시저울, 양팔저울, 대저울')}${bookLine('무게: 물체에 작용하는 중력의 크기 · W (weight) · N(뉴턴), kg.f(킬로그램힘), kg중(킬로그램중), g.f(그램힘), g중(그램중) · 측정 도구 용수철저울, 앉은뱅이저울, 체중계')}${bookLine('60kg인 사람이 달에서의 질량과 무게: 질량 60 kg, 무게는 60kg.f의 1/6인 10kg.f 또는 60kg × 9.8N = 588N 이므로 지구의 1/6인 98N이 된다.')}`,'weight-mass','교재 27쪽 ⑪ 비교 표를 그대로 씁니다. 달 무게 서술이 kg.f와 N을 함께 쓰는 표기 혼재라 교재 표기는 그대로 두고 검수 대기(교사 메모)로 남깁니다. 질량 60 kg, 무게 588 N → 98 N만 사용합니다.');
page('l3-graph',3,[28],'DATA · 질량과 무게','질량이 커지면\n무게도 커져요.','무게와 질량의 관계 그래프로 표현하기',`${bookLine('질량이 증가하면 무게도 증가한다. 무게와 질량은 비례 관계이다.')}`,'mass-weight-graph','교재 28쪽 ⑫의 그래프는 정비례 관계(원점을 지나는 직선)를 나타내는 모식 그림입니다. 점은 교재 27쪽에 나온 값(1 kg → 9.8 N, 6 kg → 58.8 N)만 씁니다.');
page('l3-estimate',3,[28],'COMPARE · 어림과 기준','손으로 어림하면\n어떤 점이 어려울까요?','손으로 어림하여 물체의 무게 비교하기 · 기준물체',`${bookLine('장점: 두 물체의 무게 차이가 큰 경우 비교하기 쉽다. 단점: 무게 차이가 작은 물체의 무게를 정확하게 비교하기가 어렵다.')}${bookLine('기준물체의 뜻: 모양, 크기, 무게가 모두 일정한 물체 (예) 같은 종류의 동전(10원, 50원, 100원), 클립, 바둑알. 기준물체를 이용하여 무게를 측정할 때, 물체의 무게는 기준 물체의 개수와 같다.')}`,null,'교재 28쪽 ⑬⑭를 그대로 씁니다. 기준물체로 쓸 수 있는 것과 없는 것(사용한 연필, 여러 모양의 단추)을 구분해 말하게 합니다.');
export const earth3Items=[{angle:38,kind:'beach'},{angle:205,kind:'ball'},{angle:305,kind:'tennis'}];   // Daily Test 4의 세 물체
export const q3=[
{id:'c1',n:1,kind:'text',q:'지구 중심으로 끌어당기는 힘을 (        ) 이라고 한다.',answer:'중력',concept:'gravity',why:'지구가 물체를 지구 중심 방향으로 끌어당기는 힘을 중력이라고 합니다. (교재 22쪽)'},
{id:'c2',n:2,kind:'text',q:'‘중력의 크기’를 나타내는 단어는 (        )이다.',answer:'무게',concept:'weight',why:'무게는 물체에 작용하는 중력의 크기입니다. (교재 25쪽)'},
{id:'c3',n:3,kind:'parts',q:'1kg = (     )kg·중 = (     )N',slots:['①','②'],answer:['1','9.8'],concept:'weight',why:'교재 25쪽에 1Kg = 1Kg·f = 9.8N으로 나와 있습니다.'},
{id:'c4',n:4,kind:'draw',q:'다음은 지구 주변에 물체 3개를 아무 조건 없이 위치시켰다. 물체에 작용하는 힘(중력)의 방향을 화살표로 표시하시오.',figure:'earth3',concept:'gravity',why:'중력은 지구 중심을 향합니다. 세 물체 모두 지구 중심 쪽으로 화살표를 그립니다. (교재 22~23쪽)'},
{id:'c5',n:5,kind:'text',q:'지구에서 60kg인 사람이 달에 가면 (        )kg이다.',answer:'60',concept:'mass',why:'질량은 장소에 따라 변하지 않아 달에서도 60 kg입니다. (교재 27쪽)'},
{id:'c6',n:6,kind:'text',q:'물체의 고유한 양을 표현할 때는 (        )으로 표현한다.',answer:'질량',concept:'mass',why:'질량은 장소에 따라 변하지 않는 물체의 고유한 양입니다. (교재 27쪽)'},
{id:'c7',n:7,kind:'set',q:'질량을 측정하는 저울의 종류 2가지를 쓰시오.',count:2,accept:['윗접시저울','양팔저울','대저울'],other:['용수철저울','체중계','앉은뱅이저울','가정용저울'],answer:['윗접시저울','양팔저울'],concept:'mass',why:'질량 측정 도구는 윗접시저울, 양팔저울, 대저울입니다. 이 중 두 가지를 쓰면 됩니다. (교재 27쪽)'},
{id:'c8',n:8,kind:'set',q:'무게를 측정하는 저울의 종류 2가지를 쓰시오.',count:2,accept:['용수철저울','체중계','앉은뱅이저울','가정용저울'],other:['윗접시저울','양팔저울','대저울'],answer:['용수철저울','체중계'],concept:'weight',why:'무게 측정 도구는 용수철저울, 체중계, 앉은뱅이저울입니다. 이 중 두 가지를 쓰면 됩니다. (교재 25쪽)'},
{id:'c9',n:9,kind:'pair',q:'다음 〈조건〉에 대한 변화 중 내용에 맞게 ○표를 하시오.',passage:'〈조건〉 중력이 증가할 경우',slots:['(1) 공기의 양','(2) 기압','(3) 밀도의 크기','(4) 기온','(5) 끓는점'],choices:['↑','↓'],answer:['','','','',''],concept:'gravity',why:'이 문항의 공식 정답·해설은 아직 확인되지 않아 공개하지 않습니다.'}
];
page('l3-test',3,[29],'DAILY TEST · 일일평가','중력, 무게, 질량을\n구분해 봅시다.','3차시 · 원본 1~9번',`<div class="test-grid compact-test">${q3.map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p32">1~9번 제출하고 확인</button>`,'assessment','9번은 공식 정답·해설을 확인하기 전까지 정답을 공개하지 않습니다. 4번은 화살표를 직접 그리게 하고 지구 중심 방향인지 함께 확인합니다.',{assessment:true,dense:true});
// ── 4차시: 본책 30~35쪽 (CHAPTER 05 수평잡기의 원리 · Daily Test · 과학 이야기 '엔진 없이 비탈길 오르는 바퀴') ──
// 문장은 교재 표기 그대로 옮긴다(띄어쓰기·구두점 포함). 교재 표기 문제는 교사 메모와 검수 문서에만 남긴다.
page('l4-level',4,[30],'LEVEL · 수평','수평이란\n무엇일까요?','수평이란?',`${bookLine('① 한쪽으로 치우치거나 기울어지지 않고 균형이 맞는 평평한 상태.')}${bookLine('② 지구의 중력방향과 수직을 이루는 것')}`,null,'교재 30쪽 ①을 그대로 읽습니다. 두 그림에서 빨간 선(수평)이 중력 방향 화살표와 직각을 이루는 것을 찾게 합니다.');
page('l4-principle',4,[30],'LEVEL · 수평 잡기의 원리','무거운 물체는\n어디에 놓을까요?','수평 잡기의 원리 · 수평일 때 물체의 무게 비교',`${bookLine('(1) 양쪽의 물체가 수평이 됐을 때 무거운 물체는 받침점에서 가깝고, 가벼운 물체는 받침점에서 멀다.')}${bookLine('(2) 양쪽의 물체가 수평이 됐을 때 물체의 놓인 거리가 서로 같으면 양쪽에 놓인 물체의 무게는 서로 같다.')}${bookLine('① 놓인 거리가 같은 경우, 물체의 무게는 같다. ② 놓인 거리가 다른 경우는 무거운 물체가 받침점에서 가까운 곳에 놓인다.')}`,'lever','교재 30쪽 ②③을 그대로 씁니다. 체험은 같은 무게의 상자 개수와 받침점으로부터의 칸 수만 바꿉니다. 수평 잡기의 원리는 3차시 27쪽에서 질량을 재는 도구(윗접시저울·양팔저울·대저울)의 원리로 이미 소개되었습니다.');
page('l4-formula',4,[31],'FORMULA · 수평잡기 공식','무게 × 거리가\n같으면 수평이에요.','수평잡기 공식 · 같은 거리에 놓인 A상자와 B상자',`${bookLine('수평잡기 공식: 무게 × 거리 = 무게 × 거리')}${bookLine('받침점으로부터 같은 거리에 놓인 A상자와 B상자가 수평일 때 무게 비교하기')}${bookLine('<가정하면,> 왼쪽 상자의 무게 (W₁) x 받침점(O)에서 A지점까지 놓여진 거리 (a)')}${bookLine('오른쪽 상자의 무게 (W₂) x 받침점(O)에서 B지점까지 놓여진 거리 (b)')}${bookLine('W₁ × a = W₂ × b')}${bookLine('여기서, ①번 물체가 놓여있는 지점에서 받침점까지의 거리는 4칸, ②번 물체가 놓여있는 지점에서 받침점까지의 거리는 4칸 이므로, 수평일 때 a : b의 거리비가 1:1이 된다. 그러므로 W₁과 W₂의 무게비도 1:1이 된다.')}`,'lever','교재 31쪽 ④⑤를 그대로 씁니다. 공식의 “무게”는 같은 무게의 상자 개수로 읽게 합니다. 거리가 같으면(1:1) 무게도 같다는 결론까지 연결합니다.');
page('l4-tilt',4,[32],'TILT · 기울어지는 이유','왜 한쪽으로\n기울어질까요?','한 쪽으로 기울어지는 이유는?',`${bookLine('①번 물체가 놓인 A지점에서 받침점 O 까지의 거리보다 ②번 물체가 놓인 B지점에서 받침점 O 까지의 거리가 더 멀기 때문에 ‘무게 × 거리’하게 되면 ②번 물체가 놓인 오른쪽이 더 무거워져 ‘오른쪽으로 기울어진다’.')}`,'lever','교재 32쪽 ⑥을 그대로 씁니다. 같은 무게의 상자를 한 개씩 A(2칸)와 B(4칸)에 놓은 그림입니다(교재 ⑥은 상자의 무게를 따로 쓰지 않아, 이 체험은 같은 무게의 상자로 조건을 맞춥니다).');
page('l4-unequal',4,[32],'BALANCE · 다른 거리','거리가 달라도\n수평이 될 수 있어요.','받침점으로부터 다른 거리에 놓인 A상자와 B상자',`${bookLine('받침점으로부터 다른 거리에 놓인 A상자와 B상자가 수평일 때 무게 비교하기')}${bookLine('<같은 무게의 상자가 왼쪽 A위치에 2개, 오른쪽 B위치에 1개 놓여있다고 가정하면 >  W₁ × a = W₂ × b')}${bookLine('왼쪽 상자의 무게 (W₁) x 받침점(O)에서 A지점까지 놓여진 거리 (a)는 오른쪽 상자의 무게 (W₂) x 받침점(O)에서 B지점까지 놓여진 거리 (b)와 같다.')}${bookLine('상자 2개의 무게 × 2칸 = 상자1개의 무게 × 4칸')}`,'lever','교재 32쪽 ⑦을 그대로 씁니다. 왼쪽 2개×2칸 = 오른쪽 1개×4칸을 학생이 체험에서 직접 만들게 합니다.');
page('l4-wheel',4,[34],'SCIENCE STORY · 과학 이야기','엔진 없이\n비탈길을 오르는 바퀴?','엔진 없이 비탈길 오르는 바퀴 · 바퀴의 등장과 무게중심',`${bookLine('우리가 어딘가로 이동하기 위해 타는 자전거나 자동차, 비행기 등에는 모두 바퀴가 사용됩니다. 바퀴는 6,000여 년 전 지금의 이라크 땅 수메르에서 만들어졌고, 바퀴가 생기고 나서 물건을 옮기거나 여행하는 일이 훨씬 쉬워졌습니다.')}${bookLine('여기서 잠깐 바퀴의 모양을 살펴볼까요? 크기나 재질은 달라도 모든 바퀴의 모양은 ‘원’입니다. 어느 한 군데 모난 곳 없는 둥근 생김새 덕분에 앞으로 굴러가야하는 바퀴 모양으로는 제격입니다. 그런데 아무리 원 모양이어도 계속 굴러가기 위해서는 힘을 가해줘야 하고. 자동차에는 힘을 줄 수 있는 엔진이 있어 바퀴를 굴려 달릴 수 있습니다. 하지만 엔진 없이도 비탈길을 올라가는 바퀴를 만들 수 있다면? 그것도 ‘무게중심’의 원리를 이용한다면 가능할까요?')}${bookLine('무게중심은 물체 각 부분에 작용하는 중력들이 모아지는 작용점을 말합니다. 쉽게 설명하면 물체의 무게가 어느 쪽으로도 치우치지 않도록 공평하게 나눠주는 점을 말합니다. 무게중심은 아래에 있을수록 안정합니다. 오뚝이는 아랫부분이 무겁게 만들어져 바닥과 가까운 곳에 무게중심이 위치하기 때문에 넘어져도 금방 균형을 되찾고 다시 일어납니다.')}`,null,'교재 34쪽의 서술을 그대로 읽습니다. 바퀴의 연대와 장소(6,000여 년 전, 수메르)는 교재의 서술이며 별도로 검증한 연표가 아닙니다. 교재 문장의 띄어쓰기·구두점(“굴러가야하는”, “가해줘야 하고.”)은 고치지 않았습니다.');
page('l4-ramp',4,[34,35],'EXPERIMENT · 실험','바퀴를 만들어\n비탈길에 올려 봐요.','실험과정 · 비탈길 위의 바퀴 관찰하기',`${bookLine('실험에서 깔때기 모양의 종이 두 개의 입구 부분을 맞붙이면 깔때기가 마주 붙은 중심부가 무게중심이 되고. 바퀴가 굴림대를 따라 올라가는 모습을 옆에서 보면 아래 [사진]처럼 바퀴의 중심부가 점점 굴림대에 가까이 가는 것을 볼 수 있습니다. 바퀴 자체는 언덕 위쪽으로 올라가지만, 바퀴의 무게중심은 바닥에 가까워져 가는 것입니다. 때문에 동력 없이도 자연스레 경사진 비탈길을 따라 올라가는 것처럼 보이는 것입니다.')}${bookLine('① 두꺼운 종이 위에 도면1의 4귀퉁이를 풀칠해 고정시키고, 안쪽 점선 부분을 볼펜으로 긋는다. ② 도면의 바깥쪽 실선 부분을 칼로 자른다. ③ 볼펜 선을 따라 도면을 접는다. 넓은 면 양쪽을 풀칠로 고정하고 좁은 면 앞쪽의 고리를 끼워 비탈길을 완성한다.')}${bookLine('④ 도면 2도 ①번과 ②번 방법처럼 자른다. ⑤ 깔때기 두 개의 입구 부분을 서로 마주보도록 하고 테이프로 고정시킨다. ⑥ 비탈길을 평평한 곳에 놓고 5에서 만든 바퀴를 비탈길 가장 낮은 부분에 올리고 움직임을 관찰한다.')}`,null,'교재 34쪽 끝과 35쪽 실험과정을 그대로 씁니다. 실험에 쓰는 도면 1·2는 30~35쪽에 실려 있지 않아, 수업 전에 준비물(도면·두꺼운 종이·풀·칼·테이프)과 비탈길 모양을 확인해야 합니다. 교재 서술만으로는 비탈길의 모양을 판단하지 않습니다.');
export const weightTargets=Array.from({length:13},(_,i)=>i+1);
export const weightAnswers=Object.fromEntries(weightTargets.map(t=>[t,weightPlans(t)[0]]));
export const weightsGiven={left:[],right:[1]};   // 교재 33쪽: 1g 칸의 오른쪽 접시에 1g 추가 예로 그려져 있다.
export const weightsSheet=answers=>`<div class="weights-sheet">${weightTargets.map(t=>{const name=t===1||answers?`l4-pans-${t}`:'l4-pans-empty';return `<figure data-pan="${t}"><img class="still3d" src="./art/${name}.jpg" alt="${t}그램 물체를 재는 3D 양팔저울${name==='l4-pans-empty'?' 빈 그림':' · 평형이 되는 추 조합'}"><figcaption>${t}g</figcaption></figure>`;}).join('')}</div>`;
export const q4=[
{id:'e1',n:1,kind:'draw',figure:'pans',q:'1g, 3g, 9g의 저울추가 각각 1개씩 있습니다. 세 종류를 추를 이용하여 달 수 있는 물체의 무게를 그림을 그려 모두 나타내어 보시오.',concept:'balance',why:'물체와 추를 양팔저울에 올려 평형이 되는 조합으로 확인합니다. 1·3·9 g 추를 한 번씩만 쓰면 1~13 g마다 조합이 하나뿐입니다. (교재 33쪽)'}
];
page('l4-test',4,[33],'DAILY TEST · 일일평가','추 세 개로\n얼마까지 달 수 있을까요?','4차시 · 원본 1번',`<div class="test-grid compact-test">${q4.map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p40">1번 제출하고 확인</button>`,'assessment','교재에는 정답이 인쇄돼 있지 않아 자동 채점하지 않고 선생님이 확인합니다. 교사용 그림은 평형 조건(물체+왼쪽 추=오른쪽 추)으로 도출한 조합입니다. 1g 칸의 예는 교재에 그려져 있습니다.',{assessment:true,dense:true});
// ── 5차시: 본책 36~40쪽 (CHAPTER 06 앉은뱅이저울의 구조 · CHAPTER 07 윗접시저울의 구조 · Daily Test 01~12) ──
// 문장은 교재 표기 그대로 옮긴다. 교재 표기 문제·도출한 정답은 교사 메모와 검수 문서에만 남긴다.
const boxLine=(title,text)=>`<p class="source-line"><b>${title}</b> ${text}</p>`;
page('l5-kitchen',5,[36],'CHAPTER 06 · 앉은뱅이저울','저울 속에는\n무엇이 있을까요?','용수철저울의 원리 : 앉은뱅이저울의 구조',`${bookLine('※ 앉은뱅이저울은 2009년도 교육과정에서 가정용저울로 표기되어 사용되다가 2015 교육과정에서 앉은뱅이저울로 표기 변경 되었다. 교육과정 변경 시 다시 변경되어질 수 있으므로 양쪽의 표현법을 모두 알아 둘 필요가 있다.')}${bookLine('관찰①_접시를 누르면 바늘의 위치와 저울 안의 용수철 길이가 변한다.')}${bookLine('관찰②_영점 조절 나사를 돌리면 저울의 바늘이 움직인다.')}${boxLine('가정용 저울에 적용된 원리','용수철이 늘어나고 줄어듦에 따라 용수철과 연결된 저울의 바늘이 움직인다.')}`,'kitchen-scale','교재 36쪽 ①을 그대로 읽습니다. 교재의 사진(가정용저울의 겉과 속)은 3D 그림으로 바꿨습니다. 체험에서 겉판을 열고 접시를 눌러 관찰①을, 영점 조절 나사를 돌려 관찰②를 직접 확인하게 합니다.');
page('l5-kitchen-use',5,[36],'HOW TO USE · 사용방법','가정용 저울은\n어떤 순서로 쓸까요?','가정용 저울의 사용방법',`${bookLine('① 편평한 곳에 위치시킨다.')}${bookLine('② 바늘이 0을 가리키는지 확인한다.')}${bookLine('③ 물체를 올리고, 눈금을 읽어 무게 측정한다.')}`,'kitchen-scale','교재 36쪽 ②의 세 단계를 그대로 씁니다. 1차시 용수철저울의 영점 확인(물체를 달기 전에 0 확인)과 같은 순서임을 연결합니다. 체험의 물체 무게(사과 230 g 등)는 가상의 값입니다.');
page('l5-toppan',5,[37],'CHAPTER 07 · 윗접시저울','윗접시저울은\n어떻게 생겼을까요?','수평잡기의 원리 : 윗접시저울의 구조',`${bookLine('① 영점 조절 나사 : 바늘이  0 점에 오도록 조정하는 나사이다.')}${bookLine('② 접시 : 물체와 추를 올려놓는 곳이다. (왼쪽 접시)에는 측정하고자 하는 물체를 올려놓고 (오른쪽 접시)에는 분동을 올려놓는다.')}${bookLine('③ 팔받침 : 팔이 크게 움직이는 것을 막아 주는 역할을 한다.')}`,'top-pan','교재 37쪽 ①을 그대로 읽습니다. 그림의 이름표(눈금판·접시·영점조절나사·팔받침) 중 눈금판은 교재에 하는 일이 따로 쓰여 있지 않습니다. 4차시 수평잡기의 원리(받침점에서 같은 거리)와 연결합니다.');
page('l5-toppan-use',5,[37],'HOW TO USE · 사용하는 방법','분동은\n어떤 순서로 올릴까요?','윗접시저울을 사용하는 방법',`${bookLine('① 바늘이  0 점을 가리키도록 한다. (= 영점조절)')}${bookLine('② 분동은 집게를 사용하여 무거운 것부터 가벼운 것 순으로 올려놓는다.')}${bookLine('③ 분동을 내려놓을 때는 거꾸로 가벼운 것부터 무거운 것 순으로 내려놓는다.')}`,'top-pan-weigh','교재 37쪽 ②를 그대로 씁니다. 체험에서는 영점조절 → 무거운 분동부터 올리기 → 가벼운 분동부터 내리기의 순서를 지켰는지 확인합니다. 물체의 무게(지우개 23 g 등)는 가상의 값입니다.');
page('l5-brass',5,[38],'WEIGHTS · 분동의 이용','분동은\n어떻게 다룰까요?','분동의 이용',`${bookLine('① 분동은 항상 집게를 사용해서 올려놓고 내림')}${bookLine('② 분동은 항상 양팔저울에서 관찰자기준으로 오른쪽!!')}${bookLine('③ 분동을 올려놓을 때는 항상 무거운 것에서 가벼운 것 순서로')}${bookLine('④ 내려놓을 때는 올려놓을 때와 반대로, 가벼운 것부터 내려놓는다.')}`,'top-pan-weigh','교재 38쪽 ③을 그대로 씁니다. 사진의 분동 세트(100 g·50 g·20 g·10 g·10 g·5 g·2 g·2 g·1 g·500 mg·200 mg·100 mg)는 3D 그림으로 바꿨습니다.');
page('l5-speed',5,[38],'SPEED QUESTION','수평이 되면\n왜 분동의 합이 물체의 무게일까요?','Speed Question · 윗접시저울의 수평',`${bookLine('윗접시 저울이 수평이 되면 분동의 무게 합이 물체의 무게라고 합니다. 그 이유를 아래의 그림을 이용하여 간단하게 설명해 보세요.')}`,'top-pan-weigh','교재 38쪽 Speed Question을 그대로 씁니다. 교재에는 답이 인쇄돼 있지 않습니다. 교사용 확인 내용은 39쪽 Daily Test 01번의 문장과 30쪽 수평잡기의 원리 문장으로만 구성했습니다.');
export const q5=[
{id:'f1',n:1,kind:'choice',q:'다음(          ) 안에 들어갈 알맞은 말을 쓰시오.',passage:'윗접시저울의 양팔에 놓인 접시까지의 팔 길이가 같으므로 수평을 이루었을 때 (분동, 추)의 무게 합은 물체 무게와 같다.',options:['분동','추'],answer:0,concept:'toppan',why:'교재 37쪽: (오른쪽 접시)에는 분동을 올려놓는다. 수평이 되면 분동의 무게 합이 물체의 무게입니다. (교재 38쪽 Speed Question)'},
{id:'f2',n:2,kind:'choice',q:'다음 아래의 모빌에서 무게가 비슷한 것을 고르시오.',image:'l5-dt-mobile.jpg',alt:'막대 세 개에 ㄱ·ㄴ·ㄷ·ㄹ이 매달린 모빌 3D 그림',options:['㉠, ㉡','㉠, ㉢','㉠, ㉣','㉡, ㉢','㉡, ㉣'],answer:3,concept:'lever',why:'가장 아래 막대는 가운데에 매달려 있어 ㉡과 ㉢이 받침점에서 같은 거리에 있습니다. 놓인 거리가 같고 수평이면 양쪽 무게가 같습니다. (교재 30쪽 수평 잡기의 원리)'},
{id:'f3',n:3,kind:'choice',q:'윗접시저울이 수평을 이루었을 때 분동 무게의 합이 물체의 무게가 되는 까닭을 가장 바르게 설명한 것을 고르시오.',options:['저울이기 때문에','물체가 가볍기 때문에','접시의 크기가 같기 때문에','양쪽 팔의 길이가 같기 때문에','조절 나사로 수평을 맞추었기 때문에'],answer:3,concept:'toppan',why:'윗접시저울은 양팔에 놓인 접시까지의 팔 길이가 같습니다(교재 39쪽 01번). 놓인 거리가 같으면 수평일 때 양쪽 무게가 같습니다(교재 30쪽).'},
{id:'f4',n:4,kind:'choice',q:'윗접시저울의 팔 위에 놓인 분동이 측정 중 아래로 굴러 떨어지지 않도록 접시 아래 쪽에 ( 팔받침, 팔걸이 )이(가) 있다.',options:['팔받침','팔걸이'],answer:0,concept:'toppan',why:'교재 37쪽: 팔받침은 팔이 크게 움직이는 것을 막아 주는 역할을 합니다.'},
{id:'f5',n:5,kind:'essay',q:'다음 그림과 같이 용수철을 잡아당겼을 때  양팔 저울이 수평을 이루었습니다. 다음 그림에서 잘못된 부분을 찾아 쓰시오.',image:'l5-dt-springs.jpg',alt:'받침점 양쪽 2번 자리에 용수철을 매달고, 왼쪽은 추를 달고 오른쪽은 손으로 잡아당긴 3D 그림',concept:'lever',why:'이 문항은 교재에 정답이 인쇄돼 있지 않아 공개하지 않습니다.'},
{id:'f6',n:6,kind:'choice',q:'다음 중 양팔 저울의 특징으로 옳지 않은 것을 고르시오.',options:['접시가 2개 있다.','추가 1개 필요하다.','팔의 굵기가 일정하다.','팔의 중심에 받침점이 있다.','받침점으로부터 양쪽 접시까지의 거리가 같다.'],answer:1,concept:'toppan',why:'교재 38쪽처럼 분동은 여러 개를 무거운 것부터 차례로 올려놓아 씁니다. 추(분동)가 1개만 필요한 것은 아닙니다.'},
{id:'f7',n:7,kind:'essay',q:'체중계를 이용하여 클립 1개의 무게를 재려고 올려놓았을 때 무게를 정확히 측정 할 수 없었습니다. 그 이유를 설명하시오.',concept:'toppan',why:'이 문항은 교재에 정답이 인쇄돼 있지 않아 공개하지 않습니다.'},
{id:'f8',n:8,kind:'choice',q:'용수철저울의 고리에 사용하는 측정 도구는 ( 분동, 추 )이다.',options:['분동','추'],answer:1,concept:'order',why:'분동은 양팔저울에서 씁니다(교재 38쪽 ②). 용수철저울의 고리에는 추를 매답니다(1·2차시).'},
{id:'f9',n:9,kind:'choice',q:'윗접시 저울에서 측정하고자 사용했던 분동을 저울에서 내려놓고자 합니다. 이 때 내려놓는 분동은 ( 무거운,  가벼운 ) 분동부터 내려놓는다.',options:['무거운','가벼운'],answer:1,concept:'order',why:'교재 37쪽 ③: 분동을 내려놓을 때는 거꾸로 가벼운 것부터 무거운 것 순으로 내려놓는다.'},
{id:'f10',n:10,kind:'choice',q:'윗접시 저울에서 측정하고자 물체를 왼쪽 접시에 올려 놓은 뒤 오른쪽 접시에 분동을 올려놓을 때  ( 무거운,  가벼운 ) 분동부터 올려놓는다.',options:['무거운','가벼운'],answer:0,concept:'order',why:'교재 37쪽 ②: 분동은 집게를 사용하여 무거운 것부터 가벼운 것 순으로 올려놓는다.'},
{id:'f11',n:11,kind:'essay',q:'윗접시저울에서 사용에서 분동을 올리고 내리는 순서를 정해서 사용하는 이유가 무엇인지 설명하시오.',concept:'order',why:'이 문항은 교재에 정답이 인쇄돼 있지 않아 공개하지 않습니다.'},
{id:'f12',n:12,kind:'essay',q:'윗접시 저울을 이용해 무게를 측정하는 과학적 원리에  대해 설명하시오.',basis:'윗접시저울의 양팔에 놓인 접시까지의 팔 길이가 같으므로 수평을 이루었을 때 분동의 무게 합은 물체 무게와 같다. (교재 39쪽 01번)',concept:'toppan',why:'수평 잡기의 원리: 물체의 놓인 거리가 서로 같으면 양쪽에 놓인 물체의 무게는 서로 같다. (교재 30쪽)'}
];
page('l5-test-a',5,[39],'DAILY TEST · 일일평가','윗접시저울의\n원리를 확인해요.','5차시 · 원본 1~6번',`<div class="test-grid compact-test">${q5.slice(0,6).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p47">1~6번 제출하고 확인</button>`,'assessment','5번은 교재에 정답이 인쇄돼 있지 않아 답을 공개하지 않고 선생님과 함께 확인합니다. 2번은 4차시 수평잡기의 원리로 답을 확인합니다.',{assessment:true,dense:true});
page('l5-test-b',5,[40],'DAILY TEST · 일일평가','분동을 다루는\n순서를 확인해요.','5차시 · 원본 7~12번',`<div class="test-grid compact-test">${q5.slice(6,12).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p48">7~12번 제출하고 확인</button>`,'assessment','7·11번은 교재에 정답이 인쇄돼 있지 않아 답을 공개하지 않습니다. 12번은 서술형이라 자동 채점하지 않고 교재 근거와 비교해 선생님이 확인합니다.',{assessment:true,dense:true});
// ── 6차시: 본책 41~42쪽 (CHAPTER 08 용수철 저울과 양팔저울 만들기) + 44~47쪽 단원 평가 「1. 무게 재기」 01~20 ──
// 단원 평가의 정답·해설은 해설 PDF(정답과 해설 2~3쪽, 01 무게재기)에 인쇄돼 있어 자동 채점한다.
const careLine=text=>`<p class="source-line"><b>주의해주세요!</b> ${text}</p>`;
page('l6-spring-make',6,[41],'CHAPTER 08 · 용수철저울 만들기','용수철저울을\n직접 만들어 봐요.','용수철저울 : 제작 과정',`${bookLine('① 용수철에 실을 매단다. ② 실의 한쪽 끝에 접시를 매단다. ③ 투명한 유리관에 흰색 테이프를 붙인다.')}${bookLine('④ 투명한 유리관에 용수철을 집어넣는다. ⑤ 용수철의 한 쪽 고리에 나무 막대를 넣어 투명한 유리관에 건다.')}${bookLine('⑥ 접시에 추를 1개씩 올려놓으면서 용수철 끝의 위치에 따라 흰색 테이프 표면에 추의 개수를 표시한다.')}${careLine('용수철의 늘어난 길이를 알 수 있도록 눈금을 표시 할 수 있어야 한다.')}`,'make-spring-scale','교재 41쪽 ①을 그대로 읽습니다. 교재 오른쪽의 이름표 그림(영점 조절 나사·표시자·손잡이·눈금·고리)은 1차시 3D 용수철저울로 보여 줍니다. 체험에서는 추를 하나씩 올리며 흰색 테이프에 추의 개수를 표시합니다.');
page('l6-spring-check',6,[41],'CHECK · 확인하기','제대로\n만들어졌을까요?','용수철저울이 제대로 만들어졌는지 확인하기',`${bookLine('① 추를 접시에 올려놓지 않았을 때 용수철 끝이‘0’을 가리키는지 확인한다.')}${bookLine('② 추를 올려놓으면서 추의 개수와 눈금의 숫자가 일치하는지 확인한다.')}`,'make-spring-scale','교재 41쪽 ②를 그대로 씁니다. 1차시의 영점 확인, 2차시의 “추의 개수와 늘어난 길이는 비례”와 연결합니다. 체험에서 흔들리는 동안 표시한 눈금은 확인할 때 어긋나므로 “멈춘 뒤 읽기”도 함께 짚습니다.');
page('l6-balance-make',6,[41],'MAKE · 양팔저울 만들기','자와 클립으로\n양팔저울을 만들어요.','양팔저울 : 제작과정',`${bookLine('① 자에 클립을 붙입니다. ② 스티로폼 접시의 네 귀퉁이에 실을 매답니다. ③ 실을 매단 스티로폼을 클립에  고정시킨다. ④ 수평조절을 한다.')}${careLine('수평이 맞지 않는다면?? 고무 찰흙을 붙여 수평이 되게 한다.')}`,'make-balance','교재 41쪽 ③을 그대로 씁니다. 자의 가운데를 매달아 양쪽 접시까지의 거리가 같다는 점을 4차시 수평잡기의 원리와 연결합니다. 체험의 처음 기울기(오른쪽 2 g)는 가상의 값입니다.');
page('l6-balance-use',6,[42],'FEATURE · 양팔저울의 특징','기준물체보다\n가벼울까, 무거울까?','양팔저울의 특징',`${bookLine('① 양팔 저울을 사용하면 두 물체의 무게 차이가 작은 경우에도 정확하게 비교할 수 있다.')}${bookLine('② 여러 가지 물체 중 무게가 중간쯤 되는 물체를 기준으로 정하여, 양팔 저울의 왼쪽 접시에 올려놓습니다.')}${careLine('관찰하고자 하는 물체, 즉, 측정하고자 하는 물체를 보고 있는 관찰자 기준으로 해서, 왼쪽에 놓는다.')}${bookLine('③ 다른 물체들을 하나씩 오른쪽 접시에 올려놓아 기준물체보다 가벼운 것과 무거운 것으로 구분하거나, 무게를 측정 할 수 있다')}${careLine('기준물체는 관찰자를 기준으로 해서 오른쪽에 놓는다.')}`,'make-balance-compare','교재 42쪽 ④를 그대로 씁니다. 체험은 주의 상자대로 기준물체(지우개)를 오른쪽 접시에 두고, 다른 물체를 왼쪽 접시에 하나씩 올려 기준물체보다 가벼운 것과 무거운 것으로 나눕니다. 물체의 무게는 가상의 값입니다.');
const springTable=[['추의 개수(개)','1','2','3','4'],['용수철의 늘어난 길이(㎝)','2','4','6','8']];
// 정답·해설 출처: 해설 PDF 「정답과 해설」 2~3쪽(01 무게재기). key:'official'로 표시한다.
export const q6=[
{id:'g1',n:1,kind:'choice',q:'다음 그림은 용수철저울의 구조를 나타낸 것이다. 용수철저울에 표시된 기호 중에서 영점조절나사를 가리키는 기호를 나타낸 것은?',image:'l6-u01-scale.jpg',alt:'ㄱ·ㄴ·ㄷ·ㄹ을 표시한 용수철저울 3D 그림',options:['㉠','㉡','㉢','㉣','㉠, ㉣'],answer:0,concept:'parts',why:`㉠영점조절나사, ㉡용수철, ㉢표시자, ㉣고리를 가리킵니다. 무게를 측정하기 전 영점조절 나사를 조정하여 표시자를 0에 위치시킨 뒤 무게를 측정합니다.`,key:'official'},
{id:'g2',n:2,kind:'choice',q:'용수철저울로 물체의 무게를 측정할 때 가장 먼저 해야 할 일은 무엇인지 다음의 보기에서 고르시오.',options:['고리에 물체를 매단다.','용수철의 길이를 잰다.','손으로 어림하여 정확한 무게를 잰다.','물체를 매달고 표시자의 눈금을 읽는다.','표시자의 눈금이 0을 가리키는지 확인한다.'],answer:4,concept:'zero',why:`정확한 무게를 측정하기 위해서는 용수철저울의 표시자가 눈금 0을 가리키고 있는지 확인해야 합니다. 0을 가리키고 있지 않을 때는 영점조절나사를 이용하여 영점조절한 뒤 무게를 측정합니다.`,key:'official'},
{id:'g3',n:3,kind:'choice',q:'물체의 무게를 손으로 어림하여 측정하게 되면 생길 수 있는 문제점이 무엇인지 다음 보기에서 고르시오.',options:['물체의 무게를 정확하게 측정할 수 있다.','물체의 무게를 정확하게 측정할 수 없다.','물체의 색깔이 변할 수 있다.','물체의 모양이 변할 수 있다.','저울로 측정하는 것보다 손쉽게 무게를 잴 수 있다.'],answer:1,concept:'weight',why:`손으로 어림하면 ‘A가 B에 비해서 무겁다’처럼 기준과 비교해 상대적으로 가볍다, 무겁다를 판단할 수 있는 표현입니다.`,key:'official'},
{id:'g4',n:4,kind:'choice',q:'다음 중 용수철저울의 사용 방법으로 옳지 않은 것을 고르시오.',options:['측정하는 물체를 고리에 매단다.','눈금을 읽을 때 표시자보다 높은 위치에서 아래로 읽는다.','물체를 매단 뒤 표시자의 흔들림이 멈춘 뒤 눈금을 읽는다.','용수철저울에 표시된 측정 범위를 벗어난 물체의 무게는 측정하지 않는다.','물체를 매달지 않았을 때 용수철저울의 표시자가 가리키는 눈금은 0이어야 한다.'],answer:1,concept:'eye',why:`표시자는 눈높이와 동일한 높이에서 읽어야 정확한 눈금을 읽을 수 있습니다. 위에서 읽거나 아래에서 읽으면 무게측정 값에 오차가 생깁니다.`,key:'official'},
{id:'g5',n:5,kind:'choice',q:'다음 보기 중 물체의 무게를 측정하는 기구로 적당한 실험도구를 고르시오.',options:['자','비커','용수철저울','온도계','눈금 실린더'],answer:2,concept:'parts',why:`자는 길이를 측정하고, 비커와 눈금실린더는 부피를 측정하는 도구이다. 온도계는 온도를 측정하는 도구이다.`,key:'official'},
{id:'g6',n:6,kind:'choice',q:'용수철저울의 고리에 준비된 추를 한 개씩 더 매단 경우, 용수철저울의 늘어나는 길이는 (      ) cm씩 늘어납니다. 괄호에 들어갈 알맞은 숫자를 다음의 보기에서 고르시오.',table:springTable,options:['1','2','3','4','5'],answer:1,concept:'graph',why:`문제에서 제시한 표를 이용해 추1개당 늘어나는 길이가 2cm씩인 것을 확인할 수 있습니다.`,key:'official'},
{id:'g7',n:7,kind:'choice',q:'용수철저울의 고리에 추를 10개 매달면 용수철저울의 길이는 (      ) cm가 늘어나게 됩니다. 위에서 제시한 표를 이용하여 괄호 안에 들어갈 숫자를 고르시오.',table:springTable,options:['10','14','20','22','34'],answer:2,concept:'graph',why:`문제에서 제시한 표를 이용해 추 1개당 2cm씩 늘어난 것을 확인할 수 있습니다. 추 10개를 매달면 2cm x 10 = 20cm가 됩니다.`,key:'official'},
{id:'g8',n:8,kind:'choice',q:'용수철저울의 고리에 물체를 매달았을 때 용수철이 늘어나게 되는 조건을 다음의 보기에서 고르시오.',options:['물체의 생김새','물체의 무게','물체의 부피','물체의 단단함','물체의 색깔'],answer:1,concept:'extend',why:`용수철저울의 용수철은 매단 물체의 무게에 따라 늘어난 길이가 다릅니다.`,key:'official'},
{id:'g9',n:9,kind:'choice',q:'물체를 들어 올릴 때 가벼운 물체를 드는 경우보다 무거운 물체를 드는 것이 더 힘이 듭니다. 더 힘이 드는 이유를 올바르게 설명한 사람을 고르시오.',options:['진홍 : 지구가 물체를 지구 중심으로 끌어당기기 때문이야.','경복 : 물체를 끌어당기는 힘의 크기가 일정하기 때문이야.','은희 : 무거운 물체는 지구가 더 세게 끌어당기기 때문이야.','미경 : 물체의 모양이 다르기 때문이야.','영희 : 물체를 들고 있는 사람이 할아버지 이기 때문이야.'],answer:2,concept:'gravity',why:`물체의 무게는 중력의 크기입니다. 물체가 무거우면 중력의 크기도 더 커집니다.`,key:'official'},
{id:'g10',n:10,kind:'choice',q:'같은 용수철저울 2개를 스탠드에 매단 후, 한 쪽 용수철저울에는 추를 매달았고 늘어난 길이만큼 다른 쪽 용수철저울을 손으로 잡아당겼습니다. 이 때 손에 가장 큰 힘이 드는 경우를 고르시오.',options:['20g 추를 매단 경우','40g 추를 매단 경우','60g 추를 매단 경우','80g 추를 매단 경우','100g 추를 매단 경우'],answer:4,concept:'force',why:`추의 무게가 클수록 늘어난 길이가 크며, 손으로 잡아당겼을때 느끼는 탄성력의 힘도 커집니다.`,key:'official'},
{id:'g11',n:11,kind:'choice',q:'다음 보기에서 제시된 두 물건에는 공통적으로 사용된 부품 재료가 있습니다. 이 부품 재료라고 생각되는 것을 고르시오.',image:'l6-u11-tools.jpg',alt:'스테이플러와 줄자 3D 그림',options:['용수철','핀셋','실','고무줄','고무'],answer:0,concept:'elastic',why:`스테이플러와 줄자에는 원래의 모양으로 되돌아오기 위해 용수철이 설치되어 있습니다.`,key:'official'},
{id:'g12',n:12,kind:'choice',q:'다음 보기 중에서 용수철저울에 사용된 재료인 용수철을 이용한 도구가 아닌 것을 고르시오.',options:['침대','옷걸이','트램펄린','펀치','볼펜'],answer:1,concept:'elastic',why:`침대, 펀치, 볼펜, 트램펄린에는 용수철이 사용되어 사용 후 원래의 모양과 위치로 돌아오도록 합니다.`,key:'official'},
{id:'g13',n:13,kind:'choice',q:'널빤지를 받치고, 물체를 올려놓았을 때  어느 한쪽으로도 기울어지지 않고, 평형을 이룬 상태를 표현한 용어를 고르시오.',options:['균형','멈춤','질량','수평','중력'],answer:3,concept:'lever',why:`양쪽에 물체를 올려놓았을 때 어느 한쪽으로도 기울어지지 않는 상태를 수평이라고 합니다.`,key:'official'},
{id:'g14',n:14,kind:'choice',q:'다음 보기 중 물체의 가운데를 받쳤을 때 수평이 되지 않는 물체를 고르시오.',image:'l6-u14-objects.jpg',alt:'1번 자, 2번 막대, 3번 야구 방망이, 4번 나무판 3D 그림',pictureOptions:true,options:['①','②','③','④'],answer:2,concept:'lever',why:`물체의 좌우의 질량, 무게, 모양, 크기, 굵기, 길이 등이 모두 같으면 받침대를 가운데에 받쳐 수평을 이룰 수 있습니다. 물체의 좌우 모양이 다르면 무거운 쪽에 받침대를 놓아야 수평이 됩니다.`,key:'official'},
{id:'g15',n:15,kind:'choice',q:'다음 중 나무 막대에 매달린 물체의 무게가 비슷한 것은 어느 것인지 고르시오.',image:'l6-u15-bars.jpg',alt:'실로 매단 나무 막대 네 개 3D 그림',pictureOptions:true,options:['①','②','③','④'],answer:0,concept:'lever',why:`수평잡기의 원리는 ‘무게x거리=일정’ 하다이므로 무게가 같은 물체는 중심에서 놓인 거리가 같다. 물체의 무게가 다르면 무거운 물체는 중심으로부터 가깝게 가벼운 물체는 중심으로부터 멀리 놓아야 수평이 된다.`,key:'official'},
{id:'g16',n:16,kind:'choice',q:'몸무게가 다른 두 사람이 시소의 양쪽에 앉아서 수평을 만들었습니다. 이 때 다음의 그림을 참고하여 몸무게가 더 무거운 사람은 누구이고, 올바르게 설명한 이유를 보기를 고르시오.',image:'l6-u16-seesaw.jpg',alt:'시소 양쪽에 ㄱ과 ㄴ이 앉아 수평을 이룬 3D 그림',options:['㉠, 중심으로부터 먼 곳에 앉아있기 때문에','㉡, 중심으로부터 가까운 곳에 앉아있기 때문에','㉠, 몸의 크기가 작아보여서','㉡, 몸의 크기가 커보여서','㉠, 앉아있는 곳에서 손잡이를 더 세게 잡아당기고 있기 때문에'],answer:1,concept:'lever',why:`수평잡기의 원리에서 물체가 무거울수록 중심에서 가깝고, 가벼울수록 중심에서 먼 곳에 위치한다. 물체의 무게가 같으면 중심으로부터 놓인 거리가 같다.`,key:'official'},
{id:'g17',n:17,kind:'choice',q:'영재는 용수철저울 A와 B를 준비해서 같은 무게의 물체를 매달았습니다. 이 때 A용수철저울과 B용수철저울의 늘어난 길이가 서로 달랐습니다. 용수철저울의 늘어난 길이가 다른 이유로 적당하지 않은 것을 고르시오.',options:['용수철의 굵기가 다르기 때문에','용수철의 재질이 다르기 때문에','용수철저울의 영점조절을 하지 않아서','용수철저울을 측정한 장소(높이)가 다르기 때문에','측정 장소의 습도 때문에'],answer:4,concept:'material',why:`용수철의 굵기와 재질, 영점조절, 측정 장소의 높이(중력의 크기 차이)에 따라 늘어난 길이가 달라질 수 있습니다. (해설을 줄여 옮김)`,key:'official'},
{id:'g18',n:18,kind:'choice',q:'다음 보기와 같이 나무 막대에 동물 그림 카드를 매달았더니 수평이 되었습니다. 고양이와 쥐의 무게를 비교하여 ○ 안에 들어갈 표시 기호를 올바르게 고르시오.',image:'l6-u18-mobile.jpg',alt:'나무 막대 왼쪽 끝에 쥐, 오른쪽에 고양이가 매달려 수평을 이룬 3D 그림',passage:'쥐 ○ 고양이',options:['=','〈','〉','≠','×'],answer:1,concept:'lever',why:`매단 동물모양에서 쥐가 중심으로부터 먼 곳에 위치하기 때문에 중심에서 가까운 곳에 위치하고 있는 고양이보다 가볍다. 그렇기 때문에 쥐 〈 고양이가 되어야 한다.`,key:'official'},
{id:'g19',n:19,kind:'choice',q:'다음 (  ) 안에 표시된 단어들을 올바르게 선택한 보기를 고르시오.',passage:'무게가 서로 다른 두 물체를 이용해 수평을 이룰 때, 무게가 ㉠ (무거운, 가벼운) 물체를 무게가 ㉡ (무거운, 가벼운) 물체보다 받침점으로부터 더 먼 곳에 위치시켜야 수평을 이룰 수 있습니다.',options:['㉠무거운 ,㉡무거운','㉠무거운 ,㉡가벼운','㉠가벼운 ,㉡가벼운','㉠가벼운 ,㉡무거운'],answer:3,concept:'lever',why:`무거운 물체보다 가벼운 물체의 놓인 위치가 중심에서 더 먼 곳에 놓입니다.`,key:'official'},
{id:'g20',n:20,kind:'choice',q:' 다음 아래 그림과 같이 수평을 이룬 모빌에서 무게가 가장 무거운 것은 어느 것인지 기호를 쓰시오',image:'l6-u20-mobile.jpg',alt:'A 공, B 정육면체, C 별, D 웃는 얼굴이 매달려 수평을 이룬 모빌 3D 그림',options:['A','B','C','D','B와 C'],answer:3,concept:'lever',why:`B+C=A이고 B+C+A=D이기 때문에 물체의 무게는 D가 가장 무겁습니다.`,key:'official'}
];
page('l6-unit-a',6,[44],'UNIT TEST · 단원 평가','무게 재기\n단원 평가 (1)','단원 평가 01~06',`<div class="test-grid compact-test">${q6.slice(0,6).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p53">1~6번 제출하고 확인</button>`,'assessment','단원 평가의 정답·해설은 해설 PDF(정답과 해설 2~3쪽)에 인쇄돼 있어 자동 채점합니다. 해설 문장은 해설 PDF를 그대로 옮겼습니다.',{assessment:true,dense:true});
page('l6-unit-b',6,[45],'UNIT TEST · 단원 평가','무게 재기\n단원 평가 (2)','단원 평가 07~12',`<div class="test-grid compact-test">${q6.slice(6,12).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p54">7~12번 제출하고 확인</button>`,'assessment','7번은 44쪽의 표(추 1개당 2 cm)를 함께 봅니다. 정답은 해설 PDF대로입니다.',{assessment:true,dense:true});
page('l6-unit-c',6,[46],'UNIT TEST · 단원 평가','무게 재기\n단원 평가 (3)','단원 평가 13~17',`<div class="test-grid compact-test">${q6.slice(12,17).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p55">13~17번 제출하고 확인</button>`,'assessment','14·15·16번의 그림은 교재 그림을 따른 3D 그림입니다. 정답은 해설 PDF대로입니다.',{assessment:true,dense:true});
page('l6-unit-d',6,[47],'UNIT TEST · 단원 평가','무게 재기\n단원 평가 (4)','단원 평가 18~20',`<div class="test-grid compact-test">${q6.slice(17,20).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p56">18~20번 제출하고 확인</button>`,'assessment','18·20번의 그림은 교재 그림을 따른 3D 그림입니다. 정답은 해설 PDF대로입니다.',{assessment:true,dense:true});
// ── 7차시: 본책 50~57쪽 (단원 Ⅱ 속력과 속도 · CHAPTER 01 운동과 정지 · 02 위치 표현의 3요소 · 03 물체의 운동 표현 · 04 속력의 표현과 공식 · Daily Test 01~10) ──
// 문장은 교재 표기 그대로 옮긴다(따옴표·띄어쓰기 포함). 교재에 답이 없는 Speed Question은 교재의 다른 문장·그림으로만 정리하고, 그 근거는 교사 메모와 검수 문서에 남긴다.
page('l7-motion',7,[50],'CHAPTER 01 · 운동과 정지','시간이 흘러도\n위치가 그대로일까요?','운동에 대한 뜻 제대로 알기',`${bookLine('① 정지 · 단위 시간동안 물체의 위치가 변하지 않는 운동 상태')}${bookLine('② 운동 · 단위 시간동안 물체의 위치가 변한 운동 상태')}`,'motion-time','교재 50쪽 ①을 그대로 읽습니다. 교재의 사람 그림(0초·1초·2초)은 3D 그림으로 바꿨습니다. 정지를 “위치가 변하지 않는 운동 상태”라고 쓴 교재 표현은 그대로 둡니다(검수 메모, 학생·투사 화면에는 표시하지 않음).');
page('l7-motion-q',7,[51],'SPEED QUESTION','운동하고 있지 않다?\n운동하고 있다?','Speed Question · 운동하고 있다고 생각하는 이유',`${bookLine('다음 그림에서 물체가 운동하고 있지 않다” 라고 생각하는 이유를 설명해보세요.')}${bookLine('다음 그림에서 물체가 운동하고 있다” 라고 생각하는 이유를 설명해보세요.')}`,'motion-time','교재 51쪽의 Speed Question 두 개를 그대로 씁니다(여는 따옴표가 빠진 교재 표기 그대로). 교재에 답이 인쇄돼 있지 않아 50쪽 ① 정지 · ② 운동의 뜻으로만 정리합니다. 교재의 토끼 그림은 3D 어린이 그림으로 바꿨습니다.');
page('l7-position',7,[52],'CHAPTER 02 · 위치 표현의 3요소','위치는\n어떻게 말해야 할까요?','물체의 위치 나타내기 : 위치 표현의 3요소',`${bookLine('① 기준점 · ② 방향 · ③거리')}${bookLine('(예) 우루사 동굴을 기준으로 ‘대치엠에스지’의 위치를 표현하시오.')}${bookLine('‘대치엠에스지’는 우루사 동굴에서 서쪽으로 3km 떨어져 있다 (① 기준점 ② 방향 ③ 거리)')}${careLine('보통 위치를 표현하는 경우는 어디 앞, 어디 뒤, 어디 옆이라고 표현하는 경우들이 많으므로, 기준점, 방향, 거리를 함께 표현할 수 있도록 주의해야 한다.')}${bookLine('〈잘못된 표현〉 칠판 앞에 선생님이 계십니다. 또는 칠판 왼쪽에 선생님이 계십니다.')}${bookLine('〈올바른 표현〉 선생님은 칠판에서 앞쪽, 1m 떨어진 곳에 계십니다.')}`,'position-map','교재 52쪽 ①②와 주의 상자를 그대로 씁니다. 교재의 선생님 사진은 칠판 앞에 선 사람의 3D 그림으로 바꿨습니다. 건물 그림의 간격은 교재처럼 거리에 비례하지 않으니 거리는 km 이름표로 읽게 합니다.');
page('l7-position-q',7,[53],'SPEED QUESTION','건물의 위치를\n올바르게 표현해요.','Speed Question · 방향과 거리 쓰기',`${bookLine('다음 그림에서 표현된 여러 건물의 위치를 올바르게 표현하기 위해 (    )에 알맞은 방향과 거리를 쓰시오.')}${bookLine('① 병원은 집에서 (     )방향으로 (     )km 떨어진 곳에 위치하고 있다.')}${bookLine('② 집은 회사에서 (     )방향으로 (     )km 떨어진 곳에 위치하고 있다.')}${bookLine('③ 회사는 병원에서 (     )방향으로 (     )km 떨어진 곳에 위치하고 있다.')}${bookLine('④ 카페는 집에서 (     )방향으로 (     )km 떨어진 곳에 위치하고 있다.')}${bookLine('⑤ 병원은 회사에서 (     )방향으로 (     )km 떨어진 곳에 위치하고 있다.')}`,'position-map','교재 53쪽 Speed Question을 그대로 씁니다. 교재에 답이 인쇄돼 있지 않아, 그림의 거리(집–병원 4 km · 병원–카페 1 km · 카페–회사 8 km)와 서쪽·동쪽 표시로 구한 답을 교사 화면에만 둡니다.');
page('l7-place',7,[54],'CHAPTER 03 · 물체의 운동 표현','장소와 위치는\n어떻게 다를까요?','운동이란? · 장소와 위치의 차이',`${bookLine('① 운동이란? 단위 시간 동안 물체의 위치가 변하면서 이동거리가 변하는 상태')}${boxLine('① 장소','물체가 있는 곳이나 물체가 차지하는 공간, 물체의 이름이나 지명을 사용하여 나타내는 것.')}${boxLine('② 위치','공간의 특정한 기준점으로부터의 방향과 직선거리로 설명되는 공간의 한 지점을 나타내는 것')}`,'position-map','교재 54쪽 ①②를 그대로 씁니다. 50쪽의 운동(위치가 변한 상태)에 “이동거리가 변하는” 표현이 더해진 것을 짚고, 52쪽 위치 표현의 3요소(기준점·방향·거리)와 ② 위치의 뜻을 연결합니다.');
page('l7-bear',7,[54],'EXPERIMENT · 곰 인형과 배경','인형은 정말\n앞으로 갔을까요?','곰 인형과 배경을 이용하여 앞으로 움직이는 것처럼 보이기 · 다른 운동의 예',`${bookLine('③ 곰 인형과 배경을 이용하여 앞으로 움직이는 것처럼 보이기')}${bookLine('〈방법1〉 배경은 정지 상태, 앞으로 인형을 움직이기 · 〈방법2〉 인형은 정지 상태, 배경을 뒤로 움직이기')}${bookLine('④ 다른 운동의 예 · ① 차를 타고 갈 때 풍경이 뒤로 가는듯한 느낌이 들 때 · ② 자동차로 다른 옆 차를 지나갈 때 추월을 하면 옆 차가 뒤로 가는 느낌 · ③ 다른 자동차에게 추월을 당하는 경우 내차가 뒤로, 옆 차가 앞으로 가는 느낌')}`,'relative-motion','교재 54쪽 ③④를 그대로 씁니다. 교재의 손과 곰 인형 사진은 3D 곰 인형과 배경 그림으로 바꿨습니다. 체험의 “카메라가 따라가며 보기”는 〈방법1〉을 인형과 함께 움직이며 보면 〈방법2〉처럼 보인다는 것을 보여 주는 편집 보완 장치입니다.');
page('l7-speed',7,[55],'CHAPTER 04 · 속력의 표현과 공식','빠르기는\n어떻게 나타낼까요?','속력의 공식 · 속력 표현하기',`${bookLine('① 속력의 공식 · 속력 = (      ) / (      )')}${bookLine('② 속력 표현하기 · (1) A의 속력은 얼마일까요? A는 1초 동안 1m 이동했으므로, 속력 = 1m/1s 라면, 1m/s의 빠르기를 가진다.')}${bookLine('(2) B의 빠르기를 구하세요. (3) C의 빠르기를 구하세요. (4) D의 빠르기를 구하세요.')}`,'speed-graph','교재 55쪽 ①②를 그대로 씁니다. ① 공식의 빈칸 정답과 (2)~(4)의 답은 교재에 인쇄돼 있지 않습니다. 빈칸은 (1)의 풀이(1m를 1s로 나눔)와 그래프의 축 이름(이동거리, 시간)으로, (2)~(4)는 그래프의 점(B 2 s·2 m, C 3 s·3 m, D 4 s·4 m)으로 확인합니다.');
page('l7-units',7,[56],'UNIT · 속력의 단위','m/s, km/h는\n어떻게 읽을까요?','속력의 단위의 뜻 알기',`${table(['단위','읽어보기','뜻'],[['1 m/s','일 미터 퍼 세크','1초당 1m를 이동하는 빠르기'],['1 m/m','일 미터 퍼 미닛','1분당 1m를 이동하는 빠르기'],['1 km/h','일 킬로미터 퍼 아워','1시간당 1km를 이동하는 빠르기']])}${bookLine('Speed Question · 다음 속력의 표현을 읽어보세요. (1) 100 m/s (2) 1000 km/h (3) 5 cm/s')}`,'speed-units','교재 56쪽 ③ 표와 Speed Question을 그대로 씁니다. Speed Question의 답은 교재에 인쇄돼 있지 않아 표의 읽는 법으로만 확인합니다. (3) cm/s는 표에 없는 단위라 “센티미터”만 바꿔 읽게 합니다.');
export const q7=[
{id:'h1',n:1,kind:'text',q:'속력을 나타내는 기호를 쓰시오.',answer:'',concept:'speed',why:'이 문항은 교재에 정답이 인쇄돼 있지 않아 공개하지 않습니다.'},
{id:'h2',n:2,kind:'choice',q:'시간이 흘러도 물체의 움직임이 없이 제자리에 서있습니다. 이런 상태를 ( 정지,  운동 ) 상태라고 한다.',options:['정지','운동'],answer:0,concept:'motion',why:'교재 50쪽: ① 정지 · 단위 시간동안 물체의 위치가 변하지 않는 운동 상태'},
{id:'h3',n:3,kind:'choice',q:'시간이 지나면 물체가 움직인 이동거리가 발생해서 우리는 속력을 표현할 수 있습니다. 이런 상태를 “(정지, 운동 )했다”라고 한다.',options:['정지','운동'],answer:1,concept:'motion',why:'교재 54쪽: 운동이란 단위 시간 동안 물체의 위치가 변하면서 이동거리가 변하는 상태'},
{id:'h4',n:4,kind:'parts',q:'다음 아래의 (      )을 채워 속력에 대한 공식을 완성하시오.',passage:'속력 = (      ) / (      )',slots:['위(분자)','아래(분모)'],answer:['이동거리','시간'],accept:[['이동거리'],['시간','걸린시간']],vocab:['이동거리','시간'],concept:'speed',why:'교재 55쪽 (1): A는 1초 동안 1m 이동했으므로, 속력 = 1m/1s — 이동거리(m)를 시간(s)으로 나눕니다. (그래프의 축: 이동거리(m), 시간(s))'},
{id:'h5',n:5,kind:'text',q:'자동차가 400m 거리를 5초 만에 통과했다면 속력은 얼마인지 구하시오.',answer:'80m/s',accept:['80m/s','80','초속80m','80미터퍼세크'],concept:'speed',why:'400m ÷ 5s = 80m/s. 교재 55쪽 (1)처럼 이동거리를 시간으로 나눕니다.'},
{id:'h6',n:6,kind:'text',q:'m/s 단위를 읽고, 한글로 쓰시오.',answer:'미터 퍼 세크',accept:['미터퍼세크','일미터퍼세크'],vocab:['미터 퍼 미닛','킬로미터 퍼 아워','일 미터 퍼 미닛','일 킬로미터 퍼 아워'],concept:'units',why:'교재 56쪽 표: 1 m/s — 일 미터 퍼 세크'},
{id:'h7',n:7,kind:'text',q:'km/h 를 읽고, 한글로 쓰시오.',answer:'킬로미터 퍼 아워',accept:['킬로미터퍼아워','일킬로미터퍼아워'],vocab:['미터 퍼 세크','미터 퍼 미닛','일 미터 퍼 세크','일 미터 퍼 미닛'],concept:'units',why:'교재 56쪽 표: 1 km/h — 일 킬로미터 퍼 아워'},
{id:'h8',n:8,kind:'essay',q:'달리는 사람의 속력을 측정했더니 5m/s였습니다. 이 속력의 크기가 나타내는 의미를 설명하시오.',basis:'1초당 5m를 이동하는 빠르기 (교재 56쪽 표: 1 m/s는 1초당 1m를 이동하는 빠르기)',concept:'units',why:'교재 56쪽 표의 뜻(1초당 1m를 이동하는 빠르기)처럼 5 m/s는 1초당 5m를 이동하는 빠르기입니다.'},
{id:'h9',n:9,kind:'essay',q:'자전거를 타고 가는 하은이의 속력을 측정했더니 5km/h 였습니다. 이 속력의 크기가 나타내는 의미를 설명하시오.',basis:'1시간당 5km를 이동하는 빠르기 (교재 56쪽 표: 1 km/h는 1시간당 1km를 이동하는 빠르기)',concept:'units',why:'교재 56쪽 표의 뜻(1시간당 1km를 이동하는 빠르기)처럼 5 km/h는 1시간당 5km를 이동하는 빠르기입니다.'},
{id:'h10',n:10,kind:'essay',q:'5m/s로 움직이는 A  자동차와 10m/s 움직이는 B 자동차 중 더 빠른 자동차는 무엇인지 말하고 이유를 설명해보시오.',basis:'B 자동차 · B는 1초당 10m, A는 1초당 5m를 이동하므로 같은 시간 동안 B가 더 멀리 갑니다. (교재 56쪽 표의 뜻)',concept:'units',why:'교재 56쪽 표처럼 m/s는 1초당 이동하는 거리입니다. 1초당 10m를 가는 B가 1초당 5m를 가는 A보다 빠릅니다.'}
];
page('l7-test-a',7,[57],'DAILY TEST · 일일평가','운동과 속력의 공식을\n확인해요.','7차시 · 원본 1~5번',`<div class="test-grid compact-test">${q7.slice(0,5).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p65">1~5번 제출하고 확인</button>`,'assessment','1번(속력의 기호)은 50~57쪽에 근거가 없어 답을 공개하지 않습니다. 4·5번은 55쪽 (1)의 풀이(이동거리 ÷ 시간)로 확인한 답입니다.',{assessment:true,dense:true});
page('l7-test-b',7,[57],'DAILY TEST · 일일평가','속력의 단위가\n뜻하는 것을 확인해요.','7차시 · 원본 6~10번',`<div class="test-grid compact-test">${q7.slice(5,10).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p66">6~10번 제출하고 확인</button>`,'assessment','6·7번은 56쪽 표의 읽어보기, 8~10번은 서술형이라 자동 채점하지 않고 56쪽 표의 뜻과 비교해 선생님이 확인합니다.',{assessment:true,dense:true});
// ── 8차시: 본책 58~63쪽 (쉬어가기 교통안전표지판 · 과학 이야기 하이퍼튜브 · CHAPTER 05 [심화] 속력과 속도는 달라요? · Daily Test 01~08) ──
// 문장은 교재 표기 그대로 옮긴다(띄어쓰기·구두점 포함). 교재에 답이 없는 질문은 교재의 다른 문장으로만 정리하고 근거는 교사 메모와 검수 문서에 남긴다.
page('l8-signs',8,[58],'쉬어가기 · 교통안전표지판','빨간 테두리의 둥근 표지판은\n무엇을 알려 줄까요?','교통안전표지판 · 규제표지판',`${boxLine('규제표지판','주로 원형 모양, 빨간색 테두리가 있는 흰색 바탕으로 통행을 금지하거나 제한하는 것을 도로이용자에게 알리는 표지판.')}${bookLine('통행금지 · 자동차 통행금지 · 화물자동차 통행금지 · 승합자동차 통행금지 · 이륜자동차 및 원동기장치자전거 통행금지 · 자동차, 이륜자동차 및 원동기장치자전거 통행금지 · 트랙터, 경운기 및 손수레 통행금지 · 자전거 통행금지 · 진입금지 · 직진금지 · 우회전금지 · 좌회전금지 · 유턴금지 · 앞지르기(추월)금지 · 주정차금지 · 주차금지 · 차중량제한 · 차높이제한 · 차폭제한 · 차간거리확보 · 최고속도제한 · 최저속도제한 · 서행 · 일시정지')}`,'traffic-signs','교재 58쪽 쉬어가기를 그대로 씁니다. 표지판 사진은 같은 모양의 3D 표지판으로 바꿨습니다. 체험의 “속력과 관계있는 표지판 찾기”는 이 차시에서 더한 활동이며 교재의 분류가 아닙니다.');
page('l8-hypertube',8,[59,60],'과학 이야기 · 하이퍼튜브','1200km/h로 달리면\n얼마나 빠를까요?','1200km/h로 달리는 하이퍼튜브',`${bookLine("최고시속 1200km로 달릴 수 있는 초고속 열차인 '하이퍼튜브' 시대가 열린다.")}${bookLine('한국철도기술연구원은 냉동기 없이도 장시간 자기장을 유지할 수 있는 초전도 전자석 시작품을 세계 최초로 개발해 시운전에 성공했다고 4일 밝혔습니다. 이번에 개발한 초전도 전자석은 최고시속 1200km로 달릴 하이퍼튜브 차량의 엔진에 해당하는 부품으로 자기부상철도의 초고속 주행에 필요한 자기장을 만드는 핵심 장치이다. 하이퍼튜브는 최고속도 시속 1200km를 목표로 철도연이 개발 중인 초고속 열차로, 서울에서 부산까지 20분 만에 주행할 수 있다.')}${bookLine('초전도 전자석은 작은 전력으로 강한 힘을 내기 때문에 저소비 전력이나 초고속 활동이 필요한 발전기, 슈퍼컴퓨터, 초고속 자기부상열차 등에 활용되고 있다. 전자석의 초전도 성능은 영하 270℃ 내외의 매우 낮은 온도에서 나타나기 때문에, 초전도 전자석에 냉각시스템을 설치해 운영해야 한다.')}${bookLine('철도기술연구원이 개발한 초전도 전자석은 영하 210℃ 이하의 고체상태 질소가 갖는 열용량을 이용해 냉동기 없이도 장시간 냉각을 유지하는 것이 특징이다. 고체질소가 냉각시스템을 대신해 전자석의 초전도상태를 유지하는 일종의 냉각 배터리와 같은 역할을 한다.')}${bookLine('연구개발 중인 하이퍼튜브에 냉동기 없는 전자석이 적용됨으로써 초전도 전자석을 운전하기 위해 차량에서 필요한 전력을 90% 이상 줄일 수 있고, 냉동기를 없앤 만큼 차량을 경량화 할 수 있다. 현재 초전도 방식의 세계 최고속도는 일본에서 개발 중인 자기부상열차로 시속 603km를 기록하고 있다. 일본에서는 초전도체를 영하 269℃의 온도로 유지하는 액체 헬륨 냉각시스템을 차량에 상시 탑재하고 있다.')}${bookLine('이번에 철도기술연구원이 개발한 초전도 전자석 시작품은 냉동기 없이 4시간 운전 가능하며, 향후 6시간 이상 운전할 수 있도록 성능을 개선할 예정이다.  또한, 초전도 전자석을 이용한 하이퍼튜브의 자기부상 및 추진 기술 연구개발을 위한 단거리 테스트베드를 구축할 계획이다.')}${bookLine('[출처 : 건설 이코노미 뉴스 (http://www.cenews.kr)]')}`,'hypertube','교재 59~60쪽의 과학 이야기를 그대로 씁니다. 교재의 차량 사진·모형 사진(사진:UNIST)은 쓰지 않고 같은 모양의 3D 개념 모형으로 바꿨습니다. 기사의 수치와 “세계 최초” 등은 기사 그대로이며 따로 검증하지 않았습니다(검수 메모, 학생·투사 화면에는 표시하지 않음).');
page('l8-routes',8,[61],'CHAPTER 05 · [심화] 속력과 속도','A에서 B까지\n가는 방법은 몇 가지?','A위치에서 B위치까지 이동하는 방법은 몇 가지나 될까 ?',`${bookLine('아래 그림에 소가 있는 위치 A에서 쌤이 있는 B위치까지 이동할 수 있는 경로를 그리고, 스스로가 그린 경로에 ①. ②처럼 숫자를 표시한 후 속력과 속도로 구분하여 보세요.')}${bookLine('속력의 방법은? (      )가지 · 속도의 방법은? (      )가지')}`,'routes','교재 61쪽 ①을 그대로 씁니다. 표의 빈칸 정답은 교재에 인쇄돼 있지 않습니다. 체험은 경로 세 개(가상의 모양과 길이)와 A에서 B로 곧게 이은 화살표를 보여 주고, 학생이 그린 경로로 이야기하게 합니다.');
page('l8-velocity',8,[61],'DEFINITION · 속도의 정의','속도는\n속력과 무엇이 다를까요?','속도의 정의 · 속력과 속도의 비교표',`${bookLine('① 단위 시간 동안에 이동한 위치')}${bookLine('② 벡터의 변위로서 물체의 빠르기를 나타내는 벡터량이다.')}${bookLine('③ 물체의 빠르기를 이동한 방향과 함께 나타낸다는 점에서 속력과 차이가 있다.')}${bookLine('④ 표현기호 : v̄')}${table(['구분','속력','속도'],[['‘크기’를 나타낼 수 있습니까?','○ , X','○ , X'],['‘방향’을 나타낼 수 있습니까?','○ , X','○ , X'],['물리량 표현하기','스칼라, 벡터','스칼라, 벡터'],['공식 익히기','','']])}`,'routes','교재 61쪽 ②③을 그대로 씁니다. 비교표는 교재처럼 학생이 ○·X와 스칼라·벡터를 고르는 빈 표이며, 정답은 교재에 인쇄돼 있지 않습니다.');
page('l8-vector',8,[62],'SCALAR · VECTOR','하나의 수치로 충분할까,\n방향도 필요할까?','스칼라량 · 벡터량',`${boxLine('〈스칼라량〉','물리학이나 기하학에 나타나는 양에는 단위만 정해지면 하나의 수치로 완전히 그것을 표현할 수 있는 것이 많이 있다. 예를 들면 질량, 에너지, 온도, 길이, 면적 시간 등이 그것이며, 이와 같은 양을 ‘스칼라’라고 부른다')}${boxLine('〈벡터량〉','크기와 방향을 갖는 물리량이며, 선분으로 나타낸다. 즉 스칼라양에 대비되는 양으로서 힘, 속도 등은 그 예이다.')}`,'routes','교재 62쪽의 두 정의를 그대로 씁니다(“스칼라량”과 “스칼라양”, “면적 시간”의 쉼표 빠짐, 마침표 없는 “부른다”는 교재 표기).');
page('l8-trip',8,[62],'SPEED QUESTION','민정이의 속력과 속도는\n각각 얼마일까요?','Speed Question · 속력과 속도 구해보기',`${bookLine('어느 맑은 오전에 상쾌한 기분으로 자전거를 타고 있는 민정이가 A지점에서 출발하여 목표지점은 E구간을 돌아 다시 D까지 오는 동안의 속력과 속도를 구하시오. ( 각 구간별 이동시간은 동일하게 10초가 걸렸다. )')}${bookLine('A ― 200m ― B ― 200m ― C ― 200m ― D ― 300m ― E')}${bookLine('① 속력 구하기 · ② 속도 구하기')}`,'cycle-trip','교재 62쪽 Speed Question을 그대로 씁니다. 교재에 답이 인쇄돼 있지 않아, 이동거리(1200m)와 위치 변화(A에서 D까지 600m), 걸린 시간(5구간 × 10초 = 50초)으로 구한 답을 교사 화면에만 둡니다.');
export const q8=[
{id:'i1',n:1,kind:'parts',q:'시간을 나타내는 단위에서 초는 (          ),   분은 (          ), 시는 (          ) 로 나타낸다.',slots:['초','분','시'],answer:['s','m','h'],accept:[['sec'],['min'],['hr']],vocab:['s','m','h'],concept:'units',why:'교재 56쪽 표: 1 m/s(1초당), 1 m/m(1분당), 1 km/h(1시간당) — 초는 s, 분은 m, 시는 h로 나타냅니다.'},
{id:'i2',n:2,kind:'text',q:'이동거리 표현하는 기호를 쓰시오.',answer:'',concept:'speed',why:'이 문항은 교재에 정답이 인쇄돼 있지 않아 공개하지 않습니다.'},
{id:'i3',n:3,kind:'text',q:'은희가 경복이네 집까지 가는 방법은 여러 가지입니다.  여러 가지 방법 들 중에서 속도로 표현할 수 있는 방법은 (          )가지이다.',answer:'',concept:'velocity',why:'이 문항은 교재에 정답이 인쇄돼 있지 않아 공개하지 않습니다.'},
{id:'i4',n:4,kind:'essay',q:'속도 공식에 사용되는 변위의 뜻을 쓰시오.',concept:'velocity',why:'이 문항은 교재에 정답이 인쇄돼 있지 않아 공개하지 않습니다.'},
{id:'i5',n:5,kind:'text',q:'20m 거리를 5초 동안 이동한 물체의  속력을 구하시오.',answer:'4m/s',accept:['4','초속4m','4미터퍼세크'],concept:'speed',why:'20m ÷ 5s = 4m/s. 교재 55쪽 (1)처럼 이동거리를 시간으로 나눕니다.'},
{id:'i6',n:6,kind:'text',q:'100m를 이동한 B물체가 걸린 시간이  20초일 때 속력을 구하시오.',answer:'5m/s',accept:['5','초속5m','5미터퍼세크'],concept:'speed',why:'100m ÷ 20s = 5m/s. 교재 55쪽 (1)처럼 이동거리를 시간으로 나눕니다.'},
{id:'i7',n:7,kind:'text',q:'A에서 B까지의 거리는 200m이다.  B에서 C까지의 거리는 400m이다.  A에서 B까지 가는데 걸린 시간은 20초, B에서 C에서 가는데 걸린 시간은 180초가 걸렸다면 이 물체의 속력을 구하시오.',answer:'3m/s',accept:['3','초속3m','3미터퍼세크'],concept:'speed',why:'이동거리 200m + 400m = 600m, 걸린 시간 20초 + 180초 = 200초 → 600m ÷ 200s = 3m/s.'},
{id:'i8',n:8,kind:'text',q:'C물체가 200m를 가는데 4초가 걸렸다면 속력을 구하시오.',answer:'50m/s',accept:['50','초속50m','50미터퍼세크'],concept:'speed',why:'200m ÷ 4s = 50m/s. 교재 55쪽 (1)처럼 이동거리를 시간으로 나눕니다.'}
];
page('l8-test-a',8,[63],'DAILY TEST · 일일평가','시간의 단위와\n속도를 확인해요.','8차시 · 원본 1~4번',`<div class="test-grid compact-test">${q8.slice(0,4).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p73">1~4번 제출하고 확인</button>`,'assessment','2·3·4번은 50~63쪽에 정답의 근거가 없어 답을 공개하지 않습니다. 1번은 56쪽 표의 단위 기호(s · m · h)로 확인한 답입니다.',{assessment:true,dense:true});
page('l8-test-b',8,[63],'DAILY TEST · 일일평가','이동거리와 시간으로\n속력을 구해요.','8차시 · 원본 5~8번',`<div class="test-grid compact-test">${q8.slice(4,8).map(q=>questionHTML(q)).join('')}</div><button class="page-action" data-grade="p74">5~8번 제출하고 확인</button>`,'assessment','5~8번은 55쪽 (1)처럼 이동거리를 걸린 시간으로 나눠 구한 답입니다(교재에 정답이 인쇄돼 있지 않음). 7번은 두 구간의 거리와 시간을 각각 더해 구합니다.',{assessment:true,dense:true});
export const lessonNames={1:'용수철저울의 구조 익히기',2:'추의 무게에 따른 용수철의 길이 변화',3:'중력과 무게, 질량의 비교',4:'수평잡기의 원리',5:'앉은뱅이저울과 윗접시저울의 구조',6:'저울 만들기와 단원 평가',7:'운동과 정지, 위치와 속력의 표현',8:'속력과 속도의 차이'};
export const questions=[...q1,...q2,...q3,...q4,...q5,...q6,...q7,...q8];
export {history1,history2,history3,coilHistory,future};
export const gradeGroups={'1a':q1.slice(0,3),'1b':q1.slice(3),'2a':q2.slice(0,4),'2b':q2.slice(4,8)};
// Daily Test 문항 묶음(인쇄 쪽 번호 기준). 화면·교사 노트·채점이 모두 이 한 표를 쓴다.
export const assessmentGroupsByPrint={P11:q1,P19:q2.slice(0,6),P20:q2.slice(6,12),P32:q3,P40:q4,P47:q5.slice(0,6),P48:q5.slice(6,12),P53:q6.slice(0,6),P54:q6.slice(6,12),P55:q6.slice(12,17),P56:q6.slice(17,20),P65:q7.slice(0,5),P66:q7.slice(5,10),P73:q8.slice(0,4),P74:q8.slice(4,8)};
pages.forEach((p,i)=>p.layoutIndex=i);
pages.unshift(...inquiryPages);
export const narration=Object.fromEntries(pages.map(p=>[p.id,{id:p.id,text:({
'l1-structure':'용수철저울의 각 부분은 어떤 일을 할까요? 이름을 외우기 전에 부품을 하나씩 확대해서 역할을 생각해 봅시다.',
'l1-use':'물체를 달기 전에 영점을 맞추고, 흔들림이 멈춘 뒤 눈높이를 맞춰 읽어요.',
'l1-eye':'물체는 그대로입니다. 시선을 위와 아래로 바꾼 뒤 눈금판에서 보이는 위치를 직접 찍어 보세요.',
'l1-scales':'추, 채소, 사람의 몸에는 어떤 저울이 알맞을까요? 사용 방법의 공통점도 찾아봅시다.',
'l1-name':'책에서는 용수철이라는 이름을 용의 수염에 빗대어 설명해요. 다시 원래 모양으로 돌아오는 성질을 생각해 보세요.',
'l1-past':'코일이 아니어도 탄성을 이용할 수 있어요. 판스프링과 태엽의 모양을 비교해 봅시다.',
'l1-watch':'오래된 시계 기록영상입니다. 태엽과 작은 용수철이 움직이는 부분을 찾아보세요.',
'l1-future':'아주 작은 코일과 새로운 재료, 시간에 따라 변하는 형태를 책의 미래 전망과 함께 읽어 봅시다.',
'l1-test-a':'먼저 스스로 답을 쓰고 제출해 보세요. 부품의 역할과 순서를 함께 생각합니다.',
'l1-test-b':'눈높이와 고리의 역할을 다시 확인해 봅시다.',
'l2-elastic':'잡아당기거나 누른 뒤 힘을 없애면 원래 모양으로 돌아가려는 성질을 탄성이라고 해요.',
'l2-compress':'전체 길이와 줄어든 길이를 구별해 보세요. 누르는 힘이 커질 때 어떻게 변하나요?',
'l2-measure':'십 그램, 이십 그램, 삼십 그램의 추를 차례로 매달고 늘어난 길이를 기록해 봅시다.',
'l2-graph':'가로축은 추의 무게, 세로축은 늘어난 길이예요. 표를 보고 점을 직접 찍어 보세요.',
'l2-tools':'우리 생활의 여섯 도구에서 용수철이 하는 일을 찾아봅시다.',
'l2-test-a':'같은 용수철에서 무게와 늘어난 길이가 어떻게 연결되는지 확인해 보세요.',
'l2-test-b':'조건을 같게 둔 비교인지, 어떤 길이를 말하는지 생각하며 답하세요.',
'l2-test-graph':'이 표에서는 십 그램일 때 사 센티미터예요. 앞의 실험과 다른 숫자를 사용해 그래프를 완성하세요.',
'l3-newton':'뉴턴은 사과가 아래로 떨어지는 까닭을 생각했어요. 사과를 아래로 끌어당기는 힘은 무엇일까요?',
'l3-gravity':'중력은 어느 방향으로 작용할까요? 교재의 그림에서 화살표가 가리키는 곳을 찾아봅시다.',
'l3-direction':'어느 위치에서 물체를 놓아도 같은 곳을 향할까요? 위치를 하나씩 골라 떨어지는 방향을 정해 보세요.',
'l3-uses':'중력 때문에 일어나는 일과 중력을 이용한 것을 교재에서 찾아봅시다.',
'l3-weight':'무게는 무엇이고 어떤 단위로 나타낼까요? 용수철이 늘어난 정도와 연결해서 생각해 봅시다.',
'l3-place':'장소가 바뀌면 무게도 달라질까요? 지구와 달에서 같은 물체의 무게를 비교해 봅시다.',
'l3-height':'높은 곳에서는 무엇이 달라질까요? 먼저 내 생각을 말하고 이유도 이야기해 보세요.',
'l3-mass':'질량은 무게와 어떻게 다를까요? 장소가 바뀌어도 변하지 않는 것이 무엇인지 찾아봅시다.',
'l3-compare':'같은 사람이 지구와 달에 있을 때 질량과 무게가 어떻게 되는지 비교해 봅시다.',
'l3-graph':'질량이 커지면 무게는 어떻게 될까요? 교재의 값을 점으로 찍어 관계를 살펴봅시다.',
'l3-estimate':'손으로 어림하면 어떤 점이 좋고 어떤 점이 어려울까요? 기준물체도 함께 생각해 봅시다.',
'l3-test':'먼저 스스로 답을 쓰고 제출해 보세요. 중력, 무게, 질량의 뜻을 구분해 생각합니다.',
'l4-level':'수평은 어떤 상태일까요? 빨간 선과 중력 방향 화살표가 어떻게 만나는지 찾아봅시다.',
'l4-principle':'양쪽이 수평일 때 무거운 물체는 받침점에서 가까울까요, 멀까요? 상자를 움직이며 확인해 봅시다.',
'l4-formula':'받침점에서 같은 거리에 놓인 두 상자가 수평이면 무게는 어떨까요? 무게 곱하기 거리를 비교해 봅시다.',
'l4-tilt':'어느 쪽으로 기울어질까요? 받침점에서 더 먼 쪽을 찾아 무게 곱하기 거리를 비교해 봅시다.',
'l4-unequal':'거리가 다른데도 수평이 될 수 있을까요? 왼쪽 상자의 개수와 거리를 바꾸어 직접 만들어 보세요.',
'l4-wheel':'엔진 없이도 바퀴가 비탈길을 올라갈 수 있을까요? 무게중심이 무엇인지 책에서 찾아봅시다.',
'l4-ramp':'바퀴는 올라가는데 무게중심은 어떻게 될까요? 실험 순서를 먼저 읽어 봅시다.',
'l4-test':'일 그램, 삼 그램, 구 그램 추로 달 수 있는 무게를 양팔저울 그림으로 나타내 보세요.',
'l5-kitchen':'가정용 저울의 겉판을 열면 무엇이 있을까요? 접시를 눌러 용수철과 바늘이 어떻게 움직이는지 살펴봅시다.',
'l5-kitchen-use':'가정용 저울은 어떤 순서로 쓸까요? 편평한 곳에 놓고, 바늘이 영을 가리키는지 먼저 확인해 봅시다.',
'l5-toppan':'윗접시저울의 영점 조절 나사, 접시, 팔받침은 각각 어떤 일을 할까요? 부품을 하나씩 눌러 보세요.',
'l5-toppan-use':'분동은 어떤 순서로 올리고 내릴까요? 집게로 무거운 분동부터 올려 수평을 찾아봅시다.',
'l5-brass':'분동은 왜 손으로 만지지 않고 집게로 다룰까요? 분동을 다루는 네 가지 약속을 읽어 봅시다.',
'l5-speed':'윗접시저울이 수평이 되면 왜 분동의 무게 합이 물체의 무게일까요? 양쪽 팔의 길이를 비교해 보세요.',
'l5-test-a':'먼저 스스로 답을 쓰고 제출해 보세요. 윗접시저울의 원리와 부품을 떠올리며 답합니다.',
'l5-test-b':'분동을 올리고 내리는 순서와 그 까닭을 생각하며 답을 써 보세요.',
'l6-spring-make':'용수철저울을 직접 만들어 볼까요? 추를 하나씩 올리며 용수철 끝에 눈금을 표시해 봅시다.',
'l6-spring-check':'내가 만든 용수철저울이 제대로 만들어졌을까요? 영을 가리키는지, 추의 개수와 눈금이 맞는지 확인해 봅시다.',
'l6-balance-make':'자와 클립으로 양팔저울을 만들어 볼까요? 수평이 맞지 않으면 고무 찰흙을 붙여 맞춰 봅시다.',
'l6-balance-use':'기준물체를 정하고 다른 물체를 하나씩 올려 보세요. 기준물체보다 가벼운지 무거운지 나눌 수 있어요.',
'l6-unit-a':'무게 재기 단원 평가예요. 용수철저울의 구조와 사용 방법을 떠올리며 답해 보세요.',
'l6-unit-b':'표를 보고 늘어난 길이를 계산하고, 용수철이 쓰인 물건도 찾아보세요.',
'l6-unit-c':'수평이 되려면 무게와 거리가 어떻게 되어야 하는지 생각하며 답해 보세요.',
'l6-unit-d':'모빌과 막대에 매달린 물체의 무게를 비교해 보세요.',
'l7-motion':'시간이 흘러도 위치가 그대로인 것과, 위치가 변한 것은 무엇이 다를까요? 영초, 일초, 이초의 위치를 비교해 봅시다.',
'l7-motion-q':'그림 속 물체가 운동하고 있다고, 또는 운동하고 있지 않다고 생각하는 까닭은 무엇일까요? 위치를 비교해 보세요.',
'l7-position':'위치를 말할 때는 무엇을 함께 말해야 할까요? 기준점, 방향, 거리를 찾아봅시다.',
'l7-position-q':'그림의 거리를 보고 건물의 위치를 방향과 거리로 표현해 보세요. 기준점이 어디인지 먼저 확인해요.',
'l7-place':'장소와 위치는 어떻게 다를까요? 위치에는 기준점과 방향, 거리가 들어 있어요.',
'l7-bear':'곰 인형을 움직이지 않고도 앞으로 가는 것처럼 보이게 할 수 있을까요? 두 가지 방법을 비교해 봅시다.',
'l7-speed':'에이는 일 초 동안 일 미터를 갔어요. 그래프에서 비, 씨, 디의 빠르기도 구해 볼까요?',
'l7-units':'미터 퍼 세크, 킬로미터 퍼 아워는 무엇을 뜻할까요? 표에서 읽는 법과 뜻을 찾아봅시다.',
'l7-test-a':'먼저 스스로 답을 쓰고 제출해 보세요. 정지와 운동, 속력의 공식을 떠올리며 답합니다.',
'l7-test-b':'속력의 단위를 읽고, 그 크기가 무엇을 뜻하는지 설명해 보세요.',
'l8-signs':'빨간 테두리의 둥근 표지판은 무엇을 알려 줄까요? 속력과 관계있는 표지판도 찾아봅시다.',
'l8-hypertube':'시속 천이백 킬로미터로 달리는 하이퍼튜브는 얼마나 빠를까요? 과학 이야기를 읽어 봅시다.',
'l8-routes':'에이에서 비까지 가는 길은 몇 가지나 될까요? 여러 경로를 그려 보고 비교해 봅시다.',
'l8-velocity':'속도는 속력과 무엇이 다를까요? 방향을 함께 나타내는지 살펴봅시다.',
'l8-vector':'하나의 수치로 나타낼 수 있는 양과, 크기와 방향을 함께 나타내는 양을 나누어 봅시다.',
'l8-trip':'민정이가 이 지점까지 갔다가 디 지점으로 돌아왔어요. 이동거리와 위치의 변화를 따로 생각해 봅시다.',
'l8-test-a':'먼저 스스로 답을 쓰고 제출해 보세요. 시간의 단위와 속도의 뜻을 떠올리며 답합니다.',
'l8-test-b':'이동거리를 걸린 시간으로 나누어 속력을 구해 보세요.'
})[p.id]||inquiryNarration[p.id]}]));
