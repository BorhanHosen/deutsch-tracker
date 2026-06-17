export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-7 w-24 bg-muted rounded-lg animate-pulse" />

      {/* User card */}
      <div className="h-52 bg-muted rounded-xl animate-pulse" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Badges */}
      <div className="h-48 bg-muted rounded-xl animate-pulse" />

      {/* Export */}
      <div className="h-32 bg-muted rounded-xl animate-pulse" />
    </div>
  );
}
