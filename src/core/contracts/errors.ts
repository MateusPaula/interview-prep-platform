export type ApiErrorCode =
  | "unauthorized"
  | "not_found"
  | "invalid_request"
  | "ai_unavailable"
  | "internal_error";

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
