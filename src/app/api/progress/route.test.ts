import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Attempt, ConfidenceRating } from "@/core/domain";
import { getRequestContext } from "@/app/api/composition";
import { fakeContext } from "@/app/api/testing/fake-context";
import { GET } from "./route";

vi.mock("@/app/api/composition", () => ({
  getRequestContext: vi.fn(),
}));

const mockedContext = vi.mocked(getRequestContext);

const attempt: Attempt = {
  id: "attempt-1",
  userId: "user-1",
  challengeId: "ch-1",
  topic: "graphs",
  difficulty: "medium",
  outcome: "gave_up",
  hintsUsed: 3,
  timeSpentSeconds: 2100,
  attemptedAt: "2026-08-20T12:00:00.000Z",
};

const ratings: ConfidenceRating[] = [
  {
    id: "rating-1",
    userId: "user-1",
    topic: "graphs",
    level: 2,
    ratedAt: "2026-08-01T12:00:00.000Z",
  },
  {
    id: "rating-2",
    userId: "user-1",
    topic: "graphs",
    level: 4,
    ratedAt: "2026-08-20T12:00:00.000Z",
  },
];

beforeEach(() => {
  mockedContext.mockReset();
});

describe("GET /api/progress", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns weak areas and confidence comparisons", async () => {
    mockedContext.mockResolvedValue(
      fakeContext({
        attempts: {
          add: async () => {
            throw new Error("not used");
          },
          listByUser: async (userId) => (userId === "user-1" ? [attempt] : []),
        },
        confidence: {
          add: async () => {
            throw new Error("not used");
          },
          listByUser: async (userId) => (userId === "user-1" ? ratings : []),
        },
      }),
    );
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      weakAreas: [{ topic: "graphs", score: 100, attemptCount: 1 }],
      confidence: [{ topic: "graphs", earliest: 2, latest: 4 }],
    });
  });
});
