import { isOneOf } from "./membership";
import type { Topic } from "./topic";

export const CONFIDENCE_LEVELS = [1, 2, 3, 4, 5] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return isOneOf(CONFIDENCE_LEVELS, value);
}

export interface ConfidenceRating {
  id: string;
  userId: string;
  topic: Topic;
  level: ConfidenceLevel;
  ratedAt: string;
}

export type NewConfidenceRating = Omit<ConfidenceRating, "id" | "ratedAt">;
