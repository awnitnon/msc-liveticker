// MSC Liveticker V8 — app-shell offline cache. No Supabase data or credentials cached here.
const CACHE='msc-ticker-shell-v9-2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];
const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
self.addEventListener('install', event => {
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE);
  try{await cache.add(new Request(LIB,{mode:'cors'}))}catch(err){console.warn('Supabase offline library pre-cache failed',err)}
  await self.skipWaiting();
 })());
});
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('msc-ticker-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin&&url.href!==LIB)return;
 // Never cache Supabase auth/data requests; this service worker caches only app shell and JS library.
 if(url.origin===self.location.origin&&req.mode==='navigate'){
  event.respondWith(fetch(req).then(async response=>{if(response.ok)(await caches.open(CACHE)).put('./index.html',response.clone());return response}).catch(async()=>await caches.match('./index.html')||await caches.match('./')));
 }else{
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(async res=>{if(res.ok)(await caches.open(CACHE)).put(req,res.clone());return res})));
 }
});
