
const $=id=>document.getElementById(id), T=['20','19','18','17','16','15','14','13','12','DOUBLE','TRIPLE','BED','BULL'],N=Array.from({length:20},(_,i)=>20-i);
let menuCarouselTimer=null;
let state={screen:'menu',players:[fresh(),fresh()],turn:0,darts:[],mult:1,phase:'throw',round:1},options=[],selected=0,history=[],listening=null,clock=null,handoffClock=null,token=0;
function playerName(i){return window.ExtractorProfiles?.name(i)||['Challenger','Big Fella'][i]}
function playerLabel(i){return window.ExtractorProfiles?.escape(playerName(i))||playerName(i)}
function fresh(){return {points:0,shang:0,marks:{}}}
try{let saved=JSON.parse(localStorage.getItem('extractorMickeyBeta'));if(saved&&saved.players&&saved.players.length===2)state=saved}catch(e){}
// A restored review always offers a fresh correction window.
if(state.phase==='done'&&state.reviewWaiting){state.reviewWaiting=false;delete state.handoffAt;}
function save(){try{localStorage.setItem('extractorMickeyBeta',JSON.stringify(state))}catch(e){}}
function snapshot(){history.push(JSON.stringify(state))}
let rickySpeechGeneration=0;
function stop(){rickySpeechGeneration++;window.ExtractorRecordedRicky?.stop();window.ExtractorSpeechBusy=false;clearTimeout(handoffClock);handoffClock=null;window.extractorMusic?.duck('recognition',false);window.extractorMusic?.duck('speech',false);token++;clearInterval(clock);clock=null;if(listening){try{listening.abort()}catch(e){}listening=null}try{speechSynthesis.cancel()}catch(e){}}
function speak(s,cb,role='announcer'){const reaction=window.ExtractorRecordedRicky?.take();window.ExtractorRecordedRicky?.stop();const speechRun=++rickySpeechGeneration;try{window.dispatchEvent(new CustomEvent('extractor-speech-start',{detail:{text:String(s||''),role}}))}catch(_){}const complete=()=>{if(speechRun!==rickySpeechGeneration)return;if(reaction&&window.ExtractorRecordedRicky)window.ExtractorRecordedRicky.reaction(reaction,cb);else cb?.()};try{if(!('speechSynthesis' in window)){try{window.dispatchEvent(new CustomEvent('extractor-speech-end',{detail:{text:String(s||''),role}}))}catch(_){}complete();return}window.ExtractorSpeechBusy=true;speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(s);u.lang='en-AU';u.rate=.95;const available=speechSynthesis.getVoices?.()||[];const preferred=available.find(v=>/^en/i.test(v.lang)&&/\b(Lee|Daniel|Arthur|Gordon|Alex|David|George)\b/i.test(v.name));if(preferred){u.voice=preferred;u.lang=preferred.lang;}if(role==='mc'){let choice='';try{choice=localStorage.getItem('extractorMCVoice')||''}catch(_){}const ricky=choice==='__ricky__';const mc=(ricky?available.find(v=>/^en/i.test(v.lang)&&/\b(Daniel|Arthur|Gordon|Alex|David|George)\b/i.test(v.name)):available.find(v=>v.voiceURI===choice))||available.find(v=>/^en/i.test(v.lang)&&/\b(Lee|Alex|David)\b/i.test(v.name))||preferred;if(mc){u.voice=mc;u.lang=mc.lang}u.pitch=ricky?.92:.8;u.rate=ricky?1.02:.9;}let finished=false;const finish=()=>{if(finished||speechRun!==rickySpeechGeneration)return;finished=true;window.ExtractorSpeechBusy=false;window.extractorMusic?.duck('speech',false);try{window.dispatchEvent(new CustomEvent('extractor-speech-end',{detail:{text:String(s||''),role}}))}catch(_){}complete()};u.onend=finish;u.onerror=finish;window.extractorMusic?.duck('speech',true);speechSynthesis.speak(u)}catch(e){if(speechRun===rickySpeechGeneration){window.ExtractorSpeechBusy=false;window.extractorMusic?.duck('speech',false);try{window.dispatchEvent(new CustomEvent('extractor-speech-end',{detail:{text:String(s||''),role}}))}catch(_){}complete()}}}
window.ExtractorSpeak=speak;
window.ExtractorInterruptSpeech=()=>{rickySpeechGeneration++;window.ExtractorRecordedRicky?.stop();window.ExtractorSpeechBusy=false;window.extractorMusic?.duck('speech',false);window.extractorMusic?.duck('ricky-recording',false);try{speechSynthesis.cancel()}catch(_){}};
// These three cue slots will use Big Fella recordings when supplied.
function cue(name,cb){if(window.ExtractorStage)return window.ExtractorStage.say(name,cb);speak({chooseWeapon:'Choose your weapon.',selected:'Selected.',selectionTime:'Selection time.'}[name],cb)}
function marks(n){return n?'X'.repeat(Math.min(n,3)):'—'}
function targetClosed(key){return state.players.every(p=>(p.marks[key]||0)>=3)}
function scoreCall(n,cb,name){const value=Math.max(0,Math.min(180,Math.round(Number(n)||0)));let choice='';try{choice=localStorage.getItem('extractorMCVoice')||''}catch(_){}speak(choice==='__ricky__'?String(value)+'. '+(name||playerName(state.turn))+'.':String(value),cb,'mc')}
function postScoreBanter(total,name,topic='next'){let choice='';try{choice=localStorage.getItem('extractorMCVoice')||''}catch(_){}if(choice!=='__ricky__'||window.ExtractorBanter?.isEnabled?.()===false)return;const line=window.ExtractorBanter?.pick?.(topic)||window.ExtractorBanter?.pick?.(Number(total)>=60?'good':Number(total)<20?'low':'next');if(line)speak(line,null,'mc')}
window.ExtractorPostScoreBanter=postScoreBanter;
function rickyShanghai(){window.ExtractorRecordedRicky?.queue('shanghai');let choice='';try{choice=localStorage.getItem('extractorMCVoice')||''}catch(_){}if(choice==='__ricky__')speak("That's a fucking Shang dog, you goddamn son of a bitch!",null,'mc')}
function effectSignature(o){return JSON.stringify([Object.entries(o.marks||{}).sort(),Number(o.points)||0])}
function collapseEquivalentOptions(items){const seen=new Set();return items.filter(o=>{const sig=effectSignature(o);if(seen.has(sig))return false;seen.add(sig);return true})}
function header(){return `<div class="eyebrow">SHARPHUB DYNAMICS</div><div class="brand">EXTRACTOR'S PLAY</div><div class="subtitle">FEATURING THE BIG FELLA</div>`}
function ensureRickyDefault(){
 try{if(!localStorage.getItem('extractorMCVoice'))localStorage.setItem('extractorMCVoice','__ricky__')}catch(_){}
}
async function permissionState(name){
 try{if(!navigator.permissions?.query)return 'prompt';return (await navigator.permissions.query({name})).state}catch(_){return 'prompt'}
}

