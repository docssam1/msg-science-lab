#!/usr/bin/env python3
"""Generate an auditable voice manifest from the deployed source. No student answers or raw reference audio is exported."""
from pathlib import Path
import subprocess,json,re,hashlib
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
js="import {pages,narration,toolRows} from './sample-v2/content.js'; console.log(JSON.stringify({pages,narration,toolRows}));"
data=json.loads(subprocess.check_output(['node','--experimental-default-type=module','--input-type=module','-e',js],cwd=ROOT))
old=json.loads((ROOT/'sample-v2/audio/narration-manifest.json').read_text())
clips=[];playlists={};lookup={}
def normalize_key(t):return re.sub(r'\s+',' ',t).strip()
def add(id,text,mood='explain',kind='fixed'):
 text=normalize_key(text)
 clips.append({'id':id,'text':text,'mood':mood,'kind':kind});lookup[text]=id
 return id
# The two missing scene intros: exact current five-object narration, not old pouch narration.
for p in data['pages']:
 if p['id'] not in old:add(p['id'],data['narration'][p['id']]['text'],'think','intro')
# Read all visible learner text, preserving the source wording; omit answers and controls.
# Short clips have exact corresponding displayed segments, with no automatic answer reveal.
for p in data['pages']:
 soup=BeautifulSoup(p['body'],'html.parser')
 for x in soup.select('svg,button,.teacher-answer,input,select,script,style'):x.decompose()
 text=normalize_key(p['title']+'. '+p['lead']+'. '+soup.get_text(' ',strip=True))
 text=text.replace('..','.')
 sentences=re.split(r'(?<=[.!?。])\s+',text)
 segments=[];cur=''
 for s in sentences:
  # Preserve all text; split long sentences only at word boundaries.
  while len(s)>220:
   cut=s.rfind(' ',0,210)
   if cut<90:cut=210
   if cur:segments.append(cur);cur=''
   segments.append(s[:cut].strip());s=s[cut:].strip()
  if len(cur)+len(s)>220:
   if cur:segments.append(cur)
   cur=s
  else:cur=(cur+' '+s).strip()
 if cur:segments.append(cur)
 ids=[add('read-'+p['id']+'-'+str(i+1).zfill(2),s,'explain','reading') for i,s in enumerate(segments)]
 playlists['full:'+p['id']]={'text':text,'clips':ids,'source_id':p['id']}
# Extract phrases already spoken by the existing activities, not invented substitutes.
a=(ROOT/'sample-v2/activities.js').read_text()
parts=re.search(r'const partList=(\[.*?\]);',a).group(1)
parts=json.loads(parts.replace("'",'"'))
for key,name,desc in parts:
 add('part-'+key,name+'. '+desc)
 add('ask-part-'+key,'확대된 부분은 어떤 일을 할까요? 모양과 위치를 보고 이름을 골라 보세요.','think')
# The three exact end-of-video questions.
for i,t in enumerate(re.findall(r"\?'([^']+)'",a[a.index('video.onended'):a.index('video.onerror')])):add('video-followup-'+str(i+1),t,'think')
# The final ternary branch is not preceded by ?.
chunk=a[a.index('video.onended'):a.index('video.onerror')]
for t in re.findall(r":'([^']+)'",chunk):
 if '추가 위아래로' in t:add('video-followup-3',t,'think')
# Six story captions, copied from current story data in activities.js.
for i,t in enumerate(re.findall(r"'([^']{30,})',(?:toolIcon|springArt)",a)):
 add('story-'+str(i+1),t)
for key,title,text in data['toolRows']:add('tool-'+key,text)
add('method-error','실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?','encourage')
add('predict-first','다섯 물건을 가벼울 것 같은 순서로 놓고, 그렇게 예상한 까닭을 적어 보세요.','think')
add('measurement-recorded','측정값을 기록했어요. 다른 물건도 같은 방법으로 확인해 보세요.','praise')
add('measurement-complete','다섯 물건을 모두 확인했어요. 처음 예상과 측정한 순서를 비교해 볼까요?','praise')
add('retry-ready','다시 살펴볼 과정을 적었군요. 직접 방법을 고쳐 다시 측정해 보세요.','encourage')
add('question-review','답을 기록했어요. 이유를 설명하고 관련 실험으로 다시 확인해 봅시다.','listen')
add('question-correct','잘 확인했어요. 어떤 근거로 답했는지 내 말로 설명해 볼까요?','praise')
add('question-retry','다시 살펴볼 부분이 있어요. 문제의 조건과 관찰한 결과를 비교해 보세요.','encourage')
# Remove accidental repeated IDs while retaining aliases for exact-string lookup.
seen={}
for c in clips:
 if c['id'] in seen:assert seen[c['id']]==c
 seen[c['id']]=c
clips=list(seen.values())
# Deterministic, balanced workload; preserve source order within each worker.
loads=[0]*8
for c in sorted(clips,key=lambda x:len(x['text']),reverse=True):
 c['shard']=min(range(8),key=lambda k:loads[k]);loads[c['shard']]+=len(c['text'])
 c['text_sha256']=hashlib.sha256(c['text'].encode()).hexdigest()
out={'version':'urusaem-voice-v3','source_commit':'a83106993b75dad04634954b0c82abd7cf147bc3','clips':clips,'playlists':playlists,'lookup':lookup,'existing_count':len(old),'shard_loads':loads}
p=ROOT/'scripts/urusaem-voice-plan.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('CLIPS',len(clips),'characters',sum(loads),'workers',loads)
