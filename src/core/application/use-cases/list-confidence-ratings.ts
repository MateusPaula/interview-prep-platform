import type { ConfidenceRating } from "@/core/domain";
import type { ConfidenceRepository } from "@/core/application/ports";

export async function listConfidenceRatings(
  confidence: ConfidenceRepository,
  userId: string,
): Promise<ConfidenceRating[]> {
  return confidence.listByUser(userId);
}