const DEVICE_ACCESS_KEY='extractorDeviceAccess';
function getDeviceAccess(){try{return localStorage.getItem(DEVICE_ACCESS_KEY)||'both'}catch(_){return 'both'}}
function saveDeviceAccess(mode){try{localStorage.setItem(DEVICE_ACCESS_KEY,mode)}catch(_){}return mode}
async function applyDeviceAccess(mode,status){
 mode=['both','mic','camera','manual'].includes(mode)?mode:'both';saveDeviceAccess(mode);
 let mic=false,camera=false;
 if(mode==='manual'){
  try{localStorage.removeItem('extractorMicPrimed');localStorage.removeItem('extractorCameraPrimed')}catch(_){}
  window.ExtractorRicky?.stop?.();
  if(status)status.textContent='DEVICE ACCESS MANUAL · Ricky mic stopped. Camera opens only from browser controls.';
  return {mic,camera};
 }
 if(!navigator.mediaDevices?.getUserMedia){if(status)status.textContent='Camera/microphone unavailable in this browser.';return {mic,camera}}
 if(mode==='both'||mode==='mic'){
  try{const a=await navigator.mediaDevices.getUserMedia({audio:true});a.getTracks().forEach(t=>t.stop());mic=true;localStorage.setItem('extractorMicPrimed','1')}catch(_){try{localStorage.removeItem('extractorMicPrimed')}catch(__){}}
 } else {try{localStorage.removeItem('extractorMicPrimed')}catch(_){};window.ExtractorRicky?.stop?.()}
 if(mode==='both'||mode==='camera'){
  try{const v=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}});v.getTracks().forEach(t=>t.stop());camera=true;localStorage.setItem('extractorCameraPrimed','1')}catch(_){try{localStorage.removeItem('extractorCameraPrimed')}catch(__){}}
 } else {try{localStorage.removeItem('extractorCameraPrimed')}catch(_){} }
 if(status)status.textContent=(mode==='mic'?'MIC READY · CAMERA ON REQUEST':mode==='camera'?'CAMERA READY · MIC OFF':(mic?'MIC READY':'MIC NOT ALLOWED')+' · '+(camera?'CAMERA READY':'CAMERA NOT ALLOWED'));
 if(mic)window.ExtractorRicky?.retry?.();
 return {mic,camera};
}
async function primeDevicePermissions(status){return applyDeviceAccess('both',status)}
async function bootPermissions(){
 ensureRickyDefault();
 // Do not trust navigator.permissions as the gate. Chrome/Android can report stale or
 // unsupported permission state even when getUserMedia is already allowed. Probe the
 // actual devices once; if permission is already granted this is silent, otherwise the
 // browser itself shows the native permission prompt.
 const direct=await primeDevicePermissions();
 if(direct.mic){intro();return}
 document.body.classList.remove('menu-active','intro-active','bull-active');
 $('app').innerHTML=`<div class="wrap permission-wrap"><section class="panel permission-panel"><div class="eyebrow">EXTRACTOR'S PLAY · v0.13.3</div><h1>RICKY NEEDS EARS &amp; EYES</h1><p>Microphone and camera access did not open. Check the browser permission popup or site settings, then retry.</p><p id="permissionStatus" class="status" role="status">${direct.mic?'MIC READY':'MIC NOT ALLOWED'} · ${direct.camera?'CAMERA READY':'CAMERA NOT ALLOWED'}</p><button id="allowDevices" class="primary">🎙 📷 RETRY MIC + CAMERA</button><button id="continueLimited">CONTINUE WITHOUT ONE OR BOTH</button><p class="tiny">Your browser controls permission. If access is already allowed, retry should continue without another popup.</p></section></div>`;
 const go=()=>intro();
 $('allowDevices').onclick=async()=>{const b=$('allowDevices');b.disabled=true;$('permissionStatus').textContent='Checking microphone and camera…';const ok=await primeDevicePermissions($('permissionStatus'));b.disabled=false;if(ok.mic)setTimeout(go,200)};
 $('continueLimited').onclick=go;
}
function requestMenuMic(){
 const note=$('micReady');
 if(!navigator.mediaDevices?.getUserMedia){if(note)note.textContent='MIC unavailable · touch still works';return Promise.resolve(false)}
 return navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{stream.getTracks().forEach(t=>t.stop());try{localStorage.setItem('extractorMicPrimed','1')}catch(_){}if(note)note.textContent='MIC PERMISSION READY · starts in game';return true}).catch(()=>{if(note)note.textContent='MIC permission needed';return false});
}
function openSettings(){
 const d=$('settingsDialog');if(!d)return;
 d.onclose=()=>window.ExtractorRicky?.refresh?.();d.showModal();
 const level=window.extractorMusic?.getLevel?.()??1;$('settingsVolume').value=Math.round(level*100);$('settingsVolumeValue').textContent=Math.round(level*100)+'%';const da=$('deviceAccess');if(da)da.value=getDeviceAccess();
}
function menu(){
 clearInterval(menuCarouselTimer);menuCarouselTimer=null;
 try{localStorage.setItem('extractorActiveMode','menu')}catch(_){}
 if(state.phase==='done'&&state.reviewWaiting){state.reviewWaiting=false;delete state.handoffAt;}
 window.ExtractorStage?.cancel();document.body.classList.remove('bull-active','intro-active');document.body.classList.add('menu-active');state.screen='menu';state.needsBull=false;save();stop();
 $('app').innerHTML=`<div class="nexus-home"><section class="nexus-hero">
   <div class="nexus-title">${header()}<p class="tiny nexus-version">PUBLIC DEVICE TEST · v0.13.3</p></div>
   <button id="settingsButton" class="settings-gear" aria-label="Settings">⚙</button>
   <div class="big-fella-decks" aria-label="Big Fella at the decks"></div>
   <div class="extractor-guard" aria-hidden="true"></div>
   <div class="nexus-screen"><img id="nexusRotator" src="nexus-wide.png" alt="Nexus display"><span>NEXUS FEED</span></div>
 </section>
 <section class="quick-play panel">
   <button id="profilesButton" class="login-button">◉ PLAYER LOGIN / REGISTER</button>
   <div id="micReady" class="mic-ready">MIC STARTING · say "Hey Ricky" when ready</div>
   <div id="menuRoster"></div>
   <h2 class="game-mode-label">CHOOSE YOUR WEAPON</h2>
   <div class="menuButtons" aria-label="Choose a game">
    <button id="mickey" class="game-tile gold-tile"><span class="mickey-emblem" aria-hidden="true"><i></i><i></i><i></i></span><span class="tile-copy">MICKEY MOUSE<small>THE GOLD STANDARD</small></span></button>
    <button data-x01="501" class="game-tile marquee-tile"><span class="extractor-head" aria-hidden="true"></span><span class="laser-line" aria-hidden="true"></span><span class="tile-copy">501<small>THE MAIN EVENT</small></span></button>
    <button data-x01="301" class="game-tile dart-tile"><span class="tile-dart" aria-hidden="true"></span><span class="tile-copy">301<small>DOUBLE OUT</small></span></button>
    <button data-x01="101" class="game-tile dart-tile dart-tile-two"><span class="tile-dart" aria-hidden="true"></span><span class="tile-copy">101<small>DOUBLE OUT</small></span></button>
   </div>
 </section>
 <dialog id="settingsDialog" class="settings-dialog"><div class="settings-head"><strong>SETTINGS</strong><button id="closeSettings" aria-label="Close settings">✕</button></div>
   <div class="settings-stack">
    <button id="replayIntro">▶ EXTRACTOR INTRO</button>
    <button id="banterToggle">X-MAN BANTER · ${window.ExtractorBanter?.isEnabled()?'ON':'OFF'}</button>
    <div class="mc-voice-control"><label for="mcVoice">X-MAN MC VOICE</label><select id="mcVoice"><option value="">AUTOMATIC · ORIGINAL MC</option><option value="__ricky__">RICKY · CHAOS MODE</option></select><button id="testMC">▶ TEST MC</button></div>
    <div class="ricky-mic-settings"><label>RICKY MICROPHONE</label><p id="rickyMicStatus" class="tiny" role="status">MIC STARTING · checking live listener.</p><button id="rickyMicRetry" type="button">🎙 RECONNECT MIC</button></div><div class="device-access-control"><label for="deviceAccess">MIC / CAMERA ACCESS</label><select id="deviceAccess"><option value="both">MIC ON · CAMERA READY</option><option value="mic">MIC ON · CAMERA ON REQUEST</option><option value="camera">MIC OFF · CAMERA READY</option><option value="manual">MANUAL / OFF</option></select><p id="deviceAccessStatus" class="tiny">Camera permission only prepares access; the camera is not continuously recording.</p></div>
    <label class="settings-volume" for="settingsVolume">NEXUS SOUND <output id="settingsVolumeValue">100%</output><input id="settingsVolume" type="range" min="0" max="100" value="100"></label>
    <div class="music-mode-control"><label for="musicMode">NEXUS MUSIC</label><select id="musicMode"><option value="always">PLAY ALWAYS</option><option value="voice">VOICE CONTROLLED · HEY RICKY</option><option value="off">OFF</option></select></div>
    <div class="spotify-control"><button id="spotifyToggle" type="button">♫ SPOTIFY</button><div id="spotifyPanel" class="spotify-panel hidden"><div class="spotify-actions"><input id="spotifyUrl" type="url" inputmode="url" placeholder="Paste Spotify track / album / playlist link"><button id="spotifyLoad" type="button">LOAD PLAYER</button><button id="spotifyOpen" type="button">OPEN SPOTIFY</button></div><p id="spotifyStatus" class="tiny">Spotify stays inside Settings. Paste a Spotify link to load the player here.</p><iframe id="spotifyFrame" class="spotify-frame hidden" title="Spotify player" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div></div>
    <button id="developerButton">DEVELOPER · FILES / INFO / MIC</button>
    <button id="knowledgeButton">X-MAN KNOWLEDGE &amp; MEMORY</button>
   </div></dialog></div>`;
 const rotator=$('nexusRotator'),rot=['nexus-wide.png','nexus-group.png','agent-k-stevie.png','extractor-entrance-v1.png','big-fella-decks.png'];let ri=0;if(typeof setInterval==='function')menuCarouselTimer=setInterval(()=>{if(!rotator?.isConnected){clearInterval(menuCarouselTimer);return}ri=(ri+1)%rot.length;rotator.src=rot[ri]},4800);
 $('settingsButton').onclick=openSettings;$('closeSettings').onclick=()=>$('settingsDialog').close();$('replayIntro').onclick=()=>{$('settingsDialog').close();intro()};
 $('banterToggle').onclick=()=>{$('banterToggle').textContent='X-MAN BANTER · '+(window.ExtractorBanter.toggle()?'ON':'OFF')};
 $('developerButton').onclick=()=>{$('settingsDialog').close();window.ExtractorDeveloper?.open(menu)};$('knowledgeButton').onclick=()=>{$('settingsDialog').close();window.ExtractorMemory?.open(menu)};
 $('settingsVolume').oninput=e=>{const v=Number(e.target.value)/100;window.extractorMusic?.setLevel(v);$('settingsVolumeValue').textContent=Math.round(v*100)+'%'};const deviceAccess=$('deviceAccess');if(deviceAccess){deviceAccess.value=getDeviceAccess();deviceAccess.onchange=async()=>{deviceAccess.disabled=true;await applyDeviceAccess(deviceAccess.value,$('deviceAccessStatus'));deviceAccess.disabled=false;window.ExtractorRicky?.refresh?.()}};const musicMode=$('musicMode');if(musicMode){musicMode.value=window.extractorMusic?.getMode?.()||'always';musicMode.onchange=()=>window.extractorMusic?.setMode?.(musicMode.value)};
 const spotifyEmbed=value=>{try{const u=new URL(String(value||'').trim());if(!/(^|\.)spotify\.com$/i.test(u.hostname)&&u.hostname.toLowerCase()!=='open.spotify.com')return '';const m=u.pathname.match(/^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)(?:\/|$)/);return m?`https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`:''}catch(_){return ''}};
 const spotifyPanel=$('spotifyPanel'),spotifyFrame=$('spotifyFrame'),spotifyUrl=$('spotifyUrl'),spotifyStatus=$('spotifyStatus');let savedSpotify='';try{savedSpotify=localStorage.getItem('extractorSpotifyUrl')||''}catch(_){}if(savedSpotify){spotifyUrl.value=savedSpotify;const src=spotifyEmbed(savedSpotify);if(src){spotifyFrame.src=src;spotifyFrame.classList.remove('hidden');spotifyStatus.textContent='Spotify player ready.'}}
 $('spotifyToggle').onclick=()=>spotifyPanel.classList.toggle('hidden');$('spotifyOpen').onclick=()=>{window.extractorMusic?.pause();window.open('https://open.spotify.com/','_blank','noopener,noreferrer')};$('spotifyLoad').onclick=()=>{const src=spotifyEmbed(spotifyUrl.value);if(!src){spotifyStatus.textContent='Paste a Spotify track, album, playlist, episode or show link.';return}try{localStorage.setItem('extractorSpotifyUrl',spotifyUrl.value.trim())}catch(_){}window.extractorMusic?.pause();spotifyFrame.src=src;spotifyFrame.classList.remove('hidden');spotifyStatus.textContent='Spotify player loaded. Nexus music paused so the two do not fight.'};
 bindMCVoices();
 const beginMickey=()=>{stop();try{localStorage.setItem('extractorActiveMode','mickey')}catch(_){}const begin=winner=>{if(winner!==undefined){state.turn=winner;state.starter=winner;state.needsBull=false}state.screen='game';save();render();window.ExtractorRicky?.refresh()};const freshGame=state.round===1&&state.phase==='throw'&&!state.darts.length&&state.players.every(p=>p.points===0&&Object.keys(p.marks).length===0);if(freshGame&&window.ExtractorStage)window.ExtractorStage.bullOff(begin);else{begin();cue('selected')}};
 $('mickey').onclick=()=>{clearInterval(menuCarouselTimer);beginMickey()};
 window.ExtractorX01?.bindMenu();
 const profilesAttached=window.ExtractorProfiles?.attachMenu?.();
 if(!profilesAttached)cue('chooseWeapon');
 // Ricky's login / voice-enrolment wizard is part of the actual first menu boot.
 // Do not hide this behind profile-loader timing; launch it explicitly once the menu DOM exists.
 setTimeout(()=>window.ExtractorProfiles?.startBootVoiceWizard?.(),120);
 const pb=$('profilesButton');if(pb){const original=pb.onclick;pb.onclick=e=>original?.call(pb,e)}
 window.ExtractorRicky?.refresh?.();
}

