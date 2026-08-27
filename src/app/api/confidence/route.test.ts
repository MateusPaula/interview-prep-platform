import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfidenceRating, NewConfidenceRating } from "@/core/domain";
import { getRequestContext } from "@/app/api/composition";
import { fakeContext } from "@/testing/fake-context";
import { GET, POST } from "./route";

vi.mock("@/app/api/composition", () => ({
  getRequestContext: vi.fn(),
}));

const mockedContext = vi.mocked(getRequestContext);

const existing: ConfidenceRating = {
  id: "rating-1",
  userId: "user-1",
  topic: "trees",
  level: 2,
  ratedAt: "2026-08-01T12:00:00.000Z",
};

function contextWithStore(store: NewConfidenceRating[]) {
  return fakeContext({
    confidence: {
      add: async (rating) => {
        store.push(rating);
        return {
          ...rating,
          id: "rating-2",
          ratedAt: "2026-08-27T12:00:00.000Z",
        };
      },
      listByUser: async (userId) =>
        userId === existing.userId ? [existing] : [],
    },
  });
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/confidence", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockedContext.mockReset();
});

describe("GET /api/confidence", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns the session user's ratings", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ratings: [existing] });
  });
});

describe("POST /api/confidence", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await POST(post({ topic: "trees", level: 4 }));
    expect(response.status).toBe(401);
  });

  it("appends a rating for the session user", async () => {
    const store: NewConfidenceRating[] = [];
    mockedContext.mockResolvedValue(contextWithStore(store));
    const response = await POST(
      post({ topic: "trees", level: 4, userId: "attacker" }),
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      rating: {
        id: "rating-2",
        userId: "user-1",
        topic: "trees",
        level: 4,
        ratedAt: "2026-08-27T12:00:00.000Z",
      },
    });
    expect(store).toEqual([{ userId: "user-1", topic: "trees", level: 4 }]);
  });

  it("rejects an unknown topic", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    const response = await POST(post({ topic: "quantum", level: 3 }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_request");
  });

  it("rejects an out-of-range level", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    for (const level of [0, 6, 3.5]) {
      const response = await POST(post({ topic: "trees", level }));
      expect(response.status).toBe(400);
    }
  });
});
