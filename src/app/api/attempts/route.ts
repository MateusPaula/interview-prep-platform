import { isAttemptOutcome } from "@/core/domain";
import type { CreateAttemptResponse } from "@/core/contracts";
import { recordAttempt } from "@/core/application/use-cases/record-attempt";
import { getRequestContext } from "@/app/api/composition";
import {
  errorResponse,
  readJsonBody,
  toErrorResponse,
  unauthorizedResponse,
} from "@/app/api/http";

function isCount(value: unknown, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max
  );
}

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
    const { challengeId, outcome, hintsUsed, timeSpentSeconds } = body;
    if (typeof challengeId !== "string" || challengeId === "") {
      return errorResponse("invalid_request", "challengeId is required");
    }
    if (!isAttemptOutcome(outcome)) {
      return errorResponse(
        "invalid_request",
        "outcome must be solved, solved_with_hints or gave_up",
      );
    }
    if (!isCount(hintsUsed, 3)) {
      return errorResponse(
        "invalid_request",
        "hintsUsed must be an integer between 0 and 3",
      );
    }
    if (!isCount(timeSpentSeconds, Number.MAX_SAFE_INTEGER)) {
      return errorResponse(
        "invalid_request",
        "timeSpentSeconds must be a non-negative integer",
      );
    }
    const attempt = await recordAttempt(
      { challenges: context.challenges, attempts: context.attempts },
      {
        userId: context.userId,
        challengeId,
        outcome,
        hintsUsed,
        timeSpentSeconds,
      },
    );
    const response: CreateAttemptResponse = { attempt };
    return Response.json(response, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
