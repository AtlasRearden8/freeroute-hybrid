# FreeRoute Hybrid

A local-first AI task router for the web, built for **[#BuildHybridAI 2026](https://firebasehybridaihackathon.devpost.com/)** on **Firebase AI Logic hybrid inference**.

Short, private, single-turn tasks try **Gemini Nano on this device** (free, private, works offline). Longer or heavier tasks try the **cloud** model first. Every response shows which path actually ran, plus a running tally of how many requests stayed on-device.

Live demo (after GitHub Pages is enabled): https://atlasrearden8.github.io/freeroute-hybrid/

> Entered as an individual for #BuildHybridAI 2026.

## What you will see

1. A **planned route** appears as you type (or when you pick an example): `LOCAL FIRST` or `CLOUD FIRST`, with a plain-language reason.
2. **Route and run** sends the prompt through Firebase AI Logic in the matching inference mode.
3. The answer badge shows what actually ran: **on-device**, **in cloud**, or **SIMULATED**.

The planned route is a policy. The badge is the truth. Firebase may still fall back (for example, if Gemini Nano is not available on this machine), and the badge will say so.

### SIMULATED mode

If Firebase config is missing, the app does **not** pretend to call a model. The routing policy still runs for real, and the answer is clearly labelled `SIMULATED`. No prompt leaves the page. This is for local UI development and CI. It is not a judged demo path.

## How hybrid on-device / cloud routing works

Firebase AI Logic can run the same `generateContent()` call against an on-device model (Gemini Nano via Chrome's Prompt API, Chrome 139+ desktop) or a cloud-hosted Gemini model.

FreeRoute picks a *preference*, then lets the SDK fall back:

| Policy decision | Firebase mode | Meaning |
| --- | --- | --- |
| `LOCAL_FIRST` | `InferenceMode.PREFER_ON_DEVICE` | Use Gemini Nano if it is ready; otherwise fall back to the cloud model. |
| `CLOUD_FIRST` | `InferenceMode.PREFER_IN_CLOUD` | Use the cloud model if reachable; otherwise fall back to Gemini Nano. |

The policy currently sends a task cloud-first when it is multi-turn, longer than the on-device budget, or looks like heavy analysis. It stays local-first for short single-turn tasks and for prompts that look private.

Other Firebase AI Logic pieces this project uses:

- `getAI(app, { backend: new GoogleAIBackend() })` — Gemini Developer API, free tier
- `model.initializeDeviceModel()` — started from a **user click**, as Chrome requires
- `response.inferenceSource` — `on_device` or `in_cloud` (the SDK's real values; the docs sometimes show uppercase)
- **Firebase App Check**, which is enforced for AI Logic. Local dev uses the debug provider. A public demo should use a reCAPTCHA v3 **site** key. Never commit an App Check debug token or a reCAPTCHA **secret** key.

On-device Gemini Nano needs Chrome 139+ on desktop, the Prompt API flag enabled, enough disk for the model download, and typically a capable GPU. Machines without that still work: `PREFER_ON_DEVICE` falls back to the cloud, and the badge reports `IN_CLOUD`.

## How to run

The public Firebase web config is already in `src/firebase-config.ts` (these client values are public by design). A local `.env` is only needed for App Check debug or a reCAPTCHA site key.

```bash
npm install
npm test
npm run dev
```

Then open the local URL in Chrome 139+ and, if you want on-device inference:

1. Enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` and restart Chrome.
2. Click **Prepare on-device model** and wait for the download.
3. In the browser console, copy the App Check debug token and register it at Firebase console → App Check → your web app → Manage debug tokens. Never commit that token.

```bash
npm run build    # typecheck + production bundle
npm run preview  # serve the built app
```

Web config values in `.env` (`VITE_FIREBASE_*`, reCAPTCHA **site** key) are not secrets, but `.env` is gitignored anyway. A reCAPTCHA **secret** key must never be put in this repo or in the frontend.

## Project layout

- `src/router.ts` — pure routing policy, unit-tested, no Firebase imports
- `src/firebase.ts` — Firebase init, App Check, hybrid model instances
- `src/run.ts` — runs a task and reports `inferenceSource`
- `src/main.ts` — UI
- `DYLAN-FIREBASE-STEPS.md` — short click-by-click setup
- `SUBMISSION.md` — Devpost draft
- `VIDEO-SCRIPT.md` — under-3-minute demo script

## License

[Apache License 2.0](LICENSE)
