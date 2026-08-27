import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimerStore } from "@/stores/timer-store";
import { renderWithIntl } from "../testing/render-with-intl";
import { TimerDisplay } from "./timer-display";

describe("TimerDisplay", () => {
  beforeEach(() => {
    useTimerStore.getState().reset();
  });

  afterEach(() => {
    useTimerStore.getState().reset();
  });

  it("formats the remaining time as mm:ss", () => {
    useTimerStore.getState().configure(1200);
    renderWithIntl(<TimerDisplay />);
    expect(screen.getByText("20:00")).toBeInTheDocument();
  });

  it("starts and pauses the countdown", () => {
    vi.useFakeTimers();
    try {
      useTimerStore.getState().configure(1200);
      renderWithIntl(<TimerDisplay />);
      fireEvent.click(screen.getByRole("button", { name: "Start timer" }));
      act(() => {
        vi.advanceTimersByTime(61_000);
      });
      expect(screen.getByText("18:59")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Pause" }));
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(screen.getByText("18:59")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Resume" }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("exposes the pressure state for styling", () => {
    useTimerStore.getState().configure(100);
    const { container } = renderWithIntl(<TimerDisplay />);
    expect(
      container.querySelector('[data-pressure="calm"]'),
    ).toBeInTheDocument();
  });

  it("turns critical near the end and announces time up at zero", () => {
    vi.useFakeTimers();
    try {
      useTimerStore.getState().configure(100);
      useTimerStore.getState().start();
      const { container } = renderWithIntl(<TimerDisplay />);
      act(() => {
        vi.advanceTimersByTime(91_000);
      });
      expect(
        container.querySelector('[data-pressure="critical"]'),
      ).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(20_000);
      });
      expect(
        screen.getByText("Time is up — wrap up your attempt"),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
