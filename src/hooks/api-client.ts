import type { ApiErrorCode, ApiErrorResponse } from "@/core/contracts";

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = (value as { error?: unknown }).error;
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as { code?: unknown }).code === "string" &&
    typeof (candidate as { message?: unknown }).message === "string"
  );
}

export async function apiFetch<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiError("internal_error", "Request failed");
  }
  if (response.ok) {
    return (await response.json()) as TResponse;
  }
  let parsed: unknown = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }
  if (isApiErrorResponse(parsed)) {
    throw new ApiError(parsed.error.code, parsed.error.message);
  }
  throw new ApiError("internal_error", "Request failed");
}

export function postJson<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  return apiFetch<TResponse>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
