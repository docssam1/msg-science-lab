from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,traceback
OUT=Path(os.environ.get('QA_OUT','/tmp/qa-final'));OUT.mkdir(exist_ok=True,parents=True)
BASE=os.environ.get('QA_BASE','http://127.0.0.1:8765/sample-v2/')
report={'errors':[],'checks':[],'layouts':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':1366,'height':768})
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  page.add_init_script('const RealAudio=window.Audio;window.Audio=class extends RealAudio{constructor(...args){super(...args);window.__lastAudio=this;}};')
  page.goto(BASE,wait_until='networkidle');page.wait_for_function('window.__sample')
  assert page.evaluate('window.__sample.pages.length')==20
  assert page.evaluate('window.__sample.questions.length')==18
  report['checks'].append('20 pages and 18 original questions')
  # The narration is real audio, independently decodable at all 20 URLs.
  clips=page.evaluate('''async()=>{const m=await fetch('./audio/narration-manifest.json').then(r=>r.json());return Promise.all(Object.entries(m).map(async([id,v])=>{const a=new Audio(v.path);const d=await new Promise((res,rej)=>{a.onloadedmetadata=()=>res(a.duration);a.onerror=()=>rej(new Error(id));a.load()});return {id,duration:d};}));}''')
  assert len(clips)==20 and all(2<x['duration']<60 for x in clips)
  report['narration']=clips
  # Actual start plays a genuine clip and transitions after audio ends (seek near end).
  page.locator('#start').click();page.wait_for_timeout(1500)
  assert 'OmniVoice' in page.locator('#voice-kind').inner_text()
  page.evaluate('window.__lastAudio.currentTime=window.__lastAudio.duration-0.2')
  page.wait_for_function('document.querySelector("#workspace").classList.contains("active")')
  report['checks'].append('Genuine OmniVoice ended event opens the linked activity')
  page.evaluate('window.__sample.navigate(2)')
  assert not page.locator('body').evaluate('(e)=>e.classList.contains("talking")')
  # Physical controls and original comparison invariants.
  for kind in ['compare','parts','zero','target','eye','measure','elastic','compression']:
   page.evaluate('(k)=>window.__sample.open(k)',kind);page.wait_for_function('window.__lab');page.wait_for_timeout(1300)
   if kind in ['compare','measure']:page.evaluate('window.__lab.setForce(20)');page.wait_for_timeout(2800)
   state=page.evaluate('window.__lab.state()');assert state['mode']==kind
   if kind=='parts':
    page.locator('[data-part-answer]').first.click() if page.locator('[data-part-answer]').count() else None
   if kind=='zero':
    pt=page.evaluate('window.__lab.knobScreen()');page.mouse.move(pt['x'],pt['y']);page.mouse.down();page.mouse.move(pt['x']-72,pt['y'],steps=15);page.mouse.up();page.wait_for_timeout(200)
    assert page.evaluate('window.__lab.state().zero')==0
    assert page.locator('[data-zero]').input_value()=='0'
   if kind=='target':
    h=page.evaluate('window.__lab.hookScreen()');page.mouse.move(h['x'],h['y']);page.mouse.down();page.mouse.move(h['x'],h['y']+60,steps=15)
    assert page.evaluate('window.__lab.state().force')>5
    page.mouse.up();page.wait_for_timeout(2000)
    assert page.evaluate('window.__lab.state().force')==0
   if kind=='eye':
    seen=[]
    for view in ['high','front','low']:
     page.evaluate('(v)=>window.__lab.setEye(v)',view);page.wait_for_timeout(1000)
     st=page.evaluate('window.__lab.state()');assert st['force']==20;seen.append(st['expectedEye'])
     xy=page.evaluate('()=>window.__lab.tickScreen(Math.round(window.__lab.state().expectedEye))');page.mouse.click(xy['x'],xy['y']);assert '선택한 눈금' in page.locator('#activity-status').inner_text()
    assert seen[0]>20 and abs(seen[1]-20)<.00001 and seen[2]<20
    report['parallax']=seen
   page.screenshot(path=str(OUT/(kind+'.png')));report['checks'].append({'activity':kind,'state':state})
   page.evaluate('window.__sample.close()')
  # Original question UI: all 17 text/choice answers, with duplicated print/read contexts.
  for idx,group,total in [(10,'1a',3),(11,'1b',3),(17,'2a',4),(18,'2b',7)]:
   page.evaluate('(i)=>window.__sample.navigate(i)',idx);page.locator('#focus-reading').click()
   qids=page.locator('#activity [data-qid]').evaluate_all('(els)=>els.map(e=>e.dataset.qid)')
   # Use each rendered field; write the corresponding source answer without filling hidden print controls.
   fs=page.locator('#activity [data-answer-field]').evaluate_all('(els)=>[...new Set(els.map(e=>e.name))]')
   qmap=page.evaluate('Object.fromEntries(window.__sample.questions.map(q=>[q.id,q.answer]))')
   for name in fs:
    parts=name.split('-');ans=qmap[parts[0]]
    if len(parts)>1:ans=ans[int(parts[1])]
    field=page.locator(f'#activity [data-answer-field][name="{name}"]')
    if field.first.get_attribute('type')=='radio':page.locator(f'#activity input[name="{name}"][value="{ans}"]').check()
    elif field.first.evaluate('(e)=>e.tagName')=='SELECT':field.first.select_option(str(ans))
    else:field.first.fill(str(ans))
   page.locator(f'#activity [data-grade="{group}"]').click();page.wait_for_timeout(200)
   assert f'{total} / {total}' in page.locator('#activity h3').inner_text()
  report['checks'].append('17 original text/choice questions graded through UI')
  # Two graphs retain independent data; no borrowing 3/6/9 for 4/8/12.
  for kind,pairs in [('graph',[(10,3),(20,6),(30,9)]),('assessment-graph',[(10,4),(20,8),(30,12)])]:
   page.evaluate('(k)=>window.__sample.open(k)',kind);page.wait_for_timeout(150)
   for x,y in pairs:
    page.locator('[data-x]').fill(str(x));page.locator('[data-y]').fill(str(y));page.locator('[data-add]').click()
   page.locator('[data-check]').click();assert '세 점이 모두' in page.locator('#activity-status').inner_text()
  assert page.evaluate('window.__sample.results.b12.correct') is True
  assert page.evaluate('window.__sample.load("graph-lesson",[])')==[[10,3],[20,6],[30,9]]
  report['checks'].append('graph assessment and original-data isolation')
  # Media local files with real decoded dimensions and no ad frames.
  for kind in ['watch','balance','spring-film']:
   page.evaluate('(k)=>window.__sample.open(k)',kind)
   page.wait_for_function('document.querySelector("#activity video")?.readyState>=1')
   page.locator('[data-video-play]').click();page.wait_for_function('document.querySelector("#activity video").currentTime>0.05')
   meta=page.locator('#activity video').evaluate('(v)=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted})')
   assert meta['duration']>10 and meta['muted'] and meta['width']>300
   report['checks'].append({'media':kind,**meta});page.screenshot(path=str(OUT/(kind+'.png')))
  page.evaluate('window.__sample.close();window.__sample.navigate(0)')
  # Whiteboard and input-mode separation.
  page.locator('#pen').click();page.mouse.move(230,230);page.mouse.down();page.mouse.move(370,270,steps=10);page.mouse.up()
  assert page.locator('#ink-layer polyline').count()==1
  page.locator('#ink-undo').click();assert page.locator('#ink-layer polyline').count()==0
  page.locator('#pen').click();assert not page.locator('#ink-layer').evaluate('(e)=>e.classList.contains("writing")')
  # All viewport boundaries. Large book is fit by height as well as width.
  for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
   page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(500)
   d=page.evaluate('''()=>({w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,foot:document.querySelector('.transport').getBoundingClientRect().toJSON(),book:document.querySelector('#book-transform').getBoundingClientRect().toJSON()})''')
   assert d['scrollW']<=w+1 and d['scrollH']<=h+1
   assert d['foot']['bottom']<=h+1 and d['book']['bottom']<=d['foot']['top']
   report['layouts'].append(d);page.screenshot(path=str(OUT/f'book-{w}.png'))
  page.set_viewport_size({'width':1366,'height':768});page.locator('#character').click();assert page.locator('body').evaluate('(e)=>e.classList.contains("hide-character")')
  # Print each source-based page, verify content stays clear of footer. Make release PDFs on this renderer too.
  for teacher in [False,True]:
   if teacher:page.emulate_media(media='screen');page.locator('#teacher').click()
   page.emulate_media(media='print')
   gaps=page.evaluate('''()=>[...document.querySelectorAll('#print-root .paper')].map(p=>p.querySelector('.page-foot').getBoundingClientRect().top-p.querySelector('.page-body').getBoundingClientRect().bottom)''')
   assert len(gaps)==20 and min(gaps)>8
   page.pdf(path=str(OUT/('teacher.pdf' if teacher else 'student.pdf')),print_background=True,prefer_css_page_size=True)
   report['checks'].append({'printTeacher':teacher,'minimumFooterGapPx':min(gaps),'pages':20})
  assert not report['errors']
 except Exception:
  report['errors'].append(traceback.format_exc());page.emulate_media(media='screen');page.screenshot(path=str(OUT/'failure.png'))
 finally:
  (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
print(json.dumps(report,ensure_ascii=False,indent=2))
if report['errors']:raise SystemExit(1)
