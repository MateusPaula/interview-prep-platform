import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Attempt,
  AttemptOutcome,
  Difficulty,
  NewAttempt,
  Topic,
} from "@/core/domain";
import type { AttemptRepository } from "@/core/application/ports";

interface AttemptRow {
  id: string;
  user_id: string;
  challenge_id: string;
  topic: Topic;
  difficulty: Difficulty;
  outcome: AttemptOutcome;
  hints_used: number;
  time_spent_seconds: number;
  attempted_at: string;
}

const ATTEMPT_COLUMNS =
  "id, user_id, challenge_id, topic, difficulty, outcome, hints_used, time_spent_seconds, attempted_at";

function toAttempt(row: AttemptRow): Attempt {
  return {
    id: row.id,
    userId: row.user_id,
    challengeId: row.challenge_id,
    topic: row.topic,
    difficulty: row.difficulty,
    outcome: row.outcome,
    hintsUsed: row.hints_used,
    timeSpentSeconds: row.time_spent_seconds,
    attemptedAt: new Date(row.attempted_at).toISOString(),
  };
}

export class SupabaseAttemptRepository implements AttemptRepository {
  constructor(private readonly client: SupabaseClient) {}

  async add(attempt: NewAttempt): Promise<Attempt> {
    const { data, error } = await this.client
      .from("attempts")
      .insert({
        user_id: attempt.userId,
        challenge_id: attempt.challengeId,
        topic: attempt.topic,
        difficulty: attempt.difficulty,
        outcome: attempt.outcome,
        hints_used: attempt.hintsUsed,
        time_spent_seconds: attempt.timeSpentSeconds,
      })
      .select(ATTEMPT_COLUMNS)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return toAttempt(data as AttemptRow);
  }

  async listByUser(userId: string): Promise<Attempt[]> {
    const { data, error } = await this.client
      .from("attempts")
      .select(ATTEMPT_COLUMNS)
      .eq("user_id", userId)
      .order("attempted_at", { ascending: true });
    if (error) {
      throw new Error(error.message);
    }
    return ((data ?? []) as AttemptRow[]).map(toAttempt);
  }
}
