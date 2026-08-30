"use client";

import { useTranslations } from "next-intl";
import type { Attempt, AttemptOutcome } from "@/core/domain";
import { Link } from "@/i18n/navigation";
import { formatClock } from "@/stores/timer-store";

interface AttemptResultProps {
  attempt: Attempt;
}

const outcomeStyles: Record<AttemptOutcome, string> = {
  solved: "border-easy/40 bg-easy/10 text-easy",
  solved_with_hints: "border-medium/40 bg-medium/10 text-medium",
  gave_up: "border-line-strong bg-raised text-ink-secondary",
};

const titleKeys: Record<
  AttemptOutcome,
  "solvedTitle" | "solvedWithHintsTitle" | "gaveUpTitle"
> = {
  solved: "solvedTitle",
  solved_with_hints: "solvedWithHintsTitle",
  gave_up: "gaveUpTitle",
};

const bodyKeys: Record<
  AttemptOutcome,
  "solvedBody" | "solvedWithHintsBody" | "gaveUpBody"
> = {
  solved: "solvedBody",
  solved_with_hints: "solvedWithHintsBody",
  gave_up: "gaveUpBody",
};

export function AttemptResult({ attempt }: AttemptResultProps) {
  const t = useTranslations("challenge.result");

  return (
    <div className="mx-auto max-w-lg animate-fade-up py-8">
      <div
        className={`mx-auto flex size-14 items-center justify-center rounded-full border ${outcomeStyles[attempt.outcome]}`}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
          aria-hidden
        >
          {attempt.outcome === "gave_up" ? (
            <path d="M3 13V3.5A1.5 1.5 0 0 1 4.5 2H12l-2 3 2 3H4.5" />
          ) : (
            <path d="m3.5 8.5 3 3 6-7" />
          )}
        </svg>
      </div>

      <h2 className="mt-5 text-center text-xl font-semibold tracking-tight text-ink">
        {t(titleKeys[attempt.outcome])}
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-ink-secondary">
        {t(bodyKeys[attempt.outcome])}
      </p>

      <div className="mt-8 rounded-lg border border-line bg-surface p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {t("recordedHeading")}
        </h3>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-raised px-2 py-3">
            <dt className="text-[11px] text-ink-muted">{t("outcome")}</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {t(`outcomes.${attempt.outcome}`)}
            </dd>
          </div>
          <div className="rounded-lg bg-raised px-2 py-3">
            <dt className="text-[11px] text-ink-muted">{t("timeSpent")}</dt>
            <dd className="mt-1 font-mono text-sm font-medium tabular-nums text-ink">
              {formatClock(attempt.timeSpentSeconds)}
            </dd>
          </div>
          <div className="rounded-lg bg-raised px-2 py-3">
            <dt className="text-[11px] text-ink-muted">{t("hintsUsed")}</dt>
            <dd className="mt-1 font-mono text-sm font-medium tabular-nums text-ink">
              {attempt.hintsUsed}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
        >
          {t("backToDashboard")}
        </Link>
        <Link
          href="/progress"
          className="rounded-lg border border-line-strong bg-raised px-4 py-2 text-sm font-medium text-ink-secondary transition-colors duration-150 hover:bg-overlay hover:text-ink"
        >
          {t("viewProgress")}
        </Link>
      </div>
    </div>
  );
}
