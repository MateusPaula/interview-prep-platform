import { isConfidenceLevel, isTopic } from "@/core/domain";
import type {
  ConfidenceRatingsResponse,
  CreateConfidenceRatingResponse,
} from "@/core/contracts";
import { listConfidenceRatings } from "@/core/application/use-cases/list-confidence-ratings";
import { rateConfidence } from "@/core/application/use-cases/rate-confidence";
import { getRequestContext } from "@/app/api/composition";
import {
  errorResponse,
  readJsonBody,
  toErrorResponse,
  unauthorizedResponse,
} from "@/app/api/http";

export async function GET(): Promise<Response> {
  try {
    const context = await getRequestContext();
    if (!context) {
      return unauthorizedResponse();
    }
    const ratings = await listConfidenceRatings(
      context.confidence,
      context.userId,
    );
    const response: ConfidenceRatingsResponse = { ratings };
    return Response.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
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
    const { topic, level } = body;
    if (!isTopic(topic)) {
      return errorResponse("invalid_request", "topic is not a known topic");
    }
    if (!isConfidenceLevel(level)) {
      return errorResponse(
        "invalid_request",
        "level must be an integer from 1 to 5",
      );
    }
    const rating = await rateConfidence(context.confidence, {
      userId: context.userId,
      topic,
      level,
    });
    const response: CreateConfidenceRatingResponse = { rating };
    return Response.json(response, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
