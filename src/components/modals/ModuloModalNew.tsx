import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, ChevronDown, ChevronRight, Folder, FolderOpen, Settings } from 'lucide-react';
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

const moduloSchema = z.object({
  seccion_id: z.string().uuid('Seleccione una sección'),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  orden: z.number().min(0, 'El orden debe ser un número positivo'),
});

type ModuloFormData = z.infer<typeof moduloSchema>;

interface ModuloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulo?: any;
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
  funcionalidades?: FuncionalidadTreeNode[];
}

interface FuncionalidadTreeNode {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

export function ModuloModalNew({ open, onOpenChange, modulo, onSuccess }: ModuloModalProps) {
  const { toast } = useToast();
  const isEditing = !!modulo;
  const [secciones, setSecciones] = useState<any[]>([]);
  const [moduloTree, setModuloTree] = useState<SeccionTreeNode[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ModuloFormData>({
    resolver: zodResolver(moduloSchema),
    defaultValues: {
      seccion_id: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      orden: 0,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadSecciones = async () => {
      if (!open) return;
      
      try {
        setLoadingData(true);
        const { data, error } = await segClient
          .from('secciones')
          .select('id, codigo, nombre')
          .order('orden, nombre');

        if (error) throw error;
        setSecciones(data || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las secciones',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadSecciones();
  }, [open, toast]);

  useEffect(() => {
    if (modulo) {
      reset({
        seccion_id: modulo.seccion_id,
        codigo: modulo.codigo,
        nombre: modulo.nombre,
        descripcion: modulo.descripcion || '',
        orden: modulo.orden || 0,
      });
    } else {
      reset({
        seccion_id: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        orden: 0,
      });
    }
  }, [modulo, reset]);

  useEffect(() => {
    const loadModuloTree = async () => {
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
              funcionalidades: funcionalidadesData
                .filter(funcionalidad => funcionalidad.modulo_id === moduloItem.id)
            }))
        }));

        setModuloTree(tree);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el árbol de módulos',
          variant: 'destructive',
        });
      } finally {
        setLoadingTree(false);
      }
    };

    loadModuloTree();
  }, [open, toast]);

  const onSubmit = async (data: ModuloFormData) => {
    try {
      if (isEditing) {
        const { error } = await segClient
          .from('modulos')
          .update(data)
          .eq('id', modulo.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Módulo actualizado correctamente' });
      } else {
        const { error } = await segClient
          .from('modulos')
          .insert([data]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Módulo creado correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el módulo',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            {isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del módulo' : 'Completa los datos para crear un nuevo módulo'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[65vh]">
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seccion_id">Sección *</Label>
                <Select
                  value={watchedValues.seccion_id}
                  onValueChange={(value) => setValue('seccion_id', value)}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {secciones.map((seccion) => (
                      <SelectItem key={seccion.id} value={seccion.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span>{seccion.nombre}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {seccion.codigo}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.seccion_id && <p className="text-xs text-destructive">{errors.seccion_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input 
                  id="codigo" 
                  {...register('codigo')} 
                  placeholder="ej: rrhh.empleados, operacion.movimientos"
                  className="font-mono"
                />
                {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="ej: Empleados, Movimientos" />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  {...register('descripcion')} 
                  placeholder="Descripción opcional del módulo"
                  rows={3}
                />
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
                  {isEditing ? 'Guardar cambios' : 'Crear módulo'}
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Estructura del Catálogo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingTree ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {moduloTree.map((seccionItem) => (
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
                              <span className="font-medium">{seccionItem.nombre}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {seccionItem.codigo}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {seccionItem.modulos?.length || 0} módulos
                            </Badge>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-6 space-y-1 mt-2">
                            {seccionItem.modulos?.map((moduloItem) => (
                              <div 
                                key={moduloItem.id} 
                                className={`border-l-2 pl-2 ${moduloItem.id === modulo?.id ? 'border-primary bg-primary/5' : 'border-muted'}`}
                              >
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
                                      <span className={`text-sm ${moduloItem.id === modulo?.id ? 'font-semibold' : ''}`}>
                                        {moduloItem.nombre}
                                      </span>
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {moduloItem.codigo}
                                      </span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {moduloItem.funcionalidades?.length || 0}
                                    </Badge>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="pl-4 space-y-1 mt-1">
                                    {moduloItem.funcionalidades?.map((funcionalidad) => (
                                      <div key={funcionalidad.id} className="text-xs text-muted-foreground border-l pl-2">
                                        <div className="font-mono">{funcionalidad.codigo}</div>
                                        <div>{funcionalidad.nombre}</div>
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