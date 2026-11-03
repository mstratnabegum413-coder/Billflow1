/* Precaches the full app shell and serves it offline. ASSETS must list every shipped file.
   Bump CACHE whenever any listed file changes so visitors do not get stale copies. */
const CACHE = 'billflow-v3';
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'icon.svg',
  'config.js', 'invoice-calc.js', 'storage.js', 'backup.js', 'sample-data.js',
  'ui.js', 'state.js', 'sheet.js', 'router.js',
  'home.js', 'edit.js', 'profile.js'
];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))); });
