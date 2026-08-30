import { create } from "zustand";
import type { AttemptOutcome, Challenge, HintLevel } from "@/core/domain";
import { HINT_LEVELS } from "@/core/domain";

export interface UsedHint {
  level: HintLevel;
  hint: string;
}

export type OutcomeChoice = "solved" | "gave_up";

interface ChallengeSessionState {
  challengeId: string | null;
  code: string;
  hints: UsedHint[];
  initialize: (challenge: Challenge) => void;
  setCode: (code: string) => void;
  addHint: (hint: UsedHint) => void;
  clear: () => void;
}

export function isHintUnlocked(
  used: readonly UsedHint[],
  level: HintLevel,
): boolean {
  return level <= used.length + 1;
}

export function nextHintLevel(used: readonly UsedHint[]): HintLevel | null {
  const candidate = HINT_LEVELS.find(
    (level) => level === used.length + 1,
  );
  return candidate ?? null;
}

export function deriveOutcome(
  choice: OutcomeChoice,
  hintsUsed: number,
): AttemptOutcome {
  if (choice === "solved" && hintsUsed > 0) {
    return "solved_with_hints";
  }
  return choice;
}

export const useChallengeSessionStore = create<ChallengeSessionState>(
  (set, get) => ({
    challengeId: null,
    code: "",
    hints: [],
    initialize: (challenge) => {
      if (get().challengeId === challenge.id) {
        return;
      }
      set({
        challengeId: challenge.id,
        code: challenge.starterCode,
        hints: [],
      });
    },
    setCode: (code) => set({ code }),
    addHint: (hint) => {
      const { hints } = get();
      if (hints.some((used) => used.level === hint.level)) {
        return;
      }
      set({ hints: [...hints, hint] });
    },
    clear: () => set({ challengeId: null, code: "", hints: [] }),
  }),
);