function bindMCVoices(){
 const select=$('mcVoice');if(!select)return;while(select.options.length>2)select.remove(2);let chosen='';try{chosen=localStorage.getItem('extractorMCVoice')||''}catch(_){}for(const voice of (window.speechSynthesis?.getVoices?.()||[]).filter(v=>/^en/i.test(v.lang))){const option=document.createElement('option');option.value=voice.voiceURI;option.textContent=voice.name+' · '+voice.lang;option.selected=voice.voiceURI===chosen;select.append(option)}select.value=chosen;select.onchange=()=>{stop();localStorage.setItem('extractorMCVoice',select.value);window.ExtractorRicky?.refresh()};if(!select.parentElement.querySelector('.ricky-recordings'))window.ExtractorRecordedRicky?.mount(select.parentElement);$('testMC').onclick=()=>{stop();if(select.value==='__ricky__'){window.ExtractorRecordedRicky?.preview();return}speak(select.value==='__ricky__'?'Ricky is live. Hey Ricky, wake up. Let us throw some bloody darts.':'Welcome to the Nexus. I am the Extractor. Three darts. One arena. Let us make them count.',null,'mc')};
}
function render(){
 document.body.classList.remove('menu-active');
 if(state.screen==='menu')return menu();
 let [a,b]=state.players;
 $('app').innerHTML=`<div class="wrap">${header()}<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0"><button id="home" style="padding:5px 9px">⌂ MENU</button><b style="letter-spacing:1px;font-size:12px">MICKEY MOUSE · ROUND ${state.round}</b><button id="new" style="padding:5px 9px">↻ NEW</button></div>
 <div class="scores"><div class="score ${state.turn===0?'active':''}"><div><small class="tiny">LEFT</small><div>${playerLabel(0)}</div></div><strong>${a.points}</strong></div><div class="score ${state.turn===1?'active':''}"><div><small class="tiny">RIGHT</small><div>${playerLabel(1)}</div></div><strong>${b.points}</strong></div></div>
 ${state.lastClaim?`<div class="claim-receipt" role="status">${window.ExtractorProfiles?.escape(state.lastClaim)||state.lastClaim}</div>`:''}<div class="grid"><section class="panel"><div class="cyan" style="font-weight:900;font-size:12px;text-align:center">TARGETS · 3 X TO OPEN</div><div class="targetrow tiny"><span>${playerLabel(0)}</span><span>TARGET</span><span>${playerLabel(1)}</span></div>${T.map(k=>`<div class="targetrow ${targetClosed(k)?'target-closed':''}"><span class="mark">${marks(a.marks[k]||0)}</span><span class="target">${k}</span><span class="mark">${marks(b.marks[k]||0)}</span></div>`).join('')}<div class="targetrow" style="border-top:1px solid #5ba1cb"><span class="cyan">${a.shang}</span><span class="target">SHANGHAIS</span><span class="cyan">${b.shang}</span></div><div class="tiny" style="text-align:center;margin-top:6px">+100 PER SHANGHAI · BONUS ONLY</div></section>
 <section class="panel"><div class="row"><b class="cyan">THROWS · ${playerLabel(state.turn)}</b><small class="tiny">${state.darts.length}/3</small></div>
 <div class="pills">${[0,1,2].map(i=>`<div class="pill"><span class="tiny">DART ${i+1}</span><br>${state.darts[i]?dartLabel(state.darts[i]):'—'}</div>`).join('')}</div>
 <div class="row" id="multipliers">${[1,2,3].map(m=>`<button data-m="${m}" class="${state.mult===m?'sel':''}" ${state.phase!=='throw'?'disabled':''}>${['','SINGLE','DOUBLE','TRIPLE'][m]}</button>`).join('')}</div>
 <div class="tiny hit-label">HIT ENTRY · 20–12</div><div class="pad mickey-main-pad" style="margin-top:7px">${N.filter(n=>n>=12).map(n=>`<button data-num="${n}" ${state.phase!=='throw'?'disabled':''}>${n}</button>`).join('')}</div>
 <details class="lower-hits"><summary>OTHER HITS · 11–1</summary><div class="pad">${N.filter(n=>n<12).map(n=>`<button data-num="${n}" ${state.phase!=='throw'?'disabled':''}>${n}</button>`).join('')}</div></details>
 <div class="row" style="margin-top:7px"><button data-bull="1" ${state.phase!=='throw'?'disabled':''}>GREEN 25</button><button data-bull="2" ${state.phase!=='throw'?'disabled':''}>RED 50</button><button id="miss" ${state.phase!=='throw'?'disabled':''}>MISS</button></div>
 <div class="row" style="margin-top:8px"><button id="undo">↶ UNDO</button><button id="changeClaim" class="${state.phase==='done'&&state.reviewBase?'':'hidden'}">CHANGE DECISION</button><button id="next" ${state.phase!=='done'?'disabled':''}>NEXT PLAYER →</button></div>
 <div class="tiny" style="margin-top:8px">Manual input • OMNI integration pending • Scores saved on this device</div></section></div>
 <section class="ricky-mic-bar" aria-label="Ricky microphone"><p id="rickyMicStatus" role="status">MIC STARTING · allow microphone access if prompted.</p><button id="rickyMicRetry" type="button">🎙 RECONNECT MIC</button></section><section class="panel voice" id="voicepanel"><div class="row"><span style="font-size:25px;flex:0">🤖</span><div style="flex:5"><b class="cyan" style="font-size:12px">EXTRACTOR VOICE CONTROL · v0.13.3</b><div id="message" class="status">${state.phase==='throw'?'Say your darts, or enter them by touch. Then choose what to take.':state.phase==='choose'?"Selection time.":state.phase==='win'?'GAME OVER!':'Turn scored. Next player.'}</div></div><strong id="seconds" style="text-align:right;flex:0">—</strong></div>
 <div id="choices" class="options ${state.phase==='choose'?'':'hidden'}"></div>
 <div class="row" style="margin-top:7px"><button id="listen" class="primary hidden">🎙️ LAUNCH WHEN READY</button><button id="pause" class="hidden">⏸ WAIT A SEC</button><button id="confirm" class="${state.phase==='choose'?'primary':'hidden'}" ${state.phase==='choose'?'':'disabled'}>✓ CONFIRM CLAIM</button></div>
 <div id="info" class="tiny muted" style="margin-top:7px">Microphone and speech depend on Safari/browser support. Touch controls always work.</div></section></div>`;
 $('home').onclick=()=>{state.screen='menu';save();menu()};
 $('new').onclick=()=>{if(confirm('Start a new game?')){stop();state={screen:'game',players:[fresh(),fresh()],turn:0,darts:[],mult:1,phase:'throw',round:1};history=[];options=[];state.needsBull=true;save();if(window.ExtractorStage)window.ExtractorStage.bullOff(winner=>{state.turn=winner;state.starter=winner;state.needsBull=false;save();render()});else render()}};
 document.querySelectorAll('[data-m]').forEach(el=>el.onclick=()=>{state.mult=+el.dataset.m;save();render()});
 document.querySelectorAll('[data-num]').forEach(el=>el.onclick=()=>add({n:+el.dataset.num,m:state.mult}));
 document.querySelectorAll('[data-bull]').forEach(el=>el.onclick=()=>add({n:'BULL',m:+el.dataset.bull}));
 $('miss').onclick=()=>add({n:'MISS',m:0});
 $('undo').onclick=undo;$('changeClaim').onclick=()=>changeDecision();
 $('next').onclick=()=>{if(state.phase!=='done')return;finishReview()};
 $('listen').onclick=listen;
 $('pause').onclick=pause;
 $('confirm').onclick=commit;
 if(state.phase==='throw'){$('listen').classList.remove('hidden');$('listen').textContent='🎙️ SAY YOUR DARTS';}
 $('listen').onclick=()=>listen(state.phase==='throw'?'darts':state.phase==='done'?'review':'claim');
 if(state.phase==='done'&&state.reviewBase){$('listen').classList.remove('hidden');$('listen').textContent='🎙 CHANGE MY CLAIM';}
 if(state.phase==='done'){$('message').textContent='Tally locked. Change Decision or move to the next player.';}
 if(state.phase==='choose'){options=collapseEquivalentOptions(build());selected=state.choice===-1?-1:Number.isInteger(state.choice)&&state.choice>=0&&state.choice<options.length?state.choice:-1;state.choice=selected;save();showOptions();if(options.length>1)$('listen').classList.remove('hidden')}
 window.ExtractorRicky?.refresh();
}
function dartLabel(d){return d.n==='MISS'?'MISS':d.n==='BULL'?(d.m===2?'RED 50':'GREEN 25'):`${['','S','D','T'][d.m]}${d.n}`}
function add(d){
 if(state.phase!=='throw'||state.darts.length>=3)return;
 stop();snapshot();state.darts.push(d);state.mult=1;
 if(state.darts.length===3){state.phase='choose';options=collapseEquivalentOptions(build());if(options.length<=1){selected=0;state.choice=0;save();commit({automatic:true,noChoice:true})}else{selected=-1;state.choice=-1;save();render();$('message').textContent='There is more than one valid result. Say what you will take, or tap a choice.';$('listen').classList.remove('hidden');}}
 else{save();render()}
}

