"""Integrate the visible inquiry source files; no external file-transfer URL is used."""
from pathlib import Path
import json,re,subprocess,hashlib
import qrcode,cv2,numpy as np
root=Path('sample-v2')
meta=json.loads(subprocess.check_output(['node','--experimental-default-type=module','--input-type=module','-e',"import {pages} from './sample-v2/content.js';console.log(JSON.stringify(pages.map(p=>({id:p.id,action:p.action}))))"]))
assert len(meta)==18,'Expected unchanged 18-page source sample'
ids=[p['id'] for p in meta]
Path('tests/two-lesson/original-page-ids.json').write_text(json.dumps(ids))
p=root/'style.css';s=p.read_text();s=re.sub(r'\[data-book-page="(\d+)"\]',lambda m:'[data-page-id="'+ids[int(m[1])]+'"]',s);p.write_text(s)
p=root/'index.html';s=p.read_text();assert 'inquiry.css' not in s;s=s.replace('</head>','<link rel="stylesheet" href="./inquiry.css"></head>');p.write_text(s)
p=root/'content.js';s=p.read_text();s="import {inquiryPages,inquiryNarration} from './inquiry-pages.js';\n"+s;s=s.replace('export const narration=Object.fromEntries','pages.unshift(...inquiryPages);\nexport const narration=Object.fromEntries');s+='\nObject.assign(narration,inquiryNarration);\n';p.write_text(s)
p=root/'activities.js';s=p.read_text().replace("export const activityNames={","export const activityNames={inquiry:'왜 저울이 필요할까요? · 예상하고 측정하기',").replace("export async function mountActivity(kind,host,ctx){","export async function mountActivity(kind,host,ctx){\n if(kind==='inquiry'){const {mountInquiry}=await import('./inquiry.js');return mountInquiry(host,ctx);}");p.write_text(s)
p=root/'app.js';s="import {qrLinks} from './qr-links.js';\n"+p.read_text()
s=s.replace('data-book-page="${i}" data-source=','data-book-page="${i}" data-page-id="${p.id}" data-source=')
s=s.replace('<div class="page-heading"><div class="eyebrow">','<a class="page-qr" href="${qrLinks[p.id].url}" aria-label="${qrLinks[p.id].label}"><img src="./qr/${p.id}.png" alt="${qrLinks[p.id].label} QR"><span>${qrLinks[p.id].label}</span></a><div class="page-heading"><div class="eyebrow">')
s=s.replace("MSG · ${p.lesson}차시 / 본책 ${p.source.join('·')}쪽","MSG · ${p.lesson}차시 / ${p.added?'추가 도입 · 본책 연계 ':'본책 '}${p.source.join('·')}쪽")
s=s.replace('재편집 18쪽','재편집 20쪽(추가 도입 2쪽 포함)').replace('const ctx={say,status:','const ctx={isTeacher:()=>isTeacher,say,status:')
s=s.replace("$('#teacher-guide').textContent=p.teacher;","$('#teacher-guide').textContent=p.added?'예상과 이유를 먼저 듣고, 학생이 실험 방법을 점검하게 합니다. 원인별 기록은 실험의 교사용 영역에서 확인합니다.':p.teacher;")
old="current=Math.max(0,Math.min(pages.length-1,Number(new URLSearchParams(location.search).get('page')||load('page',0))));"
new="""const route=new URLSearchParams(location.search),routeId=route.get('p'),routeIndex=pages.findIndex(p=>p.id===routeId);
let savedPage=load('page',0);
if(load('content-version',0)<3){savedPage=Number.isFinite(savedPage)?savedPage+2:0;save('content-version',3);}
const rawPage=routeIndex>=0?routeIndex:route.has('page')?Number(route.get('page')):route.has('p')?0:savedPage;
current=Number.isFinite(rawPage)?Math.max(0,Math.min(pages.length-1,rawPage)):0;
if(!route.has('p')&&!route.has('page')&&!load('page',null))current=0;"""
assert old in s;s=s.replace(old,new)
s=s.replace("$('#voice-kind').textContent=started?'해설 다시 듣기로 시작합니다.':'소리는 수업 시작 후 재생됩니다.';","const url=new URL(location.href);url.searchParams.set('p',pages[current].id);url.searchParams.delete('page');url.searchParams.delete('lab');history.replaceState(null,'',url);\n $('#voice-kind').textContent=started?'해설 다시 듣기로 시작합니다.':'소리는 수업 시작 후 재생됩니다.';")
s=s.replace("document.documentElement.dataset.ready='true';","document.documentElement.dataset.ready='true';\nif(route.get('lab')&&activityNames[route.get('lab')]){await openActivity(route.get('lab'));}\n")
p.write_text(s)
p=root/'lab3d.js';s=p.read_text()
s=s.replace("{mode='compare',onChange=()=>{},onPick=()=>{},onRelease=()=>{}}", "{mode='compare',initialZero=null,onChange=()=>{},onPick=()=>{},onRelease=()=>{},onAdjustZero=()=>{}}")
s=s.replace("mode==='eye'?'눈높이를", "mode==='inquiry'?'물건을 매달고 눈금을 직접 읽어 보세요':mode==='eye'?'눈높이를")
s=s.replace("zero=mode==='zero'?4:0", "zero=initialZero===null?(mode==='zero'?4:0):clamp(finite(initialZero),-6,6)")
s=s.replace("ring.visible=mode==='compare'", "ring.visible=mode==='inquiry'||mode==='compare'")
SHAPES="""
 const inquiryBall=mesh(new THREE.SphereGeometry(.31,32,24),mat({color:'#d2ad63',roughness:.94}),weight);inquiryBall.position.y=-.25;inquiryBall.visible=false;
 const inquiryBook=new THREE.Group();weight.add(inquiryBook);inquiryBook.visible=false;
 box(.64,.49,.23,mat({color:'#efe6d1',roughness:.95}),0,-.22,0,inquiryBook);
 const cover=mat({color:'#b8614c',roughness:.7});box(.69,.54,.027,cover,0,-.22,.135,inquiryBook);box(.69,.54,.027,cover,0,-.22,-.135,inquiryBook);box(.028,.54,.30,cover,-.34,-.22,0,inquiryBook);
 const inquiryPouch=new THREE.Group();weight.add(inquiryPouch);inquiryPouch.visible=false;
 const pouchMaterial=mat({color:'#37848b',roughness:.9});box(.68,.38,.28,pouchMaterial,0,-.22,0,inquiryPouch);box(.62,.02,.03,copper,0,-.02,.06,inquiryPouch);
 const patchCanvas=document.createElement('canvas');patchCanvas.width=128;patchCanvas.height=128;const patchTexture=new THREE.CanvasTexture(patchCanvas);textures.add(patchTexture);
 const patchMat=new THREE.MeshBasicMaterial({map:patchTexture});materials.add(patchMat);const patch=mesh(new THREE.PlaneGeometry(.17,.17),patchMat,inquiryPouch);patch.position.set(0,-.23,.146);
 function dressLoad(shape){inquiryBall.visible=false;inquiryBook.visible=false;inquiryPouch.visible=false;weightBody.visible=shape!=='case';secondary.visible=shape==='case';weightBody.material=shape==='ball'?orange:copper;
  if(shape==='foam'||shape==='book'||shape?.startsWith('pouch-')){weightBody.visible=false;secondary.visible=false;inquiryBall.visible=shape==='foam';inquiryBook.visible=shape==='book';inquiryPouch.visible=shape.startsWith('pouch-');
   if(inquiryPouch.visible){const id=shape.slice(-1).toUpperCase();pouchMaterial.color.set({A:'#37848b',B:'#567ea3',C:'#92779e'}[id]);const c=patchCanvas.getContext('2d');c.fillStyle='#f1e9d8';c.fillRect(0,0,128,128);c.font='bold 90px sans-serif';c.textAlign='center';c.fillStyle='#25485c';c.fillText(id,64,98);patchTexture.needsUpdate=true;}}
 }
"""
s=s.replace(' // Helical tube buffer:',SHAPES+' // Helical tube buffer:')
newlines={
' function setEye(' : " function setEye(which){eye=which;const py=y0-(force+zero)*pitch;const p=new THREE.Vector3(.59,py,.38);const delta=which==='high'?1.35:which==='low'?-1.35:0;animateCamera(new THREE.Vector3(.59,py+delta,mode==='inquiry'?12.4:3.2),new THREE.Vector3(.59,mode==='inquiry'?-.15:py,.05),800);}",
' function setForce(' : " function setForce(v,{instant=false,shape}={}){v=finite(v);if(v<0||v>30)return false;force=v;motion.set(v,instant);if(shape)dressLoad(shape);version++;if(mode==='inquiry'&&eye==='front')setEye('front');return true;}",
' function setZero(' : " function setZero(v){if(force!==0&&mode!=='inquiry')return false;zero=clamp(finite(v),-6,6);knob.rotation.z=zero*.35;version++;onAdjustZero({zero,force});if(mode==='inquiry'&&eye==='front')setEye('front');return true;}",
' function down(' : " function down(e){if(disposed||tween)return;if(mode==='zero'||mode==='inquiry'){const hit=intersect(e,[knob]);if(hit){drag={kind:'zero',id:e.pointerId,startX:e.clientX,zero};canvas.setPointerCapture(e.pointerId);controls.enabled=false;e.preventDefault();}else if(mode==='inquiry'){const tick=intersect(e,[scaleHit]);if(tick){const value=Math.round((y0-tick.point.y)/pitch);if(value>=0&&value<=30)onPick(value,state());}}}else if(['target','elastic','compression'].includes(mode)){",
' function up(' : " function up(e){if(!drag||drag.id!==e.pointerId)return;if(drag.kind==='zero'){drag=null;controls.enabled=mode!=='inquiry';return;}onRelease(force);drag=null;controls.enabled=mode!=='eye'&&mode!=='inquiry';setForce(0);}",
' function state(' : " function state(){return {force,zero,value:motion.value,reading:force+zero,settled:motion.settled,eye,mode,viewMoving:!!tween,viewAligned:Math.abs(apparentReading({force,zero,cameraY:camera.position.y,cameraZ:camera.position.z}).value-(force+zero))<.25,apparentNow:apparentReading({force:motion.value,zero,cameraY:camera.position.y,cameraZ:camera.position.z}).value,extension:force*.3,totalLength:5+force*.3,expectedEye:apparentReading({force,zero,cameraY:camera.position.y,cameraZ:camera.position.z}).value};}"
}
lines=s.splitlines()
for prefix,line in newlines.items():
 positions=[i for i,l in enumerate(lines) if l.startswith(prefix)];assert len(positions)==1,prefix;lines[positions[0]]=line
