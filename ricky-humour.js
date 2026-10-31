(function(){
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const banks = {
    wake:["What?","Shoot.","Yeah?","Go on.","What now?"],
    confidence:[
      "I was born ready. Unfortunately, so were none of you.",
      "This is elite-level nonsense and I am absolutely qualified.",
      "Everybody relax. I have no idea what I'm doing, but I look confident.",
      "Pressure makes diamonds. Apparently it also makes you throw like that.",
      "I don't need a plan. I need everyone else to stop interfering with greatness."
    ],
    lowScore:[
      "Hahaha! That's not a visit, that's an administrative error.",
      "Hahaha! I've seen stronger numbers on a microwave timer.",
      "Hahaha! Mate, the board is over there.",
      "Hahaha! That's a score you'd normally keep private.",
      "Hahaha! Even the darts look embarrassed."
    ],
    bigScore:[
      "Now we're talking. Somebody finally remembered what game this is.",
      "That's got some horsepower on it.",
      "Beautiful. Disgusting confidence. I approve.",
      "There we go. Actual darts have entered the building.",
      "That's the sort of visit that gets mentioned twice."
    ],
    miss:[
      "That dart had a family and still chose to leave home.",
      "I've seen GPS units with less confusion.",
      "Bold strategy: aim at the board, hit the atmosphere.",
      "That one was looking for a different postcode.",
      "Somewhere, a wall just got nervous."
    ],
    meltdown:[
      "NO! Absolutely not! We had a plan! It was a terrible plan, but it was OUR plan!",
      "I cannot work under these conditions! Nobody can! The darts are lying to me!",
      "What is happening?! Why is everybody calm?! This is clearly an emergency!",
      "This is chaos! Beautiful, avoidable, completely unnecessary chaos!",
      "I need answers, a clipboard, and possibly a responsible adult!"
    ],
    jordy:[
      "Jordy's got the work rate of a stale bottle of milk.",
      "Jordy does fuck all so consistently it's basically a trade qualification. CRACK!",
      "The fridge works harder than Jordy and it's plugged into the wall.",
      "Jordy can turn a full day into a lunch break with no visible effort.",
      "If doing nothing was cardio, Jordy would be absolutely shredded. CRACK!",
      "Jordy's calendar just says 'maybe later' seven days a week.",
      "I've seen expired milk with more urgency than Jordy.",
      "Jordy could procrastinate during a fire drill. CRACK!"
    ],
    dwayno:[
      "Dwayno has the confidence of a bloke who definitely didn't read the instructions.",
      "Dwayno sees a conspiracy and immediately starts warming up a TED Talk.",
      "If Dwayno says 'hear me out', cancel the afternoon.",
      "Dwayno can turn one rumour into a six-part documentary before smoko.",
      "Dwayno doesn't need evidence. He's got vibes and a cigarette. CRACK!",
      "Every time Dwayno lowers those glasses, another theory gets promoted to fact."
    ],
    agentK:[
      "Agent K gets a respectful roast. I enjoy being alive.",
      "I'm not roasting Agent K. I have survival instincts.",
      "Agent K walked in and I forgot the question. Moving on.",
      "Agent K gets one rule: be nice. I'm suddenly very professional.",
      "I had a roast ready, then Agent K looked over here and now I have nothing.",
      "Agent K is off-limits. I am chaotic, not suicidal."
    ],
    postScore:[
      "Saved. Try not to ruin the momentum.",
      "Score's in. Don't make me regret believing in you.",
      "Locked in. Next dart, less theatre.",
      "Saved. Carry on, superstar.",
      "That's in the book. Against my better judgement."
    ],
    filler:[
      "I love this game. Nobody knows why.",
      "Confidence is high. Evidence is mixed.",
      "This whole operation feels legally questionable.",
      "Somebody write this down before we deny it happened.",
      "We're one bad decision away from a documentary."
    ]
  };

  let roastTarget = null;
  let roastDepth = 0;

  function roast(target, more=false){
    const key = String(target||'').toLowerCase().replace(/duano/g,'dwayno');
    if(!banks[key]) return null;
    if(roastTarget !== key){ roastTarget = key; roastDepth = 0; }
    if(more) roastDepth++;
    const line = pick(banks[key]);
    if(roastDepth >= 2 && key !== 'agentK' && Math.random() < 0.45) return line + ' ' + pick(banks.meltdown);
    return line;
  }

  window.ExtractorRickyHumour = {
    banks,
    pick,
    wake:()=>pick(banks.wake),
    lowScore:()=>pick(banks.lowScore),
    bigScore:()=>pick(banks.bigScore),
    postScore:()=>pick(banks.postScore),
    meltdown:()=>pick(banks.meltdown),
    filler:()=>pick(banks.filler),
    roast,
    tellMeMore:()=>roastTarget ? roast(roastTarget,true) : pick(banks.filler),
    clearRoast:()=>{roastTarget=null;roastDepth=0;}
  };
})();
