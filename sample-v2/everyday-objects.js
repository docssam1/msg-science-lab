// Added inquiry only. Values are designed virtual sample loads, NOT measured product weights.
// The mandarins are two physical fruits treated as ONE comparison item.
export const inquiryObjects = Object.freeze([
 Object.freeze({id:'shoe',name:'신발 한 짝',short:'신발',quantity:'한 짝',force:2.4,kind:'shoe'}),
 Object.freeze({id:'apple',name:'사과 한 개',short:'사과',quantity:'한 개',force:2.0,kind:'apple'}),
 Object.freeze({id:'mandarins',name:'귤 두 개',short:'귤',quantity:'두 개 함께',force:1.8,kind:'mandarins'}),
 Object.freeze({id:'phone',name:'휴대폰 한 개',short:'휴대폰',quantity:'한 개',force:2.2,kind:'phone'}),
 Object.freeze({id:'pencilcase',name:'필기구가 든 필통',short:'필통',quantity:'내용물 포함',force:2.6,kind:'pencilcase'})
]);
export const inquiryScale=Object.freeze({max:5,step:.1,tolerance:.051,zeroLimit:.6});
export const inquiryStateKey='why-scale-everyday-five-v3';
export function initialOrder(){return inquiryObjects.map(o=>o.id);}
export function validOrder(order){return Array.isArray(order)&&order.length===5&&new Set(order).size===5&&order.every(id=>inquiryObjects.some(o=>o.id===id));}
export const formatForce=n=>Number(n).toFixed(1);
export function objectPhoto(o){const file=o.id==='pencilcase'?'pencil-case':o.id;return `<img class="object-photo" src="./photos/${file}.jpg" alt="${o.name} 예시 실사 사진">`;}

