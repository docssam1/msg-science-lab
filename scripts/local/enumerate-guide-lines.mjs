// 한 차시의 학생 안내 문장(장면 해설·말풍선·실험 안내) 가운데 아직 음성이 없는 줄을 모아 omnivoice-guide.py용 spec(JSON)으로 저장한다.
// 음성은 만들지 않는다. 사용: node scripts/local/enumerate-guide-lines.mjs --lesson 4 --out E:/Codex/visualizations/msg-lecture-04/voice/lesson4-spec.json
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const arg=name=>{const i=process.argv.indexOf(`--${name}`);return i>0?process.argv[i+1]:null;};
const lesson=Number(arg('lesson'));
const out=arg('out');
if(!lesson||!out){console.error('사용: --lesson <차시> --out <spec.json>');process.exit(1);}
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','..');
const load=file=>import(pathToFileURL(resolve(root,'sample-v2',file)).href);
const {studentGuideFor,studentActivityPrompt}=await load('student-guide.js');
const {studentPrintPages,studentCoverPage}=await load('lesson-print-pages.js');
const {narration}=await load('content.js');
const norm=text=>String(text||'').replace(/\s+/g,' ').trim();
const library=JSON.parse(readFileSync(resolve(root,'sample-v2/audio/voice-library.json'),'utf8')).clips;
const voiced=new Set(Object.values(library).map(clip=>norm(clip.text)));
const pages=[studentCoverPage,...studentPrintPages];
const lines=new Map();
const add=(text,source)=>{text=norm(text);if(text&&!lines.has(text))lines.set(text,source);};
const kinds=new Set();
pages.forEach((page,index)=>{
 if(page.lesson!==lesson)return;
 add(narration[page.id]?.text,`narration ${page.printId}`);
 for(const match of String(page.body||'').matchAll(/data-action="([^"]+)"/g))if(match[1]!=='assessment')kinds.add(match[1]);
 for(const visited of [false,true]){
  const guide=studentGuideFor(page,index,pages.length-1,visited);
  add(guide.text,`guide ${page.printId} visited=${visited}`);
  if(guide.kind&&!visited){
   kinds.add(guide.kind);
   const cue=guide.text.split(' 실험을 해볼까요?')[0];
   add((cue&&!cue.includes('다음 페이지')&&cue!==guide.text?cue+' ':'')+studentActivityPrompt(guide.kind),`active ${page.printId}`);
  }
 }
});
for(const kind of kinds)add(studentActivityPrompt(kind),`prompt ${kind}`);
const all=[...lines];
const missing=all.filter(([text])=>!voiced.has(text));
console.log(`${lesson}차시 안내 문장 ${all.length}줄 | 이미 음성 있음 ${all.length-missing.length} | 만들 것 ${missing.length}`);
for(const [text,source] of missing)console.log(' -',source,'|',text);
mkdirSync(dirname(resolve(out)),{recursive:true});
// 화면 글자와 읽는 글자가 다른 기호(①~④)는 읽을 글자를 따로 적는다.
writeFileSync(resolve(out),JSON.stringify(missing.map(([text])=>{const spoken=text.replace('①~④','1번부터 4번');return spoken===text?{text}:{text,spoken};}),null,1),'utf8');
console.log('spec 저장:',resolve(out));
