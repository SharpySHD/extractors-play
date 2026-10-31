/* Public test: roster and seat choices stay on this device. */
(()=>{
 const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let roster=[],seats=['',''],mic=null,voiceTimer=null,voiceSession=0,active=false,draft={},photo=null,removePhoto=false,returnTo=null,loading=null,voiceFlow='',cameraStream=null;
 try{const saved=JSON.parse(localStorage.getItem('extractorPlayerSeats'));if(Array.isArray(saved)&&saved.length===2)seats=saved}catch(_){}
 const name=i=>roster.find(p=>p.id===seats[i])?.name||['Challenger','Big Fella'][i];
 function stop(){voiceSession++;clearTimeout(voiceTimer);if(mic){try{mic.abort()}catch(_){}mic=null}window.extractorMusic?.duck('recognition',false);try{speechSynthesis.cancel()}catch(_){}window.extractorMusic?.duck('speech',false)}
 function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null}const v=$('profileCamera');if(v)v.srcObject=null}
 const cleanName=s=>String(s||'').trim().replace(/^(?:my name is|call me|i am|i'm|i’m)\s+/i,'').replace(/[.!?]+$/,'').trim();
 const cleanUsername=s=>/^(?:skip|no|no thanks|none)[.!?]*$/i.test(String(s||'').trim())?'':String(s||'').trim().replace(/^(?:my username is|username|call me)\s+/i,'').replace(/[.!?]+$/,'').replace(/\s+dot\s+/gi,'.').replace(/\s+underscore\s+/gi,'_').replace(/\s+/g,'');
 function rickySay(text,done){if(window.ExtractorSpeak)window.ExtractorSpeak(text,done,'mc');else done?.()}

 async function load(){if(loading)return loading;loading=(async()=>{try{const response=await window.ExtractorPublicProfiles.request('/api/profiles',{cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not load profiles.');roster=data.profiles;return true}catch(e){if(active&&$('profileStatus'))$('profileStatus').textContent=e.message;return false}finally{loading=null}})();return loading}
 function seatsUI(){return `<div class="player-seats">${[0,1].map(i=>`<label>PLAYER ${i+1}<select id="seat${i}" aria-label="Player ${i+1}"><option value="">${i?'Big Fella':'Challenger'}</option>${roster.map(p=>`<option value="${p.id}" ${seats[i]===p.id?'selected':''}>${escape(p.name)}${p.username?' · @'+escape(p.username):''}</option>`).join('')}</select></label>`).join('')}</div>`}
 function bindSeats(){[0,1].forEach(i=>{if(!$('seat'+i))return;$('seat'+i).onchange=e=>{const id=e.target.value;if(id&&seats[1-i]===id){e.target.value=seats[i];$('rosterNotice').textContent='Choose a different profile for each player.';return}seats[i]=id;localStorage.setItem('extractorPlayerSeats',JSON.stringify(seats));$('rosterNotice').textContent='Players ready: '+name(0)+' vs '+name(1)}})}
 function menuRoster(){const host=$('menuRoster');if(!host)return;host.innerHTML=seatsUI()+'<p id="rosterNotice" class="tiny">Choose your players, or use the default names.</p>';bindSeats()}
 function attachMenu(){active=false;stop();menuRoster();$('profilesButton').onclick=()=>welcome();load().then(()=>{if(!active)menuRoster()});if(!localStorage.getItem('extractorWelcome090Seen')){welcome();return true}return false}
 async function primeMic(){try{if(!navigator.mediaDevices?.getUserMedia)return false;const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(t=>t.stop());localStorage.setItem('extractorMicPrimed','1');return true}catch(_){return false}}
 function welcome(){
  window.stop?.();stop();const dialog=document.createElement('dialog');dialog.className='welcome-dialog';dialog.innerHTML=`<div class="eyebrow">THE EXTRACTOR NEXUS</div><h1>WELCOME<br>PLAYER</h1><p>Your name. Your game. Your place in the arena.</p><div class="welcome-actions"><button class="gold-access" id="registerPlayer">＋ REGISTER PLAYER</button><button id="returningPlayer">◉ RETURNING PLAYER</button><button id="guestPlayer">PLAY AS GUEST →</button></div><p class="tiny">PUBLIC DEVICE TEST · v0.12.1<br>Profiles stay on this device. No cloud account is created.</p>`;document.body.append(dialog);
  const close=()=>{stop();localStorage.setItem('extractorWelcome090Seen','1');dialog.close();dialog.remove()};
  dialog.querySelector('#registerPlayer').onclick=async()=>{await primeMic();close();open(window.menu)};dialog.querySelector('#returningPlayer').onclick=async()=>{await primeMic();close();open(window.menu)};dialog.querySelector('#guestPlayer').onclick=close;dialog.oncancel=()=>{stop();localStorage.setItem('extractorWelcome090Seen','1');dialog.remove()};dialog.showModal();
 }

 function draw(){
  $('app').innerHTML=`<div class="wrap profile-wrap"><section class="panel"><div class="row"><button id="profileBack">← MENU</button><span class="eyebrow">PLAYER PROFILES · v0.12.1 TEST</span></div><h1>Your place in the Nexus</h1><p class="muted">Save a name, optional username and optional selfie. Profiles and optional photos stay in this browser on this device.</p><div class="profile-roster">${roster.map(p=>`<button data-profile="${p.id}" class="profile-card">${p.photoUrl?`<img src="${escape(p.photoUrl)}" alt="">`:'<span class="avatar-placeholder">'+escape(p.name.slice(0,1).toUpperCase())+'</span>'}<span>${escape(p.name)}<small>${p.username?'@'+escape(p.username):'PLAYER'}</small></span></button>`).join('')}<button id="newProfile">＋ NEW PLAYER</button></div><h2 id="profileTitle">${draft.id?'Edit player':'New player'}</h2><form id="profileForm"><label class="field">Name<input id="profileName" name="name" autocomplete="nickname" maxlength="50" required value="${escape(draft.name||'')}" placeholder="What should X-Man call you?"></label><label class="field">Username · optional<input id="profileUsername" name="username" maxlength="24" value="${escape(draft.username||'')}" placeholder="Your darts handle"></label><div class="row"><button type="button" id="profileVoice">🎙 START VOICE SETUP</button><button type="button" id="profileStop">STOP VOICE</button></div><p class="tiny">Voice fills the fields. Check them before saving. Audio is processed by your browser’s speech service; this app does not store the recording.</p><label class="field">Selfie · optional<input type="file" id="profilePhoto" accept="image/*" capture="user"></label><div class="profile-photo-preview" id="photoPreview">${draft.photoUrl?`<img src="${escape(draft.photoUrl)}" alt="Current profile photo">`:''}<video id="profileCamera" class="profile-camera hidden" playsinline muted autoplay></video></div><button type="button" id="removePhoto">REMOVE PHOTO</button><p id="profileStatus" class="status" role="status">${draft.id?'Update your details below.':'Type your details or start voice setup.'}</p><button class="primary" type="submit" id="profileSave">SAVE PLAYER</button></form><h2>Who's playing?</h2>${seatsUI()}<p id="rosterNotice" class="tiny">Choose different players for each side.</p><p class="tiny">Conversation memory and career statistics are not enabled yet.</p></section></div>`;
  $('profileBack').onclick=()=>{stop();active=false;returnTo?.();window.extractorMusic?.applyPolicy?.()};
  $('newProfile').onclick=()=>{stop();draft={};photo=null;removePhoto=false;draw()};
  document.querySelectorAll('[data-profile]').forEach(el=>el.onclick=()=>{stop();draft={...roster.find(p=>p.id===el.dataset.profile)};photo=null;removePhoto=false;draw()});
  $('profileVoice').onclick=()=>ask('name');$('profileStop').onclick=()=>{stop();$('profileStatus').textContent='Voice stopped. You can type or save the fields.'};
  $('removePhoto').onclick=()=>{photo=null;removePhoto=true;$('profilePhoto').value='';$('photoPreview').innerHTML='';$('profileStatus').textContent='Photo will be removed when you save.'};
  $('profilePhoto').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{photo=await compress(file);removePhoto=false;const img=document.createElement('img');img.src=photo;img.alt='New profile photo preview';$('photoPreview').replaceChildren(img);$('profileStatus').textContent='Photo ready. Save Player to store on this device.'}catch(error){$('profileStatus').textContent=error.message}};
  $('profileForm').onsubmit=save;bindSeats();
 }
 async function open(back,options={}){window.extractorMusic?.pause();if(!options.keepRicky)window.stop?.();window.ExtractorX01?.stop();window.ExtractorStage?.cancel();document.body.classList.remove('intro-active','bull-active','menu-active');active=true;returnTo=back;draft={};photo=null;removePhoto=false;draw();$('profileStatus').textContent='Loading your player roster…';const ok=await load();if(!active)return false;if(ok){draw();$('profileStatus').textContent='Roster loaded. Add a player or select one to edit.'}return ok}
 async function compress(file){
  if(!file.type.startsWith('image/')||file.size>15000000)throw Error('Choose an image smaller than 15 MB.');
  const src=URL.createObjectURL(file);try{const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas'),size=Math.min(384,image.naturalWidth,image.naturalHeight);canvas.width=canvas.height=size;const edge=Math.min(image.naturalWidth,image.naturalHeight);canvas.getContext('2d').drawImage(image,(image.naturalWidth-edge)/2,(image.naturalHeight-edge)/2,edge,edge,0,0,size,size);const result=canvas.toDataURL('image/jpeg',.8);if(result.length>210000)throw Error('Photo is too detailed. Choose another image.');return result}finally{URL.revokeObjectURL(src)}
 }
 async function save(e){e?.preventDefault?.();stopCamera();stop();$('profileSave').disabled=true;$('profileStatus').textContent='Saving player…';try{const response=await window.ExtractorPublicProfiles.request('/api/profiles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:draft.id,name:$('profileName').value,username:$('profileUsername').value,photo,removePhoto})});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not save player.');const index=roster.findIndex(p=>p.id===data.profile.id);if(index<0)roster.push(data.profile);else roster[index]=data.profile;draft={...data.profile};photo=null;removePhoto=false;draw();$('profileStatus').textContent='Player saved. Choose their side below, or return to Menu.';voiceFlow='';window.ExtractorSpeak?.('Player saved. Welcome to the Nexus.',()=>window.ExtractorRicky?.refresh?.(),'mc')}catch(error){$('profileStatus').textContent=error.message}finally{if($('profileSave'))$('profileSave').disabled=false}}
 async function startCameraPreview(){
  stopCamera();const status=$('profileStatus'),video=$('profileCamera');
  if(!navigator.mediaDevices?.getUserMedia||!video){if(status)status.textContent='Camera unavailable. Say no selfie to continue.';return false}
  try{cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});video.srcObject=cameraStream;video.classList.remove('hidden');await video.play().catch(()=>{});if(status)status.textContent='Camera ready. Say “take it” when you are ready.';return true}catch(_){if(status)status.textContent='Camera permission is needed. Say no selfie to continue.';return false}
 }
 function captureCamera(){const video=$('profileCamera');if(!video||!cameraStream||!video.videoWidth)return false;const canvas=document.createElement('canvas'),size=384;canvas.width=canvas.height=size;const edge=Math.min(video.videoWidth,video.videoHeight);canvas.getContext('2d').drawImage(video,(video.videoWidth-edge)/2,(video.videoHeight-edge)/2,edge,edge,0,0,size,size);photo=canvas.toDataURL('image/jpeg',.82);removePhoto=false;const img=document.createElement('img');img.src=photo;img.alt='New profile selfie';$('photoPreview').replaceChildren(img);stopCamera();return true}
 async function saveFromRicky(){const form=$('profileForm');if(!form)return false;await save({preventDefault(){}});return true}
 function startRickyRegistration(){
  (async()=>{voiceFlow='opening';await open(window.menu,{keepRicky:true});if(!active)return;voiceFlow='name';$('profileStatus').textContent='Ricky is registering a new player. What name should I call you?';rickySay('New player. What name should I call you?')})();
  return true;
 }
 function handleRicky(text){
  if(!voiceFlow)return false;const raw=String(text||'').trim(),n=raw.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
  if(voiceFlow==='opening')return true;
  if(voiceFlow==='name'){const value=cleanName(raw);if(!value){rickySay('Give me your name.');return true}$('profileName').value=value;voiceFlow='username';$('profileStatus').textContent='Name captured. Say a username, or say skip.';rickySay('Got it. Username, or say skip.');return true}
  if(voiceFlow==='username'){$('profileUsername').value=cleanUsername(raw);voiceFlow='selfie';$('profileStatus').textContent='Shall I take a selfie? Say yes or no.';rickySay('Shall I take a selfie?');return true}
  if(voiceFlow==='selfie'){
   if(/^(yes|yeah|yep|sure|do it|take one|selfie|okay|ok)$/.test(n)){voiceFlow='camera';startCameraPreview().then(ok=>rickySay(ok?'Camera on. Say take it when you are ready.':'Camera did not open. Say no selfie to continue.'));return true}
   if(/^(no|nah|nope|skip|no thanks)$/.test(n)){voiceFlow='saving';rickySay('No selfie. Saving player.',()=>saveFromRicky());return true}
   rickySay('Yes or no. Shall I take a selfie?');return true;
  }
  if(voiceFlow==='camera'){
   if(/^(take it|take photo|take the photo|take selfie|shoot|now|cheese)$/.test(n)){if(captureCamera()){voiceFlow='saving';rickySay('Got it. Saving player.',()=>saveFromRicky())}else rickySay('Camera is not ready yet.');return true}
   if(/^(cancel|no|nah|skip|no selfie)$/.test(n)){stopCamera();voiceFlow='saving';rickySay('No selfie. Saving player.',()=>saveFromRicky());return true}
   rickySay('Say take it when you are ready, or say skip.');return true;
  }
  return true;
 }
 function ask(field){
  stop();if(!active)return;const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){$('profileStatus').textContent='Voice setup is unavailable here. Type into the fields above.';return}
  const current=voiceSession;const prompt=field==='name'?'What name should I call you?':'Would you like a username? Say the username, or say skip.';
  $('profileStatus').textContent=prompt;
  const start=()=>{if(!active||current!==voiceSession)return;let consumed=false;mic=new Speech();mic.lang=window.ExtractorCommands.language();mic.interimResults=false;mic.continuous=false;window.extractorMusic?.duck('recognition',true);
   mic.onresult=e=>{if(consumed||current!==voiceSession||!active)return;const result=e.results[e.resultIndex??0];if(!result||result.isFinal===false)return;consumed=true;const words=result[0].transcript.trim();stop();
    if(field==='name'){$('profileName').value=words.replace(/^(?:my name is|call me|i am|i'm|i’m)\s+/i,'').replace(/[.!?]+$/,'');$('profileStatus').textContent='Heard your name. Review it, then tell me a username.';ask('username')}
    else{$('profileUsername').value=/^(skip|no|no thanks|none)[.!?]*$/i.test(words)?'':words.replace(/^(?:my username is|username|call me)\s+/i,'').replace(/[.!?]+$/,'').replace(/\s+dot\s+/gi,'.').replace(/\s+underscore\s+/gi,'_').replace(/\s+/g,'');$('profileStatus').textContent='Check your name and username. You can add a selfie using the photo picker, then Save Player.';window.speak?.('Check your details. Add a selfie if you like, then save your player.')}
   };
   const end=message=>{if(current!==voiceSession)return;stop();$('profileStatus').textContent=message};
   mic.onerror=()=>end('Voice stopped. Tap Start Voice Setup again or type your details.');mic.onend=()=>{if(!consumed)end('Nothing captured. Try voice setup again or type your details.')};
   try{mic.start();voiceTimer=setTimeout(()=>end('Listening finished. You can type your details.'),12000)}catch(_){end('Microphone unavailable. Please type your details.')}
  };
  if(window.speak){window.speak(prompt,start)}else start();
 }
 window.ExtractorProfiles={name,escape,attachMenu,open,stop,load,startRickyRegistration,handleRicky,isVoiceFlowActive:()=>!!voiceFlow,stopCamera};
})();
