import type { ConfidenceLevel, ConfidenceRating, Topic } from "@/core/domain";

export interface ConfidenceRatingsResponse {
  ratings: ConfidenceRating[];
}

export interface CreateConfidenceRatingRequest {
  topic: Topic;
  level: ConfidenceLevel;
}

export interface CreateConfidenceRatingResponse {
  rating: ConfidenceRating;
}
