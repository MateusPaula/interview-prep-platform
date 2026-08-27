import { describe, expect, it } from "vitest";
import {
  buildBehavioralFeedback,
  compareConfidenceByTopic,
  rankWeakAreas,
  selectDailyChallenge,
} from "@/core/domain";
import type {
  Attempt,
  BehavioralQuestion,
  Challenge,
  ConfidenceRating,
  NewAttempt,
  NewConfidenceRating,
  StarEvaluation,
} from "@/core/domain";
import type {
  AiMentorGateway,
  AttemptRepository,
  BehavioralRepository,
  ChallengeRepository,
  ConfidenceRepository,
  HintContext,
} from "./index";

const challenges: Challenge[] = [
  {
    id: "ch-1",
    title: "Two Sum",
    prompt: "Find two numbers adding up to the target.",
    topic: "arrays",
    difficulty: "easy",
    starterCode: "function twoSum() {}",
  },
  {
    id: "ch-2",
    title: "Course Schedule",
    prompt: "Detect a cycle in the prerequisite graph.",
    topic: "graphs",
    difficulty: "medium",
    starterCode: "function canFinish() {}",
  },
];

const question: BehavioralQuestion = {
  id: "bq-1",
  category: "conflict",
  question: "Tell me about a disagreement with a teammate.",
};

class InMemoryChallengeRepository implements ChallengeRepository {
  async listAll(): Promise<Challenge[]> {
    return challenges;
  }

  async findById(id: string): Promise<Challenge | null> {
    return challenges.find((challenge) => challenge.id === id) ?? null;
  }
}

class InMemoryAttemptRepository implements AttemptRepository {
  private readonly attempts: Attempt[] = [];

  async add(attempt: NewAttempt): Promise<Attempt> {
    const stored: Attempt = {
      ...attempt,
      id: `attempt-${this.attempts.length + 1}`,
      attemptedAt: "2026-08-27T12:00:00Z",
    };
    this.attempts.push(stored);
    return stored;
  }

  async listByUser(userId: string): Promise<Attempt[]> {
    return this.attempts.filter((attempt) => attempt.userId === userId);
  }
}

class InMemoryConfidenceRepository implements ConfidenceRepository {
  private readonly ratings: ConfidenceRating[] = [];

  async add(rating: NewConfidenceRating): Promise<ConfidenceRating> {
    const stored: ConfidenceRating = {
      ...rating,
      id: `rating-${this.ratings.length + 1}`,
      ratedAt: `2026-08-0${this.ratings.length + 1}T12:00:00Z`,
    };
    this.ratings.push(stored);
    return stored;
  }

  async listByUser(userId: string): Promise<ConfidenceRating[]> {
    return this.ratings.filter((rating) => rating.userId === userId);
  }
}

class InMemoryBehavioralRepository implements BehavioralRepository {
  async listQuestions(): Promise<BehavioralQuestion[]> {
    return [question];
  }

  async findQuestionById(id: string): Promise<BehavioralQuestion | null> {
    return id === question.id ? question : null;
  }
}

const cannedAiMentorGateway: AiMentorGateway = {
  async generateHint(context: HintContext): Promise<string> {
    return `Level ${context.level} hint for ${context.challenge.title}`;
  },

  async evaluateBehavioralAnswer(): Promise<StarEvaluation> {
    return {
      scores: { situation: 4, task: 3, action: 5, result: 4 },
      strengths: ["Concrete example"],
      improvements: ["Mention the measurable outcome"],
    };
  },
};

describe("ports", () => {
  it("supports the daily challenge flow", async () => {
    const repository = new InMemoryChallengeRepository();
    const bank = await repository.listAll();
    const daily = selectDailyChallenge(bank, "2026-08-27");
    expect(bank).toContainEqual(daily);
    expect(await repository.findById(daily.id)).toEqual(daily);
    expect(await repository.findById("missing")).toBeNull();
  });

  it("supports recording attempts and ranking weak areas", async () => {
    const repository = new InMemoryAttemptRepository();
    await repository.add({
      userId: "user-1",
      challengeId: "ch-2",
      topic: "graphs",
      difficulty: "medium",
      outcome: "gave_up",
      hintsUsed: 3,
      timeSpentSeconds: 2100,
    });
    const attempts = await repository.listByUser("user-1");
    expect(rankWeakAreas(attempts)).toEqual([
      { topic: "graphs", score: 100, attemptCount: 1 },
    ]);
    expect(await repository.listByUser("user-2")).toEqual([]);
  });

  it("supports recording confidence and comparing progress", async () => {
    const repository = new InMemoryConfidenceRepository();
    await repository.add({ userId: "user-1", topic: "trees", level: 2 });
    await repository.add({ userId: "user-1", topic: "trees", level: 4 });
    const ratings = await repository.listByUser("user-1");
    expect(compareConfidenceByTopic(ratings)).toEqual([
      { topic: "trees", earliest: 2, latest: 4 },
    ]);
  });

  it("supports serving behavioral questions", async () => {
    const repository = new InMemoryBehavioralRepository();
    expect(await repository.listQuestions()).toEqual([question]);
    expect(await repository.findQuestionById("bq-1")).toEqual(question);
    expect(await repository.findQuestionById("missing")).toBeNull();
  });

  it("supports generating hints and STAR feedback", async () => {
    const gateway = cannedAiMentorGateway;
    const hint = await gateway.generateHint({
      challenge: challenges[0],
      userCode: "function twoSum() { return []; }",
      level: 2,
    });
    expect(hint).toBe("Level 2 hint for Two Sum");

    const evaluation = await gateway.evaluateBehavioralAnswer(
      question,
      "I disagreed with a teammate about the rollout plan.",
    );
    expect(buildBehavioralFeedback(evaluation).overallScore).toBe(4);
  });
});
