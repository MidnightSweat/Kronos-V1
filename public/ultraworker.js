importScripts("scram/scramjet.all.js");



if (navigator.userAgent.includes("Firefox")) {
  Object.defineProperty(globalThis, "crossOriginIsolated", {
    value: true,
    writable: true,
  })
}

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("install", () => {
  self.skipWaiting()
})

// On activate, clear any stale caches left from filtered/blocked sessions
// and immediately take control of all clients so refreshes use the new SW.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)))
    }).then(() => self.clients.claim())
  )
})

async function handleRequest(event) {
  try {
    await scramjet.loadConfig()
    if (scramjet.route(event)) {
      return await scramjet.fetch(event)
    }
    return await fetch(event.request)
  } catch (e) {
    // If the request fails (e.g. blocked by a content filter or network error),
    // return a proper error instead of letting a broken response get cached.
    if (event.request.mode === "navigate") {
      return new Response(
        "<html><body><h2>Page failed to load. Try refreshing.</h2></body></html>",
        { status: 503, headers: { "Content-Type": "text/html" } }
      )
    }
    return new Response("Service unavailable", { status: 503 })
  }
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event))
})

