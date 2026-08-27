import type { Challenge } from "@/core/domain";

export interface ChallengeRepository {
  listAll(): Promise<Challenge[]>;
  findById(id: string): Promise<Challenge | null>;
}
