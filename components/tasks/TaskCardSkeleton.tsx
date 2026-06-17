import { Card, CardContent } from "@/components/ui/card";

export function TaskCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-muted rounded-xl animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-1.5 w-full bg-muted rounded animate-pulse mt-3" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
