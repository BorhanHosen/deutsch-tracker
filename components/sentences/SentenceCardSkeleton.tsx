import { Card, CardContent } from "@/components/ui/card";

export function SentenceCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-8 w-8 bg-muted rounded animate-pulse shrink-0" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="flex gap-1">
            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
