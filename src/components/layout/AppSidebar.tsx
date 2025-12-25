import { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { 
  Home, 
  Star,
  Bookmark,
  ChevronRight,
  LucideIcon,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  LayoutGrid as DefaultIcon,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/core/security/permissions';
import { useModulosDB, type ModuloConHijos } from '@/modules/security/hooks/useModulos';
import { useFavoritos } from '@/modules/security/hooks/useFavoritos';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Función para obtener icono dinámicamente por nombre
const getIconByName = (iconName: string): LucideIcon => {
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && typeof icon === 'function') {
    return icon as LucideIcon;
  }
  return DefaultIcon;
};

// Items fijos del menú principal
const mainMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Favoritos', href: '#favoritos', icon: Bookmark, isSection: true },
];

// Items del footer
const footerItems = [
  { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const { user, empresa, isAdmin } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const location = useLocation();
  const { arbol: modulosArbol, isLoading } = useModulosDB();
  const { favoritos, isLoading: isLoadingFavoritos, toggleFavorito, isFavorito, isAdding, isRemoving } = useFavoritos();
  const [favoritosExpanded, setFavoritosExpanded] = useState(true);

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  // Expandir automáticamente el módulo activo
  useEffect(() => {
    if (modulosArbol.length > 0) {
      const activeModuleId = modulosArbol.find(m => 
        isActive(m.ruta) || m.hijos.some(h => isActive(h.ruta))
      )?.id;
      
      if (activeModuleId && !expandedModules.includes(activeModuleId)) {
        setExpandedModules(prev => [...prev, activeModuleId]);
      }
    }
  }, [location.pathname, modulosArbol]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Filtrar módulos según permisos del usuario
  const getVisibleModules = (): ModuloConHijos[] => {
    return modulosArbol.filter(modulo => {
      if (isAdmin) return true;
      
      // Verificar permisos del módulo padre
      if (modulo.permisos_requeridos && modulo.permisos_requeridos.length > 0) {
        if (!hasAnyPermission(modulo.permisos_requeridos)) {
          return false;
        }
      }
      
      // Si tiene hijos, verificar que al menos uno sea accesible
      if (modulo.hijos.length > 0) {
        return modulo.hijos.some(hijo => {
          if (!hijo.permisos_requeridos || hijo.permisos_requeridos.length === 0) {
            return true;
          }
          return hasAnyPermission(hijo.permisos_requeridos);
        });
      }
      
      return true;
    }).map(modulo => ({
      ...modulo,
      hijos: modulo.hijos.filter(hijo => {
        if (isAdmin) return true;
        if (!hijo.permisos_requeridos || hijo.permisos_requeridos.length === 0) {
          return true;
        }
        return hasAnyPermission(hijo.permisos_requeridos);
      })
    }));
  };

  const visibleModules = getVisibleModules();

  // Verificar si algún item del módulo está activo
  const isModuleActive = (modulo: ModuloConHijos) => {
    if (isActive(modulo.ruta)) return true;
    return modulo.hijos.some(hijo => isActive(hijo.ruta));
  };

  const NavItem = ({ 
    item, 
    icon,
  }: { 
    item: { name: string; href: string; icon?: LucideIcon };
    icon?: LucideIcon;
  }) => {
    const IconComponent = icon || item.icon || DefaultIcon;
    const active = isActive(item.href);

    const content = (
      <RouterNavLink
        to={item.href}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
        )}
      >
        {active && (
          <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary ring-2 ring-background transition-all duration-200 animate-pulse-soft" />
        )}
        <IconComponent className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.name}</span>}
      </RouterNavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const ModuloNavItem = ({ 
    modulo,
    showFavoriteToggle = false,
  }: { 
    modulo: ModuloConHijos;
    showFavoriteToggle?: boolean;
  }) => {
    const IconComponent = getIconByName(modulo.icono);
    const active = isActive(modulo.ruta);
    const isFav = isFavorito(modulo.id);

    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorito(modulo.id);
    };

    const content = (
      <div className="group/item relative flex items-center">
        <RouterNavLink
          to={modulo.ruta}
          className={cn(
            "relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm flex-1",
            "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
          )}
        >
          {active && (
            <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary ring-2 ring-background transition-all duration-200 animate-pulse-soft" />
          )}
          <IconComponent className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{modulo.nombre}</span>}
        </RouterNavLink>
        
        {/* Botón de favorito visible en hover */}
        {showFavoriteToggle && !collapsed && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleFavorite}
                disabled={isAdding || isRemoving}
                className={cn(
                  "absolute right-1 p-1 rounded transition-all duration-200",
                  isFav 
                    ? "opacity-100 text-yellow-500" 
                    : "opacity-0 group-hover/item:opacity-100 text-sidebar-foreground/50 hover:text-yellow-500"
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isFav && "fill-yellow-500")} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {modulo.nombre}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const ModuleGroup = ({ 
    modulo,
  }: { 
    modulo: ModuloConHijos;
  }) => {
    const isExpanded = expandedModules.includes(modulo.id);
    const hasActiveItem = isModuleActive(modulo);
    const ModuleIcon = getIconByName(modulo.icono);
    const tieneHijos = modulo.hijos.length > 0;

    // Si no tiene hijos, mostrar como link directo
    if (!tieneHijos) {
      return <ModuloNavItem modulo={modulo} />;
    }

    if (collapsed) {
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
                onClick={() => toggleModule(modulo.id)}
              >
                <ModuleIcon className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium z-[100] bg-popover border border-border shadow-lg">
              <p className="font-semibold mb-1">{modulo.nombre}</p>
              <div className="space-y-1">
                {modulo.hijos.map(hijo => (
                  <RouterNavLink 
                    key={hijo.id} 
                    to={hijo.ruta}
                    className={cn(
                      "block text-sm py-1 hover:text-primary",
                      isActive(hijo.ruta) && "text-primary font-medium"
                    )}
                  >
                    {hijo.nombre}
                  </RouterNavLink>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleModule(modulo.id)}>
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
              <span>{modulo.nombre}</span>
            </div>
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-90"
              )} 
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-0.5 animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className={cn(
            "relative ml-[22px] pl-4 border-l-2 space-y-0.5 transition-all duration-300 ease-out",
            hasActiveItem 
              ? "border-primary hover:border-primary/80" 
              : "border-sidebar-border hover:border-primary/40"
          )}>
            {modulo.hijos.map(hijo => (
              <ModuloNavItem key={hijo.id} modulo={hijo} showFavoriteToggle />
            ))}
          </div>
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
        {/* Dashboard */}
        <div className="space-y-0.5">
          <NavItem item={{ name: 'Dashboard', href: '/dashboard', icon: Home }} icon={Home} />
        </div>

        {/* Favoritos - Collapsible section like HubSpot */}
        <Collapsible open={favoritosExpanded} onOpenChange={setFavoritosExpanded}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-md transition-all duration-200 text-sm mt-1",
                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Favoritos</span>}
              </div>
              {!collapsed && (
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    favoritosExpanded && "rotate-90"
                  )} 
                />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
            {isLoadingFavoritos ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : favoritos.length === 0 ? (
              <p className="text-xs text-sidebar-foreground/50 px-3 py-2 italic">
                {!collapsed && 'Sin favoritos aún'}
              </p>
            ) : (
              <div className="ml-[22px] pl-4 border-l-2 border-sidebar-border space-y-0.5 mt-0.5">
                {favoritos.map(fav => {
                  const IconComponent = getIconByName(fav.modulo.icono);
                  const active = isActive(fav.modulo.ruta);
                  const isFav = true;
                  
                  const handleRemoveFavorite = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorito(fav.modulo_id);
                  };
                  
                  const content = (
                    <div key={fav.id} className="group/fav relative flex items-center">
                      <RouterNavLink
                        to={fav.modulo.ruta}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm flex-1",
                          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                          active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
                        )}
                      >
                        <IconComponent className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{fav.modulo.nombre}</span>}
                      </RouterNavLink>
                      
                      {/* Botón para quitar de favoritos */}
                      {!collapsed && (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={handleRemoveFavorite}
                              disabled={isRemoving}
                              className="absolute right-1 p-1 rounded opacity-0 group-hover/fav:opacity-100 text-yellow-500 hover:text-destructive transition-all duration-200"
                            >
                              <Bookmark className="h-3.5 w-3.5 fill-current" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            Quitar de favoritos
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={fav.id} delayDuration={0}>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {fav.modulo.nombre}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return content;
                })}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Separador */}
        <div className="border-t border-sidebar-border my-2" />

        {/* Módulos dinámicos desde BD */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 py-1">
              Módulos
            </p>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            visibleModules.map(modulo => (
              <ModuleGroup key={modulo.id} modulo={modulo} />
            ))
          )}
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
