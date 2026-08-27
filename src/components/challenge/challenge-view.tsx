"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TIMER_DURATION_SECONDS, type Attempt } from "@/core/domain";
import { useDailyChallenge } from "@/hooks/queries";
import { useChallengeSessionStore } from "@/stores/challenge-session-store";
import { useTimerStore } from "@/stores/timer-store";
import { DifficultyBadge, TopicBadge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/data-states";
import { Skeleton } from "@/components/ui/skeleton";
import { AttemptResult } from "./attempt-result";
import { CodeEditor } from "./code-editor";
import { HintPanel } from "./hint-panel";
import { PromptMarkdown } from "./prompt-markdown";
import { SubmitPanel } from "./submit-panel";
import { TimerDisplay } from "./timer-display";

function ChallengeSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export function ChallengeView() {
  const tCommon = useTranslations("common");
  const tChallenge = useTranslations("challenge");
  const { data, error, isLoading, refetch } = useDailyChallenge();
  const [recorded, setRecorded] = useState<Attempt | null>(null);

  const challenge = data?.challenge ?? null;

  useEffect(() => {
    if (!challenge) {
      return;
    }
    const session = useChallengeSessionStore.getState();
    if (session.challengeId !== challenge.id) {
      session.initialize(challenge);
      useTimerStore
        .getState()
        .configure(TIMER_DURATION_SECONDS[challenge.difficulty]);
    }
  }, [challenge]);

  if (isLoading) {
    return <ChallengeSkeleton />;
  }

  if (error || !challenge) {
    return <ErrorState onRetry={refetch} />;
  }

  if (recorded) {
    return <AttemptResult attempt={recorded} />;
  }

  return (
    <div className="animate-fade-up">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
            {tChallenge("title")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {challenge.title}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <TopicBadge label={tCommon(`topics.${challenge.topic}`)} />
            <DifficultyBadge
              difficulty={challenge.difficulty}
              label={tCommon(`difficulty.${challenge.difficulty}`)}
            />
          </div>
        </div>
        <TimerDisplay />
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              {tChallenge("problemStatement")}
            </h2>
            <div className="mt-3">
              <PromptMarkdown text={challenge.prompt} />
            </div>
          </div>
          <HintPanel challengeId={challenge.id} />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <div className="h-[26rem]">
            <CodeEditor />
          </div>
          <SubmitPanel challengeId={challenge.id} onRecorded={setRecorded} />
        </div>
      </div>
    </div>
  );
}
