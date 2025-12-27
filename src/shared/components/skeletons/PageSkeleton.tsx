import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from './TableSkeleton';
import { CardGridSkeleton } from './CardGridSkeleton';
import { DashboardSkeleton } from './DashboardSkeleton';

type PageType = 'table' | 'cards' | 'dashboard' | 'detail' | 'form';

interface PageSkeletonProps {
  type?: PageType;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

export function PageSkeleton({
  type = 'table',
  showTitle = true,
  showDescription = true,
  showActions = true,
}: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          {showTitle && <Skeleton className="h-8 w-48" />}
          {showDescription && <Skeleton className="h-4 w-80" />}
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}
      </div>

      {/* Page Content based on type */}
      {type === 'table' && <TableSkeleton />}
      {type === 'cards' && <CardGridSkeleton />}
      {type === 'dashboard' && <DashboardSkeleton />}
      {type === 'detail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      )}
      {type === 'form' && (
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
