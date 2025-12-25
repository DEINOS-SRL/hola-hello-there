import { useState } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LucideIcon,
  Shield,
  Users,
  Building2,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  BadgeCheck,
  AppWindow,
  Key,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/core/security/permissions';
import { moduleRegistry } from '@/app/moduleRegistry';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Workflow,
};

// Items fijos del menú principal
const mainMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Módulos', href: '/modulos', icon: LayoutGrid },
];

// Items del footer
const footerItems = [
  { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(['security']);
  const { user, empresa, isAdmin } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Filtrar módulos según permisos del usuario y aplanar children
  const getVisibleModules = () => {
    return moduleRegistry
      .filter(module => {
        if (isAdmin) return true;
        const hasAccessToAnyItem = module.navItems.some(item => {
          if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
            return true;
          }
          return hasAnyPermission(item.requiredPermissions);
        });
        return hasAccessToAnyItem;
      })
      .map(module => {
        // Aplanar items con children
        const flattenedItems: ModuleNavItem[] = [];
        module.navItems.forEach(item => {
          if (item.children && item.children.length > 0) {
            // Si tiene children, usar los children como items
            item.children.forEach(child => {
              if (isAdmin || !child.requiredPermissions || hasAnyPermission(child.requiredPermissions)) {
                flattenedItems.push(child);
              }
            });
          } else {
            if (isAdmin || !item.requiredPermissions || hasAnyPermission(item.requiredPermissions)) {
              flattenedItems.push(item);
            }
          }
        });
        
        return {
          moduleId: module.moduleId,
          moduleName: module.name,
          items: flattenedItems
        };
      })
      .filter(section => section.items.length > 0);
  };

  const visibleModules = getVisibleModules();

  // Obtener icono del módulo
  const getModuleIcon = (moduleId: string): LucideIcon => {
    const iconMapping: Record<string, LucideIcon> = {
      'security': Shield,
      'employees': Users,
      'equipos': Truck,
      'operacion': Workflow,
      'partes-diarios': ClipboardList,
      'habilitaciones': BadgeCheck,
    };
    return iconMapping[moduleId] || Shield;
  };

  // Verificar si algún item del módulo está activo
  const isModuleActive = (moduleId: string) => {
    const module = visibleModules.find(m => m.moduleId === moduleId);
    if (!module) return false;
    return module.items.some(item => isActive(item.path));
  };

  const initials = user 
    ? `${user.nombre?.charAt(0) || ''}${user.apellido?.charAt(0) || ''}`.toUpperCase()
    : 'U';

  const NavItem = ({ 
    item, 
    icon,
    indent = false 
  }: { 
    item: { name: string; href: string; icon?: LucideIcon } | ModuleNavItem; 
    icon?: LucideIcon;
    indent?: boolean;
  }) => {
    const isNavItem = 'href' in item;
    const href = isNavItem ? item.href : item.path;
    const name = isNavItem ? item.name : item.label;
    const IconComponent = icon || (isNavItem ? item.icon : iconMap[item.icon || ''] || Shield);
    const active = isActive(href);

    const content = (
      <RouterNavLink
        to={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium",
          indent && !collapsed && "ml-7"
        )}
      >
        {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
        {!collapsed && <span>{name}</span>}
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

  const ModuleGroup = ({ 
    moduleId, 
    moduleName, 
    items,
    icon: ModuleIcon 
  }: { 
    moduleId: string; 
    moduleName: string; 
    items: ModuleNavItem[];
    icon: LucideIcon;
  }) => {
    const isExpanded = expandedModules.includes(moduleId);
    const hasActiveItem = isModuleActive(moduleId);

    if (collapsed) {
      // En modo colapsado, mostrar solo el icono del módulo
      return (
        <div className="space-y-0.5">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "flex items-center justify-center p-2 rounded-md cursor-pointer",
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  hasActiveItem && "bg-primary/10 text-primary"
                )}
                onClick={() => toggleModule(moduleId)}
              >
                <ModuleIcon className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p className="font-semibold mb-1">{moduleName}</p>
              <div className="space-y-1">
                {items.map(item => (
                  <RouterNavLink 
                    key={item.path} 
                    to={item.path}
                    className={cn(
                      "block text-sm py-1 hover:text-primary",
                      isActive(item.path) && "text-primary font-medium"
                    )}
                  >
                    {item.label}
                  </RouterNavLink>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleModule(moduleId)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-md transition-all duration-200 text-sm",
              "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              hasActiveItem && "text-primary font-medium"
            )}
          >
            <div className="flex items-center gap-3">
              <ModuleIcon className="h-4 w-4 shrink-0" />
              <span>{moduleName}</span>
            </div>
            <ChevronDown 
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} 
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-0.5">
          {items.map(item => (
            <NavItem key={item.path} item={item} indent />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 h-screen",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Header con logo y empresa */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-2 overflow-hidden",
            collapsed && "justify-center w-full"
          )}>
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">DC</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-semibold text-sidebar-foreground text-sm truncate">
                  {empresa?.nombre || 'DNSCloud'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.nombre} {user?.apellido}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Botón para expandir cuando está colapsado */}
      {collapsed && (
        <div className="p-2 border-b border-sidebar-border">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="w-full h-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Expandir menú
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-0.5 pb-2">
          {mainMenuItems.map(item => (
            <NavItem key={item.href} item={item} icon={item.icon} />
          ))}
        </div>

        {/* Separador */}
        <div className="border-t border-sidebar-border my-2" />

        {/* Módulos expandibles */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 py-1">
              Módulos
            </p>
          )}
          {visibleModules.map(section => (
            <ModuleGroup
              key={section.moduleId}
              moduleId={section.moduleId}
              moduleName={section.moduleName}
              items={section.items}
              icon={getModuleIcon(section.moduleId)}
            />
          ))}
        </div>
      </nav>

      {/* Footer con Settings y Help */}
      <div className="p-2 border-t border-sidebar-border space-y-0.5">
        {footerItems.map(item => (
          <NavItem key={item.href} item={item} icon={item.icon} />
        ))}
        
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                className="flex items-center justify-center w-full p-2 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Ayuda y Soporte
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Ayuda y Soporte</span>
          </button>
        )}
      </div>
    </aside>
  );
}
