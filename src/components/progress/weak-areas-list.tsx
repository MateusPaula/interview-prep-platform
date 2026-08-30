"use client";

import { useTranslations } from "next-intl";
import type { TopicWeakness } from "@/core/domain";

interface WeakAreasListProps {
  weakAreas: TopicWeakness[];
}

function severityClass(score: number): string {
  if (score >= 60) {
    return "bg-hard";
  }
  if (score >= 30) {
    return "bg-medium";
  }
  return "bg-easy";
}

export function WeakAreasList({ weakAreas }: WeakAreasListProps) {
  const t = useTranslations("progress");
  const tCommon = useTranslations("common");

  return (
    <ol className="flex flex-col divide-y divide-line">
      {weakAreas.map((area, index) => (
        <li key={area.topic} className="flex items-center gap-4 py-3">
          <span className="w-5 shrink-0 text-center font-mono text-xs tabular-nums text-ink-muted">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-ink">
                {tCommon(`topics.${area.topic}`)}
              </span>
              <span className="shrink-0 text-xs text-ink-muted">
                {t("attempts", { count: area.attemptCount })}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${severityClass(area.score)}`}
                  style={{ width: `${area.score}%` }}
                />
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink-secondary">
                {t("weaknessScore", { score: area.score })}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
