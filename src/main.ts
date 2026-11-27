import { decideRoute, savingsLabel, type Stats } from "./router";
import { firebaseConfigured, warmOnDeviceModel } from "./firebase";
import { runTask } from "./run";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const PRESETS: Record<string, string> = {
  short: "Summarize this note in two sentences: The library holds a Saturday coding hour at 10, and I want a reminder to bring my laptop charger.",
  private: "Keep this confidential: draft a one-line personal reminder that I have a private appointment tomorrow at 2.",
  heavy: "Analyze these three options and compare the tradeoffs of local models, hosted free tiers, and paid APIs for a solo developer. Answer in five short bullets.",
  long: `${"This is a long briefing. ".repeat(280)}Please extract the five main risks and list them as bullets.`,
};

/** Tiny, safe markdown subset: escape everything, then allow bold, italics, headings and bullets. */
function renderLite(src: string): string {
  const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>");
  const out: string[] = [];
  let list: string[] | null = null;
  const flush = () => { if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; } };
  for (const raw of esc.split(/\n/)) {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    const head = line.match(/^#{1,6}\s+(.*)$/);
    if (bullet) { (list ??= []).push(`<li>${inline(bullet[1])}</li>`); continue; }
    flush();
    if (!line || /^-{3,}$/.test(line)) continue;
    out.push(head ? `<h4>${inline(head[1])}</h4>` : `<p>${inline(line)}</p>`);
  }
  flush();
  return out.join("");
}

const stats: Stats = { onDevice: 0, inCloud: 0, mock: 0 };
const history: { source: string; route: string }[] = [];

const banner = $("banner");
if (!firebaseConfigured) {
  banner.hidden = false;
  banner.textContent =
    "SIMULATED mode: Firebase is not configured yet (see .env.example). The router still runs for real, but model answers are labelled SIMULATED and no request leaves this page.";
} else {
  banner.hidden = false;
  banner.classList.add("live");
  banner.textContent = "Live: Firebase AI Logic is configured. The badge on each answer shows whether Gemini Nano (on-device) or the cloud model actually ran.";
}

function updatePlan(): void {
  const prompt = ($("prompt") as HTMLTextAreaElement).value;
  const plan = $("plan");
  const routeEl = $("plan-route");
  const reasonsEl = $("plan-reasons");
  if (!prompt.trim()) {
    plan.className = "plan";
    routeEl.textContent = "Type or pick an example to see the route.";
    reasonsEl.textContent = "";
    return;
  }
  const d = decideRoute(prompt);
  plan.className = `plan ${d.route}`;
  routeEl.textContent = d.route === "LOCAL_FIRST" ? "LOCAL FIRST — try on-device Gemini Nano" : "CLOUD FIRST — try the larger hosted model";
  reasonsEl.textContent = d.reasons.join(" ");
}

$("warm").addEventListener("click", () => {
  if (!firebaseConfigured) {
    $("warm-status").textContent = " Skipped in SIMULATED mode (no on-device model to download).";
    return;
  }
  $("warm-status").textContent = " preparing…";
  warmOnDeviceModel((pct) => {
    $("warm-status").textContent = ` on-device model download: ${pct}%`;
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.preset ?? "";
    ($("prompt") as HTMLTextAreaElement).value = PRESETS[key] ?? "";
    updatePlan();
    $("prompt").focus();
  });
});

$("prompt").addEventListener("input", updatePlan);

$("go").addEventListener("click", async () => {
  const prompt = ($("prompt") as HTMLTextAreaElement).value.trim();
  if (!prompt) return;
  const go = $("go") as HTMLButtonElement;
  go.disabled = true;
  const out = $("out");
  out.innerHTML = '<div class="card">Routing…</div>';
  try {
    const r = await runTask(prompt);
    if (r.source === "ON_DEVICE") stats.onDevice++;
    else if (r.source === "IN_CLOUD") stats.inCloud++;
    else stats.mock++;
    history.unshift({ source: r.source, route: r.decision.route });

    const card = document.createElement("div");
    card.className = "card";
    const pill = document.createElement("span");
    pill.className = `pill ${r.source}`;
    pill.textContent = r.source === "ON_DEVICE" ? "RAN ON-DEVICE" : r.source === "IN_CLOUD" ? "RAN IN CLOUD" : "SIMULATED";
    const meta = document.createElement("small");
    meta.className = "meta";
    meta.textContent = `Policy chose ${r.decision.route.replace("_", "-")}: ${r.decision.reasons.join("; ")}. Finished in ${Math.round(r.ms)} ms.`;
    const body = document.createElement("div");
    body.className = "answer";
    body.innerHTML = renderLite(r.text);
    card.append(pill, meta, body);
    out.replaceChildren(card);

    const log = $("log");
    const list = $("log-list");
    log.hidden = false;
    const item = document.createElement("li");
    item.textContent = `${r.source.replace("_", " ")} ← policy ${r.decision.route} — “${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}”`;
    list.insertBefore(item, list.firstChild);
  } catch (e) {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = `Error: ${(e as Error).message}`;
    out.replaceChildren(card);
  }
  $("stats").textContent = savingsLabel(stats);
  go.disabled = false;
});

updatePlan();
