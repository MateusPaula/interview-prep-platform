"use client";

import type {
  BehavioralQuestionResponse,
  ConfidenceRatingsResponse,
  DailyChallengeResponse,
  ProgressSummaryResponse,
} from "@/core/contracts";
import { useApiQuery } from "./use-api-query";

export function useDailyChallenge() {
  return useApiQuery<DailyChallengeResponse>("/api/challenges/daily");
}

export function useProgress() {
  return useApiQuery<ProgressSummaryResponse>("/api/progress");
}

export function useConfidenceRatings() {
  return useApiQuery<ConfidenceRatingsResponse>("/api/confidence");
}

export function useBehavioralQuestion() {
  return useApiQuery<BehavioralQuestionResponse>("/api/behavioral/question");
}
