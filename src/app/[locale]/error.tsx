"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { isStaleBuildError } from "./stale-build";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common.errorBoundary");

  useEffect(() => {
    console.error(error);
    if (isStaleBuildError(error)) {
      window.location.reload();
    }
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full border border-hard/40 bg-hard/10 text-hard"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          className="size-5"
        >
          <path d="M8 5v4" />
          <path d="M8 11.5v.01" />
          <path d="M7.1 2.3 1.6 12a1 1 0 0 0 .9 1.5h11a1 1 0 0 0 .9-1.5L8.9 2.3a1 1 0 0 0-1.8 0Z" />
        </svg>
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {t("title")}
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-ink-secondary">
        {t("body")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
      >
        {t("retry")}
      </button>
    </main>
  );
}
