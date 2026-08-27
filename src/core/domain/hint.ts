import { isOneOf } from "./membership";

export const HINT_LEVELS = [1, 2, 3] as const;

export type HintLevel = (typeof HINT_LEVELS)[number];

export function isHintLevel(value: unknown): value is HintLevel {
  return isOneOf(HINT_LEVELS, value);
}
