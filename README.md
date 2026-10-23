# Extractor’s Play — iPad PWA beta (v0.3.0)

A local two-player **Mickey Mouse only** web app. Other games and online play are disabled menu placeholders. No chat.

## Install on an iPad
1. Create a **new** GitHub repository (do not replace the Nexus repository). Upload the contents of this folder to its main branch.
2. In repository Settings → Pages select **Deploy from a branch**, main / root, and save.
3. Visit the resulting HTTPS Pages URL in **Safari on iPad**.
4. Tap Share → **Add to Home Screen** → Add.

The home screen app opens to the menu, and Mickey Mouse is the only playable game. The app caches basic files for offline use after a successful HTTPS visit. Game status is stored locally in the browser; it is not cloud synced.

## Included
- Local two-player scoring; 20–12, double, triple, bed, one bull row
- Separate individual X markers, one green bull mark or two red bull marks
- Tactical allocation after three darts, Shanghai +100 bonus and celebration
- Voice prompt and optional 10-second speech-recognition window, “wait a sec” pause, “Launch when ready” resume; touch fallback
- 101, 301, 501 and online/friends disabled placeholders

## Important beta limitations
- The intro now uses Big Fella's supplied recording. Gameplay prompts, including “What's he take?”, still use browser speech synthesis.
- Target OMNI is **not connected** and a supported API is not yet confirmed.
- Rule variations concerning Bed, Double, Triple, Bull point conversion, endgame and tactical allocation require further validation against Big Fella's specific house rules. The beta supports manual scoring for preliminary testing and should not be used for consequential competitive records.
- Voice recognition is not guaranteed in iOS Safari or inside ChatGPT previews, and mic permission generally requires the proper web context.
- The global win condition is provisional. No accounts, network play or chat.
- Repository deployment and hosting have **not** been performed.

## v0.1.1 fixes
- Claim choices now persist when returning from the menu or reloading.
- Every new turn starts with a valid first claim; invalid selections are guarded before scoring.
- Resumed claims expose the voice launch button.
- Offline cache cleanup removes only this app's caches.
- Target OMNI remains unconnected; no scoring-rule changes were made.

## Update the existing app
Replace the matching files in the existing extractors-play repository with the files in this package, then commit and push. Do not create a second repository. This package has not been deployed.

## v0.2.0 audio review beta
- Tap Play intro to start the existing image intro with Big Fella's real cleaned recording.
- The previous video audio is replaced, so it does not double the voice. Visual timing is stretched to retain the full recording.
- Intro volume slider is saved on this device; iOS may require the physical device volume controls. Native video controls support seeking and replay.
- Select Game leaves the intro; replay is available from the menu. Existing matches remain available.
- The v0.2.0 preview was a voice-only review mix. No new music, effects, animation, cloned voice or recorded gameplay cues are included.
- Include media/big-fella-intro.mp4 when uploading this package. Use an HTTPS host for installation; hosting has not been configured by this update.
- Safari/iPad audio playback and offline video seeking still require device testing.

## v0.3.0 Nexus music audition
- Includes the user-supplied Kicks 4 Free (Robbie Muir Remix) by Dawn Lee & K8-e, starting at the original track's 1:45. The remainder loops for this audition.
- Intro playback starts music; dedicated Music play/pause and level controls remain below the game. Music is lowered under intro audio and browser speech prompts. A Web Audio gain control supports music volume on iOS.
- Music pauses when the page is hidden, and can be resumed with Music. Intro play, pause and scrubbing follow the same music position; the downloadable review MP4 also has a fixed mix.
- Crowd/180, walking entrance, red eye and dart action footage are still pending and are not included in this build. The existing image intro remains.
- Upload music.js, the revised app.js/style.css/sw.js/index.html/README.md and the media folder together. No hosting or GitHub deployment has been performed.
- Recorded voice remains intact. Scoring rules and OMNI connection status are unchanged. Test playback on the target Safari/iPad before relying on it.

## Intro cue timing
The music source begins at 1:45. The existing images now play across 65 seconds. The full supplied voice starts six seconds into the intro. At 65 seconds (original song time 2:50), game selection opens automatically and the music continues. The cue follows the requested timestamp; no beat-detection claim is made. New Xman walking/red-eye/dart footage and crowd/180 audio remain pending.
