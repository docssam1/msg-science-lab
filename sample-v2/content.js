import {inquiryPages,inquiryNarration} from './inquiry-pages.js';
import {scaleArt, springArt, eyeArt, graphSVG, graphChoices, toolIcon, loadArt} from './graphics.js';
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
<div class="page-actions">${act('zero','영점 조절하기')}${act('compare','두 물체 매달아 비교하기')}${act('target','목표 눈금에 맞춰 당기기')}</div>
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
{id:'b3',n:3,kind:'choice',q:'다음 중 물체의 무게와 용수철의 늘어난 길이 사이의 관계를 바르게 나타낸 그래프를 고르시오.',graphic:'choices',options:['①','②','③','④'],answer:2,concept:'graph',why:'늘어난 길이는 추를 매달지 않았을 때 0이고, 같은 용수철에서 무게에 비례합니다. 원점을 지나는 증가 그래프 ③입니다.'},
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
 const prefix=`<div class="question" data-q="${q.id}"><header><span>${String(q.n).padStart(2,'0')}</span><p>${q.q}</p></header>`;
 let b=q.passage?`<div class="given">${q.passage}</div>`:'';
 if(q.image)b+=`<img class="q-image ${q.kind==='parts'?'parts':''}" src="./art/${q.image}" alt="${q.id==='a1'?'ㄱ·ㄴ·ㄷ·ㄹ을 표시한 원본 용수철저울 그림':'ㄱ·ㄴ·ㄷ의 눈높이를 표시한 원본 그림'}">`;
 if(q.graphic)b+=art(graphChoices(),'q-graphs');
 if(q.kind==='choice')b+=`<div class="q-options">${q.options.map((t,i)=>`<label><input type="radio" name="${q.id}" value="${i}" data-answer-field><span>${q.graphic?'':`<i>${'①②③④⑤'[i]}</i>`}${t}</span></label>`).join('')}</div>`;
 if(q.kind==='text')b+=`<label class="short-answer">답 <input name="${q.id}" data-answer-field autocomplete="off" maxlength="40"></label>`;
 if(q.kind==='parts')b+=`<div class="parts-answers">${['ㄱ','ㄴ','ㄷ','ㄹ'].map((v,i)=>`<label>${v}<input name="${q.id}-${i}" data-answer-field autocomplete="off" maxlength="20"></label>`).join('')}</div>`;
 if(q.kind==='pair')b+=`<div class="pair-answers">${['㉠','㉡'].map((v,i)=>`<label>${v}<select name="${q.id}-${i}" data-answer-field><option value="">선택</option><option>조금</option><option>많이</option></select></label>`).join('')}</div>`;
 if(q.kind==='graph')b+=table(['추의 무게(g)','10','20','30'],[['늘어난 길이(cm)','4','8','12']])+`<div class="student-graphic">${art(graphSVG({step:4,labels:false}),'print-graph')}</div><div class="teacher-graphic">${art(graphSVG({step:4,points:[[10,4],[20,8],[30,12]]}),'print-graph')}</div>`+`<button class="page-action" data-action="assessment-graph">그래프에 점 찍고 제출하기</button>`;
 const answer=Array.isArray(q.answer)?JSON.stringify(q.answer):q.options?q.options[q.answer]:q.answer;
 return prefix+b+`<div class="teacher-answer">정답: ${answer}<p>${q.why}</p></div><div class="question-feedback" data-feedback="${q.id}" hidden></div></div>`;
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

export const lessonNames={1:'용수철저울의 구조 익히기',2:'추의 무게에 따른 용수철의 길이 변화'};
export const questions=[...q1,...q2];
export const gradeGroups={'1a':q1.slice(0,3),'1b':q1.slice(3),'2a':q2.slice(0,4),'2b':q2.slice(4,11)};
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
'l2-test-graph':'이 표에서는 십 그램일 때 사 센티미터예요. 앞의 실험과 다른 숫자를 사용해 그래프를 완성하세요.'
})[p.id]}]));

Object.assign(narration,inquiryNarration);
