import type { BehavioralFeedbackResponse } from "@/core/contracts";
import { getBehavioralFeedback } from "@/core/application/use-cases/get-behavioral-feedback";
import { getRequestContext } from "@/app/api/composition";
import {
  errorResponse,
  readJsonBody,
  toErrorResponse,
  unauthorizedResponse,
} from "@/app/api/http";

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await getRequestContext();
    if (!context) {
      return unauthorizedResponse();
    }
    const body = await readJsonBody(request);
    if (!body) {
      return errorResponse("invalid_request", "Request body must be JSON");
    }
    const { questionId, answer } = body;
    if (typeof questionId !== "string" || questionId === "") {
      return errorResponse("invalid_request", "questionId is required");
    }
    if (typeof answer !== "string" || answer.trim() === "") {
      return errorResponse("invalid_request", "answer must not be empty");
    }
    const feedback = await getBehavioralFeedback(
      { behavioral: context.behavioral, aiMentor: context.aiMentor },
      { questionId, answer },
    );
    const response: BehavioralFeedbackResponse = { feedback };
    return Response.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}
