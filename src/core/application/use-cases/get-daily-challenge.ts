import type { Challenge } from "@/core/domain";
import { selectDailyChallenge, toDayKey } from "@/core/domain";
import type { ChallengeRepository } from "@/core/application/ports";

export interface DailyChallengeSelection {
  dayKey: string;
  challenge: Challenge;
}

export async function getDailyChallenge(
  challenges: ChallengeRepository,
  now: Date,
): Promise<DailyChallengeSelection> {
  const dayKey = toDayKey(now);
  const bank = await challenges.listAll();
  return { dayKey, challenge: selectDailyChallenge(bank, dayKey) };
}
