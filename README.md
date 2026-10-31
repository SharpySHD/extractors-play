# Extractor’s Play — public device test v0.10.8

Current checked game from Jamie Sharp’s 1 November handover, replacing the older v0.1.1 repository app. No Node installation is required on the Windows or Android test device.

- Nexus home first, settings gear, Mickey Mouse and X01 modes.
- Ricky wake phrase, active-player routing and current scoring/choice flow.
- Complete supplied V15 cinematic, followed by continuous music in one native stream; browser-test media encode is reduced for GitHub’s web-upload limit. The full-quality film is retained in the separate checked source package.
- For this PUBLIC TEST, names, optional photos, profiles, matches and settings stay in each device’s browser. Profiles do not sync between devices. The private HQ profile/file services are not included or exposed.
- Original private app/server source remains in the separate developer package. This static test does not replace or weaken its authentication.
- OMNI hardware/software integration is pending; this is a browser scoring/voice test, not an implemented OMNI connection.
- Real Android microphone and playback must be tested after deployment over HTTPS.

Publish these files at repository root using GitHub Pages: Settings → Pages → Deploy from a branch → main → /(root) → Save. No npm build step. Keep media/ as a folder. Upload the extracted files, not the ZIP itself.

The video upgrade pass is paused; this test deliberately retains the supplied V15 pictures.


Small-upload revision: full phrase dictionary is constructed from the original generation rules instead of downloading a25MB literal. All phrase keys/values are verified identical. Browser-test video is960x540with a smaller bitrate, with unchanged story/audio timing; the separate full-quality film is retained. Use the numbered upload batches one at a time, committing each before the next.
