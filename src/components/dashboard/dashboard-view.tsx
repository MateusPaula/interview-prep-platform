"use client";

import { useTranslations } from "next-intl";
import { TIMER_DURATION_SECONDS } from "@/core/domain";
import { useDailyChallenge, useProgress } from "@/hooks/queries";
import { Link } from "@/i18n/navigation";
import { DifficultyBadge, TopicBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/data-states";
import { CardSkeleton } from "@/components/ui/skeleton";

const TOP_WEAK_AREAS = 3;

function severityClass(score: number): string {
  if (score >= 60) {
    return "bg-hard";
  }
  if (score >= 30) {
    return "bg-medium";
  }
  return "bg-easy";
}

function ChallengeCard() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { data, error, isLoading, refetch } = useDailyChallenge();

  if (isLoading) {
    return <CardSkeleton />;
  }
  if (error || !data) {
    return <ErrorState onRetry={refetch} />;
  }

  const { challenge } = data;
  const minutes = Math.round(TIMER_DURATION_SECONDS[challenge.difficulty] / 60);

  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
      />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-ink">
            {t("todaysChallenge")}
          </span>
          <span className="rounded-full border border-line-strong bg-raised px-2.5 py-0.5 font-mono text-xs tabular-nums text-ink-secondary">
            {t("timeBudget")}: {tCommon("minutes", { count: minutes })}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">
          {challenge.title}
        </h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <TopicBadge label={tCommon(`topics.${challenge.topic}`)} />
          <DifficultyBadge
            difficulty={challenge.difficulty}
            label={tCommon(`difficulty.${challenge.difficulty}`)}
          />
        </div>
        <Link
          href="/challenge"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
        >
          {t("startChallenge")}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
            aria-hidden
          >
            <path d="M2.5 8h11" />
            <path d="m9.5 4 4 4-4 4" />
          </svg>
        </Link>
      </div>
    </Card>
  );
}

function ProgressCards() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { data, error, isLoading, refetch } = useProgress();

  if (isLoading) {
    return (
      <>
        <CardSkeleton />
        <CardSkeleton />
      </>
    );
  }
  if (error || !data) {
    return <ErrorState onRetry={refetch} />;
  }

  const topWeakAreas = data.weakAreas.slice(0, TOP_WEAK_AREAS);

  return (
    <>
      <Card>
        <CardHeader title={t("weakAreas")} subtitle={t("weakAreasHint")} />
        <div className="p-5 pt-3">
          {topWeakAreas.length === 0 ? (
            <p className="py-4 text-sm text-ink-muted">
              {t("weakAreasEmpty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {topWeakAreas.map((area) => (
                <li key={area.topic} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm text-ink-secondary">
                    {tCommon(`topics.${area.topic}`)}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                    <div
                      className={`h-full rounded-full ${severityClass(area.score)}`}
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-ink-secondary">
                    {area.score}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/progress"
            className="mt-4 inline-block text-sm font-medium text-accent-ink transition-colors duration-150 hover:text-accent-strong"
          >
            {t("viewProgress")}
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader title={t("confidenceTitle")} />
        <div className="p-5 pt-3">
          {data.confidence.length === 0 ? (
            <p className="py-4 text-sm text-ink-muted">
              {t("confidenceEmpty")}
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-secondary">
                {t("confidenceTrend", { count: data.confidence.length })}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {data.confidence.slice(0, 4).map((comparison) => (
                  <li
                    key={comparison.topic}
                    className="flex items-center gap-3"
                  >
                    <span className="w-32 shrink-0 truncate text-sm text-ink-secondary">
                      {tCommon(`topics.${comparison.topic}`)}
                    </span>
                    <div className="flex flex-1 items-center gap-1">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <span
                          key={step}
                          className={`h-1.5 flex-1 rounded-full ${
                            step <= comparison.latest
                              ? "bg-series-latest"
                              : "bg-raised"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`w-10 shrink-0 text-right font-mono text-xs tabular-nums ${
                        comparison.latest > comparison.earliest
                          ? "text-easy"
                          : comparison.latest < comparison.earliest
                            ? "text-hard"
                            : "text-ink-muted"
                      }`}
                    >
                      {comparison.earliest}→{comparison.latest}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Link
            href="/progress"
            className="mt-4 inline-block text-sm font-medium text-accent-ink transition-colors duration-150 hover:text-accent-strong"
          >
            {t("confidenceCta")}
          </Link>
        </div>
      </Card>
    </>
  );
}

function BehavioralCard() {
  const t = useTranslations("dashboard");

  return (
    <Card>
      <div className="flex h-full flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {t("behavioralTitle")}
        </span>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          {t("behavioralBody")}
        </p>
        <Link
          href="/behavioral"
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg border border-line-strong bg-raised px-4 py-2 pt-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-overlay"
        >
          {t("behavioralCta")}
        </Link>
      </div>
    </Card>
  );
}

export function DashboardView() {
  const t = useTranslations("dashboard");

  return (
    <div className="animate-fade-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">{t("subtitle")}</p>
      </header>

      <div className="mt-6 grid items-stretch gap-6 md:grid-cols-2">
        <ChallengeCard />
        <BehavioralCard />
        <ProgressCards />
      </div>
    </div>
  );
}
