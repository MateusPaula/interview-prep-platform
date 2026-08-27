import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatClock, getTimerPressure, useTimerStore } from "./timer-store";

describe("timer store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useTimerStore.getState().reset();
  });

  afterEach(() => {
    useTimerStore.getState().reset();
    vi.useRealTimers();
  });

  it("configures the countdown from a duration", () => {
    useTimerStore.getState().configure(1200);
    const state = useTimerStore.getState();
    expect(state.totalSeconds).toBe(1200);
    expect(state.remainingSeconds).toBe(1200);
    expect(state.status).toBe("idle");
  });

  it("counts down once per second while running", () => {
    useTimerStore.getState().configure(100);
    useTimerStore.getState().start();
    vi.advanceTimersByTime(3000);
    expect(useTimerStore.getState().remainingSeconds).toBe(97);
    expect(useTimerStore.getState().status).toBe("running");
  });

  it("pauses and resumes without losing time", () => {
    useTimerStore.getState().configure(100);
    useTimerStore.getState().start();
    vi.advanceTimersByTime(10_000);
    useTimerStore.getState().pause();
    vi.advanceTimersByTime(30_000);
    expect(useTimerStore.getState().remainingSeconds).toBe(90);
    expect(useTimerStore.getState().status).toBe("paused");
    useTimerStore.getState().start();
    vi.advanceTimersByTime(5000);
    expect(useTimerStore.getState().remainingSeconds).toBe(85);
  });

  it("does not double-tick when start is called twice", () => {
    useTimerStore.getState().configure(100);
    useTimerStore.getState().start();
    useTimerStore.getState().start();
    vi.advanceTimersByTime(4000);
    expect(useTimerStore.getState().remainingSeconds).toBe(96);
  });

  it("finishes at zero and stops ticking", () => {
    useTimerStore.getState().configure(3);
    useTimerStore.getState().start();
    vi.advanceTimersByTime(10_000);
    const state = useTimerStore.getState();
    expect(state.remainingSeconds).toBe(0);
    expect(state.status).toBe("finished");
  });

  it("reports elapsed seconds for the attempt submission", () => {
    useTimerStore.getState().configure(1200);
    useTimerStore.getState().start();
    vi.advanceTimersByTime(45_000);
    const state = useTimerStore.getState();
    expect(state.totalSeconds - state.remainingSeconds).toBe(45);
  });

  it("reset returns to idle and clears the interval", () => {
    useTimerStore.getState().configure(100);
    useTimerStore.getState().start();
    vi.advanceTimersByTime(2000);
    useTimerStore.getState().reset();
    vi.advanceTimersByTime(5000);
    const state = useTimerStore.getState();
    expect(state.status).toBe("idle");
    expect(state.remainingSeconds).toBe(0);
    expect(state.totalSeconds).toBe(0);
  });

  it("configure while running stops the previous countdown", () => {
    useTimerStore.getState().configure(100);
    useTimerStore.getState().start();
    vi.advanceTimersByTime(2000);
    useTimerStore.getState().configure(50);
    vi.advanceTimersByTime(5000);
    expect(useTimerStore.getState().remainingSeconds).toBe(50);
    expect(useTimerStore.getState().status).toBe("idle");
  });
});

describe("formatClock", () => {
  it("pads minutes and seconds to two digits", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(59)).toBe("00:59");
    expect(formatClock(61)).toBe("01:01");
    expect(formatClock(1200)).toBe("20:00");
    expect(formatClock(3000)).toBe("50:00");
  });
});

describe("getTimerPressure", () => {
  it("is calm above a quarter remaining", () => {
    expect(getTimerPressure(100, 100)).toBe("calm");
    expect(getTimerPressure(26, 100)).toBe("calm");
  });

  it("warns at or below a quarter remaining", () => {
    expect(getTimerPressure(25, 100)).toBe("warning");
    expect(getTimerPressure(11, 100)).toBe("warning");
  });

  it("is critical at or below a tenth remaining", () => {
    expect(getTimerPressure(10, 100)).toBe("critical");
    expect(getTimerPressure(0, 100)).toBe("critical");
  });

  it("is calm when nothing is configured", () => {
    expect(getTimerPressure(0, 0)).toBe("calm");
  });
});
