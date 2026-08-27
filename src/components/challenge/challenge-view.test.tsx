import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CreateAttemptResponse,
  DailyChallengeResponse,
} from "@/core/contracts";
import { useChallengeSessionStore } from "@/stores/challenge-session-store";
import { useTimerStore } from "@/stores/timer-store";
import { renderWithIntl } from "../testing/render-with-intl";
import { ChallengeView } from "./challenge-view";

vi.mock("./code-editor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/i18n/navigation", () => {
  const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
  return {
    useRouter: () => router,
    Link: (props: { href: string; children: React.ReactNode }) => (
      <a href={props.href}>{props.children}</a>
    ),
  };
});

const daily: DailyChallengeResponse = {
  dayKey: "2026-08-27",
  challenge: {
    id: "ch-9",
    title: "Longest Substring",
    prompt: "## Task\nFind the longest substring without repeats.",
    topic: "sliding-window",
    difficulty: "medium",
    starterCode: "function longest(s: string) {}",
  },
};

const attemptResponse: CreateAttemptResponse = {
  attempt: {
    id: "at-1",
    userId: "u-1",
    challengeId: "ch-9",
    topic: "sliding-window",
    difficulty: "medium",
    outcome: "solved",
    hintsUsed: 0,
    timeSpentSeconds: 0,
    attemptedAt: "2026-08-27T12:00:00Z",
  },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ChallengeView", () => {
  beforeEach(() => {
    useChallengeSessionStore.getState().clear();
    useTimerStore.getState().reset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useChallengeSessionStore.getState().clear();
    useTimerStore.getState().reset();
  });

  it("renders the challenge with badges and a timer seeded from the difficulty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(daily, 200))),
    );
    renderWithIntl(<ChallengeView />);
    expect(
      await screen.findByRole("heading", { name: "Longest Substring" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sliding Window")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(await screen.findByText("35:00")).toBeInTheDocument();
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Task" })).toBeInTheDocument();
    expect(
      screen.getByText("Find the longest substring without repeats."),
    ).toBeInTheDocument();
  });

  it("shows an error state with retry when the fetch fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { error: { code: "internal_error", message: "boom" } },
          500,
        ),
      )
      .mockResolvedValueOnce(jsonResponse(daily, 200));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<ChallengeView />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(
      await screen.findByRole("heading", { name: "Longest Substring" }),
    ).toBeInTheDocument();
  });

  it("moves to an encouraging result state after recording an attempt", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/challenges/daily") {
        return Promise.resolve(jsonResponse(daily, 200));
      }
      return Promise.resolve(jsonResponse(attemptResponse, 201));
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<ChallengeView />);
    await screen.findByRole("heading", { name: "Longest Substring" });
    await user.click(screen.getByRole("radio", { name: /I solved it/ }));
    await user.click(screen.getByRole("button", { name: "Record attempt" }));
    expect(
      await screen.findByText("Solved. Great work."),
    ).toBeInTheDocument();
    expect(screen.getByText("What we recorded")).toBeInTheDocument();
    expect(screen.getByText("Solved")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Back to dashboard" })).toBeInTheDocument(),
    );
  });
});
