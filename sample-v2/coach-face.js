// 우루사쌤 표정 — 원장이 승인한 **전신 표정 그림** 6장(art/expressions-full, 화면용은 크기만 줄인
// web/*.webp)을 **통째로** 바꿔 끼운다. 입·눈을 그리거나 얼굴 일부를 합성하지 않는다(manifest 정책).
// 여섯 장은 캔버스·몸 위치가 같아서 겹쳐 두고 한 장만 보이면 몸이 튀지 않는다.
// 말할 때는 explain(입 벌림)과 listen(입 다묾) 두 장을 음성의 크기에 맞춰 번갈아 보여 준다.
//  · 음성 분석(Web Audio AnalyserNode)이 되면 실제 소리 크기로, 안 되면 7Hz 안팎의 리듬으로.
//  · 소리가 실제로 재생되는 동안에만 입이 움직인다. 소리가 없으면 분위기 표정만 보인다.
//  · 움직임은 CSS transform만(stage.css). prefers-reduced-motion이면 움직이지 않고 표정만 바뀐다.
export const FACES=['listen','explain','think','surprise','praise','encourage'];
const LABEL={listen:'듣는',explain:'설명하는',think:'생각하는',surprise:'놀란',praise:'칭찬하는',encourage:'격려하는'};

let active=null;
// app.js의 say()가 부른다. 우루사쌤 화면이 없으면(교사용) 아무 일도 하지 않는다.
export function voiceStarted(audio){active?.speak(audio);}
export function voiceStopped(){active?.silence();}

let actx=null;
function audioContext(){
 if(actx)return actx;
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)return null;
 try{actx=new AC();}catch{actx=null;}
 return actx;
}
// 같은 출처의 실제 <audio>이고 AudioContext가 이미 돌고 있을 때만 분석기를 단다.
// (멈춘 컨텍스트에 연결하면 소리가 안 나므로, 그때는 연결하지 않고 리듬으로 움직인다.)
function analyserFor(audio){
 if(!(audio instanceof HTMLMediaElement))return null;
 try{if(new URL(audio.currentSrc||audio.src,location.href).origin!==location.origin)return null;}catch{return null;}
 const ctx=audioContext();
 if(!ctx||ctx.state!=='running'){ctx?.resume?.().catch(()=>{});return null;}
 try{
  const source=ctx.createMediaElementSource(audio),analyser=ctx.createAnalyser();
  analyser.fftSize=1024;analyser.smoothingTimeConstant=.2;
  source.connect(analyser);analyser.connect(ctx.destination);
  return {analyser,buf:new Float32Array(analyser.fftSize),source};
 }catch{return null;}
}

