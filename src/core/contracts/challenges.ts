import type { Challenge } from "@/core/domain";

export interface DailyChallengeResponse {
  dayKey: string;
  challenge: Challenge;
}
