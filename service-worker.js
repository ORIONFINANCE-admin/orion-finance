// 🔥 versão automática baseada em timestamp (FORÇA INVALIDAÇÃO REAL)
const VERSION = Date.now();
const CACHE = `orion-${VERSION}`;

const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json"
];

// ================= INSTALL =================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(FILES);
    })
  );
});

// ================= ACTIVATE =================
self.addEventListener("activate", (event) => {
  self.clients.claim();

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("orion-") && key !== CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// ================= FETCH (CACHE LIMPO + SEM MISTURA) =================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // 🔥 HTML SEMPRE NETWORK FIRST (garante atualização real)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 🔥 JS / CSS SEMPRE NETWORK FIRST (evita versão antiga)
  if (
    request.url.includes(".js") ||
    request.url.includes(".css")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 🔥 fallback seguro
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
      );
    })
  );
});