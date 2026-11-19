/* Service worker PWA «Жирафик».
   - навігація (HTML): спочатку мережа, офлайн — кеш останньої успішної відповіді;
   - статика /_expo/**, /icons/**, шрифти, зображення: cache-first з фоновим оновленням;
   - /api/** та запити до бекенду: тільки мережа (кешуємо нічого, дані актуальні). */

const CACHE = 'giraffe-pwa-v1';
const API_ORIGIN = 'https://giraffe-teplyk.vercel.app';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/', '/manifest.webmanifest']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isApi(url) {
  return url.pathname.startsWith('/api/') || url.origin === API_ORIGIN;
}

function isStatic(url) {
  return (
    url.pathname.startsWith('/_expo/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|gif|json|webmanifest)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isApi(url)) return; // мережа, без кешу

  // Навігація: network-first із офлайн-фолбеком на закешовану сторінку.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/'))),
    );
    return;
  }

  // Статика: cache-first + фонове оновлення (stale-while-revalidate).
  if (isStatic(url) && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => hit);
        return hit || network;
      }),
    );
  }
});
