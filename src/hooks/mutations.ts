import type {
  BehavioralFeedbackRequest,
  BehavioralFeedbackResponse,
  CreateAttemptRequest,
  CreateAttemptResponse,
  CreateConfidenceRatingRequest,
  CreateConfidenceRatingResponse,
  HintRequest,
  HintResponse,
} from "@/core/contracts";
import { postJson } from "./api-client";

export function submitAttempt(
  request: CreateAttemptRequest,
): Promise<CreateAttemptResponse> {
  return postJson<CreateAttemptResponse>("/api/attempts", request);
}

export function requestHint(request: HintRequest): Promise<HintResponse> {
  return postJson<HintResponse>("/api/hints", request);
}

export function submitConfidenceRating(
  request: CreateConfidenceRatingRequest,
): Promise<CreateConfidenceRatingResponse> {
  return postJson<CreateConfidenceRatingResponse>("/api/confidence", request);
}

export function requestBehavioralFeedback(
  request: BehavioralFeedbackRequest,
): Promise<BehavioralFeedbackResponse> {
  return postJson<BehavioralFeedbackResponse>(
    "/api/behavioral/feedback",
    request,
  );
}
