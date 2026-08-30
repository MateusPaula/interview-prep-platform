import type { Difficulty } from "@/core/domain";

const difficultyStyles: Record<Difficulty, string> = {
  easy: "border-easy/35 bg-easy/10 text-easy",
  medium: "border-medium/35 bg-medium/10 text-medium",
  hard: "border-hard/35 bg-hard/10 text-hard",
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  label: string;
}

export function DifficultyBadge({ difficulty, label }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${difficultyStyles[difficulty]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

interface TopicBadgeProps {
  label: string;
}

export function TopicBadge({ label }: TopicBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-line-strong bg-raised px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
      {label}
    </span>
  );
}
