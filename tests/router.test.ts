import { describe, expect, it } from "vitest";
import { decideRoute, savingsLabel, ON_DEVICE_CHAR_BUDGET } from "../src/router";

describe("decideRoute", () => {
  it("prefers local for short single-turn tasks", () => {
    expect(decideRoute("Summarize this note in two sentences.").route).toBe("LOCAL_FIRST");
  });
  it("goes cloud-first for multi-turn", () => {
    expect(decideRoute("hi", { multiTurn: true }).route).toBe("CLOUD_FIRST");
  });
  it("goes cloud-first when over the on-device budget", () => {
    expect(decideRoute("x".repeat(ON_DEVICE_CHAR_BUDGET + 1)).route).toBe("CLOUD_FIRST");
  });
  it("keeps private-looking prompts local", () => {
    expect(decideRoute("my personal password hints: ...").route).toBe("LOCAL_FIRST");
  });
  it("sends heavy analysis to cloud", () => {
    expect(decideRoute("Analyze these three contracts").route).toBe("CLOUD_FIRST");
  });
});

describe("savingsLabel", () => {
  it("handles empty and mixed stats", () => {
    expect(savingsLabel({ onDevice: 0, inCloud: 0, mock: 0 })).toBe("No requests yet.");
    expect(savingsLabel({ onDevice: 3, inCloud: 1, mock: 0 })).toContain("75%");
  });
});
