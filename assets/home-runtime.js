/* CLC Legal homepage: small controller for pre-rendered EN/HI pages.
   Do not include practice-area data or re-render already-present HTML. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const hi = document.documentElement.lang.toLowerCase().startsWith('hi');
  const WA = 'https://wa.me/916204166690';
  let analyticsInjected = false;
  const words = hi ? {
    copy:'कॉपी',copied:'कॉपी किया',selected:'चयनित',
    invalid:'नाम, सही मोबाइल नंबर और सहमति आवश्यक हैं।',
    ready:'नाम, मोबाइल नंबर और स्वीकृति आवश्यक हैं।',
    title:'चौधरी लॉ चैम्बर्स — विधिक जानकारी',
    name:'नाम',phone:'मोबाइल',topic:'मामला',court:'न्यायालय / ज़िला',
    message:'संक्षिप्त विवरण',done:'WhatsApp पर संदेश तैयार है। भेजने से पहले जाँच लें।',
    open:'WhatsApp में खोलें',edit:'संपादित करें'
  } : {
    copy:'Copy',copied:'Copied',selected:'Selected',
    invalid:'Enter your name and a valid mobile number, and accept the acknowledgement.',
    ready:'Name, mobile number and the acknowledgement are required.',
    title:'Choudhary Law Chambers — enquiry',
    name:'Name',phone:'Mobile',topic:'Matter concerns',court:'Court / district',
    message:'Brief description',done:'Your WhatsApp message is ready. Review it before sending.',
    open:'Open WhatsApp',edit:'Edit details'
  };

  // Keyboard access: skip navigation, with a focus target in the existing page.
  const header = $('#hdr'), main = $('#app');
  if (header && main && !$('.clc-skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'clc-skip-link';
    skip.href = '#app';
    skip.textContent = hi ? 'मुख्य सामग्री पर जाएँ' : 'Skip to main content';
    header.before(skip);
    skip.addEventListener('click', () => {
      main.tabIndex = -1;
      main.focus({preventScroll:true});
    });
  }

  // BCI information gate: retain existing acknowledgement and keyboard trap.
  const gate = $('#gate'), ack = $('#gate-ck'), enter = $('#gate-go');
  const backgroundInert = value => {
    for (const element of [header,main,$('.clc-skip-link')])
      if (element) element.inert = value;
  };
  if (gate && ack && enter) {
    ack.addEventListener('change', () => { enter.disabled = !ack.checked; });
    enter.addEventListener('click', () => {
      try { sessionStorage.setItem('clc-gate','1'); } catch (_) {}
      document.documentElement.classList.add('gate-ok');
      gate.hidden = true;
      document.body.style.overflow = '';
      backgroundInert(false);
      if (main) {main.tabIndex = -1; main.focus({preventScroll:true});}
      startAnalytics();
    });
    let accepted = false;
    try { accepted = sessionStorage.getItem('clc-gate') === '1'; } catch (_) {}
    if (accepted) { gate.hidden = true; backgroundInert(false); }
    else {
      document.body.style.overflow = 'hidden';
      backgroundInert(true);
      ack.focus({preventScroll:true});
    }
    document.addEventListener('keydown', event => {
      if (event.key !== 'Tab' || gate.hidden) return;
      const controls = $$ ( '#gate a[href],#gate button:not(:disabled),#gate input:not(:disabled)' )
        .filter(el => !el.hidden && !el.closest('[hidden]'));
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length-1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();first.focus();
      }
    });
  }

  // Menu and nested Practice Areas: keep outside-tap and Escape behavior.
  const menu = $('#menu'), links = $('#links'), drop = $('#dd'), dropButton = $('#dd-btn');
  const closeMenu = () => {
    if (links) links.classList.remove('open');
    if (menu) menu.setAttribute('aria-expanded','false');
    if (drop) drop.classList.remove('open');
    if (dropButton) dropButton.setAttribute('aria-expanded','false');
  };
  if (drop && dropButton) {
    dropButton.addEventListener('click',e => {
      e.stopPropagation();
      const open = drop.classList.toggle('open');
      dropButton.setAttribute('aria-expanded',String(open));
    });
  }
  if (menu && links) {
    menu.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
      if (!open && drop) {drop.classList.remove('open');dropButton.setAttribute('aria-expanded','false');}
    });
    const outside = e => {
      if (links.classList.contains('open')) {
        if (links.contains(e.target) || menu.contains(e.target)) return;
        closeMenu();
      } else if (drop && drop.classList.contains('open') && !drop.contains(e.target)) {
        drop.classList.remove('open');
        dropButton.setAttribute('aria-expanded','false');
      }
    };
    document.addEventListener('pointerdown',outside);
    document.addEventListener('click',outside);
  }
  document.addEventListener('keydown',e => {
    if (e.key !== 'Escape') return;
    const mobileOpen = links?.classList.contains('open');
    const dropdownOpen = drop?.classList.contains('open');
    if (mobileOpen || dropdownOpen) {
      e.preventDefault();
      const target = dropdownOpen && (!mobileOpen || drop.contains(document.activeElement)) ? dropButton : menu;
      closeMenu();
      target?.focus();
    }
  });
  const navState = () => {
    const hash=location.hash.slice(1);
    $$('[data-nav]').forEach(a => {
      a.classList.toggle('on',a.dataset.nav === (hash || 'home'));
    });
    closeMenu();
  };
  window.addEventListener('hashchange',navState);
  $$('.lang a').forEach(a => a.addEventListener('click', () => {
    try {localStorage.setItem('clc-lang',a.dataset.lang);}catch (_){}
  }));

  // Copy phone/email in contact section without transmitting user information.
  $$('.copy[data-copy]').forEach(button => button.addEventListener('click',async () => {
    const el = document.getElementById(button.dataset.copy);
    if (!el) return;
    const value = el.textContent.trim();
    let copied=false;
    try {if(navigator.clipboard){await navigator.clipboard.writeText(value);copied=true;}}catch (_){}
    if (!copied) {
      const range = document.createRange();range.selectNodeContents(el);
      const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);
      button.textContent=words.selected;
    } else button.textContent=words.copied;
    setTimeout(()=>{button.textContent=words.copy;},1800);
  }));

  // Existing user-initiated WhatsApp enquiry form: local preparation only.
  const form = $('#intake');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const value = id => {const el=$(id);return el?el.value.trim():'';};
    const name=value('#q-name'), phone=value('#q-phone');
    const ok=$('#q-ack')?.checked, error=$('#q-err');
    if (!name || !/^[0-9+\s-]{10,15}$/.test(phone) || !ok) {
      if (error){error.textContent=words.invalid;error.style.color='var(--gold)';}
      return;
    }
    if (error){error.textContent=words.ready;error.style.color='';}
    const parts=[ '*' + words.title + '*','',words.name+': '+name,words.phone+': '+phone,
      words.topic+': '+value('#q-topic') ];
    if(value('#q-court'))parts.push(words.court+': '+value('#q-court'));
    if(value('#q-msg'))parts.push('',words.message+': '+value('#q-msg'));
    const href=WA+'?text='+encodeURIComponent(parts.join('\n'));
    try {window.open(href,'_blank','noopener');}catch (_){}
    let completed=$('#q-done');
    if (!completed) {
      completed=document.createElement('div');
      completed.id='q-done';completed.className='ok';form.append(completed);
    }
    completed.textContent='';
    const info=document.createElement('p');info.textContent=words.done;
    const actions=document.createElement('div');
    actions.style.cssText='display:flex;gap:10px;flex-wrap:wrap';
    const anchor=document.createElement('a');
    anchor.href=href;anchor.target='_blank';anchor.rel='noopener';
    anchor.className='btn btn-wa';anchor.textContent=words.open;
    const edit=document.createElement('button');edit.type='button';
    edit.className='btn btn-outline';edit.textContent=words.edit;
    actions.append(anchor,edit);completed.append(info,actions);
    const fields=$$('#intake .f,#intake .ck,#intake .ff,#intake .sub');
    fields.forEach(el=>el.hidden=true);
    edit.addEventListener('click',()=>{
      fields.forEach(el=>el.hidden=false);completed.remove();
    });
  });

  // Safari iPhone Home Screen guidance matches the existing full-site behavior.
  const ua=navigator.userAgent || '';
  const isiOS=/iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  const standalone=window.matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
  if (isiOS && !standalone && !$('#clc-ios-install')) {
    const button=document.createElement('button'), popup=document.createElement('aside');
    button.type='button';button.id='clc-ios-install';
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','clc-ios-help');
    button.textContent=hi?'iPhone पर ऐप जोड़ें':'Install on iPhone';
    popup.id='clc-ios-help';popup.hidden=true;
    popup.setAttribute('aria-label','iPhone Home Screen installation instructions');
    popup.innerHTML=hi
      ? '<button type="button" aria-label="बंद करें">×</button><h2>iPhone पर CLC ऐप जोड़ें</h2><p>Safari में वेबसाइट खोलें, फिर:</p><ol><li>नीचे Share (शेयर) आइकन दबाएँ।</li><li><strong>Add to Home Screen</strong> चुनें।</li><li>यदि विकल्प उपलब्ध हो तो <strong>Open as Web App</strong> चालू रखें, फिर <strong>Add</strong> दबाएँ।</li></ol><p>यह वेबसाइट का होम-स्क्रीन वेब ऐप है, App Store से डाउनलोड नहीं।</p>'
      : '<button type="button" aria-label="Close">×</button><h2>Install CLC on iPhone</h2><p>Open this website in Safari, then:</p><ol><li>Tap Share.</li><li>Select <strong>Add to Home Screen</strong>.</li><li>If shown, keep <strong>Open as Web App</strong> enabled, then tap <strong>Add</strong>.</li></ol><p>This installs a Home Screen web app, not an App Store application.</p>';
    document.body.append(button,popup);
    const close = () => {popup.hidden=true;button.setAttribute('aria-expanded','false');};
    button.addEventListener('click',()=>{const opened=popup.hidden;popup.hidden=!opened;button.setAttribute('aria-expanded',String(opened));});
    popup.querySelector('button').addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    document.addEventListener('pointerdown',e=>{
      if (!popup.hidden && !popup.contains(e.target) && e.target!==button)close();
    });
  }

  // Consent manager executes after initial document loading (not a render blocker).
  const startAnalytics = () => {
    if (analyticsInjected) return;
    analyticsInjected = true;
    const tag=document.createElement('script');
    tag.src='/assets/analytics.js?v=20261030a';
    tag.async=true;document.head.appendChild(tag);
  };
  const afterLoad = () => {if (!gate || gate.hidden) startAnalytics();};
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load',afterLoad,{once:true});
})();
