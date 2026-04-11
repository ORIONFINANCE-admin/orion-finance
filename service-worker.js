const CACHE = "orion-v13";

// arquivos essenciais (app shell)
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
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// ================= FETCH (HÍBRIDO INTELIGENTE) =================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // 🔥 HTML sempre network-first (evita versão antiga)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match("/index.html");
        })
    );
    return;
  }

  // 🔥 JS e CSS: network-first com fallback cache
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

  // 🔥 padrão: cache-first (rápido e offline)
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