"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { BehavioralFeedback } from "@/core/domain";
import { isApiError } from "@/hooks/api-client";
import { requestBehavioralFeedback } from "@/hooks/mutations";
import { useBehavioralQuestion } from "@/hooks/queries";
import { ErrorState } from "@/components/ui/data-states";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackDisplay } from "./feedback-display";

const MIN_ANSWER_LENGTH = 120;

function QuestionSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-6 h-36 w-full" />
    </div>
  );
}

export function BehavioralView() {
  const t = useTranslations("behavioral");
  const { data, error, isLoading, refetch } = useBehavioralQuestion();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<BehavioralFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<"ai" | "generic" | null>(
    null,
  );

  const question = data?.question ?? null;
  const remaining = MIN_ANSWER_LENGTH - answer.trim().length;
  const ready = remaining <= 0;

  async function getFeedback() {
    if (!question || !ready) {
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await requestBehavioralFeedback({
        questionId: question.id,
        answer,
      });
      setFeedback(response.feedback);
    } catch (failure: unknown) {
      if (isApiError(failure) && failure.code === "ai_unavailable") {
        setSubmitError("ai");
      } else {
        setSubmitError("generic");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function nextQuestion() {
    setAnswer("");
    setFeedback(null);
    setSubmitError(null);
    refetch();
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">{t("subtitle")}</p>
      </header>

      <div className="mt-6 flex flex-col gap-5">
        {isLoading ? (
          <QuestionSkeleton />
        ) : error || !question ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <>
            <div className="rounded-lg border border-line bg-surface p-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                <span className="size-1.5 rounded-full bg-current" aria-hidden />
                {t(`categories.${question.category}`)}
              </span>
              <p className="mt-3 text-lg font-medium leading-relaxed text-ink">
                {question.question}
              </p>
            </div>

            {feedback ? (
              <>
                <FeedbackDisplay feedback={feedback} />
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
                >
                  {t("nextQuestion")}
                </button>
              </>
            ) : (
              <div className="rounded-lg border border-line bg-surface p-5">
                <label
                  htmlFor="behavioral-answer"
                  className="text-sm font-medium text-ink"
                >
                  {t("yourAnswer")}
                </label>
                <textarea
                  id="behavioral-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={t("answerPlaceholder")}
                  rows={8}
                  className="mt-2 w-full resize-y rounded-lg border border-line-strong bg-raised px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-accent"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`text-xs ${ready ? "text-easy" : "text-ink-muted"}`}
                  >
                    {ready
                      ? t("lengthReady")
                      : t("minLengthGuidance", { remaining })}
                  </span>
                  <button
                    type="button"
                    disabled={!ready || isSubmitting}
                    onClick={getFeedback}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-45"
                  >
                    {isSubmitting ? t("gettingFeedback") : t("getFeedback")}
                  </button>
                </div>
                {submitError ? (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-medium/30 bg-medium/10 px-3 py-2 text-xs leading-relaxed text-medium"
                  >
                    {submitError === "ai"
                      ? t("aiUnavailable")
                      : t("feedbackError")}
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
