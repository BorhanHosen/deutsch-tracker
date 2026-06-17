import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  rows?: number;
  className?: string;
}

export function PageSkeleton({ rows = 5, className }: PageSkeletonProps) {
  return (
    <div className={cn("space-y-4 w-full", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-40 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-muted rounded animate-pulse" />
      </div>

      {/* Content rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-muted rounded-xl animate-pulse"
          style={{
            animationDelay: `${i * 60}ms`,
            opacity: 1 - i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
