import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  BehavioralFeedbackResponse,
  BehavioralQuestionResponse,
} from "@/core/contracts";
import { renderWithIntl } from "../testing/render-with-intl";
import { BehavioralView } from "./behavioral-view";

vi.mock("@/i18n/navigation", () => {
  const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
  return { useRouter: () => router };
});

const question: BehavioralQuestionResponse = {
  question: {
    id: "bq-1",
    category: "conflict",
    question: "Tell me about a disagreement with a teammate.",
  },
};

const secondQuestion: BehavioralQuestionResponse = {
  question: {
    id: "bq-2",
    category: "growth",
    question: "Tell me about a skill you recently learned.",
  },
};

const feedback: BehavioralFeedbackResponse = {
  feedback: {
    scores: { situation: 4, task: 3, action: 5, result: 2 },
    overallScore: 3.5,
    strengths: ["Concrete example", "Clear ownership"],
    improvements: ["Quantify the result"],
  },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const longAnswer = "S".repeat(140);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BehavioralView", () => {
  it("shows the question with its category badge", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(() => Promise.resolve(jsonResponse(question, 200))),
    );
    renderWithIntl(<BehavioralView />);
    expect(
      await screen.findByText("Tell me about a disagreement with a teammate."),
    ).toBeInTheDocument();
    expect(screen.getByText("Conflict")).toBeInTheDocument();
  });

  it("keeps feedback disabled until the minimum length is reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(() => Promise.resolve(jsonResponse(question, 200))),
    );
    const user = userEvent.setup();
    renderWithIntl(<BehavioralView />);
    await screen.findByText("Tell me about a disagreement with a teammate.");
    const button = screen.getByRole("button", { name: "Get feedback" });
    expect(button).toBeDisabled();
    const textarea = screen.getByLabelText("Your answer");
    await user.type(textarea, "Too short");
    expect(button).toBeDisabled();
    expect(screen.getByText(/more characters for meaningful feedback/)).toBeInTheDocument();
    await user.click(textarea);
    await user.paste(longAnswer);
    expect(
      screen.getByText("Good length — ready for feedback"),
    ).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("submits the answer and renders STAR feedback", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/behavioral/question") {
        return Promise.resolve(jsonResponse(question, 200));
      }
      return Promise.resolve(jsonResponse(feedback, 200));
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<BehavioralView />);
    await screen.findByText("Tell me about a disagreement with a teammate.");
    await user.click(screen.getByLabelText("Your answer"));
    await user.paste(longAnswer);
    await user.click(screen.getByRole("button", { name: "Get feedback" }));
    expect(await screen.findByText("3.5")).toBeInTheDocument();
    expect(screen.getByText("Situation")).toBeInTheDocument();
    expect(screen.getByText("Concrete example")).toBeInTheDocument();
    expect(screen.getByText("Quantify the result")).toBeInTheDocument();
    const feedbackBody = JSON.parse(
      (fetchMock.mock.calls.find(
        (call) => String(call[0]) === "/api/behavioral/feedback",
      )?.[1] as RequestInit).body as string,
    );
    expect(feedbackBody).toEqual({ questionId: "bq-1", answer: longAnswer });
  });

  it("moves to the next question after feedback", async () => {
    let questionCalls = 0;
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/behavioral/question") {
        questionCalls += 1;
        return Promise.resolve(
          jsonResponse(questionCalls === 1 ? question : secondQuestion, 200),
        );
      }
      return Promise.resolve(jsonResponse(feedback, 200));
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<BehavioralView />);
    await screen.findByText("Tell me about a disagreement with a teammate.");
    await user.click(screen.getByLabelText("Your answer"));
    await user.paste(longAnswer);
    await user.click(screen.getByRole("button", { name: "Get feedback" }));
    await screen.findByText("3.5");
    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(
      await screen.findByText("Tell me about a skill you recently learned."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your answer")).toHaveValue("");
  });

  it("preserves the answer on ai_unavailable and offers retry", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/behavioral/question") {
        return Promise.resolve(jsonResponse(question, 200));
      }
      return Promise.resolve(
        jsonResponse(
          { error: { code: "ai_unavailable", message: "offline" } },
          502,
        ),
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithIntl(<BehavioralView />);
    await screen.findByText("Tell me about a disagreement with a teammate.");
    await user.click(screen.getByLabelText("Your answer"));
    await user.paste(longAnswer);
    await user.click(screen.getByRole("button", { name: "Get feedback" }));
    expect(
      await screen.findByText(
        "The AI mentor is unavailable right now. Your answer is preserved — try again in a moment.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your answer")).toHaveValue(longAnswer);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Get feedback" }),
      ).toBeEnabled(),
    );
  });
});
