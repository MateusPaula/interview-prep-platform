import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateAttemptResponse } from "@/core/contracts";
import { useChallengeSessionStore } from "@/stores/challenge-session-store";
import { useTimerStore } from "@/stores/timer-store";
import { renderWithIntl } from "../testing/render-with-intl";
import { SubmitPanel } from "./submit-panel";

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

const attemptResponse: CreateAttemptResponse = {
  attempt: {
    id: "at-1",
    userId: "u-1",
    challengeId: "ch-1",
    topic: "arrays",
    difficulty: "easy",
    outcome: "solved_with_hints",
    hintsUsed: 1,
    timeSpentSeconds: 45,
    attemptedAt: "2026-08-27T12:00:00Z",
  },
};

function elapseTimer(totalSeconds: number, elapsedSeconds: number) {
  vi.useFakeTimers();
  useTimerStore.getState().configure(totalSeconds);
  useTimerStore.getState().start();
  vi.advanceTimersByTime(elapsedSeconds * 1000);
  useTimerStore.getState().pause();
  vi.useRealTimers();
}

describe("SubmitPanel", () => {
  beforeEach(() => {
    useChallengeSessionStore.getState().clear();
    useChallengeSessionStore.getState().initialize(challenge);
    useTimerStore.getState().reset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useChallengeSessionStore.getState().clear();
    useTimerStore.getState().reset();
  });

  it("requires an outcome choice before recording", () => {
    renderWithIntl(<SubmitPanel challengeId="ch-1" onRecorded={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Record attempt" }),
    ).toBeDisabled();
  });

  it("records solved_with_hints when solved after using hints", async () => {
    useChallengeSessionStore
      .getState()
      .addHint({ level: 1, hint: "Use a map." });
    elapseTimer(1200, 45);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(attemptResponse, 201));
    vi.stubGlobal("fetch", fetchMock);
    const onRecorded = vi.fn();
    const user = userEvent.setup();
    renderWithIntl(<SubmitPanel challengeId="ch-1" onRecorded={onRecorded} />);
    await user.click(screen.getByRole("radio", { name: /I solved it/ }));
    await user.click(screen.getByRole("button", { name: "Record attempt" }));
    await waitFor(() =>
      expect(onRecorded).toHaveBeenCalledWith(attemptResponse.attempt),
    );
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body).toEqual({
      challengeId: "ch-1",
      outcome: "solved_with_hints",
      hintsUsed: 1,
      timeSpentSeconds: 45,
    });
  });

  it("records a clean solve as solved", async () => {
    elapseTimer(1200, 30);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(attemptResponse, 201));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<SubmitPanel challengeId="ch-1" onRecorded={vi.fn()} />);
    await user.click(screen.getByRole("radio", { name: /I solved it/ }));
    await user.click(screen.getByRole("button", { name: "Record attempt" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.outcome).toBe("solved");
    expect(body.hintsUsed).toBe(0);
  });

  it("records gave_up even when hints were used", async () => {
    useChallengeSessionStore
      .getState()
      .addHint({ level: 1, hint: "Use a map." });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(attemptResponse, 201));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<SubmitPanel challengeId="ch-1" onRecorded={vi.fn()} />);
    await user.click(screen.getByRole("radio", { name: /I gave up/ }));
    await user.click(screen.getByRole("button", { name: "Record attempt" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.outcome).toBe("gave_up");
    expect(body.hintsUsed).toBe(1);
  });

  it("shows an error and allows retrying when recording fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          { error: { code: "internal_error", message: "boom" } },
          500,
        ),
      ),
    );
    const onRecorded = vi.fn();
    const user = userEvent.setup();
    renderWithIntl(<SubmitPanel challengeId="ch-1" onRecorded={onRecorded} />);
    await user.click(screen.getByRole("radio", { name: /I solved it/ }));
    await user.click(screen.getByRole("button", { name: "Record attempt" }));
    expect(
      await screen.findByText("Could not record the attempt. Try again."),
    ).toBeInTheDocument();
    expect(onRecorded).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Record attempt" }),
    ).toBeEnabled();
  });
});
