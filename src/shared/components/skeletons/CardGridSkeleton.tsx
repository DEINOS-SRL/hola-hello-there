import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CardGridSkeletonProps {
  cards?: number;
  columns?: 2 | 3 | 4;
  showImage?: boolean;
  showActions?: boolean;
}

export function CardGridSkeleton({
  cards = 6,
  columns = 3,
  showImage = false,
  showActions = true,
}: CardGridSkeletonProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          {showImage && (
            <Skeleton className="h-40 w-full rounded-none" />
          )}
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            {showActions && (
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
