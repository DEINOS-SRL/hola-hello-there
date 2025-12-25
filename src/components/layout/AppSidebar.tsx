import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
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
  UserCog,
  Building2,
  Users,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/core/security/permissions';
import { useModulosDB, type ModuloConHijos } from '@/modules/security/hooks/useModulos';
import { useFavoritos } from '@/modules/security/hooks/useFavoritos';
import { SortableFavorites } from './SortableFavorites';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

// Submenús de Configuración
const configMenuItems = [
  { name: 'Administración', href: '/configuracion/administracion', icon: UserCog, description: 'Usuarios, roles y permisos' },
  { name: 'Empresa actual', href: '/configuracion/empresa', icon: Building2, description: 'Datos de mi empresa' },
  { name: 'Notificaciones', href: '/configuracion/notificaciones', icon: LucideIcons.Bell, description: 'Preferencias de alertas' },
  { name: 'Preferencias', href: '/configuracion/preferencias', icon: LucideIcons.Sliders, description: 'Ajustes personales' },
];

const SIDEBAR_COLLAPSED_KEY = 'dnscloud-sidebar-collapsed';
const SIDEBAR_EXPANDED_MODULES_KEY = 'dnscloud-sidebar-expanded-modules';
const SIDEBAR_MIN_WIDTH = 68;
const SIDEBAR_MAX_WIDTH = 260;
const SIDEBAR_COLLAPSE_THRESHOLD = 120;

