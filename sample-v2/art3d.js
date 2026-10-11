// 예전 SVG 도해 함수와 같은 이름으로 3D 렌더 그림(<img>)을 돌려준다.
// 그림 파일은 scripts/local/render-3d-stills.mjs가 3D 장면(lab3d.js·stills3d.js·balance3d.js)에서 렌더해 art/에 저장한 것이다.
const img=(name,alt,cls='still3d')=>`<img class="${cls}" src="./art/${name}.jpg" alt="${alt}">`;
const row=items=>`<div class="still-row">${items.map(([name,alt,cap])=>`<figure>${img(name,alt)}${cap?`<figcaption>${cap}</figcaption>`:''}</figure>`).join('')}</div>`;

// 용수철저울: labels가 있으면 부분 찾기용, 무게가 있으면 추를 단 저울
export function scaleArt({force=12,labels=true}={}){
 if(labels)return img('l1-scale-parts','여섯 부분을 찾아볼 3D 용수철저울');
 return force>0?img('l1-scale-loaded','추를 매단 3D 용수철저울'):img('l1-scale-empty','물체를 매달지 않은 3D 용수철저울');
}
export const scaleStep=kind=>({offzero:img('l1-scale-offzero','표시자가 0이 아닌 빈 3D 용수철저울'),empty:img('l1-scale-empty','표시자가 0인 빈 3D 용수철저울'),loaded:img('l1-scale-loaded','추를 매단 3D 용수철저울'),read:img('l1-scale-read','표시자와 같은 높이에서 본 3D 눈금')})[kind];
export function eyeArt(){return row([['l1-eye-high','위에서 본 3D 눈금','① 위에서'],['l1-eye-front','표시자와 같은 높이에서 본 3D 눈금','② 같은 높이에서'],['l1-eye-low','아래에서 본 3D 눈금','③ 아래에서']]);}
export function springArt({mode='pull'}={}){
 return mode==='compress'
  ?row([['l2-compress-rest','누르기 전 3D 용수철','힘을 주기 전'],['l2-compress-small','작은 힘으로 누른 3D 용수철','작은 힘'],['l2-compress-big','큰 힘으로 누른 3D 용수철','큰 힘']])
  :row([['l2-spring-rest','당기기 전 3D 용수철','힘을 주기 전'],['l2-spring-small','작은 힘으로 당긴 3D 용수철','작은 힘'],['l2-spring-big','큰 힘으로 당긴 3D 용수철','큰 힘']]);
}
export function springActionArt(action='pull'){
 return {pull:img('l2-spring-pull','잡아당겨 길어진 3D 용수철'),compress:img('l2-compress-big','눌러서 짧아진 3D 용수철'),release:img('l2-spring-rest','힘을 없앤 3D 용수철')}[action]||img('l2-spring-rest','3D 용수철');
}
export function factorArt(factor='material'){
 const id=factor==='thickness'?'wire':factor;
 return img(`l2-factor-${id}`,{material:'재질만 다른 두 3D 용수철',wire:'철사 굵기만 다른 두 3D 용수철',diameter:'코일 지름만 다른 두 3D 용수철'}[id]||'두 3D 용수철');
}
export function loadArt(){return row([['l2-measure-10','10 g 추를 매단 3D 용수철','10 g'],['l2-measure-20','20 g 추를 매단 3D 용수철','20 g'],['l2-measure-30','30 g 추를 매단 3D 용수철','30 g']]);}
export const measureArt=g=>img(`l2-measure-${g}`,`${g} g 추를 매단 3D 용수철과 자`);
// 추의 무게-늘어난 길이 그래프 칠판(본문 실험 3·6·9 cm는 step 3, Daily Test 12번 4·8·12 cm는 step 4)
export function graphSVG({points=[],step=3}={}){
 const b12=step===4;
 return points.length?img(b12?'l2-graph-b12-answer':'l2-graph-answer',b12?'(10, 4)·(20, 8)·(30, 12)을 지나는 3D 그래프 칠판':'(10, 3)·(20, 6)·(30, 9)를 지나는 3D 그래프 칠판')
  :img(b12?'l2-graph-b12':'l2-graph','추의 무게와 늘어난 길이 3D 그래프 칠판');
}
export function graphChoices(){return img('l2-graph-choices','네 가지 그래프 보기 1~4번 3D 칠판');}
const photo=(file,alt)=>img(file,alt,'still3d photo');
export function toolIcon(kind){
 const photos={kitchen:['../photos/scale-table','앉은뱅이저울 사진'],body:['../photos/scale-person','체중계 사진'],watch:['../photos/watch-mainspring-real','시계 속 태엽 사진'],stapler:['../photos/stapler','스테이플러 사진'],pen:['../photos/pen','볼펜 사진'],pogo:['../photos/pogo','스카이 콩콩 사진'],trampoline:['../photos/trampoline','트램펄린 사진'],trap:['../photos/trap','쥐덫 사진']};
 if(kind==='leaf')return img('l1-leaf-spring','판스프링 3D 그림');
 if(kind==='expander')return img('l2-tool-expander','완력기 3D 그림');
 const p=photos[kind];return p?photo(p[0],p[1]):img('l2-spring-rest','3D 용수철');
}
export function levelArt(){return img('l4-level','수평이 중력 방향과 수직임을 보여 주는 두 지구 3D 그림');}
