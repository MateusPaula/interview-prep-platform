import { describe, expect, it } from "vitest";
import type { Attempt, Challenge, NewAttempt } from "@/core/domain";
import type {
  AttemptRepository,
  ChallengeRepository,
} from "@/core/application/ports";
import { NotFoundError } from "@/core/application/errors";
import { recordAttempt } from "./record-attempt";

const graphChallenge: Challenge = {
  id: "ch-2",
  title: "Course Schedule",
  prompt: "Detect a cycle in the prerequisite graph.",
  topic: "graphs",
  difficulty: "medium",
  starterCode: "function canFinish() {}",
};

function challengeRepository(): ChallengeRepository {
  return {
    async listAll() {
      return [graphChallenge];
    },
    async findById(id) {
      return id === graphChallenge.id ? graphChallenge : null;
    },
  };
}

function attemptRepository(store: Attempt[]): AttemptRepository {
  return {
    async add(attempt: NewAttempt) {
      const stored: Attempt = {
        ...attempt,
        id: `attempt-${store.length + 1}`,
        attemptedAt: "2026-08-27T12:00:00Z",
      };
      store.push(stored);
      return stored;
    },
    async listByUser(userId) {
      return store.filter((attempt) => attempt.userId === userId);
    },
  };
}

describe("recordAttempt", () => {
  it("persists the attempt with topic and difficulty taken from the challenge", async () => {
    const store: Attempt[] = [];
    const attempt = await recordAttempt(
      { challenges: challengeRepository(), attempts: attemptRepository(store) },
      {
        userId: "user-1",
        challengeId: "ch-2",
        outcome: "solved_with_hints",
        hintsUsed: 2,
        timeSpentSeconds: 900,
      },
    );
    expect(attempt).toEqual({
      id: "attempt-1",
      userId: "user-1",
      challengeId: "ch-2",
      topic: "graphs",
      difficulty: "medium",
      outcome: "solved_with_hints",
      hintsUsed: 2,
      timeSpentSeconds: 900,
      attemptedAt: "2026-08-27T12:00:00Z",
    });
    expect(store).toHaveLength(1);
  });

  it("throws NotFoundError for an unknown challenge", async () => {
    const store: Attempt[] = [];
    await expect(
      recordAttempt(
        {
          challenges: challengeRepository(),
          attempts: attemptRepository(store),
        },
        {
          userId: "user-1",
          challengeId: "missing",
          outcome: "solved",
          hintsUsed: 0,
          timeSpentSeconds: 60,
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(store).toHaveLength(0);
  });
});
