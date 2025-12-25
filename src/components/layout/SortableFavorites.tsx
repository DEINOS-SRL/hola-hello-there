import { useMemo } from 'react';
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
}

function SortableFavoriteItem({ 
  fav, 
  collapsed, 
  isActive,
  onRemove,
  isRemoving,
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
        "group/fav relative flex items-center",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Drag handle */}
      {!collapsed && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-5 p-0.5 opacity-0 group-hover/fav:opacity-100 cursor-grab active:cursor-grabbing text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-opacity"
        >
          <GripVertical className="h-3 w-3" />
        </button>
      )}
      
      <RouterNavLink
        to={fav.modulo.ruta}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm flex-1",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = favoritos.findIndex(f => f.id === active.id);
      const newIndex = favoritos.findIndex(f => f.id === over.id);
      const newOrder = arrayMove(favoritos, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (collapsed) {
    // En modo colapsado, mostrar sin drag and drop
    return (
      <div className="space-y-0.5">
        {favoritos.map(fav => {
          const IconComponent = getIconByName(fav.modulo.icono);
          const active = isActive(fav.modulo.ruta);
          
          return (
            <Tooltip key={fav.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <RouterNavLink
                  to={fav.modulo.ruta}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md transition-all duration-200",
                    "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    active && "bg-primary text-primary-foreground"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                </RouterNavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
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
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {favoritos.map(fav => (
            <SortableFavoriteItem
              key={fav.id}
              fav={fav}
              collapsed={collapsed}
              isActive={isActive(fav.modulo.ruta)}
              onRemove={onRemove}
              isRemoving={isRemoving}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
