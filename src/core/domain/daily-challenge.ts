import type { Challenge } from "./challenge";

export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fnv1aHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function selectDailyChallenge(
  challenges: readonly Challenge[],
  dayKey: string,
): Challenge {
  if (challenges.length === 0) {
    throw new Error("Challenge bank is empty");
  }
  const ordered = [...challenges].sort((a, b) => a.id.localeCompare(b.id));
  return ordered[fnv1aHash(dayKey) % ordered.length];
}
