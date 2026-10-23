
const $=id=>document.getElementById(id), T=['20','19','18','17','16','15','14','13','12','DOUBLE','TRIPLE','BED','BULL'],N=Array.from({length:20},(_,i)=>20-i);
let state={screen:'menu',players:[fresh(),fresh()],turn:0,darts:[],mult:1,phase:'throw',round:1},options=[],selected=0,history=[],listening=null,clock=null,token=0;
function fresh(){return {points:0,shang:0,marks:{}}}
try{let saved=JSON.parse(localStorage.getItem('extractorMickeyBeta'));if(saved&&saved.players&&saved.players.length===2)state=saved}catch(e){}
function save(){try{localStorage.setItem('extractorMickeyBeta',JSON.stringify(state))}catch(e){}}
function snapshot(){history.push(JSON.stringify(state))}
function stop(){token++;clearInterval(clock);clock=null;if(listening){try{listening.abort()}catch(e){}listening=null}try{speechSynthesis.cancel()}catch(e){}}
function speak(s,cb){try{if(!('speechSynthesis' in window)){cb?.();return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(s);u.lang='en-AU';u.rate=.95;u.onend=()=>cb?.();u.onerror=()=>cb?.();speechSynthesis.speak(u)}catch(e){cb?.()}}
function marks(n){return n?'X'.repeat(Math.min(n,3)):'—'}
function header(){return `<div class="eyebrow">SHARPHUB DYNAMICS</div><div class="brand">EXTRACTOR'S PLAY</div><div class="subtitle">FEATURING THE BIG FELLA</div>`}
function menu(){stop();$('app').innerHTML=`<div class="wrap"><section class="menu panel">${header()}<h2 style="text-align:center">SELECT GAME</h2><div class="menuButtons"><button id="mickey" class="primary">🎯 MICKEY MOUSE<br><small>PLAY BETA</small></button><button disabled>501<br><small>COMING LATER</small></button><button disabled>301<br><small>COMING LATER</small></button><button disabled>101<br><small>COMING LATER</small></button><button disabled>🌐 WORLDWIDE<br><small>COMING LATER</small></button><button disabled>👥 FRIENDS ONLINE<br><small>COMING LATER</small></button></div><p class="tiny" style="text-align:center;margin-top:25px">LOCAL 2-PLAYER BETA • TARGET OMNI NOT CONNECTED</p></section></div>`;$('mickey').onclick=()=>{state.screen='game';save();render()}}
function render(){
 if(state.screen==='menu')return menu();
 let [a,b]=state.players;
 $('app').innerHTML=`<div class="wrap">${header()}<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0"><button id="home" style="padding:5px 9px">⌂ MENU</button><b style="letter-spacing:1px;font-size:12px">MICKEY MOUSE · ROUND ${state.round}</b><button id="new" style="padding:5px 9px">↻ NEW</button></div>
 <div class="scores"><div class="score ${state.turn===0?'active':''}"><div><small class="tiny">LEFT</small><div>CHALLENGER</div></div><strong>${a.points}</strong></div><div class="score ${state.turn===1?'active':''}"><div><small class="tiny">RIGHT</small><div>BIG FELLA</div></div><strong>${b.points}</strong></div></div>
 <div class="grid"><section class="panel"><div class="cyan" style="font-weight:900;font-size:12px;text-align:center">TARGETS · 3 X TO OPEN</div><div class="targetrow tiny"><span>CHALLENGER</span><span>TARGET</span><span>BIG FELLA</span></div>${T.map(k=>`<div class="targetrow"><span class="mark">${marks(a.marks[k]||0)}</span><span class="target">${k}</span><span class="mark">${marks(b.marks[k]||0)}</span></div>`).join('')}<div class="targetrow" style="border-top:1px solid #5ba1cb"><span class="cyan">${a.shang}</span><span class="target">SHANGHAIS</span><span class="cyan">${b.shang}</span></div><div class="tiny" style="text-align:center;margin-top:6px">+100 PER SHANGHAI · BONUS ONLY</div></section>
 <section class="panel"><div class="row"><b class="cyan">THROWS · ${state.turn?'BIG FELLA':'CHALLENGER'}</b><small class="tiny">${state.darts.length}/3</small></div>
 <div class="pills">${[0,1,2].map(i=>`<div class="pill"><span class="tiny">DART ${i+1}</span><br>${state.darts[i]?dartLabel(state.darts[i]):'—'}</div>`).join('')}</div>
 <div class="row" id="multipliers">${[1,2,3].map(m=>`<button data-m="${m}" class="${state.mult===m?'sel':''}" ${state.phase!=='throw'?'disabled':''}>${['','SINGLE','DOUBLE','TRIPLE'][m]}</button>`).join('')}</div>
 <div class="pad" style="margin-top:7px">${[...N].map(n=>`<button data-num="${n}" ${state.phase!=='throw'?'disabled':''}>${n}</button>`).join('')}</div>
 <div class="row" style="margin-top:7px"><button data-bull="1" ${state.phase!=='throw'?'disabled':''}>GREEN 25</button><button data-bull="2" ${state.phase!=='throw'?'disabled':''}>RED 50</button><button id="miss" ${state.phase!=='throw'?'disabled':''}>MISS</button></div>
 <div class="row" style="margin-top:8px"><button id="undo">↶ UNDO</button><button id="next" ${state.phase!=='done'?'disabled':''}>NEXT PLAYER →</button></div>
 <div class="tiny" style="margin-top:8px">Manual input • OMNI integration pending • Scores saved on this device</div></section></div>
 <section class="panel voice" id="voicepanel"><div class="row"><span style="font-size:25px;flex:0">🤖</span><div style="flex:5"><b class="cyan" style="font-size:12px">EXTRACTOR VOICE CONTROL</b><div id="message" class="status">${state.phase==='throw'?'Throw your darts, then I’ll ask what you take.':state.phase==='choose'?"What's he take?":state.phase==='win'?'GAME OVER!':'Turn scored. Next player.'}</div></div><strong id="seconds" style="text-align:right;flex:0">—</strong></div>
 <div id="choices" class="options ${state.phase==='choose'?'':'hidden'}"></div>
 <div class="row" style="margin-top:7px"><button id="listen" class="primary hidden">🎙️ LAUNCH WHEN READY</button><button id="pause" class="hidden">⏸ WAIT A SEC</button><button id="confirm" class="${state.phase==='choose'?'primary':'hidden'}" ${state.phase==='choose'?'':'disabled'}>✓ CONFIRM CLAIM</button></div>
 <div id="info" class="tiny muted" style="margin-top:7px">Microphone and speech depend on Safari/browser support. Touch controls always work.</div></section></div>`;
 $('home').onclick=()=>{state.screen='menu';save();menu()};
 $('new').onclick=()=>{if(confirm('Start a new game?')){stop();state={screen:'game',players:[fresh(),fresh()],turn:0,darts:[],mult:1,phase:'throw',round:1};history=[];options=[];save();render()}};
 document.querySelectorAll('[data-m]').forEach(el=>el.onclick=()=>{state.mult=+el.dataset.m;save();render()});
 document.querySelectorAll('[data-num]').forEach(el=>el.onclick=()=>add({n:+el.dataset.num,m:state.mult}));
 document.querySelectorAll('[data-bull]').forEach(el=>el.onclick=()=>add({n:'BULL',m:+el.dataset.bull}));
 $('miss').onclick=()=>add({n:'MISS',m:0});
 $('undo').onclick=undo;
 $('next').onclick=()=>{if(state.phase!=='done')return;snapshot();state.turn=1-state.turn;if(state.turn===0)state.round++;state.darts=[];state.mult=1;state.phase='throw';save();render()};
 $('listen').onclick=listen;
 $('pause').onclick=pause;
 $('confirm').onclick=commit;
 if(state.phase==='choose'){options=build();showOptions()}
}
function dartLabel(d){return d.n==='MISS'?'MISS':d.n==='BULL'?(d.m===2?'RED 50':'GREEN 25'):`${['','S','D','T'][d.m]}${d.n}`}
function add(d){if(state.phase!=='throw'||state.darts.length>=3)return;snapshot();state.darts.push(d);if(state.darts.length===3){state.phase='choose';save();render();promptDecision()}else{save();render()}}
function getAllocations(d){if(d.n==='MISS')return [{key:'MISS',marks:0}];if(d.n==='BULL')return [{key:'BULL',marks:d.m}];let result=[{key:String(d.n),marks:d.m}];if(d.m===2)result.push({key:'DOUBLE',marks:1});if(d.m===3)result.push({key:'TRIPLE',marks:1});return result}
function shanghai(){let d=state.darts;return d.length===3&&d.every(x=>typeof x.n==='number'&&x.n===d[0].n)&&d.map(x=>x.m).sort().join('')==='123'}
function bed(){let d=state.darts;return d.length===3&&d.every(x=>x.n!== 'MISS'&&x.n===d[0].n)}
function calculate(alloc){
 let p=state.players[state.turn],op=state.players[1-state.turn],mk={...p.marks},pts=0;
 for(let hit of alloc){let key=hit.key;if(key==='MISS')continue;let before=mk[key]||0;let space=Math.max(0,3-before);let extra=Math.max(0,hit.marks-space);mk[key]=Math.min(3,before+hit.marks);
 if((op.marks[key]||0)<3){if(/^\d+$/.test(key))pts+=extra*Number(key);if(key==='BULL')pts+=hit.pointExcess||extra*25}
 }
 return {marks:mk,points:pts,alloc};
}
function build(){
 let variants=[[]];for(let d of state.darts){let next=[];for(let prev of variants)for(let a of getAllocations(d))next.push([...prev,a]);variants=next}
 if(bed())variants.push([{key:'BED',marks:1}]);
 let seen=new Set();return variants.filter(v=>{let sig=v.map(x=>x.key+':'+x.marks).join('|');if(seen.has(sig))return false;seen.add(sig);return true}).map(calculate);
}
function showOptions(){
 if(state.phase!=='choose')return;let box=$('choices');box.innerHTML=options.map((o,i)=>`<button class="${selected===i?'sel':''}" data-choice="${i}">OPTION ${i+1}: ${o.alloc.map(x=>x.key==='MISS'?'MISS':x.marks+' × '+x.key).join(' • ')}<small>${o.points?'+'+o.points+' scoring points • ':''}${shanghai()?'+100 Shanghai • ':''}choose this allocation</small></button>`).join('');
 box.querySelectorAll('[data-choice]').forEach(el=>el.onclick=()=>{stop();selected=+el.dataset.choice;showOptions();$('message').textContent='Option '+(selected+1)+' selected. Confirm claim?';$('seconds').textContent='✓';$('pause').classList.add('hidden');$('listen').classList.add('hidden')})
}
function celebration(){let pop=document.createElement('div');pop.className='party';pop.innerHTML='<div>🎉 SHANGHAI! 🎯<small>+100 POINTS</small></div>';document.body.append(pop);setTimeout(()=>pop.remove(),2400)}
function promptDecision(){
 selected=0;if(shanghai())celebration();
 let text=(shanghai()?'Shanghai! One hundred bonus points! ':'')+"What's he take?";
 let current=++token; $('message').textContent=text;
 speak(text,()=>{if(current===token&&state.phase==='choose')listen()});
}
function listen(){
 if(state.phase!=='choose')return;stop();let current=token,count=10;
 $('listen').classList.add('hidden');$('pause').classList.remove('hidden');$('message').textContent='Listening… what do you take?';$('seconds').textContent='10';
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(Speech){try{listening=new Speech();listening.lang='en-AU';listening.continuous=true;listening.onresult=e=>{if(current!==token)return;let words=e.results[e.results.length-1][0].transcript.toLowerCase();$('info').textContent='Heard: '+words;if(/wait|hang on|hold on|pause|just a sec/.test(words)){pause();return}
 let x=words.match(/(?:option|number|choice)\s*(\d+)/);let index=x?Number(x[1])-1:-1;
 if(index<0&&/twenties out|take the twenties|all twenties/.test(words))index=options.findIndex(o=>o.alloc.every(x=>x.key==='20'));
 if(index>=0&&index<options.length){selected=index;stop();showOptions();$('message').textContent='Option '+(index+1)+' selected. Tap Confirm.';$('seconds').textContent='✓';$('pause').classList.add('hidden')}};listening.onerror=()=>{$('info').textContent='Mic unavailable. Tap an option instead.'};listening.start()}catch(e){$('info').textContent='Microphone unavailable here; select by touch.'}}else{$('info').textContent='Browser recognition unsupported. Select by touch.'}
 clock=setInterval(()=>{if(current!==token){clearInterval(clock);return}count--;$('seconds').textContent=count;if(count<=0)pause()},1000);
}
function pause(){if(state.phase!=='choose')return;stop();$('message').textContent='No worries. Launch when ready.';$('seconds').textContent='⏸';$('listen').classList.remove('hidden');$('pause').classList.add('hidden')}
function commit(){
 if(state.phase!=='choose')return;stop();snapshot();let o=options[selected],p=state.players[state.turn];p.marks=o.marks;p.points+=o.points+(shanghai()?100:0);if(shanghai())p.shang++;
 let finished=T.every(t=>(p.marks[t]||0)>=3)&&p.points>=state.players[1-state.turn].points;state.phase=finished?'win':'done';save();render();$('message').textContent=finished?'WINNER!':(shanghai()?'+100 Shanghai added. ':'')+'Turn saved. Next player.';speak(finished?'Game over! Winner!':shanghai()?'Shanghai! One hundred points added.':'Turn saved.');
}
function undo(){if(!history.length)return;stop();state=JSON.parse(history.pop());options=[];selected=0;save();render();if(state.phase==='choose'){$('message').textContent='Previous choice restored. Select by touch.';$('listen').classList.remove('hidden')}}
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
