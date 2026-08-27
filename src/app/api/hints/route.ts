import { isHintLevel } from "@/core/domain";
import type { HintResponse } from "@/core/contracts";
import { requestHint } from "@/core/application/use-cases/request-hint";
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
    const { challengeId, userCode, level } = body;
    if (typeof challengeId !== "string" || challengeId === "") {
      return errorResponse("invalid_request", "challengeId is required");
    }
    if (typeof userCode !== "string") {
      return errorResponse("invalid_request", "userCode must be a string");
    }
    if (!isHintLevel(level)) {
      return errorResponse("invalid_request", "level must be 1, 2 or 3");
    }
    const result = await requestHint(
      { challenges: context.challenges, aiMentor: context.aiMentor },
      { challengeId, userCode, level },
    );
    const response: HintResponse = result;
    return Response.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}
