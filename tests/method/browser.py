from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
out=Path(os.environ.get('QA_OUT','/tmp/method-qa'));out.mkdir(exist_ok=True)
base=os.environ.get('BASE_URL','http://127.0.0.1:8765/sample-v2/')
report={'checks':[],'errors':[],'layouts':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
 page=b.new_page(viewport={'width':1366,'height':768});page.on('pageerror',lambda e:report['errors'].append(str(e)))
 # Muting is an ordinary preference; no audio is faked as successfully cloned.
 page.add_init_script("localStorage.setItem('msg-source-sample-v2:sound','false');localStorage.setItem('msg-source-sample-v2:teacher','false')")
 page.goto(base+'?id=intro-predict&activity=inquiry',wait_until='networkidle');page.wait_for_function("document.documentElement.dataset.ready==='true'")
 assert page.evaluate('window.__sample.pages.length')==20
 assert page.evaluate('window.__sample.questions.length')==18
 page.locator('[data-pair="ball"]').wait_for();assert '영점' not in page.locator('#activity-content').inner_text()
 page.screenshot(path=str(out/'01-predict-pair.png'))
 page.locator('[data-pair="ball"]').click();page.locator('[data-next]').click()
 page.locator('[data-move="pouch-e"][data-dir="-1"]').click()
 assert page.locator('[data-order]').evaluate_all('(els)=>els.map(e=>e.dataset.order)')==['pouch-c','pouch-e','pouch-d']
 page.locator('[data-reason]').fill('겉모양이 비슷해서 실제로 재 보아야 할 것 같습니다.')
 page.screenshot(path=str(out/'02-predict-three.png'));page.locator('[data-next]').click()
 page.wait_for_function('window.__lab&&window.__lab.state().mode==="inquiry"');page.wait_for_timeout(1000)
 panel=page.locator('.method-panel')
 assert '영점' not in panel.inner_text() and '0에' not in panel.inner_text()
 assert page.evaluate('window.__lab.state().zero')==2
 # The student submits an apparently steady reading before any cause is revealed.
 page.locator('[data-object="ball"]').click();page.locator('[data-eye="front"]').click()
 page.wait_for_function('window.__lab.state().settled');page.wait_for_timeout(1000)
 page.locator('[data-measured]').fill('6');page.locator('[data-record]').click()
 assert page.locator('#activity-content [data-feedback]').inner_text()=='실험 방법에 오류가 있어요. 과정을 다시 점검해 보세요.'
 assert page.evaluate("window.__sample.load('inquiry-attempts',[])[0].codes.includes('reference')")
 assert '영점' not in panel.inner_text()
 page.locator('[data-hint]').click();assert '영점' not in page.locator('#activity-content [data-feedback]').inner_text()
 page.screenshot(path=str(out/'03-generic-method-error.png'));report['checks'].append('Uncorrected reference detected only after submission; cause not shown or spoken')
 # Physical empty-scale knob drag (not a hidden setZero call).
 page.locator('[data-remove]').click();page.locator('[data-whole]').click();page.wait_for_timeout(1100)
 xy=page.evaluate('window.__lab.knobScreen()');page.mouse.move(xy['x'],xy['y']);page.mouse.down();page.mouse.move(xy['x']-36,xy['y'],steps=12);page.mouse.up()
 assert page.evaluate('window.__lab.state().zero')==0
 page.locator('[data-correction]').fill('기구를 다시 살펴보고 값을 읽기 전 과정을 고쳤습니다.')
 report['checks'].append('Actual 3D knob drag changes the reference while empty; no automatic reset')
 # Reading while oscillating remains possible and is identified as a method error on submit.
 page.locator('[data-object="metal"]').click();page.locator('[data-measured]').fill('12');page.locator('[data-record]').click()
 assert page.evaluate("window.__sample.load('inquiry-attempts',[]).at(-1).codes.includes('motion')")
 page.wait_for_function('window.__lab.state().settled');page.locator('[data-eye="high"]').click();page.wait_for_timeout(1000)
 page.locator('[data-measured]').fill('14');page.locator('[data-record]').click()
 assert page.evaluate("window.__sample.load('inquiry-attempts',[]).at(-1).codes.includes('view')")
 assert page.locator('#activity-content [data-feedback]').inner_text()=='실험 방법에 오류가 있어요. 과정을 다시 점검해 보세요.'
 report['checks'].append('Oscillation and real camera parallax are separate tracked errors with the same non-leading first feedback')
 for id,value in [('ball',4),('metal',12),('pouch-c',8),('pouch-d',10),('pouch-e',9)]:
  page.locator('[data-object="'+id+'"]').click();page.locator('[data-eye="front"]').click();page.wait_for_function('window.__lab.state().settled');page.wait_for_timeout(900)
  page.locator('[data-measured]').fill(str(value));page.locator('[data-record]').click()
  assert page.evaluate("window.__sample.load('inquiry-current-records',{})["+json.dumps(id)+"].valid"),id
 report['checks'].append('All five correct measurements accepted without auto-calibration; failed and corrected attempts both retained')
 assert page.evaluate("window.__sample.load('inquiry-attempts',[]).length")>=8
 page.screenshot(path=str(out/'04-corrected-records.png'));page.locator('[data-finish]').click()
 assert 'C · 주머니 (8 N) → E · 주머니 (9 N) → D · 주머니 (10 N)' in page.locator('#activity-content').inner_text()
 assert '예상이 달랐다는 것과 실험 방법이 잘못되었다는 것은 다릅니다.' in page.locator('#activity-content').inner_text()
 page.screenshot(path=str(out/'05-comparison.png'));page.locator('[data-back-book]').click();assert page.evaluate('window.__sample.pages[window.__sample.current].id')=='l1-structure'
 # Every printed QR route selects the intended source page and an existing activity.
 expected=page.evaluate("async()=>{const {qrLinks}=await import('./qr-map.js');return qrLinks;}")
 assert len(expected)==20
 page.goto(base+'?id=l2-test-graph&activity=assessment-graph',wait_until='networkidle');page.wait_for_function('window.__sample&&window.__sample.pages[window.__sample.current].id==="l2-test-graph"')
 assert page.locator('#workspace').evaluate('e=>e.classList.contains("active")')
 report['checks'].append('Stable-ID QR deep-link reaches the original graph assessment independently of added pages')
 for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
  page.set_viewport_size({'width':w,'height':h});page.goto(base+'?id=intro-predict&activity=inquiry',wait_until='networkidle');page.locator('[data-pair="ball"]').wait_for()
  bounds=page.evaluate('({w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth,transport:document.querySelector(".transport").getBoundingClientRect().bottom,workspace:document.querySelector("#workspace").getBoundingClientRect().bottom})')
  assert bounds['scrollW']<=w and bounds['transport']<=h+2,bounds
  report['layouts'].append(bounds);page.screenshot(path=str(out/f'layout-{w}.png'))
 assert not report['errors'],report['errors'];b.close()
(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
