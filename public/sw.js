const CACHE="marcondes-agendamentos-v1";
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(["/manifest.json","/logo.jpg","/fundo.jpg"])));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;if(url.pathname.startsWith("/rest/")||url.pathname.startsWith("/auth/"))return;event.respondWith(fetch(request).catch(()=>caches.match(request).then(response=>response||caches.match("/"))))});
