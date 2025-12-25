import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Search, LayoutGrid as DefaultIcon, LucideIcon } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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

  const handleSelect = (ruta: string) => {
    setOpen(false);
    navigate(ruta);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar módulos, páginas..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        {favoritosModulos.length > 0 && (
          <CommandGroup heading="Favoritos">
            {favoritosModulos.map(modulo => {
              const IconComponent = getIconByName(modulo.icono);
              return (
                <CommandItem
                  key={modulo.id}
                  value={modulo.nombre}
                  onSelect={() => handleSelect(modulo.ruta)}
                  className="cursor-pointer"
                >
                  <IconComponent className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>{modulo.nombre}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        <CommandGroup heading="Todos los módulos">
          {allModulos.map(modulo => {
            const IconComponent = getIconByName(modulo.icono);
            const isFav = favoritosModulos.some(f => f.id === modulo.id);
            
            return (
              <CommandItem
                key={modulo.id}
                value={modulo.nombre}
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
