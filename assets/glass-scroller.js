/* Floating "water drop" bubble: hold and pull up/down to scroll (speed grows with the pull, smooth acceleration, short glide on release). Fixed in place; frosted blur off while moving for smoothness; fades when idle. Double-tap = smooth to top; arrow lights up in the pull direction; long pages get a higher top speed. */
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
    '.clc-glass.up polyline:first-child,.clc-glass.down polyline:last-child{stroke:#B88A44;stroke-width:3}' + '.clc-glass.up polyline:last-child,.clc-glass.down polyline:first-child{opacity:.25}' +
    '@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.clc-glass{background:rgba(255,255,255,.85)}}' +
    '@media (prefers-reduced-motion:reduce){.clc-glass.drop{animation:none}}@media print{.clc-glass{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('div');
  b.className = 'clc-glass'; b.setAttribute('aria-hidden', 'true');
  b.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="7 9 12 4 17 9"/><polyline points="7 15 12 20 17 15"/></svg>';
  document.body.appendChild(b);
  /* Magnifying lens behind the drop (Chromium browsers: Chrome, Android, Edge). Safari keeps the plain glass look. */
  (function lens() {
    var chromium = !!window.chrome && !/iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!chromium) return;
    try {
      var N = 108, cv = document.createElement('canvas'); cv.width = cv.height = N;
      var cx = cv.getContext('2d'), img = cx.createImageData(N, N), c = N / 2, R = N / 2, MAG = 0.42;
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var dx = (x - c) / R, dy = (y - c) / R, d = Math.sqrt(dx * dx + dy * dy), i = (y * N + x) * 4;
        var k = d < 1 ? MAG * (1 - d * d) : 0;                   /* strongest in the middle, none at the rim */
        img.data[i] = 128 - dx * k * 127; img.data[i + 1] = 128 - dy * k * 127; img.data[i + 2] = 128; img.data[i + 3] = 255;
      }
      cx.putImageData(img, 0, 0);
      var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
      svg.innerHTML = '<filter id="clcLens" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
        '<feImage href="' + cv.toDataURL() + '" x="0" y="0" width="54" height="54" result="m" preserveAspectRatio="none"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="m" scale="30" xChannelSelector="R" yChannelSelector="G"/></filter>';
      document.body.appendChild(svg);
      var ls = document.createElement('style');
      ls.textContent = '.clc-glass:not(.moving){-webkit-backdrop-filter:url(#clcLens) saturate(1.7) contrast(1.12) brightness(1.08);backdrop-filter:url(#clcLens) saturate(1.7) contrast(1.12) brightness(1.08)}';
      document.head.appendChild(ls);
    } catch (_) {}
  })();
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Pull-to-scroll: hold the drop and pull. Small pull = slow, bigger pull = faster. Release = short glide. */
  var IDLE = 2500, DEAD = 6, PULL = 130, MINV = 90, MAXV = 2400, CURVE = 2.0, lastTap = 0, moved = false;
  var idle = null, dragging = false, y0 = 0, dy = 0, vel = 0, pos = 0, raf = 0, last = 0;
  b.style.bottom = 'auto';
  function centre() { b.style.top = Math.round(window.innerHeight / 2 - 27) + 'px'; }   /* fixed px: does not jump when the phone toolbar hides/shows */
  centre(); window.addEventListener('orientationchange', function () { setTimeout(centre, 300); });
  var html = document.documentElement;
  function hold() { html.style.scrollBehavior = 'auto'; }          /* page CSS uses smooth scrolling: switch it off while we move the page */
  function release() { html.style.scrollBehavior = ''; }               /* fixed spot: no repaint of a moving glass while the page scrolls */
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function speedFor(d) {
    var a = Math.abs(d); if (a <= DEAD) return 0;
    var p = Math.min(1, (a - DEAD) / PULL);
    var top = Math.max(1800, Math.min(4200, maxScroll() / 4));      /* long pages get a higher top speed */
    return (d < 0 ? -1 : 1) * (MINV + (top - MINV) * Math.pow(p, CURVE));
  }
  function frame(t) {
    raf = 0; var dt = last ? Math.min(50, t - last) : 16.7; last = t;
    if (dragging) vel += (speedFor(dy) - vel) * (1 - Math.exp(-dt / 120));   /* smooth acceleration */
    else { vel *= Math.exp(-dt / 220); if (Math.abs(vel) < 10) vel = 0; }
    if (vel) {
      pos = Math.max(0, Math.min(maxScroll(), pos + vel * dt / 1000));
      window.scrollTo(0, pos);                                  /* sub-pixel position: no 1px stutter at slow speed */
      if (pos <= 0 || pos >= maxScroll()) { vel = 0; if (!b.classList.contains('drop')) { b.classList.add('drop'); } }
    }
    if (dragging || vel) raf = requestAnimationFrame(frame);
    else { last = 0; b.classList.remove('moving'); release(); show(); }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function show() {
    if (maxScroll() < window.innerHeight * 0.6) { b.classList.remove('on'); return; }
    b.classList.add('on'); clearTimeout(idle);
    idle = setTimeout(function () { if (!dragging && !vel) b.classList.remove('on'); }, IDLE);
  }
  window.addEventListener('scroll', function () { if (!dragging && !vel) pos = window.scrollY; show(); }, { passive: true });
  b.addEventListener('pointerdown', function (e) {
    dragging = true; dy = 0; vel = 0; y0 = e.clientY; moved = false;
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (_) {} }   /* light tap feel on Android */
    pos = window.scrollY; window.scrollTo(0, Math.round(pos));   /* stop native momentum at once */
    b.classList.add('drag', 'moving'); hold();
    try { b.setPointerCapture(e.pointerId); } catch (_) {}
    clearTimeout(idle); e.preventDefault(); kick();
  });
  b.addEventListener('pointermove', function (e) {
    if (!dragging) return; dy = e.clientY - y0; if (Math.abs(dy) > DEAD) moved = true;
    b.classList.toggle('up', dy < -DEAD); b.classList.toggle('down', dy > DEAD);
    var r = Math.max(-40, Math.min(40, dy * 0.45));              /* drop stretches with the pull */
    b.style.transform = 'translate3d(0,' + r.toFixed(1) + 'px,0)';
  });
  function end() {
    if (!dragging) return; dragging = false; dy = 0; b.classList.remove('drag', 'up', 'down'); b.style.transform = '';
    var now = Date.now();
    if (!moved) { if (now - lastTap < 320) { vel = 0; release(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); lastTap = 0; } else lastTap = now; }
    b.classList.remove('drop'); void b.offsetWidth; b.classList.add('drop'); kick();
  }
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('lostpointercapture', end);
  pos = window.scrollY;
})();
