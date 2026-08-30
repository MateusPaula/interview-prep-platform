import type { BehavioralFeedback } from "@/core/domain";
import { buildBehavioralFeedback, isStarScores } from "@/core/domain";
import type {
  AiMentorGateway,
  BehavioralRepository,
} from "@/core/application/ports";
import {
  AiUnavailableError,
  NotFoundError,
} from "@/core/application/errors";

export interface BehavioralFeedbackInput {
  questionId: string;
  answer: string;
}

export async function getBehavioralFeedback(
  deps: { behavioral: BehavioralRepository; aiMentor: AiMentorGateway },
  input: BehavioralFeedbackInput,
): Promise<BehavioralFeedback> {
  const question = await deps.behavioral.findQuestionById(input.questionId);
  if (!question) {
    throw new NotFoundError(`Question ${input.questionId} not found`);
  }
  let evaluation;
  try {
    evaluation = await deps.aiMentor.evaluateBehavioralAnswer(
      question,
      input.answer,
    );
  } catch {
    throw new AiUnavailableError("Behavioral evaluation failed");
  }
  if (!isStarScores(evaluation.scores)) {
    throw new AiUnavailableError("Behavioral evaluation returned invalid scores");
  }
  return buildBehavioralFeedback(evaluation);
}
