/* Floating "liquid glass" scroll bubble: drag up/down to move through the page; fades out when idle. v2: smoother (rAF easing), clearer glass. */
(function () {
  if (window.__clcGlass) return; window.__clcGlass = true;
  var css = '.clc-glass{position:fixed;right:14px;top:0;left:auto;width:52px;height:52px;border-radius:50%;z-index:1000;will-change:transform,opacity;' +
    'background:radial-gradient(circle at 32% 26%,rgba(255,255,255,.75) 0,rgba(255,255,255,.18) 28%,rgba(255,255,255,.04) 60%,rgba(255,255,255,.10) 100%);' +
    '-webkit-backdrop-filter:blur(5px) saturate(210%) brightness(1.08);backdrop-filter:blur(5px) saturate(210%) brightness(1.08);' +
    'border:1px solid rgba(12,27,51,.14);' +
    'box-shadow:0 10px 28px rgba(10,22,44,.22),0 2px 6px rgba(10,22,44,.12),inset 0 2px 2px rgba(255,255,255,.95),inset 0 -10px 16px rgba(255,255,255,.22),inset 0 0 0 1.5px rgba(255,255,255,.7);' +
    'display:grid;place-items:center;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;' +
    'opacity:0;pointer-events:none;transition:opacity .4s ease,scale .25s ease,box-shadow .25s ease}' +
    '.clc-glass::after{content:"";position:absolute;left:22%;top:9%;width:46%;height:24%;border-radius:50%;background:linear-gradient(rgba(255,255,255,.85),rgba(255,255,255,0));pointer-events:none}' +
    '.clc-glass.on{opacity:1;pointer-events:auto}.clc-glass.drag{cursor:grabbing;scale:1.12;box-shadow:0 14px 34px rgba(10,22,44,.3),inset 0 2px 2px rgba(255,255,255,.95),inset 0 -10px 16px rgba(255,255,255,.26)}' +
    '.clc-glass svg{position:relative;width:20px;height:20px;stroke:#0C1B33;fill:none;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round;opacity:.8;filter:drop-shadow(0 1px 1px rgba(255,255,255,.9))}' +
    '@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.clc-glass{background:rgba(255,255,255,.88)}}' +
    '@media print{.clc-glass{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('div');
  b.className = 'clc-glass'; b.setAttribute('aria-hidden', 'true');
  b.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="7 9 12 4 17 9"/><polyline points="7 15 12 20 17 15"/></svg>';
  document.body.appendChild(b);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOP = 90, BOTTOM = 130, SIZE = 52, idle = null, dragging = false, offY = 0;
  var curY = TOP, tgtY = TOP, tgtScroll = null, raf = 0;
  function track() { return Math.max(1, window.innerHeight - TOP - BOTTOM - SIZE); }
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function yFromScroll() { var m = maxScroll(); return TOP + (m ? window.scrollY / m : 0) * track(); }
  function loop() {
    raf = 0; var k = reduce ? 1 : 0.28;
    curY += (tgtY - curY) * k;
    b.style.transform = 'translate3d(0,' + curY.toFixed(2) + 'px,0)';
    if (tgtScroll !== null) {
      var y = window.scrollY, d = tgtScroll - y;
      if (Math.abs(d) < 1) { window.scrollTo(0, tgtScroll); if (!dragging) tgtScroll = null; }
      else window.scrollTo(0, y + d * (reduce ? 1 : 0.22));
    }
    if (Math.abs(tgtY - curY) > 0.3 || tgtScroll !== null) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  function show() {
    if (maxScroll() < window.innerHeight * 0.6) { b.classList.remove('on'); return; }
    b.classList.add('on'); clearTimeout(idle);
    idle = setTimeout(function () { if (!dragging) b.classList.remove('on'); }, 1600);
  }
  window.addEventListener('scroll', function () { if (!dragging && tgtScroll === null) { tgtY = yFromScroll(); kick(); } show(); }, { passive: true });
  window.addEventListener('resize', function () { tgtY = yFromScroll(); kick(); });
  b.addEventListener('pointerdown', function (e) {
    dragging = true; b.classList.add('drag'); b.setPointerCapture(e.pointerId);
    document.documentElement.style.scrollBehavior = 'auto';
    offY = e.clientY - curY; clearTimeout(idle); e.preventDefault();
  });
  b.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    tgtY = Math.min(Math.max(e.clientY - offY, TOP), TOP + track());
    tgtScroll = ((tgtY - TOP) / track()) * maxScroll(); kick();
  });
  function end() { if (!dragging) return; dragging = false; b.classList.remove('drag'); show(); kick();
    setTimeout(function () { document.documentElement.style.scrollBehavior = ''; }, 600); }
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  curY = tgtY = yFromScroll(); b.style.transform = 'translate3d(0,' + curY + 'px,0)';
})();
