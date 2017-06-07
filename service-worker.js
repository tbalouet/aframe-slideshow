// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.

//cacheVersion needs to be updated at each code iteration,
//in order to replace the former cache in the browser
const CACHE_VERSION = 1;
const CURRENT_CACHES = {
  'AFrame-Slideshow' : 'AFrame-Slideshow' + CACHE_VERSION
};

//List of the files representing the App shell
//i.e. what's needed for the app to launch
var filesToCache = [
  //scripts
  '/',
  '/index.html',
  '/manifest.json',
  '/public/js/script.js',
  '/public/js/aframe.min.js',
  '/public/js/qrcode.js',
  '/public/styles/inline.css',
  //images
  'public/assets/icons/favicon.ico',
  'public/assets/icons/icon-32x32.png',
  'public/assets/icons/icon-128x128.png',
  'public/assets/icons/icon-256x256.png',
  'public/assets/icons/qrcode.gif',
  'public/assets/icons/loader.gif'
];

/**
 * Installation is used to download the app shell,
 * files which are needed for the basic features to show
 */
self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CURRENT_CACHES['AFrame-Audio']).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    }).catch(function(err){
      console.log("[ServiceWorker] Error in installing SW", err);
    })
  );
});

/**
 * Activation happens once the installation is done
 * it allows to take care of old cache by checking the cacheVersion
 */
self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate');

  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    //Retrieve all the caches
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).catch(function(err){
      console.log("[ServiceWorker] Error in activating SW", err);
    })
  );
  //fixes a corner case in which the app wasn't returning the latest data
  return self.clients.claim();
});

/**
 * Evaluate Web fetch requests, search for them in the cache
 * or use fetch to get a copy from the network
 */
self.addEventListener('fetch', function(event) {
  if(event.request.method !== "POST"){
    event.respondWith(
      caches.open(CURRENT_CACHES['AFrame-Audio']).then(function(cache) {
        return cache.match(event.request).then(function (response) {
          return response || fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone()).catch((err) => {
              console.log("[ServiceWorker] Error in adding to cache", err);
            });
            return response;
          }).catch((err) => {
            console.log("[ServiceWorker] Error in fetching response", err);
          });
        }).catch((err) => {
          console.log("[ServiceWorker] Error in matching cache", err);
        });
      }).catch((err) => {
        console.log("[ServiceWorker] Error in resolving fetch", err);
      }));
  }
});
