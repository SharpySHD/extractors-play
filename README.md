# Extractor’s Play — public device test v0.13.3

Full-repository stability pass. Mic/camera permission is requested before intro; Ricky is default and the live recognizer state drives MIC status. Music mode is authoritative across intro/menu/gameplay.

Current public browser test build for Extractor’s Play.

## v0.13.3 listening + barge-in update
- Saying **Hey Ricky** pauses Nexus music immediately; it resumes after the command/score exchange according to the saved music mode.
- Ricky remembers the last roast target. After roasting Jordy or Dwayno/Duano, **Hey Ricky, tell me more** continues on the same person and gets cruder.
- Later follow-ups can trigger an over-the-top Ricky meltdown using the existing Ricky reaction audio plus a scripted rant.
- Double/triple shorthand remains strict: multiplier words/numbers only form a dart when followed by a board number (for example `double 20`, `2 20`, `triple 19`, `3 19`). Plain board numbers default to singles.

## Included in v0.13.3
- Nexus home first; main screen kept to games, players, player-related controls and Start.
- All other controls live behind the Settings gear.
- Before the intro, the app asks once for microphone + front-camera permission. Once granted, the intro starts.
- Ricky is the default MC voice on a fresh device and the hot mic arms when the menu loads, then continuously reconnects while the game tab is active.
- “Hey Ricky” gives a short reply — e.g. “What?”, “Shoot.”, “Yeah?” — then stays ready for the score/command until handled.
- Natural dart speech supports forms such as `1 20 1 19 1 18`, `a 20 a 19 an 18`, `give me a 20 a 19 an 18`, plus single/double/triple wording.
- Saved score is called back, then Ricky may banter afterward.
- Music settings: Play Always, Voice Controlled, Off.
- Voice settings commands include music on/off/mode, sound level, Ricky mode, banter, Settings, Spotify, intro, Developer and Knowledge/Memory.
- Spotify opens/closes inside Settings with “Hey Ricky, open Spotify” / “close Spotify”.
- “Hey Ricky, register new player” starts a spoken registration flow: name → optional username → “shall I take a selfie?” → yes opens the front camera → “take it” captures and saves.
- Jordy roast command included with a random roast bank.
- Dwayno / Duano roast command included with a separate conspiracy-themed roast bank.

## Public test URL
https://sharpyshd.github.io/extractors-play/

Upload the files in this package to the repository root and replace matching files. Then commit once. GitHub Pages remains configured from `main` → `/(root)`.


## v0.13.3 roast-loop / Ricky humour merge
- Ricky Humour Package is bundled into the live repo.
- `Hey Ricky, roast Jordy` and `roast Dwayno` run one roast at a time continuously until `shut up`, `Ricky shut up`, `that's enough`, or `stop roasting`.
- `Roast Agent K` uses a playful/flirty, non-savage bank.
- `Hey Ricky, tell me more` remembers the last roast target and escalates the next line.
- Full-duplex wake, barge-in, high-listening, echo suppression, natural dart grammar, Spotify/settings voice control, and all v0.12.6 behaviour are retained.


## v0.13.3 voice-profile boot wizard
- Menu boot opens a Ricky voice-recognition dialog once per page load.
- Ricky asks whether Player 1 is already logged in; saved players can identify themselves by spoken profile name, while new players are routed into registration.
- Ricky then asks whether Player 2 is joining and repeats the saved-player/registration flow for that seat.
- New voice registration asks for name, optional username, a spoken drill (count 12 through 20, then say double, triple, bed, bull), and optional selfie.
- The short enrolment transcript and capped local audio sample are stored inside that player profile on this device only.
- Current browser build uses the spoken player name as the reliable login fallback. The stored audio sample is groundwork for future speaker-ID; this build does not claim Siri-grade biometric speaker matching.
