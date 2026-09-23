from playwright.sync_api import sync_playwright
from pathlib import Path
import json,sys,traceback
OUT=Path('/tmp/everyday-qa');OUT.mkdir(exist_ok=True)
BASE='http://127.0.0.1:8765/sample-v2/?s=l1-inquiry&lab=1'
VALUES={'shoe':2.4,'apple':2.0,'mandarins':1.8,'phone':2.2,'pencilcase':2.6}
report={'checks':[],'errors':[],'layouts':[],'print':{}}
def check(label,condition):
 assert condition,label
 report['checks'].append(label)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':1366,'height':768},device_scale_factor=1)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  page.add_init_script("localStorage.setItem('msg-source-sample-v2:why-scale-inquiry-v1',JSON.stringify({phase:'measure',order:['a','b','c'],attempts:[]}));")
  page.goto(BASE,wait_until='networkidle');page.wait_for_selector('[data-order-id]')
  check('Exactly five familiar comparison items',page.locator('[data-order-id]').count()==5)
  check('No anonymous bags or two-plus-three grouping',not any(s in page.locator('#activity-content').inner_text() for s in ['주머니 A','주머니 B','두 물건 중','세 물건']))
  check('No numeric weights before measurement',not any(f'{v:.1f} N' in page.locator('#activity-content').inner_text() for v in VALUES.values()))
  page.locator('[data-later="shoe"]').click();check('Reordering includes all five items',page.locator('[data-order-id]').evaluate_all('els=>els.map(e=>e.dataset.orderId)')==['apple','shoe','mandarins','phone','pencilcase'])
  page.locator('[data-order-id="phone"] .order-handle').focus();page.keyboard.press('ArrowLeft')
  check('Keyboard ranking preserves all five unique items',len(set(page.locator('[data-order-id]').evaluate_all('els=>els.map(e=>e.dataset.orderId)')))==5)
  page.screenshot(path=str(OUT/'prediction-desktop.png'))
  page.locator('[data-prediction-reason]').fill('크기와 재료는 다르지만 들어 보기 전에는 무게 순서를 확신하기 어려워요.')
  page.locator('[data-prediction-done]').click();page.wait_for_function('!!window.__lab');page.wait_for_timeout(1100)
  check('New state does not delete old saved attempts',page.evaluate("localStorage.getItem('msg-source-sample-v2:why-scale-inquiry-v1')") is not None)
  check('5 N instrument with 0.1 N resolution',page.evaluate('window.__lab.state().scaleMax===5&&window.__lab.state().scaleStep===.1'))
  page.locator('[data-inquiry-adjust]').evaluate("e=>{e.value='.2';e.dispatchEvent(new Event('input',{bubbles:true}));}")
  page.locator('[data-object="shoe"]').press('Enter');page.wait_for_function('window.__lab.state().settled&&!window.__lab.state().viewMoving')
  page.locator('[data-inquiry-reading]').fill('2.6');page.locator('[data-inquiry-record]').click()
  feedback=page.locator('[data-inquiry-feedback]').inner_text()
  check('First procedure feedback does not disclose zero',feedback=='실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?')
  page.screenshot(path=str(OUT/'generic-method-feedback.png'))
  page.locator('[data-method-thought]').fill('물건을 빼고 기준을 살펴본 뒤 같은 방법으로 다시 재겠어요.')
  page.locator('[data-inquiry-retry]').click();page.locator('[data-inquiry-remove]').click()
  # Use the actual visible adjustment slider, not model injection.
  page.locator('[data-inquiry-adjust]').focus();page.keyboard.press('Home');
  for _ in range(6):page.keyboard.press('ArrowRight')
  check('Learner can adjust without a calibration verdict',abs(page.evaluate('window.__lab.state().zero'))<.0001 and '영점' not in page.locator('[data-inquiry-feedback]').inner_text())
  for name,v in VALUES.items():
   page.locator(f'[data-object="{name}"]').press('Enter');page.wait_for_function('window.__lab.state().settled&&!window.__lab.state().viewMoving')
   check('Recognisable attached model: '+name,page.locator('.inquiry-lab canvas').get_attribute('data-object')==name)
   page.locator('[data-inquiry-object]').click();page.wait_for_function('!window.__lab.state().viewMoving')
   check('Object close-up preserves load: '+name,abs(page.evaluate('window.__lab.state().force')-v)<.001)
   page.locator('.inquiry-lab .scene').screenshot(path=str(OUT/f'model-{name}.png'))
   page.locator('[data-inquiry-whole]').click();page.wait_for_function('!window.__lab.state().viewMoving')
   if name=='apple':
    page.locator('[data-inquiry-view="front"]').click();page.wait_for_function('!window.__lab.state().viewMoving')
    pos=page.evaluate('window.__lab.tickScreen(2.0)');page.mouse.click(pos['x'],pos['y']);
    check('Real 3D tick selection uses decimal N',abs(float(page.locator('[data-inquiry-reading]').input_value())-2)<.01)
    page.locator('.inquiry-lab .scene').screenshot(path=str(OUT/'decimal-scale-reading.png'))
   page.locator('[data-inquiry-reading]').fill(str(v));page.locator('[data-inquiry-record]').click()
   check('Valid measurement records '+name,'측정값을 기록했어요' in page.locator('[data-inquiry-feedback]').inner_text())
  check('Five valid latest records unlock comparison',page.locator('[data-inquiry-summary]').is_enabled())
  page.locator('[data-inquiry-summary]').click();ranking=page.locator('.inquiry-ranking').inner_text()
  check('Final ranking contains all five measured objects',all(s in ranking for s in ['귤 두 개','사과 한 개','휴대폰 한 개','신발 한 짝','필기구가 든 필통']))
  check('Specific cause appears only in final debrief','0에 맞춘' in page.locator('.inquiry-summary').inner_text())
  page.screenshot(path=str(OUT/'five-item-results.png'))
  # Regress the textbook instrument range and independent lessons.
  page.evaluate("window.__sample.open('eye')");page.wait_for_function("window.__lab?.state().mode==='eye'")
  check('Textbook instrument remains 30 N',page.evaluate('window.__lab.state().scaleMax===30'))
  for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
   ctx=b.new_context(viewport={'width':w,'height':h});pg=ctx.new_page();pg.goto(BASE,wait_until='networkidle');pg.wait_for_selector('[data-order-id]');
   lay=pg.evaluate('''()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,orderCount:document.querySelectorAll('[data-order-id]').length,footerBottom:document.querySelector('.transport').getBoundingClientRect().bottom})''')
   report['layouts'].append(lay);check(f'Viewport bounds {w}x{h}',lay['scrollWidth']<=w+1 and lay['footerBottom']<=h+1 and lay['orderCount']==5)
   pg.screenshot(path=str(OUT/f'prediction-{w}.png'));ctx.close()
  # Print both editions; complete source chapters are left intact.
  ctx=b.new_context(viewport={'width':1366,'height':768});pg=ctx.new_page();pg.goto(BASE.replace('&lab=1',''),wait_until='networkidle');pg.wait_for_function('document.documentElement.dataset.ready==="true"')
  for mode in ['student','teacher']:
   if mode=='teacher':pg.emulate_media(media='screen');pg.locator('#teacher').click()
   pg.emulate_media(media='print');pg.evaluate('window.__sample.printBuild()')
   count=pg.locator('#print-root .paper').count();check(mode+' edition has 20 pages',count==20)
   check(mode+' edition has 20 activity QR codes',pg.locator('#print-root .lab-qr').count()==20)
   gaps=pg.locator('#print-root .paper').evaluate_all('''els=>els.map((p,i)=>({page:i+1,gap:p.querySelector('.page-foot').getBoundingClientRect().top-p.querySelector('.page-body').getBoundingClientRect().bottom}))''')
   report['print'][mode]=gaps
   for i in range(2):pg.locator('#print-root .paper').nth(i).screenshot(path=str(OUT/f'{mode}-intro-{i+1}.png'))
   pg.pdf(path=str(OUT/(mode+'.pdf')),print_background=True,prefer_css_page_size=True)
   check(mode+' intro pages do not hit footer',all(g['gap']>=-1 for g in gaps[:2]))
  ctx.close()
  check('No browser exceptions',not report['errors'])
 except Exception as e:
  report['errors'].append(str(e));traceback.print_exc()
  try:page.screenshot(path=str(OUT/'failure.png'))
  except:pass
  raise
 finally:
  (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
