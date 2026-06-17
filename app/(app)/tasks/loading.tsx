export default function TasksLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-52 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-20 bg-muted rounded-xl animate-pulse" />

      {/* Tabs */}
      <div className="h-10 bg-muted rounded-lg animate-pulse" />

      {/* Task cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-muted rounded-xl animate-pulse"
            style={{
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
