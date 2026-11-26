# Devpost submission draft — FreeRoute Hybrid

Use this as the text for https://firebasehybridaihackathon.devpost.com/ once the public repo and demo URL are live. Entrant: **Dylan Asdale, as an individual** (not a company). Platform: **Web / Chrome**.

## Project name
FreeRoute Hybrid

## Tagline
A local-first AI task router: on-device Gemini Nano when it can, cloud only when it must.

## Built with
Firebase AI Logic (hybrid inference), Firebase App Check, Gemini Nano (on-device), Gemini Developer API (cloud fallback), TypeScript, Vite, Chrome Prompt API

## Description (paste into Devpost)

FreeRoute Hybrid is a web app that routes each prompt to the cheapest, most private path that can actually handle it.

A small on-page policy looks at length, privacy cues, and whether the task looks like heavy analysis. Short or private single-turn tasks are marked LOCAL FIRST and sent with Firebase AI Logic in `PREFER_ON_DEVICE` mode, so Gemini Nano runs on the device when it is available. Longer or heavier tasks are marked CLOUD FIRST and sent in `PREFER_IN_CLOUD` mode. The policy is a preference, not a guarantee: Firebase still falls back if the preferred path is unavailable, and every answer is badged with `inferenceSource` so you can see whether the request really ran on-device or in the cloud. A session counter tracks how many requests stayed on-device — those cost $0 and never left the machine.

I used Firebase AI Logic as the only model runtime: `getAI` with the Gemini Developer API backend, `getGenerativeModel` with `InferenceMode.PREFER_ON_DEVICE` and `PREFER_IN_CLOUD`, `initializeDeviceModel()` started from a user click (required by Chrome), and `response.inferenceSource` to display the path that actually ran. Firebase App Check is initialized because AI Logic enforces it. The project is a new app built during the submission period.

This is useful for anyone who wants local, free, private inference for everyday short tasks without giving up a cloud model when the work is too long or too hard for the on-device budget. An outstanding single-platform (Web/Chrome) app can still win; hybrid routing is the point of the SDK, and that is what this project demonstrates.

## What was built during the submission period
The entire project: routing policy, Firebase AI Logic wiring, App Check, UI, tests, and docs. Started November 25, 2026.

## Demo and repo (fill in before submit)
- Repo: https://github.com/AtlasRearden8/freeroute-hybrid
- Demo: https://atlasrearden8.github.io/freeroute-hybrid/  (enable GitHub Pages after the first successful build, or replace with another HTTPS host)
- Video: _paste the public YouTube URL_

## Notes for the video and judges
- If the demo machine cannot run Gemini Nano (no GPU, flag off, model still downloading), the badge will honestly show IN CLOUD after a LOCAL FIRST policy decision. That is the hybrid fallback working, not a failure.
- Do not film SIMULATED mode as if it were live inference. If config is missing, say so, or wait until the live demo URL is up.
- App Check debug tokens and reCAPTCHA secret keys must not appear on screen or in the repo.
