import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Hook para manejar swipe gestures
function useSwipeGesture(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled: boolean
) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const minSwipeDistance = 50;
    const maxVerticalDistance = 100;
    const edgeZone = 30; // Zona desde el borde izquierdo para iniciar swipe

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchEndX.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current || !touchStartY.current) return;

      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = Math.abs(touchEndX.current - touchStartX.current);
      const isHorizontalSwipe = Math.abs(deltaX) > minSwipeDistance && deltaY < maxVerticalDistance;

      if (!isHorizontalSwipe) return;

      // Swipe right desde el borde izquierdo -> abrir
      if (deltaX > 0 && touchStartX.current < edgeZone) {
        onSwipeRight();
      }
      // Swipe left -> cerrar
      else if (deltaX < 0) {
        onSwipeLeft();
      }

      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onSwipeLeft, onSwipeRight]);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar sidebar cuando cambia a mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);

  // Swipe gestures para mobile
  useSwipeGesture(
    closeSidebar, // swipe left -> cerrar
    openSidebar,  // swipe right desde borde -> abrir
    isMobile
  );

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
}
