import { describe, expect, it } from "vitest";
import { DIFFICULTIES, isDifficulty } from "./difficulty";

describe("DIFFICULTIES", () => {
  it("lists easy, medium and hard in escalating order", () => {
    expect(DIFFICULTIES).toEqual(["easy", "medium", "hard"]);
  });
});

describe("isDifficulty", () => {
  it("accepts every difficulty", () => {
    for (const difficulty of DIFFICULTIES) {
      expect(isDifficulty(difficulty)).toBe(true);
    }
  });

  it("rejects an unknown value", () => {
    expect(isDifficulty("extreme")).toBe(false);
  });
});
