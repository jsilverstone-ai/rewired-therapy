self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open("rewired-v2").then((cache) => cache.addAll(["./prototype.html", "./manifest.webmanifest"])));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== "rewired-v2").map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open("rewired-v2").then((cache) => cache.put(event.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(event.request))
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      if (list[0]) return list[0].focus();
      return self.clients.openWindow("./prototype.html");
    })
  );
});