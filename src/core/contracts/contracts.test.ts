import { describe, expect, it } from "vitest";
import type {
  ApiErrorResponse,
  BehavioralFeedbackRequest,
  BehavioralFeedbackResponse,
  BehavioralQuestionResponse,
  ConfidenceRatingsResponse,
  CreateAttemptRequest,
  CreateAttemptResponse,
  CreateConfidenceRatingRequest,
  CreateConfidenceRatingResponse,
  DailyChallengeResponse,
  HintRequest,
  HintResponse,
  ProgressSummaryResponse,
} from "./index";

function roundTrip<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("contracts", () => {
  it("serializes the daily challenge exchange", () => {
    const response: DailyChallengeResponse = {
      dayKey: "2026-08-27",
      challenge: {
        id: "ch-1",
        title: "Two Sum",
        prompt: "Find two numbers adding up to the target.",
        topic: "arrays",
        difficulty: "easy",
        starterCode: "function twoSum() {}",
      },
    };
    expect(roundTrip(response)).toEqual(response);
  });

  it("serializes the attempt exchange", () => {
    const request: CreateAttemptRequest = {
      challengeId: "ch-1",
      outcome: "solved_with_hints",
      hintsUsed: 2,
      timeSpentSeconds: 900,
    };
    const response: CreateAttemptResponse = {
      attempt: {
        id: "attempt-1",
        userId: "user-1",
        challengeId: "ch-1",
        topic: "arrays",
        difficulty: "easy",
        outcome: "solved_with_hints",
        hintsUsed: 2,
        timeSpentSeconds: 900,
        attemptedAt: "2026-08-27T12:00:00Z",
      },
    };
    expect(roundTrip(request)).toEqual(request);
    expect(roundTrip(response)).toEqual(response);
  });

  it("serializes the hint exchange", () => {
    const request: HintRequest = {
      challengeId: "ch-1",
      userCode: "function twoSum() { return []; }",
      level: 1,
    };
    const response: HintResponse = {
      level: 1,
      hint: "Think about what you could store while scanning once.",
    };
    expect(roundTrip(request)).toEqual(request);
    expect(roundTrip(response)).toEqual(response);
  });

  it("serializes the confidence exchange", () => {
    const request: CreateConfidenceRatingRequest = {
      topic: "graphs",
      level: 3,
    };
    const created: CreateConfidenceRatingResponse = {
      rating: {
        id: "rating-1",
        userId: "user-1",
        topic: "graphs",
        level: 3,
        ratedAt: "2026-08-27T12:00:00Z",
      },
    };
    const listed: ConfidenceRatingsResponse = {
      ratings: [created.rating],
    };
    expect(roundTrip(request)).toEqual(request);
    expect(roundTrip(created)).toEqual(created);
    expect(roundTrip(listed)).toEqual(listed);
  });

  it("serializes the progress summary", () => {
    const response: ProgressSummaryResponse = {
      weakAreas: [{ topic: "graphs", score: 70, attemptCount: 3 }],
      confidence: [{ topic: "graphs", earliest: 2, latest: 4 }],
    };
    expect(roundTrip(response)).toEqual(response);
  });

  it("serializes the behavioral exchange", () => {
    const questionResponse: BehavioralQuestionResponse = {
      question: {
        id: "bq-1",
        category: "conflict",
        question: "Tell me about a disagreement with a teammate.",
      },
    };
    const request: BehavioralFeedbackRequest = {
      questionId: "bq-1",
      answer: "I disagreed with a teammate about the rollout plan.",
    };
    const response: BehavioralFeedbackResponse = {
      feedback: {
        scores: { situation: 4, task: 3, action: 5, result: 4 },
        overallScore: 4,
        strengths: ["Concrete example"],
        improvements: ["Mention the measurable outcome"],
      },
    };
    expect(roundTrip(questionResponse)).toEqual(questionResponse);
    expect(roundTrip(request)).toEqual(request);
    expect(roundTrip(response)).toEqual(response);
  });

  it("serializes the error envelope", () => {
    const response: ApiErrorResponse = {
      error: { code: "invalid_request", message: "level must be 1, 2 or 3" },
    };
    expect(roundTrip(response)).toEqual(response);
  });
});
