import { describe, expect, it } from "vitest";
import type { ConfidenceLevel, ConfidenceRating } from "./confidence";
import { compareConfidenceByTopic } from "./confidence-progress";
import type { Topic } from "./topic";

let sequence = 0;

function rating(
  topic: Topic,
  level: ConfidenceLevel,
  ratedAt: string,
): ConfidenceRating {
  sequence += 1;
  return { id: `rating-${sequence}`, userId: "user-1", topic, level, ratedAt };
}

describe("compareConfidenceByTopic", () => {
  it("returns an empty list when there are no ratings", () => {
    expect(compareConfidenceByTopic([])).toEqual([]);
  });

  it("uses the single rating as both earliest and latest", () => {
    const ratings = [rating("trees", 3, "2026-01-05T10:00:00Z")];
    expect(compareConfidenceByTopic(ratings)).toEqual([
      { topic: "trees", earliest: 3, latest: 3 },
    ]);
  });

  it("picks earliest and latest by timestamp regardless of input order", () => {
    const ratings = [
      rating("graphs", 4, "2026-03-01T10:00:00Z"),
      rating("graphs", 1, "2026-01-01T10:00:00Z"),
      rating("graphs", 2, "2026-02-01T10:00:00Z"),
    ];
    expect(compareConfidenceByTopic(ratings)).toEqual([
      { topic: "graphs", earliest: 1, latest: 4 },
    ]);
  });

  it("orders topics by their curated order", () => {
    const ratings = [
      rating("graphs", 2, "2026-01-01T10:00:00Z"),
      rating("arrays", 5, "2026-01-02T10:00:00Z"),
      rating("trees", 3, "2026-01-03T10:00:00Z"),
    ];
    expect(compareConfidenceByTopic(ratings).map((entry) => entry.topic)).toEqual(
      ["arrays", "trees", "graphs"],
    );
  });
});
