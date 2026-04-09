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
