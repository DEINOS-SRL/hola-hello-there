import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Loader2, 
  ToggleLeft,
  ToggleRight,
  Building2, 
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Package,
  Zap,
  Check,
  X,
  Search
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const empresaFuncionalidadesSchema = z.object({
  empresa_id: z.string().uuid('Seleccione una empresa'),
  funcionalidades: z.array(z.object({
    funcionalidad_id: z.string().uuid(),
    enabled: z.boolean(),
  })),
});

type EmpresaFuncionalidadesFormData = z.infer<typeof empresaFuncionalidadesSchema>;

interface EmpresaFuncionalidadesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaFuncionalidades?: any;
  onSuccess: () => void;
}

interface SeccionConModulos {
  id: string;
  codigo: string;
  nombre: string;
  modulos: ModuloConFuncionalidades[];
}

interface ModuloConFuncionalidades {
  id: string;
  codigo: string;
  nombre: string;
  funcionalidades: FuncionalidadItem[];
}

interface FuncionalidadItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  acciones: string[];
}

interface FuncionalidadHabilitada {
  funcionalidad_id: string;
  enabled: boolean;
}

export function EmpresaFuncionalidadesModal({ open, onOpenChange, empresaFuncionalidades, onSuccess }: EmpresaFuncionalidadesModalProps) {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [seccionesConModulos, setSeccionesConModulos] = useState<SeccionConModulos[]>([]);
  const [funcionalidadesHabilitadas, setFuncionalidadesHabilitadas] = useState<FuncionalidadHabilitada[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingFuncionalidades, setLoadingFuncionalidades] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any>(null);

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFuncionalidadesFormData>({
    resolver: zodResolver(empresaFuncionalidadesSchema),
    defaultValues: {
      empresa_id: '',
      funcionalidades: [],
    },
  });

  const watchedValues = watch();
  const selectedEmpresa = watchedValues.empresa_id;

  useEffect(() => {
    const loadEmpresas = async () => {
      if (!open) return;
      
      try {
        setLoadingData(true);
        const { data, error } = await segClient
          .from('empresas')
          .select('id, nombre')
          .order('nombre');

        if (error) throw error;
        setEmpresas(data || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las empresas',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadEmpresas();
  }, [open, toast]);

  useEffect(() => {
    if (empresaFuncionalidades) {
      setValue('empresa_id', empresaFuncionalidades.empresa_id);
    } else {
      reset({
        empresa_id: '',
        funcionalidades: [],
      });
    }
  }, [empresaFuncionalidades, reset, setValue]);

  useEffect(() => {
    const loadFuncionalidadesYEstado = async () => {
      if (!selectedEmpresa) {
        setSeccionesConModulos([]);
        setFuncionalidadesHabilitadas([]);
        setEmpresaSeleccionada(null);
        return;
      }
      
      try {
        setLoadingFuncionalidades(true);
        
        const empresaData = empresas.find(e => e.id === selectedEmpresa);
        setEmpresaSeleccionada(empresaData);

        const [seccionesResult, modulosResult, funcionalidadesResult, empresaFuncionalidadesResult] = await Promise.all([
          segClient.from('secciones').select('*').order('orden, nombre'),
          segClient.from('modulos').select('*').order('orden, nombre'),
          segClient.from('funcionalidades').select('*').order('orden, nombre'),
          segClient
            .from('empresa_funcionalidades')
            .select('funcionalidad_id, enabled')
            .eq('empresa_id', selectedEmpresa)
        ]);

        if (seccionesResult.error) throw seccionesResult.error;
        if (modulosResult.error) throw modulosResult.error;
        if (funcionalidadesResult.error) throw funcionalidadesResult.error;
        if (empresaFuncionalidadesResult.error) throw empresaFuncionalidadesResult.error;

        const secciones = seccionesResult.data || [];
        const modulos = modulosResult.data || [];
        const funcionalidades = funcionalidadesResult.data || [];
        const funcionalidadesEmpresa = empresaFuncionalidadesResult.data || [];

        const tree: SeccionConModulos[] = secciones.map(seccion => ({
          ...seccion,
          modulos: modulos
            .filter(modulo => modulo.seccion_id === seccion.id)
            .map(modulo => ({
              ...modulo,
              funcionalidades: funcionalidades
                .filter(funcionalidad => funcionalidad.modulo_id === modulo.id)
                .map(funcionalidad => ({
                  ...funcionalidad,
                  acciones: Array.isArray(funcionalidad.acciones) 
                    ? funcionalidad.acciones 
                    : ['read', 'create', 'update', 'delete']
                }))
            }))
        })).filter(seccion => seccion.modulos.some(modulo => modulo.funcionalidades.length > 0));

        setSeccionesConModulos(tree);

        const todasLasFuncionalidades = funcionalidades.map(f => f.id);
        const funcionalidadesExistentes = new Map(
          funcionalidadesEmpresa.map(ef => [ef.funcionalidad_id, ef.enabled])
        );

        const estadoFuncionalidades = todasLasFuncionalidades.map(funcId => ({
          funcionalidad_id: funcId,
          enabled: funcionalidadesExistentes.get(funcId) ?? true
        }));

        setFuncionalidadesHabilitadas(estadoFuncionalidades);
        setValue('funcionalidades', estadoFuncionalidades);

        setExpandedSections(new Set(secciones.map(s => s.id)));
        setExpandedModules(new Set(modulos.map(m => m.id)));

      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las funcionalidades',
          variant: 'destructive',
        });
      } finally {
        setLoadingFuncionalidades(false);
      }
    };

    loadFuncionalidadesYEstado();
  }, [selectedEmpresa, empresas, setValue, toast]);

  const onSubmit = async (data: EmpresaFuncionalidadesFormData) => {
    try {
      const { data: existingData, error: fetchError } = await segClient
        .from('empresa_funcionalidades')
        .select('id, funcionalidad_id, enabled')
        .eq('empresa_id', data.empresa_id);

      if (fetchError) throw fetchError;

      const existingMap = new Map(
        (existingData || []).map(item => [item.funcionalidad_id, item])
      );

      const toUpdate = [];
      const toInsert = [];

      for (const funcionalidad of funcionalidadesHabilitadas) {
        const existing = existingMap.get(funcionalidad.funcionalidad_id);
        
        if (existing) {
          if (existing.enabled !== funcionalidad.enabled) {
            toUpdate.push({
              id: existing.id,
              enabled: funcionalidad.enabled
            });
          }
        } else {
          toInsert.push({
            empresa_id: data.empresa_id,
            funcionalidad_id: funcionalidad.funcionalidad_id,
            enabled: funcionalidad.enabled
          });
        }
      }

      if (toUpdate.length > 0) {
        for (const item of toUpdate) {
          const { error } = await segClient
            .from('empresa_funcionalidades')
            .update({ enabled: item.enabled })
            .eq('id', item.id);

          if (error) throw error;
        }
      }

      if (toInsert.length > 0) {
        const { error } = await segClient
          .from('empresa_funcionalidades')
          .insert(toInsert);

        if (error) throw error;
      }

      toast({ title: 'Éxito', description: 'Funcionalidades de la empresa actualizadas correctamente' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron actualizar las funcionalidades',
        variant: 'destructive',
      });
    }
  };

  const toggleFuncionalidad = (funcionalidadId: string) => {
    setFuncionalidadesHabilitadas(prev => 
      prev.map(f => 
        f.funcionalidad_id === funcionalidadId 
          ? { ...f, enabled: !f.enabled }
          : f
      )
    );
  };

  const isFuncionalidadHabilitada = (funcionalidadId: string) => {
    const funcionalidad = funcionalidadesHabilitadas.find(f => f.funcionalidad_id === funcionalidadId);
    return funcionalidad?.enabled ?? true;
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

  const habilitarTodasSeccion = (seccionId: string) => {
    const seccion = seccionesConModulos.find(s => s.id === seccionId);
    if (!seccion) return;

    const funcionalidadesDeLaSeccion = seccion.modulos.flatMap(m => m.funcionalidades.map(f => f.id));
    
    setFuncionalidadesHabilitadas(prev =>
      prev.map(f =>
        funcionalidadesDeLaSeccion.includes(f.funcionalidad_id)
          ? { ...f, enabled: true }
          : f
      )
    );
  };

  const deshabilitarTodasSeccion = (seccionId: string) => {
    const seccion = seccionesConModulos.find(s => s.id === seccionId);
    if (!seccion) return;

    const funcionalidadesDeLaSeccion = seccion.modulos.flatMap(m => m.funcionalidades.map(f => f.id));
    
    setFuncionalidadesHabilitadas(prev =>
      prev.map(f =>
        funcionalidadesDeLaSeccion.includes(f.funcionalidad_id)
          ? { ...f, enabled: false }
          : f
      )
    );
  };

  const getFuncionalidadesHabilitadasSeccion = (seccionId: string) => {
    const seccion = seccionesConModulos.find(s => s.id === seccionId);
    if (!seccion) return { habilitadas: 0, total: 0 };

    const funcionalidadesDeLaSeccion = seccion.modulos.flatMap(m => m.funcionalidades.map(f => f.id));
    const habilitadas = funcionalidadesDeLaSeccion.filter(funcId => isFuncionalidadHabilitada(funcId)).length;
    
    return { habilitadas, total: funcionalidadesDeLaSeccion.length };
  };

  const filteredSecciones = seccionesConModulos.filter(seccion => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return seccion.nombre.toLowerCase().includes(searchLower) ||
           seccion.codigo.toLowerCase().includes(searchLower) ||
           seccion.modulos.some(modulo => 
             modulo.nombre.toLowerCase().includes(searchLower) ||
             modulo.codigo.toLowerCase().includes(searchLower) ||
             modulo.funcionalidades.some(funcionalidad =>
               funcionalidad.nombre.toLowerCase().includes(searchLower) ||
               funcionalidad.codigo.toLowerCase().includes(searchLower)
             )
           );
  });

  useEffect(() => {
    setValue('funcionalidades', funcionalidadesHabilitadas);
  }, [funcionalidadesHabilitadas, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5" />
              Gestionar Feature Flags por Empresa
            </div>
          </DialogTitle>
          <DialogDescription>
            Habilita o deshabilita funcionalidades específicas para esta empresa. Solo las funcionalidades habilitadas estarán disponibles para los usuarios de la empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa_id">Empresa *</Label>
                <Select
                  value={watchedValues.empresa_id}
                  onValueChange={(value) => setValue('empresa_id', value)}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {empresa.nombre}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.empresa_id && <p className="text-xs text-destructive">{errors.empresa_id.message}</p>}
              </div>

              {empresaSeleccionada && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Información de la Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Empresa:</span> {empresaSeleccionada.nombre}
                    </div>
                    <div>
                      <span className="font-medium">Total Funcionalidades:</span>{' '}
                      <Badge variant="secondary">
                        {funcionalidadesHabilitadas.filter(f => f.enabled).length} de {funcionalidadesHabilitadas.length} habilitadas
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedEmpresa}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar configuración
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ToggleRight className="h-4 w-4" />
                  Feature Flags por Funcionalidad
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar funcionalidades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {!selectedEmpresa ? (
                  <p className="text-sm text-muted-foreground">
                    Selecciona una empresa para configurar sus funcionalidades
                  </p>
                ) : loadingFuncionalidades ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredSecciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'No se encontraron funcionalidades que coincidan con la búsqueda' : 'No hay funcionalidades disponibles'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredSecciones.map((seccion) => {
                      const { habilitadas, total } = getFuncionalidadesHabilitadasSeccion(seccion.id);
                      return (
                        <div key={seccion.id} className="border rounded p-2">
                          <Collapsible
                            open={expandedSections.has(seccion.id)}
                            onOpenChange={() => toggleSection(seccion.id)}
                          >
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 p-2 rounded">
                              {expandedSections.has(seccion.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              {expandedSections.has(seccion.id) ? (
                                <FolderOpen className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Folder className="h-4 w-4 text-blue-500" />
                              )}
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">{seccion.nombre}</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {seccion.codigo}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={habilitadas === total ? "default" : habilitadas === 0 ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {habilitadas}/{total}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    habilitarTodasSeccion(seccion.id);
                                  }}
                                  className="text-xs h-6"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deshabilitarTodasSeccion(seccion.id);
                                  }}
                                  className="text-xs h-6"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 space-y-2 mt-2">
                              {seccion.modulos.map((modulo) => (
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
                                      <Package className="h-3 w-3 text-green-500" />
                                      <div className="flex flex-col flex-1">
                                        <span className="text-sm font-medium">{modulo.nombre}</span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {modulo.codigo}
                                        </span>
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-4 space-y-2 mt-2">
                                      {modulo.funcionalidades.map((funcionalidad) => {
                                        const isEnabled = isFuncionalidadHabilitada(funcionalidad.id);
                                        return (
                                          <div key={funcionalidad.id} className="flex items-start gap-3 p-2 border rounded bg-muted/20">
                                            <Switch
                                              checked={isEnabled}
                                              onCheckedChange={() => toggleFuncionalidad(funcionalidad.id)}
                                            />
                                            <Zap className={`h-4 w-4 ${isEnabled ? 'text-orange-500' : 'text-gray-400'}`} />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-medium text-sm ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                  {funcionalidad.nombre}
                                                </span>
                                                {isEnabled ? (
                                                  <Badge variant="default" className="text-xs">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Habilitada
                                                  </Badge>
                                                ) : (
                                                  <Badge variant="destructive" className="text-xs">
                                                    <X className="h-3 w-3 mr-1" />
                                                    Deshabilitada
                                                  </Badge>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground font-mono mb-1">
                                                {funcionalidad.codigo}
                                              </div>
                                              {funcionalidad.descripcion && (
                                                <div className="text-xs text-muted-foreground mb-1">
                                                  {funcionalidad.descripcion}
                                                </div>
                                              )}
                                              <div className="flex flex-wrap gap-1">
                                                {funcionalidad.acciones.map((accion) => (
                                                  <Badge 
                                                    key={accion} 
                                                    variant="outline" 
                                                    className={`text-xs ${isEnabled ? 'opacity-100' : 'opacity-50'}`}
                                                  >
                                                    {accion}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    })}
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