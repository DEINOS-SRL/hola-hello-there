import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, FolderTree, ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

const seccionSchema = z.object({
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  orden: z.number().min(0, 'El orden debe ser un número positivo'),
});

type SeccionFormData = z.infer<typeof seccionSchema>;

interface SeccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seccion?: any;
  onSuccess: () => void;
}

interface SeccionTreeNode {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
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

export function SeccionModal({ open, onOpenChange, seccion, onSuccess }: SeccionModalProps) {
  const { toast } = useToast();
  const isEditing = !!seccion;
  const [seccionTree, setSeccionTree] = useState<SeccionTreeNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeccionFormData>({
    resolver: zodResolver(seccionSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      orden: 0,
    },
  });

  useEffect(() => {
    if (seccion) {
      reset({
        codigo: seccion.codigo,
        nombre: seccion.nombre,
        descripcion: seccion.descripcion || '',
        orden: seccion.orden || 0,
      });
    } else {
      reset({
        codigo: '',
        nombre: '',
        descripcion: '',
        orden: 0,
      });
    }
  }, [seccion, reset]);

  useEffect(() => {
    const loadSeccionTree = async () => {
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

        const secciones = seccionesResult.data || [];
        const modulos = modulosResult.data || [];
        const funcionalidades = funcionalidadesResult.data || [];

        const tree: SeccionTreeNode[] = secciones.map(seccionItem => ({
          ...seccionItem,
          modulos: modulos
            .filter(modulo => modulo.seccion_id === seccionItem.id)
            .map(modulo => ({
              ...modulo,
              funcionalidades: funcionalidades
                .filter(funcionalidad => funcionalidad.modulo_id === modulo.id)
            }))
        }));

        setSeccionTree(tree);
      } catch (error: any) {
        console.error('Error loading tree:', error);
        // Don't show error toast for empty data
        if (error.message && !error.message.includes('relation') && !error.message.includes('does not exist')) {
          toast({
            title: 'Error',
            description: 'No se pudo cargar el árbol de secciones: ' + error.message,
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingTree(false);
      }
    };

    loadSeccionTree();
  }, [open, toast]);

  const onSubmit = async (data: SeccionFormData) => {
    try {
      if (isEditing) {
        const { error } = await segClient
          .from('secciones')
          .update(data)
          .eq('id', seccion.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Sección actualizada correctamente' });
      } else {
        const { error } = await segClient
          .from('secciones')
          .insert([data]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Sección creada correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la sección',
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
      <DialogContent size="lg" className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <FolderTree className="h-5 w-5" />
            {isEditing ? 'Editar Sección' : 'Nueva Sección'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la sección' : 'Completa los datos para crear una nueva sección'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[65vh]">
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input 
                  id="codigo" 
                  {...register('codigo')} 
                  placeholder="ej: rrhh, operacion"
                  className="font-mono"
                />
                {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="ej: Recursos Humanos" />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  {...register('descripcion')} 
                  placeholder="Descripción opcional de la sección"
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
                  {isEditing ? 'Guardar cambios' : 'Crear sección'}
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vista Previa del Catálogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingTree ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : seccionTree.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">No hay secciones creadas aún</p>
                    <p className="text-xs mt-1">Crea la primera sección usando el formulario</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {seccionTree.map((seccionItem) => (
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
                            <div className="flex flex-col">
                              <span className="font-medium">{seccionItem.nombre}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {seccionItem.codigo}
                              </span>
                            </div>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {seccionItem.modulos?.length || 0} módulos
                            </Badge>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-6 space-y-1 mt-2">
                            {seccionItem.modulos?.map((modulo) => (
                              <div key={modulo.id} className="border-l-2 border-muted pl-2">
                                <Collapsible
                                  open={expandedModules.has(modulo.id)}
                                  onOpenChange={() => toggleModule(modulo.id)}
                                >
                                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 p-1 rounded">
                                    {expandedModules.has(modulo.id) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <div className="flex flex-col">
                                      <span className="text-sm">{modulo.nombre}</span>
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {modulo.codigo}
                                      </span>
                                    </div>
                                    <Badge variant="outline" className="ml-auto text-xs">
                                      {modulo.funcionalidades?.length || 0}
                                    </Badge>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="pl-4 space-y-1 mt-1">
                                    {modulo.funcionalidades?.map((funcionalidad) => (
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