/* Floating "liquid glass" scroll bubble: drag up/down to move through the page; fades out when idle. v5: pull-to-scroll takes over native momentum immediately; float position accumulator; minimum speed; (speed grows with pull distance), frame-time based easing, momentum glide; water-drop look. */
(function () {
  if (window.__clcGlass) return; window.__clcGlass = true;
  var css = '.clc-glass{position:fixed;right:14px;top:0;left:auto;width:54px;height:54px;border-radius:50%;z-index:1000;will-change:transform,opacity;' +
    'background:radial-gradient(circle at 68% 78%,rgba(255,255,255,.55) 0,rgba(255,255,255,.12) 30%,rgba(255,255,255,0) 55%),rgba(255,255,255,.03);' +
    '-webkit-backdrop-filter:blur(1px) saturate(1.7) contrast(1.12) brightness(1.08);backdrop-filter:blur(1px) saturate(1.7) contrast(1.12) brightness(1.08);' +
    'box-shadow:inset 3px 4px 7px rgba(8,18,36,.28),inset -3px -5px 9px rgba(255,255,255,.85),inset 0 0 0 1px rgba(255,255,255,.35),0 7px 14px rgba(8,18,36,.20),0 1px 3px rgba(8,18,36,.18);' +
    'display:grid;place-items:center;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;' +
    'opacity:0;pointer-events:none;transition:opacity .4s ease,scale .3s cubic-bezier(.34,1.56,.64,1)}' +
    '.clc-glass::before{content:"";position:absolute;left:20%;top:16%;width:28%;height:17%;border-radius:50%;background:radial-gradient(rgba(255,255,255,1),rgba(255,255,255,.6) 45%,rgba(255,255,255,0) 72%);transform:rotate(-35deg);pointer-events:none}' +
    '.clc-glass::after{content:"";position:absolute;left:33%;top:36%;width:7%;height:7%;border-radius:50%;background:rgba(255,255,255,.9);pointer-events:none}' +
    '.clc-glass.on{opacity:1;pointer-events:auto}.clc-glass.drag{cursor:grabbing;scale:1.1 1.04}' +
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
  var TOP = 90, BOTTOM = 130, SIZE = 54, PULL = 110, MAXV = 2800, MINV = 260, DEAD = 4; /* px/s */
  var idle = null, dragging = false, startY = 0, dy = 0, vel = 0, last = 0, raf = 0, pos = 0;
  var baseY = TOP, curY = TOP;
  function track() { return Math.max(1, window.innerHeight - TOP - BOTTOM - SIZE); }
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function yFromScroll() { var m = maxScroll(); return TOP + (m ? window.scrollY / m : 0) * track(); }
  function paint(y) { curY = y; b.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; }
  function frame(t) {
    raf = 0; var dt = last ? Math.min(48, t - last) : 16; last = t;
    if (dragging) {
      var a = Math.abs(dy), target = 0;
      if (a > DEAD) { var p = Math.min(1, (a - DEAD) / PULL); target = (dy < 0 ? -1 : 1) * (MINV + (MAXV - MINV) * Math.pow(p, 1.6)); }
      vel += (target - vel) * Math.min(1, dt / 55);            /* quick, smooth acceleration */
    } else {
      vel *= Math.pow(0.86, dt / 16);                          /* glide to a stop */
      if (Math.abs(vel) < 8) vel = 0;
    }
    if (vel) { pos = Math.max(0, Math.min(maxScroll(), pos + vel * dt / 1000)); window.scrollTo(0, Math.round(pos)); }
    else if (!dragging) pos = window.scrollY;
    baseY = yFromScroll();
    var shown = dragging ? baseY + Math.max(-PULL, Math.min(PULL, dy)) * 0.45 : baseY;
    paint(reduce ? shown : curY + (shown - curY) * Math.min(1, dt / 60));
    if (dragging || vel || Math.abs(shown - curY) > 0.3) raf = requestAnimationFrame(frame); else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function show() {
    if (maxScroll() < window.innerHeight * 0.6) { b.classList.remove('on'); return; }
    b.classList.add('on'); clearTimeout(idle);
    idle = setTimeout(function () { if (!dragging) b.classList.remove('on'); }, 1600);
  }
  window.addEventListener('scroll', function () { kick(); show(); }, { passive: true });
  window.addEventListener('resize', kick);
  b.addEventListener('pointerdown', function (e) {
    dragging = true; dy = 0; vel = 0; startY = e.clientY; b.classList.add('drag');
    pos = window.scrollY; window.scrollTo(0, Math.round(pos)); /* stop any native momentum so the bubble takes over at once */
    try { b.setPointerCapture(e.pointerId); } catch (_) {}
    document.documentElement.style.scrollBehavior = 'auto'; clearTimeout(idle); e.preventDefault(); kick();
  });
  b.addEventListener('pointermove', function (e) { if (dragging) { dy = e.clientY - startY; kick(); } });
  function end() {
    if (!dragging) return; dragging = false; dy = 0; b.classList.remove('drag');
    b.classList.remove('drop'); void b.offsetWidth; b.classList.add('drop'); show(); kick();
    setTimeout(function () { document.documentElement.style.scrollBehavior = ''; }, 900);
  }
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  b.addEventListener('lostpointercapture', end);
  paint(yFromScroll());
})();
