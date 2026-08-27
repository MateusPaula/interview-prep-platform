import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BehavioralQuestion } from "@/core/domain";
import { getRequestContext } from "@/app/api/composition";
import { fakeContext } from "@/app/api/testing/fake-context";
import { GET } from "./route";

vi.mock("@/app/api/composition", () => ({
  getRequestContext: vi.fn(),
}));

const mockedContext = vi.mocked(getRequestContext);

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
];

function contextWithBank(bank: BehavioralQuestion[]) {
  return fakeContext({
    behavioral: {
      listQuestions: async () => bank,
      findQuestionById: async (id) =>
        bank.find((question) => question.id === id) ?? null,
    },
  });
}

beforeEach(() => {
  mockedContext.mockReset();
});

describe("GET /api/behavioral/question", () => {
  it("returns 401 without a session", async () => {
    mockedContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns a question from the bank", async () => {
    mockedContext.mockResolvedValue(contextWithBank(questions));
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(questions).toContainEqual(body.question);
  });

  it("returns 404 when the bank is empty", async () => {
    mockedContext.mockResolvedValue(contextWithBank([]));
    const response = await GET();
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("not_found");
  });
});
