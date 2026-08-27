import type { HintLevel } from "@/core/domain";
import type {
  AiMentorGateway,
  ChallengeRepository,
} from "@/core/application/ports";
import {
  AiUnavailableError,
  NotFoundError,
} from "@/core/application/errors";

export interface RequestHintInput {
  challengeId: string;
  userCode: string;
  level: HintLevel;
}

export interface HintResult {
  level: HintLevel;
  hint: string;
}

export async function requestHint(
  deps: { challenges: ChallengeRepository; aiMentor: AiMentorGateway },
  input: RequestHintInput,
): Promise<HintResult> {
  const challenge = await deps.challenges.findById(input.challengeId);
  if (!challenge) {
    throw new NotFoundError(`Challenge ${input.challengeId} not found`);
  }
  try {
    const hint = await deps.aiMentor.generateHint({
      challenge,
      userCode: input.userCode,
      level: input.level,
    });
    return { level: input.level, hint };
  } catch {
    throw new AiUnavailableError("Hint generation failed");
  }
}
