/* Floating "liquid glass" scroll bubble: drag up/down to move through the page; fades out when idle. v6: direct drag (page moves 4x finger) + fling momentum; light rendering while moving. */
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
  var TOP = 90, BOTTOM = 130, SIZE = 54, GAIN = 4, IDLE = 2500;
  var idle = null, dragging = false, raf = 0, last = 0;
  var pos = 0, pending = 0, lastY = 0, lastT = 0, fv = 0, vel = 0, grabOff = 0, fingerY = 0, curY = TOP;
  function track() { return Math.max(1, window.innerHeight - TOP - BOTTOM - SIZE); }
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function yFromScroll() { var m = maxScroll(); return TOP + (m ? window.scrollY / m : 0) * track(); }
  function paint(y) { curY = y; b.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; }
  function apply(d) { if (!d) return; pos = Math.max(0, Math.min(maxScroll(), pos + d)); window.scrollTo(0, Math.round(pos)); }
  function frame(t) {
    raf = 0; var dt = last ? Math.min(40, t - last) : 16; last = t;
    if (dragging) { apply(pending * GAIN); pending = 0; paint(Math.max(TOP, Math.min(TOP + track(), fingerY - grabOff))); }
    else {
      if (vel) { apply(vel * dt / 1000); vel *= Math.pow(0.94, dt / 16); if (Math.abs(vel) < 20 || pos <= 0 || pos >= maxScroll()) vel = 0; }
      var to = yFromScroll(); paint(reduce ? to : curY + (to - curY) * Math.min(1, dt / 70));
      if (!vel && Math.abs(to - curY) < 0.4) { b.classList.remove('moving'); last = 0; return; }
    }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function show() {
    if (maxScroll() < window.innerHeight * 0.6) { b.classList.remove('on'); return; }
    b.classList.add('on'); clearTimeout(idle);
    idle = setTimeout(function () { if (!dragging && !vel) b.classList.remove('on'); }, IDLE);
  }
  window.addEventListener('scroll', function () { if (!dragging && !vel) { pos = window.scrollY; kick(); } show(); }, { passive: true });
  window.addEventListener('resize', kick);
  b.addEventListener('pointerdown', function (e) {
    dragging = true; vel = 0; pending = 0; fv = 0;
    pos = window.scrollY; window.scrollTo(0, Math.round(pos));   /* stop native momentum at once */
    lastY = fingerY = e.clientY; lastT = performance.now(); grabOff = e.clientY - curY;
    b.classList.add('drag', 'moving'); document.documentElement.style.scrollBehavior = 'auto';
    try { b.setPointerCapture(e.pointerId); } catch (_) {}
    clearTimeout(idle); e.preventDefault(); kick();
  });
  b.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var now = performance.now(), d = e.clientY - lastY, dt = Math.max(1, now - lastT);
    pending += d; fingerY = e.clientY;
    fv = 0.7 * (d / dt * 1000) + 0.3 * fv;                       /* smoothed finger speed, px/s */
    lastY = e.clientY; lastT = now; kick();
  });
  function end() {
    if (!dragging) return; dragging = false; b.classList.remove('drag');
    if (performance.now() - lastT < 80) vel = fv * GAIN;          /* fling: keep gliding */
    b.classList.remove('drop'); void b.offsetWidth; b.classList.add('drop'); show(); kick();
    setTimeout(function () { document.documentElement.style.scrollBehavior = ''; }, 1500);
  }
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('lostpointercapture', end);
  pos = window.scrollY; paint(yFromScroll());
})();
