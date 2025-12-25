import { ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';
import { usePreferenciasGlobal } from '@/contexts/PreferenciasContext';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppBreadcrumb } from './AppBreadcrumb';
import { CommandSearch } from './CommandSearch';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const mainScrollRef = useRef<HTMLElement>(null);
  const { preservarScroll } = usePreferenciasGlobal();

  useScrollRestoration(
    mainScrollRef,
    `dnscloud-main-scroll:${location.pathname}`,
    [location.pathname],
    { enabled: preservarScroll },
  );

  return (
    <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <AppHeader />
        <main ref={mainScrollRef} className="flex-1 min-h-0 p-6 overflow-auto overscroll-contain">
          <AppBreadcrumb />
          {children}
        </main>
      </div>
      <CommandSearch />
    </div>
  );
}
