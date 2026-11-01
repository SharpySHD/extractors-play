/* Private HQ stays on its own origin. No credentials or files cross into the game. */
(() => {
 const HQ='https://xman-nexus-hq.extractorshd.workers.dev/mini-x.html';
 const byId=id=>document.getElementById(id);
 const style=document.createElement('style');
 style.textContent=`
 .xman-game-settings{position:fixed;right:12px;top:12px;z-index:20}
 .xman-room{background:#0b1727;color:#eef6ff;border:1px solid #6183a5;border-radius:14px;padding:14px;width:min(1040px,96vw);max-width:96vw;box-sizing:border-box}
 .xman-room::backdrop{background:rgba(0,0,0,.85)}
 .xman-room header{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
 .xman-room p{font-size:14px;line-height:1.45}
 .xman-room a{color:#9edbff}
 .xman-room iframe{display:block;width:100%;height:65vh;height:65dvh;border:1px solid #304766;border-radius:8px;background:#080f1b}
 .xman-room button:focus-visible,.xman-room a:focus-visible{outline:3px solid #9edbff}
 `;
 document.head.append(style);
 const dialog=document.createElement('dialog');dialog.className='xman-room';
 dialog.setAttribute('aria-labelledby','xmanRoomTitle');
 dialog.innerHTML='<header><h2 id="xmanRoomTitle">Settings · Mini X</h2><button type="button" id="xmanResume">RETURN TO GAME</button></header><p id="xmanPauseState" role="status">Game paused. Score and turn held.</p><section id="xmanLaunch"><p>Take a break with Mini X. Ricky-style voice, text chat and a file box.</p><button type="button" id="xmanLoad">MEET MINI X</button></section><section id="xmanPrivate" hidden><p>Unlock inside HQ with your existing private token. Tap TEST VOICE to hear Mini X, type your message, or open Files &amp; notes. Wait for a saved reply or completed upload before returning; closing cannot cancel a request already sent. Closing this box locks this session. Files stay in HQ; uploading alone does not teach X-Man their contents.</p><p><a id="xmanExternal" target="_blank" rel="noopener noreferrer">Open HQ in a separate tab if the room does not load</a></p><div id="xmanFrame"></div></section>';
 document.body.append(dialog);
 byId('xmanExternal').href=HQ;
 let release=null,wasPlaying=false,opener=null;
 function open(){
  if(dialog.open||document.body.classList.contains('intro-active')||document.body.classList.contains('bull-active'))return;
  if(window.ExtractorProfiles?.isVoiceFlowActive?.())return;
  opener=document.activeElement;
  const settings=byId('settingsDialog');if(settings?.open)settings.close();
  window.ExtractorChatPaused=true;
  wasPlaying=!!window.extractorMusic?.media&&!window.extractorMusic.media.paused;
  release=window.ExtractorPauseForChat?.();
  window.ExtractorRicky?.stop();window.extractorMusic?.pause();
  byId('xmanLaunch').hidden=false;byId('xmanPrivate').hidden=true;
  dialog.showModal();byId('xmanLoad').focus();
 }
 function load(){
  if(byId('xmanFrame').children.length)return;
  const frame=document.createElement('iframe');frame.src=HQ;frame.title='Mini X chat, voice and files';
  frame.referrerPolicy='no-referrer';
  // The same-origin permission belongs to HQ, not the parent game origin.
  // Downloads allow File Bank's verified-download controls to work.
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox');
  frame.setAttribute('allow','microphone \'none\'; camera \'none\'; autoplay');
  byId('xmanFrame').append(frame);
  byId('xmanLaunch').hidden=true;byId('xmanPrivate').hidden=false;
 }
 function resume(){
  // Destroy the embedded page and its in-memory token rather than hiding it.
  byId('xmanFrame').replaceChildren();
  window.ExtractorChatPaused=false;
  const done=release;release=null;done?.();
  if(wasPlaying)window.extractorMusic?.applyPolicy?.();
  wasPlaying=false;
  if(opener?.isConnected)opener.focus();
 }
 byId('xmanLoad').onclick=load;
 byId('xmanResume').onclick=()=>dialog.close();
 dialog.addEventListener('close',resume);
 window.addEventListener('pagehide',()=>{byId('xmanFrame').replaceChildren();});
 function buttons(){
  const stack=document.querySelector('#settingsDialog .settings-stack');
  if(stack&&!byId('xmanSettingsChat')){
   const button=document.createElement('button');button.id='xmanSettingsChat';button.type='button';
   button.textContent='MINI X · TALK / CHAT / FILES';button.onclick=open;stack.prepend(button);
  }
  let mode='menu';try{mode=localStorage.getItem('extractorActiveMode')||'menu';}catch(_){}
  const playable=['mickey','101','301','501'].includes(mode)&&!document.body.classList.contains('intro-active')&&!document.body.classList.contains('bull-active');
  let gear=byId('xmanGameSettings');
  if(playable&&!gear){
   gear=document.createElement('button');gear.id='xmanGameSettings';gear.className='xman-game-settings';gear.type='button';
   gear.textContent='⚙ SETTINGS';gear.setAttribute('aria-label','Pause game and open Settings');gear.onclick=open;document.body.append(gear);
  }else if(!playable&&gear)gear.remove();
 }
 new MutationObserver(buttons).observe(byId('app'),{childList:true,subtree:true});
 buttons();
 window.ExtractorXManChat={open};
})();
