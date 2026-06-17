export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
            D
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-primary/30 animate-ping" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">DeutschTracker</p>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}
