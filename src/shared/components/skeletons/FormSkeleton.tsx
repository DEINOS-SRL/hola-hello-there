import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface FormSkeletonProps {
  fields?: number;
  columns?: 1 | 2;
  showCard?: boolean;
  showActions?: boolean;
}

export function FormSkeleton({
  fields = 6,
  columns = 1,
  showCard = true,
  showActions = true,
}: FormSkeletonProps) {
  const content = (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      
      {showActions && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      )}
    </div>
  );

  if (!showCard) return content;

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
