"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Attempt } from "@/core/domain";
import { submitAttempt } from "@/hooks/mutations";
import {
  deriveOutcome,
  useChallengeSessionStore,
  type OutcomeChoice,
} from "@/stores/challenge-session-store";
import { useTimerStore } from "@/stores/timer-store";

interface SubmitPanelProps {
  challengeId: string;
  onRecorded: (attempt: Attempt) => void;
}

export function SubmitPanel({ challengeId, onRecorded }: SubmitPanelProps) {
  const t = useTranslations("challenge.submitPanel");
  const hintsUsed = useChallengeSessionStore((state) => state.hints.length);
  const [choice, setChoice] = useState<OutcomeChoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function record() {
    if (!choice) {
      return;
    }
    setHasError(false);
    setIsSubmitting(true);
    try {
      const timer = useTimerStore.getState();
      const response = await submitAttempt({
        challengeId,
        outcome: deriveOutcome(choice, hintsUsed),
        hintsUsed,
        timeSpentSeconds: timer.totalSeconds - timer.remainingSeconds,
      });
      const pause = useTimerStore.getState().pause;
      pause();
      onRecorded(response.attempt);
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const options: {
    value: OutcomeChoice;
    label: string;
    help: string;
    accent: string;
  }[] = [
    {
      value: "solved",
      label: t("solved"),
      help: t("solvedHelp"),
      accent: "peer-aria-checked:border-easy/60",
    },
    {
      value: "gave_up",
      label: t("gaveUp"),
      help: t("gaveUpHelp"),
      accent: "peer-aria-checked:border-hard/60",
    },
  ];

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">{t("prompt")}</h3>
      <div
        role="radiogroup"
        aria-label={t("prompt")}
        className="mt-3 grid gap-2 sm:grid-cols-2"
      >
        {options.map((option) => {
          const selected = choice === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setChoice(option.value)}
              className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 ${
                selected
                  ? option.value === "solved"
                    ? "border-easy/60 bg-easy/10"
                    : "border-hard/60 bg-hard/10"
                  : "border-line-strong bg-raised hover:bg-overlay"
              }`}
            >
              <span className="text-sm font-medium text-ink">
                {option.label}
              </span>
              <span className="text-xs text-ink-muted">{option.help}</span>
            </button>
          );
        })}
      </div>

      {hasError ? (
        <p role="alert" className="mt-3 text-xs text-hard">
          {t("error")}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!choice || isSubmitting}
        onClick={record}
        className="mt-4 w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-45"
      >
        {isSubmitting ? t("recording") : t("record")}
      </button>
    </div>
  );
}
