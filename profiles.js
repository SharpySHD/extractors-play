/* Public test: roster and seat choices stay on this device. */
(()=>{
 const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let roster=[],seats=['',''],mic=null,voiceTimer=null,voiceSession=0,active=false,draft={},photo=null,removePhoto=false,returnTo=null,loading=null,voiceFlow='',cameraStream=null;
 let voiceEnrollmentDraft=null,enrollStream=null,enrollRecorder=null,enrollChunks=[],enrollTranscript={count:'',terms:''},registrationSeat=null,autoReturnAfterVoiceRegistration=false,bootShown=false,bootDialog=null,setupMic=null,setupRestartTimer=null,setupRestartWanted=false;
 try{const saved=JSON.parse(localStorage.getItem('extractorPlayerSeats'));if(Array.isArray(saved)&&saved.length===2)seats=saved}catch(_){}
 const name=i=>roster.find(p=>p.id===seats[i])?.name||['Challenger','Big Fella'][i];
 function stop(){voiceSession++;clearTimeout(voiceTimer);stopSetupListener();if(mic){try{mic.abort()}catch(_){}mic=null}window.extractorMusic?.duck('recognition',false);try{speechSynthesis.cancel()}catch(_){}window.extractorMusic?.duck('speech',false)}
 function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null}const v=$('profileCamera');if(v)v.srcObject=null}
 const cleanName=s=>String(s||'').trim().replace(/^(?:my name is|call me|i am|i'm|i’m)\s+/i,'').replace(/[.!?]+$/,'').trim();
 const cleanUsername=s=>/^(?:skip|no|no thanks|none)[.!?]*$/i.test(String(s||'').trim())?'':String(s||'').trim().replace(/^(?:my username is|username|call me)\s+/i,'').replace(/[.!?]+$/,'').replace(/\s+dot\s+/gi,'.').replace(/\s+underscore\s+/gi,'_').replace(/\s+/g,'');
 function setupSpeech(){return window.SpeechRecognition||window.webkitSpeechRecognition}
 function stopSetupListener(){setupRestartWanted=false;clearTimeout(setupRestartTimer);setupRestartTimer=null;if(setupMic){const old=setupMic;setupMic=null;old.onstart=old.onresult=old.onerror=old.onend=null;try{old.abort()}catch(_){}}}
 function setupStatus(text){const boot=bootDialog?.querySelector?.('#voiceBootStatus');if(boot)boot.textContent=text;const profile=$('profileStatus');if(profile&&active)profile.textContent=text}
 function startSetupListener(delay=90){
  clearTimeout(setupRestartTimer);setupRestartTimer=null;if(!voiceFlow)return false;
  window.ExtractorRicky?.stop?.();
  if(setupMic)return true;
  const Speech=setupSpeech();if(!Speech){setupStatus('Voice recognition is unavailable in this browser. Use Chrome or the buttons/fields.');return false}
  setupRestartWanted=true;
  setupRestartTimer=setTimeout(()=>{setupRestartTimer=null;if(!voiceFlow||setupMic)return;let mic;try{mic=new Speech()}catch(_){setupStatus('Voice recognition could not start.');return}
   setupMic=mic;mic.lang=window.ExtractorCommands?.language?.()||'en-AU';mic.continuous=false;mic.interimResults=false;mic.maxAlternatives=3;
   mic.onstart=()=>setupStatus('Listening…');
   mic.onresult=e=>{if(setupMic!==mic)return;const result=e.results?.[e.resultIndex||0];if(!result)return;let words='';for(let i=0;i<Math.min(result.length||1,3);i++){const t=String(result[i]?.transcript||'').trim();if(t){words=t;break}}if(!words)return;setupMic=null;try{mic.abort()}catch(_){};handleRicky(words)};
   mic.onerror=e=>{if(setupMic!==mic)return;setupMic=null;const err=e.error||'';if(['not-allowed','service-not-allowed','audio-capture'].includes(err)){setupRestartWanted=false;setupStatus('Microphone permission is blocked. Allow this site to use the microphone, then retry.');return}if(voiceFlow&&setupRestartWanted)startSetupListener(250)};
   mic.onend=()=>{if(setupMic===mic)setupMic=null;if(voiceFlow&&setupRestartWanted)startSetupListener(180)};
   try{mic.start()}catch(_){setupMic=null;if(voiceFlow&&setupRestartWanted)startSetupListener(350)}
  },delay);return true
 }
 function rickySay(text,done){
  stopSetupListener();window.ExtractorRicky?.stop?.();
  const after=()=>{try{done?.()}finally{if(voiceFlow)setTimeout(()=>startSetupListener(),100)}};
  if(window.ExtractorSpeak)window.ExtractorSpeak(text,after,'mc');else after();
 }
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
 function voiceBadge(p){return p?.voiceEnrollment?.complete?' · VOICE ✓':''}
 async function startEnrollRecording(){
  enrollChunks=[];enrollTranscript={count:'',terms:''};
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return false;
  try{enrollStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   const preferred=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported?.(t))||'';
   enrollRecorder=new MediaRecorder(enrollStream,preferred?{mimeType:preferred,audioBitsPerSecond:24000}:{audioBitsPerSecond:24000});
   enrollRecorder.ondataavailable=e=>{if(e.data?.size)enrollChunks.push(e.data)};enrollRecorder.start(250);return true;
  }catch(_){enrollStream=null;enrollRecorder=null;return false}
 }
 async function finishEnrollRecording(){
  const rec=enrollRecorder,stream=enrollStream;enrollRecorder=null;enrollStream=null;
  let blob=null;if(rec&&rec.state!=='inactive'){blob=await new Promise(resolve=>{rec.onstop=()=>resolve(new Blob(enrollChunks,{type:rec.mimeType||'audio/webm'}));try{rec.stop()}catch(_){resolve(null)}})}
  stream?.getTracks?.().forEach(t=>t.stop());enrollChunks=[];
  let sample=null,mime=blob?.type||'';if(blob&&blob.size&&blob.size<135000){sample=await new Promise(resolve=>{const fr=new FileReader();fr.onload=()=>resolve(String(fr.result||''));fr.onerror=()=>resolve(null);fr.readAsDataURL(blob)})}
  voiceEnrollmentDraft={version:1,complete:true,enrolledAt:new Date().toISOString(),phrase:'Hey Ricky, this is '+(($('profileName')?.value||draft.name||'player').trim()),training:{count12to20:enrollTranscript.count,terms:enrollTranscript.terms},sample,mime,sampleStored:!!sample};
  return voiceEnrollmentDraft;
 }
 function pauseEnrollRecording(){try{if(enrollRecorder?.state==='recording')enrollRecorder.pause()}catch(_){}}
 function resumeEnrollRecording(){try{if(enrollRecorder?.state==='paused')enrollRecorder.resume()}catch(_){}}
 function cancelEnrollRecording(){try{if(enrollRecorder&&enrollRecorder.state!=='inactive')enrollRecorder.stop()}catch(_){};enrollStream?.getTracks?.().forEach(t=>t.stop());enrollRecorder=null;enrollStream=null;enrollChunks=[]}

 async function load(){if(loading)return loading;loading=(async()=>{try{const response=await window.ExtractorPublicProfiles.request('/api/profiles',{cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not load profiles.');roster=data.profiles;return true}catch(e){if(active&&$('profileStatus'))$('profileStatus').textContent=e.message;return false}finally{loading=null}})();return loading}
 function seatsUI(){return `<div class="player-seats">${[0,1].map(i=>`<label>PLAYER ${i+1}<select id="seat${i}" aria-label="Player ${i+1}"><option value="">${i?'Big Fella':'Challenger'}</option>${roster.map(p=>`<option value="${p.id}" ${seats[i]===p.id?'selected':''}>${escape(p.name)}${p.username?' · @'+escape(p.username):''}</option>`).join('')}</select></label>`).join('')}</div>`}
 function bindSeats(){[0,1].forEach(i=>{if(!$('seat'+i))return;$('seat'+i).onchange=e=>{const id=e.target.value;if(id&&seats[1-i]===id){e.target.value=seats[i];$('rosterNotice').textContent='Choose a different profile for each player.';return}seats[i]=id;localStorage.setItem('extractorPlayerSeats',JSON.stringify(seats));$('rosterNotice').textContent='Players ready: '+name(0)+' vs '+name(1)}})}
 function menuRoster(){const host=$('menuRoster');if(!host)return;host.innerHTML=seatsUI()+'<p id="rosterNotice" class="tiny">Choose your players, or use the default names.</p>';bindSeats()}
 function attachMenu(){active=false;stop();menuRoster();$('profilesButton').onclick=()=>welcome();load().then(()=>{if(!active)menuRoster()});return true}
 async function primeMic(){try{if(!navigator.mediaDevices?.getUserMedia)return false;const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(t=>t.stop());localStorage.setItem('extractorMicPrimed','1');return true}catch(_){return false}}
 function welcome(){
  window.stop?.();stop();const dialog=document.createElement('dialog');dialog.className='welcome-dialog';dialog.innerHTML=`<div class="eyebrow">THE EXTRACTOR NEXUS</div><h1>WELCOME<br>PLAYER</h1><p>Your name. Your game. Your place in the arena.</p><div class="welcome-actions"><button class="gold-access" id="registerPlayer">＋ REGISTER PLAYER</button><button id="returningPlayer">◉ RETURNING PLAYER</button><button id="guestPlayer">PLAY AS GUEST →</button></div><p class="tiny">PUBLIC DEVICE TEST · v0.13.3<br>Profiles stay on this device. No cloud account is created.</p>`;document.body.append(dialog);
  const close=()=>{stop();localStorage.setItem('extractorWelcome090Seen','1');dialog.close();dialog.remove()};
  dialog.querySelector('#registerPlayer').onclick=async()=>{await primeMic();close();open(window.menu)};dialog.querySelector('#returningPlayer').onclick=async()=>{await primeMic();close();open(window.menu)};dialog.querySelector('#guestPlayer').onclick=close;dialog.oncancel=()=>{stop();localStorage.setItem('extractorWelcome090Seen','1');dialog.remove()};dialog.showModal();
 }

 function draw(){
  $('app').innerHTML=`<div class="wrap profile-wrap"><section class="panel"><div class="row"><button id="profileBack">← MENU</button><span class="eyebrow">PLAYER PROFILES · v0.13.3 TEST</span></div><h1>Your place in the Nexus</h1><p class="muted">Save a name, optional username and optional selfie. Profiles and optional photos stay in this browser on this device.</p><div class="profile-roster">${roster.map(p=>`<button data-profile="${p.id}" class="profile-card">${p.photoUrl?`<img src="${escape(p.photoUrl)}" alt="">`:'<span class="avatar-placeholder">'+escape(p.name.slice(0,1).toUpperCase())+'</span>'}<span>${escape(p.name)}<small>${p.username?'@'+escape(p.username):'PLAYER'}${voiceBadge(p)}</small></span></button>`).join('')}<button id="newProfile">＋ NEW PLAYER</button></div><h2 id="profileTitle">${draft.id?'Edit player':'New player'}</h2><form id="profileForm"><label class="field">Name<input id="profileName" name="name" autocomplete="nickname" maxlength="50" required value="${escape(draft.name||'')}" placeholder="What should X-Man call you?"></label><label class="field">Username · optional<input id="profileUsername" name="username" maxlength="24" value="${escape(draft.username||'')}" placeholder="Your darts handle"></label><div class="row"><button type="button" id="profileVoice">🎙 ${draft.voiceEnrollment?.complete?'RE-ENROL VOICE':'START VOICE SETUP'}</button><button type="button" id="profileStop">STOP VOICE</button></div><p class="tiny">Voice setup can enrol this player for Ricky. The short training sample stays in this browser with the player profile and is never uploaded by this public test.</p><label class="field">Selfie · optional<input type="file" id="profilePhoto" accept="image/*" capture="user"></label><div class="profile-photo-preview" id="photoPreview">${draft.photoUrl?`<img src="${escape(draft.photoUrl)}" alt="Current profile photo">`:''}<video id="profileCamera" class="profile-camera hidden" playsinline muted autoplay></video></div><button type="button" id="removePhoto">REMOVE PHOTO</button><p id="profileStatus" class="status" role="status">${draft.id?'Update your details below.':'Type your details or start voice setup.'}</p><button class="primary" type="submit" id="profileSave">SAVE PLAYER</button></form><h2>Who's playing?</h2>${seatsUI()}<p id="rosterNotice" class="tiny">Choose different players for each side.</p><p class="tiny">Conversation memory and career statistics are not enabled yet.</p></section></div>`;
  $('profileBack').onclick=()=>{stop();active=false;returnTo?.();window.extractorMusic?.applyPolicy?.()};
  $('newProfile').onclick=()=>{stop();draft={};photo=null;removePhoto=false;voiceEnrollmentDraft=null;draw()};
  document.querySelectorAll('[data-profile]').forEach(el=>el.onclick=()=>{stop();draft={...roster.find(p=>p.id===el.dataset.profile)};photo=null;removePhoto=false;voiceEnrollmentDraft=draft.voiceEnrollment||null;draw()});
  $('profileVoice').onclick=()=>ask('name');$('profileStop').onclick=()=>{stop();$('profileStatus').textContent='Voice stopped. You can type or save the fields.'};
  $('removePhoto').onclick=()=>{photo=null;removePhoto=true;$('profilePhoto').value='';$('photoPreview').innerHTML='';$('profileStatus').textContent='Photo will be removed when you save.'};
  $('profilePhoto').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{photo=await compress(file);removePhoto=false;const img=document.createElement('img');img.src=photo;img.alt='New profile photo preview';$('photoPreview').replaceChildren(img);$('profileStatus').textContent='Photo ready. Save Player to store on this device.'}catch(error){$('profileStatus').textContent=error.message}};
  $('profileForm').onsubmit=save;bindSeats();
 }
 async function open(back,options={}){window.extractorMusic?.pause();if(!options.keepRicky)window.stop?.();window.ExtractorX01?.stop();window.ExtractorStage?.cancel();document.body.classList.remove('intro-active','bull-active','menu-active');active=true;returnTo=back;draft={};photo=null;removePhoto=false;voiceEnrollmentDraft=null;draw();$('profileStatus').textContent='Loading your player roster…';const ok=await load();if(!active)return false;if(ok){draw();$('profileStatus').textContent='Roster loaded. Add a player or select one to edit.'}return ok}
 async function compress(file){
  if(!file.type.startsWith('image/')||file.size>15000000)throw Error('Choose an image smaller than 15 MB.');
  const src=URL.createObjectURL(file);try{const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas'),size=Math.min(384,image.naturalWidth,image.naturalHeight);canvas.width=canvas.height=size;const edge=Math.min(image.naturalWidth,image.naturalHeight);canvas.getContext('2d').drawImage(image,(image.naturalWidth-edge)/2,(image.naturalHeight-edge)/2,edge,edge,0,0,size,size);const result=canvas.toDataURL('image/jpeg',.8);if(result.length>210000)throw Error('Photo is too detailed. Choose another image.');return result}finally{URL.revokeObjectURL(src)}
 }
 async function save(e){e?.preventDefault?.();stopCamera();stop();$('profileSave').disabled=true;$('profileStatus').textContent='Saving player…';try{const response=await window.ExtractorPublicProfiles.request('/api/profiles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:draft.id,name:$('profileName').value,username:$('profileUsername').value,photo,removePhoto,voiceEnrollment:voiceEnrollmentDraft||draft.voiceEnrollment||null})});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not save player.');const index=roster.findIndex(p=>p.id===data.profile.id);if(index<0)roster.push(data.profile);else roster[index]=data.profile;draft={...data.profile};photo=null;removePhoto=false;voiceEnrollmentDraft=data.profile.voiceEnrollment||null;if(registrationSeat!==null){seats[registrationSeat]=data.profile.id;localStorage.setItem('extractorPlayerSeats',JSON.stringify(seats))}const savedSeat=registrationSeat;registrationSeat=null;const shouldReturn=autoReturnAfterVoiceRegistration;autoReturnAfterVoiceRegistration=false;draw();$('profileStatus').textContent='Player saved. Voice enrolment '+(data.profile.voiceEnrollment?.complete?'ready.':'not completed.');voiceFlow='';window.ExtractorSpeak?.('Player saved. Welcome to the Nexus.',()=>{window.ExtractorRicky?.refresh?.();if(shouldReturn){stop();active=false;returnTo?.();setTimeout(()=>continueBootAfterRegistration(savedSeat),250)}},'mc')}catch(error){$('profileStatus').textContent=error.message}finally{if($('profileSave'))$('profileSave').disabled=false}}
 async function startCameraPreview(){
  stopCamera();const status=$('profileStatus'),video=$('profileCamera');
  if(!navigator.mediaDevices?.getUserMedia||!video){if(status)status.textContent='Camera unavailable. Say no selfie to continue.';return false}
  try{cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});video.srcObject=cameraStream;video.classList.remove('hidden');await video.play().catch(()=>{});if(status)status.textContent='Camera ready. Say “take it” when you are ready.';return true}catch(_){if(status)status.textContent='Camera permission is needed. Say no selfie to continue.';return false}
 }
 function captureCamera(){const video=$('profileCamera');if(!video||!cameraStream||!video.videoWidth)return false;const canvas=document.createElement('canvas'),size=384;canvas.width=canvas.height=size;const edge=Math.min(video.videoWidth,video.videoHeight);canvas.getContext('2d').drawImage(video,(video.videoWidth-edge)/2,(video.videoHeight-edge)/2,edge,edge,0,0,size,size);photo=canvas.toDataURL('image/jpeg',.82);removePhoto=false;const img=document.createElement('img');img.src=photo;img.alt='New profile selfie';$('photoPreview').replaceChildren(img);stopCamera();return true}
 async function saveFromRicky(){const form=$('profileForm');if(!form)return false;await save({preventDefault(){}});return true}
 function startRickyRegistration(options={}){
  window.ExtractorRicky?.stop?.();
  registrationSeat=Number.isInteger(options.seat)?options.seat:registrationSeat;autoReturnAfterVoiceRegistration=options.autoReturn!==false;
  (async()=>{voiceFlow='opening';await open(window.menu,{keepRicky:true});if(!active)return;voiceFlow='name';$('profileStatus').textContent='Ricky is registering a new player. What name should I call you?';rickySay('New player. What name should I call you?')})();
  return true;
 }
 function handleRicky(text){
  if(!voiceFlow)return false;const raw=String(text||'').trim(),n=raw.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
  if(voiceFlow.startsWith('boot-'))return handleBootRicky(raw,n);
  if(voiceFlow==='opening')return true;
  if(voiceFlow==='name'){const value=cleanName(raw);if(!value){rickySay('Give me your name.');return true}$('profileName').value=value;voiceFlow='username';$('profileStatus').textContent='Name captured. Say a username, or say skip.';rickySay('Got it. Username, or say skip.');return true}
  if(voiceFlow==='username'){$('profileUsername').value=cleanUsername(raw);voiceFlow='enroll-count';$('profileStatus').textContent='Voice enrolment: count from 12 to 20.';rickySay('Voice check. Count from twelve to twenty.',()=>startEnrollRecording());return true}
  if(voiceFlow==='enroll-count'){enrollTranscript.count=raw;voiceFlow='enroll-terms';pauseEnrollRecording();$('profileStatus').textContent='Now say: double, triple, bed, bull.';rickySay('Good. Now say double, triple, bed, bull.',resumeEnrollRecording);return true}
  if(voiceFlow==='enroll-terms'){enrollTranscript.terms=raw;voiceFlow='enroll-saving';finishEnrollRecording().finally(()=>{voiceFlow='selfie';$('profileStatus').textContent='Voice enrolled. Shall I take a selfie? Say yes or no.';rickySay('Voice enrolled. Shall I take a selfie?')});return true}
  if(voiceFlow==='enroll-saving')return true
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
 function closeBootDialog(){if(bootDialog){try{bootDialog.close()}catch(_){}bootDialog.remove();bootDialog=null}}
 function bootSay(text){const st=bootDialog?.querySelector?.('#voiceBootStatus');if(st)st.textContent=text;rickySay(text)}
 function seatProfile(index,p){if(!p)return false;seats[index]=p.id;localStorage.setItem('extractorPlayerSeats',JSON.stringify(seats));menuRoster();return true}
 function matchProfile(spoken){const q=norm(spoken).replace(/^(?:i am|i m|im|this is|player) /,'');if(!q)return null;return roster.find(p=>{const n=norm(p.name),u=norm(p.username);return q===n||q===u||q.includes(n)||n.includes(q)})||null}
 function showBootDialog(){
  closeBootDialog();bootDialog=document.createElement('dialog');bootDialog.className='welcome-dialog voice-boot-dialog';bootDialog.innerHTML=`<div class="eyebrow">RICKY VOICE RECOGNITION · v0.13.3</div><h1>WHO'S AT THE OCHE?</h1><p id="voiceBootStatus" class="status">Ricky is listening.</p><p class="tiny">Voice enrolment is stored with each player profile on this device. Speaker matching is experimental; Ricky can always fall back to your spoken player name.</p><div class="welcome-actions"><button id="bootRegister">＋ REGISTER PLAYER</button><button id="bootSkip">SKIP VOICE CHECK →</button></div>`;document.body.append(bootDialog);
  bootDialog.querySelector('#bootRegister').onclick=()=>{stopSetupListener();closeBootDialog();voiceFlow='';startRickyRegistration({seat:0,autoReturn:true})};bootDialog.querySelector('#bootSkip').onclick=()=>{stopSetupListener();voiceFlow='';closeBootDialog();window.ExtractorRicky?.refresh?.()};bootDialog.oncancel=e=>{e.preventDefault();stopSetupListener();voiceFlow='';closeBootDialog();window.ExtractorRicky?.refresh?.()};bootDialog.showModal();
 }
 async function startBootVoiceWizard(){if(bootShown||active)return false;bootShown=true;window.ExtractorRicky?.stop?.();await load();showBootDialog();voiceFlow='boot-loggedin';bootSay('Are you logged in?');return true}
 function finishBoot(){stopSetupListener();voiceFlow='';closeBootDialog();menuRoster();rickySay('Players ready. Pick your game.',()=>window.ExtractorRicky?.refresh?.())}
 function continueBootAfterRegistration(savedSeat){if(savedSeat===0){showBootDialog();voiceFlow='boot-player2-present';bootSay('Player one saved. Is player two joining?')}else finishBoot()}
 function handleBootRicky(raw,n){
  const yes=/^(yes|yeah|yep|correct|i am|we are|logged in|yup)$/.test(n),no=/^(no|nah|nope|not yet|new player|register)$/.test(n);
  if(voiceFlow==='boot-loggedin'){if(yes){if(!roster.length){closeBootDialog();startRickyRegistration({seat:0,autoReturn:true});return true}voiceFlow='boot-player1-name';bootSay('Good. Say your player name.');return true}if(no){closeBootDialog();startRickyRegistration({seat:0,autoReturn:true});return true}bootSay('Say yes if you are logged in, or no to register.');return true}
  if(voiceFlow==='boot-player1-name'){if(n==='register'||n==='new player'){closeBootDialog();startRickyRegistration({seat:0,autoReturn:true});return true}const p=matchProfile(raw);if(!p){bootSay('I could not match that player. Say the saved player name again, or say register.');return true}seatProfile(0,p);voiceFlow='boot-player2-present';bootSay('Welcome '+p.name+'. Is player two joining?');return true}
  if(voiceFlow==='boot-player2-present'){if(no){finishBoot();return true}if(yes){voiceFlow='boot-player2-loggedin';bootSay('Is player two already logged in?');return true}bootSay('Is player two joining? Yes or no.');return true}
  if(voiceFlow==='boot-player2-loggedin'){if(yes){voiceFlow='boot-player2-name';bootSay('Player two, say your saved player name.');return true}if(no){closeBootDialog();startRickyRegistration({seat:1,autoReturn:true});return true}bootSay('Say yes if player two is logged in, or no to register them.');return true}
  if(voiceFlow==='boot-player2-name'){if(n==='register'||n==='new player'){closeBootDialog();startRickyRegistration({seat:1,autoReturn:true});return true}const p=matchProfile(raw);if(!p){bootSay('I could not match player two. Say the saved name again, or say register.');return true}if(p.id===seats[0]){bootSay('That is already player one. Give me a different player.');return true}seatProfile(1,p);finishBoot();return true}
  return false
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
 window.ExtractorProfiles={name,escape,attachMenu,open,stop,load,startRickyRegistration,startBootVoiceWizard,handleRicky,isVoiceFlowActive:()=>!!voiceFlow,stopCamera};
})();
