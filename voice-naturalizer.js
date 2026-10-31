/* Natural dart speech adapter for Extractor's Play.
   Converts casual dart calls into the canonical single/double/triple grammar
   already understood by voice-commands.js. */
(() => {
 const root=window;
 const SEG=['twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
 const segWord='(?:'+SEG.join('|')+')';
 const segNum='(?:1[2-9]|20)';
 const seg='(?:'+segNum+'|'+segWord+')';
 const lead=/\b(?:give\s+(?:me|us)|i(?:'|’)ll\s+take|ill\s+take|i\s+will\s+take|how\s+about|what\s+about|can\s+you\s+give\s+(?:me|us)|could\s+you\s+give\s+(?:me|us)|make\s+mine|put\s+me\s+on|score\s+me)\b/gi;
 function tidy(s){return String(s||'').toLowerCase().replace(/[,“”]/g,' ').replace(/\band\b/g,' ').replace(lead,' ').replace(/\s+/g,' ').trim()}
 function normalizeDarts(input){
  let s=tidy(input);
  if(!s)return s;
  // Articles mean a single bed: "a 20", "an eighteen".
  s=s.replace(new RegExp('\\b(?:a|an)\\s+('+seg+')\\b','gi'),'single $1');
  // Numeric/spoken multiplier shorthand: "1 20", "two nineteen", "3 eighteen".
  s=s.replace(new RegExp('\\b(?:1|one)\\s+('+seg+')\\b','gi'),'single $1');
  s=s.replace(new RegExp('\\b(?:2|two)\\s+('+seg+')\\b','gi'),'double $1');
  s=s.replace(new RegExp('\\b(?:3|three)\\s+('+seg+')\\b','gi'),'triple $1');
  // If a visit is just 2-3 board numbers in the 12-20 range, default them to singles.
  const parts=s.split(/\s+/).filter(Boolean);
  if(parts.length>=2 && parts.length<=3 && parts.every(p=>new RegExp('^'+seg+'$','i').test(p))){
   s=parts.map(p=>'single '+p).join(' ');
  }
  return s.replace(/\s+/g,' ').trim();
 }
 function install(){
  const c=root.ExtractorCommands;
  if(!c||typeof c.darts!=='function'||c.__naturalDartsInstalled)return false;
  const original=c.darts.bind(c);
  c.darts=(text)=>original(normalizeDarts(text));
  c.__naturalDartsInstalled=true;
  c.normalizeDarts=normalizeDarts;
  return true;
 }
 if(!install()){
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>100)clearInterval(timer)},25);
 }
 root.ExtractorNaturalDarts={normalize:normalizeDarts};
})();
