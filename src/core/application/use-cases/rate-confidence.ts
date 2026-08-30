import type {
  ConfidenceLevel,
  ConfidenceRating,
  Topic,
} from "@/core/domain";
import type { ConfidenceRepository } from "@/core/application/ports";

export interface RateConfidenceInput {
  userId: string;
  topic: Topic;
  level: ConfidenceLevel;
}

export async function rateConfidence(
  confidence: ConfidenceRepository,
  input: RateConfidenceInput,
): Promise<ConfidenceRating> {
  return confidence.add(input);
}
