/* Floating "liquid glass" scroll bubble: drag up/down to move through the page; fades out when idle. */
(function () {
  if (window.__clcGlass) return; window.__clcGlass = true;
  var css = '.clc-glass{position:fixed;right:14px;top:0;width:46px;height:46px;border-radius:50%;z-index:1000;' +
    'background:rgba(255,255,255,.22);-webkit-backdrop-filter:blur(14px) saturate(180%);backdrop-filter:blur(14px) saturate(180%);' +
    'border:1px solid rgba(255,255,255,.55);box-shadow:0 8px 24px rgba(10,22,44,.28),inset 0 1px 1px rgba(255,255,255,.7),inset 0 -6px 12px rgba(255,255,255,.12);' +
    'display:grid;place-items:center;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;' +
    'opacity:0;pointer-events:none;transition:opacity .35s ease,transform .2s ease}' +
    '.clc-glass.on{opacity:1;pointer-events:auto}.clc-glass.drag{cursor:grabbing;transform:scale(1.08)}' +
    '.clc-glass svg{width:20px;height:20px;stroke:#0C1B33;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;opacity:.85}' +
    '@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.clc-glass{background:rgba(255,255,255,.85)}}' +
    '@media (prefers-reduced-motion:reduce){.clc-glass{transition:none}}@media print{.clc-glass{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('div');
  b.className = 'clc-glass'; b.setAttribute('aria-hidden', 'true');
  b.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="7 9 12 4 17 9"/><polyline points="7 15 12 20 17 15"/></svg>';
  document.body.appendChild(b);
  var TOP = 90, BOTTOM = 130, idle = null, dragging = false, offY = 0;
  function track() { return Math.max(1, window.innerHeight - TOP - BOTTOM - 46); }
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function place() { var m = maxScroll(); var p = m ? window.scrollY / m : 0; b.style.top = (TOP + p * track()) + 'px'; }
  function show() {
    if (maxScroll() < window.innerHeight * 0.6) { b.classList.remove('on'); return; }
    b.classList.add('on'); clearTimeout(idle);
    idle = setTimeout(function () { if (!dragging) b.classList.remove('on'); }, 1500);
  }
  window.addEventListener('scroll', function () { if (!dragging) place(); show(); }, { passive: true });
  window.addEventListener('resize', place);
  b.addEventListener('pointerdown', function (e) {
    dragging = true; b.classList.add('drag'); document.documentElement.style.scrollBehavior = 'auto'; b.setPointerCapture(e.pointerId);
    offY = e.clientY - b.getBoundingClientRect().top; clearTimeout(idle); e.preventDefault();
  });
  b.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var y = Math.min(Math.max(e.clientY - offY, TOP), TOP + track());
    b.style.top = y + 'px';
    window.scrollTo({ top: ((y - TOP) / track()) * maxScroll(), behavior: 'auto' });
  });
  function end() { if (!dragging) return; dragging = false; b.classList.remove('drag'); document.documentElement.style.scrollBehavior = ''; show(); }
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  place();
})();
