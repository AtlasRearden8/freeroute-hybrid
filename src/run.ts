import { decideRoute, type RouteDecision } from "./router";
import { InferenceSource } from "firebase/ai";
import { getModels } from "./firebase";

export interface RunResult {
  text: string;
  source: "ON_DEVICE" | "IN_CLOUD" | "MOCK";
  decision: RouteDecision;
  ms: number;
}

export async function runTask(prompt: string): Promise<RunResult> {
  const decision = decideRoute(prompt);
  const started = performance.now();
  const models = getModels();

  if (!models) {
    // Dev/CI fallback ONLY: clearly labelled in the UI as SIMULATED. Never used when Firebase is configured.
    await new Promise((r) => setTimeout(r, 150));
    return { text: `[SIMULATED: Firebase not configured] Would route "${decision.route}" for: ${prompt.slice(0, 80)}`, source: "MOCK", decision, ms: performance.now() - started };
  }

  const model = decision.route === "LOCAL_FIRST" ? models.localFirst : models.cloudFirst;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const src = response.inferenceSource === InferenceSource.ON_DEVICE ? "ON_DEVICE" : "IN_CLOUD";
  return { text: response.text(), source: src, decision, ms: performance.now() - started };
}
