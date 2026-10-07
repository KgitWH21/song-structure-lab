const CACHE='song-lab-'+"209b482010f0e327";
const ASSETS=["./","./index.html","./manifest.webmanifest","./pwa.js","./icons/icon-192.png","./icons/icon-512.png","./app.3324542f1639.js","./catalog.4f94fbeb1fc9.js","./style.fe64a7df5097.css"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('song-lab-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate'){try{const result=await fetch(event.request);if(result.ok)return result;}catch{}return await cache.match('./index.html');}
 return await cache.match(event.request)||fetch(event.request);})());
});
