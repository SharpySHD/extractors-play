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
 const wordNumber={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};
 function boardNumber(token){if(/^\d+$/.test(token)){const n=Number(token);return n>=1&&n<=20?n:null}return Object.hasOwn(wordNumber,token)?wordNumber[token]:null}
 function naturalDarts(text){
  let t=norm(text)
   .replace(/\b(?:can you|could you|would you)\s+give\s+(?:me|us)\b/g,' ')
   .replace(/\b(?:give|gimme)\s+(?:me|us)\b/g,' ')
   .replace(/\b(?:i will|i ll|ill)\s+take\b/g,' ')
   .replace(/\b(?:how about|what about|make mine|put me on|put us on)\b/g,' ')
   .replace(/\bplease\b/g,' ').replace(/\s+/g,' ').trim();
  if(!t)return text;
  const tokens=t.split(' '),out=[];let i=0,explicit=0,plain=0;
  while(i<tokens.length){
   const tok=tokens[i],next=boardNumber(tokens[i+1]||'');
   if((tok==='single'||tok==='double'||tok==='triple')&&next){out.push(tok+' '+next);explicit++;i+=2;continue}
   if((tok==='1'||tok==='one'||tok==='2'||tok==='two'||tok==='3'||tok==='three')&&next){out.push(({1:'single',one:'single',2:'double',two:'double',3:'triple',three:'triple'})[tok]+' '+next);explicit++;i+=2;continue}
   if((tok==='a'||tok==='an')&&next){out.push('single '+next);explicit++;i+=2;continue}
   const n=boardNumber(tok);if(n){out.push(String(n));plain++;i++;continue}
   if(['and','then'].includes(tok)){i++;continue}
   return text;
  }
  if(explicit){return out.map(x=>/^\d+$/.test(x)?'single '+x:x).join(' ')}
  if(plain>=2){return out.map(x=>'single '+x).join(' ')}
  return text;
 }
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
 const canListen=()=>activeMode()==='menu'||inGame();
 const hidden=()=>!!root.document?.hidden;
 const isSpeaking=()=>!!(root.speechSynthesis?.speaking||root.ExtractorSpeechBusy);
 function say(text,done){if(root.ExtractorSpeak)root.ExtractorSpeak(text,done,'mc');else done?.()}
 function status(text){root.ExtractorMickeyVoice?.status?.(text);root.ExtractorX01Voice?.status?.(text)}
 function message(){
  if(phase==='listening')return armed?'MIC ON · listening for '+(names()[armedPlayer]||'player')+'’s score.':'MIC ON · always listening. Say “Hey Ricky”, wait for the quick reply, then give your score or command.';
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
  if(!enabled||blocked||!canListen())return;
  if(hidden()){setPhase('suspended');return}
  setPhase('reconnecting',reason);restartTimer=setTimeout(()=>{restartTimer=null;connect()},delay);
 }
 function connect(){
  if(!enabled||blocked||!canListen())return;
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
 function wakeReply(){const lines=['What?','What now?','Shoot.','Yeah?','Go on.'];return lines[Math.floor(Math.random()*lines.length)]}
 function arm(){
  const player=currentPlayer();
  root.ExtractorRecordedRicky?.stop();try{root.speechSynthesis?.cancel()}catch(_){}armed=true;armedPlayer=player;lastWake=Date.now();paint();
  say(wakeReply(player),()=>{if(armed&&(armedPlayer===null||armedPlayer===currentPlayer())){lastWake=Date.now();paint()}});
  status(player===null?'Ricky is listening.':'Ricky is listening for '+names()[player]+'.');if(player!==null)scheduleIdle();
 }
 const jordyRoasts=[
  "Jordy couldn't hit water if he fell out of a fucking boat.",
  "Jordy's grouping looks like the darts are trying to escape him.",
  "I've seen better accuracy from a bloke sneezing with a nail gun.",
  "Jordy throws like the board owes him money and he's scared to collect.",
  "Tell Jordy the treble twenty isn't a fucking rumour.",
  "Jordy's darts have seen more of the wall than the board.",
  "If confidence scored points, Jordy would be world champion. Shame darts don't work like that.",
  "Jordy makes a twenty look like a fucking postage stamp.",
  "I've seen GPS units with less trouble finding twenty.",
  "Jordy's checkout plan is apparently hope, panic, and blame the lighting.",
  "If missing was an Olympic event, Jordy would need a bigger trophy cabinet.",
  "Jordy isn't playing around the clock. He's playing around the fucking building.",
  "Somebody tell Jordy the spider isn't a target map.",
  "Jordy throws three darts and somehow the board looks relieved.",
  "I'd roast Jordy's average, but I don't kick numbers when they're already down.",
  "Jordy has the confidence of Phil Taylor and the grouping of a shopping trolley.",
  "That bloke couldn't buy a treble with exact change.",
  "Jordy's darts are socially distancing from each other.",
  "Jordy calls it a setup shot because even he doesn't know where the fuck it went.",
  "The board has filed a restraining order against Jordy's accuracy.",
  "Jordy's best double is double-checking whether he brought the right darts.",
  "I've seen stormtroopers watch Jordy and say, mate, tighten the grouping.",
  "Jordy doesn't need a coach. He needs a search party for his darts.",
  "Tell Jordy to aim at the number next door. He might accidentally hit the one he wants.",
  "Jordy's form is beautiful right up until the dart leaves his fucking hand.",
  "The only thing Jordy closes consistently is the fridge.",
  "Jordy's scoreboard needs a mercy rule.",
  "If bullshit added twenty points, Jordy would never lose.",
  "I asked the board about Jordy. It just sighed.",
  "Jordy's not out of form. This might actually be the form.",
  "All the vegetables disappeared out of the fridge and Jordy stayed in his room for three days. I'm not accusing anyone, but the cucumber's lawyer has advised it not to comment.",
  "Fridge got cleaned out, Jordy vanished into his room for three days. Coincidence? The carrots reckon otherwise.",
  "All the vegetables went missing and Jordy went into lockdown. I've seen less suspicious behaviour on Border Security.",
  "The veggies disappeared and Jordy didn't surface for three days. Check the crisper drawer for witnesses.",
  "Jordy's a sausage man. Even the dog disappears for days when he starts cooking up ideas.",
  "Vegetables vanish, Jordy locks himself away, then the dog goes missing. That's not a household, that's a crime documentary.",
  "Jordy doesn't need Tinder. He's got a sausage, a fridge full of missing produce, and a dog that's already packed a bag.",
  "Every time Jordy shuts the bedroom door, the dog starts packing an overnight bag.",
  "The dog hears Jordy say come here mate and immediately applies for witness protection.",
  "Jordy's room has more missing persons reports than the local police station."
 ];
 function jordyRoast(){return jordyRoasts[Math.floor(Math.random()*jordyRoasts.length)]}
 const dwaynoRoasts=[
  "Dwayno hears a conspiracy theory and suddenly thinks it's date night.",
  "Any chick starts talking conspiracies and Dwayno's already pulling his pants down for quiet time.",
  "Dwayno doesn't need a pickup line. He just waits for someone to say the moon landing was fake.",
  "Mention chemtrails around Dwayno and he starts tidying the bedroom.",
  "Dwayno hears 'deep state' and thinks somebody's flirting with him.",
  "If she says the government is hiding something, Dwayno's hiding his trousers two minutes later.",
  "Dwayno's love language is apparently Wi-Fi rumours and absolutely no fact checking.",
  "The bloke doesn't chase women. He just follows the sound of a conspiracy podcast.",
  "Dwayno hears one sentence about aliens and he's already asking if she wants to see his classified documents.",
  "Tell Dwayno the earth is flat and he'll try to make the evening horizontal too.",
  "If nonsense was foreplay, Dwayno would never get out of bed.",
  "Dwayno sees a red flag and mistakes it for mood lighting.",
  "His standards aren't low. They're just buried under three hours of conspiracy videos.",
  "Dwayno's perfect woman has two things: confidence and absolutely no peer-reviewed sources.",
  "He doesn't ask what star sign she is. He asks which government agency she thinks is listening."
 ];
 function dwaynoRoast(){return dwaynoRoasts[Math.floor(Math.random()*dwaynoRoasts.length)]}
 function setMcRicky(on){try{localStorage.setItem('extractorMCVoice',on?'__ricky__':'')}catch(_){}const el=root.document?.getElementById?.('mcVoice');if(el){el.value=on?'__ricky__':'';el.dispatchEvent(new Event('change'))}root.ExtractorRicky?.refresh?.()}
 function setBanter(on){const b=root.ExtractorBanter;if(!b)return false;const current=b.isEnabled?.()!==false;if(current!==on)b.toggle?.();const el=root.document?.getElementById?.('banterToggle');if(el)el.textContent='X-MAN BANTER · '+(b.isEnabled?.()!==false?'ON':'OFF');return true}
 function setSoundPercent(n){n=Math.max(0,Math.min(100,Math.round(n)));root.extractorMusic?.setLevel?.(n/100);const slider=root.document?.getElementById?.('settingsVolume');const out=root.document?.getElementById?.('settingsVolumeValue');if(slider)slider.value=n;if(out)out.textContent=n+'%';return n}
 function setMusicMode(mode){root.extractorMusic?.setMode?.(mode);const el=root.document?.getElementById?.('musicMode');if(el)el.value=mode}
 function settingsCommand(command){
  const c=norm(command);if(!c)return false;
  if(/(?:tell me something about|what do you reckon about|what do you think about|give .* some shit|roast) jordy/.test(c)){say(jordyRoast());return true}
  if(/(?:tell me something about|what do you reckon about|what do you think about|give .* some shit|roast) (?:dwayno|duano|dwayne o|dwayneo)/.test(c)){say(dwaynoRoast());return true}
  if(/^(?:register|add|create) (?:a )?(?:new )?player$|^new player$/.test(c)){if(root.ExtractorProfiles?.startRickyRegistration?.()){return true}say('Player registration is unavailable here.');return true}
  if(/^(?:open|show) settings$/.test(c)){root.ExtractorSettings?.open?.();say('Settings.');return true}
  if(/^(?:close|hide) settings$/.test(c)){root.ExtractorSettings?.close?.();say('Done.');return true}
  if(/^(?:turn |switch )?(?:ricky|ricky mode|chaos mode) on$|^use ricky(?: voice)?$/.test(c)){setMcRicky(true);say('Ricky on.');return true}
  if(/^(?:turn |switch )?(?:ricky|ricky mode|chaos mode) off$|^use (?:original|automatic)(?: mc| voice)?$/.test(c)){setMcRicky(false);say('Ricky off.');return true}
  if(/^(?:turn |switch )?banter on$/.test(c)){setBanter(true);say('Banter on.');return true}
  if(/^(?:turn |switch )?banter off$/.test(c)){setBanter(false);say('Banter off.');return true}
  let m=c.match(/^(?:set )?(?:sound|volume|nexus sound)(?: to)? (\d{1,3})(?: percent)?$/);if(m){const n=setSoundPercent(+m[1]);say(n+' percent.');return true}
  if(/^(?:turn |switch )?(?:music|nexus music) off$|^music off$/.test(c)){setMusicMode('voice');root.extractorMusic?.pause?.();say('Music off.');return true}
  if(/^(?:turn |switch )?(?:music|nexus music) on$|^music on$/.test(c)){setMusicMode('voice');root.extractorMusic?.start?.();say('Music on.');return true}
  if(/^(?:set )?music (?:to )?(?:always|always on|play always)$|^play music always$/.test(c)){setMusicMode('always');say('Always on.');return true}
  if(/^(?:set )?music (?:to )?(?:voice|voice control|voice controlled|ricky control)$/.test(c)){setMusicMode('voice');say('Voice control.');return true}
  if(/^(?:set )?music (?:to )?(?:off|always off)$/.test(c)){setMusicMode('off');say('Music off.');return true}
  if(/^(?:open|show) spotify(?: settings)?$|^spotify$/.test(c)){root.ExtractorSettings?.spotify?.();say('Spotify.');return true}
  if(/^(?:close|hide) spotify(?: settings)?$/.test(c)){root.ExtractorSettings?.closeSpotify?.();say('Done.');return true}
  if(/^(?:replay|play) (?:the )?intro$|^intro again$/.test(c)){say('Intro.',()=>root.ExtractorSettings?.replayIntro?.());return true}
  if(/^(?:open|show) developer(?: desk| settings)?$/.test(c)){root.ExtractorSettings?.developer?.();say('Developer.');return true}
  if(/^(?:open|show) (?:knowledge|memory|x man knowledge|x man memory)$/.test(c)){root.ExtractorSettings?.knowledge?.();say('Memory.');return true}
  return false;
 }
 function route(text,player){const m=activeMode();if(m==='mickey')return root.ExtractorMickeyVoice?.handle?.(text,player);if(['101','301','501'].includes(m))return root.ExtractorX01Voice?.handle?.(text,player);return false}
 function parseResult(text){
  const raw=String(text||''),t=norm(raw);if(!t)return;
  if(t==='hey ricky'){arm();return}
  if(t.startsWith('hey ricky ')){const command=t.slice(10).trim();if(settingsCommand(command))return;if(root.ExtractorProfiles?.handleRicky?.(command))return;const player=currentPlayer();if(player!==null){armed=true;armedPlayer=player;lastWake=Date.now();const routed=naturalDarts(command);disarm();if(route(routed,player)){paint();scheduleIdle();return}arm();}return}
  if(root.ExtractorProfiles?.isVoiceFlowActive?.()&&root.ExtractorProfiles?.handleRicky?.(raw))return;
  if(isSpeaking())return;
  if(!armed){paint();return}
  const player=currentPlayer();if(player===null){if(settingsCommand(raw)||root.ExtractorProfiles?.handleRicky?.(raw)){disarm();paint();return}arm();return}
  if(player!==armedPlayer){disarm();paint();return}
  const routed=naturalDarts(raw);disarm();if(route(routed,player)){paint();scheduleIdle();return}
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
  if(!canListen()){stop();return}enabled=true;
  const player=currentPlayer();if(lastPlayer!==null&&lastPlayer!==player)disarm();lastPlayer=player;
  paint();if(!blocked&&!recognition&&!restartTimer)connect();if(!idleTimer)scheduleIdle();
 }
 function stop(){enabled=false;pendingWake=false;disarm();lastPlayer=null;clearTimeout(restartTimer);clearTimeout(idleTimer);restartTimer=idleTimer=null;detach();root.ExtractorRecordedRicky?.stop();setPhase('off')}
 function retry(){if(!canListen())return;blocked=false;failures=0;detach();clearTimeout(restartTimer);restartTimer=null;start()}
 function wakeNow(){if(!canListen())return;if(phase==='listening'){arm();return}pendingWake=true;retry()}
 function refresh(){if(canListen())start();else stop()}
 root.document?.addEventListener?.('visibilitychange',()=>{if(!enabled)return;if(hidden()){disarm();detach();clearTimeout(restartTimer);restartTimer=null;setPhase('suspended')}else refresh()});
 root.addEventListener?.('pagehide',stop);
 root.ExtractorRicky={start,stop,refresh,retry,wakeNow,inGame,feedForTest:parseResult,isEnabled:()=>enabled,number,normaliseDartsForTest:naturalDarts,getState:()=>({phase,blocked,armed,player:armedPlayer,message:message()})};
})();
