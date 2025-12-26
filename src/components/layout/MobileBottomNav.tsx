import { NavLink, useLocation } from 'react-router-dom';
import { Home, Bookmark, Settings, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { useFavoritos } from '@/modules/security/hooks/useFavoritos';

const navItems = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Favoritos', href: '#favoritos', icon: Bookmark, action: 'favoritos' },
  { name: 'Menú', href: '#menu', icon: Menu, action: 'menu' },
  { name: 'Config', href: '/configuracion', icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { openSidebar } = useSidebarContext();
  const { favoritos } = useFavoritos();

  const isActive = (href: string) => {
    if (href.startsWith('#')) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleAction = (action?: string) => {
    if (action === 'menu' || action === 'favoritos') {
      openSidebar();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const hasBadge = item.action === 'favoritos' && favoritos.length > 0;

          if (item.action) {
            return (
              <button
                key={item.name}
                onClick={() => handleAction(item.action)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 relative",
                  "text-muted-foreground active:text-primary transition-colors"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {hasBadge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {favoritos.length > 9 ? '9+' : favoritos.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 relative",
                "transition-colors",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground active:text-primary"
              )}
            >
              {active && (
                <span className="absolute top-1 h-1 w-8 rounded-full bg-primary" />
              )}
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className={cn(
                "text-[10px] font-medium",
                active && "text-primary"
              )}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
