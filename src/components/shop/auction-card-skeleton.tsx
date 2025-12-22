import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function AuctionCardSkeleton() {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image Skeleton */}
          <div className="relative w-full sm:w-48 h-48 bg-muted flex-shrink-0">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4" />
                
                {/* Description */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                
                {/* Badges */}
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              {/* Bottom Info */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