function getAllocations(d){if(d.n==='MISS')return [{key:'MISS',marks:0}];if(d.n==='BULL')return [{key:'BULL',marks:d.m}];let result=T.includes(String(d.n))?[{key:String(d.n),marks:d.m}]:d.m===1?[{key:'MISS',marks:0}]:[];if(d.m===2)result.push({key:'DOUBLE',marks:1});if(d.m===3)result.push({key:'TRIPLE',marks:1});return result}
function shanghai(){let d=state.darts;return d.length===3&&d.every(x=>typeof x.n==='number'&&x.n===d[0].n)&&d.map(x=>x.m).sort().join('')==='123'}
function bed(){let d=state.darts;return d.length===3&&d.every(x=>x.n!== 'MISS'&&x.n===d[0].n)}
function calculate(alloc){
 let p=state.players[state.turn],op=state.players[1-state.turn],mk={...p.marks},pts=0;
 for(let hit of alloc){let key=hit.key;if(key==='MISS')continue;let before=mk[key]||0;let space=Math.max(0,3-before);let extra=Math.max(0,hit.marks-space);mk[key]=Math.min(3,before+hit.marks);
 if((op.marks[key]||0)<3){if(/^\d+$/.test(key))pts+=extra*Number(key);if(key==='BULL')pts+=hit.pointExcess||extra*25}
 }
 return {marks:mk,points:pts,alloc};
}
function build(){
 let variants=[[]];for(let d of state.darts){let next=[];for(let prev of variants)for(let a of getAllocations(d))next.push([...prev,a]);variants=next}
 if(bed())variants.push([{key:'BED',marks:1}]);
 let seen=new Set();return collapseEquivalentOptions(variants.filter(v=>{let sig=v.map(x=>x.key+':'+x.marks).join('|');if(seen.has(sig))return false;seen.add(sig);return true}).map(calculate));
}
function showOptions(){
 if(state.phase!=='choose')return;$('confirm').disabled=selected<0;let box=$('choices');box.innerHTML=(state.darts.some(d=>typeof d.n==='number'&&d.n<12)?'<p class="claim-note">Mickey Mouse number targets are 20–12. Lower hits can count toward DOUBLE, TRIPLE or BED; they do not earn number points.</p>':'')+options.map((o,i)=>`<button class="${selected===i?'sel':''}" data-choice="${i}">OPTION ${i+1}: ${o.alloc.map(x=>x.key==='MISS'?'MISS':x.marks+' × '+x.key).join(' • ')}<small>+${o.points} scoring points • ${shanghai()?'+100 Shanghai • ':''}choose this allocation</small></button>`).join('');
 box.querySelectorAll('[data-choice]').forEach(el=>el.onclick=()=>{stop();selected=+el.dataset.choice;state.choice=selected;save();showOptions();$('message').textContent='Option '+(selected+1)+' selected. Confirm claim?';$('seconds').textContent='✓';$('pause').classList.add('hidden');$('listen').classList.add('hidden')})
}
function celebration(){let pop=document.createElement('div');pop.className='party';pop.innerHTML='<div>🎉 SHANGHAI! 🎯<small>+100 POINTS</small></div>';document.body.append(pop);setTimeout(()=>pop.remove(),2400)}
function promptDecision(){
 if(state.phase==='choose'&&state.darts.length===3)commit({automatic:true});
}
function changeDecision(index){
 if(state.phase!=='done'||!state.reviewBase)return;
 stop();const baseline=JSON.parse(state.reviewBase);state=baseline;state.phase='choose';state.correcting=true;selected=Number.isInteger(index)?index:-1;state.choice=selected;options=build();save();render();
 if(selected>=0){commit();return}
 $('message').textContent='Change your claim by voice or touch. The original tally has been rolled back.';
 $('listen').classList.remove('hidden');
}
function beginReview(current,autoListen){
 if(current!==token||state.phase!=='done'||!state.reviewBase)return;
 clearTimeout(handoffClock);state.reviewWaiting=false;state.handoffAt=Date.now()+3000;save();scheduleHandoff();
 if(autoListen)listen('review');
}

