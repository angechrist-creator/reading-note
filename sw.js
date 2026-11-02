const CV='rn-v13';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./pdf-lib.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CV).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CV).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(e.request.mode==='navigate'||/\/index\.html$/.test(u.pathname)){
    e.respondWith(
      fetch(e.request).then(r=>{
        const cp=r.clone(); caches.open(CV).then(c=>c.put('./index.html',cp)); return r;
      }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./')))
    );
    return;
  }
  if(u.origin===location.origin){
    e.respondWith(
      caches.match(e.request).then(r=>r||fetch(e.request).then(r2=>{
        if(r2&&r2.ok){ const cp=r2.clone(); caches.open(CV).then(c=>c.put(e.request,cp)) }
        return r2;
      }).catch(()=>new Response('',{status:504})))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>{
      const f=fetch(e.request).then(r2=>{
        if(r2&&(r2.ok||r2.type==='opaque')){ const cp=r2.clone(); caches.open(CV).then(c=>c.put(e.request,cp)) }
        return r2;
      }).catch(()=>r);
      return r||f;
    })
  );
});
