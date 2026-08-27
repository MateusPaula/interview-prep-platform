import type { Attempt, AttemptOutcome } from "@/core/domain";
import type {
  AttemptRepository,
  ChallengeRepository,
} from "@/core/application/ports";
import { NotFoundError } from "@/core/application/errors";

export interface RecordAttemptInput {
  userId: string;
  challengeId: string;
  outcome: AttemptOutcome;
  hintsUsed: number;
  timeSpentSeconds: number;
}

export async function recordAttempt(
  deps: { challenges: ChallengeRepository; attempts: AttemptRepository },
  input: RecordAttemptInput,
): Promise<Attempt> {
  const challenge = await deps.challenges.findById(input.challengeId);
  if (!challenge) {
    throw new NotFoundError(`Challenge ${input.challengeId} not found`);
  }
  return deps.attempts.add({
    userId: input.userId,
    challengeId: challenge.id,
    topic: challenge.topic,
    difficulty: challenge.difficulty,
    outcome: input.outcome,
    hintsUsed: input.hintsUsed,
    timeSpentSeconds: input.timeSpentSeconds,
  });
}
