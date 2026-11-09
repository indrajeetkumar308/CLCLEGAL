/* Floating "liquid glass" scroll bubble: drag up/down to move through the page; fades out when idle. v3: water-drop-on-glass look, eased motion, settle wobble. */
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
  var TOP = 90, BOTTOM = 130, SIZE = 54, idle = null, dragging = false, offY = 0;
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
  function end() { if (!dragging) return; dragging = false; b.classList.remove('drag'); b.classList.remove('drop'); void b.offsetWidth; b.classList.add('drop'); show(); kick();
    setTimeout(function () { document.documentElement.style.scrollBehavior = ''; }, 600); }
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  curY = tgtY = yFromScroll(); b.style.transform = 'translate3d(0,' + curY + 'px,0)';
})();
