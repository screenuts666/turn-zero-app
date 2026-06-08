const CACHE_NAME = "tap-roulette-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./css/base.css",
  "./css/components.css",
  "./css/game.css",
  "./css/trail.css",
  "./js/audio.js",
  "./js/settings.js",
  "./js/random.js",
  "./js/particles.js",
  "./js/trails.js",
  "./js/game.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
