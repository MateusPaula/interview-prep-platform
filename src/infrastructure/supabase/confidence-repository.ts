import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ConfidenceLevel,
  ConfidenceRating,
  NewConfidenceRating,
  Topic,
} from "@/core/domain";
import type { ConfidenceRepository } from "@/core/application/ports";

interface RatingRow {
  id: string;
  user_id: string;
  topic: Topic;
  level: ConfidenceLevel;
  rated_at: string;
}

const RATING_COLUMNS = "id, user_id, topic, level, rated_at";

function toRating(row: RatingRow): ConfidenceRating {
  return {
    id: row.id,
    userId: row.user_id,
    topic: row.topic,
    level: row.level,
    ratedAt: new Date(row.rated_at).toISOString(),
  };
}

export class SupabaseConfidenceRepository implements ConfidenceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async add(rating: NewConfidenceRating): Promise<ConfidenceRating> {
    const { data, error } = await this.client
      .from("confidence_ratings")
      .insert({
        user_id: rating.userId,
        topic: rating.topic,
        level: rating.level,
      })
      .select(RATING_COLUMNS)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return toRating(data as RatingRow);
  }

  async listByUser(userId: string): Promise<ConfidenceRating[]> {
    const { data, error } = await this.client
      .from("confidence_ratings")
      .select(RATING_COLUMNS)
      .eq("user_id", userId)
      .order("rated_at", { ascending: true });
    if (error) {
      throw new Error(error.message);
    }
    return ((data ?? []) as RatingRow[]).map(toRating);
  }
}
