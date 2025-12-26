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
  Edit,
  User,
  ArrowLeftRight,
  DollarSign,
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
import { Badge } from '@/components/ui/badge';
import { useModulosDB } from '@/modules/security/hooks/useModulos';
import { useFavoritos } from '@/modules/security/hooks/useFavoritos';
import { useEmpleados } from '@/modules/employees/hooks/useEmpleados';
import { useMovimientos } from '@/modules/operacion/hooks/useMovimientos';
import { usePresupuestos } from '@/modules/comercial/hooks/usePresupuestos';
import { useEquipos } from '@/modules/equipos/hooks/useEquipos';

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
  shortcut?: string; // Atajo de teclado (ej: "⌘⇧E" o "Ctrl+Shift+E")
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
    shortcut: '⇧E',
  },
  {
    id: 'new-equipo',
    label: 'Nuevo Equipo',
    description: 'Registrar un nuevo equipo',
    icon: Truck,
    action: 'navigate',
    target: '/equipos/listado?action=new',
    keywords: ['crear', 'agregar', 'equipo', 'maquinaria', 'vehículo'],
    shortcut: '⇧Q',
  },
  {
    id: 'new-movement',
    label: 'Nuevo Movimiento',
    description: 'Registrar movimiento de equipo',
    icon: Truck,
    action: 'navigate',
    target: '/operacion/movimientos?action=new',
    keywords: ['crear', 'movimiento', 'traslado'],
    shortcut: '⇧M',
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
  {
    id: 'new-presupuesto',
    label: 'Nuevo Presupuesto',
    description: 'Crear un nuevo presupuesto comercial',
    icon: DollarSign,
    action: 'navigate',
    target: '/comercial/presupuestos?action=new',
    keywords: ['crear', 'presupuesto', 'comercial', 'venta', 'cotización'],
    shortcut: '⇧P',
  },
];

// Navegación rápida
const quickNavigation = [
  { id: 'dashboard', label: 'Ir al Dashboard', icon: Home, target: '/dashboard' },
  { id: 'settings', label: 'Configuración', icon: Settings, target: '/configuracion' },
];

// Interfaz para registros editables
interface EditableRecord {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  route: string;
  keywords: string[];
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { modulos } = useModulosDB();
  const { favoritos } = useFavoritos();
  const { empleados } = useEmpleados();
  const { movimientos } = useMovimientos();
  const { data: presupuestos } = usePresupuestos();
  const { data: equipos } = useEquipos();

  // Detectar si es Mac
  const isMac = useMemo(() => 
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0, 
  []);

