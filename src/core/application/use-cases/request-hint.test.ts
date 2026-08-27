import { describe, expect, it } from "vitest";
import type { Challenge } from "@/core/domain";
import type {
  AiMentorGateway,
  ChallengeRepository,
  HintContext,
} from "@/core/application/ports";
import {
  AiUnavailableError,
  NotFoundError,
} from "@/core/application/errors";
import { requestHint } from "./request-hint";

const twoSum: Challenge = {
  id: "ch-1",
  title: "Two Sum",
  prompt: "Find two numbers adding up to the target.",
  topic: "arrays",
  difficulty: "easy",
  starterCode: "function twoSum() {}",
};

function challengeRepository(): ChallengeRepository {
  return {
    async listAll() {
      return [twoSum];
    },
    async findById(id) {
      return id === twoSum.id ? twoSum : null;
    },
  };
}

function mentorReturning(hint: string, seen: HintContext[]): AiMentorGateway {
  return {
    async generateHint(context) {
      seen.push(context);
      return hint;
    },
    async evaluateBehavioralAnswer() {
      throw new Error("not used");
    },
  };
}

const failingMentor: AiMentorGateway = {
  async generateHint() {
    throw new Error("network down");
  },
  async evaluateBehavioralAnswer() {
    throw new Error("not used");
  },
};

describe("requestHint", () => {
  it("returns the mentor hint for the resolved challenge", async () => {
    const seen: HintContext[] = [];
    const result = await requestHint(
      {
        challenges: challengeRepository(),
        aiMentor: mentorReturning("Think about lookups.", seen),
      },
      { challengeId: "ch-1", userCode: "function twoSum() { return []; }", level: 2 },
    );
    expect(result).toEqual({ level: 2, hint: "Think about lookups." });
    expect(seen).toEqual([
      {
        challenge: twoSum,
        userCode: "function twoSum() { return []; }",
        level: 2,
      },
    ]);
  });

  it("throws NotFoundError for an unknown challenge", async () => {
    await expect(
      requestHint(
        {
          challenges: challengeRepository(),
          aiMentor: mentorReturning("unused", []),
        },
        { challengeId: "missing", userCode: "", level: 1 },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("maps mentor failures to AiUnavailableError", async () => {
    await expect(
      requestHint(
        { challenges: challengeRepository(), aiMentor: failingMentor },
        { challengeId: "ch-1", userCode: "", level: 3 },
      ),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
