import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  ChevronsUpDown,
  ChevronsDownUp,
  Search,
  X,
  Pin,
  PinOff,
  RotateCcw,
  BookOpen,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferenciasGlobal } from '@/contexts/PreferenciasContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { usePermissions } from '@/core/security/permissions';
import { useModulosDB, type ModuloConHijos } from '@/modules/security/hooks/useModulos';
import { useFavoritos } from '@/modules/security/hooks/useFavoritos';
import { SortableFavorites } from './SortableFavorites';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';

// Función para obtener icono dinámicamente por nombre
const getIconByName = (iconName: string): LucideIcon => {
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && typeof icon === 'function') {
    return icon as LucideIcon;
  }
  return DefaultIcon;
};

// Función para resaltar texto que coincide con la búsqueda
const HighlightText = ({ text, search }: { text: string; search: string }) => {
  if (!search.trim()) return <>{text}</>;
  
  const searchLower = search.toLowerCase().trim();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(searchLower);
  
  if (index === -1) return <>{text}</>;
  
  const before = text.slice(0, index);
  const match = text.slice(index, index + search.length);
  const after = text.slice(index + search.length);
  
  return (
    <>
      {before}
      <span className="bg-primary/20 text-primary rounded-sm px-0.5">{match}</span>
      {after}
    </>
  );
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
const SIDEBAR_PINNED_KEY = 'dnscloud-sidebar-pinned';
const SIDEBAR_NAV_SCROLL_KEY = 'dnscloud-sidebar-nav-scroll';
const SIDEBAR_WIDTH_KEY = 'dnscloud-sidebar-width';
const SIDEBAR_MIN_WIDTH = 68;
const SIDEBAR_MAX_WIDTH = 300;
const SIDEBAR_DEFAULT_WIDTH = 260;
const SIDEBAR_COLLAPSE_THRESHOLD = 120;
const SIDEBAR_SEARCH_KEY = 'dnscloud-sidebar-search';
const SEARCH_DEBOUNCE_MS = 150;

export function AppSidebar() {
  // Context de sidebar mobile y desktop
  const { isOpen, isMobile, closeSidebar, collapsed, setCollapsed } = useSidebarContext();
  
  // Detectar si es Mac para mostrar el shortcut correcto
  const isMac = useMemo(() => 
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0, 
  []);
  const shortcutKey = isMac ? '⌘B' : 'Ctrl+B';
  const [pinned, setPinned] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_PINNED_KEY);
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
  const [savedWidth, setSavedWidth] = useState<number>(() => {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return stored ? Math.min(Math.max(parseInt(stored, 10), SIDEBAR_MIN_WIDTH), SIDEBAR_MAX_WIDTH) : SIDEBAR_DEFAULT_WIDTH;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, empresa, isAdmin } = useAuth();
  const { preservarScroll } = usePreferenciasGlobal();
  const { hasAnyPermission } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const { arbol: modulosArbol, isLoading } = useModulosDB();
  const { favoritos, isLoading: isLoadingFavoritos, toggleFavorito, isFavorito, reorderFavoritos, isAdding, isRemoving } = useFavoritos();
  const [favoritosExpanded, setFavoritosExpanded] = useState(true);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  // Ref para el input de búsqueda
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navScrollRef = useRef<HTMLElement>(null);

  useScrollRestoration(navScrollRef, SIDEBAR_NAV_SCROLL_KEY, [location.pathname], { enabled: preservarScroll });
  
  // Cerrar sidebar mobile al navegar
  useEffect(() => {
    if (isMobile && isOpen) {
      closeSidebar();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Estado efectivo de colapsado (en mobile siempre expandido)
  // Considera hover-expand: si está colapsado pero hover-expanded, muestra como expandido
  const isCollapsed = !isMobile && collapsed && !isHoverExpanded;
  
  // Expandir favoritos automáticamente cuando el sidebar se expande desde colapsado
  useEffect(() => {
    if (!isCollapsed && !favoritosExpanded && favoritos.length > 0) {
      setFavoritosExpanded(true);
    }
  }, [isCollapsed, favoritosExpanded, favoritos.length]);

  // Handlers para hover-expand temporal
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && collapsed && !pinned) {
      // Delay antes de expandir para evitar expansiones accidentales
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoverExpanded(true);
      }, 200);
    }
  }, [isMobile, collapsed, pinned]);

  const handleMouseLeave = useCallback(() => {
    // Cancelar timeout si existe
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (isHoverExpanded) {
      setIsHoverExpanded(false);
    }
  }, [isHoverExpanded]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Búsqueda con debounce y persistencia en sessionStorage
  const [moduleSearchInput, setModuleSearchInput] = useState(() => {
    return sessionStorage.getItem(SIDEBAR_SEARCH_KEY) || '';
  });
  const [moduleSearch, setModuleSearch] = useState(() => {
    return sessionStorage.getItem(SIDEBAR_SEARCH_KEY) || '';
  });
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Debounce del término de búsqueda con indicador de carga
  useEffect(() => {
    if (moduleSearchInput !== moduleSearch) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setModuleSearch(moduleSearchInput);
      sessionStorage.setItem(SIDEBAR_SEARCH_KEY, moduleSearchInput);
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [moduleSearchInput]);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setModuleSearchInput('');
    setModuleSearch('');
    setIsSearching(false);
    sessionStorage.removeItem(SIDEBAR_SEARCH_KEY);
  }, []);

  // Shortcut key para mostrar en tooltips
  const shortcutModules = isMac ? '⌘⇧E' : 'Ctrl+Shift+E';
  const shortcutSearch = isMac ? '⌘/' : 'Ctrl+/';

  // Persistir estado colapsado en localStorage
  const handleSetCollapsed = useCallback((value: boolean) => {
    // Si está fijado, no permitir colapsar
    if (pinned && value === true) return;
    setCollapsed(value);
  }, [pinned, setCollapsed]);

  // Toggle para fijar/desfijar el sidebar
  const togglePinned = useCallback(() => {
    const newPinned = !pinned;
    setPinned(newPinned);
    localStorage.setItem(SIDEBAR_PINNED_KEY, String(newPinned));
    // Si se fija, asegurar que esté expandido
    if (newPinned && collapsed) {
      setCollapsed(false);
    }
  }, [pinned, collapsed, setCollapsed]);

  // Estado para animar el reset del ancho
  const [isResetting, setIsResetting] = useState(false);

  // Restablecer ancho del sidebar al valor por defecto con animación
  const resetSidebarWidth = useCallback(() => {
    setIsResetting(true);
    setSavedWidth(SIDEBAR_DEFAULT_WIDTH);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(SIDEBAR_DEFAULT_WIDTH));
    // Quitar la clase de transición después de la animación
    setTimeout(() => setIsResetting(false), 300);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragWidth(collapsed ? SIDEBAR_MIN_WIDTH : savedWidth);
  }, [collapsed, savedWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, e.clientX));
      setDragWidth(newWidth);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      const finalWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, e.clientX));
      
      if (finalWidth < SIDEBAR_COLLAPSE_THRESHOLD) {
        handleSetCollapsed(true);
      } else {
        handleSetCollapsed(false);
        // Guardar el ancho preferido en localStorage
        setSavedWidth(finalWidth);
        localStorage.setItem(SIDEBAR_WIDTH_KEY, String(finalWidth));
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

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  // Expandir automáticamente el módulo activo solo cuando se navega a un nuevo módulo
  // useRef para evitar re-ejecuciones innecesarias
  const lastExpandedModuleRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (modulosArbol.length === 0) return;
    
    const activeModule = modulosArbol.find(m => 
      isActive(m.ruta) || m.hijos.some(h => isActive(h.ruta))
    );
    
    // Solo expandir si:
    // 1. Hay un módulo activo
    // 2. No está ya expandido
    // 3. Es diferente al último que expandimos automáticamente
    if (activeModule && 
        !expandedModules.includes(activeModule.id) && 
        lastExpandedModuleRef.current !== activeModule.id) {
      lastExpandedModuleRef.current = activeModule.id;
      setExpandedModules(prev => {
        const newExpanded = [...prev, activeModule.id];
        localStorage.setItem(SIDEBAR_EXPANDED_MODULES_KEY, JSON.stringify(newExpanded));
        return newExpanded;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Solo ejecutar cuando cambia la ruta

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

  // Obtener IDs de módulos que tienen hijos (son colapsables)
  const collapsibleModuleIds = useMemo(() => 
    modulosArbol.filter(m => m.hijos.length > 0 && m.ruta !== '/configuracion').map(m => m.id),
  [modulosArbol]);

  // Verificar si todos están expandidos
  const allExpanded = useMemo(() => 
    collapsibleModuleIds.length > 0 && collapsibleModuleIds.every(id => expandedModules.includes(id)),
  [collapsibleModuleIds, expandedModules]);

  // Expandir todos los módulos
  const expandAll = useCallback(() => {
    const newExpanded = [...new Set([...expandedModules, ...collapsibleModuleIds])];
    setExpandedModules(newExpanded);
    localStorage.setItem(SIDEBAR_EXPANDED_MODULES_KEY, JSON.stringify(newExpanded));
  }, [expandedModules, collapsibleModuleIds]);

  // Colapsar todos los módulos
  const collapseAll = useCallback(() => {
    const newExpanded = expandedModules.filter(id => !collapsibleModuleIds.includes(id));
    setExpandedModules(newExpanded);
    localStorage.setItem(SIDEBAR_EXPANDED_MODULES_KEY, JSON.stringify(newExpanded));
  }, [expandedModules, collapsibleModuleIds]);

  // Toggle expandir/colapsar todos
  const toggleAllModules = useCallback(() => {
    if (allExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }, [allExpanded, expandAll, collapseAll]);

  // Keyboard shortcut: Cmd/Ctrl + B para toggle sidebar, Cmd/Ctrl + Shift + E para toggle módulos, Cmd/Ctrl + / para buscar, Cmd/Ctrl + P para fijar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B para toggle sidebar
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        handleSetCollapsed(!collapsed);
      }
      // Ctrl/Cmd + Shift + E para expandir/colapsar todos los módulos
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        toggleAllModules();
      }
      // Ctrl/Cmd + / para enfocar búsqueda de módulos
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        if (collapsed) {
          handleSetCollapsed(false);
        }
        // Pequeño delay para asegurar que el sidebar esté expandido
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
      // Ctrl/Cmd + P para toggle fijar sidebar
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePinned();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [collapsed, handleSetCollapsed, toggleAllModules, togglePinned]);

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

  // Filtrar módulos según búsqueda
  const filteredModules = useMemo(() => {
    if (!moduleSearch.trim()) return visibleModules;
    
    const searchLower = moduleSearch.toLowerCase().trim();
    return visibleModules.filter(modulo => {
      // Buscar en nombre del módulo
      if (modulo.nombre.toLowerCase().includes(searchLower)) return true;
      // Buscar en nombres de hijos
      return modulo.hijos.some(hijo => hijo.nombre.toLowerCase().includes(searchLower));
    });
  }, [visibleModules, moduleSearch]);

  // Auto-expandir módulos cuando hay coincidencia en submódulos
  useEffect(() => {
    if (!moduleSearch.trim()) {
      setNoResults(false);
      return;
    }
    
    // Detectar si no hay resultados
    if (filteredModules.length === 0) {
      setNoResults(true);
      // Reset después de la animación
      const timer = setTimeout(() => setNoResults(false), 400);
      return () => clearTimeout(timer);
    } else {
      setNoResults(false);
    }
    
    const searchLower = moduleSearch.toLowerCase().trim();
    const modulesToExpand = filteredModules
      .filter(modulo => 
        modulo.hijos.some(hijo => hijo.nombre.toLowerCase().includes(searchLower))
      )
      .map(m => m.id);
    
    if (modulesToExpand.length > 0) {
      setExpandedModules(prev => {
        const newExpanded = [...new Set([...prev, ...modulesToExpand])];
        return newExpanded;
      });
    }
  }, [moduleSearch, filteredModules]);

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
        {!isCollapsed && <span>{item.name}</span>}
      </RouterNavLink>
    );

    if (isCollapsed) {
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
      <div className="group/item relative flex items-center w-full">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <RouterNavLink
              to={modulo.ruta}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm flex-1 min-w-0",
                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
              )}
            >
              {active && (
                <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary ring-2 ring-background transition-all duration-200 animate-pulse-soft" />
              )}
              <IconComponent className="h-4 w-4 shrink-0" />
              {!isCollapsed && (
                <span className="truncate text-left">
                  <HighlightText text={modulo.nombre} search={moduleSearch} />
                </span>
              )}
            </RouterNavLink>
          </TooltipTrigger>
          {!isCollapsed && modulo.nombre.length > 18 && (
            <TooltipContent side="top" sideOffset={4} className="text-xs z-[9999]">
              {modulo.nombre}
            </TooltipContent>
          )}
        </Tooltip>
        
        {/* Botón de favorito visible en hover */}
        {showFavoriteToggle && !isCollapsed && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleFavorite}
                disabled={isAdding || isRemoving}
                className={cn(
                  "absolute right-1 p-1 rounded transition-all duration-200 shrink-0",
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

    if (isCollapsed) {
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

    if (isCollapsed) {
      return (
        <div className="space-y-0.5">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "relative flex items-center justify-center p-2 rounded-md cursor-pointer",
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  hasActiveItem && "bg-primary/10 text-primary"
                )}
                onClick={() => toggleModule(modulo.id)}
              >
                <ModuleIcon className="h-5 w-5" />
                {/* Indicador de item activo */}
                {hasActiveItem && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-sidebar-background animate-pulse-soft" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              sideOffset={8} 
              className="z-[9999] bg-popover border border-border shadow-lg p-3 min-w-[180px] data-[state=delayed-open]:animate-scale-in data-[state=closed]:animate-fade-out"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <ModuleIcon className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm text-foreground">{modulo.nombre}</p>
                </div>
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground">
                  {modulo.hijos.length}
                </span>
              </div>
              <div className="border-t border-border/50 mb-2" />
              <div className="space-y-0.5">
                {modulo.hijos.map(hijo => {
                  const HijoIcon = getIconByName(hijo.icono);
                  return (
                    <RouterNavLink 
                      key={hijo.id} 
                      to={hijo.ruta}
                      className={cn(
                        "flex items-center gap-2 text-sm py-1.5 px-2 rounded transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive(hijo.ruta) 
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-1.5" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <HijoIcon className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isActive(hijo.ruta) ? "text-primary" : "text-muted-foreground"
                      )} />
                      {hijo.nombre}
                    </RouterNavLink>
                  );
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleModule(modulo.id)}>
        <div className="group/parent relative flex items-center">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-md transition-all duration-200 text-sm",
                    "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    hasActiveItem && "text-primary font-medium"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ModuleIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate text-left">
                      <HighlightText text={modulo.nombre} search={moduleSearch} />
                    </span>
                    {/* Contador de items cuando está colapsado */}
                    {!isExpanded && modulo.hijos.length > 0 && (
                      <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-medium rounded-full bg-muted text-muted-foreground shrink-0">
                        {modulo.hijos.length}
                      </span>
                    )}
                  </div>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )} 
                  />
                </button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            {modulo.nombre.length > 16 && (
              <TooltipContent side="top" sideOffset={4} className="text-xs z-[9999]">
                {modulo.nombre}
              </TooltipContent>
            )}
            {/* Tooltip con submódulos cuando está colapsado */}
            {!isExpanded && modulo.hijos.length > 0 && (
              <TooltipContent 
                side="right" 
                sideOffset={8} 
                className="z-[9999] bg-popover border border-border shadow-lg p-3 animate-scale-in min-w-[180px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ModuleIcon className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm text-foreground">{modulo.nombre}</p>
                </div>
                <div className="border-t border-border/50 mb-2" />
                <div className="space-y-0.5">
                  {modulo.hijos.map(hijo => {
                    const HijoIcon = getIconByName(hijo.icono);
                    return (
                      <RouterNavLink 
                        key={hijo.id} 
                        to={hijo.ruta}
                        className={cn(
                          "flex items-center gap-2 text-sm py-1.5 px-2 rounded transition-all duration-200",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive(hijo.ruta) 
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-1.5" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <HijoIcon className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isActive(hijo.ruta) ? "text-primary" : "text-muted-foreground"
                        )} />
                        {hijo.nombre}
                      </RouterNavLink>
                    );
                  })}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
          
          {/* Botón de favorito para módulo padre */}
          {!isCollapsed && (
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
        <CollapsibleContent className="mt-0.5 data-[state=open]:animate-none data-[state=closed]:animate-none">
          <div className={cn(
            "relative ml-[22px] pl-4 border-l-2 space-y-0.5 transition-[border-color] duration-300",
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

  // Calculate actual width during drag or hover-expand
  const sidebarWidth = isDragging && dragWidth !== null 
    ? dragWidth 
    : (collapsed && !isHoverExpanded ? SIDEBAR_MIN_WIDTH : savedWidth);

  // En mobile, el sidebar siempre usa ancho fijo y es absoluto
  const mobileWidth = 280;

  // Si es mobile y no está abierto, no renderizar
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <aside 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "bg-sidebar flex flex-col h-screen",
        // Mobile: posición fija con animación desde la izquierda
        isMobile && "fixed left-0 top-0 z-50 animate-slide-in-from-left shadow-2xl",
        // Desktop: sticky normal con z-index para estar sobre el header
        !isMobile && !isHoverExpanded && "sticky top-0 z-50",
        !isMobile && isHoverExpanded && "fixed left-0 top-0 z-50 shadow-xl",
        (!isDragging || isResetting) && !isMobile && "transition-[width] duration-300 ease-in-out"
      )}
      style={{ width: isMobile ? mobileWidth : sidebarWidth }}
    >
      {/* Drag handle en el borde derecho - Solo desktop */}
      {!isMobile && (
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
      )}
      {/* Header con logo y empresa */}
      <div className={cn(
        "border-b border-sidebar-border overflow-hidden relative z-30 bg-sidebar shrink-0",
        !isMobile && collapsed && !isHoverExpanded ? "p-2" : "p-3"
      )}>
        {/* Layout cuando está colapsado: logo centrado con botón expandir */}
        {!isMobile && collapsed && !isHoverExpanded ? (
          <div className="flex flex-col items-center gap-2">
            {/* Logo siempre visible */}
            <div className="relative">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-sm">DC</span>
              </div>
              {/* Indicador de fijado - visible cuando está colapsado */}
              {pinned && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-sidebar flex items-center justify-center animate-scale-in">
                  <Pin className="h-2 w-2 text-primary-foreground" />
                </div>
              )}
            </div>
            {/* Botón expandir - siempre visible cuando está colapsado */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSetCollapsed(false)}
                  className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <PanelLeft className="h-4 w-4" />
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
        ) : (
          /* Layout cuando está expandido: logo + texto + botones */
          <div className="flex items-center justify-between">
            {/* Logo y texto */}
            <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">DC</span>
                </div>
                {/* Indicador de fijado */}
                {!isMobile && pinned && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-sidebar flex items-center justify-center animate-scale-in">
                    <Pin className="h-2 w-2 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sidebar-foreground text-sm truncate whitespace-nowrap">
                  {empresa?.nombre || 'DNSCloud'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate whitespace-nowrap">
                  {user?.nombre} {user?.apellido}
                </p>
              </div>
            </div>
            
            {/* Botón cerrar para mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSidebar}
                className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            
            {/* Botones desktop cuando está expandido */}
            {!isMobile && (
              <div className="flex items-center gap-1 shrink-0">
                {/* Botón fijar sidebar */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePinned}
                      className={cn(
                        "h-7 w-7 shrink-0 transition-colors",
                        pinned 
                          ? "text-primary hover:text-primary/80 hover:bg-sidebar-accent" 
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      {pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className="z-[9999]">
                    <span>{pinned ? 'Desfijar menú' : 'Fijar menú expandido'}</span>
                  </TooltipContent>
                </Tooltip>
                
                {/* Botón colapsar */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetCollapsed(true)}
                      disabled={pinned}
                      className={cn(
                        "h-7 w-7 shrink-0",
                        pinned 
                          ? "text-sidebar-foreground/30 cursor-not-allowed" 
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className="z-[9999]">
                    <span>{pinned ? 'Desfija para colapsar' : 'Colapsar menú'}</span>
                    {!pinned && (
                      <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted/50 rounded border border-border/50">
                        {shortcutKey}
                      </kbd>
                    )}
                  </TooltipContent>
                </Tooltip>
                
                {/* Botón restablecer ancho */}
                {savedWidth !== SIDEBAR_DEFAULT_WIDTH && (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetSidebarWidth}
                        className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8} className="z-[9999]">
                      <span>Restablecer ancho</span>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección fija: Dashboard + Favoritos */}
      <div className="px-2 pt-3 pb-2 space-y-1 shrink-0">
        {/* Dashboard */}
        <NavItem item={{ name: 'Dashboard', href: '/dashboard', icon: Home }} icon={Home} />

        {/* Favoritos - Con popover cuando está colapsado igual que los módulos */}
        {isCollapsed ? (
          // Modo colapsado: mostrar icono con Tooltip que muestra los favoritos
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "relative flex items-center justify-center p-2 rounded-md cursor-pointer",
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  favoritos.some(fav => {
                    const modulo = modulosArbol.find(m => m.id === fav.modulo_id) || 
                      modulosArbol.flatMap(m => m.hijos).find(h => h.id === fav.modulo_id);
                    return modulo && isActive(modulo.ruta);
                  }) && "bg-primary/10 text-primary"
                )}
              >
                <Bookmark className="h-5 w-5" />
                {/* Indicador de favorito activo */}
                {favoritos.some(fav => {
                  const modulo = modulosArbol.find(m => m.id === fav.modulo_id) || 
                    modulosArbol.flatMap(m => m.hijos).find(h => h.id === fav.modulo_id);
                  return modulo && isActive(modulo.ruta);
                }) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-sidebar-background animate-pulse-soft" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              sideOffset={8} 
              className="z-[9999] bg-popover border border-border shadow-lg p-3 min-w-[180px] data-[state=delayed-open]:animate-scale-in data-[state=closed]:animate-fade-out"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm text-foreground">Favoritos</p>
                </div>
                {favoritos.length > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[10px] font-medium rounded-full bg-primary/15 text-primary">
                    {favoritos.length}
                  </span>
                )}
              </div>
              <div className="border-t border-border/50 mb-2" />
              {favoritos.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Sin favoritos aún</p>
              ) : (
                <div className="space-y-0.5">
                  {favoritos.map(fav => {
                    const modulo = modulosArbol.find(m => m.id === fav.modulo_id) || 
                      modulosArbol.flatMap(m => m.hijos).find(h => h.id === fav.modulo_id);
                    if (!modulo) return null;
                    const FavIcon = getIconByName(modulo.icono);
                    return (
                      <RouterNavLink 
                        key={fav.id} 
                        to={modulo.ruta}
                        className={cn(
                          "flex items-center gap-2 text-sm py-1.5 px-2 rounded transition-all duration-200",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive(modulo.ruta) 
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-1.5" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <FavIcon className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isActive(modulo.ruta) ? "text-primary" : "text-muted-foreground"
                        )} />
                        {modulo.nombre}
                      </RouterNavLink>
                    );
                  })}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          // Modo expandido: sección colapsable con lista de favoritos
          <Collapsible open={favoritosExpanded} onOpenChange={setFavoritosExpanded}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 rounded-md transition-all duration-200 text-sm",
                      "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className="h-4 w-4 shrink-0" />
                      <span className="flex items-center gap-2">
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
                        "h-4 w-4 transition-transform duration-200",
                        favoritosExpanded && "rotate-90"
                      )} 
                    />
                  </button>
                </CollapsibleTrigger>
              </TooltipTrigger>
              {/* Tooltip con favoritos cuando está colapsado el grupo */}
              {!favoritosExpanded && favoritos.length > 0 && (
                <TooltipContent 
                  side="right" 
                  sideOffset={8} 
                  className="z-[9999] bg-popover border border-border shadow-lg p-3 animate-scale-in min-w-[180px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm text-foreground">Favoritos</p>
                  </div>
                  <div className="border-t border-border/50 mb-2" />
                  <div className="space-y-0.5">
                    {favoritos.map(fav => {
                      const modulo = modulosArbol.find(m => m.id === fav.modulo_id) || 
                        modulosArbol.flatMap(m => m.hijos).find(h => h.id === fav.modulo_id);
                      if (!modulo) return null;
                      const FavIcon = getIconByName(modulo.icono);
                      return (
                        <RouterNavLink 
                          key={fav.id} 
                          to={modulo.ruta}
                          className={cn(
                            "flex items-center gap-2 text-sm py-1.5 px-2 rounded transition-all duration-200",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive(modulo.ruta) 
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-1.5" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <FavIcon className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isActive(modulo.ruta) ? "text-primary" : "text-muted-foreground"
                          )} />
                          {modulo.nombre}
                        </RouterNavLink>
                      );
                    })}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
            <CollapsibleContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
              {isLoadingFavoritos ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : favoritos.length === 0 ? (
                <p className="text-xs text-sidebar-foreground/50 px-3 py-2 italic">
                  Sin favoritos aún
                </p>
              ) : (
                <div className="mt-0.5 ml-[22px] pl-4 border-l-2 border-sidebar-border">
                  <SortableFavorites
                    favoritos={favoritos}
                    collapsed={isCollapsed}
                    onReorder={reorderFavoritos}
                    onRemove={toggleFavorito}
                    isRemoving={isRemoving}
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Separador antes del área scrolleable */}
      <div className="border-t border-sidebar-border mx-2 shrink-0" />

      {/* Navigation - Área scrolleable con módulos - scrollbar invisible */}
      <nav ref={navScrollRef} className="flex-1 py-2 px-2 space-y-1 overflow-y-auto overscroll-contain scrollbar-hide min-h-0">

        {/* Módulos dinámicos desde BD */}
        <div className="space-y-1">

          {/* Filtro de búsqueda de módulos - transparente */}
          {!isCollapsed && !isHoverExpanded && visibleModules.length > 3 && (
            <div className="px-2 pb-2 space-y-1 mt-2">
              <div className="flex items-center gap-1">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className={cn("relative flex-1 group", noResults && "animate-shake")}>
                      {isSearching ? (
                        <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary animate-spin pointer-events-none z-10" />
                      ) : (
                        <Search className={cn(
                          "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none z-10 transition-colors",
                          noResults ? "text-destructive" : "text-sidebar-foreground/40 group-focus-within:text-primary"
                        )} />
                      )}
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar..."
                        value={moduleSearchInput}
                        onChange={(e) => setModuleSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            clearSearch();
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className={cn(
                          "h-8 pl-8 pr-14 md:pl-8 md:pr-14 text-xs bg-transparent border-sidebar-border/50 placeholder:text-sidebar-foreground/30 text-sidebar-foreground transition-all duration-200 focus:bg-sidebar-accent/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_8px_hsl(var(--primary)/0.15)]",
                          noResults && "border-destructive/50 focus:border-destructive focus:ring-destructive/20",
                        )}
                      />
                      {/* Badge de atajo de teclado */}
                      {!moduleSearchInput && (
                        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-sidebar-foreground/40 bg-sidebar-accent/50 rounded border border-sidebar-border/30 pointer-events-none transition-opacity group-focus-within:opacity-0">
                          {shortcutSearch}
                        </kbd>
                      )}
                      {moduleSearchInput && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4} className="z-[9999]">
                    <div className="text-xs">
                      <p className="font-medium">Buscar módulos</p>
                      <p className="text-muted-foreground">Escribe para filtrar la lista de módulos</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                {/* Botón expandir/colapsar todos */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleAllModules}
                      className="h-8 w-8 shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      {allExpanded ? (
                        <ChevronsDownUp className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className="z-[9999]">
                    <span>{allExpanded ? 'Colapsar todos' : 'Expandir todos'}</span>
                    <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted/50 rounded border border-border/50">
                      {shortcutModules}
                    </kbd>
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* Contador de resultados y hint */}
              {moduleSearch.trim() && (
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] text-sidebar-foreground/50">
                    {filteredModules.length} de {visibleModules.length} módulos
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/30">
                    <kbd className="px-1 py-0.5 text-[9px] font-mono bg-sidebar-accent/30 rounded">Esc</kbd> limpiar
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Botón expandir/colapsar en modo colapsado */}
          {isCollapsed && collapsibleModuleIds.length > 0 && (
            <div className="flex justify-center pb-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleAllModules}
                    className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    {allExpanded ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="z-[9999]">
                  <span>{allExpanded ? 'Colapsar todos' : 'Expandir todos'}</span>
                  <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted/50 rounded border border-border/50">
                    {shortcutModules}
                  </kbd>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredModules.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2 italic">
              No se encontraron módulos
            </p>
          ) : (
            filteredModules.map(modulo => (
              <ModuleGroup key={modulo.id} modulo={modulo} />
            ))
          )}
        </div>
      </nav>

      {/* Footer con Settings y Help */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {/* Configuración con Popover */}
        <Popover>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                {collapsed ? (
                  <button
                    className={cn(
                      "flex items-center justify-center w-full p-2 rounded-md transition-all duration-200",
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      location.pathname.startsWith('/configuracion') && "bg-primary/10 text-primary"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </button>
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
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                Configuración
              </TooltipContent>
            )}
          </Tooltip>
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
        
        {/* Ayuda y Soporte con Popover */}
        <Popover>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                {collapsed ? (
                  <button
                    className="flex items-center justify-center w-full p-2 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Ayuda y Soporte</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </button>
                )}
              </PopoverTrigger>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                Ayuda y Soporte
              </TooltipContent>
            )}
          </Tooltip>
          <PopoverContent 
            side="right" 
            align="end"
            sideOffset={8}
            className="w-56 p-0 bg-popover border shadow-xl rounded-lg"
          >
            <div className="p-3 border-b">
              <h3 className="font-semibold text-sm">Ayuda y Soporte</h3>
            </div>
            <div className="p-2 space-y-1">
              {/* Documentación */}
              <a
                href="https://docs.dnscloud.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-foreground/80 hover:bg-accent hover:text-foreground"
              >
                <BookOpen className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">Documentación</span>
                  <span className="block text-xs text-muted-foreground">Guías y tutoriales</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              
              {/* Feedback */}
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md transition-all duration-200 text-foreground/80 hover:bg-accent hover:text-foreground text-left"
              >
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">Feedback</span>
                  <span className="block text-xs text-muted-foreground">Sugerencias y reportes</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Modal de Feedback */}
      <FeedbackModal open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen} />
    </aside>
  );
}
