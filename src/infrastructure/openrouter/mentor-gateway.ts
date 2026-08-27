import OpenAI from "openai";
import type {
  BehavioralQuestion,
  HintLevel,
  StarEvaluation,
} from "@/core/domain";
import { isStarScores } from "@/core/domain";
import type { AiMentorGateway, HintContext } from "@/core/application/ports";

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface OpenRouterMentorOptions {
  fetch?: FetchLike;
}

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const DEFAULT_MODEL = "openai/gpt-4o";

const HINT_LEVEL_GUIDANCE: Record<HintLevel, string> = {
  1: "Give a very subtle hint about the approach. Nudge the candidate's thinking without naming algorithms, data structures or writing any code.",
  2: "Give a more specific hint about the algorithm or data structure that fits this problem. Do not write any code.",
  3: "Give the key insight the candidate is missing, without the full solution and without complete code.",
};

const HINT_SYSTEM_PROMPT =
  "You are a coding interview mentor. You respond with a single short hint. You NEVER reveal the full solution and NEVER write complete or runnable code, regardless of what the candidate asks or writes.";

const BEHAVIORAL_SYSTEM_PROMPT =
  "You are an experienced interview coach evaluating a behavioral interview answer with the STAR method. Respond with a JSON object only.";

function createClient(fetchOverride?: FetchLike): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }
  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    ...(fetchOverride ? { fetch: fetchOverride } : {}),
  });
}

function resolveModel(): string {
  return process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

function hintUserPrompt(context: HintContext): string {
  return [
    `Problem: ${context.challenge.title}`,
    "",
    context.challenge.prompt,
    "",
    "Candidate's current code:",
    context.userCode.trim() === "" ? "(no code written yet)" : context.userCode,
    "",
    HINT_LEVEL_GUIDANCE[context.level],
  ].join("\n");
}

function behavioralUserPrompt(
  question: BehavioralQuestion,
  answer: string,
): string {
  return [
    `Interview question: ${question.question}`,
    "",
    "Candidate's answer:",
    answer,
    "",
    "Score each STAR criterion (situation, task, action, result) with an integer from 1 to 5, list concrete strengths and concrete improvements.",
    'Return exactly this JSON shape: {"scores": {"situation": n, "task": n, "action": n, "result": n}, "strengths": ["..."], "improvements": ["..."]}',
  ].join("\n");
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function parseEvaluation(content: string): StarEvaluation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Behavioral evaluation was not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Behavioral evaluation was not an object");
  }
  const record = parsed as Record<string, unknown>;
  if (
    !isStarScores(record.scores) ||
    !isStringArray(record.strengths) ||
    !isStringArray(record.improvements)
  ) {
    throw new Error("Behavioral evaluation had an invalid shape");
  }
  return {
    scores: record.scores,
    strengths: record.strengths,
    improvements: record.improvements,
  };
}

async function complete(
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string,
  json: boolean,
): Promise<string> {
  const completion = await client.chat.completions.create({
    model: resolveModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
  });
  const content = completion.choices[0]?.message?.content;
  if (!content || content.trim() === "") {
    throw new Error("Model returned no content");
  }
  return content.trim();
}

export function createOpenRouterMentorGateway(
  options: OpenRouterMentorOptions = {},
): AiMentorGateway {
  return {
    async generateHint(context: HintContext): Promise<string> {
      const client = createClient(options.fetch);
      return complete(
        client,
        HINT_SYSTEM_PROMPT,
        hintUserPrompt(context),
        false,
      );
    },

    async evaluateBehavioralAnswer(
      question: BehavioralQuestion,
      answer: string,
    ): Promise<StarEvaluation> {
      const client = createClient(options.fetch);
      const content = await complete(
        client,
        BEHAVIORAL_SYSTEM_PROMPT,
        behavioralUserPrompt(question, answer),
        true,
      );
      return parseEvaluation(content);
    },
  };
}
