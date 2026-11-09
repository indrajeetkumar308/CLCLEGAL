/* Practice pages: show the first 4 insight cards (2x2 on desktop), with a button for the rest. */
(function () {
  var hi = (document.documentElement.lang || '').indexOf('hi') === 0;
  document.querySelectorAll('section').forEach(function (sec) {
    if (sec.classList.contains('clc-category-group')) return;
    var cards = Array.prototype.filter.call(sec.children, function (el) { return el.matches && el.matches('a.artcard'); });
    if (cards.length <= 4) return;
    var extra = cards.slice(4);
    extra.forEach(function (c) { c.classList.add('clc-more-hidden'); });
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'clc-more-btn'; btn.setAttribute('aria-expanded', 'false');
    btn.textContent = (hi ? 'और लेख देखें (' : 'More articles (') + extra.length + ')';
    btn.addEventListener('click', function () {
      extra.forEach(function (c) { c.classList.remove('clc-more-hidden'); });
      btn.setAttribute('aria-expanded', 'true'); btn.remove();
    });
    sec.appendChild(btn);
  });
})();
/* Our Process: reveal steps one after another when the section scrolls into view. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var lists = document.querySelectorAll('.steps');
  if (!lists.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('in'); io.unobserve(el);
      setTimeout(function () { el.classList.add('done'); }, 1200);   /* hover then reacts without delay */
    });
  }, { threshold: 0.2 });
  lists.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;          /* already visible on load: no animation */
    el.classList.add('js-steps'); io.observe(el);
  });
})();
