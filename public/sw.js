const CACHE="marcondes-agendamentos-v6";
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(["/manifest.json","/icon-192.svg","/icon-512.svg","/logo.jpg","/fundo.jpg"])));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;if(url.pathname.startsWith("/rest/")||url.pathname.startsWith("/auth/")||url.pathname.startsWith("/api/"))return;event.respondWith(fetch(request).catch(()=>caches.match(request).then(response=>response||caches.match("/"))))});
self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()||""}}
  const title=data.title||"Lembrete de agendamento";
  const options={
    body:data.body||"Você tem um atendimento agendado em 2 horas.",
    icon:data.icon||"/icon-192.svg",
    badge:data.badge||"/icon-192.svg",
    tag:data.tag||"marcondes-agendamento",
    renotify:true,
    vibrate:data.vibrate||[650,250,650,250,650],
    data:data.data||{url:"/"}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target=event.notification.data?.url||"/";
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(windows=>{
    for(const client of windows){if("focus" in client){client.navigate(target);return client.focus()}}
    return clients.openWindow(target);
  }));
});