#!/usr/bin/env python3
"""Offline OmniVoice generation, no browser-TTS substitution and no reference audio in artifacts."""
import os,json,re,time,subprocess,hashlib,inspect
from pathlib import Path
import numpy as np
import torch,soundfile as sf,imageio_ffmpeg
from omnivoice import OmniVoice
ROOT=Path(__file__).resolve().parents[1]
plan=json.loads((ROOT/'scripts/urusaem-voice-plan.json').read_text());shard=int(os.environ.get('SHARD','0'))
out=Path('/tmp/urusaem-voice')/str(shard);out.mkdir(parents=True,exist_ok=True)
ff=imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ff,'-y','-i','/tmp/reference.mp4','-vn','-ar','24000','-ac','1','/tmp/reference.wav'],check=True,capture_output=True)
torch.set_num_threads(4)
model=OmniVoice.from_pretrained('k2-fsa/OmniVoice',device_map='cpu',dtype=torch.float32)
clone_prompt=None
if hasattr(model,'create_voice_clone_prompt'):
 clone_prompt=model.create_voice_clone_prompt(ref_audio='/tmp/reference.wav')
# Normalization changes pronunciation only. Exact source text stays in each manifest entry.
D='영일이삼사오육칠팔구'
def number(s):
 if '.' in s:
  a,b=s.split('.',1);return number(a)+' 점 '+''.join(D[int(x)] for x in b)
 v=int(s)
 if not v:return '영'
 if v>9999:return ' '.join(D[int(x)] for x in s)
 r=''
 for base,u in [(1000,'천'),(100,'백'),(10,'십'),(1,'')]:
  q,v=divmod(v,base)
  if q:r+=(D[q] if q>1 or base==1 else '')+u
 return r

def spoken(t):
 replacements={'HOW A WATCH WORKS':'시계는 어떻게 움직일까요','SPEED QUESTION':'빠른 확인 질문','THINK & EXPLAIN':'생각하고 설명하기','Minuscule Coils':'극소 코일','Carbon Crystalline Allotrope':'탄소 결정 동소체','龍鬚鐵':'용수철','龍鬚':'용수','龍':'용','鬚':'수','鐵':'철','N(뉴턴)':'뉴턴','4D':'사차원','2D':'이차원','MIT':'엠 아이 티','Taqi al-Din':'타키 앗딘','al-Din':'앗딘','de Caus':'드 코스','Massachusetts':'매사추세츠'}
 for a,b in replacements.items():t=t.replace(a,b)
 t=re.sub(r'\bN\b',' 뉴턴 ',t);t=re.sub(r'\bcm\b',' 센티미터 ',t);t=re.sub(r'\bg\b',' 그램 ',t)
 t=re.sub(r'(\d)cm',r'\1 센티미터',t);t=re.sub(r'(\d)g',r'\1 그램',t);t=re.sub(r'(\d)N',r'\1 뉴턴',t)
 t=re.sub(r'(?<=\d)[–~](?=\d)',' 에서 ',t)
 for a,b in [('→',' 다음 '),('①','첫째. '),('②','둘째. '),('③','셋째. '),('④','넷째. '),('⑤','다섯째. '),('⑥','여섯째. '),('○표','동그라미 표시'),('□',''),('（','('),('）',')'),('·',', '),('%',' 퍼센트'),('㉠','기역 '),('㉡','니은 ')]:t=t.replace(a,b)
 t=re.sub(r'\d+(?:\.\d+)?',lambda m:number(m[0]),t)
 t=re.sub(r'\(\s*\)',' 빈칸 ',t)
 return re.sub(r'\s+',' ',t).strip()
results={}
selected=[c for c in plan['clips'] if c['shard']==shard]
for c in selected:
 t=time.time();s=spoken(c['text']);id=c['id']
 try:
  torch.manual_seed(int(c['text_sha256'][:8],16)%2147483647)
  kwargs={'voice_clone_prompt':clone_prompt} if clone_prompt is not None else {'ref_audio':'/tmp/reference.wav'}
  with torch.inference_mode():y=model.generate(text=s,num_step=16,**kwargs)[0]
  if hasattr(y,'detach'):y=y.detach().cpu().numpy()
  y=np.asarray(y,dtype=np.float32).squeeze()
  assert y.ndim==1 and np.isfinite(y).all() and len(y)>2400,'Invalid samples'
  assert float(np.sqrt(np.mean(y*y)))>.001,'Silent output'
  wav=out/(id+'.wav');mp3=out/(id+'.mp3');sf.write(wav,y,24000)
  subprocess.run([ff,'-y','-i',str(wav),'-af','loudnorm=I=-18:TP=-2:LRA=9','-ar','24000','-codec:a','libmp3lame','-b:a','96k',str(mp3)],check=True,capture_output=True)
  wav.unlink()
  results[id]={**{k:v for k,v in c.items() if k!='shard'},'spoken_text':s,'path':'./audio/'+id+'.mp3','seconds':round(len(y)/24000,3),'engine':'OmniVoice 0.2.1','num_step':16,'sha256':hashlib.sha256(mp3.read_bytes()).hexdigest(),'generation_seconds':round(time.time()-t,1)}
  print(id,'ok',results[id]['seconds'],'sec',round(time.time()-t),flush=True)
 except Exception as e:
  results[id]={**c,'error':repr(e)};print(id,'FAILED',repr(e),flush=True)
 (out/'manifest.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
assert all('error' not in x for x in results.values()),'One or more generation failures'
assert len(results)==len(selected)
