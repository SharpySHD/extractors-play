(() => {
 const engine=window.ExtractorX01Engine,$=id=>document.getElementById(id),names=()=>[playerName(0),playerName(1)];
 let game,history=[],recognition,timer,session=0,active=false;
 const key=()=>`extractorX01Beta-${game.start}`;
 function persist(){try{localStorage.setItem(key(),JSON.stringify({state:game,history:history.slice(-100)}))}catch(_){}}
 function stopVoice(){session++;clearTimeout(timer);timer=null;const old=recognition;recognition=null;if(old)try{old.abort()}catch(_){}window.extractorMusic?.duck('recognition',false)}
 function snapshot(){history.push(JSON.stringify(game));if(history.length>100)history.shift()}
 function label(d){return d.n==='MISS'?'MISS':d.n==='BULL'?(d.m===2?'RED 50':'GREEN 25'):['','S','D','T'][d.m]+d.n}
 function add(d){stop();stopVoice();const updated=engine.add(game,d);if(updated===game)return;snapshot();game=updated;persist();render();if(game.phase==='bust')speak((window.ExtractorBanter?.pick('bust')||'Bust.')+' '+game.visitStart+' remaining.');if(game.phase==='throw'&&game.scores[game.turn]<=40){const line=window.ExtractorBanter?.pick('checkout');if(line)speak(line)}if(game.phase==='win'){game.memoryId??='x01-'+Date.now()+'-'+Math.random();window.ExtractorMemory?.record(game.memoryId,String(game.start),names(),game.turn,game.scores);persist();}if(game.phase==='win'){const checkout=game.visitStart;speak(String(checkout),()=>speak(names()[game.turn]+' wins! '+(window.ExtractorBanter?.pick('win')||'Game shot.')),'mc');}if(game.phase==='done'){const scored=game.visitStart-game.scores[game.turn];if(game.darts.length===3&&game.darts.every(d=>d.n===20&&d.m===3)&&window.ExtractorStage)window.ExtractorStage.maximum(()=>speak('180',null,'mc'));else{const who=names()[game.turn],total=Math.max(0,Math.min(180,scored));scoreCall(total,()=>window.ExtractorPostScoreBanter?.(total,who,total>=60?'good':total<20?'low':'next'),who)}}}
 function open(start,announce=true){
  stop();stopVoice();active=true;history=[];game=engine.fresh(start);game.needsBull=true;let resumed=false;
  try{const saved=JSON.parse(localStorage.getItem(key()));const s=saved?.state;if(s&&s.start===start&&[0,1].includes(s.turn)&&Array.isArray(s.scores)&&s.scores.length===2&&s.scores.every(v=>Number.isInteger(v)&&v>=0&&v<=start)&&Array.isArray(s.darts)&&s.darts.length<=3&&['throw','done','bust','win'].includes(s.phase)){game=s;resumed=true;history=Array.isArray(saved.history)?saved.history.slice(-100):[]}}catch(_){}
  try{localStorage.setItem('extractorActiveMode',String(start))}catch(_){}
  const begin=winner=>{if(winner!==undefined){game.turn=winner;game.starter=winner;game.visitStart=game.scores[winner];game.needsBull=false}persist();render();window.ExtractorRicky?.refresh()};if(((!resumed&&announce)||game.needsBull)&&window.ExtractorStage)window.ExtractorStage.bullOff(begin);else{begin();if(announce){cue('selected')}}
 }
 function render(){
  document.body.classList.remove('menu-active');
  const locked=game.phase!=='throw';
  $('app').innerHTML=`<div class="wrap">${header()}<div class="row" style="margin:12px 0"><button id="xHome">⌂ MENU</button><b style="text-align:center">${game.start} · ROUND ${game.round}</b><button id="xNew">↻ NEW</button></div><p class="tiny" style="text-align:center">BETA v0.11.3 · SINGLE IN · DOUBLE OUT</p>
  <div class="scores">${names().map((name,i)=>`<div class="score ${game.turn===i?'active':''}"><div><small class="tiny">REMAINING</small><div>${playerLabel(i)}</div></div><strong>${game.scores[i]}</strong></div>`).join('')}</div>
  <section class="panel"><div class="row"><b class="cyan">${playerLabel(game.turn)} · ${game.darts.length}/3 DARTS</b><small>VISIT START ${game.visitStart}</small></div><div class="pills">${[0,1,2].map(i=>`<div class="pill"><small>DART ${i+1}</small><br>${game.darts[i]?label(game.darts[i]):'—'}</div>`).join('')}</div>
  <p id="xStatus" class="status" role="status">${game.notice}</p>
  <div class="row">${[1,2,3].map(m=>`<button data-x-m="${m}" class="${game.mult===m?'sel':''}" ${locked?'disabled':''}>${['','SINGLE','DOUBLE','TRIPLE'][m]}</button>`).join('')}</div>
  <div class="pad" style="margin-top:10px">${Array.from({length:20},(_,i)=>20-i).map(n=>`<button data-x-n="${n}" ${locked?'disabled':''}>${n}</button>`).join('')}</div>
  <div class="row" style="margin-top:10px"><button data-x-bull="1" ${locked?'disabled':''}>GREEN 25</button><button data-x-bull="2" ${locked?'disabled':''}>RED 50</button><button id="xMiss" ${locked?'disabled':''}>MISS</button></div>
  <div class="row" style="margin-top:10px"><button id="xUndo" ${history.length?'':'disabled'}>↶ UNDO</button><button id="xNext" ${['done','bust'].includes(game.phase)?'':'disabled'}>NEXT PLAYER →</button></div>
  <section class="ricky-mic-bar" aria-label="Ricky microphone"><p id="rickyMicStatus" role="status">MIC STARTING · allow microphone access if prompted.</p><button id="rickyMicRetry" type="button">🎙 RECONNECT MIC</button></section><div class="row" style="margin-top:10px"><button id="xListen" ${locked?'disabled':''}>🎙️ SAY YOUR DARTS</button><button id="xStop" class="hidden">STOP LISTENING</button></div><p class="tiny" id="xInfo">Say individual darts, for example “triple twenty, single twenty, double ten”. Touch controls also work.</p>
  <p class="tiny">Below zero, leaving 1, or zero without a double is bust. The whole visit is reset. Red 50 counts as double 25. OMNI is not connected.</p></section></div>`;
  $('xHome').onclick=()=>{stopVoice();active=false;menu()};
  $('xNew').onclick=()=>{if(!confirm('Start a new '+game.start+' game?'))return;stop();stopVoice();game=engine.fresh(game.start);game.needsBull=true;history=[];persist();if(window.ExtractorStage)window.ExtractorStage.bullOff(winner=>{game.turn=winner;game.starter=winner;game.visitStart=game.scores[winner];game.needsBull=false;persist();render()});else render()};
  document.querySelectorAll('[data-x-m]').forEach(el=>el.onclick=()=>{game.mult=+el.dataset.xM;persist();render()});
  document.querySelectorAll('[data-x-n]').forEach(el=>el.onclick=()=>add({n:+el.dataset.xN,m:game.mult}));
  document.querySelectorAll('[data-x-bull]').forEach(el=>el.onclick=()=>add({n:'BULL',m:+el.dataset.xBull}));
  $('xMiss').onclick=()=>add({n:'MISS',m:0});
  $('xUndo').onclick=()=>{if(!history.length)return;if(game.phase==='win')window.ExtractorMemory?.forget(game.memoryId);stop();stopVoice();game=JSON.parse(history.pop());persist();render()};
  $('xNext').onclick=()=>{const s=engine.next(game);if(s===game)return;stop();stopVoice();const scored=game.visitStart-game.scores[game.turn],topic=game.phase==='bust'?'next':scored>=60?'good':scored<20?'low':'next';snapshot();game=s;persist();render();speak(names()[game.turn]+', your turn. '+(window.ExtractorBanter?.pick(topic)||''))};
  $('xListen').onclick=listen;$('xStop').onclick=()=>{stopVoice();render()};
  window.ExtractorRicky?.refresh();
 }
 function applySpokenScore(total){
  if(!active||game.phase!=='throw'||!Number.isInteger(total)||total<0||total>180)return false;
  const remaining=game.scores[game.turn];
  if(total===remaining){speak(names()[game.turn]+', checkout needs the finishing double. Say the actual finishing darts.',null,'mc');return true}
  snapshot();
  if(total>remaining||remaining-total===1){game.scores[game.turn]=game.visitStart;game.phase='bust';game.notice='BUST — visit reset to '+game.visitStart+'.';persist();render();window.ExtractorRecordedRicky?.queue('bust');speak('Bust. '+game.visitStart+' remaining.',null,'mc');return true}
  game.scores[game.turn]=remaining-total;game.darts=[{n:'VOICE',m:0,total}];game.phase='done';game.notice='Visit scored '+total+'. Next player.';persist();render();{const who=names()[game.turn];scoreCall(total,()=>window.ExtractorPostScoreBanter?.(total,who,total>=60?'good':total<20?'low':'next'),who)}return true;
 }
 function rickyHandleX01(words,requestedPlayer){
  if(!active)return false;if(Number.isInteger(requestedPlayer)&&requestedPlayer!==game.turn)return false;
  if(['done','bust'].includes(game.phase)&&/^(?:next|next player|move on|carry on|keep it)$/i.test(String(words).trim())){const s=engine.next(game);if(s===game)return false;snapshot();game=s;persist();render();speak(names()[game.turn]+', your turn. '+(window.ExtractorBanter?.pick('next')||''));return true}
  if(game.phase!=='throw')return false;
  const parsed=window.ExtractorCommands.darts(words);
  if(parsed){for(const d of parsed.darts){if(game.phase!=='throw')break;add(d)}return true}
  const total=window.ExtractorRicky?.number?.(words);if(Number.isInteger(total))return applySpokenScore(total);
  speak(names()[game.turn]+', give me a score from zero to one eighty, or say the darts.',null,'mc');return true;
 }
 window.ExtractorX01Voice={activePlayer:()=>active&&game&&['throw','done','bust'].includes(game.phase)?game.turn:null,handle:rickyHandleX01,status:text=>{const el=$('xInfo');if(el)el.textContent=text}};
 function listen(){
  if(window.ExtractorRicky?.inGame?.()){stop();stopVoice();window.ExtractorRicky.wakeNow();return}

  if(!active||game.phase!=='throw')return;stop();stopVoice();const current=session;
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Speech){$('xInfo').textContent='Speech recognition unavailable. Use touch controls.';return}
  let consumed=false;
  function finish(message){if(current!==session||!active)return;stopVoice();render();if(message)$('xInfo').textContent=message}
  try{
   const mic=new Speech();recognition=mic;mic.lang=window.ExtractorCommands.language();mic.continuous=false;mic.interimResults=false;
   $('xListen').disabled=true;$('xStop').classList.remove('hidden');$('xInfo').textContent='Listening for your darts…';window.extractorMusic?.duck('recognition',true);
   mic.onresult=e=>{if(consumed||current!==session||!active)return;const r=e.results[e.resultIndex??0];if(!r||r.isFinal===false)return;consumed=true;const words=r[0].transcript,parsed=window.ExtractorCommands.darts(words);
    if(!parsed||parsed.darts.length>3-game.darts.length){finish('Heard: '+words+'. Say individual darts for the remaining slots. Nothing added.');return}
    finish();for(const d of parsed.darts){if(game.phase!=='throw')break;add(d)}$('xInfo').textContent='Heard: '+words;
   };
   mic.onerror=()=>finish('Microphone unavailable. Use touch controls or try again.');mic.onend=()=>{if(!consumed)finish('Listening finished. Tap the microphone when ready.')};
   mic.start();timer=setTimeout(()=>finish('Listening finished. Tap the microphone when ready.'),10000);
  }catch(_){finish('Microphone unavailable. Use touch controls.')}
 }
 function bindMenu(){stopVoice();active=false;try{localStorage.setItem('extractorActiveMode','menu')}catch(_){}document.querySelectorAll('[data-x01]').forEach(el=>el.onclick=()=>open(+el.dataset.x01))}
 function resume(){try{const start=Number(localStorage.getItem('extractorActiveMode'));if([101,301,501].includes(start)){open(start,false);return true}}catch(_){}return false}
 window.ExtractorX01={open,resume,bindMenu,stop:stopVoice};
})();
