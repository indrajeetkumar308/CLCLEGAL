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
