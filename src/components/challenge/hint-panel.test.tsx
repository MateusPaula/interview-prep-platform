import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiErrorResponse, HintResponse } from "@/core/contracts";
import { useChallengeSessionStore } from "@/stores/challenge-session-store";
import { renderWithIntl } from "../testing/render-with-intl";
import { HintPanel } from "./hint-panel";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const challenge = {
  id: "ch-1",
  title: "Two Sum",
  prompt: "Find the pair.",
  topic: "arrays",
  difficulty: "easy",
  starterCode: "function twoSum() {}",
} as const;

describe("HintPanel", () => {
  beforeEach(() => {
    useChallengeSessionStore.getState().clear();
    useChallengeSessionStore.getState().initialize(challenge);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useChallengeSessionStore.getState().clear();
  });

  it("only unlocks level 1 before any hint is used", () => {
    renderWithIntl(<HintPanel challengeId="ch-1" />);
    expect(screen.getByRole("button", { name: "Reveal hint 1" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Reveal hint 2" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Reveal hint 3" }),
    ).toBeDisabled();
    expect(screen.getByText("0 of 3 used")).toBeInTheDocument();
  });

  it("fetches a hint with the current code and unlocks the next level", async () => {
    useChallengeSessionStore.getState().setCode("function twoSum(a, b) {}");
    const hint: HintResponse = { level: 1, hint: "Try a hash map." };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(hint, 200));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<HintPanel challengeId="ch-1" />);
    await user.click(screen.getByRole("button", { name: "Reveal hint 1" }));
    expect(await screen.findByText("Try a hash map.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/hints",
      expect.objectContaining({ method: "POST" }),
    );
    const requestBody = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(requestBody).toEqual({
      challengeId: "ch-1",
      userCode: "function twoSum(a, b) {}",
      level: 1,
    });
    expect(screen.getByText("1 of 3 used")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reveal hint 2" })).toBeEnabled();
  });

  it("keeps earlier hints visible after revealing later ones", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ level: 1, hint: "First nudge." }, 200),
      )
      .mockResolvedValueOnce(
        jsonResponse({ level: 2, hint: "Use one pass." }, 200),
      );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<HintPanel challengeId="ch-1" />);
    await user.click(screen.getByRole("button", { name: "Reveal hint 1" }));
    await screen.findByText("First nudge.");
    await user.click(screen.getByRole("button", { name: "Reveal hint 2" }));
    await screen.findByText("Use one pass.");
    expect(screen.getByText("First nudge.")).toBeInTheDocument();
    expect(screen.getByText("2 of 3 used")).toBeInTheDocument();
  });

  it("shows a friendly retry state when the mentor is unavailable", async () => {
    const body: ApiErrorResponse = {
      error: { code: "ai_unavailable", message: "offline" },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(body, 502)));
    const user = userEvent.setup();
    renderWithIntl(<HintPanel challengeId="ch-1" />);
    await user.click(screen.getByRole("button", { name: "Reveal hint 1" }));
    expect(
      await screen.findByText(
        "The AI mentor is unavailable right now. Your code is untouched — try again in a moment.",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Reveal hint 1" }),
      ).toBeEnabled(),
    );
    expect(screen.getByText("0 of 3 used")).toBeInTheDocument();
  });
});
