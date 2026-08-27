import { describe, expect, it } from "vitest";
import type { Challenge } from "@/core/domain";
import { selectDailyChallenge } from "@/core/domain";
import type { ChallengeRepository } from "@/core/application/ports";
import { getDailyChallenge } from "./get-daily-challenge";

function challenge(id: string): Challenge {
  return {
    id,
    title: `Challenge ${id}`,
    prompt: "Solve it.",
    topic: "arrays",
    difficulty: "easy",
    starterCode: "function solve() {}",
  };
}

function repositoryWith(bank: Challenge[]): ChallengeRepository {
  return {
    async listAll() {
      return bank;
    },
    async findById(id) {
      return bank.find((entry) => entry.id === id) ?? null;
    },
  };
}

describe("getDailyChallenge", () => {
  it("returns the dayKey for the given instant", async () => {
    const repository = repositoryWith([challenge("a"), challenge("b")]);
    const result = await getDailyChallenge(
      repository,
      new Date("2026-08-27T15:30:00Z"),
    );
    expect(result.dayKey).toBe("2026-08-27");
  });

  it("picks the deterministic challenge for the day", async () => {
    const bank = [challenge("a"), challenge("b"), challenge("c")];
    const repository = repositoryWith(bank);
    const result = await getDailyChallenge(
      repository,
      new Date("2026-08-27T15:30:00Z"),
    );
    expect(result.challenge).toEqual(selectDailyChallenge(bank, "2026-08-27"));
  });
});
