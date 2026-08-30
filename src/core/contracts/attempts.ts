import type { Attempt, AttemptOutcome } from "@/core/domain";

export interface CreateAttemptRequest {
  challengeId: string;
  outcome: AttemptOutcome;
  hintsUsed: number;
  timeSpentSeconds: number;
}

export interface CreateAttemptResponse {
  attempt: Attempt;
}