function listen(mode='claim'){
 if(window.ExtractorRicky?.inGame?.()){stop();window.ExtractorRicky.wakeNow();return}

 if(state.screen!=='game'||(mode==='darts'?state.phase!=='throw':state.darts.length!==3||(mode==='review'?state.phase!=='done'||!state.reviewBase:state.phase!=='choose')))return;
 stop();const current=token;let consumed=false;if(mode==='review'){state.reviewWaiting=false;if(!Number.isFinite(state.handoffAt))state.handoffAt=Date.now()+3000;scheduleHandoff();if(current!==token||state.phase!=='done')return;}
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){$('info').textContent='Voice recognition unavailable in this browser. Use touch controls.';return}
 $('listen').classList.add('hidden');$('pause').classList.remove('hidden');
 $('message').textContent=mode==='darts'?'Listening: say seven, sixteen, triple twenty, or one hundred and eighty.':mode==='review'?'Tally shown. Say change decision, take a bed, or keep it.':'Listening: say an option number, a target, or confirm.';
 $('seconds').textContent='🎙';window.extractorMusic?.duck('recognition',true);
 function finish(message){
  if(current!==token)return;
  stop();window.extractorMusic?.duck('recognition',false);
  if($('listen'))$('listen').classList.remove('hidden');
  if($('pause'))$('pause').classList.add('hidden');
  if(message&&$('message'))$('message').textContent=message;
  if($('seconds'))$('seconds').textContent='—';if(state.phase==='done'&&!state.reviewWaiting)scheduleHandoff();if(message&&$('message'))$('message').textContent=message;
 }
 try{
  const recognition=new Speech();listening=recognition;recognition.lang=ExtractorCommands.language();recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=1;
  recognition.onresult=e=>{
   if(current!==token||consumed)return;
   const result=e.results[e.resultIndex??0];if(!result||result.isFinal===false)return;
   consumed=true;const words=result[0].transcript;
   const intent=ExtractorCommands.decision(words);if(intent==='pause'){finish('No worries. Take your time.');if(mode==='review')changeDecision();return}
   if(mode==='review'&&intent==='change'){finish();changeDecision();listen('claim');return}
   if(mode==='review'&&intent==='keep'){finish('Tally kept. Next player shortly.');return}
   if(mode==='darts'){
    const parsed=ExtractorCommands.darts(words);
    if(!parsed||parsed.darts.length>3-state.darts.length){finish('Heard: '+words+'. Say individual darts that fit the remaining slots. Nothing added.');return}
    finish();for(const dart of parsed.darts)add(dart);
    if(state.phase==='throw'){$('message').textContent='Heard: '+words+'. Darts added.';$('info').textContent='Say the next dart when ready. Undo corrects a mistake.';speak(parsed.darts.map(d=>d.n==='MISS'?'Miss':d.n==='BULL'?(d.m===2?'Red bull':'Green bull'):(d.m===3?'Triple ':d.m===2?'Double ':'')+d.n).join(', '))}
   }else{
    const claimOptions=mode==='review'?reviewOptions():options;
    const match=ExtractorCommands.claim(words,claimOptions,{shanghai:shanghai()}),index=match==='confirm'?selected:match;
    if(mode==='review'){if(!Number.isInteger(index)||index<0||!claimOptions[index]){finish('Heard: '+words+'. No unique change found. Current tally stays; tap Change Decision or Undo to correct it.');return}finish();changeDecision(index);if($('info'))$('info').textContent='Heard: '+words;return}
    if(!Number.isInteger(index)||index<0||!options[index]){selected=-1;state.choice=-1;save();showOptions();finish('Heard: '+words+'. No unique claim found. Say take a bed, option one, option two, or tap a choice.');return}
    finish();selected=index;state.choice=index;save();commit();$('info').textContent='Heard: '+words;
   }
  };
  recognition.onerror=e=>finish(e.error==='not-allowed'?'Microphone permission is needed. Touch controls remain available.':'Voice stopped. Tap the microphone to try again, or use touch.');
  recognition.onend=()=>{if(!consumed)finish('Listening finished. Tap the microphone when ready.');};
  recognition.start();clock=setTimeout(()=>finish('Listening finished. Tap the microphone when ready.'),10000);
 }catch(e){finish('Microphone unavailable. Use touch controls.');}
}
function pause(){if(!['choose','throw','done'].includes(state.phase))return;stop();$('message').textContent='No worries. Launch when ready.';$('seconds').textContent='⏸';$('listen').classList.remove('hidden');$('pause').classList.add('hidden')}
function advanceTurn(){
 state.choice=0;selected=0;options=[];state.turn=1-state.turn;
 if(state.turn===(state.starter??0))state.round++;
 state.darts=[];state.mult=1;state.phase='throw';delete state.handoffAt;delete state.reviewBase;delete state.reviewWaiting;delete state.pendingWinner;delete state.correcting;
}
function finishReview(){
 if(state.phase!=='done')return;stop();
 if(state.pendingWinner){state.phase='win';state.memoryId??='mickey-'+Date.now()+'-'+Math.random();window.ExtractorMemory?.record(state.memoryId,'Mickey Mouse',[playerName(0),playerName(1)],state.turn,state.players.map(p=>p.points));delete state.reviewBase;delete state.pendingWinner;delete state.reviewWaiting;save();render();speak(playerName(state.turn)+' wins! '+(window.ExtractorBanter?.pick('win')||''));return}
 advanceTurn();save();render();announceNext();
}
function scheduleHandoff(){
 clearTimeout(handoffClock);
 if(state.phase!=='done'||state.screen!=='game')return;
 if(state.reviewWaiting){$('message').textContent='Tally shown. Say change decision or use Undo if needed.';return}
 if(!Number.isFinite(state.handoffAt)){state.handoffAt=Date.now()+3000;save()}
 $('message').textContent='Tally shown. Say change decision or use Undo if needed.';
 $('next').textContent='NEXT PLAYER NOW →';
 const wait=Math.max(0,state.handoffAt-Date.now());
 if(!wait){finishReview();return}
 handoffClock=setTimeout(scheduleHandoff,wait);
}
function announceNext(prefix=''){
 const next=playerName(state.turn);
 $('message').textContent=prefix+next+", you're up. Say your darts or enter them by touch.";
 const line=window.ExtractorBanter?.pick(state.nextBanter||'next')||'';delete state.nextBanter;save();speak(prefix+next+', your turn. '+line);
}
function reviewOptions(){const players=state.players;try{state.players=JSON.parse(state.reviewBase).players;return build()}finally{state.players=players}}
function commit(config={}){
 if(state.phase!=='choose'||state.darts.length!==3)return;
 options=build();
 if(!Number.isInteger(selected)||!options[selected]){selected=-1;state.choice=-1;save();showOptions();$('message').textContent='Please choose a claim. No points have been added.';return}
 stop();if(!state.correcting)snapshot();delete state.correcting;const baseline=JSON.stringify(state);
 const bonus=shanghai(),o=options[selected],p=state.players[state.turn];
 const marksAdded=Object.entries(o.marks).filter(([key,value])=>value>(p.marks[key]||0)).map(([key,value])=>key+' +'+(value-(p.marks[key]||0))+' mark'+(value-(p.marks[key]||0)>1?'s':''));
 const dartTotal=state.darts.reduce((n,d)=>n+(d.n==='MISS'?0:d.n==='BULL'?25*d.m:d.n*d.m),0);
 state.lastClaim=playerName(state.turn)+': Dart total '+dartTotal+' · '+(marksAdded.join(' · ')||'No new marks')+' · +'+o.points+' scoring points'+(bonus?' · +100 Shanghai bonus':'')+(state.darts.some(d=>typeof d.n==='number'&&d.n<12)?' · 1–11 do not earn number points in Mickey Mouse.':'');
 p.marks=o.marks;p.points+=o.points+(bonus?100:0);if(bonus)p.shang++;
 const finished=T.every(t=>(p.marks[t]||0)>=3)&&p.points>=state.players[1-state.turn].points;
 state.nextBanter=bonus?'shanghai':o.alloc.some(a=>a.key==='BED')?'bed':o.points>=60?'good':o.points===0&&!marksAdded.length?'low':'next';
 state.phase='done';state.pendingWinner=finished;state.reviewBase=baseline;state.reviewWaiting=false;delete state.handoffAt;
 save();render();
 const added=o.points+(bonus?100:0);
 const announce=()=>{if(bonus)window.ExtractorRecordedRicky?.queue('shanghai');const who=playerName(state.turn);scoreCall(added,()=>postScoreBanter(added,who,bonus?'shanghai':state.nextBanter),who)};
 if(config.automatic&&state.darts.every(d=>d.n===20&&d.m===3)&&window.ExtractorStage)window.ExtractorStage.maximum(announce);else announce();

}


