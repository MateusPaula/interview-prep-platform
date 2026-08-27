import type { Attempt, NewAttempt } from "@/core/domain";

export interface AttemptRepository {
  add(attempt: NewAttempt): Promise<Attempt>;
  listByUser(userId: string): Promise<Attempt[]>;
}
