import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Attempt, Challenge, NewAttempt } from "@/core/domain";
import { getRequestContext } from "@/app/api/composition";
import { fakeContext } from "@/app/api/testing/fake-context";
import { POST } from "./route";

vi.mock("@/app/api/composition", () => ({
  getRequestContext: vi.fn(),
}));

const mockedContext = vi.mocked(getRequestContext);

const graphChallenge: Challenge = {
  id: "ch-2",
  title: "Course Schedule",
  prompt: "Detect a cycle in the prerequisite graph.",
  topic: "graphs",
  difficulty: "medium",
  starterCode: "function canFinish() {}",
};

function contextWithStore(store: NewAttempt[]) {
  return fakeContext({
    challenges: {
      listAll: async () => [graphChallenge],
      findById: async (id) => (id === graphChallenge.id ? graphChallenge : null),
    },
    attempts: {
      add: async (attempt) => {
        store.push(attempt);
        const stored: Attempt = {
          ...attempt,
          id: "attempt-1",
          attemptedAt: "2026-08-27T12:00:00.000Z",
        };
        return stored;
      },
      listByUser: async () => [],
    },
  });
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/attempts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  mockedContext.mockReset();
});

describe("POST /api/attempts", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await POST(post({}));
    expect(response.status).toBe(401);
  });

  it("creates an attempt with server-derived user, topic and difficulty", async () => {
    const store: NewAttempt[] = [];
    mockedContext.mockResolvedValue(contextWithStore(store));
    const response = await POST(
      post({
        challengeId: "ch-2",
        outcome: "solved_with_hints",
        hintsUsed: 2,
        timeSpentSeconds: 900,
        userId: "attacker",
        topic: "arrays",
        difficulty: "easy",
      }),
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      attempt: {
        id: "attempt-1",
        userId: "user-1",
        challengeId: "ch-2",
        topic: "graphs",
        difficulty: "medium",
        outcome: "solved_with_hints",
        hintsUsed: 2,
        timeSpentSeconds: 900,
        attemptedAt: "2026-08-27T12:00:00.000Z",
      },
    });
    expect(store[0].userId).toBe("user-1");
    expect(store[0].topic).toBe("graphs");
    expect(store[0].difficulty).toBe("medium");
  });

  it("rejects an unknown outcome", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    const response = await POST(
      post({
        challengeId: "ch-2",
        outcome: "failed",
        hintsUsed: 0,
        timeSpentSeconds: 60,
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_request");
  });

  it("rejects hintsUsed outside 0 to 3", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    for (const hintsUsed of [-1, 4, 1.5]) {
      const response = await POST(
        post({
          challengeId: "ch-2",
          outcome: "solved",
          hintsUsed,
          timeSpentSeconds: 60,
        }),
      );
      expect(response.status).toBe(400);
    }
  });

  it("rejects a negative or fractional timeSpentSeconds", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    for (const timeSpentSeconds of [-1, 2.5]) {
      const response = await POST(
        post({
          challengeId: "ch-2",
          outcome: "solved",
          hintsUsed: 0,
          timeSpentSeconds,
        }),
      );
      expect(response.status).toBe(400);
    }
  });

  it("rejects a missing challengeId", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    const response = await POST(
      post({ outcome: "solved", hintsUsed: 0, timeSpentSeconds: 60 }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects a malformed JSON body", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    const response = await POST(post("{not json"));
    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown challenge", async () => {
    mockedContext.mockResolvedValue(contextWithStore([]));
    const response = await POST(
      post({
        challengeId: "missing",
        outcome: "solved",
        hintsUsed: 0,
        timeSpentSeconds: 60,
      }),
    );
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("not_found");
  });
});
