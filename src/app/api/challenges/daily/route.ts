import type { DailyChallengeResponse } from "@/core/contracts";
import { getDailyChallenge } from "@/core/application/use-cases/get-daily-challenge";
import { getRequestContext } from "@/app/api/composition";
import { toErrorResponse, unauthorizedResponse } from "@/app/api/http";

export async function GET(): Promise<Response> {
  try {
    const context = await getRequestContext();
    if (!context) {
      return unauthorizedResponse();
    }
    const { dayKey, challenge } = await getDailyChallenge(
      context.challenges,
      new Date(),
    );
    const body: DailyChallengeResponse = { dayKey, challenge };
    return Response.json(body);
  } catch (error) {
    return toErrorResponse(error);
  }
}
