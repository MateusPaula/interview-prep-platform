import type { Attempt } from "./attempt";
import type { Topic } from "./topic";

export interface TopicWeakness {
  topic: Topic;
  score: number;
  attemptCount: number;
}

const HINT_PENALTY = 20;
const GAVE_UP_SCORE = 100;

function attemptWeakness(
  attempt: Pick<Attempt, "outcome" | "hintsUsed">,
): number {
  switch (attempt.outcome) {
    case "solved":
      return 0;
    case "solved_with_hints":
      return HINT_PENALTY * attempt.hintsUsed;
    case "gave_up":
      return GAVE_UP_SCORE;
  }
}

export function weaknessScore(
  attempts: ReadonlyArray<Pick<Attempt, "outcome" | "hintsUsed">>,
): number {
  if (attempts.length === 0) {
    return 0;
  }
  const total = attempts.reduce(
    (sum, attempt) => sum + attemptWeakness(attempt),
    0,
  );
  return Math.round(total / attempts.length);
}

export function rankWeakAreas(
  attempts: ReadonlyArray<Pick<Attempt, "topic" | "outcome" | "hintsUsed">>,
): TopicWeakness[] {
  const byTopic = new Map<Topic, Pick<Attempt, "outcome" | "hintsUsed">[]>();
  for (const attempt of attempts) {
    const group = byTopic.get(attempt.topic) ?? [];
    group.push(attempt);
    byTopic.set(attempt.topic, group);
  }
  return [...byTopic.entries()]
    .map(([topic, group]) => ({
      topic,
      score: weaknessScore(group),
      attemptCount: group.length,
    }))
    .sort(
      (a, b) => b.score - a.score || a.topic.localeCompare(b.topic),
    );
}
