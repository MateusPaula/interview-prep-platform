import type { ConfidenceRating, NewConfidenceRating } from "@/core/domain";

export interface ConfidenceRepository {
  add(rating: NewConfidenceRating): Promise<ConfidenceRating>;
  listByUser(userId: string): Promise<ConfidenceRating[]>;
}
