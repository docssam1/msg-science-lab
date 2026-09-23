// One voice and one approved whole-expression image across book, teach and self.
// No synthetic mouth overlay. No speechSynthesis fallback.
const normal=t=>String(t??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const EXPRESSIONS={listen:'기본',explain:'설명',think:'생각',surprise:'놀람',praise:'칭찬',encourage:'격려'};
export function createCoach({figure,caption,label,onState=()=>{},onError=()=>{}}){
 let library={clips:{},playlists:{},lookup:{}},sequence=0,active=null,settle=null,playing=false,enabled=true,disposed=false;
 const images=new Map();
 for(const mood of Object.keys(EXPRESSIONS)){const image=new Image();image.src=new URL('./art/expressions/'+mood+'.png',import.meta.url).href;images.set(mood,image);}
 figure.replaceChildren();const face=document.createElement('img');face.className='approved-expression';face.width=480;face.height=520;figure.append(face);
 function mood(m='listen'){if(!EXPRESSIONS[m])m='listen';if(figure.dataset.mood===m)return;figure.dataset.mood=m;face.src=images.get(m).src;face.alt='우루사쌤 · '+EXPRESSIONS[m]+' 표정';}
 function text(t){caption.textContent=t;caption.scrollTop=0;}
 function state(phase,details={}){playing=phase==='playing';figure.dataset.voice=phase;onState({phase,playing,...details});}
 function stop(){sequence++;if(active){active.onended=active.onerror=active.onplaying=active.onwaiting=null;active.pause();active.removeAttribute('src');active.load();active=null;}const done=settle;settle=null;done?.(false);state('idle');mood('listen');}
 const ready=(async()=>{try{const r=await fetch(new URL('./audio/voice-library.json',import.meta.url),{signal:AbortSignal.timeout(10000),cache:"no-store"});if(!r.ok)throw Error('음성 목록 '+r.status);const d=await r.json();if(d.engine!=='OmniVoice')throw Error('잘못된 음성 목록');library=d;label.textContent='우루사쌤 · OmniVoice';return true;}catch(e){label.textContent='우루사쌤 음성 목록을 불러오지 못했어요';onError(e);return false;}})();
 function resolve(id,t){if(id&&library.playlists[id])return library.playlists[id].clips.map(k=>library.clips[k]);if(id&&library.clips[id])return [library.clips[id]];const k=library.lookup[normal(t)]||Object.keys(library.clips).find(k=>normal(library.clips[k].text)===normal(t));return k?[library.clips[k]]:[];}
 async function say(t,{id=null,expression=null}={}){
  stop();const token=sequence;text(t||'');await ready;if(disposed||token!==sequence||!enabled||document.hidden)return false;
  const clips=resolve(id,t);if(!clips.length||clips.some(c=>!c?.path||!String(c.engine).startsWith('OmniVoice'))){label.textContent='이 해설의 OmniVoice 음원을 불러오지 못했어요';mood('listen');onError(new Error('OmniVoice 음원 없음: '+(id||String(t).slice(0,50))));return false;}
  for(let i=0;i<clips.length;i++){
   if(disposed||token!==sequence||!enabled)return false;
   const c=clips[i];text(c.text);label.textContent='우루사쌤 · 음성 불러오는 중';mood('listen');
   const ok=await new Promise(done=>{
    let finished=false;let timer=null;settle=end;
    function end(value){if(finished)return;finished=true;clearTimeout(timer);if(settle===end)settle=null;done(value);}
    const a=new Audio(new URL(c.path,import.meta.url).href);active=a;a.preload='auto';
    a.onplaying=()=>{if(token!==sequence)return;clearTimeout(timer);label.textContent='우루사쌤 · OmniVoice'+(clips.length>1?' '+(i+1)+'/'+clips.length:'');mood(expression||c.mood||'explain');state('playing',{id:c.id,index:i,total:clips.length});};
    a.onwaiting=()=>{if(token===sequence){label.textContent='우루사쌤 · 음성 연결 중';mood('listen');}};
    a.onended=()=>{if(token!==sequence)return end(false);state('between');mood('listen');end(true);};
    a.onerror=()=>{if(token===sequence){label.textContent='음원을 재생하지 못했어요 · 다시 듣기를 눌러 주세요';mood('listen');state('error');onError(new Error('OmniVoice 재생 실패: '+c.id));}end(false);};
    timer=setTimeout(()=>{if(token===sequence){label.textContent='음성 연결이 지연돼요 · 다시 시도해 주세요';a.pause();state('error');mood('listen');}end(false);},20000);
    a.play().catch(e=>{if(token===sequence){label.textContent='소리 재생을 시작하려면 다시 듣기를 눌러 주세요';mood('listen');state('error');onError(e);}end(false);});
   });
   if(!ok||token!==sequence)return false;
  }
  if(token!==sequence)return false;active=null;label.textContent='우루사쌤 · OmniVoice';state('ended');mood(expression||(/[?？]\s*$/.test(clips.at(-1).text)?'think':'listen'));return true;
 }
 function preview(t,m='listen'){if(playing)return;text(t);mood(m);}
 function respond(id,t,m){return say(t,{id,expression:m});}
 mood('listen');
 return {ready,say,respond,stop,preview,mood,setEnabled(v){enabled=!!v;if(!enabled)stop();},get playing(){return playing;},get library(){return library;},get audio(){return active;},destroy(){stop();disposed=true;figure.replaceChildren();}};
}
