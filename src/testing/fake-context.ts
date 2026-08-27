import type { RequestContext } from "@/app/api/composition";

function unwired(name: string): never {
  throw new Error(`${name} is not wired in this test`);
}

export function fakeContext(
  overrides: Partial<RequestContext> = {},
): RequestContext {
  return {
    userId: "user-1",
    challenges: {
      listAll: async () => unwired("challenges.listAll"),
      findById: async () => unwired("challenges.findById"),
    },
    attempts: {
      add: async () => unwired("attempts.add"),
      listByUser: async () => unwired("attempts.listByUser"),
    },
    confidence: {
      add: async () => unwired("confidence.add"),
      listByUser: async () => unwired("confidence.listByUser"),
    },
    behavioral: {
      listQuestions: async () => unwired("behavioral.listQuestions"),
      findQuestionById: async () => unwired("behavioral.findQuestionById"),
    },
    aiMentor: {
      generateHint: async () => unwired("aiMentor.generateHint"),
      evaluateBehavioralAnswer: async () =>
        unwired("aiMentor.evaluateBehavioralAnswer"),
    },
    ...overrides,
  };
}
