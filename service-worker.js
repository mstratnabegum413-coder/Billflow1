/* Precaches the full app shell and serves it offline. ASSETS must list every shipped file.
   Bump CACHE whenever any listed file changes so visitors do not get stale copies.
   `npm run check` fails when this list and the files in "Web App" do not match. */
const CACHE = 'billflow-v6';
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'icon.svg',
  'js/config.js', 'js/invoice-calc.js', 'js/storage.js', 'js/backup.js', 'js/sample-data.js',
  'js/ui.js', 'js/state.js', 'js/sheet.js', 'js/router.js',
  'js/views/home.js', 'js/views/edit-items.js', 'js/views/edit.js', 'js/views/profile.js'
];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))); });
