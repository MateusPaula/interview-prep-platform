import { isOneOf } from "./membership";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export function isDifficulty(value: unknown): value is Difficulty {
  return isOneOf(DIFFICULTIES, value);
}
