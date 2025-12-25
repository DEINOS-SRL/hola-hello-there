import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, LayoutGrid, MoreHorizontal, Edit, Trash2, Loader2, ToggleLeft, ToggleRight, ChevronRight, ChevronDown, FolderTree, GripVertical } from 'lucide-react';
import { 
  DndContext, 
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { segClient } from '@/modules/security/services/segClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { ModuloModal } from '@/components/modals/ModuloModal';

interface Modulo {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  modulo_padre_id?: string | null;
  orden: number;
}

interface ModuloConHijos extends Modulo {
  hijos: ModuloConHijos[];
}

// Construye el árbol jerárquico de módulos
function buildModuloTree(modulos: Modulo[]): ModuloConHijos[] {
  const modulosMap = new Map<string, ModuloConHijos>();
  
  modulos.forEach(m => {
    modulosMap.set(m.id, { ...m, hijos: [] });
  });
  
  const raices: ModuloConHijos[] = [];
  
  modulos.forEach(m => {
    const nodo = modulosMap.get(m.id)!;
    if (m.modulo_padre_id && modulosMap.has(m.modulo_padre_id)) {
      modulosMap.get(m.modulo_padre_id)!.hijos.push(nodo);
    } else {
      raices.push(nodo);
    }
  });
  
  const sortNodes = (nodes: ModuloConHijos[]) => {
    nodes.sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
    nodes.forEach(n => sortNodes(n.hijos));
  };
  sortNodes(raices);
  
  return raices;
}

// Flattens tree for sorting context
function flattenTree(nodes: ModuloConHijos[], expandedIds: Set<string>): ModuloConHijos[] {
  const result: ModuloConHijos[] = [];
  const traverse = (items: ModuloConHijos[]) => {
    items.forEach(item => {
      result.push(item);
      if (item.hijos.length > 0 && expandedIds.has(item.id)) {
        traverse(item.hijos);
      }
    });
  };
  traverse(nodes);
  return result;
}

interface SortableModuloItemProps {
  modulo: ModuloConHijos;
  nivel: number;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  openEditModal: (modulo: Modulo) => void;
  toggleModuloStatus: (id: string, status: boolean) => void;
  onDeleteClick: (modulo: Modulo) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

function SortableModuloItem({ 
  modulo, 
  nivel, 
  expandedIds, 
  toggleExpanded, 
  openEditModal, 
  toggleModuloStatus,
  onDeleteClick,
  isDragging,
  isOverlay
}: SortableModuloItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: modulo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tieneHijos = modulo.hijos.length > 0;
  const isExpanded = expandedIds.has(modulo.id);

  return (
    <div ref={setNodeRef} style={style} className="animate-fade-in">
      <Collapsible open={isExpanded} onOpenChange={() => tieneHijos && toggleExpanded(modulo.id)}>
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${nivel > 0 ? 'ml-6 border-l-2 border-l-primary/20' : ''} ${isOverlay ? 'shadow-lg ring-2 ring-primary' : ''}`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted touch-none"
              aria-label="Arrastrar para reordenar"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {tieneHijos ? (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
            ) : (
              <div className="w-6 h-6 shrink-0" />
            )}
            
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${nivel === 0 ? 'bg-primary/10' : 'bg-secondary'}`}>
              {tieneHijos ? (
                <FolderTree className={`h-4 w-4 ${nivel === 0 ? 'text-primary' : 'text-secondary-foreground'}`} />
              ) : (
                <LayoutGrid className={`h-4 w-4 ${nivel === 0 ? 'text-primary' : 'text-secondary-foreground'}`} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{modulo.nombre}</span>
                {tieneHijos && (
                  <Badge variant="outline" className="text-xs">
                    {modulo.hijos.length} submódulo{modulo.hijos.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {modulo.descripcion && (
                <p className="text-sm text-muted-foreground truncate">{modulo.descripcion}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={modulo.activo ? 'default' : 'secondary'} className="hidden sm:inline-flex">
              {modulo.activo ? 'Activo' : 'Inactivo'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditModal(modulo)}>
                  <Edit className="mr-2 h-4 w-4" />Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleModuloStatus(modulo.id, modulo.activo)}>
                  {modulo.activo ? (
                    <><ToggleLeft className="mr-2 h-4 w-4" />Desactivar</>
                  ) : (
                    <><ToggleRight className="mr-2 h-4 w-4" />Activar</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDeleteClick(modulo)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {tieneHijos && (
          <CollapsibleContent className="mt-2 space-y-2">
            <SortableContext items={modulo.hijos.map(h => h.id)} strategy={verticalListSortingStrategy}>
              {modulo.hijos.map(hijo => (
                <SortableModuloItem 
                  key={hijo.id} 
                  modulo={hijo} 
                  nivel={nivel + 1}
                  expandedIds={expandedIds}
                  toggleExpanded={toggleExpanded}
                  openEditModal={openEditModal}
                  toggleModuloStatus={toggleModuloStatus}
                  onDeleteClick={onDeleteClick}
                />
              ))}
            </SortableContext>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export default function Modulos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduloToDelete, setModuloToDelete] = useState<Modulo | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: modulos, isLoading, error, refetch } = useQuery({
    queryKey: ['modulos'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('modulos')
        .select('*')
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true });
      if (error) throw error;
      return data as Modulo[];
    },
  });

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (modulos) {
      setExpandedIds(new Set(modulos.map(m => m.id)));
    }
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const toggleModuloStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await segClient
      .from('modulos')
      .update({ activo: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: `Módulo ${!currentStatus ? 'activado' : 'desactivado'}` });
      refetch();
    }
  };

  const confirmDelete = async () => {
    if (!moduloToDelete) return;
    
    const { error } = await segClient
      .from('modulos')
      .delete()
      .eq('id', moduloToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el módulo', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Módulo eliminado' });
      refetch();
    }
    setDeleteDialogOpen(false);
    setModuloToDelete(null);
  };

  const openEditModal = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingModulo(null);
    setModalOpen(true);
  };

  // Filtrar módulos por búsqueda
  const filtered = useMemo(() => 
    modulos?.filter((m: Modulo) => 
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [],
    [modulos, searchTerm]
  );

  // Construir árbol jerárquico
  const arbol = useMemo(() => buildModuloTree(filtered), [filtered]);

  // Get active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId || !modulos) return null;
    return modulos.find(m => m.id === activeId) || null;
  }, [activeId, modulos]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Could add drop zone indicators here
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !modulos) return;

    const activeModulo = modulos.find(m => m.id === active.id);
    const overModulo = modulos.find(m => m.id === over.id);

    if (!activeModulo || !overModulo) return;

    // Determine new parent and order
    const newParentId = overModulo.modulo_padre_id;
    
    // Get siblings (modules with same parent)
    const siblings = modulos.filter(m => m.modulo_padre_id === newParentId && m.id !== active.id);
    const overIndex = siblings.findIndex(m => m.id === over.id);
    
    // Calculate new order
    let newOrder: number;
    if (overIndex === 0) {
      newOrder = overModulo.orden - 1;
    } else if (overIndex === siblings.length - 1) {
      newOrder = overModulo.orden + 1;
    } else {
      const prevSibling = siblings[overIndex - 1];
      newOrder = Math.floor((prevSibling.orden + overModulo.orden) / 2);
    }

    // Update in database
    const { error } = await segClient
      .from('modulos')
      .update({ 
        modulo_padre_id: newParentId,
        orden: newOrder
      })
      .eq('id', active.id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo reordenar el módulo', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Módulo reordenado' });
      refetch();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar módulos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Módulos</h1>
          <p className="text-muted-foreground">Gestiona los módulos de la plataforma. Arrastra para reordenar.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Nuevo Módulo
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar módulos..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                <ChevronDown className="mr-1 h-3 w-3" />Expandir
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                <ChevronRight className="mr-1 h-3 w-3" />Colapsar
              </Button>
              <Badge variant="outline">{filtered.length} módulos</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : arbol.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <FolderTree className="h-10 w-10 mb-2 opacity-50" />
              <p>No se encontraron módulos</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={arbol.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {arbol.map(modulo => (
                    <SortableModuloItem 
                      key={modulo.id} 
                      modulo={modulo}
                      nivel={0}
                      expandedIds={expandedIds}
                      toggleExpanded={toggleExpanded}
                      openEditModal={openEditModal}
                      toggleModuloStatus={toggleModuloStatus}
                      onDeleteClick={(m) => {
                        setModuloToDelete(m);
                        setDeleteDialogOpen(true);
                      }}
                      isDragging={activeId === modulo.id}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeItem ? (
                  <div className="p-3 rounded-lg border bg-card shadow-lg ring-2 ring-primary">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10">
                        <LayoutGrid className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{activeItem.nombre}</span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <ModuloModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        modulo={editingModulo}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el módulo "{moduloToDelete?.nombre}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
