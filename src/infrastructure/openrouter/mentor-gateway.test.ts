import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BehavioralQuestion, Challenge } from "@/core/domain";
import { createOpenRouterMentorGateway } from "./mentor-gateway";

const challenge: Challenge = {
  id: "ch-1",
  title: "Two Sum",
  prompt: "Given an array of integers, return indices of two numbers adding up to a target.",
  topic: "arrays",
  difficulty: "easy",
  starterCode: "function twoSum(nums: number[], target: number): [number, number] {}",
};

const question: BehavioralQuestion = {
  id: "bq-1",
  category: "conflict",
  question: "Tell me about a disagreement with a teammate.",
};

interface CapturedRequest {
  url: string;
  authorization: string | null;
  body: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    response_format?: { type: string };
  };
}

function completionPayload(content: string): string {
  return JSON.stringify({
    id: "chatcmpl-1",
    object: "chat.completion",
    created: 1756300000,
    model: "openai/gpt-4o",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
        logprobs: null,
      },
    ],
  });
}

function transportReturning(
  content: string,
  captured: CapturedRequest[],
): (input: string | URL | Request, init?: RequestInit) => Promise<Response> {
  return async (input, init) => {
    const request = new Request(input, init);
    captured.push({
      url: request.url,
      authorization: request.headers.get("authorization"),
      body: JSON.parse(await request.text()) as CapturedRequest["body"],
    });
    return new Response(completionPayload(content), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}

function failingTransport(): (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response> {
  return async () =>
    new Response(JSON.stringify({ error: { message: "invalid api key" } }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
}

beforeEach(() => {
  vi.stubGlobal("window", undefined);
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  vi.stubEnv("OPENROUTER_MODEL", undefined);
  vi.stubEnv("OPENAI_API_KEY", undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("createOpenRouterMentorGateway generateHint", () => {
  it("calls OpenRouter with the challenge, the user code and the level guidance", async () => {
    const captured: CapturedRequest[] = [];
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning("Try thinking about it differently.", captured),
    });
    const hint = await gateway.generateHint({
      challenge,
      userCode: "function twoSum() { return [0, 0]; }",
      level: 1,
    });
    expect(hint).toBe("Try thinking about it differently.");
    expect(captured).toHaveLength(1);
    expect(captured[0].url).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    );
    expect(captured[0].authorization).toBe("Bearer test-key");
    expect(captured[0].body.model).toBe("openai/gpt-4o");
    const allText = captured[0].body.messages
      .map((message) => message.content)
      .join("\n");
    expect(allText).toContain("Two Sum");
    expect(allText).toContain(challenge.prompt);
    expect(allText).toContain("function twoSum() { return [0, 0]; }");
  });

  it("escalates the prompt per hint level", async () => {
    const texts: string[] = [];
    for (const level of [1, 2, 3] as const) {
      const captured: CapturedRequest[] = [];
      const gateway = createOpenRouterMentorGateway({
        fetch: transportReturning("A hint.", captured),
      });
      await gateway.generateHint({ challenge, userCode: "", level });
      texts.push(
        captured[0].body.messages
          .map((message) => message.content)
          .join("\n"),
      );
    }
    expect(texts[0]).toContain("very subtle hint about the approach");
    expect(texts[1]).toContain("more specific hint about the algorithm");
    expect(texts[2]).toContain("key insight");
    expect(new Set(texts).size).toBe(3);
  });

  it("forbids full solutions in every hint request", async () => {
    const captured: CapturedRequest[] = [];
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning("A hint.", captured),
    });
    await gateway.generateHint({ challenge, userCode: "", level: 3 });
    const allText = captured[0].body.messages
      .map((message) => message.content)
      .join("\n")
      .toLowerCase();
    expect(allText).toContain("never");
    expect(allText).toContain("full solution");
  });

  it("uses OPENROUTER_MODEL when set", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "test-vendor/test-model");
    const captured: CapturedRequest[] = [];
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning("A hint.", captured),
    });
    await gateway.generateHint({ challenge, userCode: "", level: 1 });
    expect(captured[0].body.model).toBe("test-vendor/test-model");
  });

  it("rejects when OPENROUTER_API_KEY is missing", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", undefined);
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning("A hint.", []),
    });
    await expect(
      gateway.generateHint({ challenge, userCode: "", level: 1 }),
    ).rejects.toThrow("OPENROUTER_API_KEY");
  });

  it("rejects when the model returns no content", async () => {
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning("", []),
    });
    await expect(
      gateway.generateHint({ challenge, userCode: "", level: 2 }),
    ).rejects.toThrow();
  });

  it("rejects when the API call fails", async () => {
    const gateway = createOpenRouterMentorGateway({
      fetch: failingTransport(),
    });
    await expect(
      gateway.generateHint({ challenge, userCode: "", level: 1 }),
    ).rejects.toThrow();
  });
});

describe("createOpenRouterMentorGateway evaluateBehavioralAnswer", () => {
  const validEvaluation = JSON.stringify({
    scores: { situation: 4, task: 3, action: 5, result: 4 },
    strengths: ["Concrete example"],
    improvements: ["Quantify the outcome"],
  });

  it("requests JSON output and parses the evaluation", async () => {
    const captured: CapturedRequest[] = [];
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning(validEvaluation, captured),
    });
    const evaluation = await gateway.evaluateBehavioralAnswer(
      question,
      "I disagreed about the rollout plan.",
    );
    expect(evaluation).toEqual({
      scores: { situation: 4, task: 3, action: 5, result: 4 },
      strengths: ["Concrete example"],
      improvements: ["Quantify the outcome"],
    });
    expect(captured[0].url).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    );
    expect(captured[0].body.response_format).toEqual({ type: "json_object" });
    const allText = captured[0].body.messages
      .map((message) => message.content)
      .join("\n");
    expect(allText).toContain(question.question);
    expect(allText).toContain("I disagreed about the rollout plan.");
  });

  it("rejects malformed JSON output", async () => {
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning("not json at all", []),
    });
    await expect(
      gateway.evaluateBehavioralAnswer(question, "An answer."),
    ).rejects.toThrow();
  });

  it("rejects JSON with invalid STAR scores", async () => {
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning(
        JSON.stringify({
          scores: { situation: 9, task: 3, action: 3, result: 3 },
          strengths: [],
          improvements: [],
        }),
        [],
      ),
    });
    await expect(
      gateway.evaluateBehavioralAnswer(question, "An answer."),
    ).rejects.toThrow();
  });

  it("rejects JSON missing the feedback lists", async () => {
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning(
        JSON.stringify({
          scores: { situation: 3, task: 3, action: 3, result: 3 },
        }),
        [],
      ),
    });
    await expect(
      gateway.evaluateBehavioralAnswer(question, "An answer."),
    ).rejects.toThrow();
  });

  it("rejects non-string strengths entries", async () => {
    const gateway = createOpenRouterMentorGateway({
      fetch: transportReturning(
        JSON.stringify({
          scores: { situation: 3, task: 3, action: 3, result: 3 },
          strengths: [42],
          improvements: [],
        }),
        [],
      ),
    });
    await expect(
      gateway.evaluateBehavioralAnswer(question, "An answer."),
    ).rejects.toThrow();
  });
});
