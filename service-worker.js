const CACHE_NAME = "orion-v3";

// 🔥 pega base correta automaticamente
const BASE = self.location.pathname.replace("/service-worker.js", "");

// 🔥 arquivos com caminho correto
const urlsToCache = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/css/style.css`,
  `${BASE}/js/app.js`,
  `${BASE}/js/core/db.js`,
  `${BASE}/js/core/utils.js`,
  `${BASE}/js/core/state.js`,
  `${BASE}/js/modules/accounts.js`,
  `${BASE}/js/modules/transactions.js`,
  `${BASE}/js/modules/debts.js`,
  `${BASE}/js/modules/credit.js`,
  `${BASE}/js/modules/dashboard.js`,
  `${BASE}/js/modules/ui.js`
];

// 🔥 install
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => {
        console.log("Erro ao cachear:", err);
      })
  );
});

// 🔥 activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// 🔥 fetch (network first)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return res;
      })
      .catch(() => caches.match(event.request))
  );
});