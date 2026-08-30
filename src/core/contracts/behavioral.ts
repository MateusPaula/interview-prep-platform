import type { BehavioralFeedback, BehavioralQuestion } from "@/core/domain";

export interface BehavioralQuestionResponse {
  question: BehavioralQuestion;
}

export interface BehavioralFeedbackRequest {
  questionId: string;
  answer: string;
}

export interface BehavioralFeedbackResponse {
  feedback: BehavioralFeedback;
}
