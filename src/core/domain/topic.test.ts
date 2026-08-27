import { describe, expect, it } from "vitest";
import { isTopic, TOPICS } from "./topic";

describe("TOPICS", () => {
  it("contains unique entries", () => {
    expect(new Set(TOPICS).size).toBe(TOPICS.length);
  });
});

describe("isTopic", () => {
  it("accepts every curated topic", () => {
    for (const topic of TOPICS) {
      expect(isTopic(topic)).toBe(true);
    }
  });

  it("rejects an unknown string", () => {
    expect(isTopic("quantum-computing")).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isTopic(42)).toBe(false);
    expect(isTopic(null)).toBe(false);
    expect(isTopic(undefined)).toBe(false);
  });
});