s='\n'.join(lines)+'\n';s=s.replace("if(mode==='eye')setEye('front');","if(mode==='eye'||mode==='inquiry')setEye('front');").replace("controls.enabled=mode!=='eye';","controls.enabled=mode!=='eye'&&mode!=='inquiry';");p.write_text(s)
meta=json.loads(subprocess.check_output(['node','--experimental-default-type=module','--input-type=module','-e',"import {pages} from './sample-v2/content.js';console.log(JSON.stringify(pages.map(p=>({id:p.id,action:p.action}))))"]))
assert len(meta)==20
labels={'inquiry':'예상·측정 실험','parts':'부품 확대 실험','zero':'저울 조작 실험','eye':'눈높이 실험','types':'저울 선택 활동','history':'과학 이야기','watch':'기록영상 보기','future':'미래 이야기','assessment':'문제 크게 보기','elastic':'탄성 실험','compression':'압축 실험','measure':'추 측정 실험','graph':'그래프 활동','tools':'도구 관찰','assessment-graph':'평가 그래프'}
manifest={};qrdir=root/'qr';qrdir.mkdir(exist_ok=True)
for p in meta:
 url='https://docssam1.github.io/msg-science-lab/sample-v2/?p='+p['id']+'&lab='+p['action']
 for mask in range(8):
  qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=10,border=4,mask_pattern=mask);qr.add_data(url);qr.make(fit=True);image=qr.make_image(fill_color='black',back_color='white').convert('RGB');a=np.array(image)
  if all(cv2.QRCodeDetector().detectAndDecode(x)[0]==url for x in [a,cv2.resize(a,(200,200))]):break
 else:raise ValueError('Undecodable QR '+p['id'])
 image.save(qrdir/(p['id']+'.png'));manifest[p['id']]={'url':url,'label':labels.get(p['action'],'교재 활동 열기')}
