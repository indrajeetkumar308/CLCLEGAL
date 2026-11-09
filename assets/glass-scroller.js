/* Floating "water drop" bubble. Tap or pull up: smooth scroll to top. Pull down: smooth scroll to bottom. Uses the browser's own smooth scrolling; the bubble never moves while the page scrolls. Fades when idle. */
(function () {
  if (window.__clcGlass) return; window.__clcGlass = true;
  var css = '.clc-glass{position:fixed;right:14px;top:0;left:auto;width:54px;height:54px;border-radius:50%;z-index:1000;will-change:transform,opacity;' +
    'background:radial-gradient(circle at 68% 78%,rgba(255,255,255,.55) 0,rgba(255,255,255,.12) 30%,rgba(255,255,255,0) 55%),rgba(255,255,255,.03);' +
    '-webkit-backdrop-filter:blur(1px) saturate(1.7) contrast(1.12) brightness(1.08);backdrop-filter:blur(1px) saturate(1.7) contrast(1.12) brightness(1.08);' +
    'box-shadow:inset 3px 4px 7px rgba(8,18,36,.28),inset -3px -5px 9px rgba(255,255,255,.85),inset 0 0 0 1px rgba(255,255,255,.35),0 7px 14px rgba(8,18,36,.20),0 1px 3px rgba(8,18,36,.18);' +
    'display:grid;place-items:center;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;' +
    'opacity:0;visibility:hidden;transition:opacity .45s ease,visibility 0s linear .45s,scale .3s cubic-bezier(.34,1.56,.64,1)}' +
    '.clc-glass::before{content:"";position:absolute;left:20%;top:16%;width:28%;height:17%;border-radius:50%;background:radial-gradient(rgba(255,255,255,1),rgba(255,255,255,.6) 45%,rgba(255,255,255,0) 72%);transform:rotate(-35deg);pointer-events:none}' +
    '.clc-glass::after{content:"";position:absolute;left:33%;top:36%;width:7%;height:7%;border-radius:50%;background:rgba(255,255,255,.9);pointer-events:none}' +
    '.clc-glass.on{opacity:1;visibility:visible;transition:opacity .2s ease,scale .3s cubic-bezier(.34,1.56,.64,1)}' +
    '.clc-glass.moving{-webkit-backdrop-filter:none;backdrop-filter:none;background:radial-gradient(circle at 68% 78%,rgba(255,255,255,.6) 0,rgba(255,255,255,.18) 35%,rgba(255,255,255,.08) 60%),rgba(255,255,255,.14)}.clc-glass.drag{cursor:grabbing;scale:1.1 1.04}' +
    '.clc-glass.drop{animation:clcDrop .55s cubic-bezier(.34,1.56,.64,1)}' +
    '@keyframes clcDrop{0%{scale:1.1 .9}45%{scale:.95 1.06}75%{scale:1.03 .98}100%{scale:1 1}}' +
    '.clc-glass svg{position:relative;width:18px;height:18px;stroke:#0C1B33;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;opacity:.5}' +
    '@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.clc-glass{background:rgba(255,255,255,.85)}}' +
    '@media (prefers-reduced-motion:reduce){.clc-glass.drop{animation:none}}@media print{.clc-glass{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('div');
  b.className = 'clc-glass'; b.setAttribute('aria-hidden', 'true');
  b.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="7 9 12 4 17 9"/><polyline points="7 15 12 20 17 15"/></svg>';
  document.body.appendChild(b);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IDLE = 2500, SWIPE = 12, idle = null, down = false, y0 = 0, pull = 0;
  b.style.top = 'auto'; b.style.bottom = '108px';               /* fixed spot above the WhatsApp button: never moves while the page scrolls */
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function show() {
    if (maxScroll() < window.innerHeight * 0.6) { b.classList.remove('on'); return; }
    b.classList.add('on'); clearTimeout(idle);
    idle = setTimeout(function () { if (!down) b.classList.remove('on'); }, IDLE);
  }
  function go(to) { /* browser-native smooth scrolling: as smooth as the phone itself */
    window.scrollTo({ top: to, behavior: reduce ? 'auto' : 'smooth' });
  }
  window.addEventListener('scroll', show, { passive: true });
  b.addEventListener('pointerdown', function (e) {
    down = true; y0 = e.clientY; pull = 0; b.classList.add('drag');
    try { b.setPointerCapture(e.pointerId); } catch (_) {}
    clearTimeout(idle); e.preventDefault();
  });
  b.addEventListener('pointermove', function (e) {
    if (!down) return;
    pull = e.clientY - y0;
    var r = Math.max(-36, Math.min(36, pull * 0.5));            /* rubber-band stretch */
    b.style.transform = 'translate3d(0,' + r.toFixed(1) + 'px,0)';
  });
  function end() {
    if (!down) return; down = false; b.classList.remove('drag'); b.style.transform = '';
    b.classList.remove('drop'); void b.offsetWidth; b.classList.add('drop');
    if (pull > SWIPE) go(maxScroll());                          /* pull down: go to the bottom (contact) */
    else go(0);                                                 /* tap or pull up: go to the top */
    show();
  }
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
})();
