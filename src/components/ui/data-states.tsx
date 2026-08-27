"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Button } from "./button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const t = useTranslations("common");
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-hard/25 bg-hard/5 px-6 py-10 text-center"
    >
      <p className="text-sm font-medium text-ink">{t("error")}</p>
      <p className="max-w-sm text-sm text-ink-secondary">
        {message ?? t("errorBody")}
      </p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-muted">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
