import type { Difficulty } from "./difficulty";
import { isOneOf } from "./membership";
import type { Topic } from "./topic";

export const ATTEMPT_OUTCOMES = [
  "solved",
  "solved_with_hints",
  "gave_up",
] as const;

export type AttemptOutcome = (typeof ATTEMPT_OUTCOMES)[number];

export function isAttemptOutcome(value: unknown): value is AttemptOutcome {
  return isOneOf(ATTEMPT_OUTCOMES, value);
}

export interface Attempt {
  id: string;
  userId: string;
  challengeId: string;
  topic: Topic;
  difficulty: Difficulty;
  outcome: AttemptOutcome;
  hintsUsed: number;
  timeSpentSeconds: number;
  attemptedAt: string;
}

export type NewAttempt = Omit<Attempt, "id" | "attemptedAt">;