  // Keyboard shortcuts: Cmd/Ctrl + K para búsqueda, Ctrl+Shift+E para nuevo empleado, etc.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K para búsqueda
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      // Ctrl/Cmd + Shift + E para nuevo empleado
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        navigate('/rrhh/empleados?action=new');
      }
      // Ctrl/Cmd + Shift + Q para nuevo equipo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        navigate('/equipos/listado?action=new');
      }
      // Ctrl/Cmd + Shift + P para nuevo presupuesto
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        navigate('/comercial/presupuestos?action=new');
      }
      // Ctrl/Cmd + Shift + M para nuevo movimiento
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        navigate('/operacion/movimientos?action=new');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Registros recientes para editar (limitado a 12 total)
  const MAX_RECENT_RECORDS = 12;
  const recentRecords = useMemo((): EditableRecord[] => {
    const records: EditableRecord[] = [];

    // Últimos 3 empleados (reducido para balancear)
    const recentEmpleados = [...empleados]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3);

    recentEmpleados.forEach(emp => {
      records.push({
        id: `emp-${emp.id}`,
        label: `${emp.nombre} ${emp.apellido}`,
        description: `Empleado · ${emp.cargo || 'Sin cargo'}`,
        icon: User,
        route: `/rrhh/empleados?action=edit&id=${emp.id}`,
        keywords: ['editar', 'empleado', emp.nombre, emp.apellido, emp.legajo || '', emp.email || ''],
      });
    });

    // Últimos 3 movimientos
    const recentMovimientos = [...movimientos]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3);

    recentMovimientos.forEach(mov => {
      records.push({
        id: `mov-${mov.id}`,
        label: mov.equipo_descripcion,
        description: `Movimiento · ${mov.origen} → ${mov.destino}`,
        icon: ArrowLeftRight,
        route: `/operacion/movimientos?action=edit&id=${mov.id}`,
        keywords: ['editar', 'movimiento', mov.equipo_descripcion, mov.origen, mov.destino],
      });
    });

    // Configuración de badges para estados de presupuesto
    const presupuestoBadgeConfig: Record<string, { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      borrador: { text: 'Borrador', variant: 'secondary', className: 'bg-gray-100 text-gray-700 border-gray-300' },
      enviado: { text: 'Enviado', variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-300' },
      aprobado: { text: 'Aprobado', variant: 'default', className: 'bg-green-100 text-green-700 border-green-300' },
      rechazado: { text: 'Rechazado', variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-300' },
      vencido: { text: 'Vencido', variant: 'outline', className: 'bg-orange-100 text-orange-700 border-orange-300' },
    };

    // Últimos 3 presupuestos
    const recentPresupuestos = [...(presupuestos || [])]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3);

    recentPresupuestos.forEach(pres => {
      const badgeConfig = presupuestoBadgeConfig[pres.estado];
      records.push({
        id: `pres-${pres.id}`,
        label: `${pres.numero} - ${pres.cliente}`,
        description: 'Presupuesto',
        icon: DollarSign,
        route: `/comercial/presupuestos?action=edit&id=${pres.id}`,
        keywords: ['editar', 'presupuesto', pres.numero, pres.cliente, pres.estado],
        badge: badgeConfig ? {
          text: badgeConfig.text,
          variant: badgeConfig.variant,
          className: badgeConfig.className,
        } : undefined,
      });
    });

    // Configuración de badges para estados de equipo
    const equipoBadgeConfig: Record<string, { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      activo: { text: 'Activo', variant: 'default', className: 'bg-green-100 text-green-700 border-green-300' },
      inactivo: { text: 'Inactivo', variant: 'secondary', className: 'bg-gray-100 text-gray-700 border-gray-300' },
      mantenimiento: { text: 'Mantenimiento', variant: 'outline', className: 'bg-amber-100 text-amber-700 border-amber-300' },
      baja: { text: 'Baja', variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-300' },
    };

    // Últimos 3 equipos
    const recentEquipos = [...(equipos || [])]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3);

    recentEquipos.forEach(eq => {
      const badgeConfig = equipoBadgeConfig[eq.estado];
      records.push({
        id: `eq-${eq.id}`,
        label: `${eq.codigo} - ${eq.nombre}`,
        description: eq.tipo_equipo?.nombre || 'Equipo',
        icon: Truck,
        route: `/equipos/listado?action=edit&id=${eq.id}`,
        keywords: ['editar', 'equipo', eq.codigo, eq.nombre, eq.tipo_equipo?.nombre || '', eq.estado],
        badge: badgeConfig ? {
          text: badgeConfig.text,
          variant: badgeConfig.variant,
          className: badgeConfig.className,
        } : undefined,
      });
    });

    // Limitar a MAX_RECENT_RECORDS total
    return records.slice(0, MAX_RECENT_RECORDS);
  }, [empleados, movimientos, presupuestos, equipos]);

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

  const handleEditRecord = useCallback((record: EditableRecord) => {
    setOpen(false);
    navigate(record.route);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar módulos, registros, acciones..." />
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
              <div className="flex flex-col flex-1">
                <span className="font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
              {action.shortcut ? (
                <kbd className="ml-auto px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono text-muted-foreground">
                  {isMac ? '⌘' : 'Ctrl+'}{action.shortcut}
                </kbd>
              ) : (
                <Plus className="ml-auto h-3 w-3 text-muted-foreground" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Registros Recientes para Editar */}
        {recentRecords.length > 0 && (
          <>
            <CommandGroup heading="Editar Recientes">
              {recentRecords.map(record => (
                <CommandItem
                  key={record.id}
                  value={`editar ${record.label} ${record.keywords.join(' ')}`}
                  onSelect={() => handleEditRecord(record)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted mr-3">
                    <record.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{record.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{record.description}</span>
                      {record.badge && (
                        <Badge 
                          variant={record.badge.variant} 
                          className={`text-[10px] px-1.5 py-0 h-4 ${record.badge.className}`}
                        >
                          {record.badge.text}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Edit className="ml-auto h-3 w-3 text-muted-foreground shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

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

      <div className="border-t border-border p-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-4 mb-1.5">
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
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/70">
          <span><kbd className="px-1 py-0.5 bg-muted/50 rounded font-mono">{isMac ? '⌘' : 'Ctrl'}+⇧+E</kbd> Empleado</span>
          <span><kbd className="px-1 py-0.5 bg-muted/50 rounded font-mono">{isMac ? '⌘' : 'Ctrl'}+⇧+Q</kbd> Equipo</span>
          <span><kbd className="px-1 py-0.5 bg-muted/50 rounded font-mono">{isMac ? '⌘' : 'Ctrl'}+⇧+P</kbd> Presupuesto</span>
          <span><kbd className="px-1 py-0.5 bg-muted/50 rounded font-mono">{isMac ? '⌘' : 'Ctrl'}+⇧+M</kbd> Movimiento</span>
        </div>
      </div>
    </CommandDialog>
  );
}
