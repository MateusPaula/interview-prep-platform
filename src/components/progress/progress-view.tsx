"use client";

import { useTranslations } from "next-intl";
import { useProgress } from "@/hooks/queries";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/data-states";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfidenceRadar } from "./confidence-radar";
import { ConfidenceTracker } from "./confidence-tracker";
import { WeakAreasList } from "./weak-areas-list";

function ProgressSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-line bg-surface p-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-5 h-64 w-full" />
      </div>
      <div className="rounded-lg border border-line bg-surface p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-5 h-10 w-full" />
        <Skeleton className="mt-2 h-10 w-full" />
        <Skeleton className="mt-2 h-10 w-full" />
      </div>
    </div>
  );
}

export function ProgressView() {
  const t = useTranslations("progress");
  const { data, error, isLoading, refetch } = useProgress();

  return (
    <div className="animate-fade-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">{t("subtitle")}</p>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        {isLoading && !data ? (
          <ProgressSkeleton />
        ) : error && !data ? (
          <ErrorState onRetry={refetch} />
        ) : data ? (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title={t("confidence")}
                subtitle={t("confidenceHint")}
              />
              <div className="p-5">
                {data.confidence.length === 0 ? (
                  <EmptyState
                    title={t("noConfidenceTitle")}
                    body={t("noConfidenceBody")}
                  />
                ) : (
                  <ConfidenceRadar comparisons={data.confidence} />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader
                title={t("weakAreas")}
                subtitle={t("weakAreasHint")}
              />
              <div className="p-5 pt-2">
                {data.weakAreas.length === 0 ? (
                  <div className="pt-3">
                    <EmptyState
                      title={t("noAttemptsTitle")}
                      body={t("noAttemptsBody")}
                      action={
                        <Link
                          href="/challenge"
                          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
                        >
                          {t("goToChallenge")}
                        </Link>
                      }
                    />
                  </div>
                ) : (
                  <WeakAreasList weakAreas={data.weakAreas} />
                )}
              </div>
            </Card>
          </div>
        ) : null}

        <Card>
          <CardHeader
            title={t("tracker.title")}
            subtitle={t("tracker.subtitle")}
          />
          <div className="px-5 py-2">
            <ConfidenceTracker onRated={refetch} />
          </div>
        </Card>
      </div>
    </div>
  );
}