// Detailed original vector illustrations, shared by web and print; no anonymous sacks.
export function objectFigure(o){
 const defs=`<defs>
 <linearGradient id="sole" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#cfd8de"/></linearGradient>
 <linearGradient id="shoe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#588ca3"/><stop offset="1" stop-color="#203c57"/></linearGradient>
 <radialGradient id="apple" cx="32%" cy="24%" r="80%"><stop stop-color="#ff9172"/><stop offset=".38" stop-color="#e54f3e"/><stop offset="1" stop-color="#9b2028"/></radialGradient>
 <radialGradient id="citrus" cx="30%" cy="25%" r="80%"><stop stop-color="#ffd05b"/><stop offset=".5" stop-color="#f59c29"/><stop offset="1" stop-color="#d5610f"/></radialGradient>
 <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#172f52"/><stop offset=".48" stop-color="#36728c"/><stop offset="1" stop-color="#9bccbf"/></linearGradient>
 <linearGradient id="case" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#74b9af"/><stop offset="1" stop-color="#276d70"/></linearGradient>
 </defs>`;
 const bodies={
 shoe:`<path d="M24 125 29 87Q38 76 53 84L75 92 105 55Q118 61 122 82L163 106Q184 114 189 131L184 144 45 152 24 143Z" fill="url(#shoe)"/>
 <path d="M25 125Q65 142 106 131L188 127 188 143Q162 156 38 155L24 146Z" fill="url(#sole)" stroke="#8399a5" stroke-width="2"/>
 <path d="M34 145Q93 154 178 141M38 139 46 144M61 143 68 147M85 143 91 147M111 139 117 144M137 136 143 141M162 133 168 138" fill="none" stroke="#9cabb1" stroke-width="2"/>
 <path d="m32 90 19 8 17 31-27-3Z" fill="#31516b"/><path d="m77 103 41-27 33 29-30 24-43-4Z" fill="#ecedda"/><path d="m83 108 32-23 9 8-28 28Z" fill="#bc7558"/>
 <path d="m63 94 41-37 9 24-29 29Z" fill="#e5e9dc" stroke="#91a6af" stroke-width="2"/>
 <path d="m78 83 29 9m-23-15 28 10m-22-16 27 10m-44 9 25 9" fill="none" stroke="#fffef6" stroke-width="5" stroke-linecap="round"/>
 <path d="M37 91Q45 82 55 91L66 96 60 104 39 97Z" fill="#172e45"/>
 <path d="M151 112Q173 114 179 125" fill="none" stroke="#91b3c3" stroke-width="3"/>`,
 apple:`<path d="M111 54Q130 44 147 56C188 78 158 159 117 162Q105 154 94 162C49 157 27 82 60 58Q84 45 99 56Z" fill="url(#apple)"/>
 <path d="M105 57Q101 39 114 27" fill="none" stroke="#684438" stroke-width="7" stroke-linecap="round"/>
 <path d="M110 44Q125 19 149 30Q139 48 110 44Z" fill="#498a50"/><path d="m112 43 30-11" stroke="#96bd64" stroke-width="2"/>
 <path d="M70 64Q52 79 61 103" fill="none" stroke="#ffbc9b" stroke-width="9" opacity=".55" stroke-linecap="round"/>
 <ellipse cx="106" cy="58" rx="13" ry="4" fill="#b8302f" opacity=".6"/>
 <path d="M140 84 143 86M133 105 136 107M145 116 147 118M75 132 77 134M102 97 105 99" stroke="#ed9472" opacity=".7" stroke-width="2"/>`,
 mandarins:`<g data-fruit="one"><ellipse cx="76" cy="102" rx="48" ry="43" fill="url(#citrus)"/>
 <path d="m73 58 5 7 12-3-8 10-11-5-9 3 5-9Z" fill="#49764e"/><path d="M48 80Q35 93 43 108" fill="none" stroke="#ffdd77" stroke-width="7" opacity=".5" stroke-linecap="round"/>
 <path d="M58 111h1m19 14h1m17-20h1m-35-22h1m21 11h1m12 24h1m-35 10h1" stroke="#c77620" stroke-width="3" stroke-linecap="round"/></g>
 <g data-fruit="two"><ellipse cx="137" cy="127" rx="48" ry="43" fill="url(#citrus)"/>
 <path d="m134 83 5 7 12-3-8 10-11-5-9 3 5-9Z" fill="#537b42"/><path d="M110 106Q99 115 103 126" fill="none" stroke="#ffdd77" stroke-width="7" opacity=".5" stroke-linecap="round"/>
 <path d="M119 136h1m19 14h1m17-20h1m-35-22h1m21 11h1m12 24h1m-35 10h1" stroke="#c77620" stroke-width="3" stroke-linecap="round"/></g>`,
 phone:`<g transform="rotate(13 103 100)"><rect x="61" y="20" width="92" height="161" rx="16" fill="#2e414e"/><rect x="56" y="17" width="91" height="159" rx="15" fill="#8a9eaa" stroke="#536c7b" stroke-width="2"/>
 <rect x="61" y="22" width="81" height="148" rx="11" fill="url(#screen)"/><path d="M64 122Q100 72 139 62V157q0 11-11 11H73q-10 0-10-10Z" fill="#6eb1b9" opacity=".4"/>
 <rect x="82" y="27" width="38" height="9" rx="5" fill="#112433"/><circle cx="114" cy="31" r="2" fill="#507488"/>
 <path d="M76 39h-7v48" fill="none" stroke="#bce6ed" opacity=".28" stroke-width="3"/>
 <rect x="88" y="160" width="28" height="3" rx="2" fill="#e8f3ec"/><path d="M151 66v17M53 54v13m0 9v14" stroke="#526775" stroke-width="3"/></g>`,
 pencilcase:`<path d="M25 98Q86 60 180 85l4 53q-13 29-136 20L23 140Z" fill="url(#case)" stroke="#255d64" stroke-width="2"/>
 <ellipse cx="102" cy="93" rx="80" ry="25" fill="#173d47"/><ellipse cx="102" cy="91" rx="73" ry="18" fill="#264e50"/>
 <g transform="rotate(-13 62 71)"><path d="M52 35h14v74H52Z" fill="#efb84c"/><path d="m52 35 7-18 7 18Z" fill="#d9c29b"/><path d="m56 25 3-8 3 8Z" fill="#35474a"/><path d="M61 39v67" stroke="#d88731" stroke-width="3"/></g>
 <g transform="rotate(8 91 68)"><rect x="82" y="31" width="13" height="78" rx="3" fill="#de715c"/><rect x="84" y="20" width="9" height="22" rx="4" fill="#bac4c6"/><path d="M91 35v36" stroke="#efbeab" stroke-width="2"/></g>
 <g transform="rotate(18 127 74)"><rect x="111" y="31" width="27" height="78" rx="2" fill="#d4b685"/><path d="M115 39h12m-12 9h7m-7 9h12m-12 9h7m-7 9h12m-12 9h7" stroke="#81765e" stroke-width="2"/></g>
 <g transform="rotate(-8 154 80)"><rect x="139" y="67" width="31" height="30" rx="5" fill="#ece9dc"/><path d="M139 84h31v10h-31Z" fill="#86a4b4"/></g>
 <path d="M23 96Q104 126 183 91l1 47q-13 29-136 20L23 140Z" fill="url(#case)"/>
 <path d="M28 107Q102 132 178 103" fill="none" stroke="#d6e1ca" stroke-width="4" stroke-dasharray="3 3"/>
 <path d="m168 111 4 15 10-3-6-13Z" fill="#d3a968"/><path d="M38 133Q99 153 166 130" fill="none" stroke="#9accba" opacity=".4"/>`
 };
 return `<svg viewBox="0 0 210 200" role="img" aria-label="${o.name} · 내용물이 보이는 비교 물건" data-everyday-object="${o.id}">${defs}<ellipse cx="105" cy="180" rx="73" ry="8" fill="#153955" opacity=".09"/>${bodies[o.kind]||''}</svg>`;
}
