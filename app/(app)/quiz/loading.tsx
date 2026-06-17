export default function QuizLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-20 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-96 bg-muted rounded-xl animate-pulse" />
    </div>
  );
}
