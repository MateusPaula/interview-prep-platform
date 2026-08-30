import type { ProgressSummaryResponse } from "@/core/contracts";
import { getProgressSummary } from "@/core/application/use-cases/get-progress-summary";
import { getRequestContext } from "@/app/api/composition";
import { toErrorResponse, unauthorizedResponse } from "@/app/api/http";

export async function GET(): Promise<Response> {
  try {
    const context = await getRequestContext();
    if (!context) {
      return unauthorizedResponse();
    }
    const summary = await getProgressSummary(
      { attempts: context.attempts, confidence: context.confidence },
      context.userId,
    );
    const response: ProgressSummaryResponse = summary;
    return Response.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}
