import { describe, expect, it } from "vitest";
import {
  buildBehavioralFeedback,
  isStarScores,
  STAR_CRITERIA,
} from "./behavioral";

describe("STAR_CRITERIA", () => {
  it("covers situation, task, action and result", () => {
    expect(STAR_CRITERIA).toEqual(["situation", "task", "action", "result"]);
  });
});

describe("isStarScores", () => {
  it("accepts integer scores from 1 to 5 for every criterion", () => {
    expect(
      isStarScores({ situation: 1, task: 3, action: 5, result: 4 }),
    ).toBe(true);
  });

  it("rejects a missing criterion", () => {
    expect(isStarScores({ situation: 3, task: 3, action: 3 })).toBe(false);
  });

  it("rejects out-of-range scores", () => {
    expect(
      isStarScores({ situation: 0, task: 3, action: 3, result: 3 }),
    ).toBe(false);
    expect(
      isStarScores({ situation: 6, task: 3, action: 3, result: 3 }),
    ).toBe(false);
  });

  it("rejects fractional scores", () => {
    expect(
      isStarScores({ situation: 2.5, task: 3, action: 3, result: 3 }),
    ).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isStarScores(null)).toBe(false);
    expect(isStarScores("scores")).toBe(false);
  });
});

describe("buildBehavioralFeedback", () => {
  it("computes the overall score as the mean rounded to one decimal", () => {
    const feedback = buildBehavioralFeedback({
      scores: { situation: 2, task: 3, action: 4, result: 4 },
      strengths: ["Clear structure"],
      improvements: ["Quantify the result"],
    });
    expect(feedback.overallScore).toBe(3.3);
  });

  it("keeps scores, strengths and improvements", () => {
    const evaluation = {
      scores: { situation: 5, task: 5, action: 5, result: 5 },
      strengths: ["Strong ownership"],
      improvements: [],
    };
    const feedback = buildBehavioralFeedback(evaluation);
    expect(feedback).toEqual({ ...evaluation, overallScore: 5 });
  });
});
