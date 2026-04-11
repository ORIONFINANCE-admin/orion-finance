const CACHE = "orion-v12";

const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json"
];

// INSTALA
self.addEventListener("install", e=>{
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE).then(cache=>{
      return cache.addAll(FILES);
    })
  );
});

// ATIVA
self.addEventListener("activate", e=>{
  self.clients.claim();

  e.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      );
    })
  );
});

// FETCH (OFFLINE)
self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(res=>{
      return res || fetch(e.request);
    })
  );
});