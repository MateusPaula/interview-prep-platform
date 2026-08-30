import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ConfidenceRatingsResponse,
  CreateConfidenceRatingResponse,
} from "@/core/contracts";
import { TOPICS } from "@/core/domain";
import { renderWithIntl } from "../testing/render-with-intl";
import { ConfidenceTracker } from "./confidence-tracker";

vi.mock("@/i18n/navigation", () => {
  const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
  return { useRouter: () => router };
});

const ratings: ConfidenceRatingsResponse = {
  ratings: [
    {
      id: "r-1",
      userId: "u-1",
      topic: "arrays",
      level: 2,
      ratedAt: "2026-08-01T10:00:00Z",
    },
    {
      id: "r-2",
      userId: "u-1",
      topic: "arrays",
      level: 4,
      ratedAt: "2026-08-20T10:00:00Z",
    },
  ],
};

const created: CreateConfidenceRatingResponse = {
  rating: {
    id: "r-3",
    userId: "u-1",
    topic: "graphs",
    level: 3,
    ratedAt: "2026-08-27T10:00:00Z",
  },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConfidenceTracker", () => {
  it("renders a five-level control for every topic", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(jsonResponse({ ratings: [] }, 200)),
        ),
    );
    renderWithIntl(<ConfidenceTracker onRated={vi.fn()} />);
    expect(await screen.findByText("Arrays")).toBeInTheDocument();
    expect(screen.getByText("Dynamic Programming")).toBeInTheDocument();
    const arrayButtons = TOPICS.flatMap(() => []);
    expect(arrayButtons).toHaveLength(0);
    expect(
      screen.getByRole("radio", { name: "Rate Arrays as 5 of 5" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(TOPICS.length * 5);
  });

  it("preselects the latest rating per topic", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(() => Promise.resolve(jsonResponse(ratings, 200))),
    );
    renderWithIntl(<ConfidenceTracker onRated={vi.fn()} />);
    await screen.findByText("Arrays");
    expect(
      screen.getByRole("radio", { name: "Rate Arrays as 4 of 5" }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Rate Arrays as 2 of 5" }),
    ).not.toBeChecked();
  });

  it("posts a new rating and notifies the parent", async () => {
    const fetchMock = vi.fn().mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return Promise.resolve(jsonResponse(created, 201));
        }
        return Promise.resolve(jsonResponse({ ratings: [] }, 200));
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const onRated = vi.fn();
    const user = userEvent.setup();
    renderWithIntl(<ConfidenceTracker onRated={onRated} />);
    await screen.findByText("Graphs");
    await user.click(
      screen.getByRole("radio", { name: "Rate Graphs as 3 of 5" }),
    );
    await waitFor(() => expect(onRated).toHaveBeenCalled());
    const postCall = fetchMock.mock.calls.find(
      (call) => (call[1] as RequestInit | undefined)?.method === "POST",
    );
    expect(JSON.parse((postCall?.[1] as RequestInit).body as string)).toEqual({
      topic: "graphs",
      level: 3,
    });
    expect(
      screen.getByRole("radio", { name: "Rate Graphs as 3 of 5" }),
    ).toBeChecked();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("shows an error when saving fails", async () => {
    const fetchMock = vi.fn().mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return Promise.resolve(
            jsonResponse(
              { error: { code: "internal_error", message: "boom" } },
              500,
            ),
          );
        }
        return Promise.resolve(jsonResponse({ ratings: [] }, 200));
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<ConfidenceTracker onRated={vi.fn()} />);
    await screen.findByText("Graphs");
    await user.click(
      screen.getByRole("radio", { name: "Rate Graphs as 3 of 5" }),
    );
    expect(
      await screen.findByText("Could not save that rating. Try again."),
    ).toBeInTheDocument();
  });
});
