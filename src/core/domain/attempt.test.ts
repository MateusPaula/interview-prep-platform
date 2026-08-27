import { describe, expect, it } from "vitest";
import { ATTEMPT_OUTCOMES, isAttemptOutcome } from "./attempt";

describe("ATTEMPT_OUTCOMES", () => {
  it("covers solved, solved_with_hints and gave_up", () => {
    expect(ATTEMPT_OUTCOMES).toEqual([
      "solved",
      "solved_with_hints",
      "gave_up",
    ]);
  });
});

describe("isAttemptOutcome", () => {
  it("accepts every outcome", () => {
    for (const outcome of ATTEMPT_OUTCOMES) {
      expect(isAttemptOutcome(outcome)).toBe(true);
    }
  });

  it("rejects an unknown value", () => {
    expect(isAttemptOutcome("failed")).toBe(false);
  });
});
