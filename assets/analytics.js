/* CLC Legal: privacy-first, opt-in GA4 pageview tracking. */
(() => {
  'use strict';
  const measurementId = 'G-1NV6MN3JJ5';
  const preferenceKey = 'clc-ga4-consent-v1';
  const hindi = (document.documentElement.lang || '').toLowerCase().startsWith('hi');
  const internalKey = 'clc-internal';
  // Read and consume the device switch before consulting stored GA consent.
  // Keep unrelated query parameters and the URL fragment intact.
  let internalDevice = false;
  let internalSwitch = null;
  try {
    const url = new URL(location.href);
    internalSwitch = url.searchParams.get('internal');
    if (internalSwitch === '1' || internalSwitch === '0') {
      url.searchParams.delete('internal');
      try { history.replaceState(history.state, '', url.pathname + url.search + url.hash); } catch (_) {}
    }
  } catch (_) { /* Malformed location or blocked history: do not interrupt consent. */ }
  // An explicit ?internal=1 must disable tracking even when storage is unavailable.
  internalDevice = internalSwitch === '1';
  try {
    if (internalSwitch === '1') localStorage.setItem(internalKey, '1');
    else if (internalSwitch === '0') localStorage.removeItem(internalKey);
    if (internalSwitch !== '0') internalDevice = internalDevice || localStorage.getItem(internalKey) === '1';
  } catch (_) { /* Private browsing can disallow localStorage. */ }
  const copy = hindi ? {
    message: 'क्या आप वेबसाइट उपयोग के आँकड़े एकत्र करने की अनुमति देते हैं? Google Analytics केवल आपकी सहमति के बाद चालू होगा। विज्ञापन ट्रैकिंग बंद रखी गई है।',
    allow: 'अनुमति दें', reject: 'अस्वीकार करें', settings: 'Analytics सेटिंग्स'
  } : {
    message: 'Allow optional website-usage analytics? Google Analytics starts only after your consent. Advertising tracking is disabled.',
    allow: 'Allow analytics', reject: 'Decline', settings: 'Analytics settings'
  };

  function getChoice() {
    try { return localStorage.getItem(preferenceKey); } catch (_) { return null; }
  }
  function saveChoice(value) {
    try { localStorage.setItem(preferenceKey, value); } catch (_) { /* storage unavailable */ }
  }
  function startAnalytics() {
    if (internalDevice || window.__clcGa4Started) return;
    window.__clcGa4Started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    // Never send query-string parameters or fragments that might contain case/client data.
    window.gtag('event', 'page_view', {
      page_location: location.origin + location.pathname,
      page_title: document.title,
      page_referrer: ''
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }
  function removeGaCookies() {
    document.cookie.split(';').forEach((part) => {
      const name = part.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
      document.cookie = name + '=; Max-Age=0; path=/; domain=.clclegal.in; SameSite=Lax';
    });
  }
  function displayChoice() {
    if (document.getElementById('clc-analytics-consent')) return;
    const panel = document.createElement('section');
    panel.id = 'clc-analytics-consent';
    panel.setAttribute('aria-label', copy.settings);
    panel.style.cssText = 'position:fixed;z-index:2147483647;bottom:12px;left:12px;right:12px;max-width:540px;margin:auto;background:#0e2240;color:#fff;padding:16px;border-radius:10px;box-shadow:0 4px 24px #0006;font:15px/1.5 sans-serif';
    const message = document.createElement('p');
    message.textContent = copy.message;
    message.style.margin = '0 0 12px';
    panel.appendChild(message);
    const notice = document.createElement('a');
    notice.href = hindi ? '/hi/privacy/' : '/privacy/';
    notice.textContent = hindi ? 'एनालिटिक्स सूचना पढ़ें' : 'Read analytics notice';
    notice.style.cssText = 'display:block;color:#fff;text-decoration:underline;margin-bottom:12px;font-size:13px';
    panel.appendChild(notice);
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
    function addButton(label, allowed) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.cssText = 'padding:8px 14px;border-radius:6px;cursor:pointer;border:1px solid #fff;background:' + (allowed ? '#fff' : 'transparent') + ';color:' + (allowed ? '#0e2240' : '#fff') + ';font:inherit';
      btn.addEventListener('click', () => {
        const old = getChoice();
        saveChoice(allowed ? 'yes' : 'no');
        panel.remove();
        if (allowed) startAnalytics();
        else if (old === 'yes') {
          if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
          removeGaCookies();
          location.reload();
        }
      });
      controls.appendChild(btn);
    }
    addButton(copy.allow, true);
    addButton(copy.reject, false);
    panel.appendChild(controls);
    document.body.appendChild(panel);
  }
  function addPreferenceControl() {
    const footer = document.querySelector('footer');
    if (!footer || document.getElementById('clc-analytics-settings')) return;
    const link = document.createElement('button');
    link.type = 'button';
    link.id = 'clc-analytics-settings';
    link.textContent = copy.settings;
    link.style.cssText = 'display:inline-block;margin:8px;color:inherit;background:none;border:0;text-decoration:underline;font:inherit;cursor:pointer';
    link.addEventListener('click', displayChoice);
    footer.appendChild(link);
    const notice = document.createElement('a');
    notice.href = hindi ? '/hi/privacy/' : '/privacy/';
    notice.textContent = hindi ? 'एनालिटिक्स सूचना' : 'Analytics notice';
    notice.style.cssText = 'display:inline-block;margin:8px;color:inherit;text-decoration:underline;font:inherit';
    footer.appendChild(notice);
  }
  if (internalDevice) {
    const footer = document.querySelector('footer');
    if (footer && !document.getElementById('clc-internal-note')) {
      const note = document.createElement('small');
      note.id = 'clc-internal-note';
      note.textContent = hindi ? 'इस डिवाइस पर एनालिटिक्स बंद (आंतरिक)' : 'Analytics off on this device (internal)';
      note.style.cssText = 'display:block;margin:6px 8px;font-size:12px;line-height:1.5;opacity:.7';
      footer.appendChild(note);
    }
  }
  if (getChoice() === 'yes') startAnalytics();
  else if (getChoice() !== 'no') displayChoice();
  addPreferenceControl();
})();
