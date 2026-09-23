from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,traceback,urllib.parse
OUT=Path(os.environ.get('QA_OUT','/tmp/inquiry-qa'));OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('QA_BASE','http://127.0.0.1:8765/sample-v2/')
report={'errors':[],'checks':[],'layouts':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':1366,'height':768});page.set_default_timeout(15000)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  page.goto(BASE+'?p=l1-intro&lab=inquiry',wait_until='networkidle');page.wait_for_selector('[data-pair]')
  assert page.evaluate('window.__sample.current')==0
  assert page.locator('#activity-content').inner_text().find('영점')<0
  assert page.locator('#activity-content').inner_text().find('0에')<0
  page.wait_for_timeout(750)
  rect=page.locator('[data-pair-next]').bounding_box();frame=page.locator('#activity-content').bounding_box();assert rect['y']+rect['height']<=frame['y']+frame['height']+1,rect
  page.screenshot(path=str(OUT/'pair-desktop.png'))
  page.locator('[data-pair="foam"]').click();page.locator('[data-why]').fill('공이 더 커 보여서 먼저 그렇게 예상했습니다.')
  page.locator('[data-pair-next]').click();page.wait_for_selector('[data-rank-id]')
  h=page.locator('[data-drag-id="A"]').bounding_box();end=page.locator('[data-drag-id="B"]').bounding_box()
  page.mouse.move(h['x']+h['width']/2,h['y']+h['height']/2);page.mouse.down();page.mouse.move(end['x']+end['width']/2,end['y']+end['height']/2,steps=15);page.mouse.up()
  assert page.evaluate('window.__sample.load("inquiry-ranking-v1").prediction')==['C','B','A']
  page.locator('[data-move="C"][data-dir="1"]').click()
  page.locator('[data-rank-why]').fill('겉모양이 비슷해 순서를 확신하기 어렵습니다. 직접 재 보고 싶습니다.')
  prediction=page.evaluate('window.__sample.load("inquiry-ranking-v1").prediction')
  rect=page.locator('[data-rank-next]').bounding_box();frame=page.locator('#activity-content').bounding_box();assert rect['y']+rect['height']<=frame['y']+frame['height']+1,rect
  page.screenshot(path=str(OUT/'ranking-desktop.png'))
  page.locator('[data-rank-next]').click();page.wait_for_function('window.__lab?.state().mode==="inquiry"')
  assert page.locator('[data-record]').is_enabled()
  assert '영점' not in page.locator('.inquiry-controls').inner_text()
  assert '0에 맞' not in page.locator('.inquiry-controls').inner_text()
  assert page.evaluate('window.__lab.state().zero')==2
  force={'foam':4,'book':20,'A':12,'B':10,'C':14}
  for id,val in force.items():
   page.locator(f'[data-inquiry-load="{id}"]').click()
   page.wait_for_function('window.__lab.state().settled && !window.__lab.state().viewMoving')
   st=page.evaluate('window.__lab.state()');assert st['viewAligned'],st
   page.locator('[data-observation]').fill(str(val+2));page.locator('[data-record]').click()
   assert '영점' not in page.locator('#activity-status').inner_text()
  saved=page.evaluate('window.__sample.load("inquiry-ranking-v1")')
  assert saved['pair']=='foam' and saved['lockedPrediction']==prediction and len(saved['records'])==5
  page.locator('[data-inspect]').click()
  assert '실험 방법' in page.locator('#activity-status').inner_text()
  assert '영점' not in page.locator('[data-review]').inner_text()
  assert '0에' not in page.locator('[data-review]').inner_text()
  assert page.locator('[data-records]').inner_text().find('22')>=0
  page.screenshot(path=str(OUT/'method-check.png'))
  page.locator('[data-method]').fill('준비 상태와 관찰 위치를 점검하고, 같은 절차로 다시 측정하겠습니다.')
  page.locator('[data-retest]').click();page.wait_for_function('window.__lab?.state().mode==="inquiry"')
  assert page.evaluate('window.__lab.state().zero')==2
  page.locator('[data-adjust="-1"]').click();page.locator('[data-adjust="-1"]').click()
  assert page.evaluate('window.__lab.state().zero')==0
  for id,val in force.items():
   page.locator(f'[data-inquiry-load="{id}"]').click();page.wait_for_function('window.__lab.state().settled && !window.__lab.state().viewMoving')
   if id=='A':
    xy=page.evaluate('window.__lab.tickScreen(12)');page.mouse.click(xy['x'],xy['y'])
    assert page.locator('[data-observation]').input_value()=='12'
   else:page.locator('[data-observation]').fill(str(val))
   page.locator('[data-record]').click()
  page.locator('[data-inspect]').click()
  assert 'B → A → C' in page.locator('[data-review]').inner_text()
  assert page.locator('[data-records] table').count()==2
  page.locator('[data-conclusion]').fill('느낌으로는 순서를 확신하기 어려웠지만, 같은 방법으로 잰 값을 비교하니 근거를 들어 순서를 설명할 수 있었습니다.')
  page.locator('[data-finish]').click();saved=page.evaluate('window.__sample.load("inquiry-ranking-v1")')
  assert saved['finished'] and len(saved['records'])==10 and len(saved['roundNotes'])==1
  page.screenshot(path=str(OUT/'comparison-complete.png'))
  page.reload(wait_until='networkidle');page.wait_for_function('window.__lab')
  assert page.evaluate('window.__sample.load("inquiry-ranking-v1").records.length')==10
  report['checks'].append('Pair prediction, pointer + button ranking, hidden 2N offset, unchanged observations, neutral method audit, learner repair, retained 2 rounds, evidence conclusion, reload persistence')
  links=page.evaluate('async()=>fetch("./qr/manifest.json").then(r=>r.json())')
  for id,v in links.items():
   query=urllib.parse.urlsplit(v['url']).query
   page.goto(BASE+'?'+query,wait_until='domcontentloaded');page.wait_for_function('window.__sample && document.documentElement.dataset.ready==="true"');page.wait_for_selector('#activity-content > *')
   assert page.evaluate('window.__sample.pages[window.__sample.current].id')==id
   assert page.locator('#workspace').evaluate('(e)=>e.classList.contains("active")')
   assert page.locator('#activity-content').inner_text().find('활동을 열지 못했습니다')<0
  report['checks'].append('20 stable QR deep links route to correct page and open activity')
  page.goto(BASE+'?p=l1-intro',wait_until='networkidle');page.wait_for_function('window.__sample')
  assert page.evaluate('window.__sample.pages.length')==20
  assert page.evaluate('window.__sample.questions.length')==18
  clips=page.evaluate('''async()=>{let m=await fetch('./audio/narration-manifest.json').then(r=>r.json());return Promise.all(Object.entries(m).map(async([id,v])=>{const a=new Audio(v.path);return await new Promise((res,rej)=>{a.onloadedmetadata=()=>res({id,duration:a.duration});a.onerror=()=>rej(new Error(id));a.load();});}));}''')
  assert len(clips)==20 and all(x['duration']>2 for x in clips)
  report['audio']=clips
  for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
   page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(600)
   d=page.evaluate('''()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,book:document.querySelector('#book-transform').getBoundingClientRect().toJSON(),foot:document.querySelector('.transport').getBoundingClientRect().toJSON()})''')
   assert d['sw']<=w+1 and d['sh']<=h+1 and d['book']['bottom']<=d['foot']['top']+1
   report['layouts'].append(d);page.screenshot(path=str(OUT/f'book-{w}.png'))
  mobile=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  m=mobile.new_page();m.goto(BASE+'?p=l1-intro&lab=inquiry',wait_until='networkidle');m.locator('[data-pair="book"]').tap();m.locator('[data-why]').fill('책을 들어 보았을 때 더 무거울 것 같습니다.');m.locator('[data-pair-next]').tap();m.locator('[data-move="A"][data-dir="1"]').tap();m.locator('[data-rank-why]').fill('비슷해서 재 봐야 알 것 같습니다.');m.screenshot(path=str(OUT/'ranking-mobile.png'));m.locator('[data-rank-next]').tap();m.wait_for_function('window.__lab');m.locator('[data-inquiry-load="foam"]').tap();m.wait_for_function('window.__lab.state().settled&&!window.__lab.state().viewMoving');m.screenshot(path=str(OUT/'measurement-mobile.png'));assert m.evaluate('document.documentElement.scrollWidth')==390;mobile.close()
  page.set_viewport_size({'width':1366,'height':768});page.evaluate('window.__sample.close()')
  for teacher in [False,True]:
   page.emulate_media(media='screen')
   on=page.locator('body').evaluate('(e)=>e.classList.contains("teacher-mode")')
   if on!=teacher:page.locator('#teacher').click()
   page.evaluate('window.__sample.printBuild()');page.emulate_media(media='print');page.wait_for_timeout(300)
   metrics=page.evaluate('''()=>[...document.querySelectorAll('#print-root .paper')].map(p=>{let f=p.querySelector('.page-foot').getBoundingClientRect(),body=p.querySelector('.page-body').getBoundingClientRect(),q=p.querySelector('.page-qr').getBoundingClientRect(),h=p.querySelector('h1').getBoundingClientRect();return{id:p.dataset.pageId,gap:f.top-body.bottom,qrTitleOverlap:q.left<h.right&&q.right>h.left&&q.top<h.bottom&&q.bottom>h.top};})''')
   report['printTeacher' if teacher else 'printStudent']=metrics
   assert len(metrics)==20 and min(x['gap'] for x in metrics)>7,metrics
   assert not any(x['qrTitleOverlap'] for x in metrics)
   assert page.locator('#print-root .page-qr img').count()==20
   for idx in [0,1,2,10,18,19]:page.locator('#print-root .paper').nth(idx).screenshot(path=str(OUT/f'print-{teacher}-{idx}.png'))
   page.pdf(path=str(OUT/('teacher.pdf' if teacher else 'student.pdf')),print_background=True,prefer_css_page_size=True)
  assert not report['errors']
 except Exception:
  report['errors'].append(traceback.format_exc());page.emulate_media(media='screen');page.screenshot(path=str(OUT/'failure.png'))
 finally:
  (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
print(json.dumps(report,ensure_ascii=False,indent=2))
if report['errors']:raise SystemExit(1)
