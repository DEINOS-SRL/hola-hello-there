import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showFilters = true,
  showPagination = true,
}: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Filtros */}
      {showFilters && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-28" />
        </div>
      )}

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        {showHeader && (
          <div className="flex items-center gap-4 p-4 bg-muted/50 border-b">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        )}

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-4 p-4 border-b last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={`h-4 flex-1 ${colIndex === 0 ? 'max-w-[200px]' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  );
}