function rickyHandleMickey(words,requestedPlayer){
 if(state.screen!=='game')return false;
 if(Number.isInteger(requestedPlayer)&&requestedPlayer!==state.turn)return false;
 if(state.phase==='throw'){
  const parsed=ExtractorCommands.darts(words);
  if(!parsed||parsed.darts.length>3-state.darts.length){$('message').textContent=playerName(state.turn)+', I did not get those darts. Say them again or use touch.';return false}
  for(const dart of parsed.darts){if(state.phase!=='throw')break;add(dart)}
  return true;
 }
 if(state.phase==='choose'){
  const match=ExtractorCommands.claim(words,options,{shanghai:shanghai()}),index=match==='confirm'?selected:match;
  if(!Number.isInteger(index)||index<0||!options[index]){$('message').textContent=playerName(state.turn)+', I did not get that choice. Say it again or use touch.';return false}
  selected=index;state.choice=index;save();commit();return true;
 }
 if(state.phase==='done'){
  const intent=ExtractorCommands.decision(words);
  if(intent==='change'){changeDecision();return true}
  if(intent==='keep'||/^(?:next|next player|move on|carry on)$/i.test(String(words).trim())){finishReview();return true}
 }
 return false;
}
window.ExtractorMickeyVoice={activePlayer:()=>state.screen==='game'&&['throw','choose','done'].includes(state.phase)?state.turn:null,handle:rickyHandleMickey,status:text=>{if($('info'))$('info').textContent=text}};

