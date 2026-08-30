import { isOneOf } from "./membership";

export const TOPICS = [
  "arrays",
  "strings",
  "hash-maps",
  "two-pointers",
  "sliding-window",
  "stacks-queues",
  "linked-lists",
  "trees",
  "graphs",
  "binary-search",
  "recursion-backtracking",
  "dynamic-programming",
] as const;

export type Topic = (typeof TOPICS)[number];

export function isTopic(value: unknown): value is Topic {
  return isOneOf(TOPICS, value);
}
