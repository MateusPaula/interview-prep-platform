interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-shimmer rounded-md bg-[linear-gradient(110deg,var(--color-raised)_35%,var(--color-overlay)_50%,var(--color-raised)_65%)] bg-[length:200%_100%] ${className ?? ""}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-3 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-6 h-9 w-32" />
    </div>
  );
}
