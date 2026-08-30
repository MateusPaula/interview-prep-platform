import type { ConfidenceComparison, TopicWeakness } from "@/core/domain";
import { compareConfidenceByTopic, rankWeakAreas } from "@/core/domain";
import type {
  AttemptRepository,
  ConfidenceRepository,
} from "@/core/application/ports";

export interface ProgressSummary {
  weakAreas: TopicWeakness[];
  confidence: ConfidenceComparison[];
}

export async function getProgressSummary(
  deps: { attempts: AttemptRepository; confidence: ConfidenceRepository },
  userId: string,
): Promise<ProgressSummary> {
  const [attempts, ratings] = await Promise.all([
    deps.attempts.listByUser(userId),
    deps.confidence.listByUser(userId),
  ]);
  return {
    weakAreas: rankWeakAreas(attempts),
    confidence: compareConfidenceByTopic(ratings),
  };
}
