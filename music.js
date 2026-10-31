/* One native media stream: mixed intro, then uninterrupted music through bull-off. */
(() => {
 const media=document.createElement('video');media.id='experienceMedia';
 media.src='nexus-workprint-15.mp4?v=0121-roastwake1';media.preload='metadata';media.playsInline=true;
 media.setAttribute('playsinline','');media.setAttribute('aria-label','Extractor Nexus cinematic audio and intro');
 document.body.append(media);
 const introEndSec=97.63333333333334;
 let level=1,fade=1,fadeTimer=null,pendingSeek=null,mode='always',voiceOn=true;const ducks=new Set();
 try{const n=localStorage.getItem('extractorExperienceLevel');if(n!==null&&Number.isFinite(Number(n)))level=Math.max(0,Math.min(1,Number(n)))}catch(_){}
 try{const saved=localStorage.getItem('extractorMusicMode');if(['always','voice','off'].includes(saved))mode=saved;const v=localStorage.getItem('extractorVoiceMusicOn');if(v!==null)voiceOn=v==='1'}catch(_){}
 const panel=document.createElement('aside');panel.className='music-controls panel hidden';panel.setAttribute('aria-label','Nexus sound');
 panel.innerHTML=`<div class="music-heading"><b>NEXUS SOUND · FROM 1:45</b><span>Kicks 4 Free · Robbie Muir Remix</span></div><div class="music-row"><button id="musicToggle" type="button">▶ MUSIC</button><label for="musicLevel">SOUND LEVEL <output id="musicLevelValue">${Math.round(level*100)}%</output><input id="musicLevel" type="range" min="0" max="100" value="${Math.round(level*100)}"></label></div><p id="musicStatus" class="tiny" role="status">Tap Play intro or Music to start sound.</p>`;
 document.body.append(panel);const toggle=panel.querySelector('#musicToggle'),status=panel.querySelector('#musicStatus');
 function apply(){media.volume=level*fade*(ducks.size ? 0.35 : 1);media.muted=level===0}
 function pause(){clearInterval(fadeTimer);fadeTimer=null;media.pause();toggle.textContent='▶ MUSIC';status.textContent='Music paused.'}
 function seek(seconds){if(Number.isFinite(seconds)){pendingSeek=Math.max(0,seconds);try{media.currentTime=pendingSeek;pendingSeek=null}catch(_){}}}
 media.addEventListener('loadedmetadata',()=>{if(pendingSeek!==null)seek(pendingSeek)});
 async function start(options={}){
  if(!options.force&&(mode==='off'||(mode==='voice'&&!voiceOn))){pause();return false}
  clearInterval(fadeTimer);fadeTimer=null;fade=1;
  if(!document.body.classList.contains('intro-active')&&media.currentTime<introEndSec)seek(introEndSec);
  apply();if(options.muted)media.muted=true;
  try{
   // Invoke play directly in the user gesture; no second audio element or AudioContext.
   await media.play();toggle.textContent='Ⅱ MUSIC';status.textContent='Nexus soundtrack playing.';
  }catch(_){status.textContent='Tap Music to enable sound. The game remains available.'}
 }
 function duck(reason,active){if(reason==='intro')return;if(active)ducks.add(reason);else ducks.delete(reason);apply()}
 function setLevel(n){level=Math.max(0,Math.min(1,n));panel.querySelector('#musicLevel').value=Math.round(level*100);panel.querySelector('#musicLevelValue').textContent=Math.round(level*100)+'%';apply();try{localStorage.setItem('extractorExperienceLevel',String(level))}catch(_){}}
 function setMode(next){if(!['always','voice','off'].includes(next))return mode;mode=next;try{localStorage.setItem('extractorMusicMode',mode)}catch(_){}applyPolicy();return mode}
 function setVoiceOn(on){voiceOn=!!on;try{localStorage.setItem('extractorVoiceMusicOn',voiceOn?'1':'0')}catch(_){}if(mode==='voice')applyPolicy();return voiceOn}
 function applyPolicy(){if(mode==='off'||(mode==='voice'&&!voiceOn)){pause();return false}start();return true}
 function fadeOut(seconds=2){clearInterval(fadeTimer);const began=Date.now(),from=fade;fadeTimer=setInterval(()=>{fade=from*Math.max(0,1-(Date.now()-began)/(Math.max(.1,seconds)*1000));apply();if(fade===0){pause();fade=1;apply()}},40)}
 toggle.onclick=()=>media.paused?start():pause();panel.querySelector('#musicLevel').oninput=e=>setLevel(Number(e.target.value)/100);
 media.addEventListener('error',()=>{toggle.textContent='▶ MUSIC';status.textContent='Sound could not load. Tap Music to retry when connected.'});
 media.addEventListener('ended',()=>{seek(introEndSec);applyPolicy()});
 apply();if(mode==='off'||(mode==='voice'&&!voiceOn))pause();window.extractorMusic={media,introEndSec,start,pause,seek,duck,fadeOut,setLevel,getLevel:()=>level,setMode,getMode:()=>mode,setVoiceOn,getVoiceOn:()=>voiceOn,applyPolicy};
})();
