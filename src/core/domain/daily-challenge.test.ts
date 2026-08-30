import { describe, expect, it } from "vitest";
import type { Challenge } from "./challenge";
import { selectDailyChallenge, toDayKey } from "./daily-challenge";

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

const bank = [challenge("a"), challenge("b"), challenge("c")];

describe("toDayKey", () => {
  it("formats a date as UTC YYYY-MM-DD", () => {
    expect(toDayKey(new Date("2026-08-27T15:30:00Z"))).toBe("2026-08-27");
  });

  it("keeps the UTC day at the end of the day", () => {
    expect(toDayKey(new Date("2026-12-31T23:59:59.999Z"))).toBe("2026-12-31");
  });
});

describe("selectDailyChallenge", () => {
  it("returns a challenge from the bank", () => {
    const selected = selectDailyChallenge(bank, "2026-08-27");
    expect(bank).toContainEqual(selected);
  });

  it("returns the same challenge for the same day", () => {
    const first = selectDailyChallenge(bank, "2026-08-27");
    const second = selectDailyChallenge(bank, "2026-08-27");
    expect(second).toEqual(first);
  });

  it("ignores the order of the bank", () => {
    const selected = selectDailyChallenge(bank, "2026-08-27");
    const reversed = selectDailyChallenge([...bank].reverse(), "2026-08-27");
    expect(reversed).toEqual(selected);
  });

  it("varies the challenge across days", () => {
    const seen = new Set<string>();
    for (let day = 1; day <= 28; day += 1) {
      const key = `2026-02-${String(day).padStart(2, "0")}`;
      seen.add(selectDailyChallenge(bank, key).id);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("throws when the bank is empty", () => {
    expect(() => selectDailyChallenge([], "2026-08-27")).toThrow(
      "Challenge bank is empty",
    );
  });
});
