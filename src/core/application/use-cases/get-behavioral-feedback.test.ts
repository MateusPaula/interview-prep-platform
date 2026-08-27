import { describe, expect, it } from "vitest";
import type { BehavioralQuestion, StarEvaluation } from "@/core/domain";
import type {
  AiMentorGateway,
  BehavioralRepository,
} from "@/core/application/ports";
import {
  AiUnavailableError,
  NotFoundError,
} from "@/core/application/errors";
import { getBehavioralFeedback } from "./get-behavioral-feedback";

const question: BehavioralQuestion = {
  id: "bq-1",
  category: "conflict",
  question: "Tell me about a disagreement with a teammate.",
};

const repository: BehavioralRepository = {
  async listQuestions() {
    return [question];
  },
  async findQuestionById(id) {
    return id === question.id ? question : null;
  },
};

function mentorReturning(evaluation: StarEvaluation): AiMentorGateway {
  return {
    async generateHint() {
      throw new Error("not used");
    },
    async evaluateBehavioralAnswer() {
      return evaluation;
    },
  };
}

const failingMentor: AiMentorGateway = {
  async generateHint() {
    throw new Error("not used");
  },
  async evaluateBehavioralAnswer() {
    throw new Error("network down");
  },
};

describe("getBehavioralFeedback", () => {
  it("returns feedback with the overall score", async () => {
    const feedback = await getBehavioralFeedback(
      {
        behavioral: repository,
        aiMentor: mentorReturning({
          scores: { situation: 4, task: 3, action: 5, result: 4 },
          strengths: ["Concrete example"],
          improvements: ["Quantify the outcome"],
        }),
      },
      { questionId: "bq-1", answer: "I disagreed about the rollout plan." },
    );
    expect(feedback).toEqual({
      scores: { situation: 4, task: 3, action: 5, result: 4 },
      strengths: ["Concrete example"],
      improvements: ["Quantify the outcome"],
      overallScore: 4,
    });
  });

  it("throws NotFoundError for an unknown question", async () => {
    await expect(
      getBehavioralFeedback(
        {
          behavioral: repository,
          aiMentor: mentorReturning({
            scores: { situation: 3, task: 3, action: 3, result: 3 },
            strengths: [],
            improvements: [],
          }),
        },
        { questionId: "missing", answer: "An answer." },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("maps mentor failures to AiUnavailableError", async () => {
    await expect(
      getBehavioralFeedback(
        { behavioral: repository, aiMentor: failingMentor },
        { questionId: "bq-1", answer: "An answer." },
      ),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("maps invalid mentor scores to AiUnavailableError", async () => {
    const invalid = {
      scores: { situation: 0, task: 3, action: 3, result: 3 },
      strengths: [],
      improvements: [],
    } as StarEvaluation;
    await expect(
      getBehavioralFeedback(
        { behavioral: repository, aiMentor: mentorReturning(invalid) },
        { questionId: "bq-1", answer: "An answer." },
      ),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
