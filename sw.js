// School service worker: app-shell cache + stale-while-revalidate for content,
// plus push notification + click handling. Versioned cache name lets old
// clients prune their shell on deploy.

const VERSION = 'v3';
const SHELL = [
  '/',
  '/index.html',
  '/assets/app.js',
  '/assets/data.js',
  '/assets/style.css',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('shell-' + VERSION).then(cache => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !k.endsWith(VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function shouldHandle(request) {
  const url = new URL(request.url);
  // Skip cross-origin (Supabase, Stripe, Groq, Resend) — never intercept those.
  if (url.origin !== self.location.origin) return false;
  // Skip backend proxy fetches (they're network-only, auth-bearer attached)
  if (url.pathname.startsWith('/api/')) return false;
  return request.method === 'GET';
}

self.addEventListener('fetch', (event) => {
  if (!shouldHandle(event.request)) return;
  const url = new URL(event.request.url);
  // Shell: cache-first
  if (SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.open('shell-' + VERSION).then(c => c.match(event.request).then(hit => hit || fetch(event.request)))
    );
    return;
  }
  // Module markdown / quiz JSON: stale-while-revalidate so offline visits work
  if (/\/(course[\w-]*)\/(modules|quizzes|videos|resources)\//.test(url.pathname) || url.pathname.endsWith('.md') || url.pathname.endsWith('.json')) {
    event.respondWith((async () => {
      const cache = await caches.open('content-' + VERSION);
      const cached = await cache.match(event.request);
      const networkPromise = fetch(event.request).then(res => {
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || networkPromise;
    })());
    return;
  }
  // Default: network, fall back to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Push notifications (P5.3)
self.addEventListener('push', (event) => {
  const data = (() => { try { return event.data ? event.data.json() : {}; } catch (_) { return { body: event.data && event.data.text() }; } })();
  const title = data.title || 'School';
  const opts = {
    body: data.body || '',
    icon: data.icon || undefined,
    badge: data.badge || undefined,
    data: { url: data.url || '/' },
    tag: data.tag || 'school'
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin)) { c.focus(); c.postMessage({ type: 'navigate', url }); return; }
      }
      return clients.openWindow(url);
    })
  );
});
