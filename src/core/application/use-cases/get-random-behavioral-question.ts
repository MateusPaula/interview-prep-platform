import type { BehavioralQuestion } from "@/core/domain";
import type { BehavioralRepository } from "@/core/application/ports";
import { NotFoundError } from "@/core/application/errors";

export async function getRandomBehavioralQuestion(
  behavioral: BehavioralRepository,
  random: () => number = Math.random,
): Promise<BehavioralQuestion> {
  const questions = await behavioral.listQuestions();
  if (questions.length === 0) {
    throw new NotFoundError("Behavioral question bank is empty");
  }
  return questions[Math.floor(random() * questions.length)];
}
