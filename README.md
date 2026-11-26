# FreeRoute Hybrid

A local-first AI task router for the web, built on **Firebase AI Logic hybrid inference** (#BuildHybridAI 2026).

Short, private, single-turn tasks run **on-device** with Gemini Nano in Chrome (free, private, works offline).
Long, heavy or multi-turn tasks go to the **cloud** model first. Every response shows which path ran
(`inferenceSource`) and a running tally of how many requests stayed on-device.

> Status: skeleton. Routing policy, hybrid model wiring, UI, tests and build work.
> Real inference needs a Firebase project (see Setup); without one the UI runs in a clearly labelled SIMULATED mode.

## How it uses Firebase AI Logic
- `getAI(app, { backend: new GoogleAIBackend() })` (Gemini Developer API, free tier)
- `getGenerativeModel(ai, { mode: InferenceMode.PREFER_ON_DEVICE })` for local-first tasks
- `getGenerativeModel(ai, { mode: InferenceMode.PREFER_IN_CLOUD })` for cloud-first tasks
- `model.initializeDeviceModel()` from a user click, `response.inferenceSource` to show the path taken
- Firebase App Check (debug provider for dev, reCAPTCHA for the public demo)

## Setup
1. `npm install`
2. Create a Firebase project, register a Web app, enable **AI Services > AI Logic** with the Gemini Developer API.
3. `cp .env.example .env` and fill the web config values.
4. Chrome 139+ desktop: enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, restart.
5. `npm run dev`, open the console, register the printed App Check debug token (Firebase console > App Check > Apps > Manage debug tokens). Never commit the token.
6. `npm test` and `npm run build`.

## Project layout
- `src/router.ts` pure routing policy (unit tested)
- `src/firebase.ts` Firebase init, App Check, hybrid models
- `src/run.ts` runs a task and reports the inference source
- `src/main.ts` UI

## License
Apache-2.0
