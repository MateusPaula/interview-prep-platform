"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { ConfidenceLevel, Topic } from "@/core/domain";
import { CONFIDENCE_LEVELS, TOPICS } from "@/core/domain";
import { submitConfidenceRating } from "@/hooks/mutations";
import { useConfidenceRatings } from "@/hooks/queries";
import { ErrorState } from "@/components/ui/data-states";
import { Skeleton } from "@/components/ui/skeleton";

interface ConfidenceTrackerProps {
  onRated: () => void;
}

type LevelByTopic = Partial<Record<Topic, ConfidenceLevel>>;

function latestByTopic(
  ratings: { topic: Topic; level: ConfidenceLevel; ratedAt: string }[],
): LevelByTopic {
  const latest: Partial<Record<Topic, { level: ConfidenceLevel; at: string }>> =
    {};
  for (const rating of ratings) {
    const current = latest[rating.topic];
    if (!current || rating.ratedAt >= current.at) {
      latest[rating.topic] = { level: rating.level, at: rating.ratedAt };
    }
  }
  const result: LevelByTopic = {};
  for (const topic of TOPICS) {
    const entry = latest[topic];
    if (entry) {
      result[topic] = entry.level;
    }
  }
  return result;
}

export function ConfidenceTracker({ onRated }: ConfidenceTrackerProps) {
  const t = useTranslations("progress.tracker");
  const tCommon = useTranslations("common");
  const { data, error, isLoading, refetch } = useConfidenceRatings();
  const [overrides, setOverrides] = useState<LevelByTopic>({});
  const [savingTopic, setSavingTopic] = useState<Topic | null>(null);
  const [savedTopic, setSavedTopic] = useState<Topic | null>(null);
  const [failedTopic, setFailedTopic] = useState<Topic | null>(null);

  const fetchedLevels = useMemo(
    () => (data ? latestByTopic(data.ratings) : {}),
    [data],
  );
  const levels: LevelByTopic = { ...fetchedLevels, ...overrides };

  async function rate(topic: Topic, level: ConfidenceLevel) {
    setFailedTopic(null);
    setSavedTopic(null);
    setSavingTopic(topic);
    try {
      await submitConfidenceRating({ topic, level });
      setOverrides((current) => ({ ...current, [topic]: level }));
      setSavedTopic(topic);
      onRated();
    } catch {
      setFailedTopic(topic);
    } finally {
      setSavingTopic(null);
    }
  }

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-3">
        {TOPICS.slice(0, 6).map((topic) => (
          <Skeleton key={topic} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {TOPICS.map((topic) => {
        const topicLabel = tCommon(`topics.${topic}`);
        const selected = levels[topic];
        return (
          <div
            key={topic}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5"
          >
            <span className="text-sm text-ink-secondary">{topicLabel}</span>
            <div className="flex items-center gap-2">
              {savingTopic === topic ? (
                <span className="text-xs text-ink-muted">{t("saving")}</span>
              ) : savedTopic === topic ? (
                <span className="text-xs font-medium text-easy">
                  {t("saved")}
                </span>
              ) : failedTopic === topic ? (
                <span role="alert" className="text-xs text-hard">
                  {t("error")}
                </span>
              ) : null}
              <div
                role="radiogroup"
                aria-label={topicLabel}
                className="inline-flex rounded-lg border border-line bg-raised p-0.5"
              >
                {CONFIDENCE_LEVELS.map((level) => {
                  const active = selected === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={t("levelLabel", { topic: topicLabel, level })}
                      disabled={savingTopic !== null}
                      onClick={() => rate(topic, level)}
                      className={`size-7 rounded-md font-mono text-xs tabular-nums transition-colors duration-150 disabled:opacity-60 ${
                        active
                          ? "bg-accent font-semibold text-white"
                          : "text-ink-muted hover:bg-overlay hover:text-ink"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
