# Demo video script — FreeRoute Hybrid (under 3:00)

Target length: about 2 minutes 15 seconds. Hard stop: 3:00 (judges need not watch past that).  
Record in Chrome on desktop, 1280×720 or 1920×1080, no copyrighted music, English (or English subtitles).  
Preferred: screen recording of the live demo (Firebase configured). Do **not** present SIMULATED answers as real model output.

If Gemini Nano is available, click **Prepare on-device model** once before recording and wait until the download is done. If it is not available, say so in the first 20 seconds and show the honest IN CLOUD fallback.

## Shot list and spoken lines

**0:00–0:20 — Title and problem**  
[Full-page load of FreeRoute Hybrid.]  
“I’m Dylan Asdale. This is FreeRoute Hybrid, a web app for the Firebase #BuildHybridAI hackathon. Short or private tasks should run on your device for free. Longer or harder ones can use the cloud. The app shows you which path actually ran.”

**0:20–0:40 — How routing works**  
[Scroll the “How a request is routed” section, then click **Short summary**.]  
“A local policy decides the planned route before anything is sent. This short summary is local first: it should try Gemini Nano on this device through Firebase AI Logic.”

**0:40–1:15 — First run**  
[Click **Route and run**. Point at the planned-route box, then at the result badge.]  
If on-device works: “The badge says RAN ON-DEVICE. The policy and the runtime agreed, and this request never needed the cloud.”  
If it falls back: “The policy said local first, but this machine does not have Gemini Nano ready, so Firebase fell back to the cloud. The badge says RAN IN CLOUD, which is the hybrid SDK doing its job.”

**1:15–1:40 — Private example**  
[Click **Private reminder**, run it.]  
“This one looks personal, so the policy keeps it local first. Same hybrid path: on-device if it can, cloud only if it must, and the badge tells you which one happened.”

**1:40–2:10 — Heavy analysis**  
[Click **Heavy analysis**, run it.]  
“This comparison is cloud first, because it looks like heavier analysis than the on-device budget is for. Firebase uses PREFER_IN_CLOUD, and the badge should show the cloud path.”

**2:10–2:25 — Tally and close**  
[Point at the session log and the footer tally.]  
“The footer counts how many requests stayed on-device — those are free and private. That’s FreeRoute Hybrid: policy first, Firebase AI Logic for the runtime, and an honest badge for every answer.”

## If time remains (optional, still finish by 2:45)
Show the GitHub repo README heading and the `src/firebase.ts` lines that set `InferenceMode.PREFER_ON_DEVICE` / `PREFER_IN_CLOUD`. Do not scroll through secrets or `.env`.

## Recording notes
- Use the mouse slowly; linger on the badge and the planned-route reasons.
- If a request errors (App Check, quota), stop, fix, and re-record that take. Do not leave an error as the final frame.
- Export MP4, upload to YouTube as **Public**, paste the URL into Devpost and into SUBMISSION.md.
