/*
 * Service worker Catatan Ojol
 * - App shell di-precache agar aplikasi bisa dibuka tanpa sinyal.
 * - Navigasi: network-first, jatuh ke index.html bila offline.
 * - Aset lain (termasuk CDN Tailwind dan Google Fonts): stale-while-revalidate.
 *
 * Setiap kali mengubah file aplikasi: naikkan VERSI dan perbarui daftar PRECACHE bila ada file baru.
 */
const VERSI = 'v1';
const CACHE_SHELL = `catatan-ojol-shell-${VERSI}`;
const CACHE_RUNTIME = `catatan-ojol-runtime-${VERSI}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './tailwind.config.js',
  './css/app.css',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './js/app.js',
  './js/store.js',
  './js/utils.js',
  './js/router.js',
  './js/pwa.js',
  './js/ekspor.js',
  './js/components/icons.js',
  './js/components/nav.js',
  './js/components/ui.js',
  './js/components/header.js',
  './js/components/baris.js',
  './js/pages/home.js',
  './js/pages/add.js',
  './js/pages/history.js',
  './js/pages/report.js',
  './js/pages/settings.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nama) =>
        Promise.all(
          nama
            .filter((n) => n.startsWith('catatan-ojol-') && n !== CACHE_SHELL && n !== CACHE_RUNTIME)
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  try {
    const respons = await fetch(request);
    const cache = await caches.open(CACHE_RUNTIME);
    cache.put(request, respons.clone());
    return respons;
  } catch {
    return (await caches.match(request)) || (await caches.match('./index.html')) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_RUNTIME);
  const tersimpan = await caches.match(request);
  const jaringan = fetch(request)
    .then((respons) => {
      if (respons && (respons.ok || respons.type === 'opaque')) cache.put(request, respons.clone());
      return respons;
    })
    .catch(() => tersimpan || Response.error());
  return tersimpan || jaringan;
}
