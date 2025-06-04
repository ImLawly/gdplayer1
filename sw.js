const CACHE_VERSION = 178;
const CURRENT_CACHES = {
	prefetch: `gdplayer-v${CACHE_VERSION}`,
	dynamic: `gdplayer-dynamic-v${CACHE_VERSION}`,
};

const assets = [
	"./offline.html",
	"./assets/css/bs-dark-v1.3.1.css",
	"./assets/css/bs-dark-v1.3.1.min.css",
	"./assets/css/player-v3.3.7.css",
	"./assets/css/player-v3.3.7.min.css",
	"./themes/frontend/default/assets/css/style-v3.4.1.css",
	"./themes/frontend/default/assets/css/style-v3.4.1.min.css",
	"./assets/js/main-v3.8.7.js",
	"./assets/js/main-v3.8.7.min.js",
	"./assets/js/player-v4.5.8.min.js",
	"./assets/js/player-v4.5.8-md.min.js",
	"./assets/js/shaka-player-error-codes.js",
	"./assets/img/logo/youtube.png",
	"./assets/img/logo/gdrive.png",
	"./assets/img/logo/vimeo.png",
];

const enabledCaches = ["script", "style", "font", "manifest", "image"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CURRENT_CACHES.prefetch).then((cache) => {
			return cache.addAll(assets).catch((err) => {
				console.error("Cache addAll failed:", err);
			});
		})
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter(
						(key) => !Object.values(CURRENT_CACHES).includes(key)
					)
					.map((key) => caches.delete(key))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	if (
		enabledCaches.includes(event.request.destination) &&
		!event.request.redirected &&
		!includeURLs(event.request.url)
	) {
		event.respondWith(handleRequest(event.request));
	}
});

async function handleRequest(request) {
	try {
		// Coba ambil dari cache dulu
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		// Coba fetch dari jaringan
		const fetchResponse = await fetch(request.clone());

		// Jika response OK dan URL termasuk yang ingin di-cache
		if (fetchResponse.ok && includeURLs(request.url)) {
			try {
				const cache = await caches.open(CURRENT_CACHES.dynamic);
				await cache.put(request, fetchResponse.clone());
			} catch (cacheError) {
				console.error("Cache put failed:", cacheError);
				// Lanjutkan meskipun caching gagal
			}
		}

		return fetchResponse;
	} catch (error) {
		console.error("Fetch failed, serving fallback:", error);
		// Jika tidak ada fallback, kembalikan response error sederhana
		return new Response(
			"Network error occurred and no cached version available",
			{
				status: 408,
				statusText: "Network Error",
			}
		);
	}
}

function includeURLs(url) {
	const allowedDomains = [
		location.hostname,
		".jsdelivr.net",
		".cloudflare.com",
		".wp.com",
	];
	return allowedDomains.some((domain) => url.includes(domain));
}
