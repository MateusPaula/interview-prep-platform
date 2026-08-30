import { describe, expect, it } from "vitest";
import { CONFIDENCE_LEVELS, isConfidenceLevel } from "./confidence";

describe("CONFIDENCE_LEVELS", () => {
  it("ranges from 1 to 5", () => {
    expect(CONFIDENCE_LEVELS).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("isConfidenceLevel", () => {
  it("accepts levels 1 through 5", () => {
    for (const level of CONFIDENCE_LEVELS) {
      expect(isConfidenceLevel(level)).toBe(true);
    }
  });

  it("rejects 0 and 6", () => {
    expect(isConfidenceLevel(0)).toBe(false);
    expect(isConfidenceLevel(6)).toBe(false);
  });

  it("rejects fractional values", () => {
    expect(isConfidenceLevel(3.5)).toBe(false);
  });
});
