export const BEHAVIORAL_CATEGORIES = [
  "teamwork",
  "leadership",
  "conflict",
  "failure",
  "growth",
] as const;

export type BehavioralCategory = (typeof BEHAVIORAL_CATEGORIES)[number];

export interface BehavioralQuestion {
  id: string;
  category: BehavioralCategory;
  question: string;
}

export const STAR_CRITERIA = ["situation", "task", "action", "result"] as const;

export type StarCriterion = (typeof STAR_CRITERIA)[number];

export type StarScores = Record<StarCriterion, number>;

const MIN_STAR_SCORE = 1;
const MAX_STAR_SCORE = 5;

function isValidScore(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_STAR_SCORE &&
    value <= MAX_STAR_SCORE
  );
}

export function isStarScores(value: unknown): value is StarScores {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return STAR_CRITERIA.every((criterion) => isValidScore(record[criterion]));
}

export interface StarEvaluation {
  scores: StarScores;
  strengths: string[];
  improvements: string[];
}

export interface BehavioralFeedback extends StarEvaluation {
  overallScore: number;
}

export function buildBehavioralFeedback(
  evaluation: StarEvaluation,
): BehavioralFeedback {
  const total = STAR_CRITERIA.reduce(
    (sum, criterion) => sum + evaluation.scores[criterion],
    0,
  );
  const overallScore = Math.round((total / STAR_CRITERIA.length) * 10) / 10;
  return { ...evaluation, overallScore };
}
