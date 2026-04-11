const VERSION = "orion-" + Date.now();
const BASE = "/orion-finance/";
const CACHE = VERSION;

const FILES = [
  BASE,
  BASE + "index.html",
  BASE + "style.css",
  BASE + "app.js",
  BASE + "manifest.json"
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
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("orion-") && key !== CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );

  return self.clients.claim();
});

// ================= FETCH =================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // sempre atualiza HTML principal
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(BASE + "index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req);
    })
  );
});