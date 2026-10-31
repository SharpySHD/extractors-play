/* Small explicit grammar: no inferred totals or guessed scoring allocations. */
(function(root){
 const ones={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};
 function clean(text){return String(text).toLowerCase().replace(/one hundred (?:and )?eighty/g,'180').replace(/trebles?/g,m=>m.endsWith('s')?'triples':'triple').replace(/\b([sdt])\s*(1[0-9]|20|[1-9])\b/g,(_,m,n)=>({s:'single',d:'double',t:'triple'}[m])+' '+n).replace(/bull[’']?s[ -]?eye|bullseye/g,'bull').replace(/(\d+|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)[’']s\b/g,'$1s').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
 function tokens(text){return clean(text).split(' ').map(t=>Object.hasOwn(ones,t)?String(ones[t]):t)}
 function darts(text){
  if(/\btwenty[\s-]+(?:one|two|three|four|five|six|seven|eight|nine)\b/i.test(String(text)))return null;
  text=String(text).replace(/\btops\b/gi,'double 20').replace(/\bmadhouse\b/gi,'double 1');
  let t=tokens(text).filter(x=>!['and','then','dart','darts','hit','i','got','have','ve','scored','hit','a','an','the','please','mate','cheers','ta','cobber','legend'].includes(x));
  if(['180','maximum','a maximum'].includes(t.join(' ')))return {darts:[{n:20,m:3},{n:20,m:3},{n:20,m:3}]};
  let out=[],lastNumber=null;
  const plurals={ones:1,twos:2,threes:3,fours:4,fives:5,sixes:6,sevens:7,eights:8,nines:9,tens:10,elevens:11,twenties:20,nineteens:19,eighteens:18,seventeens:17,sixteens:16,fifteens:15,fourteens:14,thirteens:13,twelves:12};
  const pluralTarget=x=>plurals[x]||(/^\d+s$/.test(x||'')?+x.slice(0,-1):null);
  for(let i=0;i<t.length;i++){
   let m=1,repeat=1,word=t[i];
   if(/^[123]$/.test(word)&&(/^(?:single|double|triple)s?$/.test(t[i+1]||'')||pluralTarget(t[i+1]))){repeat=+word;word=t[++i]}
   if(/^(?:single|double|triple)s?$/.test(word)){
    m={single:1,double:2,triple:3}[word.replace(/s$/,'')];
    const next=t[i+1],number=pluralTarget(next)||next;
    if(number&&(/^\d+$/.test(String(number))||['bull','green','red'].includes(number)))word=t[++i];
    else if(lastNumber!==null&&(next===undefined||/^(?:single|double|triple)s?$/.test(next)||/^[123]$/.test(next)))word=lastNumber;
    else return null;
   }
   word=pluralTarget(word)||word;
   const before=out.length;
   if(word==='miss'){if(m!==1)return null;out.push({n:'MISS',m:0})}
   else if(word==='bull'||word==='25'||word==='50'||word==='green'||word==='red'){
    if(m===3)return null;
    const red=word==='50'||word==='red'||m===2;
    if((word==='green'||word==='red')&&['bull','25','50'].includes(t[i+1]))i++;
    out.push({n:'BULL',m:red?2:1});
   }else if(/^\d+$/.test(String(word||''))&&+word>=1&&+word<=20){lastNumber=+word;out.push({n:+word,m})}
   else return null;
   if(out.length>before)for(let n=1;n<repeat;n++)out.push({...out[before]});
  }
  return out.length&&out.length<=3?{darts:out}:null;
 }
 function claim(text,options,context={}){
  const db=root.ExtractorClaimPhrases;
  const words=tokens(db?.phrases?.[clean(text)]||text).join(' ');
  const option=words.match(/^(?:take )?(?:option|choice|number) (\d+)$/);
  if(option){const index=+option[1]-1;return index>=0&&index<options.length?index:-1}
  if(/^(?:confirm|confirm claim|yes|take it|lock it in)$/.test(words))return 'confirm';
  if(!db)return -1;
  let target=words.replace(/\bi ll\b/g,'i will').replace(/\b(?:i reckon i will take|i reckon i ll take|can you put me down for|can you give me|put us down for|bang me down for|bung me down for|i will go with|i ll go with|we ll take|we will take|let s have|gimme|chuck me|chuck us|put me down for|put down|mark me down for|mark down|i will take|i will have|i would like|i want|give me|let me take|can i have|can i take|i take|take|have|claim|choose)\b/g,' ');
  target=target.replace(/\band the hundred\b/g,' shanghai ').replace(/\b100 (?:bonus )?points\b/g,' shanghai ');
  const scoreOnly=/^(?:the )?(?:score|scoring|points?|number|numbers)$/.test(target.trim());
  if(scoreOnly){const matches=options.map((o,i)=>({o,i})).filter(({o})=>o.alloc.some(a=>/^\d+$/.test(String(a.key))));if(matches.length===1)return matches[0].i;return -1}
  let terms=target.split(' ').filter(Boolean),requested={},count=null,wantsBonus=false,explicitCount=false;
  for(const word of terms){
   if(db.bonusWords.includes(word)){wantsBonus=true;continue}
   if(db.fillers.includes(word)||db.pointsWords.includes(word)||['and','plus','with','out','all','bonus','single','singles','cross','crosses','mark','marks','on','for'].includes(word))continue;
   const numeric=word.replace(/s$/,'');
   const key=db.targets[word]||(/^(?:20|19|18|17|16|15|14|13|12)$/.test(numeric)?numeric:null);
   if(key){requested[key]=(requested[key]||0)+(count??1);count=null;continue}
   if(/^[1-9]$/.test(word)&&count===null){count=+word;explicitCount=true;continue}
   return -1;
  }
  if(count!==null||(wantsBonus&&!context.shanghai))return -1;
  const keys=Object.keys(requested);if(!keys.length)return -1;
  const allOfOne=keys.length===1&&!explicitCount;
  const matches=options.map((o,i)=>{
   const actual={};for(const a of o.alloc)if(a.key!=='MISS')actual[a.key]=(actual[a.key]||0)+a.marks;
   return {o,i,actual};
  }).filter(({actual})=>Object.keys(actual).length===keys.length&&keys.every(k=>allOfOne?actual[k]>0:actual[k]===requested[k]));
  // Equivalent allocations may appear in different dart orders. They have the same effect.
  if(!matches.length)return -1;
  const signature=({o,actual})=>JSON.stringify([Object.entries(actual).sort(),o.points,Object.entries(o.marks).sort()]);
  return matches.every(m=>signature(m)===signature(matches[0]))?matches[0].i:-1;
 }
 function decision(text){
  let words=clean(text).replace(/^(?:(?:oh|oi|righto|look|okay|ok) )+/,'').replace(/(?: (?:mate|cheers|please|thanks|legend|cobber|big fella))+$/,'').trim();
  if(/^(?:hang on|hold on|hold up|wait|pause|stop|wait a sec|give me a sec|give us a sec|give me a second|give us a second|just a sec)$/.test(words))return 'pause';
  if(/^(?:nah|no|yeah nah|nah change it|change|change it|change that|change (?:my |the )?(?:decision|claim|score)|that s wrong|that is wrong|not right|not that|no change that)$/.test(words))return 'change';
  if(/^(?:keep it|keep that|leave it|leave that|leave it there|lock it in|yep|yep that s right|yeah|yeah that s right|yes|yes that s right|correct|spot on|too right|she ll be right|that s right|that is right|that is correct|no change|nah yeah|confirm)$/.test(words))return 'keep';
  return null;
 }
 function language(){try{const value=root.localStorage?.getItem('extractorSpeechLanguage');if(['en-AU','en-GB','en-US','en-NZ'].includes(value))return value}catch(_){}return 'en-AU'}
 root.ExtractorCommands={clean,darts,claim,decision,language};
})(typeof window!=='undefined'?window:globalThis);
