import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Loader2, 
  Zap, 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  Package, 
  Settings,
  Plus,
  X
} from 'lucide-react';
import { segClient } from '@/modules/security/services/segClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const funcionalidadSchema = z.object({
  modulo_id: z.string().uuid('Seleccione un módulo'),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  acciones: z.array(z.string()).default(['read', 'create', 'update', 'delete']),
  orden: z.number().min(0, 'El orden debe ser un número positivo'),
});

type FuncionalidadFormData = z.infer<typeof funcionalidadSchema>;

interface FuncionalidadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionalidad?: any;
  onSuccess: () => void;
}

interface SeccionTreeNode {
  id: string;
  codigo: string;
  nombre: string;
  modulos?: ModuloTreeNode[];
}

interface ModuloTreeNode {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  seccion_nombre: string;
  funcionalidades?: FuncionalidadTreeNode[];
}

interface FuncionalidadTreeNode {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  acciones?: string[];
  orden: number;
}

const accionesPredefinidas = [
  { value: 'read', label: 'Leer / Ver', color: 'bg-blue-100 text-blue-800' },
  { value: 'create', label: 'Crear', color: 'bg-green-100 text-green-800' },
  { value: 'update', label: 'Actualizar', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'delete', label: 'Eliminar', color: 'bg-red-100 text-red-800' },
  { value: 'approve', label: 'Aprobar', color: 'bg-purple-100 text-purple-800' },
  { value: 'export', label: 'Exportar', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'print', label: 'Imprimir', color: 'bg-gray-100 text-gray-800' },
];

