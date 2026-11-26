// Pure routing policy: decides which inference mode a task should use. No Firebase imports,
// so it is unit-testable and reusable by the other FreeRoute modules.

export type Route = "LOCAL_FIRST" | "CLOUD_FIRST";

export interface RouteDecision {
  route: Route;
  reasons: string[];
}

// On-device Gemini Nano: single-turn text, small context (~9k tokens). Good for short, private tasks.
export const ON_DEVICE_CHAR_BUDGET = 6000;

const HEAVY_HINTS = [/\banalyz/i, /\bresearch\b/i, /\bcompare\b.*\bsources\b/i, /\bwrite (a|an) (long|detailed)/i, /\bcode\b.*\b(refactor|review)\b/i];
const PRIVATE_HINTS = [/\bpassword\b/i, /\bprivate\b/i, /\bconfidential\b/i, /\bpersonal\b/i, /\bssn\b/i];

export function decideRoute(prompt: string, opts: { hasImage?: boolean; multiTurn?: boolean } = {}): RouteDecision {
  const reasons: string[] = [];
  if (opts.multiTurn) {
    return { route: "CLOUD_FIRST", reasons: ["multi-turn chat is not supported on-device"] };
  }
  if (prompt.length > ON_DEVICE_CHAR_BUDGET) {
    return { route: "CLOUD_FIRST", reasons: [`prompt longer than ${ON_DEVICE_CHAR_BUDGET} chars exceeds on-device budget`] };
  }
  if (PRIVATE_HINTS.some((r) => r.test(prompt))) {
    reasons.push("looks private: keep it on this device when possible");
    return { route: "LOCAL_FIRST", reasons };
  }
  if (HEAVY_HINTS.some((r) => r.test(prompt))) {
    return { route: "CLOUD_FIRST", reasons: ["looks like heavy analysis: use the larger cloud model first"] };
  }
  reasons.push("short single-turn task: on-device is free, private and offline-capable");
  return { route: "LOCAL_FIRST", reasons };
}

export interface Stats {
  onDevice: number;
  inCloud: number;
  mock: number;
}

export function savingsLabel(s: Stats): string {
  const total = s.onDevice + s.inCloud + s.mock;
  if (total === 0) return "No requests yet.";
  const pct = Math.round((s.onDevice / total) * 100);
  return `${s.onDevice} of ${total} requests ran on-device (${pct}%): $0 cloud cost and no data left this device.`;
}
