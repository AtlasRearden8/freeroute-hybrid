import { decideRoute, savingsLabel, type Stats } from "./router";
import { firebaseConfigured, warmOnDeviceModel } from "./firebase";
import { runTask } from "./run";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const stats: Stats = { onDevice: 0, inCloud: 0, mock: 0 };

if (!firebaseConfigured) {
  const b = $("banner");
  b.hidden = false;
  b.textContent = "Firebase is not configured (see .env.example). Responses below are SIMULATED so the UI can be developed offline.";
}

$("warm").addEventListener("click", () => {
  $("warm-status").textContent = " preparing...";
  warmOnDeviceModel((pct) => ($("warm-status").textContent = ` on-device model download: ${pct}%`));
});

$("prompt").addEventListener("input", () => {
  const p = ($("prompt") as HTMLTextAreaElement).value;
  if (p.trim()) $("warm-status").title = `Planned route: ${decideRoute(p).route}`;
});

$("go").addEventListener("click", async () => {
  const prompt = ($("prompt") as HTMLTextAreaElement).value.trim();
  if (!prompt) return;
  const out = $("out");
  out.innerHTML = '<div class="card">Routing...</div>';
  try {
    const r = await runTask(prompt);
    if (r.source === "ON_DEVICE") stats.onDevice++;
    else if (r.source === "IN_CLOUD") stats.inCloud++;
    else stats.mock++;
    const card = document.createElement("div");
    card.className = "card";
    const pill = document.createElement("span");
    pill.className = `pill ${r.source}`;
    pill.textContent = r.source.replace("_", "-");
    const meta = document.createElement("small");
    meta.textContent = ` policy: ${r.decision.route} (${r.decision.reasons.join("; ")}) in ${Math.round(r.ms)} ms`;
    const body = document.createElement("p");
    body.textContent = r.text; // textContent: model output is never injected as HTML
    card.append(pill, meta, body);
    out.replaceChildren(card);
  } catch (e) {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = `Error: ${(e as Error).message}`;
    out.replaceChildren(card);
  }
  $("stats").textContent = savingsLabel(stats);
});
