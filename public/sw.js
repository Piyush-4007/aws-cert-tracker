/*
 * Service worker for the AWS Certification Tracker.
 *
 * Runtime caching only — there is no precache manifest to keep in step with a
 * build, so this file almost never has to change and can't go stale against a
 * newer deploy.
 *
 *   navigations   network first, falling back to cache, then to a cached page.
 *                 A new deploy is therefore picked up the moment you're online.
 *   /_next/static cache first. Those URLs are content-hashed, so a new build
 *                 produces new URLs and can never be served a stale response.
 *   everything    else is left alone. In particular Supabase requests are never
 *                 touched: progress must not be served from a cache, and the
 *                 app's own write queue already handles being offline.
 */

const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const KEEP = [PAGES, ASSETS];

self.addEventListener("install", (event) => {
  // Take over promptly; there is only ever one version of this app in play.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !KEEP.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Unvisited page while offline: the shell is better than a browser error.
    const root = await cache.match("/");
    if (root) return root;
    return new Response("You are offline and this page hasn't been opened before.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase, Google — never cached

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
  }
});
