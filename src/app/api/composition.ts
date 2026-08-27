import type {
  AiMentorGateway,
  AttemptRepository,
  BehavioralRepository,
  ChallengeRepository,
  ConfidenceRepository,
} from "@/core/application/ports";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { SupabaseAttemptRepository } from "@/infrastructure/supabase/attempt-repository";
import { SupabaseBehavioralRepository } from "@/infrastructure/supabase/behavioral-repository";
import { SupabaseChallengeRepository } from "@/infrastructure/supabase/challenge-repository";
import { SupabaseConfidenceRepository } from "@/infrastructure/supabase/confidence-repository";
import { createOpenRouterMentorGateway } from "@/infrastructure/openrouter/mentor-gateway";

export interface RequestContext {
  userId: string;
  challenges: ChallengeRepository;
  attempts: AttemptRepository;
  confidence: ConfidenceRepository;
  behavioral: BehavioralRepository;
  aiMentor: AiMentorGateway;
}

export async function getRequestContext(): Promise<RequestContext | null> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return {
    userId: data.user.id,
    challenges: new SupabaseChallengeRepository(client),
    attempts: new SupabaseAttemptRepository(client),
    confidence: new SupabaseConfidenceRepository(client),
    behavioral: new SupabaseBehavioralRepository(client),
    aiMentor: createOpenRouterMentorGateway(),
  };
}
