/* Optional reading view: the original article, links and disclosures stay in place. */
(() => {
  'use strict';
  const article = document.querySelector('main article.artc');
  const hero = document.querySelector('main .phero');
  if (!article || !hero || document.getElementById('clc-reader')) return;
  const hi = document.documentElement.lang.startsWith('hi');
  const words = hi ? {
    enter:'पढ़ने का मोड', exit:'सामान्य दृश्य', controls:'पढ़ने के विकल्प',
    smaller:'अक्षर छोटे करें', larger:'अक्षर बड़े करें', theme:'रंग',
    light:'हल्का', sepia:'सेपिया', dark:'गहरा', size:'अक्षर आकार'
  } : {
    enter:'Reading Mode', exit:'Exit Reading Mode', controls:'Reading options',
    smaller:'Decrease text size', larger:'Increase text size', theme:'Theme',
    light:'Light', sepia:'Sepia', dark:'Dark', size:'Text size'
  };
  const root = document.documentElement;
  let active = false, size = 20, theme = 'sepia';
  try {
    const saved = JSON.parse(localStorage.getItem('clc-reader-preferences') || '{}');
    if ([18,20,22,24,26].includes(saved.size)) size = saved.size;
    if (['light','sepia','dark'].includes(saved.theme)) theme = saved.theme;
  } catch (_) { /* Reading controls also work when storage is unavailable. */ }
  const bar = document.createElement('div');
  bar.id = 'clc-reader';
  bar.setAttribute('role','region');
  bar.setAttribute('aria-label',words.controls);
  bar.innerHTML = `<div class="reader-inner"><button type="button" class="reader-toggle" aria-pressed="false">${words.enter}</button><div class="reader-options" hidden><button type="button" data-size="down" aria-label="${words.smaller}">A−</button><output aria-live="polite" aria-label="${words.size}"></output><button type="button" data-size="up" aria-label="${words.larger}">A+</button><label>${words.theme} <select aria-label="${words.theme}"><option value="light">${words.light}</option><option value="sepia">${words.sepia}</option><option value="dark">${words.dark}</option></select></label></div></div>`;
  hero.after(bar);
  const toggle = bar.querySelector('.reader-toggle');
  const options = bar.querySelector('.reader-options');
  const select = bar.querySelector('select');
  const down = bar.querySelector('[data-size="down"]');
  const up = bar.querySelector('[data-size="up"]');
  function paint() {
    root.classList.toggle('clc-reading',active);
    root.dataset.readerTheme = theme;
    root.style.setProperty('--reader-size',size + 'px');
    toggle.textContent = active ? words.exit : words.enter;
    toggle.setAttribute('aria-pressed',String(active));
    options.hidden = !active;
    select.value = theme;
    bar.querySelector('output').textContent = size + 'px';
    down.disabled = size <= 18;
    up.disabled = size >= 26;
  }
  function save() {
    try { localStorage.setItem('clc-reader-preferences',JSON.stringify({size,theme})); } catch (_) {}
  }
  function setActive(value) {
    active = value;
    paint();
    // Keep the toggle in view when hiding/restoring the navigation changes layout.
    bar.scrollIntoView({block:'start',behavior:'instant'});
    toggle.focus({preventScroll:true});
  }
  toggle.addEventListener('click',() => setActive(!active));
  down.addEventListener('click',() => { size = Math.max(18,size-2); paint(); save(); });
  up.addEventListener('click',() => { size = Math.min(26,size+2); paint(); save(); });
  select.addEventListener('change',() => { theme = select.value; paint(); save(); });
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && active) { event.preventDefault(); setActive(false); }
  });
  paint();
  // Restore the reader view after a language change initiated by the audio selector.
  try {
    const raw=sessionStorage.getItem('clc-reader-language-return');
    if(raw){
      sessionStorage.removeItem('clc-reader-language-return');
      const state=JSON.parse(raw);
      if(state.path===location.pathname && state.reading===true){
        active=true;
        paint();
      }
    }
  }catch(_){}
})();
