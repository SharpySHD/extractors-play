/* Match entrance flow. Audio slots stay empty until verified recordings exist. */
(() => {
 const $=id=>document.getElementById(id);
 const cues={chooseWeapon:{text:'Choose your weapon.',src:null},selected:{text:'Selected.',src:null},selectionTime:{text:'Selection time.',src:null},bull:{text:'Throwing for the Bull.',src:null}};
 let generation=0,clip=null,clipDone=null,overlay=null;
 function cancel(){generation++;if(clip){clip.pause();clip=null}if(overlay){overlay.remove();overlay=null}const done=clipDone;clipDone=null;if(done)done(false);window.extractorMusic?.duck('stage',false)}
 function say(name,cb){const item=cues[name];if(!item)return;const current=generation;if(!item.src){speak(item.text,cb,'mc');return}
  const audio=new Audio(item.src);clip=audio;window.extractorMusic?.duck('stage',true);let finished=false;
  const finish=()=>{if(finished)return;finished=true;window.extractorMusic?.duck('stage',false);if(clip===audio)clip=null;if(current===generation)cb?.()};audio.onended=finish;audio.onerror=()=>{if(current===generation)speak(item.text,finish)};audio.play().catch(()=>{if(current===generation)speak(item.text,finish)});
 }
 function bullOff(begin){
  window.ExtractorRicky?.stop();
  stop();window.ExtractorX01?.stop();cancel();const current=generation;
  document.body.classList.remove('intro-active','menu-active');document.body.classList.add('bull-active');
  window.extractorMusic?.start();
  $('app').innerHTML=`<section class="bull-screen"><button id="bullBack" class="bull-back">⌂ MENU</button><div class="bull-core"><div class="eyebrow">EXTRACTOR’S PLAY</div><h1>THROWING FOR<br>THE BULL</h1><div class="bull-target" aria-hidden="true"></div><p>Each player throws for the bull.</p><p class="tiny">Select who is closest. If tied, throw again.</p><div class="row"><button id="bullLeft">${playerLabel(0)}<br><small>CLOSEST TO BULL</small></button><button id="bullRight">${playerLabel(1)}<br><small>CLOSEST TO BULL</small></button></div><button id="bullTie">TIE · THROW AGAIN</button><p class="tiny">BETA v0.13.3 · Bull-off winner is entered by touch.</p></div></section>`;
  const announce=()=>{if(current===generation)say('bull')};say('selected',announce);
  $('bullBack').onclick=()=>{cancel();document.body.classList.remove('bull-active');menu()};
  $('bullTie').onclick=()=>say('bull');let decided=false;
  const decide=winner=>{if(decided||current!==generation)return;decided=true;stop();cancel();document.body.classList.remove('bull-active');begin(winner)};
  $('bullLeft').onclick=()=>decide(0);$('bullRight').onclick=()=>decide(1);
 }
 function maximum(done){
  cancel();const current=generation;overlay=document.createElement('div');overlay.className='maximum-screen';
  overlay.innerHTML=`<video playsinline preload="auto" aria-label="Three darts hit triple twenty with a close-up and smoke" src="maximum-180-v3.mp4"></video><strong>180</strong><button>CONTINUE →</button>`;document.body.append(overlay);
  const video=overlay.querySelector('video');clip=video;let finished=false;
  const finish=()=>{if(finished||current!==generation)return;finished=true;cancel();done?.()};overlay.querySelector('button').onclick=finish;video.onended=finish;video.onerror=finish;
  // No score or game state is changed by the celebration.
  video.play().catch(()=>{video.muted=true;video.play().catch(finish)});
 }
 window.ExtractorStage={say,bullOff,maximum,cancel};
})();
