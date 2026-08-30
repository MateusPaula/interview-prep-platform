import { describe, expect, it } from "vitest";
import type { BehavioralQuestion } from "@/core/domain";
import type { BehavioralRepository } from "@/core/application/ports";
import { NotFoundError } from "@/core/application/errors";
import { getRandomBehavioralQuestion } from "./get-random-behavioral-question";

const questions: BehavioralQuestion[] = [
  {
    id: "bq-1",
    category: "conflict",
    question: "Tell me about a disagreement with a teammate.",
  },
  {
    id: "bq-2",
    category: "leadership",
    question: "Tell me about a time you led without authority.",
  },
  {
    id: "bq-3",
    category: "failure",
    question: "Tell me about a project that failed.",
  },
];

function repositoryWith(bank: BehavioralQuestion[]): BehavioralRepository {
  return {
    async listQuestions() {
      return bank;
    },
    async findQuestionById(id) {
      return bank.find((question) => question.id === id) ?? null;
    },
  };
}

describe("getRandomBehavioralQuestion", () => {
  it("picks the question addressed by the random draw", async () => {
    const first = await getRandomBehavioralQuestion(
      repositoryWith(questions),
      () => 0,
    );
    expect(first).toEqual(questions[0]);
    const last = await getRandomBehavioralQuestion(
      repositoryWith(questions),
      () => 0.99,
    );
    expect(last).toEqual(questions[2]);
  });

  it("throws NotFoundError when the bank is empty", async () => {
    await expect(
      getRandomBehavioralQuestion(repositoryWith([]), () => 0),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
