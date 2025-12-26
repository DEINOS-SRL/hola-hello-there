import { useMemo, useState } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { 
  Bookmark,
  GripVertical,
  LayoutGrid as DefaultIcon,
  LucideIcon,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { playPopSound } from '@/lib/sounds';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FavoritoConModulo } from '@/modules/security/hooks/useFavoritos';

// Función para obtener icono dinámicamente por nombre
const getIconByName = (iconName: string): LucideIcon => {
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && typeof icon === 'function') {
    return icon as LucideIcon;
  }
  return DefaultIcon;
};

interface SortableFavoriteItemProps {
  fav: FavoritoConModulo;
  collapsed: boolean;
  isActive: boolean;
  onRemove: (moduloId: string) => void;
  isRemoving: boolean;
  isOverBefore?: boolean;
  isOverAfter?: boolean;
  isDraggingAny?: boolean;
}

function SortableFavoriteItem({ 
  fav, 
  collapsed, 
  isActive,
  onRemove,
  isRemoving,
  isOverBefore,
  isOverAfter,
  isDraggingAny,
}: SortableFavoriteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fav.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = getIconByName(fav.modulo.icono);

  const handleRemoveFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(fav.modulo_id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/fav relative flex flex-col transition-all duration-200",
        isDragging && "opacity-30 scale-95"
      )}
    >
      {/* Drop indicator - línea superior */}
      <div 
        className={cn(
          "absolute -top-[3px] left-0 right-0 h-[2px] rounded-full transition-all duration-150",
          isOverBefore 
            ? "bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]" 
            : "bg-transparent"
        )}
      />
      
      <div className="relative flex items-center">
      {/* Drag handle */}
      {!collapsed && (
        <button
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -left-5 p-0.5 cursor-grab active:cursor-grabbing text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-all duration-200",
            "opacity-0 group-hover/fav:opacity-100"
          )}
        >
          <GripVertical className="h-3 w-3" />
        </button>
      )}
      
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <RouterNavLink
            to={fav.modulo.ruta}
            className={cn(
              "relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm flex-1 min-w-0",
              "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
            )}
          >
            <IconComponent className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate text-left">{fav.modulo.nombre}</span>}
          </RouterNavLink>
        </TooltipTrigger>
        {!collapsed && fav.modulo.nombre.length > 18 && (
          <TooltipContent side="top" sideOffset={4} className="text-xs z-[9999]">
            {fav.modulo.nombre}
          </TooltipContent>
        )}
      </Tooltip>
      
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
          <TooltipContent side="right" sideOffset={8} className="text-xs z-[9999]">
            Quitar de favoritos
          </TooltipContent>
        </Tooltip>
      )}
      </div>
      
      {/* Drop indicator - línea inferior (solo para el último elemento) */}
      <div 
        className={cn(
          "absolute -bottom-[3px] left-0 right-0 h-[2px] rounded-full transition-all duration-150",
          isOverAfter 
            ? "bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]" 
            : "bg-transparent"
        )}
      />
    </div>
  );
}

// Componente overlay que se muestra mientras se arrastra
interface DragOverlayItemProps {
  fav: FavoritoConModulo;
  isActive: boolean;
}

function DragOverlayItem({ fav, isActive }: DragOverlayItemProps) {
  const IconComponent = getIconByName(fav.modulo.icono);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
        "bg-sidebar border border-primary/30 shadow-lg shadow-primary/20",
        "scale-105 rotate-1",
        isActive 
          ? "bg-primary text-primary-foreground font-medium" 
          : "text-sidebar-foreground"
      )}
      style={{
        boxShadow: '0 10px 25px -5px hsl(var(--primary) / 0.25), 0 8px 10px -6px hsl(var(--primary) / 0.15)',
      }}
    >
      <GripVertical className="h-3 w-3 text-current/50 shrink-0" />
      <IconComponent className="h-4 w-4 shrink-0" />
      <span className="truncate">{fav.modulo.nombre}</span>
    </div>
  );
}

interface SortableFavoritesProps {
  favoritos: FavoritoConModulo[];
  collapsed: boolean;
  onReorder: (newOrder: FavoritoConModulo[]) => void;
  onRemove: (moduloId: string) => void;
  isRemoving: boolean;
}

export function SortableFavorites({
  favoritos,
  collapsed,
  onReorder,
  onRemove,
  isRemoving,
}: SortableFavoritesProps) {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemIds = useMemo(() => favoritos.map(f => f.id), [favoritos]);
  const activeFav = useMemo(() => favoritos.find(f => f.id === activeId), [favoritos, activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (over && active.id !== over.id) {
      const oldIndex = favoritos.findIndex(f => f.id === active.id);
      const newIndex = favoritos.findIndex(f => f.id === over.id);
      const newOrder = arrayMove(favoritos, oldIndex, newIndex);
      
      // Reproducir sonido sutil al soltar
      playPopSound();
      onReorder(newOrder);
    }
  };

  if (collapsed) {
    // En modo colapsado, mostrar sin drag and drop
    return (
      <div className="space-y-1 flex flex-col items-center">
        {favoritos.map(fav => {
          const IconComponent = getIconByName(fav.modulo.icono);
          const active = isActive(fav.modulo.ruta);
          
          return (
            <Tooltip key={fav.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <RouterNavLink
                  to={fav.modulo.ruta}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200",
                    "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    active && "bg-primary text-primary-foreground"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                </RouterNavLink>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="font-medium z-[9999]">
                {fav.modulo.nombre}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {favoritos.map((fav, index) => {
            // Determinar si mostrar indicador arriba o abajo
            const activeIndex = activeId ? favoritos.findIndex(f => f.id === activeId) : -1;
            const overIndex = overId ? favoritos.findIndex(f => f.id === overId) : -1;
            const currentIndex = index;
            
            // Mostrar línea arriba si estamos sobre este elemento y venimos de abajo
            const isOverBefore = overId === fav.id && activeIndex > overIndex;
            // Mostrar línea abajo si estamos sobre este elemento y venimos de arriba
            const isOverAfter = overId === fav.id && activeIndex < overIndex;
            
            return (
              <SortableFavoriteItem
                key={fav.id}
                fav={fav}
                collapsed={collapsed}
                isActive={isActive(fav.modulo.ruta)}
                onRemove={onRemove}
                isRemoving={isRemoving}
                isOverBefore={isOverBefore}
                isOverAfter={isOverAfter}
                isDraggingAny={!!activeId}
              />
            );
          })}
        </div>
      </SortableContext>
      
      {/* Drag Overlay - elemento flotante mientras se arrastra */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeFav ? (
          <DragOverlayItem 
            fav={activeFav} 
            isActive={isActive(activeFav.modulo.ruta)} 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
