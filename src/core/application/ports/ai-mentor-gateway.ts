import type {
  BehavioralQuestion,
  Challenge,
  HintLevel,
  StarEvaluation,
} from "@/core/domain";

export interface HintContext {
  challenge: Challenge;
  userCode: string;
  level: HintLevel;
}

export interface AiMentorGateway {
  generateHint(context: HintContext): Promise<string>;
  evaluateBehavioralAnswer(
    question: BehavioralQuestion,
    answer: string,
  ): Promise<StarEvaluation>;
}
