export function createAvatar(container) {
  const rigId = `rig-${Math.random().toString(36).slice(2)}`;
  container.innerHTML = `<svg class="teacher-rig" viewBox="0 0 1024 1536" role="img" aria-label="안경을 쓴 MSG 과학 선생님 만화 캐릭터">
    <defs>
      <linearGradient id="${rigId}-skin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffcda9"/><stop offset="1" stop-color="#ffceab"/></linearGradient>
      <radialGradient id="${rigId}-edge"><stop offset=".76" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient>
      <mask id="${rigId}-patch"><ellipse cx="502" cy="459" rx="82" ry="35" fill="url(#${rigId}-edge)"/></mask>
      <clipPath id="${rigId}-eyeL"><path d="M365 377 C363 324 455 326 459 373 Q463 415 412 415 Q372 416 365 377Z"/></clipPath>
      <clipPath id="${rigId}-eyeR"><path d="M533 365 C536 313 619 316 625 359 Q628 402 578 405 Q540 407 533 365Z"/></clipPath>
      <mask id="${rigId}-browpatch"><ellipse cx="405" cy="296" rx="65" ry="28" fill="url(#${rigId}-edge)"/></mask>
    </defs>
    <image href="./assets/teacher-neutral.png" width="1024" height="1536"/>
    <g class="mouth-rig">
      <rect x="415" y="423" width="180" height="74" fill="url(#${rigId}-skin)" mask="url(#${rigId}-patch)"/>
      <g class="mouth-shape" data-shape="closed"><path class="closed-smile" d="M449 456 Q500 483 557 447" fill="none" stroke="#682e1c" stroke-width="5" stroke-linecap="round"/><path class="closed-listen" d="M468 457 Q503 467 538 452" fill="none" stroke="#682e1c" stroke-width="5" stroke-linecap="round"/></g>
      <g class="mouth-shape" data-shape="half"><path d="M453 451 Q503 466 552 446 Q540 481 504 482 Q469 482 453 451Z" fill="#642924" stroke="#56261c" stroke-width="3"/><path d="M462 454 Q506 466 547 450 L542 461 Q502 474 466 461Z" fill="#fffaf0"/><path d="M482 478 Q506 465 528 478" fill="#e8888f"/></g>
      <g class="mouth-shape" data-shape="open"><path d="M450 444 Q503 462 555 439 Q552 493 505 497 Q467 496 450 444Z" fill="#642924" stroke="#56261c" stroke-width="4"/><path d="M458 447 Q504 462 549 443 L545 459 Q504 474 465 460Z" fill="#fffaf0"/><path d="M479 489 Q508 471 535 484 Q509 504 479 489" fill="#e8888f"/></g>
      <g class="mouth-shape" data-shape="round"><ellipse cx="506" cy="466" rx="21" ry="28" fill="#642924" stroke="#56261c" stroke-width="4"/><path d="M490 480 Q508 467 525 481 Q512 498 490 480" fill="#e8888f"/></g>
    </g>
    <g class="question-brow"><rect x="332" y="260" width="150" height="76" fill="#ffd2ad" mask="url(#${rigId}-browpatch)"/><path d="M356 298 Q390 265 448 278 Q452 280 452 286 Q396 280 356 304Z" fill="#342b28"/></g>
    <g class="eyelids">
      <g clip-path="url(#${rigId}-eyeL)"><rect x="368" y="330" width="88" height="86" fill="#ffcda7"/><path d="M377 383 Q411 398 446 372" fill="none" stroke="#32231f" stroke-width="6" stroke-linecap="round"/></g>
      <g clip-path="url(#${rigId}-eyeR)"><rect x="535" y="321" width="90" height="87" fill="#fecaa6"/><path d="M542 374 Q578 388 611 362" fill="none" stroke="#32231f" stroke-width="6" stroke-linecap="round"/></g>
    </g>
    <g class="happy-eyes">
      <g clip-path="url(#${rigId}-eyeL)"><rect x="368" y="330" width="88" height="86" fill="#ffcda7"/><path d="M378 383 Q411 348 446 373" fill="none" stroke="#32231f" stroke-width="6" stroke-linecap="round"/></g>
      <g clip-path="url(#${rigId}-eyeR)"><rect x="535" y="321" width="90" height="87" fill="#fecaa6"/><path d="M542 374 Q578 338 611 362" fill="none" stroke="#32231f" stroke-width="6" stroke-linecap="round"/></g>
    </g>
  </svg>`;
  const svg = container.querySelector('svg');
  let mood = 'welcome', mouth = 'closed', nextBlink = performance.now() + 3600, blinkEnd = 0, frame, disposed = false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const paint = () => {
    svg.dataset.mood = mood;
    svg.dataset.mouth = reduce.matches ? 'closed' : mouth;
  };
  function tick(now) {
    if (disposed) return;
    if (!reduce.matches && !document.hidden) {
      if (now > nextBlink) { blinkEnd = now + 140; nextBlink = now + 3400 + Math.random() * 2300; }
      svg.classList.toggle('blinking', now < blinkEnd);
    } else { svg.classList.remove('blinking'); }
    frame = requestAnimationFrame(tick);
  }
  reduce.addEventListener('change', paint);
  paint(); frame = requestAnimationFrame(tick);
  return {
    setMood(value) { mood = value; paint(); },
    setMouth(value) { if (mouth !== value) { mouth = value; paint(); } },
    close() { mouth = 'closed'; paint(); },
    blink() { if (!reduce.matches) { blinkEnd = performance.now() + 160; nextBlink = performance.now() + 4000; } },
    destroy() { disposed = true; cancelAnimationFrame(frame); reduce.removeEventListener('change', paint); },
  };
}
