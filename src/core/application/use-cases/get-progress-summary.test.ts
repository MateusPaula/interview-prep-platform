import { describe, expect, it } from "vitest";
import type { Attempt, ConfidenceRating } from "@/core/domain";
import type {
  AttemptRepository,
  ConfidenceRepository,
} from "@/core/application/ports";
import { getProgressSummary } from "./get-progress-summary";

const attempts: Attempt[] = [
  {
    id: "attempt-1",
    userId: "user-1",
    challengeId: "ch-1",
    topic: "graphs",
    difficulty: "medium",
    outcome: "gave_up",
    hintsUsed: 3,
    timeSpentSeconds: 2100,
    attemptedAt: "2026-08-20T12:00:00Z",
  },
  {
    id: "attempt-2",
    userId: "user-1",
    challengeId: "ch-2",
    topic: "arrays",
    difficulty: "easy",
    outcome: "solved",
    hintsUsed: 0,
    timeSpentSeconds: 600,
    attemptedAt: "2026-08-21T12:00:00Z",
  },
];

const ratings: ConfidenceRating[] = [
  {
    id: "rating-1",
    userId: "user-1",
    topic: "graphs",
    level: 2,
    ratedAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "rating-2",
    userId: "user-1",
    topic: "graphs",
    level: 4,
    ratedAt: "2026-08-20T12:00:00Z",
  },
];

const attemptRepository: AttemptRepository = {
  async add() {
    throw new Error("not used");
  },
  async listByUser(userId) {
    return attempts.filter((attempt) => attempt.userId === userId);
  },
};

const confidenceRepository: ConfidenceRepository = {
  async add() {
    throw new Error("not used");
  },
  async listByUser(userId) {
    return ratings.filter((rating) => rating.userId === userId);
  },
};

describe("getProgressSummary", () => {
  it("ranks weak areas and compares confidence for the user", async () => {
    const summary = await getProgressSummary(
      { attempts: attemptRepository, confidence: confidenceRepository },
      "user-1",
    );
    expect(summary).toEqual({
      weakAreas: [
        { topic: "graphs", score: 100, attemptCount: 1 },
        { topic: "arrays", score: 0, attemptCount: 1 },
      ],
      confidence: [{ topic: "graphs", earliest: 2, latest: 4 }],
    });
  });

  it("returns empty summaries for a user without history", async () => {
    const summary = await getProgressSummary(
      { attempts: attemptRepository, confidence: confidenceRepository },
      "user-2",
    );
    expect(summary).toEqual({ weakAreas: [], confidence: [] });
  });
});
