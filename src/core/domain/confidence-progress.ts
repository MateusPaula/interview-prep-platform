import type { ConfidenceLevel, ConfidenceRating } from "./confidence";
import { TOPICS, type Topic } from "./topic";

export interface ConfidenceComparison {
  topic: Topic;
  earliest: ConfidenceLevel;
  latest: ConfidenceLevel;
}

type RatingSnapshot = Pick<ConfidenceRating, "topic" | "level" | "ratedAt">;

export function compareConfidenceByTopic(
  ratings: readonly RatingSnapshot[],
): ConfidenceComparison[] {
  const byTopic = new Map<
    Topic,
    { earliest: RatingSnapshot; latest: RatingSnapshot }
  >();
  for (const rating of ratings) {
    const entry = byTopic.get(rating.topic);
    if (!entry) {
      byTopic.set(rating.topic, { earliest: rating, latest: rating });
      continue;
    }
    if (rating.ratedAt < entry.earliest.ratedAt) {
      entry.earliest = rating;
    }
    if (rating.ratedAt >= entry.latest.ratedAt) {
      entry.latest = rating;
    }
  }
  return [...byTopic.entries()]
    .sort(([a], [b]) => TOPICS.indexOf(a) - TOPICS.indexOf(b))
    .map(([topic, entry]) => ({
      topic,
      earliest: entry.earliest.level,
      latest: entry.latest.level,
    }));
}
