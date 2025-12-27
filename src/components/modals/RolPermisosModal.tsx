import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Loader2, 
  ShieldCheck, 
  Building2, 
  Shield,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Package,
  Zap,
  Check,
  X
} from 'lucide-react';
import { segClient } from '@/modules/security/services/segClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { SelectWithIcon, ModalTitle } from '@/shared/components';

const rolPermisosSchema = z.object({
  empresa_id: z.string().uuid('Seleccione una empresa'),
  rol_id: z.string().uuid('Seleccione un rol'),
  permisos: z.array(z.object({
    funcionalidad_id: z.string().uuid(),
    allow: z.boolean(),
    acciones: z.record(z.boolean()).optional(),
  })),
});

type RolPermisosFormData = z.infer<typeof rolPermisosSchema>;

interface RolPermisosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rolPermisos?: any;
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

interface PermisoItem {
  funcionalidad_id: string;
  allow: boolean;
  acciones: Record<string, boolean>;
}

export function RolPermisosModal({ open, onOpenChange, rolPermisos, onSuccess }: RolPermisosModalProps) {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [rolesPorEmpresa, setRolesPorEmpresa] = useState<any[]>([]);
  const [seccionesConModulos, setSeccionesConModulos] = useState<SeccionConModulos[]>([]);
  const [permisosActuales, setPermisosActuales] = useState<PermisoItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingFuncionalidades, setLoadingFuncionalidades] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [rolSeleccionado, setRolSeleccionado] = useState<any>(null);

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RolPermisosFormData>({
    resolver: zodResolver(rolPermisosSchema),
    defaultValues: {
      empresa_id: '',
      rol_id: '',
      permisos: [],
    },
  });

  const watchedValues = watch();
  const selectedEmpresa = watchedValues.empresa_id;
  const selectedRol = watchedValues.rol_id;

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
    if (rolPermisos) {
      setValue('empresa_id', rolPermisos.empresa_id);
      setValue('rol_id', rolPermisos.rol_id);
    } else {
      reset({
        empresa_id: '',
        rol_id: '',
        permisos: [],
      });
    }
  }, [rolPermisos, reset, setValue]);

  useEffect(() => {
    const loadRoles = async () => {
      if (!selectedEmpresa) {
        setRolesPorEmpresa([]);
        return;
      }
      
      try {
        setLoadingRoles(true);
        
        const { data, error } = await segClient
          .from('roles')
          .select(`
            id, 
            nombre, 
            descripcion,
            secciones!inner(nombre, codigo)
          `)
          .eq('empresa_id', selectedEmpresa)
          .order('nombre');

        if (error) throw error;
        
        const rolesConSeccion = (data || []).map(rol => ({
          ...rol,
          seccion_nombre: (rol.secciones as any)?.nombre || 'Sin sección',
          seccion_codigo: (rol.secciones as any)?.codigo || 'sin_codigo'
        }));
        
        setRolesPorEmpresa(rolesConSeccion);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los roles',
          variant: 'destructive',
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, [selectedEmpresa, toast]);

  useEffect(() => {
    const loadFuncionalidadesYPermisos = async () => {
      if (!selectedRol) {
        setSeccionesConModulos([]);
        setPermisosActuales([]);
        setRolSeleccionado(null);
        return;
      }
      
      try {
        setLoadingFuncionalidades(true);
        
        const rolData = rolesPorEmpresa.find(r => r.id === selectedRol);
        setRolSeleccionado(rolData);

        const [seccionesResult, modulosResult, funcionalidadesResult, permisosResult] = await Promise.all([
          segClient.from('secciones').select('*').order('orden, nombre'),
          segClient.from('modulos').select('*').order('orden, nombre'),
          segClient.from('funcionalidades').select('*').order('orden, nombre'),
          segClient
            .from('rol_permisos')
            .select('funcionalidad_id, allow, acciones')
            .eq('rol_id', selectedRol)
        ]);

        if (seccionesResult.error) throw seccionesResult.error;
        if (modulosResult.error) throw modulosResult.error;
        if (funcionalidadesResult.error) throw funcionalidadesResult.error;
        if (permisosResult.error) throw permisosResult.error;

        const secciones = seccionesResult.data || [];
        const modulos = modulosResult.data || [];
        const funcionalidades = funcionalidadesResult.data || [];
        const permisos = permisosResult.data || [];

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

        const permisosFormateados = permisos.map(permiso => ({
          funcionalidad_id: permiso.funcionalidad_id,
          allow: permiso.allow,
          acciones: permiso.acciones || {}
        }));

        setPermisosActuales(permisosFormateados);
        setValue('permisos', permisosFormateados);
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

    loadFuncionalidadesYPermisos();
  }, [selectedRol, rolesPorEmpresa, setValue, toast]);

  const onSubmit = async (data: RolPermisosFormData) => {
    try {
      const { data: existingPermisos, error: fetchError } = await segClient
        .from('rol_permisos')
        .select('id, funcionalidad_id')
        .eq('rol_id', data.rol_id);

      if (fetchError) throw fetchError;

      const existingPermisosMap = new Map(
        (existingPermisos || []).map(p => [p.funcionalidad_id, p.id])
      );

      const permisosToUpdate = [];
      const permisosToInsert = [];

      for (const permiso of permisosActuales) {
        if (existingPermisosMap.has(permiso.funcionalidad_id)) {
          permisosToUpdate.push({
            id: existingPermisosMap.get(permiso.funcionalidad_id),
            allow: permiso.allow,
            acciones: permiso.acciones
          });
        } else {
          permisosToInsert.push({
            rol_id: data.rol_id,
            funcionalidad_id: permiso.funcionalidad_id,
            allow: permiso.allow,
            acciones: permiso.acciones
          });
        }
      }

      if (permisosToUpdate.length > 0) {
        for (const permiso of permisosToUpdate) {
          const { error } = await segClient
            .from('rol_permisos')
            .update({
              allow: permiso.allow,
              acciones: permiso.acciones
            })
            .eq('id', permiso.id);

          if (error) throw error;
        }
      }

      if (permisosToInsert.length > 0) {
        const { error } = await segClient
          .from('rol_permisos')
          .insert(permisosToInsert);

        if (error) throw error;
      }

      toast({ title: 'Éxito', description: 'Permisos del rol actualizados correctamente' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron actualizar los permisos',
        variant: 'destructive',
      });
    }
  };

  const toggleFuncionalidadPermiso = (funcionalidadId: string) => {
    setPermisosActuales(prev => {
      const existingIndex = prev.findIndex(p => p.funcionalidad_id === funcionalidadId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          allow: !updated[existingIndex].allow
        };
        return updated;
      } else {
        return [...prev, {
          funcionalidad_id: funcionalidadId,
          allow: true,
          acciones: {}
        }];
      }
    });
  };

  const toggleAccionPermiso = (funcionalidadId: string, accion: string) => {
    setPermisosActuales(prev => {
      const existingIndex = prev.findIndex(p => p.funcionalidad_id === funcionalidadId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          acciones: {
            ...updated[existingIndex].acciones,
            [accion]: !updated[existingIndex].acciones[accion]
          }
        };
        return updated;
      } else {
        return [...prev, {
          funcionalidad_id: funcionalidadId,
          allow: true,
          acciones: { [accion]: true }
        }];
      }
    });
  };

  const getPermisoFuncionalidad = (funcionalidadId: string) => {
    return permisosActuales.find(p => p.funcionalidad_id === funcionalidadId);
  };

  const isAccionPermitida = (funcionalidadId: string, accion: string) => {
    const permiso = getPermisoFuncionalidad(funcionalidadId);
    return permiso?.acciones?.[accion] || false;
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

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'approve': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    setValue('permisos', permisosActuales);
  }, [permisosActuales, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <ModalTitle icon={ShieldCheck}>
            Gestionar Permisos del Rol
          </ModalTitle>
          <DialogDescription>
            Configura qué funcionalidades y acciones específicas puede realizar este rol. Los permisos son a nivel de funcionalidad con control granular por acción.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa_id">Empresa *</Label>
                <SelectWithIcon
                  icon={Building2}
                  placeholder="Seleccione una empresa"
                  value={watchedValues.empresa_id}
                  onValueChange={(value) => setValue('empresa_id', value)}
                  disabled={loadingData}
                >
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {empresa.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectWithIcon>
                {errors.empresa_id && <p className="text-xs text-destructive">{errors.empresa_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol_id">Rol *</Label>
                <SelectWithIcon
                  icon={Shield}
                  placeholder="Seleccione un rol"
                  value={watchedValues.rol_id}
                  onValueChange={(value) => setValue('rol_id', value)}
                  disabled={loadingRoles || !selectedEmpresa}
                >
                  {rolesPorEmpresa.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <div className="flex flex-col">
                          <span>{rol.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            {rol.seccion_nombre}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectWithIcon>
                {errors.rol_id && <p className="text-xs text-destructive">{errors.rol_id.message}</p>}
              </div>

              {rolSeleccionado && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Información del Rol</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Nombre:</span> {rolSeleccionado.nombre}
                    </div>
                    <div>
                      <span className="font-medium">Sección:</span> {rolSeleccionado.seccion_nombre}
                    </div>
                    {rolSeleccionado.descripcion && (
                      <div>
                        <span className="font-medium">Descripción:</span> 
                        <p className="text-sm text-muted-foreground mt-1">
                          {rolSeleccionado.descripcion}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedRol}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar permisos
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Matriz de Permisos por Funcionalidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!selectedRol ? (
                  <p className="text-sm text-muted-foreground">
                    Selecciona un rol para configurar sus permisos
                  </p>
                ) : loadingFuncionalidades ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : seccionesConModulos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay funcionalidades disponibles
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {seccionesConModulos.map((seccion) => (
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
                                  <CollapsibleContent className="pl-4 space-y-3 mt-2">
                                    {modulo.funcionalidades.map((funcionalidad) => {
                                      const permiso = getPermisoFuncionalidad(funcionalidad.id);
                                      return (
                                        <div key={funcionalidad.id} className="border rounded p-3 bg-muted/20">
                                          <div className="flex items-start gap-3">
                                            <div className="flex items-center gap-2">
                                              <Zap className="h-4 w-4 text-orange-500" />
                                              <Switch
                                                checked={permiso?.allow || false}
                                                onCheckedChange={() => toggleFuncionalidadPermiso(funcionalidad.id)}
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">
                                                  {funcionalidad.nombre}
                                                </span>
                                                {permiso?.allow && (
                                                  <Badge variant="default" className="text-xs">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Permitido
                                                  </Badge>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground font-mono mb-2">
                                                {funcionalidad.codigo}
                                              </div>
                                              {funcionalidad.descripcion && (
                                                <div className="text-xs text-muted-foreground mb-2">
                                                  {funcionalidad.descripcion}
                                                </div>
                                              )}
                                              <div className="flex flex-wrap gap-1">
                                                {funcionalidad.acciones.map((accion) => (
                                                  <Button
                                                    key={accion}
                                                    type="button"
                                                    variant={isAccionPermitida(funcionalidad.id, accion) ? "default" : "outline"}
                                                    size="sm"
                                                    className={`text-xs h-6 ${getAccionColor(accion)}`}
                                                    onClick={() => toggleAccionPermiso(funcionalidad.id, accion)}
                                                    disabled={!permiso?.allow}
                                                  >
                                                    {isAccionPermitida(funcionalidad.id, accion) && (
                                                      <Check className="h-3 w-3 mr-1" />
                                                    )}
                                                    {accion}
                                                  </Button>
                                                ))}
                                              </div>
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