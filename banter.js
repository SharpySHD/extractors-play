/* Curated X-Man repertoire. Context comes from the rules engine, never invented history. */
(()=>{
 const lines={
 welcome:[
  'Welcome to the Nexus. Confidence goes on the left. Darts go in the board.',
  'Good to see you. The board has been warned.',
  'Your place in the arena is ready. Your excuses can wait outside.',
  'All systems ready. Bring your own aim.',
  'Step forward. The scoreboard enjoys a good story.',
  'Welcome aboard. The dramatic lighting is complimentary.',
  'The Nexus is open. The treble twenty is accepting visitors.',
  'Player registered. Legendary status is still pending.',
  'Good to have you here. Let us make the board nervous.',
  'Your name is on the roster. Now give us something to announce.'
 ],
 next:[
  'Your turn. The board is still in the same place.',
  'Approach the oche. Try to look expensive.',
  'Three darts. Plenty of room for a plot twist.',
  'The stage is yours. Keep the autobiography brief.',
  'Steady hand. Dramatic entrance optional.',
  'Time to turn confidence into arithmetic.',
  'The board awaits your next strongly worded delivery.',
  'All eyes forward. Especially mine.',
  'Your opponent has had their moment. Reclaim the lighting.',
  'Let us see what those darts have been promising.'
 ],
 good:[
  'That is the sort of arithmetic I can get behind.',
  'Nicely done. Even the scoreboard sat up.',
  'A useful visit. Very inconsiderate to your opponent.',
  'Good work. Confidence has supporting evidence.',
  'That gave the scoreboard something to do.',
  'Sharp throwing. I approve of the branding.',
  'A tidy collection. No loose change there.',
  'Strong visit. Keep the machinery running.',
  'That has put a little pressure in the room.',
  'Well played. You made that look suspiciously intentional.'
 ],
 low:[
  'Room for improvement. Fortunately, we have a whole arena.',
  'The comeback department remains open.',
  'A quiet visit. Let us call it suspense.',
  'The board has survived that conversation.',
  'We will file that under character development.',
  'Not every visit needs fireworks. Apparently.',
  'A tactical pause in the scoring department.',
  'Plenty of story left in this game.',
  'The next visit has an excellent chance of being more interesting.',
  'Reset the shoulders. Leave that visit behind.'
 ],
 bust:[
  'Bust. The arithmetic has exercised its right of refusal.',
  'Bust. Ambition has overtaken the exit.',
  'Bust. That visit has been returned to sender.',
  'Bust. The scoreboard would like you to try again.',
  'Bust. Strong finish. Unfortunately, to the wrong number.',
  'Bust. A little less enthusiasm next time.',
  'Bust. The points are back where you found them.',
  'Bust. The double exit remains a double exit.',
  'Bust. Consider that a rehearsal.',
  'Bust. Your previous score has made a comeback.'
 ],
 maximum:[
  'One hundred and eighty. Finally, someone reads the instructions.',
  'One hundred and eighty. Three deliveries. One address.',
  'One hundred and eighty. That is how you disturb a quiet arena.',
  'One hundred and eighty. The treble twenty is fully booked.',
  'One hundred and eighty. I may have to polish the spotlight.',
  'One hundred and eighty. Nothing left in that visit.',
  'One hundred and eighty. A very tidy piece of demolition.',
  'One hundred and eighty. The board will remember that.',
  'One hundred and eighty. Excellent use of the narrow bit.',
  'One hundred and eighty. Now that deserves the big lights.'
 ],
 shanghai:[
  'Shanghai. Single, double, treble. A complete argument.',
  'Shanghai. The full set. No assembly required.',
  'Shanghai. A hundred bonus points with excellent manners.',
  'Shanghai. Three different ways to make the same point.',
  'Shanghai. That is a well organised visit.',
  'Shanghai. Variety, for once, has paid off.',
  'Shanghai. The board appreciates a balanced approach.',
  'Shanghai. All three gears engaged.',
  'Shanghai. A complete collection. Very tasteful.',
  'Shanghai. That visit came with a bonus attachment.'
 ],
 bed:[
  'Bed claimed. Make yourself comfortable on the scoreboard.',
  'One bed mark. No pillow required.',
  'Bed secured. A respectable piece of property.',
  'That bed is on the board. Keep the rest of the room tidy.',
  'Bed claimed. We are furnishing the scorecard nicely.',
  'A bed mark. Quite the domestic achievement.',
  'Bed secured. The scoreboard has found accommodation.',
  'One for the bed. A small mark with useful intentions.',
  'Bed taken. Your opponent can arrange their own lodging.',
  'Bed on the card. We will leave the curtains open.'
 ],
 checkout:[
  'A finish is in sight. The double will be expecting you.',
  'The exit is getting closer. Use the correct door.',
  'Checkout territory. Time for precision, not a speech.',
  'The finishing double is starting to look important.',
  'Nearly home. Please mind the double.',
  'Keep the head still. The finish will not run away.',
  'A double exit. Very civilised when it works.',
  'Close enough to start thinking carefully.',
  'This is where the little ring earns its reputation.',
  'A finish is available. No need to frighten it.'
 ],
 win:[
  'Game shot. You may now act as though it was inevitable.',
  'A winner. The scoreboard has reached a conclusion.',
  'Game over. Confidence has been officially validated.',
  'Well played. Victory looks reasonably comfortable on you.',
  'That is the game. Try to remain approachable.',
  'A fine result. The victory speech has a strict time limit.',
  'Winner confirmed. The board has no further questions.',
  'Game shot. A convincing end to the conversation.',
  'The game is yours. The rematch is another matter.',
  'Victory recorded on the scoreboard. Enjoy the moment.'
 ]};
 let enabled=true,lastAt=-Infinity,cursors={},previous={};
 try{enabled=localStorage.getItem('extractorBanter')!=='off';cursors=JSON.parse(localStorage.getItem('extractorBanterCursors')||'{}')}catch(_){}
 function pick(topic){if(!enabled||Date.now()-lastAt<12000||!lines[topic])return '';window.ExtractorRecordedRicky?.queue(topic);const pool=lines[topic];let index=Number.isInteger(cursors[topic])?cursors[topic]%pool.length:Math.floor(Math.random()*pool.length);if(previous[topic]===index)index=(index+1)%pool.length;previous[topic]=index;cursors[topic]=(index+1)%pool.length;lastAt=Date.now();try{localStorage.setItem('extractorBanterCursors',JSON.stringify(cursors))}catch(_){}return pool[index]}
 function toggle(){enabled=!enabled;try{localStorage.setItem('extractorBanter',enabled?'on':'off')}catch(_){}return enabled}
 window.ExtractorBanter={pick,toggle,isEnabled:()=>enabled,lines};
})();
