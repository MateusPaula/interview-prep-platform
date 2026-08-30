import type { SupabaseClient } from "@supabase/supabase-js";
import type { Challenge, Difficulty, Topic } from "@/core/domain";
import type { ChallengeRepository } from "@/core/application/ports";

interface ChallengeRow {
  id: string;
  title: string;
  prompt: string;
  topic: Topic;
  difficulty: Difficulty;
  starter_code: string;
}

const CHALLENGE_COLUMNS = "id, title, prompt, topic, difficulty, starter_code";

function toChallenge(row: ChallengeRow): Challenge {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    topic: row.topic,
    difficulty: row.difficulty,
    starterCode: row.starter_code,
  };
}

export class SupabaseChallengeRepository implements ChallengeRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listAll(): Promise<Challenge[]> {
    const { data, error } = await this.client
      .from("challenges")
      .select(CHALLENGE_COLUMNS);
    if (error) {
      throw new Error(error.message);
    }
    return ((data ?? []) as ChallengeRow[]).map(toChallenge);
  }

  async findById(id: string): Promise<Challenge | null> {
    const { data, error } = await this.client
      .from("challenges")
      .select(CHALLENGE_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data ? toChallenge(data as ChallengeRow) : null;
  }
}
