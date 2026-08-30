import { describe, expect, it } from "vitest";
import { TIMER_DURATION_SECONDS } from "./timer";

describe("TIMER_DURATION_SECONDS", () => {
  it("gives easy challenges 20 minutes", () => {
    expect(TIMER_DURATION_SECONDS.easy).toBe(1200);
  });

  it("gives medium challenges 35 minutes", () => {
    expect(TIMER_DURATION_SECONDS.medium).toBe(2100);
  });

  it("gives hard challenges 50 minutes", () => {
    expect(TIMER_DURATION_SECONDS.hard).toBe(3000);
  });
});
