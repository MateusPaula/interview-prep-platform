import { describe, expect, it } from "vitest";
import type { Attempt } from "./attempt";
import type { AttemptOutcome } from "./attempt";
import type { Topic } from "./topic";
import { rankWeakAreas, weaknessScore } from "./weakness";

function attempt(
  topic: Topic,
  outcome: AttemptOutcome,
  hintsUsed = 0,
): Pick<Attempt, "topic" | "outcome" | "hintsUsed"> {
  return { topic, outcome, hintsUsed };
}

describe("weaknessScore", () => {
  it("returns 0 when there are no attempts", () => {
    expect(weaknessScore([])).toBe(0);
  });

  it("returns 0 for clean solves", () => {
    expect(weaknessScore([attempt("arrays", "solved")])).toBe(0);
  });

  it("returns 100 for giving up", () => {
    expect(weaknessScore([attempt("arrays", "gave_up")])).toBe(100);
  });

  it("charges 20 points per hint used on a hinted solve", () => {
    expect(weaknessScore([attempt("arrays", "solved_with_hints", 1)])).toBe(20);
    expect(weaknessScore([attempt("arrays", "solved_with_hints", 2)])).toBe(40);
    expect(weaknessScore([attempt("arrays", "solved_with_hints", 3)])).toBe(60);
  });

  it("averages across attempts and rounds to the nearest integer", () => {
    const attempts = [
      attempt("arrays", "solved"),
      attempt("arrays", "gave_up"),
      attempt("arrays", "solved_with_hints", 1),
    ];
    expect(weaknessScore(attempts)).toBe(40);
  });
});

describe("rankWeakAreas", () => {
  it("returns an empty list when there are no attempts", () => {
    expect(rankWeakAreas([])).toEqual([]);
  });

  it("groups attempts by topic with score and count", () => {
    const attempts = [
      attempt("graphs", "gave_up"),
      attempt("graphs", "solved"),
      attempt("arrays", "solved"),
    ];
    expect(rankWeakAreas(attempts)).toEqual([
      { topic: "graphs", score: 50, attemptCount: 2 },
      { topic: "arrays", score: 0, attemptCount: 1 },
    ]);
  });

  it("sorts weakest topics first and breaks ties alphabetically", () => {
    const attempts = [
      attempt("trees", "solved_with_hints", 2),
      attempt("graphs", "solved_with_hints", 2),
      attempt("arrays", "gave_up"),
    ];
    expect(rankWeakAreas(attempts).map((area) => area.topic)).toEqual([
      "arrays",
      "graphs",
      "trees",
    ]);
  });
});
