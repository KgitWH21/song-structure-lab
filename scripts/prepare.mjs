import {readFileSync,writeFileSync,readdirSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const dist=resolve(dirname(fileURLToPath(import.meta.url)),'..');
let html=readFileSync(resolve(dist,'index.html'),'utf8');
for(const file of ['catalog.js','app.js','style.css']){
 const [base,ext]=file.split('.');
 const bytes=readFileSync(resolve(dist,file));
 const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
 const name=`${base}.${hash}.${ext}`;
 for(const previous of readdirSync(dist))if(new RegExp(`^${base}\\.[a-f0-9]{12}\\.${ext}$`).test(previous)&&previous!==name)unlinkSync(resolve(dist,previous));
 writeFileSync(resolve(dist,name),bytes);
 html=html.replace(new RegExp(`(["'])${base}(?:\\.[a-f0-9]{12})?\\.${ext}(?:\\?[^"']*)?\\1`,'g'),`"${name}"`);
}
writeFileSync(resolve(dist,'index.html'),html);
console.log('Updated content-versioned asset references.');

const files=['./','./index.html','./manifest.webmanifest','./pwa.js','./icons/icon-192.png','./icons/icon-512.png',...readdirSync(dist).filter(f=>/\.[a-f0-9]{12}\.(js|css)$/.test(f)).map(f=>'./'+f)];
const digest=createHash('sha256');for(const file of files.filter(f=>f!=='./'))digest.update(readFileSync(resolve(dist,file)));
const version=digest.digest('hex').slice(0,16);
writeFileSync(resolve(dist,'sw.js'),`const CACHE='song-lab-'+${JSON.stringify(version)};
const ASSETS=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('song-lab-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate'){try{const result=await fetch(event.request);if(result.ok)return result;}catch{}return await cache.match('./index.html');}
 return await cache.match(event.request)||fetch(event.request);})());
});
`);
console.log('Offline cache updated.');
