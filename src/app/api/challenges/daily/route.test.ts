import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Challenge } from "@/core/domain";
import { selectDailyChallenge } from "@/core/domain";
import { getRequestContext } from "@/app/api/composition";
import { fakeContext } from "@/testing/fake-context";
import { GET } from "./route";

vi.mock("@/app/api/composition", () => ({
  getRequestContext: vi.fn(),
}));

const mockedContext = vi.mocked(getRequestContext);

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

beforeEach(() => {
  mockedContext.mockReset();
  vi.useFakeTimers({
    now: new Date("2026-08-27T15:00:00Z"),
    toFake: ["Date"],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/challenges/daily", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "unauthorized", message: "Authentication required" },
    });
  });

  it("returns the deterministic challenge with the UTC dayKey", async () => {
    mockedContext.mockResolvedValue(
      fakeContext({
        challenges: {
          listAll: async () => bank,
          findById: async () => null,
        },
      }),
    );
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      dayKey: "2026-08-27",
      challenge: selectDailyChallenge(bank, "2026-08-27"),
    });
  });

  it("returns a contract-shaped 500 when the context factory fails", async () => {
    mockedContext.mockRejectedValue(
      new Error("Missing Supabase environment configuration"),
    );
    const response = await GET();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: { code: "internal_error", message: "Something went wrong" },
    });
  });

  it("returns 500 when the repository fails", async () => {
    mockedContext.mockResolvedValue(
      fakeContext({
        challenges: {
          listAll: async () => {
            throw new Error("connection refused");
          },
          findById: async () => null,
        },
      }),
    );
    const response = await GET();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("internal_error");
  });
});
