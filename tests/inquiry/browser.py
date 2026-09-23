from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json,traceback
out=Path(os.environ.get('INQUIRY_OUT','/tmp/inquiry-qa'));out.mkdir(parents=True,exist_ok=True)
base=os.environ.get('QA_BASE','http://127.0.0.1:8765/sample-v2/')
report={'errors':[],'checks':[],'print':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':1366,'height':768})
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  page.goto(base+'?s=l1-inquiry&lab=1',wait_until='networkidle');page.wait_for_selector('[data-prediction-done]')
  assert page.locator('#activity-title').inner_text().startswith('저울이 왜')
  assert '영점' not in page.locator('#activity-content').inner_text()
  assert not page.locator('[data-inquiry-record]').count()
  # Deliberately wrong prediction must not be classified as method error.
  page.locator('[data-pair="box"]').click()
  page.locator('[data-prediction-reason]').fill('크기가 커서 큰 상자가 더 무거울 것 같아요.')
  page.locator('[data-later="a"]').click()
  page.locator('[data-earlier="a"]').click()
  assert page.locator('[data-order-id]').evaluate_all('(els)=>els.map(e=>e.dataset.orderId)')==['a','b','c']
  page.screenshot(path=str(out/'01-prediction.png'))
  page.locator('[data-prediction-done]').click();page.wait_for_function('window.__lab')
  def adjust(v):
   page.locator('[data-inquiry-adjust]').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}',v)
   page.wait_for_timeout(100)
  def load_obj(id):
   page.locator(f'[data-object="{id}"]').click();page.wait_for_timeout(2800)
  def submit(v):
   page.locator('[data-inquiry-reading]').fill(str(v));page.locator('[data-inquiry-record]').click()
  adjust(2);load_obj('box')
  assert '영점' not in page.locator('#activity-content').inner_text()
  assert '오류' not in page.locator('[data-inquiry-feedback]').inner_text()
  submit(6)
  assert page.locator('[data-inquiry-feedback]').inner_text()=='실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?'
  assert '영점' not in page.locator('#activity-content').inner_text()
  assert not page.locator('.inquiry-summary').count()
  page.screenshot(path=str(out/'02-method-error-no-spoiler.png'))
  page.locator('[data-method-thought]').fill('물체가 없는 상태에서 시작할 때 저울의 기준을 다시 살펴보겠습니다.')
  page.locator('[data-inquiry-retry]').click()
  page.locator('[data-inquiry-remove]').click();adjust(0);load_obj('box');submit(4)
  assert page.locator('[data-inquiry-feedback]').inner_text().startswith('측정값을 기록')
  assert '영점' not in page.locator('[data-inquiry-feedback]').inner_text()
  report['checks'].append('Submit-only generic method feedback; incorrect prediction remains separate')
  # Read while moving, no disabled button and no early explanation.
  page.locator('[data-object="metal"]').click();submit(18)
  assert '실험 방법에 오류' in page.locator('[data-inquiry-feedback]').inner_text()
  page.wait_for_timeout(2800);submit(18);assert '기록했어요' in page.locator('[data-inquiry-feedback]').inner_text()
  for id,value in [('a',11),('b',10),('c',12)]:load_obj(id);submit(value)
  assert not page.locator('[data-inquiry-summary]').is_disabled()
  page.screenshot(path=str(out/'03-corrected-records.png'))
  page.locator('[data-inquiry-summary]').click();page.wait_for_selector('.inquiry-summary')
  assert '주머니 B 10 N → 주머니 A 11 N → 주머니 C 12 N' in page.locator('.inquiry-summary').inner_text()
  assert '빈 저울' in page.locator('.inquiry-summary').inner_text()
  assert '순서는 그대로일 수도' in page.locator('.inquiry-summary').inner_text()
  page.screenshot(path=str(out/'04-debrief.png'))
  report['checks'].append('Reference and motion error corrected before final explanation; common-offset order distinction')
  # Deep link to a different genuine activity.
  page.goto(base+'?s=l2-graph&lab=1',wait_until='networkidle');page.wait_for_selector('[data-check]')
  assert page.evaluate('window.__sample.pages[window.__sample.current].id')=='l2-graph'
  report['checks'].append('QR section ID opens the exact activity across page-number changes')
  # More method invariants, including no bug-driven always-fail feedback.
  checks=page.evaluate('''async()=>{const {checkMethod}=await import('./inquiry.js');const g={zeroAtLoad:0,zero:0,adjustedLoaded:false,settled:true,viewMoving:false,expectedEye:4,reading:4,entered:4};return {valid:checkMethod(g),loaded:checkMethod({...g,adjustedLoaded:true}),view:checkMethod({...g,expectedEye:7}),moving:checkMethod({...g,settled:false}),entry:checkMethod({...g,entered:5})};}''')
  assert checks['valid']['valid'] and all(not checks[k]['valid'] for k in ['loaded','view','moving','entry'])
  report['method']=checks
  # Correct-before-measuring path requires no artificial failure.
  page.evaluate('window.__sample.save("why-scale-inquiry-v1",null)')
  page.goto(base+'?s=l1-inquiry&lab=1',wait_until='networkidle')
  page.locator('[data-pair="metal"]').click();page.locator('[data-prediction-reason]').fill('재료가 다르므로 크기만으로 알 수 없어요.')
  page.locator('[data-prediction-done]').click();page.wait_for_function('window.__lab');adjust(0);load_obj('box');submit(4)
  assert '기록했어요' in page.locator('[data-inquiry-feedback]').inner_text()
  assert page.locator('[data-method-review]').is_hidden()
  report['checks'].append('Correct preparation accepted without a forced error')
  # Viewport fit checks for inquiry modes and book.
  for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
   page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(400)
   bounds=page.evaluate('''()=>({w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,foot:document.querySelector('.transport').getBoundingClientRect().bottom})''')
   assert bounds['scrollW']<=w+1 and bounds['scrollH']<=h+1 and bounds['foot']<=h+1,bounds
   if w==390:page.screenshot(path=str(out/'05-mobile.png'))
  page.set_viewport_size({'width':1366,'height':768});page.evaluate('window.__sample.close();window.__sample.navigate(0)')
  for teacher in [False,True]:
   if teacher:page.emulate_media(media='screen');page.locator('#teacher').click()
   page.evaluate('window.__sample.printBuild()');page.emulate_media(media='print')
   gaps=page.evaluate('''()=>[...document.querySelectorAll('#print-root .paper')].map(p=>({id:p.dataset.layoutPage,gap:p.querySelector('.page-foot').getBoundingClientRect().top-p.querySelector('.page-body').getBoundingClientRect().bottom}))''')
   qr=page.locator('#print-root .lab-qr img').count();assert qr==20
   assert len(gaps)==20 and min(x['gap'] for x in gaps)>6,gaps
   overlap=page.evaluate('''()=>[...document.querySelectorAll('#print-root .paper')].filter(p=>{const a=p.querySelector('.lab-qr').getBoundingClientRect(),b=p.querySelector('.page-heading h1').getBoundingClientRect();const range=document.createRange();range.selectNodeContents(p.querySelector('.page-heading h1'));return [...range.getClientRects()].some(t=>a.left<t.right&&a.right>t.left&&a.top<t.bottom&&a.bottom>t.top)}).map(p=>p.dataset.layoutPage)''')
   assert not overlap,overlap
   page.pdf(path=str(out/('teacher.pdf' if teacher else 'student.pdf')),print_background=True,prefer_css_page_size=True)
   report['print'].append({'teacher':teacher,'pages':20,'qrCodes':qr,'gaps':gaps})
  assert not report['errors']
 except Exception:
  report['errors'].append(traceback.format_exc());page.emulate_media(media='screen');page.screenshot(path=str(out/'failure.png'))
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
print(json.dumps(report,ensure_ascii=False,indent=2))
if report['errors']:raise SystemExit(1)
