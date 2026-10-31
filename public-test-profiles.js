/* Public device-test roster. No account API or cloud upload is used. */
(()=>{
 const KEY='extractorPublicTestProfiles0108';
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
 async function request(path,options={}){
  if(path!=='/api/profiles')return reply({error:'Private HQ files are available only in the private app.'},403);
  try{
   let rows=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(rows))rows=[];
   if(!options.method||options.method==='GET')return reply({profiles:rows});
   if(options.method!=='POST')return reply({error:'Method not supported'},405);
   const data=JSON.parse(options.body||'{}'),name=String(data.name||'').trim().replace(/\s+/g,' '),username=String(data.username||'').trim().replace(/^@/,'');
   if(!name||name.length>50||/[\u0000-\u001f]/.test(name))return reply({error:'Use a name between 1 and 50 characters.'},400);
   if(username&&!/^[a-zA-Z0-9_.-]{3,24}$/.test(username))return reply({error:'Username needs 3–24 letters, numbers, dots, hyphens or underscores.'},400);
   const i=data.id?rows.findIndex(p=>p.id===data.id):-1;if(data.id&&i<0)return reply({error:'Profile not found on this device.'},404);
   if(i<0&&rows.length>=200)return reply({error:'This device has 200 players. Edit an existing player.'},400);
   let image=i>=0?rows[i].photoUrl:null;if(data.removePhoto)image=null;
   if(data.photo){if(typeof data.photo!=='string'||data.photo.length>220000||!/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(data.photo))return reply({error:'Choose a smaller JPEG, PNG or WebP image.'},400);image=data.photo}
   const p={id:i>=0?rows[i].id:crypto.randomUUID(),name,username,photoUrl:image,updatedAt:new Date().toISOString()};if(i>=0)rows[i]=p;else rows.push(p);
   localStorage.setItem(KEY,JSON.stringify(rows));return reply({profile:p});
  }catch(e){return reply({error:e?.name==='QuotaExceededError'?'Device storage is full. Save without a photo or clear old test data.':'Could not read or save this device profile.'},503)}
 }
 window.ExtractorPublicProfiles={request};
})();
