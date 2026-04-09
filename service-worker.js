const CACHE = "orion-v5";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  self.clients.claim();
});

self.addEventListener("fetch", () => {});