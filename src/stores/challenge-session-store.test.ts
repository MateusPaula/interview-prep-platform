import { beforeEach, describe, expect, it } from "vitest";
import type { Challenge } from "@/core/domain";
import {
  deriveOutcome,
  isHintUnlocked,
  nextHintLevel,
  useChallengeSessionStore,
} from "./challenge-session-store";

const challenge: Challenge = {
  id: "ch-1",
  title: "Two Sum",
  prompt: "Find two numbers adding up to the target.",
  topic: "arrays",
  difficulty: "easy",
  starterCode: "function twoSum() {}",
};

describe("challenge session store", () => {
  beforeEach(() => {
    useChallengeSessionStore.getState().clear();
  });

  it("seeds the editor with starter code for a new challenge", () => {
    useChallengeSessionStore.getState().initialize(challenge);
    const state = useChallengeSessionStore.getState();
    expect(state.challengeId).toBe("ch-1");
    expect(state.code).toBe("function twoSum() {}");
    expect(state.hints).toEqual([]);
  });

  it("keeps edits and hints when re-initializing the same challenge", () => {
    const store = useChallengeSessionStore.getState();
    store.initialize(challenge);
    store.setCode("function twoSum() { return [0, 1]; }");
    store.addHint({ level: 1, hint: "Scan once." });
    useChallengeSessionStore.getState().initialize(challenge);
    const state = useChallengeSessionStore.getState();
    expect(state.code).toBe("function twoSum() { return [0, 1]; }");
    expect(state.hints).toHaveLength(1);
  });

  it("resets for a different challenge", () => {
    const store = useChallengeSessionStore.getState();
    store.initialize(challenge);
    store.setCode("edited");
    store.addHint({ level: 1, hint: "Scan once." });
    useChallengeSessionStore.getState().initialize({
      ...challenge,
      id: "ch-2",
      starterCode: "function other() {}",
    });
    const state = useChallengeSessionStore.getState();
    expect(state.challengeId).toBe("ch-2");
    expect(state.code).toBe("function other() {}");
    expect(state.hints).toEqual([]);
  });

  it("ignores a duplicate hint level", () => {
    const store = useChallengeSessionStore.getState();
    store.initialize(challenge);
    store.addHint({ level: 1, hint: "First." });
    useChallengeSessionStore.getState().addHint({ level: 1, hint: "Again." });
    expect(useChallengeSessionStore.getState().hints).toEqual([
      { level: 1, hint: "First." },
    ]);
  });
});

describe("hint gating", () => {
  it("unlocks only level 1 before any hint is used", () => {
    expect(isHintUnlocked([], 1)).toBe(true);
    expect(isHintUnlocked([], 2)).toBe(false);
    expect(isHintUnlocked([], 3)).toBe(false);
  });

  it("unlocks level 2 only after level 1 is used", () => {
    const used = [{ level: 1 as const, hint: "a" }];
    expect(isHintUnlocked(used, 2)).toBe(true);
    expect(isHintUnlocked(used, 3)).toBe(false);
  });

  it("unlocks level 3 only after levels 1 and 2 are used", () => {
    const used = [
      { level: 1 as const, hint: "a" },
      { level: 2 as const, hint: "b" },
    ];
    expect(isHintUnlocked(used, 3)).toBe(true);
  });

  it("computes the next requestable level", () => {
    expect(nextHintLevel([])).toBe(1);
    expect(nextHintLevel([{ level: 1, hint: "a" }])).toBe(2);
    expect(
      nextHintLevel([
        { level: 1, hint: "a" },
        { level: 2, hint: "b" },
        { level: 3, hint: "c" },
      ]),
    ).toBeNull();
  });
});

describe("deriveOutcome", () => {
  it("keeps solved when no hints were used", () => {
    expect(deriveOutcome("solved", 0)).toBe("solved");
  });

  it("derives solved_with_hints when solved with hints", () => {
    expect(deriveOutcome("solved", 1)).toBe("solved_with_hints");
    expect(deriveOutcome("solved", 3)).toBe("solved_with_hints");
  });

  it("keeps gave_up regardless of hints", () => {
    expect(deriveOutcome("gave_up", 0)).toBe("gave_up");
    expect(deriveOutcome("gave_up", 2)).toBe("gave_up");
  });
});
