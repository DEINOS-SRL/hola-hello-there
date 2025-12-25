import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { 
  LayoutGrid as DefaultIcon, 
  LucideIcon,
  Plus,
  UserPlus,
  Truck,
  FileText,
  Wrench,
  Award,
  Settings,
  Home,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useModulosDB } from '@/modules/security/hooks/useModulos';
import { useFavoritos } from '@/modules/security/hooks/useFavoritos';

// Función para obtener icono dinámicamente por nombre
const getIconByName = (iconName: string): LucideIcon => {
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && typeof icon === 'function') {
    return icon as LucideIcon;
  }
  return DefaultIcon;
};

// Acciones rápidas disponibles
interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  action: 'navigate' | 'event';
  target: string; // ruta o nombre de evento
  keywords: string[];
}

const quickActions: QuickAction[] = [
  {
    id: 'new-employee',
    label: 'Nuevo Empleado',
    description: 'Registrar un nuevo empleado',
    icon: UserPlus,
    action: 'navigate',
    target: '/rrhh/empleados?action=new',
    keywords: ['crear', 'agregar', 'empleado', 'persona', 'rrhh'],
  },
  {
    id: 'new-movement',
    label: 'Nuevo Movimiento',
    description: 'Registrar movimiento de equipo',
    icon: Truck,
    action: 'navigate',
    target: '/operacion/movimientos?action=new',
    keywords: ['crear', 'movimiento', 'equipo', 'traslado'],
  },
  {
    id: 'new-part',
    label: 'Nuevo Parte de Equipo',
    description: 'Registrar parte diario',
    icon: FileText,
    action: 'navigate',
    target: '/equipos/partes?action=new',
    keywords: ['crear', 'parte', 'diario', 'registro'],
  },
  {
    id: 'new-maintenance',
    label: 'Nuevo Mantenimiento',
    description: 'Programar mantenimiento de equipo',
    icon: Wrench,
    action: 'navigate',
    target: '/equipos/mantenimientos?action=new',
    keywords: ['crear', 'mantenimiento', 'reparación', 'servicio'],
  },
  {
    id: 'new-certification',
    label: 'Nueva Certificación',
    description: 'Registrar certificación o habilitación',
    icon: Award,
    action: 'navigate',
    target: '/habilitaciones/certificaciones?action=new',
    keywords: ['crear', 'certificación', 'habilitación', 'licencia'],
  },
];

// Navegación rápida
const quickNavigation = [
  { id: 'dashboard', label: 'Ir al Dashboard', icon: Home, target: '/dashboard' },
  { id: 'settings', label: 'Configuración', icon: Settings, target: '/configuracion' },
];

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { modulos } = useModulosDB();
  const { favoritos } = useFavoritos();

  // Detectar si es Mac
  const isMac = useMemo(() => 
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0, 
  []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Módulos favoritos
  const favoritosModulos = useMemo(() => 
    favoritos.map(f => f.modulo),
  [favoritos]);

  // Todos los módulos (aplanados)
  const allModulos = useMemo(() => {
    const result: Array<{ id: string; nombre: string; ruta: string; icono: string }> = [];
    
    modulos.forEach(modulo => {
      if (modulo.ruta) {
        result.push({
          id: modulo.id,
          nombre: modulo.nombre,
          ruta: modulo.ruta,
          icono: modulo.icono,
        });
      }
    });
    
    return result;
  }, [modulos]);

  const handleSelect = useCallback((ruta: string) => {
    setOpen(false);
    navigate(ruta);
  }, [navigate]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    setOpen(false);
    if (action.action === 'navigate') {
      navigate(action.target);
    } else {
      // Disparar evento personalizado para acciones
      window.dispatchEvent(new CustomEvent('quick-action', { detail: action.id }));
    }
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar módulos, acciones rápidas..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        {/* Acciones Rápidas */}
        <CommandGroup heading="Acciones Rápidas">
          {quickActions.map(action => (
            <CommandItem
              key={action.id}
              value={`${action.label} ${action.keywords.join(' ')}`}
              onSelect={() => handleQuickAction(action)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 mr-3">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
              <Plus className="ml-auto h-3 w-3 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navegación Rápida */}
        <CommandGroup heading="Navegación">
          {quickNavigation.map(nav => (
            <CommandItem
              key={nav.id}
              value={nav.label}
              onSelect={() => handleSelect(nav.target)}
              className="cursor-pointer"
            >
              <nav.icon className="mr-2 h-4 w-4" />
              <span>{nav.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        
        {/* Favoritos */}
        {favoritosModulos.length > 0 && (
          <>
            <CommandGroup heading="Favoritos">
              {favoritosModulos.map(modulo => {
                const IconComponent = getIconByName(modulo.icono);
                return (
                  <CommandItem
                    key={modulo.id}
                    value={`favorito ${modulo.nombre}`}
                    onSelect={() => handleSelect(modulo.ruta)}
                    className="cursor-pointer"
                  >
                    <IconComponent className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>{modulo.nombre}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Todos los módulos */}
        <CommandGroup heading="Todos los módulos">
          {allModulos.map(modulo => {
            const IconComponent = getIconByName(modulo.icono);
            const isFav = favoritosModulos.some(f => f.id === modulo.id);
            
            return (
              <CommandItem
                key={modulo.id}
                value={`modulo ${modulo.nombre}`}
                onSelect={() => handleSelect(modulo.ruta)}
                className="cursor-pointer"
              >
                <IconComponent className={`mr-2 h-4 w-4 ${isFav ? 'text-yellow-500' : ''}`} />
                <span>{modulo.nombre}</span>
                {isFav && (
                  <LucideIcons.Bookmark className="ml-auto h-3 w-3 text-yellow-500 fill-yellow-500" />
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>

      <div className="border-t border-border p-2 text-xs text-muted-foreground flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
          navegar
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
          seleccionar
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">esc</kbd>
          cerrar
        </span>
      </div>
    </CommandDialog>
  );
}
