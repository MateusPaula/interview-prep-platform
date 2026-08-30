import { create } from "zustand";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerPressure = "calm" | "warning" | "critical";

interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
  configure: (totalSeconds: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const WARNING_RATIO = 0.25;
const CRITICAL_RATIO = 0.1;

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getTimerPressure(
  remainingSeconds: number,
  totalSeconds: number,
): TimerPressure {
  if (totalSeconds <= 0) {
    return "calm";
  }
  const ratio = remainingSeconds / totalSeconds;
  if (ratio <= CRITICAL_RATIO) {
    return "critical";
  }
  if (ratio <= WARNING_RATIO) {
    return "warning";
  }
  return "calm";
}

let intervalId: ReturnType<typeof setInterval> | null = null;

function clearTicker() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  totalSeconds: 0,
  remainingSeconds: 0,
  status: "idle",
  configure: (totalSeconds) => {
    clearTicker();
    set({ totalSeconds, remainingSeconds: totalSeconds, status: "idle" });
  },
  start: () => {
    const { status, remainingSeconds } = get();
    if (status === "running" || status === "finished" || remainingSeconds <= 0) {
      return;
    }
    set({ status: "running" });
    intervalId = setInterval(() => {
      const next = get().remainingSeconds - 1;
      if (next <= 0) {
        clearTicker();
        set({ remainingSeconds: 0, status: "finished" });
        return;
      }
      set({ remainingSeconds: next });
    }, 1000);
  },
  pause: () => {
    if (get().status !== "running") {
      return;
    }
    clearTicker();
    set({ status: "paused" });
  },
  reset: () => {
    clearTicker();
    set({ totalSeconds: 0, remainingSeconds: 0, status: "idle" });
  },
}));
