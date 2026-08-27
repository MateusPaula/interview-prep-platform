import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProgressSummaryResponse } from "@/core/contracts";
import { renderWithIntl } from "../testing/render-with-intl";
import { ProgressView } from "./progress-view";

vi.mock("@/i18n/navigation", () => {
  const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
  return {
    useRouter: () => router,
    Link: (props: { href: string; children: React.ReactNode }) => (
      <a href={props.href}>{props.children}</a>
    ),
  };
});

vi.mock("./confidence-radar", () => ({
  ConfidenceRadar: ({
    comparisons,
  }: {
    comparisons: { topic: string }[];
  }) => <div data-testid="radar" data-count={comparisons.length} />,
}));

const progress: ProgressSummaryResponse = {
  weakAreas: [
    { topic: "graphs", score: 70, attemptCount: 3 },
    { topic: "arrays", score: 10, attemptCount: 5 },
  ],
  confidence: [{ topic: "graphs", earliest: 2, latest: 4 }],
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
      if (url === "/api/progress") {
        return Promise.resolve(jsonResponse(progressBody, 200));
      }
      return Promise.resolve(jsonResponse({ ratings: [] }, 200));
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ProgressView", () => {
  it("renders the ranked weak areas with scores and attempts", async () => {
    stubFetch(progress);
    renderWithIntl(<ProgressView />);
    expect((await screen.findAllByText("Graphs")).length).toBeGreaterThan(0);
    expect(screen.getByText("Weakness 70")).toBeInTheDocument();
    expect(screen.getByText("3 attempts")).toBeInTheDocument();
    expect(screen.getByText("Weakness 10")).toBeInTheDocument();
    expect(screen.getByText("5 attempts")).toBeInTheDocument();
  });

  it("feeds the confidence comparisons to the radar", async () => {
    stubFetch(progress);
    renderWithIntl(<ProgressView />);
    const radar = await screen.findByTestId("radar");
    expect(radar).toHaveAttribute("data-count", "1");
  });

  it("shows empty states when there is no data yet", async () => {
    stubFetch(emptyProgress);
    renderWithIntl(<ProgressView />);
    expect(await screen.findByText("No attempts yet")).toBeInTheDocument();
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
    expect(screen.queryByTestId("radar")).not.toBeInTheDocument();
  });

  it("shows an error state with retry when the summary fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/progress") {
          return Promise.resolve(
            jsonResponse(
              { error: { code: "internal_error", message: "boom" } },
              500,
            ),
          );
        }
        return Promise.resolve(jsonResponse({ ratings: [] }, 200));
      }),
    );
    renderWithIntl(<ProgressView />);
    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
