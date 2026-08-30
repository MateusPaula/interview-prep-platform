import type { BehavioralQuestion } from "@/core/domain";

export interface BehavioralRepository {
  listQuestions(): Promise<BehavioralQuestion[]>;
  findQuestionById(id: string): Promise<BehavioralQuestion | null>;
}
