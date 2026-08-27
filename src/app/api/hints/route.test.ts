import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Challenge } from "@/core/domain";
import type { HintContext } from "@/core/application/ports";
import { getRequestContext } from "@/app/api/composition";
import { fakeContext } from "@/app/api/testing/fake-context";
import { POST } from "./route";

vi.mock("@/app/api/composition", () => ({
  getRequestContext: vi.fn(),
}));

const mockedContext = vi.mocked(getRequestContext);

const twoSum: Challenge = {
  id: "ch-1",
  title: "Two Sum",
  prompt: "Find two numbers adding up to the target.",
  topic: "arrays",
  difficulty: "easy",
  starterCode: "function twoSum() {}",
};

function contextWithMentor(
  seen: HintContext[],
  hint: string | Error = "Consider what you could remember while scanning.",
) {
  return fakeContext({
    challenges: {
      listAll: async () => [twoSum],
      findById: async (id) => (id === twoSum.id ? twoSum : null),
    },
    aiMentor: {
      generateHint: async (context) => {
        seen.push(context);
        if (hint instanceof Error) {
          throw hint;
        }
        return hint;
      },
      evaluateBehavioralAnswer: async () => {
        throw new Error("not used");
      },
    },
  });
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/hints", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockedContext.mockReset();
});

describe("POST /api/hints", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await POST(post({}));
    expect(response.status).toBe(401);
  });

  it("returns the mentor hint for the requested level", async () => {
    const seen: HintContext[] = [];
    mockedContext.mockResolvedValue(contextWithMentor(seen));
    const response = await POST(
      post({
        challengeId: "ch-1",
        userCode: "function twoSum() { return []; }",
        level: 2,
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      level: 2,
      hint: "Consider what you could remember while scanning.",
    });
    expect(seen).toEqual([
      {
        challenge: twoSum,
        userCode: "function twoSum() { return []; }",
        level: 2,
      },
    ]);
  });

  it("rejects an invalid level", async () => {
    mockedContext.mockResolvedValue(contextWithMentor([]));
    const response = await POST(
      post({ challengeId: "ch-1", userCode: "", level: 4 }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_request");
  });

  it("rejects a non-string userCode", async () => {
    mockedContext.mockResolvedValue(contextWithMentor([]));
    const response = await POST(
      post({ challengeId: "ch-1", userCode: 42, level: 1 }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown challenge", async () => {
    mockedContext.mockResolvedValue(contextWithMentor([]));
    const response = await POST(
      post({ challengeId: "missing", userCode: "", level: 1 }),
    );
    expect(response.status).toBe(404);
  });

  it("returns 502 when the mentor fails", async () => {
    mockedContext.mockResolvedValue(
      contextWithMentor([], new Error("network down")),
    );
    const response = await POST(
      post({ challengeId: "ch-1", userCode: "", level: 3 }),
    );
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error.code).toBe("ai_unavailable");
  });
});
