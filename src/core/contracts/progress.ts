import type { ConfidenceComparison, TopicWeakness } from "@/core/domain";

export interface ProgressSummaryResponse {
  weakAreas: TopicWeakness[];
  confidence: ConfidenceComparison[];
}
