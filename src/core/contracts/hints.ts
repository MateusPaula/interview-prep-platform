import type { HintLevel } from "@/core/domain";

export interface HintRequest {
  challengeId: string;
  userCode: string;
  level: HintLevel;
}

export interface HintResponse {
  level: HintLevel;
  hint: string;
}
