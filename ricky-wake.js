(() => {
  const root=window;
  let recognition=null,restartTimer=null,idleTimer=null,enabled=false,armed=false,lastWake=0;
  const Speech=()=>root.SpeechRecognition||root.webkitSpeechRecognition;
  const rickySelected=()=>{try{return localStorage.getItem('extractorMCVoice')==='__ricky__'}catch(_){return false}};
  const activeMode=()=>{try{return localStorage.getItem('extractorActiveMode')||'menu'}catch(_){return 'menu'}};
  const names=()=>[root.playerName?.(0)||'Player 1',root.playerName?.(1)||'Player 2'];
  const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
  function number(text){
    let t=norm(text).replace(/\b(score|points?|scored|i got|got|for me|please|mate)\b/g,' ').replace(/\s+/g,' ').trim();
    const direct=t.match(/\b(180|1[0-7]\d|[1-9]?\d)\b/);if(direct&&/^\D*\d+\D*$/.test(t))return +direct[1];
    const small={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
    const tens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
    const w=t.split(' ').filter(x=>x&&x!=='and');let total=0,current=0,seen=false;
    for(const x of w){if(Object.hasOwn(small,x)){current+=small[x];seen=true}else if(Object.hasOwn(tens,x)){current+=tens[x];seen=true}else if(x==='hundred'){if(!seen)current=1;current*=100;seen=true}else return null}
    total+=current;return seen&&total>=0&&total<=180?total:null;
  }
  function isSpeaking(){return !!(root.speechSynthesis?.speaking||root.ExtractorSpeechBusy)}
  function currentPlayer(){const m=activeMode();if(m==='mickey')return root.ExtractorMickeyVoice?.activePlayer?.()??null;if(['101','301','501'].includes(m))return root.ExtractorX01Voice?.activePlayer?.()??null;return null}
  function say(text){root.ExtractorSpeak?.(text,null,'mc')}
  function status(text){root.ExtractorMickeyVoice?.status?.(text);root.ExtractorX01Voice?.status?.(text)}
  function wakeReply(player){
    const who=names()[player]||'player';
    const lines=[
      `Yes, ${who}.`,
      `Yeah, ${who}.`,
      `What the fuck, ${who}.`,
      `Go on then, ${who}.`,
      `I'm listening, ${who}.`,
      `Hit me with it, ${who}.`
    ];
    return lines[Math.floor(Math.random()*lines.length)];
  }
  function scheduleIdle(){clearTimeout(idleTimer);idleTimer=null;if(!enabled||!rickySelected())return;const delay=18000+Math.floor(Math.random()*14000);idleTimer=setTimeout(()=>{if(!enabled||!rickySelected()||isSpeaking())return scheduleIdle();const p=currentPlayer();if(p===null)return scheduleIdle();if(Math.random()<0.35){const who=names()[p];const lines=[`Hurry the fuck up, ${who}.`,`Come on, ${who}, we're not ageing this board like a fine wine.`,`Any time today, ${who}. The dartboard has plans.`];say(lines[Math.floor(Math.random()*lines.length)])}scheduleIdle()},delay)}
  function route(text,player){const m=activeMode();if(m==='mickey')return root.ExtractorMickeyVoice?.handle?.(text,player);if(['101','301','501'].includes(m))return root.ExtractorX01Voice?.handle?.(text,player);return false}
  function parseResult(text){
    const raw=String(text||''); const t=norm(raw); if(!t)return;
    if(isSpeaking())return;
    // HARD WAKE GATE: only the standalone phrase "Hey Ricky" arms score capture.
    if(t==='hey ricky'){
      const active=currentPlayer();
      if(active===null)return;
      lastWake=Date.now();armed=true;
      say(wakeReply(active));
      status(`Ricky is listening for ${names()[active]}.`);
      scheduleIdle();
      return;
    }
    if(armed&&Date.now()-lastWake<12000){
      const active=currentPlayer();
      if(active===null){armed=false;return}
      if(route(raw,active)){armed=false;scheduleIdle();return}
      say(`I didn't get that. Give me the score again, ${names()[active]}.`);lastWake=Date.now();return;
    }
  }
  function start(){enabled=true;clearTimeout(restartTimer);if(!rickySelected()||!Speech()||activeMode()==='menu')return;stopRecognition();try{const mic=new (Speech())();recognition=mic;mic.lang=root.ExtractorCommands?.language?.()||'en-AU';mic.continuous=true;mic.interimResults=false;mic.maxAlternatives=1;mic.onresult=e=>{for(let i=e.resultIndex||0;i<e.results.length;i++){const r=e.results[i];if(r&&r.isFinal!==false)parseResult(r[0]?.transcript||'')}};mic.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){enabled=false;status('Always-on Ricky needs microphone permission. Touch controls still work.')}};mic.onend=()=>{recognition=null;if(enabled&&rickySelected()&&activeMode()!=='menu')restartTimer=setTimeout(start,350)};mic.start();status('Ricky hot mic ON · say “Hey Ricky”.');scheduleIdle()}catch(_){recognition=null}}
  function stopRecognition(){const old=recognition;recognition=null;if(old)try{old.abort()}catch(_){} }
  function stop(){enabled=false;armed=false;clearTimeout(restartTimer);clearTimeout(idleTimer);restartTimer=idleTimer=null;stopRecognition()}
  function refresh(){if(rickySelected()&&activeMode()!=='menu')start();else stop()}
  root.ExtractorRicky={start,stop,refresh,feedForTest:parseResult,isEnabled:()=>enabled,number};
})();
