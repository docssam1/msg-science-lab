// 카카오톡·인스타 같은 앱 안의 브라우저는 3D·전체 화면·소리가 막히거나 화면이 잘린다.
// → 들어오면 바깥 브라우저(크롬·사파리)로 다시 연다. 자동 전환이 막히면 버튼을 띄운다.
const UA = navigator.userAgent || '';
export const inApp = /KAKAOTALK|FB_IAB|FBAN|FBAV|Instagram|Line\/|NAVER\(inapp|DaumApps|everytimeApp|WhaleOn|kakaostory/i.test(UA);
const isAndroid = /Android/i.test(UA), isIOS = /iPhone|iPad|iPod/i.test(UA);

export function escapeInApp({ auto = true } = {}) {
  if (!inApp) return;
  const url = location.href;
  const go = () => {
    if (/KAKAOTALK/i.test(UA)) { location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`; return; }
    if (isAndroid) { location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=${location.protocol.replace(':', '')};package=com.android.chrome;end`; return; }
    if (isIOS) { location.href = url.replace(/^https?:\/\//, 'googlechrome://'); setTimeout(() => { location.href = url.replace(/^https?:\/\//, 'x-safari-https://'); }, 400); return; }
    open(url, '_blank', 'noopener');
  };
  let tried = false;
  try { tried = sessionStorage.getItem('sci.inapp') === '1'; sessionStorage.setItem('sci.inapp', '1'); } catch { /* 저장 불가 */ }
  const bar = document.createElement('div');
  bar.className = 'inapp-bar';
  bar.innerHTML = `<p>앱 안의 화면이라 3D 실험과 소리가 제대로 안 열려요.</p><button type="button">브라우저에서 열기</button>
    <button type="button" class="ghost" aria-label="닫기">✕</button>`;
  bar.querySelector('button').addEventListener('click', go);
  bar.querySelector('.ghost').addEventListener('click', () => bar.remove());
  const show = () => document.body.appendChild(bar);
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', show) : show();
  if (auto && !tried) setTimeout(go, 350);
}
