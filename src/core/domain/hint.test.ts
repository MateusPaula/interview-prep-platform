import { describe, expect, it } from "vitest";
import { HINT_LEVELS, isHintLevel } from "./hint";

describe("HINT_LEVELS", () => {
  it("escalates from 1 to 3", () => {
    expect(HINT_LEVELS).toEqual([1, 2, 3]);
  });
});

describe("isHintLevel", () => {
  it("accepts levels 1 through 3", () => {
    for (const level of HINT_LEVELS) {
      expect(isHintLevel(level)).toBe(true);
    }
  });

  it("rejects 0 and 4", () => {
    expect(isHintLevel(0)).toBe(false);
    expect(isHintLevel(4)).toBe(false);
  });

  it("rejects numeric strings", () => {
    expect(isHintLevel("2")).toBe(false);
  });
});
