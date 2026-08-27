"use client";

import { useTranslations } from "next-intl";
import type { BehavioralFeedback } from "@/core/domain";
import { STAR_CRITERIA } from "@/core/domain";

interface FeedbackDisplayProps {
  feedback: BehavioralFeedback;
}

const MAX_SCORE = 5;

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const t = useTranslations("behavioral");

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-5">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">
            {t("overallScore")}
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-ink">
              {feedback.overallScore}
            </span>
            <span className="text-sm text-ink-muted">{t("scoreUnit")}</span>
          </div>
        </div>
        <div className="ml-auto flex w-1/2 max-w-64 flex-col gap-2.5">
          {STAR_CRITERIA.map((criterion) => {
            const score = feedback.scores[criterion];
            return (
              <div key={criterion} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-ink-secondary">
                  {t(`criteria.${criterion}`)}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full rounded-full bg-accent-strong transition-[width] duration-500"
                    style={{ width: `${(score / MAX_SCORE) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-right font-mono text-xs tabular-nums text-ink">
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-easy">
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            {t("strengths")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {feedback.strengths.map((strength) => (
              <li
                key={strength}
                className="text-sm leading-relaxed text-ink-secondary"
              >
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-medium">
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            {t("improvements")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {feedback.improvements.map((improvement) => (
              <li
                key={improvement}
                className="text-sm leading-relaxed text-ink-secondary"
              >
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
