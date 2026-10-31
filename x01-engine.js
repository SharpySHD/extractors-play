/* Pure countdown rules, shared by touch and spoken dart entry. */
(function(root){
 function fresh(start){if(![101,301,501].includes(start))throw Error('Invalid game');return {start,scores:[start,start],turn:0,visitStart:start,darts:[],mult:1,phase:'throw',round:1,notice:'Three darts. Finish on a double.'}}
 function value(d){
  if(d.n==='MISS'&&d.m===0)return 0;
  if(d.n==='BULL'&&[1,2].includes(d.m))return d.m*25;
  if(Number.isInteger(d.n)&&d.n>=1&&d.n<=20&&[1,2,3].includes(d.m))return d.n*d.m;
  throw Error('Invalid dart');
 }
 function add(state,d){
  if(state.phase!=='throw'||state.darts.length>=3)return state;
  const points=value(d),s={...state,scores:[...state.scores],darts:[...state.darts,{...d}],mult:1};
  const remaining=s.scores[s.turn]-points;
  if(remaining<0||remaining===1||(remaining===0&&d.m!==2)){
   s.scores[s.turn]=s.visitStart;s.phase='bust';s.notice='BUST — visit reset to '+s.visitStart+'.';
  }else{
   s.scores[s.turn]=remaining;
   if(remaining===0){s.phase='win';s.notice=(s.turn?'BIG FELLA':'CHALLENGER')+' WINS! Double checkout.'}
   else if(s.darts.length===3){s.phase='done';s.notice='Visit scored '+(s.visitStart-remaining)+'. Next player.'}
   else s.notice=remaining+' remaining · '+(3-s.darts.length)+' darts left.';
  }
  return s;
 }
 function next(state){
  if(!['done','bust'].includes(state.phase))return state;
  const turn=1-state.turn;
  return {...state,turn,visitStart:state.scores[turn],darts:[],mult:1,phase:'throw',round:state.round+(turn===(state.starter??0)?1:0),notice:'Three darts. Finish on a double.'};
 }
 root.ExtractorX01Engine={fresh,value,add,next};
})(typeof window!=='undefined'?window:globalThis);
