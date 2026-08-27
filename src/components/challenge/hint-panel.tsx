"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { HINT_LEVELS, type HintLevel } from "@/core/domain";
import { isApiError } from "@/hooks/api-client";
import { requestHint } from "@/hooks/mutations";
import {
  isHintUnlocked,
  useChallengeSessionStore,
} from "@/stores/challenge-session-store";

interface HintPanelProps {
  challengeId: string;
}

const levelKeys: Record<HintLevel, "level1" | "level2" | "level3"> = {
  1: "level1",
  2: "level2",
  3: "level3",
};

export function HintPanel({ challengeId }: HintPanelProps) {
  const t = useTranslations("challenge.hints");
  const hints = useChallengeSessionStore((state) => state.hints);
  const addHint = useChallengeSessionStore((state) => state.addHint);
  const [loadingLevel, setLoadingLevel] = useState<HintLevel | null>(null);
  const [error, setError] = useState<"ai" | "generic" | null>(null);

  async function reveal(level: HintLevel) {
    setError(null);
    setLoadingLevel(level);
    try {
      const code = useChallengeSessionStore.getState().code;
      const response = await requestHint({
        challengeId,
        userCode: code,
        level,
      });
      addHint({ level: response.level, hint: response.hint });
    } catch (failure: unknown) {
      if (isApiError(failure) && failure.code === "ai_unavailable") {
        setError("ai");
      } else {
        setError("generic");
      }
    } finally {
      setLoadingLevel(null);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">{t("title")}</h3>
        <span className="rounded-full border border-line-strong bg-raised px-2 py-0.5 font-mono text-xs tabular-nums text-ink-secondary">
          {t("used", { used: hints.length, total: HINT_LEVELS.length })}
        </span>
      </header>

      <ol className="flex flex-col gap-3 p-4">
        {HINT_LEVELS.map((level) => {
          const used = hints.find((hint) => hint.level === level);
          const unlocked = isHintUnlocked(hints, level);
          const isLoading = loadingLevel === level;
          return (
            <li key={level} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                    used
                      ? "border-accent bg-accent-soft text-accent-ink"
                      : "border-line-strong text-ink-muted"
                  }`}
                >
                  {level}
                </span>
                <span
                  className={`text-xs font-medium uppercase tracking-wider ${
                    used ? "text-accent-ink" : "text-ink-muted"
                  }`}
                >
                  {t(levelKeys[level])}
                </span>
              </div>
              {used ? (
                <p className="animate-fade-up rounded-lg border border-accent/20 bg-accent-soft px-3 py-2.5 text-sm leading-relaxed text-ink">
                  {used.hint}
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!unlocked || loadingLevel !== null}
                    onClick={() => reveal(level)}
                    className="rounded-lg border border-line-strong bg-raised px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors duration-150 hover:bg-overlay hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                  >
                    {isLoading ? t("loading") : t("reveal", { level })}
                  </button>
                  {!unlocked ? (
                    <span className="text-xs text-ink-muted">
                      {t("locked", { previous: level - 1 })}
                    </span>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {error ? (
        <p
          role="alert"
          className="mx-4 mb-4 rounded-lg border border-medium/30 bg-medium/10 px-3 py-2 text-xs leading-relaxed text-medium"
        >
          {error === "ai" ? t("aiUnavailable") : t("genericError")}
        </p>
      ) : null}
    </div>
  );
}
