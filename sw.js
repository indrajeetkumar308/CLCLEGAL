/* CLC static PWA: bounded, privacy-aware offline cache.
   Network-first keeps legal information current; old CLC caches are removed on upgrade. */
const CACHE_VERSION = 'clc-v10-bounded';
const SHELL_CACHE = CACHE_VERSION + '-shell';
const PAGE_CACHE = CACHE_VERSION + '-pages';
const ASSET_CACHE = CACHE_VERSION + '-assets';
const MAX_PAGES = 12;
const MAX_ASSETS = 24;
const PRECACHE = [
  '/', '/hi/', '/assets/styles.css', '/assets/home-runtime.js',
  '/manifest.webmanifest', '/icons/icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const current = new Set([SHELL_CACHE, PAGE_CACHE, ASSET_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('clc-') && !current.has(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function cacheable(response) {
  const policy = response.headers.get('cache-control') || '';
  return response.ok && response.type !== 'opaque' &&
    !/\\b(?:no-store|private)\\b/i.test(policy);
}

async function store(cacheName, request, response, maxEntries) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  if (!maxEntries) return;
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - maxEntries))) {
    await cache.delete(key);
  }
}

function hasExtension(pathname, extensions) {
  return extensions.some(ext => pathname.toLowerCase().endsWith(ext));
}
function isStaticAsset(pathname) {
  if (pathname === '/assets/analytics.js') return false;
  if (pathname === '/manifest.webmanifest' || pathname === '/logo.png') return true;
  if (pathname.startsWith('/assets/fonts/')) return hasExtension(pathname, ['.woff2']);
  if (pathname.startsWith('/assets/')) return hasExtension(pathname, ['.css', '.js']);
  if (pathname.startsWith('/images/')) return hasExtension(pathname, ['.png', '.jpg', '.jpeg', '.webp']);
  if (pathname.startsWith('/icons/')) return hasExtension(pathname, ['.png']);
  return false;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const isHtml = (response.headers.get('content-type') || '').includes('text/html');
        // Do not persist search parameters or private/no-store responses.
        if (!url.search && isHtml && cacheable(response)) {
          const shell = url.pathname === '/' || url.pathname === '/hi/';
          event.waitUntil(store(shell ? SHELL_CACHE : PAGE_CACHE, request,
            response.clone(), shell ? 0 : MAX_PAGES));
        }
        return response;
      } catch (error) {
        const saved = await caches.match(request) ||
          await caches.match(url.pathname) ||
          await caches.match(url.pathname.startsWith('/hi/') ? '/hi/' : '/');
        if (saved) return saved;
        throw error;
      }
    })());
    return;
  }

  // Cache public static files only when requested; never pre-download the large app.js.
  if (!isStaticAsset(url.pathname)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (cacheable(response)) {
        event.waitUntil(store(ASSET_CACHE, request, response.clone(), MAX_ASSETS));
      }
      return response;
    } catch (error) {
      const saved = await caches.match(request, { ignoreSearch: true });
      if (saved) return saved;
      throw error;
    }
  })());
});
