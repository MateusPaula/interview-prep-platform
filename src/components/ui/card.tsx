import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={`rounded-lg border border-line bg-surface shadow-card ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