export function FuncionalidadModal({ open, onOpenChange, funcionalidad, onSuccess }: FuncionalidadModalProps) {
  const { toast } = useToast();
  const isEditing = !!funcionalidad;
  const [modulos, setModulos] = useState<any[]>([]);
  const [funcionalidadTree, setFuncionalidadTree] = useState<SeccionTreeNode[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedAcciones, setSelectedAcciones] = useState<string[]>(['read', 'create', 'update', 'delete']);
  const [nuevaAccion, setNuevaAccion] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FuncionalidadFormData>({
    resolver: zodResolver(funcionalidadSchema),
    defaultValues: {
      modulo_id: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      acciones: ['read', 'create', 'update', 'delete'],
      orden: 0,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadModulos = async () => {
      if (!open) return;
      
      try {
        setLoadingData(true);
        const { data, error } = await segClient
          .from('modulos')
          .select(`
            id, 
            codigo, 
            nombre,
            secciones!inner(nombre)
          `)
          .order('codigo');

        if (error) throw error;
        
        const modulosConSeccion = (data || []).map(modulo => ({
          ...modulo,
          seccion_nombre: (modulo.secciones as any)?.nombre || 'Sin sección'
        }));
        
        setModulos(modulosConSeccion);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los módulos',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadModulos();
  }, [open, toast]);

  useEffect(() => {
    if (funcionalidad) {
      const acciones = Array.isArray(funcionalidad.acciones) 
        ? funcionalidad.acciones 
        : ['read', 'create', 'update', 'delete'];
      
      setSelectedAcciones(acciones);
      reset({
        modulo_id: funcionalidad.modulo_id,
        codigo: funcionalidad.codigo,
        nombre: funcionalidad.nombre,
        descripcion: funcionalidad.descripcion || '',
        acciones: acciones,
        orden: funcionalidad.orden || 0,
      });
    } else {
      setSelectedAcciones(['read', 'create', 'update', 'delete']);
      reset({
        modulo_id: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        acciones: ['read', 'create', 'update', 'delete'],
        orden: 0,
      });
    }
  }, [funcionalidad, reset]);

  useEffect(() => {
    setValue('acciones', selectedAcciones);
  }, [selectedAcciones, setValue]);

  useEffect(() => {
    const loadFuncionalidadTree = async () => {
      if (!open) return;
      
      try {
        setLoadingTree(true);
        
        const [seccionesResult, modulosResult, funcionalidadesResult] = await Promise.all([
          segClient.from('secciones').select('*').order('orden, nombre'),
          segClient.from('modulos').select('*').order('orden, nombre'),
          segClient.from('funcionalidades').select('*').order('orden, nombre')
        ]);

        if (seccionesResult.error) throw seccionesResult.error;
        if (modulosResult.error) throw modulosResult.error;
        if (funcionalidadesResult.error) throw funcionalidadesResult.error;

        const seccionesData = seccionesResult.data || [];
        const modulosData = modulosResult.data || [];
        const funcionalidadesData = funcionalidadesResult.data || [];

        const tree: SeccionTreeNode[] = seccionesData.map(seccionItem => ({
          ...seccionItem,
          modulos: modulosData
            .filter(moduloItem => moduloItem.seccion_id === seccionItem.id)
            .map(moduloItem => ({
              ...moduloItem,
              seccion_nombre: seccionItem.nombre,
              funcionalidades: funcionalidadesData
                .filter(funcionalidadItem => funcionalidadItem.modulo_id === moduloItem.id)
            }))
        }));

        setFuncionalidadTree(tree);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el árbol de funcionalidades',
          variant: 'destructive',
        });
      } finally {
        setLoadingTree(false);
      }
    };

    loadFuncionalidadTree();
  }, [open, toast]);

  const onSubmit = async (data: FuncionalidadFormData) => {
    try {
      const payload = {
        ...data,
        acciones: selectedAcciones,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('funcionalidades')
          .update(payload)
          .eq('id', funcionalidad.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Funcionalidad actualizada correctamente' });
      } else {
        const { error } = await segClient
          .from('funcionalidades')
          .insert([payload]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Funcionalidad creada correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la funcionalidad',
        variant: 'destructive',
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleAccion = (accion: string) => {
    setSelectedAcciones(prev => 
      prev.includes(accion) 
        ? prev.filter(a => a !== accion)
        : [...prev, accion]
    );
  };

  const agregarNuevaAccion = () => {
    if (nuevaAccion && !selectedAcciones.includes(nuevaAccion)) {
      setSelectedAcciones(prev => [...prev, nuevaAccion]);
      setNuevaAccion('');
    }
  };

  const eliminarAccion = (accion: string) => {
    setSelectedAcciones(prev => prev.filter(a => a !== accion));
  };

  const getAccionColor = (accion: string) => {
    const accionPredefinida = accionesPredefinidas.find(a => a.value === accion);
    return accionPredefinida?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5" />
            {isEditing ? 'Editar Funcionalidad' : 'Nueva Funcionalidad'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la funcionalidad' : 'Completa los datos para crear una nueva funcionalidad'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modulo_id">Módulo *</Label>
                <Select
                  value={watchedValues.modulo_id}
                  onValueChange={(value) => setValue('modulo_id', value)}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modulos.map((modulo) => (
                      <SelectItem key={modulo.id} value={modulo.id}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-500" />
                          <div className="flex flex-col">
                            <span>{modulo.nombre}</span>
                            <span className="text-xs text-muted-foreground">
                              {modulo.seccion_nombre} • {modulo.codigo}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.modulo_id && <p className="text-xs text-destructive">{errors.modulo_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input 
                  id="codigo" 
                  {...register('codigo')} 
                  placeholder="ej: rrhh.empleados.crear, operacion.movimientos.ver"
                  className="font-mono"
                />
                {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="ej: Crear Empleado, Ver Movimientos" />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  {...register('descripcion')} 
                  placeholder="Descripción opcional de la funcionalidad"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Acciones Permitidas *</Label>
                
                <div className="grid grid-cols-2 gap-2">
                  {accionesPredefinidas.map((accion) => (
                    <Button
                      key={accion.value}
                      type="button"
                      variant={selectedAcciones.includes(accion.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAccion(accion.value)}
                      className="justify-start"
                    >
                      {accion.label}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Acción personalizada"
                    value={nuevaAccion}
                    onChange={(e) => setNuevaAccion(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={agregarNuevaAccion}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedAcciones.map((accion) => (
                    <Badge 
                      key={accion} 
                      variant="secondary"
                      className={`${getAccionColor(accion)} flex items-center gap-1`}
                    >
                      {accion}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-3 w-3 p-0 hover:bg-transparent"
                        onClick={() => eliminarAccion(accion)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orden">Orden</Label>
                <Input 
                  id="orden" 
                  type="number" 
                  {...register('orden', { valueAsNumber: true })} 
                  min={0}
                />
                {errors.orden && <p className="text-xs text-destructive">{errors.orden.message}</p>}
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Guardar cambios' : 'Crear funcionalidad'}
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Catálogo de Funcionalidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingTree ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {funcionalidadTree.map((seccionItem) => (
                      <div key={seccionItem.id} className="border rounded p-2">
                        <Collapsible
                          open={expandedSections.has(seccionItem.id)}
                          onOpenChange={() => toggleSection(seccionItem.id)}
                        >
                          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 p-1 rounded">
                            {expandedSections.has(seccionItem.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            {expandedSections.has(seccionItem.id) ? (
                              <FolderOpen className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Folder className="h-4 w-4 text-blue-500" />
                            )}
                            <div className="flex flex-col flex-1">
                              <span className="font-medium text-sm">{seccionItem.nombre}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {seccionItem.codigo}
                              </span>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-6 space-y-1 mt-2">
                            {seccionItem.modulos?.map((moduloItem) => (
                              <div key={moduloItem.id} className="border-l-2 border-muted pl-2">
                                <Collapsible
                                  open={expandedModules.has(moduloItem.id)}
                                  onOpenChange={() => toggleModule(moduloItem.id)}
                                >
                                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 p-1 rounded">
                                    {expandedModules.has(moduloItem.id) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <Package className="h-3 w-3 text-green-500" />
                                    <div className="flex flex-col flex-1">
                                      <span className="text-sm">{moduloItem.nombre}</span>
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {moduloItem.codigo}
                                      </span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {moduloItem.funcionalidades?.length || 0}
                                    </Badge>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="pl-4 space-y-1 mt-1">
                                    {moduloItem.funcionalidades?.map((funcionalidadItem) => (
                                      <div 
                                        key={funcionalidadItem.id} 
                                        className={`text-xs border-l pl-2 p-1 rounded ${
                                          funcionalidadItem.id === funcionalidad?.id 
                                            ? 'border-primary bg-primary/5 font-semibold' 
                                            : 'text-muted-foreground'
                                        }`}
                                      >
                                        <div className="font-mono">{funcionalidadItem.codigo}</div>
                                        <div>{funcionalidadItem.nombre}</div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {(funcionalidadItem.acciones || []).map((accion: string) => (
                                            <Badge 
                                              key={accion} 
                                              variant="outline" 
                                              className={`text-xs ${getAccionColor(accion)}`}
                                            >
                                              {accion}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}