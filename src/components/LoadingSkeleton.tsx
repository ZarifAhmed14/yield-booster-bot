import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* Success Message Skeleton */}
      <div className="py-4 bg-muted/30 rounded-xl border-2 border-muted">
        <Skeleton className="h-8 w-48 mx-auto" />
      </div>

      {/* Weather Card Skeleton */}
      <Card className="border-4 border-muted/30">
        <CardHeader className="pb-2 bg-muted/10">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-muted/10 rounded-xl text-center">
                <Skeleton className="w-10 h-10 mx-auto mb-2 rounded-full" />
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border-4 border-muted/30">
            <CardHeader className="pb-2 bg-muted/10">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <Skeleton className="h-12 w-32 mx-auto rounded-full" />
              <div className="flex gap-2 justify-center">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-12 w-16 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Recommendations Skeleton */}
      <Card className="border-4 border-muted/20">
        <CardHeader className="pb-2 bg-muted/10">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="p-4 bg-muted/30 rounded-xl space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingSkeleton;