export function AppSidebar() {
  // Detectar si es Mac para mostrar el shortcut correcto
  const isMac = useMemo(() => 
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0, 
  []);
  const shortcutKey = isMac ? '⌘B' : 'Ctrl+B';

  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === 'true';
  });
  const [expandedModules, setExpandedModules] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_EXPANDED_MODULES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const { user, empresa, isAdmin } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const location = useLocation();
  const { arbol: modulosArbol, isLoading } = useModulosDB();
  const { favoritos, isLoading: isLoadingFavoritos, toggleFavorito, isFavorito, reorderFavoritos, isAdding, isRemoving } = useFavoritos();
  const [favoritosExpanded, setFavoritosExpanded] = useState(true);

  // Persistir estado colapsado en localStorage
  const handleSetCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value));
  }, []);

  // Handle drag resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragWidth(collapsed ? SIDEBAR_MIN_WIDTH : SIDEBAR_MAX_WIDTH);
  }, [collapsed]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, e.clientX));
      setDragWidth(newWidth);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      const finalWidth = e.clientX;
      
      if (finalWidth < SIDEBAR_COLLAPSE_THRESHOLD) {
        handleSetCollapsed(true);
      } else {
        handleSetCollapsed(false);
      }
      setDragWidth(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleSetCollapsed]);

  // Keyboard shortcut: Cmd/Ctrl + B para toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        handleSetCollapsed(!collapsed);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [collapsed, handleSetCollapsed]);

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  // Expandir automáticamente el módulo activo solo al montar o cambiar de módulo padre
  useEffect(() => {
    if (modulosArbol.length > 0) {
      const activeModule = modulosArbol.find(m => 
        isActive(m.ruta) || m.hijos.some(h => isActive(h.ruta))
      );
      
      // Solo expandir si cambiamos a un módulo diferente (no al navegar dentro del mismo)
      if (activeModule && !expandedModules.includes(activeModule.id)) {
        // Verificar si la ruta anterior era del mismo módulo
        const wasInSameModule = modulosArbol.some(m => 
          m.id === activeModule.id && (
            m.ruta === location.pathname || 
            m.hijos.some(h => h.ruta === location.pathname)
          )
        );
        
        if (!wasInSameModule) {
          setExpandedModules(prev => [...prev, activeModule.id]);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulosArbol]); // Solo ejecutar cuando cambian los módulos, no en cada navegación

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newExpanded = prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId];
      // Persistir en localStorage
      localStorage.setItem(SIDEBAR_EXPANDED_MODULES_KEY, JSON.stringify(newExpanded));
      return newExpanded;
    });
  };

  // Filtrar módulos según permisos del usuario
  // Excluir "Configuración" que ahora es item fijo del footer
  const getVisibleModules = (): ModuloConHijos[] => {
    return modulosArbol
      .filter(modulo => modulo.ruta !== '/configuracion') // Excluir Configuración del listado dinámico
      .filter(modulo => {
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
          <TooltipContent side="right" sideOffset={8} className="font-medium z-[9999]">
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
            <TooltipContent side="right" sideOffset={8} className="text-xs z-[9999]">
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
          <TooltipContent side="right" sideOffset={8} className="font-medium z-[9999]">
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
    const isFav = isFavorito(modulo.id);

    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorito(modulo.id);
    };

    // Si no tiene hijos, mostrar como link directo con opción de favorito
    if (!tieneHijos) {
      return <ModuloNavItem modulo={modulo} showFavoriteToggle />;
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
            <TooltipContent side="right" sideOffset={8} className="font-medium z-[9999] bg-popover border border-border shadow-lg">
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
        <div className="group/parent relative flex items-center">
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
          
          {/* Botón de favorito para módulo padre */}
          {!collapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleFavorite}
                  disabled={isAdding || isRemoving}
                  className={cn(
                    "absolute right-7 p-1 rounded transition-all duration-200 z-10",
                    isFav 
                      ? "opacity-100 text-yellow-500" 
                      : "opacity-0 group-hover/parent:opacity-100 text-sidebar-foreground/50 hover:text-yellow-500"
                  )}
                >
                  <Bookmark className={cn("h-3.5 w-3.5", isFav && "fill-yellow-500")} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="text-xs z-[9999]">
                {isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <CollapsibleContent className="mt-0.5 overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
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

  // Calculate actual width during drag
  const sidebarWidth = isDragging && dragWidth !== null 
    ? dragWidth 
    : (collapsed ? SIDEBAR_MIN_WIDTH : SIDEBAR_MAX_WIDTH);

  return (
    <aside 
      className={cn(
        "bg-sidebar flex flex-col sticky top-0 h-screen relative",
        !isDragging && "transition-[width] duration-300 ease-in-out"
      )}
      style={{ width: sidebarWidth }}
    >
      {/* Drag handle en el borde derecho */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-50 group",
          "hover:bg-primary/30 active:bg-primary/50 transition-colors duration-150",
          isDragging && "bg-primary/50"
        )}
      >
        {/* Línea visual del borde */}
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-px bg-sidebar-border transition-all duration-150",
          "group-hover:w-0.5 group-hover:bg-primary/50",
          isDragging && "w-0.5 bg-primary"
        )} />
      </div>
      {/* Header con logo y empresa */}
      <div className="p-3 border-b border-sidebar-border overflow-hidden">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out",
            collapsed && "justify-center w-full"
          )}>
            <div className={cn(
              "rounded-lg bg-primary flex items-center justify-center shrink-0 transition-all duration-300 ease-in-out",
              collapsed ? "h-10 w-10" : "h-9 w-9"
            )}>
              <span className="text-primary-foreground font-bold text-sm">DC</span>
            </div>
            <div className={cn(
              "min-w-0 transition-all duration-300 ease-in-out overflow-hidden",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <p className="font-semibold text-sidebar-foreground text-sm truncate whitespace-nowrap">
                {empresa?.nombre || 'DNSCloud'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate whitespace-nowrap">
                {user?.nombre} {user?.apellido}
              </p>
            </div>
          </div>
          <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSetCollapsed(true)}
                  className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="z-[9999]">
                <span>Colapsar menú</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted/50 rounded border border-border/50">
                  {shortcutKey}
                </kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Botón para expandir cuando está colapsado */}
      <div className={cn(
        "border-b border-sidebar-border overflow-hidden transition-all duration-300 ease-in-out",
        collapsed ? "p-2 max-h-14 opacity-100" : "max-h-0 p-0 opacity-0"
      )}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSetCollapsed(false)}
              className="w-full h-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <PanelLeft className="h-4 w-4 transition-transform duration-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="z-[9999]">
            <span>Expandir menú</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted/50 rounded border border-border/50">
              {shortcutKey}
            </kbd>
          </TooltipContent>
        </Tooltip>
      </div>

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
                <span className={cn(
                  "flex items-center gap-2 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                  Favoritos
                  {favoritos.length > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-medium rounded-full bg-primary/15 text-primary">
                      {favoritos.length}
                    </span>
                  )}
                </span>
              </div>
              <ChevronRight 
                className={cn(
                  "h-4 w-4 transition-all duration-300 ease-in-out",
                  favoritosExpanded && "rotate-90",
                  collapsed ? "w-0 opacity-0" : "w-4 opacity-100"
                )} 
              />
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
              <div className={cn(
                "mt-0.5",
                !collapsed && "ml-[22px] pl-4 border-l-2 border-sidebar-border"
              )}>
                <SortableFavorites
                  favoritos={favoritos}
                  collapsed={collapsed}
                  onReorder={reorderFavoritos}
                  onRemove={toggleFavorito}
                  isRemoving={isRemoving}
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Separador */}
        <div className="border-t border-sidebar-border my-2" />

        {/* Módulos dinámicos desde BD */}
        <div className="space-y-1">
          <p className={cn(
            "text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 py-1 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
            collapsed ? "h-0 opacity-0 py-0" : "h-auto opacity-100"
          )}>
            Módulos
          </p>
          
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
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {/* Configuración con Popover */}
        <Popover>
          <PopoverTrigger asChild>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-center w-full p-2 rounded-md transition-all duration-200",
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      location.pathname.startsWith('/configuracion') && "bg-primary/10 text-primary"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Configuración
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all duration-200",
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  location.pathname.startsWith('/configuracion') && "bg-primary/10 text-primary font-medium"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </button>
            )}
          </PopoverTrigger>
          <PopoverContent 
            side="right" 
            align="end"
            sideOffset={8}
            className="w-64 p-0 bg-primary text-primary-foreground border-0 shadow-xl rounded-lg"
          >
            <div className="p-4 border-b border-primary-foreground/20">
              <h3 className="font-semibold text-base">Configuración</h3>
            </div>
            <div className="p-2 space-y-1">
              {configMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <RouterNavLink
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                      "text-primary-foreground/90 hover:bg-primary-foreground/10",
                      location.pathname.startsWith(item.href) && "bg-primary-foreground/15 text-primary-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">{item.name}</span>
                      <span className="block text-xs text-primary-foreground/70">{item.description}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary-foreground/50" />
                  </RouterNavLink>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Ayuda y Soporte */}
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
