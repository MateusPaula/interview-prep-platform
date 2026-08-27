import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BehavioralQuestion, StarEvaluation } from "@/core/domain";
import { getRequestContext } from "@/app/api/composition";
import { fakeContext } from "@/app/api/testing/fake-context";
import { POST } from "./route";

vi.mock("@/app/api/composition", () => ({
  getRequestContext: vi.fn(),
}));

const mockedContext = vi.mocked(getRequestContext);

const question: BehavioralQuestion = {
  id: "bq-1",
  category: "conflict",
  question: "Tell me about a disagreement with a teammate.",
};

const evaluation: StarEvaluation = {
  scores: { situation: 4, task: 3, action: 5, result: 4 },
  strengths: ["Concrete example"],
  improvements: ["Quantify the outcome"],
};

function contextWithMentor(result: StarEvaluation | Error) {
  return fakeContext({
    behavioral: {
      listQuestions: async () => [question],
      findQuestionById: async (id) => (id === question.id ? question : null),
    },
    aiMentor: {
      generateHint: async () => {
        throw new Error("not used");
      },
      evaluateBehavioralAnswer: async () => {
        if (result instanceof Error) {
          throw result;
        }
        return result;
      },
    },
  });
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/behavioral/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockedContext.mockReset();
});

describe("POST /api/behavioral/feedback", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await POST(post({}));
    expect(response.status).toBe(401);
  });

  it("returns STAR feedback with the overall score", async () => {
    mockedContext.mockResolvedValue(contextWithMentor(evaluation));
    const response = await POST(
      post({ questionId: "bq-1", answer: "I disagreed about the rollout." }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      feedback: {
        scores: { situation: 4, task: 3, action: 5, result: 4 },
        strengths: ["Concrete example"],
        improvements: ["Quantify the outcome"],
        overallScore: 4,
      },
    });
  });

  it("rejects an empty answer", async () => {
    mockedContext.mockResolvedValue(contextWithMentor(evaluation));
    for (const answer of ["", "   ", undefined]) {
      const response = await POST(post({ questionId: "bq-1", answer }));
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("invalid_request");
    }
  });

  it("rejects a missing questionId", async () => {
    mockedContext.mockResolvedValue(contextWithMentor(evaluation));
    const response = await POST(post({ answer: "An answer." }));
    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown question", async () => {
    mockedContext.mockResolvedValue(contextWithMentor(evaluation));
    const response = await POST(
      post({ questionId: "missing", answer: "An answer." }),
    );
    expect(response.status).toBe(404);
  });

  it("returns 502 when the mentor fails", async () => {
    mockedContext.mockResolvedValue(contextWithMentor(new Error("down")));
    const response = await POST(
      post({ questionId: "bq-1", answer: "An answer." }),
    );
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error.code).toBe("ai_unavailable");
  });
});