function undo(){if(!history.length)return;if(state.phase==='win')window.ExtractorMemory?.forget(state.memoryId);stop();state=JSON.parse(history.pop());options=[];selected=0;save();render();if(state.phase==='choose'){$('message').textContent='Previous choice restored. Select by touch.';$('listen').classList.remove('hidden')}}

function intro(){
 stop();window.ExtractorStage?.cancel();const sound=window.extractorMusic,video=sound.media;
 sound.pause();sound.seek(0);document.body.classList.remove('menu-active');document.body.classList.add('intro-active');
 const level=sound.getLevel();
 $('app').innerHTML=`<section class="storyboard-wrap intro-wrap"><div class="storyboard-controls"><p id="introStatus" role="status">BETA v0.13.3 TEST · The Nexus experience · turn sound on when ready.</p><div class="row"><button id="playIntro" class="primary">▶ PLAY INTRO WITH SOUND</button><button id="skipIntro">SKIP INTRO →</button></div><label class="intro-volume" for="introVolume">SOUND LEVEL <output id="introVolumeValue">${Math.round(level*100)}%</output><input id="introVolume" type="range" min="0" max="100" value="${Math.round(level*100)}"></label></div></section>`;
 let leaving=false;
 const leave=()=>{if(leaving)return;leaving=true;video.onplay=null;video.onpause=null;video.ontimeupdate=null;video.onended=null;video.onerror=null;if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});menu()};
 $('skipIntro').onclick=()=>{sound.seek(sound.introEndSec);leave();sound.applyPolicy?.()};
 $('playIntro').onclick=()=>{if(!video.paused&&!video.muted){sound.pause();return}try{document.documentElement.requestFullscreen?.().catch(()=>{})}catch(e){}sound.start({force:true})};
 video.onplay=()=>{if(leaving)return;$('playIntro').textContent=video.muted?'🔊 TURN SOUND ON':'Ⅱ PAUSE';$('introStatus').textContent='THE EXTRACTOR NEXUS';document.querySelector('.storyboard-controls').classList.add('playing')};
 video.onpause=()=>{if(!leaving){$('playIntro').textContent='▶ RESUME WITH SOUND';document.querySelector('.storyboard-controls').classList.remove('playing')}};
 // Workprint 15 runs to completion, then the game menu takes over immediately.
 video.ontimeupdate=()=>{if(video.currentTime>=sound.introEndSec)leave()};
 video.onended=()=>{sound.seek(sound.introEndSec);leave();sound.applyPolicy?.()};
 video.onerror=()=>{if(!leaving)$('introStatus').textContent='Intro could not load. Select Game is still available.'};
 $('introVolume').oninput=e=>{const n=Number(e.target.value)/100;sound.setLevel(n);$('introVolumeValue').textContent=Math.round(n*100)+'%'};
 // Muted autoplay is allowed on a fresh browser; sound is enabled by a player tap.
 sound.start({muted:true,force:true});
}


window.ExtractorSettings={
 open:()=>{const d=$('settingsDialog');if(d&&!d.open)d.showModal()},
 close:()=>{const d=$('settingsDialog');if(d?.open)d.close()},
 replayIntro:()=>intro(),
 developer:()=>window.ExtractorDeveloper?.open(menu),
 knowledge:()=>window.ExtractorMemory?.open(menu),
 spotify:()=>{const panel=$('spotifyPanel');if(panel)panel.classList.remove('hidden');const d=$('settingsDialog');if(d&&!d.open)d.showModal()},
 closeSpotify:()=>{const panel=$('spotifyPanel');if(panel)panel.classList.add('hidden')},
 deviceAccess:mode=>applyDeviceAccess(mode,$('deviceAccessStatus')),
 getDeviceAccess
};
window.speechSynthesis?.addEventListener?.('voiceschanged',()=>{if($('mcVoice'))bindMCVoices()});
// Startup: cinema first on every fresh load, then the Nexus menu and registration.
// Saved scoring state and profiles remain intact.
try{state.screen='menu';save()}catch(_){}
bootPermissions();
