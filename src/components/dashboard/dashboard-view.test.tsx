import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  DailyChallengeResponse,
  ProgressSummaryResponse,
} from "@/core/contracts";
import { renderWithIntl } from "../testing/render-with-intl";
import { DashboardView } from "./dashboard-view";

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
    id: "ch-1",
    title: "Two Sum",
    prompt: "Find the pair.",
    topic: "arrays",
    difficulty: "hard",
    starterCode: "function twoSum() {}",
  },
};

const progress: ProgressSummaryResponse = {
  weakAreas: [
    { topic: "graphs", score: 70, attemptCount: 3 },
    { topic: "trees", score: 55, attemptCount: 2 },
    { topic: "strings", score: 40, attemptCount: 4 },
    { topic: "arrays", score: 10, attemptCount: 5 },
  ],
  confidence: [
    { topic: "graphs", earliest: 2, latest: 4 },
    { topic: "arrays", earliest: 3, latest: 3 },
  ],
};

const emptyProgress: ProgressSummaryResponse = {
  weakAreas: [],
  confidence: [],
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch(progressBody: ProgressSummaryResponse) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/challenges/daily") {
        return Promise.resolve(jsonResponse(daily, 200));
      }
      return Promise.resolve(jsonResponse(progressBody, 200));
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DashboardView", () => {
  it("shows the daily challenge with its time budget and CTA", async () => {
    stubFetch(progress);
    renderWithIntl(<DashboardView />);
    expect(await screen.findByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getAllByText("Arrays").length).toBeGreaterThan(0);
    expect(screen.getByText(/50 min/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Start challenge" }),
    ).toHaveAttribute("href", "/challenge");
  });

  it("summarizes the top three weak areas", async () => {
    stubFetch(progress);
    renderWithIntl(<DashboardView />);
    expect((await screen.findAllByText("Graphs")).length).toBeGreaterThan(0);
    expect(screen.getByText("Trees")).toBeInTheDocument();
    expect(screen.getByText("Strings")).toBeInTheDocument();
    expect(screen.queryByText("Weakness 10")).not.toBeInTheDocument();
  });

  it("shows the confidence snapshot count", async () => {
    stubFetch(progress);
    renderWithIntl(<DashboardView />);
    expect(await screen.findByText("2 topics tracked")).toBeInTheDocument();
  });

  it("shows empty states when there is no history", async () => {
    stubFetch(emptyProgress);
    renderWithIntl(<DashboardView />);
    expect(
      await screen.findByText(
        "No attempts yet. Weak areas appear after your first challenges.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You have not rated your confidence yet."),
    ).toBeInTheDocument();
  });
});
