from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os
OUT=Path('/tmp/guide-editions-qa');OUT.mkdir(exist_ok=True)
BASE=os.environ.get('SAMPLE_URL','http://127.0.0.1:8765/sample-v2/')
report={'checks':[],'errors':[],'editions':{},'layouts':[],'content_layouts':[]}
def ok(v,msg):
 assert v,msg
 report['checks'].append(msg)
def ready(p,url):
 p.goto(url,wait_until='networkidle');p.wait_for_function("document.documentElement.dataset.ready==='true'")
 p.evaluate('document.fonts.ready');p.wait_for_timeout(600)
def visible_keys(p,where='#flipbook'):
 return p.locator(where+' .teacher-answer').evaluate_all("es=>es.filter(e=>e.getBoundingClientRect().height>0&&getComputedStyle(e).display!=='none').length")
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  p=b.new_page(viewport={'width':1366,'height':768});p.on('pageerror',lambda e:report['errors'].append(str(e)))
  ready(p,BASE+'student.html')
  ok(p.evaluate('window.__sample.edition')=='student','Dedicated self-study entry works')
  ok(p.locator('#flipbook .paper').count()==20,'All20contentpages present in the living book')
  ok(visible_keys(p)==0,'Student pages do not show teacher answers')
  ok(p.locator('#flipbook .paper').first.evaluate("e=>getComputedStyle(e,':before').borderTopWidth")=='2px','Visible double-page frame applied')
  p.screenshot(path=str(OUT/'student-desktop.png'))
  # Inspect the actual current page at each viewport, including body/dock bounds.
  for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
   p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(700)
   data=p.evaluate('''()=>({w:innerWidth,h:innerHeight,scroll:document.documentElement.scrollWidth,transport:document.querySelector('.transport').getBoundingClientRect().bottom,workspace:document.querySelector('#workspace').getBoundingClientRect().bottom})''')
   report['layouts'].append(data)
   ok(data['scroll']<=w and data['transport']<=h+2,'Viewport and lower controls fit '+str(w)+'x'+str(h))
   p.screenshot(path=str(OUT/f'app-{w}.png'))
  p.set_viewport_size({'width':1366,'height':768});p.wait_for_timeout(300)
  for i in range(20):
   p.evaluate('i=>window.__sample.navigate(i)',i);p.wait_for_timeout(160)
   metrics=p.locator(f'#flipbook .paper[data-book-page="{i}"]').evaluate('''pg=>{
    const r=pg.getBoundingClientRect(),body=pg.querySelector('.page-body'),dock=pg.querySelector('.page-launch'),foot=pg.querySelector('.page-foot');
    const scale=r.height/1123;const end=body.getBoundingClientRect().bottom;
    const limit=dock.children.length?dock.getBoundingClientRect().top:foot.getBoundingClientRect().top;
    return {right:(body.getBoundingClientRect().right-r.left)/scale,width:r.width/scale,page:pg.dataset.bookPage,bottom:(end-r.top)/scale,limit:(limit-r.top)/scale,zoom:getComputedStyle(body).zoom};}''')
   report['content_layouts'].append(metrics)
   if metrics['bottom']>metrics['limit']+2:p.screenshot(path=str(OUT/f'layout-failure-{i}.png'))
   ok(metrics['bottom']<=metrics['limit']+2,'Living page body does not hit controls '+str(i+1))
   ok(metrics['right']<=metrics['width']-30,'Living page stays inside its right border '+str(i+1))
  # Student written answers are still writable; no all-answers reveal on route change.
  p.evaluate('window.__sample.navigate(10)');p.click('#focus-reading')
  p.locator('#activity-content [name="a1-0"]').fill('영점조절나사')
  ok(p.evaluate('window.__sample.answers["a1-0"]')=='영점조절나사','Self-study answer persistence retained')
  p.evaluate('window.__sample.close()')
  p.locator('#edition').select_option('teacher');p.wait_for_url(lambda u:'edition=teacher' in u);p.wait_for_function("document.documentElement.dataset.ready==='true'")
  ok(p.evaluate('window.__sample.edition')=='teacher','Instructor mode switch works')
  ok(visible_keys(p)==0,'Instructor projected book starts with keys hidden')
  p.locator('#teacher').click();p.wait_for_selector('.large-reading')
  ok(visible_keys(p,'#activity-content')>0,'Explicit instructor reveal opens annotated reading')
  p.screenshot(path=str(OUT/'teacher-annotated.png'))
  p.locator('#edition').select_option('student');p.wait_for_url(lambda u:'edition=student' in u);p.wait_for_function("document.documentElement.dataset.ready==='true'")
  ok(visible_keys(p)==0,'Student mode does not inherit instructor key visibility')
  # Existing experimental inquiry, models, neutral feedback are still operational.
  ready(p,BASE+'book.html?s=l1-inquiry&lab=1')
  p.wait_for_selector('[data-order-id]');ok(p.locator('[data-order-id]').count()==5,'All five familiar objects remain in inquiry')
  p.locator('[data-prediction-reason]').fill('보이는 크기와 재료를 비교했습니다.')
  p.locator('[data-prediction-done]').click();p.wait_for_function('window.__lab!==null&&window.__lab!==undefined')
  p.evaluate('window.__lab.setZero(.2)')
  p.locator('[data-object="shoe"]').click();p.locator('[data-inquiry-view="front"]').click()
  p.wait_for_function('window.__lab.state().settled&&!window.__lab.state().viewMoving')
  val=p.evaluate('window.__lab.state().reading');p.locator('[data-inquiry-reading]').fill(str(round(val,1)))
  p.locator('[data-inquiry-record]').click();feedback=p.locator('[data-inquiry-feedback]').inner_text()
  ok('실험 방법에 오류' in feedback and '영점' not in feedback and '0점' not in feedback,'Method-error feedback remains non-leading')
  p.screenshot(path=str(OUT/'inquiry-method-error.png'))
  p.locator('[data-inquiry-remove]').click();p.evaluate('window.__lab.setZero(0)')
  for kind in ['shoe','apple','mandarins','phone','pencilcase']:
   p.locator('[data-object="'+kind+'"]').click();p.locator('[data-inquiry-view="front"]').click()
   p.wait_for_function('window.__lab.state().settled&&!window.__lab.state().viewMoving')
   ok(p.evaluate('window.__lab.state().objectId')==kind,'Actual WebGL object retained: '+kind)
  # Decode existing local media, not just URL existence.
  clips=p.evaluate("async()=>{const m=await fetch('./audio/narration-manifest.json').then(r=>r.json());return Object.values(m).map(x=>x.path)}")
  for path in clips:
   duration=p.evaluate("src=>new Promise((resolve,reject)=>{const a=new Audio(src);a.onloadedmetadata=()=>resolve(a.duration);a.onerror=()=>reject('audio failed '+src)})",path)
   ok(duration>0,'Narration decodes '+path)
  for kind in ['watch','balance','spring-film']:
   p.evaluate('kind=>window.__sample.open(kind)',kind);p.wait_for_selector('video')
   p.locator('video').evaluate('v=>v.play()');p.wait_for_timeout(400)
   ok(p.locator('video').evaluate('v=>v.currentTime>0&&v.muted'),'Muted video plays '+kind)
  # Print the correct edition through its actual entry point.
  for ed,count in [('student',22),('teacher',27)]:
   ready(p,BASE+ed+'.html')
   p.evaluate('window.__sample.printBuild()')
   p.emulate_media(media='print')
   p.pdf(path=str(OUT/(ed+'.pdf')),format='A4',print_background=True,prefer_css_page_size=True)
   p.evaluate("document.body.classList.toggle('teacher-mode',"+('true' if ed=='teacher' else 'false')+")")
   rows=p.evaluate('''()=>[...document.querySelectorAll('#print-root .paper')].map(pg=>{
    const body=pg.querySelector('.page-body'),f=pg.querySelector('.page-foot'),r=pg.getBoundingClientRect();
    const e=body?[...body.querySelectorAll('*')].filter(x=>getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().height>0&&!x.closest('svg')):[];
    const last=Math.max(body?body.getBoundingClientRect().bottom:0,...e.map(x=>x.getBoundingClientRect().bottom));
    return {key:pg.dataset.bookPage??pg.dataset.extra,bottom:last-r.top,footer:f?f.getBoundingClientRect().top-r.top:null,overlap:f?last-f.getBoundingClientRect().top:0};})''')
   keys=p.locator('#print-root [data-q]').evaluate_all('es=>es.map(e=>e.dataset.q)')
   countqr=p.locator('#print-root .lab-qr,#print-root .guide-qr').count()
   ok(p.locator('#print-root .paper').count()==count,ed+' has '+str(count)+' print pages')
   ok(len(keys)==18 and len(set(keys))==18,ed+' keeps all18originalquestions exactly once')
   report['editions'][ed]={'count':count,'qr':countqr,'questions':keys,'layouts':rows}
   for ix,row in enumerate(rows):
    if row['overlap']>0:p.locator('#print-root .paper').nth(ix).screenshot(path=str(OUT/f'{ed}-overflow-{ix+1:02}.png'))
   ok(all(x['overlap']<=0 for x in rows),ed+' all print content clears footer')
   ok(countqr>=21,ed+' keeps activity-specific QR links')
   for index in ([0,1,2,3,8,20] if ed=='student' else [0,2,4,6,16,24]):
    p.locator('#print-root .paper').nth(index).screenshot(path=str(OUT/f'{ed}-page-{index+1:02}.png'))
   report['editions'][ed]={'count':count,'qr':countqr,'questions':keys,'layouts':rows}
   p.emulate_media(media='screen')
  ok(not report['errors'],'No uncaught browser exceptions')
  b.close()
except Exception as e:
 report['failure']=str(e)
 try:p.screenshot(path=str(OUT/'failure-state.png'))
 except:pass
 raise
finally:
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
