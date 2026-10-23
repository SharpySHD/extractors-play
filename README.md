# Extractor’s Play — iPad PWA beta (v0.1.1)

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
- Actual Big Fella voice recording has **not** been incorporated; the prompt currently uses browser speech synthesis.
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
