import { ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';
import { usePreferenciasGlobal } from '@/contexts/PreferenciasContext';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppBreadcrumb } from './AppBreadcrumb';
import { CommandSearch } from './CommandSearch';
import { MobileBottomNav } from './MobileBottomNav';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const location = useLocation();
  const mainScrollRef = useRef<HTMLElement>(null);
  const { preservarScroll } = usePreferenciasGlobal();
  const { isOpen, isMobile, closeSidebar } = useSidebarContext();

  useScrollRestoration(
    mainScrollRef,
    `dnscloud-main-scroll:${location.pathname}`,
    [location.pathname],
    { enabled: preservarScroll },
  );

  return (
    <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
      {/* Overlay para mobile cuando sidebar está abierto */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={closeSidebar}
        />
      )}
      
      <AppSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <AppHeader />
        <main 
          ref={mainScrollRef} 
          className={cn(
            "flex-1 min-h-0 overflow-auto overscroll-contain",
            // Mobile: padding extra abajo para la navegación inferior
            isMobile ? "p-4 pb-20" : "p-6"
          )}
        >
          <AppBreadcrumb />
          {children}
        </main>
      </div>
      
      {/* Navegación inferior solo en mobile */}
      {isMobile && <MobileBottomNav />}
      
      <CommandSearch />
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
