import * as React from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  className,
  disabled = false,
}: PullToRefreshProps) {
  const { isPulling, isRefreshing, pullProgress, containerRef } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  const showIndicator = isPulling || isRefreshing || pullProgress > 0;
  const rotation = Math.min(pullProgress * 1.8, 180);

  return (
    <div className={cn("relative", className)}>
      {/* Indicador de pull */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-10 transition-all duration-200",
          showIndicator ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{
          top: Math.min(pullProgress * 0.6, 48),
        }}
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full bg-background border shadow-md",
          isRefreshing && "animate-pulse"
        )}>
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <ArrowDown 
              className="h-5 w-5 text-primary transition-transform duration-100"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          )}
        </div>
      </div>

      {/* Contenedor scrolleable */}
      <div
        ref={containerRef}
        className={cn(
          "h-full overflow-y-auto overscroll-contain transition-transform duration-100",
          isPulling && pullProgress > 0 && "touch-none"
        )}
        style={{
          transform: isPulling && pullProgress > 0 
            ? `translateY(${Math.min(pullProgress * 0.5, 40)}px)` 
            : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