export function mountCoachFace(figure){
 if(!figure)return null;
 active?.destroy();
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 figure.classList.add('coach-face');
 figure.setAttribute('role','img');
 const pose=document.createElement('div');pose.className='coach-pose';
 pose.innerHTML='<div class="coach-act"><div class="coach-sway"><div class="coach-bob"></div></div></div>';
 const act=pose.querySelector('.coach-act'),bob=pose.querySelector('.coach-bob');
 const imgs=new Map(FACES.map(name=>{
  const img=new Image();img.src=new URL(`./art/expressions-full/web/${name}.webp`,import.meta.url).href;
  img.alt='';img.draggable=false;img.decoding='async';img.dataset.face=name;
  bob.append(img);img.decode?.().catch(()=>{});   // 여섯 장을 미리 풀어 두어 바꿔 끼울 때 깜빡이지 않게
  return [name,img];
 }));
 figure.append(pose);

 let base='listen',hint=null,hintUntil=0,reaction=null,reactUntil=0,shown=null,flips=0,timer=0;
 let voice=null,quietAt=-1e9;   // 지금 재생 중인 음성 {audio, driver, open, ...} · 마지막으로 말을 마친 때
 const log=[];
 const now=()=>performance.now();
 function show(name){
  if(name===shown)return;
  imgs.get(shown)?.classList.remove('on');imgs.get(name).classList.add('on');
  shown=name;figure.dataset.face=name;
  log.push({t:Math.round(now()),face:name});if(log.length>400)log.shift();
 }
 function logical(){const t=now();return reaction&&t<reactUntil?reaction:hint&&t<hintUntil?hint:base;}
 function render(){
  const t=now();
  if(reaction&&t>=reactUntil)reaction=null;
  if(hint&&t>=hintUntil)hint=null;
  const mood=logical();
  let face=mood;
  if(voice?.flapping&&!reaction)face=reduce.matches?'explain':voice.open?'explain':'listen';
  show(face);
  const lean=mood==='think'?'lean':'';
  if((figure.dataset.pose||'')!==lean)figure.dataset.pose=lean;
  const label=`우루사쌤 ${LABEL[voice?.flapping&&!reaction?'explain':mood]} 표정`;
  if(figure.getAttribute('aria-label')!==label)figure.setAttribute('aria-label',label);
  clearTimeout(timer);
  const next=Math.min(reaction?reactUntil:Infinity,hint?hintUntil:Infinity);
  if(Number.isFinite(next))timer=setTimeout(render,Math.max(16,next-t+4));
 }
 function kick(motion){
  if(!motion||reduce.matches)return;
  delete figure.dataset.motion;void act.offsetWidth;figure.dataset.motion=motion;
 }
 // 한 번짜리 동작(깡충·흔들·끄덕)이 끝나면 표시를 지운다(좁은 화면에서는 동그란 얼굴 틀 자체가 움직인다)
 const MOTIONS=/^coach-(hop|shake|nod|present)/;
 figure.addEventListener('animationend',e=>{if(MOTIONS.test(e.animationName))delete figure.dataset.motion;});

 // ── 말하기 ──────────────────────────────────────────────────────────
 function setTalk(v){if(voice)voice.level=v;bob.style.setProperty('--talk',v.toFixed(3));}
 function startFlap(){
  if(!voice||voice.flapping)return;
  voice.flapping=true;voice.open=false;voice.switchAt=now();voice.next=now();voice.peak=.02;voice.max=0;voice.level=0;voice.playStart=now();
  if(voice.driver===null)voice.driver=(voice.probe=analyserFor(voice.audio))?'analyser':'rhythm';
  figure.dataset.speaking=voice.driver;
  render();
  if(!reduce.matches)voice.raf=requestAnimationFrame(tick);
 }
 function pauseFlap(){
  if(!voice?.flapping)return;
  voice.flapping=false;voice.open=false;cancelAnimationFrame(voice.raf);setTalk(0);
  delete figure.dataset.speaking;render();
 }
 function tick(t){
  const v=voice;if(!v?.flapping)return;
  let want=v.open,target=0;
  if(v.driver==='analyser'){
   v.probe.analyser.getFloatTimeDomainData(v.probe.buf);
   let sum=0;for(const x of v.probe.buf)sum+=x*x;
   const rms=Math.sqrt(sum/v.probe.buf.length);
   v.max=Math.max(v.max,rms);v.peak=Math.max(rms,v.peak*.994,.02);
   want=v.open?rms>v.peak*.2:rms>v.peak*.34;
   target=Math.min(1,rms/v.peak);
   // 소리가 전혀 잡히지 않으면(드문 브라우저 제약) 리듬으로 바꾼다.
   if(t-v.playStart>900&&v.max<.002){v.driver='rhythm';figure.dataset.speaking='rhythm';}
   if(want!==v.open&&t-v.switchAt>=62){v.open=want;v.switchAt=t;flips++;render();}
   if(v.open&&t-v.switchAt>340){v.open=false;v.switchAt=t;flips++;render();}   // 긴 모음도 가끔은 다문다
  }else{
   if(t>=v.next){
    v.open=!v.open;v.switchAt=t;flips++;render();
    // 입 벌림 70–115ms, 다묾 55–95ms(≈7Hz), 가끔 낱말 사이 쉼
    v.next=t+(v.open?70+Math.random()*45:Math.random()<.12?170+Math.random()*120:55+Math.random()*40);
   }
   target=v.open?1:.15;
  }
  setTalk((v.level||0)+(target-(v.level||0))*.35);
  v.raf=requestAnimationFrame(tick);
 }
 function speak(audio){
  silence();
  const v={audio,driver:null,flapping:false,open:false,level:0,off:[]};
  voice=v;
  if(audio instanceof HTMLMediaElement){
   const on=(type,fn)=>{audio.addEventListener(type,fn);v.off.push(()=>audio.removeEventListener(type,fn));};
   on('playing',()=>{if(voice===v)startFlap();});
   on('pause',()=>{if(voice===v)pauseFlap();});
   on('waiting',()=>{if(voice===v)pauseFlap();});
   on('ended',()=>{if(voice===v)silence();});
   if(!audio.paused&&audio.readyState>2)startFlap();
  }else{
   // Audio를 흉내 낸 객체(테스트) 등: play()를 부른 순간부터 리듬으로
   v.driver='rhythm';startFlap();
  }
 }
 function silence(){
  const v=voice;if(!v)return;
  voice=null;quietAt=now();cancelAnimationFrame(v.raf);v.off.forEach(f=>f());
  try{v.probe?.source.disconnect();v.probe?.analyser.disconnect();}catch{}
  setTalk(0);delete figure.dataset.speaking;render();
 }
 // 첫 손길에서 AudioContext를 미리 깨워 둔다(자동 재생 정책). 소리 경로는 건드리지 않는다.
 const wake=()=>{audioContext()?.resume?.().catch(()=>{});};
 document.addEventListener('pointerdown',wake,{capture:true,passive:true});
 document.addEventListener('keydown',wake,{capture:true});
 const onReduce=()=>{if(voice?.flapping){cancelAnimationFrame(voice.raf);setTalk(0);if(!reduce.matches)voice.raf=requestAnimationFrame(tick);}render();};
 reduce.addEventListener?.('change',onReduce);

 const api={
  // 가만히 있을 때의 표정
  mood(name,{motion}={}){if(!imgs.has(name))name='listen';const changed=name!==base;base=name;if(changed||motion)hint=null;if(motion)kick(motion);if(changed||motion)render();},   // 분위기가 바뀌면 잠깐 표정(hint)은 거둔다
  // 잠깐 지나가는 반응(놀람·칭찬) — 말하는 입보다 먼저 보인다
  react(name,ms,motion){reaction=name;reactUntil=now()+ms;kick(motion);render();},
  // 소리 없이 안내만 바뀔 때 잠깐(설명 표정)
  // (말을 막 마친 직후에는 입을 다문 얼굴로 돌아가게 두고, 다음 안내가 나오기 전까지 벌리지 않는다)
  hint(name,ms,motion){if(name==='explain'&&(voice||now()-quietAt<900))return;hint=name;hintUntil=now()+ms;kick(motion);render();},
  speak,silence,
  get state(){return {face:shown,base,speaking:voice?.flapping?voice.driver:null,flips,log:[...log]};},
  destroy(){silence();clearTimeout(timer);document.removeEventListener('pointerdown',wake,{capture:true});document.removeEventListener('keydown',wake,{capture:true});reduce.removeEventListener?.('change',onReduce);pose.remove();figure.classList.remove('coach-face');if(active===api)active=null;}
 };
 active=api;
 // 검증용(화면에는 영향 없음): 지금 표정·말하기 방식·입 바꾼 횟수
 Object.defineProperty(window,'__coachFace',{configurable:true,get:()=>active?.state??null});
 render();
 return api;
}
