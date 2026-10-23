/* Recorded Nexus music audition. The file itself begins at original track 1:45. */
(() => {
  const audio = new Audio('media/nexus-music-from-145.mp3');
  audio.loop = true;
  audio.preload = 'metadata';
  let context, gain, pending = false;
  let level = 0.30;
  const ducks = new Set();
  try {
    const saved = localStorage.getItem('extractorMusicLevel');
    if (saved !== null && Number.isFinite(Number(saved))) level = Math.max(0, Math.min(1, Number(saved)));
  } catch (_) {}
  const panel = document.createElement('aside');
  panel.className = 'music-controls panel';
  panel.setAttribute('aria-label', 'Background music');
  panel.innerHTML = `<div class="music-heading"><b>NEXUS MUSIC · FROM 1:45</b><span>Kicks 4 Free · Robbie Muir Remix</span></div><div class="music-row"><button id="musicToggle" type="button">▶ MUSIC</button><label for="musicLevel">MUSIC LEVEL <output id="musicLevelValue">${Math.round(level*100)}%</output><input id="musicLevel" type="range" min="0" max="100" value="${Math.round(level*100)}"></label></div><p id="musicStatus" class="tiny" role="status">Music starts when you play the intro or tap Music.</p>`;
  document.body.append(panel);
  const toggle = panel.querySelector('#musicToggle');
  const status = panel.querySelector('#musicStatus');
  function apply() {
    const value = level * (ducks.size ? 0.24 : 1);
    if (gain && context) {
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(value, context.currentTime, 0.12);
    } else audio.volume = value;
  }
  async function start() {
    if (pending) return;
    pending = true;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!context && AudioContext) {
        context = new AudioContext();
        gain = context.createGain();
        context.createMediaElementSource(audio).connect(gain);
        gain.connect(context.destination);
        audio.volume = 1;
      }
      if (context && context.state === 'suspended') await context.resume();
      apply();
      await audio.play();
      toggle.textContent = 'Ⅱ MUSIC';
      status.textContent = ducks.size ? 'Music lowered under the voice.' : 'Playing from the original track’s 1:45 mark.';
    } catch (_) {
      status.textContent = 'Tap Music to start playback. Check your device volume too.';
    } finally { pending = false; }
  }
  function pause() { audio.pause(); toggle.textContent = '▶ MUSIC'; status.textContent = 'Music paused.'; }
  function duck(reason, active) {
    if (active) ducks.add(reason); else ducks.delete(reason);
    apply();
    if (!audio.paused) status.textContent = ducks.size ? 'Music lowered under the voice.' : 'Background music playing.';
  }
  toggle.onclick = () => audio.paused ? start() : pause();
  panel.querySelector('#musicLevel').oninput = e => {
    level = Number(e.target.value)/100;
    panel.querySelector('#musicLevelValue').textContent = Math.round(level*100)+'%';
    apply();
    try { localStorage.setItem('extractorMusicLevel', String(level)); } catch (_) {}
  };
  audio.onerror = () => { toggle.textContent = '▶ MUSIC'; status.textContent = 'Music could not load. The game is still available.'; };
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  function seek(seconds) { if (Number.isFinite(seconds)) { try { audio.currentTime = Math.max(0, seconds); } catch (_) {} } }
  window.extractorMusic = { start, pause, duck, seek };
})();
