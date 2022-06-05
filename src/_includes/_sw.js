const CACHE_VERSION = `v${1}`;

const PRE_CACHE = "PRE_CACHE";

const CONTENT_CACHE = "CONTENT_CACHE";


const CACHES_TO_DELETE = [PRE_CACHE,CONTENT_CACHE]
const deleteCaches = async key => {
  console.log('delete caches: ',CACHES_TO_DELETE)
  CACHES_TO_DELETE.forEach(cacheName => caches.delete(cacheName))
};

// Delete specific entries in CONTENT_CACHE
const ROUTES_TO_DELETE = [];
const deleteRoutes = async () => {
  const cache = await caches.open(CONTENT_CACHE);
  ROUTES_TO_DELETE.forEach(route => cache.delete(route));
};

const addToPrecache = async resources => {
  const cache = await caches.open(PRE_CACHE);
  await cache.addAll(resources);
};

self.addEventListener("install", async event => {
  deleteCaches()
  deleteRoutes();
  event.waitUntil(addToPrecache(resourcesToPrecache));
});

// activate new SW on "SKIP_WAITING"
self.addEventListener("message", event => {
  const { type } = event.data;
  switch (type) {
    case "SKIP_WAITING": {
      skipWaiting();
      break;
    }
  }
});

// Enable navigation preload
const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener("activate", async event => {
  event.waitUntil(enableNavigationPreload());
});

// Put new responses in CONTENT_CACHE
const putInContentCache = async (request, response) => {
  const cache = await caches.open(CONTENT_CACHE);
  await cache.put(request, response);
};

// Responde with cache first
const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.info("using preload response", preloadResponse);
    putInContentCache(request, preloadResponse.clone());
    return preloadResponse;
  }
  try {
    const responseFromNetwork = await fetch(request);
    putInContentCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("fetch", event => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: "/index.html",
    })
  );
});
