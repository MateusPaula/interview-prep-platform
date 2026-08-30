import type { SupabaseClient } from "@supabase/supabase-js";
import type { BehavioralCategory, BehavioralQuestion } from "@/core/domain";
import type { BehavioralRepository } from "@/core/application/ports";

interface QuestionRow {
  id: string;
  category: BehavioralCategory;
  question: string;
}

const QUESTION_COLUMNS = "id, category, question";

function toQuestion(row: QuestionRow): BehavioralQuestion {
  return {
    id: row.id,
    category: row.category,
    question: row.question,
  };
}

export class SupabaseBehavioralRepository implements BehavioralRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listQuestions(): Promise<BehavioralQuestion[]> {
    const { data, error } = await this.client
      .from("behavioral_questions")
      .select(QUESTION_COLUMNS);
    if (error) {
      throw new Error(error.message);
    }
    return ((data ?? []) as QuestionRow[]).map(toQuestion);
  }

  async findQuestionById(id: string): Promise<BehavioralQuestion | null> {
    const { data, error } = await this.client
      .from("behavioral_questions")
      .select(QUESTION_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data ? toQuestion(data as QuestionRow) : null;
  }
}
