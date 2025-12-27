import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Loader2, 
  UserCheck, 
  Building2, 
  User, 
  Folder, 
  Shield,
  ChevronDown,
  ChevronRight,
  FolderOpen
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
import { useToast } from '@/hooks/use-toast';
import { SelectWithIcon, ModalTitle } from '@/shared/components';

const usuarioRolesSchema = z.object({
  empresa_id: z.string().uuid('Seleccione una empresa'),
  user_id: z.string().uuid('Seleccione un usuario'),
  roles: z.array(z.object({
    seccion_id: z.string().uuid(),
    rol_id: z.string().uuid(),
  })).min(1, 'Debe seleccionar al menos un rol'),
});

type UsuarioRolesFormData = z.infer<typeof usuarioRolesSchema>;

interface UsuarioRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioRoles?: any;
  onSuccess: () => void;
}

interface SeccionConRoles {
  id: string;
  codigo: string;
  nombre: string;
  roles: RolItem[];
}

interface RolItem {
  id: string;
  nombre: string;
  descripcion?: string;
}

interface RolAsignado {
  seccion_id: string;
  rol_id: string;
}

export function UsuarioRolesModal({ open, onOpenChange, usuarioRoles, onSuccess }: UsuarioRolesModalProps) {
  const { toast } = useToast();
  const isEditing = !!usuarioRoles;
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [seccionesConRoles, setSeccionesConRoles] = useState<SeccionConRoles[]>([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<RolAsignado[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [rolesActualesUsuario, setRolesActualesUsuario] = useState<any[]>([]);

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioRolesFormData>({
    resolver: zodResolver(usuarioRolesSchema),
    defaultValues: {
      empresa_id: '',
      user_id: '',
      roles: [],
    },
  });

  const watchedValues = watch();
  const selectedEmpresa = watchedValues.empresa_id;
  const selectedUser = watchedValues.user_id;

  useEffect(() => {
    const loadEmpresasYUsuarios = async () => {
      if (!open) return;
      
      try {
        setLoadingData(true);
        
        const [empresasResult, usuariosResult] = await Promise.all([
          segClient.from('empresas').select('id, nombre').order('nombre'),
          segClient.from('perfiles_usuarios').select('user_id, nombre, email').order('nombre')
        ]);

        if (empresasResult.error) throw empresasResult.error;
        if (usuariosResult.error) throw usuariosResult.error;

        setEmpresas(empresasResult.data || []);
        setUsuarios(usuariosResult.data || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadEmpresasYUsuarios();
  }, [open, toast]);

  useEffect(() => {
    if (usuarioRoles) {
      setValue('empresa_id', usuarioRoles.empresa_id);
      setValue('user_id', usuarioRoles.user_id);
    } else {
      reset({
        empresa_id: '',
        user_id: '',
        roles: [],
      });
      setRolesSeleccionados([]);
    }
  }, [usuarioRoles, reset, setValue]);

  useEffect(() => {
    const loadSeccionesYRoles = async () => {
      if (!selectedEmpresa) {
        setSeccionesConRoles([]);
        return;
      }
      
      try {
        setLoadingRoles(true);
        
        const [seccionesResult, rolesResult] = await Promise.all([
          segClient.from('secciones').select('id, codigo, nombre').order('orden, nombre'),
          segClient
            .from('roles')
            .select('id, nombre, descripcion, seccion_id')
            .eq('empresa_id', selectedEmpresa)
            .order('nombre')
        ]);

        if (seccionesResult.error) throw seccionesResult.error;
        if (rolesResult.error) throw rolesResult.error;

        const secciones = seccionesResult.data || [];
        const roles = rolesResult.data || [];

        const seccionesConRolesData = secciones.map(seccion => ({
          ...seccion,
          roles: roles.filter(rol => rol.seccion_id === seccion.id)
        })).filter(seccion => seccion.roles.length > 0);

        setSeccionesConRoles(seccionesConRolesData);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las secciones y roles',
          variant: 'destructive',
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    loadSeccionesYRoles();
  }, [selectedEmpresa, toast]);

  useEffect(() => {
    const loadRolesActualesUsuario = async () => {
      if (!selectedEmpresa || !selectedUser) {
        setRolesActualesUsuario([]);
        setRolesSeleccionados([]);
        return;
      }
      
      try {
        const { data, error } = await segClient
          .from('usuario_roles')
          .select(`
            id,
            seccion_id,
            rol_id,
            roles!inner(nombre),
            secciones!inner(nombre, codigo)
          `)
          .eq('empresa_id', selectedEmpresa)
          .eq('user_id', selectedUser);

        if (error) throw error;

        setRolesActualesUsuario(data || []);
        
        const rolesActivos = (data || []).map(item => ({
          seccion_id: item.seccion_id,
          rol_id: item.rol_id,
        }));
        
        setRolesSeleccionados(rolesActivos);
      } catch (error: any) {
        console.error('Error loading user roles:', error);
        setRolesActualesUsuario([]);
        setRolesSeleccionados([]);
      }
    };

    loadRolesActualesUsuario();
  }, [selectedEmpresa, selectedUser]);

  useEffect(() => {
    setValue('roles', rolesSeleccionados);
  }, [rolesSeleccionados, setValue]);

  const onSubmit = async (data: UsuarioRolesFormData) => {
    try {
      const { data: existingRoles, error: fetchError } = await segClient
        .from('usuario_roles')
        .select('id, seccion_id, rol_id')
        .eq('empresa_id', data.empresa_id)
        .eq('user_id', data.user_id);

      if (fetchError) throw fetchError;

      const existingRolesSet = new Set(
        (existingRoles || []).map(r => `${r.seccion_id}_${r.rol_id}`)
      );
      const newRolesSet = new Set(
        data.roles.map(r => `${r.seccion_id}_${r.rol_id}`)
      );

      const rolesToDelete = (existingRoles || []).filter(r => 
        !newRolesSet.has(`${r.seccion_id}_${r.rol_id}`)
      );

      const rolesToAdd = data.roles.filter(r => 
        !existingRolesSet.has(`${r.seccion_id}_${r.rol_id}`)
      );

      if (rolesToDelete.length > 0) {
        const { error: deleteError } = await segClient
          .from('usuario_roles')
          .delete()
          .in('id', rolesToDelete.map(r => r.id));

        if (deleteError) throw deleteError;
      }

      if (rolesToAdd.length > 0) {
        const { error: insertError } = await segClient
          .from('usuario_roles')
          .insert(
            rolesToAdd.map(rol => ({
              empresa_id: data.empresa_id,
              user_id: data.user_id,
              seccion_id: rol.seccion_id,
              rol_id: rol.rol_id,
            }))
          );

        if (insertError) throw insertError;
      }

      toast({ title: 'Éxito', description: 'Roles de usuario actualizados correctamente' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron actualizar los roles del usuario',
        variant: 'destructive',
      });
    }
  };

  const toggleRol = (seccionId: string, rolId: string) => {
    setRolesSeleccionados(prev => {
      const existingIndex = prev.findIndex(
        r => r.seccion_id === seccionId && r.rol_id === rolId
      );

      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        return [...prev.filter(r => r.seccion_id !== seccionId), { seccion_id: seccionId, rol_id: rolId }];
      }
    });
  };

  const isRolSelected = (seccionId: string, rolId: string) => {
    return rolesSeleccionados.some(
      r => r.seccion_id === seccionId && r.rol_id === rolId
    );
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

  const getRolesCountBySection = (seccionId: string) => {
    return rolesSeleccionados.filter(r => r.seccion_id === seccionId).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <ModalTitle icon={UserCheck}>
            Asignar Roles por Sección
          </ModalTitle>
          <DialogDescription>
            Asigna roles específicos por sección a un usuario. Un usuario puede tener diferentes roles en diferentes secciones.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa_id">Empresa *</Label>
                <SelectWithIcon
                  icon={Building2}
                  placeholder="Seleccione una empresa"
                  value={watchedValues.empresa_id}
                  onValueChange={(value) => setValue('empresa_id', value)}
                  disabled={isEditing || loadingData}
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
                <Label htmlFor="user_id">Usuario *</Label>
                <SelectWithIcon
                  icon={User}
                  placeholder="Seleccione un usuario"
                  value={watchedValues.user_id}
                  onValueChange={(value) => setValue('user_id', value)}
                  disabled={isEditing || loadingData}
                >
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.user_id} value={usuario.user_id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{usuario.nombre}</span>
                          <span className="text-xs text-muted-foreground">{usuario.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectWithIcon>
                {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
              </div>

              {selectedEmpresa && selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Selección de Roles por Sección</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {loadingRoles ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : seccionesConRoles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay roles disponibles para esta empresa
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {seccionesConRoles.map((seccion) => (
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
                                <Badge variant="secondary" className="text-xs">
                                  {getRolesCountBySection(seccion.id)}/{seccion.roles.length}
                                </Badge>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                                {seccion.roles.map((rol) => (
                                  <div key={rol.id} className="flex items-start space-x-3 p-2 border-l-2 border-muted">
                                    <Checkbox
                                      id={`rol-${rol.id}`}
                                      checked={isRolSelected(seccion.id, rol.id)}
                                      onCheckedChange={() => toggleRol(seccion.id, rol.id)}
                                    />
                                    <div className="flex-1">
                                      <Label 
                                        htmlFor={`rol-${rol.id}`}
                                        className="font-medium cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Shield className="h-3 w-3 text-green-500" />
                                          {rol.nombre}
                                        </div>
                                      </Label>
                                      {rol.descripcion && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {rol.descripcion}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.roles && <p className="text-xs text-destructive">{errors.roles.message}</p>}
                  </CardContent>
                </Card>
              )}

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedEmpresa || !selectedUser}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Actualizar roles
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Roles Actuales del Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedUser ? (
                  <p className="text-sm text-muted-foreground">
                    Selecciona un usuario para ver sus roles actuales
                  </p>
                ) : rolesActualesUsuario.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Este usuario no tiene roles asignados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rolesActualesUsuario.map((rolUsuario) => (
                      <div key={rolUsuario.id} className="border rounded p-2">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-blue-500" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {rolUsuario.secciones?.nombre}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {rolUsuario.roles?.nombre}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Roles Seleccionados</CardTitle>
              </CardHeader>
              <CardContent>
                {rolesSeleccionados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay roles seleccionados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rolesSeleccionados.map((rolSel, index) => {
                      const seccion = seccionesConRoles.find(s => s.id === rolSel.seccion_id);
                      const rol = seccion?.roles.find(r => r.id === rolSel.rol_id);
                      return (
                        <div key={index} className="border rounded p-2 bg-primary/5">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {seccion?.nombre}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {rol?.nombre}
                              </div>
                            </div>
                            <Badge variant="default" className="text-xs">
                              Nuevo
                            </Badge>
                          </div>
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