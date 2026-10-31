/* Supplied recordings, played verbatim. Names and scores still use device speech. */
(() => {
 const clips={
  identity:{src:'ricky-identity.mp3',label:'Ricky Bobby'},
  confidence:{src:'ricky-confidence.mp3',label:'Does not hurt being Ricky Bobby'},
  emotion:{src:'ricky-emotion.mp3',label:'Glass case of emotion'},
  panic:{src:'ricky-panic.mp3',label:'Help me Jesus'},
  backdoor:{src:'ricky-backdoor.mp3',label:'Back-door action'}
 };
 const topics={welcome:'identity',good:'confidence',maximum:'confidence',shanghai:'confidence',low:'emotion',bust:'panic',bed:'backdoor',win:'identity'};
 let current=null,pending=null,lastReaction=-Infinity;
 const selected=()=>{try{return localStorage.getItem('extractorMCVoice')==='__ricky__'}catch(_){return false}};
 const enabled=()=>selected()&&window.ExtractorBanter?.isEnabled?.()!==false;
 function stop(){pending=null;const old=current;current=null;if(old){old.audio.onended=old.audio.onerror=null;old.audio.pause();clearTimeout(old.watchdog);window.ExtractorSpeechBusy=false;window.extractorMusic?.duck('ricky-recording',false)}}
 function play(id,done){
  const item=clips[id];if(!item){done?.();return false}stop();
  let audio;try{audio=new Audio(item.src)}catch(_){done?.();return false}
  const run={audio,watchdog:null};current=run;window.ExtractorSpeechBusy=true;window.extractorMusic?.duck('ricky-recording',true);
  const finish=()=>{if(current!==run)return;stop();done?.()};
  audio.preload='auto';audio.volume=Math.max(0,Math.min(1,window.extractorMusic?.getLevel?.()??1));
  audio.onended=audio.onerror=finish;
  // Failure cannot leave the listener permanently blocked. New input cancels immediately.
  run.watchdog=setTimeout(finish,35000);
  try{audio.play()?.catch(finish)}catch(_){finish()}
  return true;
 }
 function queue(topic){if(!enabled()||!topics[topic]||Date.now()-lastReaction<30000)return false;pending=topics[topic];return true}
 function take(){const id=pending;pending=null;return id}
 function reaction(id,done){if(!id||!enabled()){done?.();return false}lastReaction=Date.now();return play(id,done)}
 function preview(id='identity'){try{window.stop?.();window.speechSynthesis?.cancel()}catch(_){}return play(id)}
 function mount(host){
  const box=document.createElement('div');box.className='ricky-recordings';
  const note=document.createElement('p');note.className='tiny';note.textContent='RICKY: 5 supplied recordings for reactions. Player names, scores and scripted replies use your device voice. New input stops a clip.';box.append(note);
  for(const [id,item] of Object.entries(clips)){const button=document.createElement('button');button.type='button';button.textContent='▶ '+item.label;button.onclick=()=>preview(id);box.append(button)}
  const stopButton=document.createElement('button');stopButton.type='button';stopButton.textContent='■ STOP RICKY AUDIO';stopButton.onclick=()=>window.stop?.();box.append(stopButton);host.append(box);
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 window.ExtractorRecordedRicky={clips,queue,take,reaction,preview,stop,mount,isPlaying:()=>!!current};
})();
