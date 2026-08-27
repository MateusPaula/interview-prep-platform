import type { ApiErrorCode, ApiErrorResponse } from "@/core/contracts";
import {
  AiUnavailableError,
  NotFoundError,
} from "@/core/application/errors";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  not_found: 404,
  invalid_request: 400,
  ai_unavailable: 502,
  internal_error: 500,
};

export function errorResponse(code: ApiErrorCode, message: string): Response {
  const body: ApiErrorResponse = { error: { code, message } };
  return Response.json(body, { status: STATUS_BY_CODE[code] });
}

export function unauthorizedResponse(): Response {
  return errorResponse("unauthorized", "Authentication required");
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof NotFoundError) {
    return errorResponse("not_found", error.message);
  }
  if (error instanceof AiUnavailableError) {
    return errorResponse("ai_unavailable", error.message);
  }
  return errorResponse("internal_error", "Something went wrong");
}

export async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return null;
    }
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
