import type { BehavioralQuestionResponse } from "@/core/contracts";
import { getRandomBehavioralQuestion } from "@/core/application/use-cases/get-random-behavioral-question";
import { getRequestContext } from "@/app/api/composition";
import { toErrorResponse, unauthorizedResponse } from "@/app/api/http";

export async function GET(): Promise<Response> {
  try {
    const context = await getRequestContext();
    if (!context) {
      return unauthorizedResponse();
    }
    const question = await getRandomBehavioralQuestion(context.behavioral);
    const response: BehavioralQuestionResponse = { question };
    return Response.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}
