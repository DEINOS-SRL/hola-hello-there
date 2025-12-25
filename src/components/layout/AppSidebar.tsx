import { useState } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutGrid,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  Shield,
  Users,
  Building2,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  BadgeCheck,
  AppWindow,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { usePermissions } from '@/core/security/permissions';
import { moduleRegistry } from '@/app/moduleRegistry';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ModuleNavItem } from '@/shared/types/module';

// Mapa de iconos por nombre de string
const iconMap: Record<string, LucideIcon> = {
  Home,
  LayoutGrid,
  Shield,
  Users,
  Building2,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  BadgeCheck,
  AppWindow,
  Key,
};

// Items fijos del menú principal
const mainMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Módulos', href: '/modulos', icon: LayoutGrid },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  // Filtrar módulos según permisos del usuario
  const getVisibleModules = () => {
    return moduleRegistry
      .filter(module => {
        // Si es admin, mostrar todos los módulos
        if (isAdmin) return true;
        
        // Si el módulo tiene items de navegación con permisos, verificar acceso
        const hasAccessToAnyItem = module.navItems.some(item => {
          if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
            return true;
          }
          return hasAnyPermission(item.requiredPermissions);
        });
        
        return hasAccessToAnyItem;
      })
      .map(module => ({
        moduleId: module.moduleId,
        moduleName: module.name,
        items: module.navItems.filter(item => {
          if (isAdmin) return true;
          if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
            return true;
          }
          return hasAnyPermission(item.requiredPermissions);
        })
      }))
      .filter(section => section.items.length > 0);
  };

  const visibleModules = getVisibleModules();

  const NavItem = ({ item, icon }: { item: { name: string; href: string; icon: LucideIcon } | ModuleNavItem; icon?: LucideIcon }) => {
    const isNavItem = 'href' in item;
    const href = isNavItem ? item.href : item.path;
    const name = isNavItem ? item.name : item.label;
    const IconComponent = icon || (isNavItem ? item.icon : iconMap[item.icon || ''] || Shield);
    const active = isActive(href);

    const content = (
      <RouterNavLink
        to={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
        )}
      >
        <IconComponent className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="font-medium">{name}</span>}
      </RouterNavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  // Obtener icono del módulo
  const getModuleIcon = (moduleId: string): LucideIcon => {
    const iconMapping: Record<string, LucideIcon> = {
      'security': Shield,
      'employees': Users,
      'equipos': Truck,
      'movimientos': ArrowLeftRight,
      'partes-diarios': ClipboardList,
      'habilitaciones': BadgeCheck,
    };
    return iconMapping[moduleId] || Shield;
  };

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 h-screen",
        collapsed ? "w-[64px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-[60px] flex items-center justify-between px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">DC</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground text-lg">DNSCloud</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3 mb-2">
              Principal
            </p>
          )}
          {mainMenuItems.map(item => (
            <NavItem key={item.href} item={item} icon={item.icon} />
          ))}
        </div>

        {/* Dynamic Modules from Registry */}
        {visibleModules.map(section => {
          const ModuleIcon = getModuleIcon(section.moduleId);
          return (
            <div key={section.moduleId} className="space-y-1">
              {!collapsed && (
                <p className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                  <ModuleIcon className="h-3.5 w-3.5" />
                  {section.moduleName}
                </p>
              )}
              {collapsed && (
                <div className="flex justify-center py-2">
                  <ModuleIcon className="h-4 w-4 text-sidebar-muted" />
                </div>
              )}
              {section.items.map(item => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-full h-10 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {resolvedTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span>{resolvedTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
