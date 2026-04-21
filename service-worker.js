const CACHE_NAME = "orion-v1";

// 🔥 arquivos essenciais
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/core/db.js",
  "/js/core/utils.js",
  "/js/core/state.js",
  "/js/modules/accounts.js",
  "/js/modules/transactions.js",
  "/js/modules/debts.js",
  "/js/modules/credit.js",
  "/js/modules/dashboard.js",
  "/js/modules/ui.js"
];

// 🔥 instala e limpa cache antigo
self.addEventListener("install", event => {
  self.skipWaiting(); // força ativação imediata

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 🔥 ativa e remove versões antigas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if(key !== CACHE_NAME){
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// 🔥 estratégia: sempre tenta rede primeiro
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {

        const resClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});