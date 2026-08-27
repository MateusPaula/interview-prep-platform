"use client";

import { useTranslations } from "next-intl";
import {
  formatClock,
  getTimerPressure,
  useTimerStore,
  type TimerPressure,
} from "@/stores/timer-store";

const pressureStyles: Record<TimerPressure, string> = {
  calm: "border-line text-ink",
  warning: "border-medium/50 text-medium",
  critical: "border-danger/60 text-danger",
};

export function TimerDisplay() {
  const t = useTranslations("challenge");
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  const totalSeconds = useTimerStore((state) => state.totalSeconds);
  const status = useTimerStore((state) => state.status);
  const start = useTimerStore((state) => state.start);
  const pause = useTimerStore((state) => state.pause);

  const pressure = getTimerPressure(remainingSeconds, totalSeconds);

  return (
    <div
      data-pressure={pressure}
      className={`flex items-center gap-3 rounded-lg border bg-surface px-3 py-1.5 transition-colors duration-300 ${pressureStyles[pressure]}`}
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-widest text-ink-muted">
          {t("timer")}
        </span>
        <span
          className={`font-mono text-lg font-semibold tabular-nums leading-tight ${
            pressure === "critical" && status === "running"
              ? "animate-pulse-critical"
              : ""
          }`}
        >
          {formatClock(remainingSeconds)}
        </span>
      </div>
      {status === "finished" ? (
        <span role="status" className="text-xs font-medium text-danger">
          {t("timeUp")}
        </span>
      ) : (
        <button
          type="button"
          onClick={status === "running" ? pause : start}
          className="rounded-md border border-line-strong bg-raised px-2.5 py-1.5 text-xs font-medium text-ink-secondary transition-colors duration-150 hover:bg-overlay hover:text-ink"
        >
          {status === "running"
            ? t("pause")
            : status === "paused"
              ? t("resume")
              : t("start")}
        </button>
      )}
    </div>
  );
}