(root/'qr-links.js').write_text('export const qrLinks = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n');(qrdir/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
p=Path('tests/two-lesson/unit-tests.mjs');t=p.read_text().replace('pages.length,18','pages.length,20');p.write_text(t)
p=Path('tests/two-lesson/browser.py');t=p.read_text().replace("pages.length')==18", "pages.length')==20").replace('18 pages and 18 original questions','20 pages and 18 original questions').replace('at all 18 URLs','at all 20 URLs').replace('len(clips)==18','len(clips)==20').replace("[(8,'1a',3),(9,'1b',3),(15,'2a',4),(16,'2b',7)]","[(10,'1a',3),(11,'1b',3),(17,'2a',4),(18,'2b',7)]").replace('len(gaps)==18','len(gaps)==20').replace("'pages':18","'pages':20");p.write_text(t)
p=root/'README.md';t=p.read_text().replace('18쪽으로 재편집, 원본 평가','원본 재편집 18쪽 + 추가 도입 2쪽 = 총 20쪽, 원본 평가').replace('18개 장면 도입 해설은','20개 장면 도입 해설(기존 18개 + 추가 2개)은');t+='\n\n## QR와 도입 탐구\n각 지면의 QR은 대응 활동을 엽니다. 서로 다른 두 물건과 비슷한 세 물건을 먼저 예상한 뒤 측정합니다. 원인을 선제 공개하지 않고 제출 후 실험 방법을 점검합니다. 처음 예상과 관찰값, 바꾼 방법, 재측정 기록을 보존합니다.\n';p.write_text(t)
print('Integrated 2 inquiry pages, 20 local QR codes, blind method audit and stable page routes')
