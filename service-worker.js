const VERSION = "orion-" + Date.now();
const CACHE = VERSION;

const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json"
];

// ================= INSTALL =================
self.addEventListener("install", (event) => {
  // ⚠️ NÃO usar skipWaiting agressivo no iOS sozinho
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
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

  // ⚠️ importante: só claim depois de limpar cache
  return self.clients.claim();
});

// ================= FETCH (SEM CACHE QUEBRANDO UI) =================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 🔥 HTML sempre network-first (CRÍTICO)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 🔥 JS e CSS SEM cache antigo
  if (req.url.includes(".js") || req.url.includes(".css")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => fetch(req))
    );
    return;
  }

  // fallback seguro
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});