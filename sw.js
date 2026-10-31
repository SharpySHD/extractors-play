const KEY='extractor-play-public-v0108-flat1';
const ASSETS=['./','index.html','app.js','developer-desk.js','language-reference.json','profiles.js','public-test-profiles.js','extractor-memory.js','extractor-knowledge.json','banter.js','menu-eye.png','menu-dart.png','stage.js','maximum-180-v3.mp4','nexus-workprint-15.mp4?v=0108-public-flat1','nexus-arena-backdrop-v2.webp','x01-engine.js','x01.js','music.js','updates.js','voice-commands.js','ricky-wake.js','claim-phrases.js','style.css','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(KEY).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('extractor-mickey-')&&x!==KEY).map(x=>caches.delete(x))))));
async function ranged(request){
 const cached=await caches.match(request.url);if(!cached||cached.status!==200)return fetch(request);
 const bytes=await cached.arrayBuffer(),m=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range')||'');
 if(!m)return fetch(request);
 const start=m[1]?Number(m[1]):Math.max(0,bytes.byteLength-Number(m[2]));
 const end=m[1]&&m[2]?Math.min(Number(m[2]),bytes.byteLength-1):bytes.byteLength-1;
 if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
 const headers=new Headers(cached.headers);headers.set('Content-Range',`bytes ${start}-${end}/${bytes.byteLength}`);headers.set('Accept-Ranges','bytes');headers.set('Content-Length',String(end-start+1));
 return new Response(bytes.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch',e=>{if(new URL(e.request.url).pathname.startsWith('/api/'))return;if(e.request.method!=='GET')return;if(e.request.headers.has('range')){e.respondWith(ranged(e.request));return}e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
