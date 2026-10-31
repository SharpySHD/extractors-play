/* One persistent recognizer for gameplay. No audio recording is stored. */
(() => {
 const root=window;
 let recognition=null,restartTimer=null,idleTimer=null,startTimer=null;
 let enabled=false,blocked=false,armed=false,armedPlayer=null,lastWake=0,pendingWake=false;
 let phase='off',detail='',failures=0,lastPlayer=null;
 const Speech=()=>root.SpeechRecognition||root.webkitSpeechRecognition;
 const activeMode=()=>{try{return localStorage.getItem('extractorActiveMode')||'menu'}catch(_){return 'menu'}};
 const names=()=>[root.playerName?.(0)||'Player 1',root.playerName?.(1)||'Player 2'];
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
 function number(text){
  let t=norm(text).replace(/\b(score|points?|scored|i got|got|for me|please|mate)\b/g,' ').replace(/\s+/g,' ').trim();
  const direct=t.match(/\b(180|1[0-7]\d|[1-9]?\d)\b/);if(direct&&/^\D*\d+\D*$/.test(t))return +direct[1];
  const small={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
  const tens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  const w=t.split(' ').filter(x=>x&&x!=='and');let current=0,seen=false;
  for(const x of w){if(Object.hasOwn(small,x)){current+=small[x];seen=true}else if(Object.hasOwn(tens,x)){current+=tens[x];seen=true}else if(x==='hundred'){if(!seen)current=1;current*=100;seen=true}else return null}
  return seen&&current>=0&&current<=180?current:null;
 }
 function currentPlayer(){const m=activeMode();if(m==='mickey')return root.ExtractorMickeyVoice?.activePlayer?.()??null;if(['101','301','501'].includes(m))return root.ExtractorX01Voice?.activePlayer?.()??null;return null}
 const inGame=()=>currentPlayer()!==null&&activeMode()!=='menu';
 const hidden=()=>!!root.document?.hidden;
 const isSpeaking=()=>!!(root.speechSynthesis?.speaking||root.ExtractorSpeechBusy);
 function say(text,done){if(root.ExtractorSpeak)root.ExtractorSpeak(text,done,'mc');else done?.()}
 function status(text){root.ExtractorMickeyVoice?.status?.(text);root.ExtractorX01Voice?.status?.(text)}
 function message(){
  if(phase==='listening')return armed?'MIC ON · listening for '+(names()[armedPlayer]||'player')+'’s score.':'MIC ON · say “Hey Ricky”, wait for his reply, then say your score.';
  return {off:'MIC OFF · return to gameplay to start.',starting:'MIC STARTING · allow microphone access if prompted.',reconnecting:'MIC RECONNECTING · '+(detail||'speech service restarting after silence.'),blocked:detail,unsupported:'MIC UNAVAILABLE · this browser has no speech recognition. Use Chrome on Android or touch controls.',suspended:'MIC PAUSED · keep this game tab visible to listen.'}[phase]||detail;
 }
 function paint(){
  const el=root.document?.getElementById?.('rickyMicStatus');if(el)el.textContent=message();
  const button=root.document?.getElementById?.('rickyMicRetry');if(button){button.onclick=retry;button.disabled=phase==='unsupported'}
 }
 function setPhase(next,text=''){phase=next;detail=text;paint()}
 function disarm(){armed=false;armedPlayer=null;lastWake=0}
 function detach(){
  const old=recognition;recognition=null;clearTimeout(startTimer);startTimer=null;
  if(old){old.onstart=old.onresult=old.onerror=old.onend=null;try{old.abort()}catch(_){}}
 }
 function scheduleRestart(reason='',delay=350){
  clearTimeout(restartTimer);restartTimer=null;
  if(!enabled||blocked||!inGame())return;
  if(hidden()){setPhase('suspended');return}
  setPhase('reconnecting',reason);restartTimer=setTimeout(()=>{restartTimer=null;connect()},delay);
 }
 function connect(){
  if(!enabled||blocked||!inGame())return;
  if(hidden()){setPhase('suspended');return}
  if(recognition)return;const Constructor=Speech();
  if(!Constructor){setPhase('unsupported');return}
  let mic;try{mic=new Constructor()}catch(_){scheduleRestart('Speech service unavailable.',1500);return}
  recognition=mic;const consumed=new Set();
  mic.lang=root.ExtractorCommands?.language?.()||'en-AU';mic.continuous=true;mic.interimResults=false;mic.maxAlternatives=1;
  setPhase('starting');
  mic.onstart=()=>{if(recognition!==mic)return;clearTimeout(startTimer);startTimer=null;failures=0;setPhase('listening');if(pendingWake){pendingWake=false;arm()}scheduleIdle()};
  mic.onresult=e=>{if(recognition!==mic||!enabled||hidden())return;for(let i=e.resultIndex||0;i<e.results.length;i++){const r=e.results[i];if(r&&r.isFinal!==false&&!consumed.has(i)){consumed.add(i);parseResult(r[0]?.transcript||'')}}};
  mic.onerror=e=>{
   if(recognition!==mic)return;
   const error=e.error||'unknown';
   if(['not-allowed','service-not-allowed','audio-capture'].includes(error)){
    blocked=true;pendingWake=false;disarm();detach();clearTimeout(restartTimer);restartTimer=null;
    const text=error==='audio-capture'?'MIC UNAVAILABLE · check the device microphone, then tap Reconnect Mic.':'MIC PERMISSION NEEDED · allow microphone access for this site in your browser, then tap Reconnect Mic.';
    setPhase('blocked',text);status(text);return;
   }
   detach();failures++;scheduleRestart(error==='network'?'Speech service network error. Retrying.':'Speech service stopped. Retrying.',error==='no-speech'?350:Math.min(8000,500*2**Math.min(failures,4)));
  };
  mic.onend=()=>{if(recognition!==mic)return;recognition=null;clearTimeout(startTimer);startTimer=null;scheduleRestart()};
  try{mic.start();if(recognition===mic&&phase==='starting')startTimer=setTimeout(()=>{if(recognition!==mic||phase!=='starting')return;detach();scheduleRestart('Speech service did not start. Retrying.',1500)},15000)}
  catch(e){if(recognition!==mic)return;detach();if(['NotAllowedError','SecurityError'].includes(e.name)){blocked=true;setPhase('blocked','MIC PERMISSION NEEDED · allow access, then tap Reconnect Mic.')}else{failures++;scheduleRestart('Speech service could not start. Retrying.',Math.min(8000,500*2**Math.min(failures,4)))}}
 }
 function wakeReply(){
  const lines=['What?','What now?','Shoot.','Yeah?','Go on.'];return lines[Math.floor(Math.random()*lines.length)];
 }
 function arm(){
  const player=currentPlayer();if(player===null)return;
  root.stop?.();armed=true;armedPlayer=player;lastWake=Date.now();paint();
  say(wakeReply(),()=>{if(armed&&armedPlayer===currentPlayer()){lastWake=Date.now();paint()}});
  status('Ricky is listening for '+names()[player]+'.');scheduleIdle();
 }
 function route(text,player){const m=activeMode();if(m==='mickey')return root.ExtractorMickeyVoice?.handle?.(text,player);if(['101','301','501'].includes(m))return root.ExtractorX01Voice?.handle?.(text,player);return false}
 function parseResult(text){
  const raw=String(text||''),t=norm(raw);if(!t)return;
  if(t==='hey ricky'){arm();return}
  if(isSpeaking())return;
  if(!armed||Date.now()-lastWake>=12000){disarm();paint();return}
  const player=currentPlayer();if(player===null||player!==armedPlayer){disarm();paint();return}
  disarm();if(route(raw,player)){paint();scheduleIdle();return}
  armed=true;armedPlayer=player;lastWake=Date.now();say("I didn't get that. Give me the score again, "+names()[player]+'.');paint();
 }
 function scheduleIdle(){
  clearTimeout(idleTimer);idleTimer=null;if(!enabled||!inGame())return;
  idleTimer=setTimeout(()=>{
   if(!enabled||!inGame())return;
   let selected=false;try{selected=localStorage.getItem('extractorMCVoice')==='__ricky__'}catch(_){}
   if(selected&&phase==='listening'&&!armed&&!isSpeaking()&&root.ExtractorBanter?.isEnabled?.()!==false&&Math.random()<.35){const who=names()[currentPlayer()];const lines=['Hurry the fuck up, '+who+'.',"Come on, "+who+", we're not ageing this board like a fine wine.",'Any time today, '+who+'. The dartboard has plans.'];say(lines[Math.floor(Math.random()*lines.length)])}
   scheduleIdle();
  },18000+Math.floor(Math.random()*14000));
 }
 function start(){
  if(!inGame()){stop();return}enabled=true;
  const player=currentPlayer();if(lastPlayer!==null&&lastPlayer!==player)disarm();lastPlayer=player;
  paint();if(!blocked&&!recognition&&!restartTimer)connect();if(!idleTimer)scheduleIdle();
 }
 function stop(){enabled=false;pendingWake=false;disarm();lastPlayer=null;clearTimeout(restartTimer);clearTimeout(idleTimer);restartTimer=idleTimer=null;detach();root.ExtractorRecordedRicky?.stop();setPhase('off')}
 function retry(){if(!inGame())return;blocked=false;failures=0;detach();clearTimeout(restartTimer);restartTimer=null;start()}
 function wakeNow(){if(!inGame())return;if(phase==='listening'){arm();return}pendingWake=true;retry()}
 function refresh(){if(inGame())start();else stop()}
 root.document?.addEventListener?.('visibilitychange',()=>{if(!enabled)return;if(hidden()){disarm();detach();clearTimeout(restartTimer);restartTimer=null;setPhase('suspended')}else refresh()});
 root.addEventListener?.('pagehide',stop);
 root.ExtractorRicky={start,stop,refresh,retry,wakeNow,inGame,feedForTest:parseResult,isEnabled:()=>enabled,number,getState:()=>({phase,blocked,armed,player:armedPlayer,message:message()})};
})();
