const CACHE = "orion-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/app.js"
      ]);
    })
  );
});

const CACHE = "orion-v2"; // 🔥 muda versão aqui sempre que atualizar

self.addEventListener("install", e => {
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/app.js"
      ]);
    })
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE)
            .map(k => caches.delete(k))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
