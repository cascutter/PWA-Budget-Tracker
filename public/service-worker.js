const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/db.js",
    "/style.css"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// Install
self.addEventListener("install", evt => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were successfully pre-cached.");
            return cache.addAll(FILES_TO_CACHE).then((result) => {
                    console.log("Add all result", result);
                })
                .catch((err) => {
                    console.log("Error: ", err);
                });
        }));
    self.skipWaiting();
});

// Activate
self.addEventListener("activate", evt => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.ClientRectList.claim();
})

// Fetch files
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(evt.request).then((response) => {
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch((err) => {
                        return cache.match(evt.request);
                    });
            })
            .catch((err) => console.log(err))
        );
        return;
    }
    evt.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(evt.request).then((response) => {
                return response || fetch(evt.request);
            });
        })
    );
});