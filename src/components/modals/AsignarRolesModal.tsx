import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Shield, ShieldCheck, ShieldX } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface AsignarRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  onSuccess?: () => void;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface Modulo {
  id: string;
  nombre: string;
}

interface UsuarioRol {
  rol_id: string;
  modulo_id: string;
}

export function AsignarRolesModal({ open, onOpenChange, usuario, onSuccess }: AsignarRolesModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedModulo, setSelectedModulo] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [initialRoles, setInitialRoles] = useState<Set<string>>(new Set());

  // Fetch módulos principales (sin padre)
  const { data: modulos, isLoading: loadingModulos } = useQuery({
    queryKey: ['modulos-select'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('modulos')
        .select('id, nombre')
        .eq('activo', true)
        .is('modulo_padre_id', null)
        .order('nombre');
      if (error) throw error;
      return data as Modulo[];
    },
    enabled: open,
  });

  // Fetch roles
  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ['roles-select'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('roles')
        .select('id, nombre, descripcion')
        .order('nombre');
      if (error) throw error;
      return data as Rol[];
    },
    enabled: open,
  });

  // Fetch roles actuales del usuario para el módulo seleccionado
  const { data: usuarioRoles, isLoading: loadingUserRoles, refetch: refetchUserRoles } = useQuery({
    queryKey: ['usuario-roles', usuario?.id, selectedModulo],
    queryFn: async () => {
      if (!usuario?.id || !selectedModulo) return [];
      const { data, error } = await segClient
        .from('usuario_rol')
        .select('rol_id, modulo_id')
        .eq('usuario_id', usuario.id)
        .eq('modulo_id', selectedModulo);
      if (error) throw error;
      return data as UsuarioRol[];
    },
    enabled: open && !!usuario?.id && !!selectedModulo,
  });

  // Actualizar selectedRoles cuando cambian los roles del usuario
  useEffect(() => {
    if (usuarioRoles) {
      const roleIds = new Set(usuarioRoles.map(ur => ur.rol_id));
      setSelectedRoles(roleIds);
      setInitialRoles(roleIds);
    } else {
      setSelectedRoles(new Set());
      setInitialRoles(new Set());
    }
  }, [usuarioRoles]);

  // Seleccionar primer módulo por defecto
  useEffect(() => {
    if (modulos && modulos.length > 0 && !selectedModulo) {
      setSelectedModulo(modulos[0].id);
    }
  }, [modulos, selectedModulo]);

  // Reset cuando se cierra
  useEffect(() => {
    if (!open) {
      setSelectedModulo('');
      setSelectedRoles(new Set());
      setInitialRoles(new Set());
    }
  }, [open]);

  // Mutation para guardar cambios
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!usuario?.id || !selectedModulo) throw new Error('Usuario o módulo no seleccionados');

      const toAdd = [...selectedRoles].filter(roleId => !initialRoles.has(roleId));
      const toRemove = [...initialRoles].filter(roleId => !selectedRoles.has(roleId));

      // Eliminar roles removidos
      if (toRemove.length > 0) {
        const { error: deleteError } = await segClient
          .from('usuario_rol')
          .delete()
          .eq('usuario_id', usuario.id)
          .eq('modulo_id', selectedModulo)
          .in('rol_id', toRemove);
        if (deleteError) throw deleteError;
      }

      // Agregar nuevos roles
      if (toAdd.length > 0) {
        const inserts = toAdd.map(rolId => ({
          usuario_id: usuario.id,
          rol_id: rolId,
          modulo_id: selectedModulo,
        }));
        const { error: insertError } = await segClient
          .from('usuario_rol')
          .insert(inserts);
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Éxito', description: 'Roles actualizados correctamente' });
      queryClient.invalidateQueries({ queryKey: ['usuario-roles'] });
      refetchUserRoles();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron actualizar los roles',
        variant: 'destructive',
      });
    },
  });

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const hasChanges = () => {
    if (selectedRoles.size !== initialRoles.size) return true;
    for (const roleId of selectedRoles) {
      if (!initialRoles.has(roleId)) return true;
    }
    return false;
  };

  const isLoading = loadingModulos || loadingRoles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Asignar Roles
          </DialogTitle>
          <DialogDescription>
            {usuario ? (
              <>Gestiona los roles de <strong>{usuario.nombre} {usuario.apellido}</strong></>
            ) : (
              'Selecciona un usuario'
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selector de módulo */}
            <div className="space-y-2">
              <Label>Módulo</Label>
              <Select value={selectedModulo} onValueChange={setSelectedModulo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modulos?.map((modulo) => (
                    <SelectItem key={modulo.id} value={modulo.id}>
                      {modulo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Lista de roles */}
            <div className="space-y-2">
              <Label>Roles disponibles</Label>
              {loadingUserRoles ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !selectedModulo ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Selecciona un módulo para ver los roles
                </p>
              ) : (
                <ScrollArea className="h-[250px] rounded-md border p-3">
                  <div className="space-y-3">
                    {roles?.map((rol) => {
                      const isSelected = selectedRoles.has(rol.id);
                      return (
                        <div
                          key={rol.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary/5 border-primary/30'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleRole(rol.id)}
                        >
                          <Checkbox
                            id={`rol-${rol.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleRole(rol.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <ShieldCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <ShieldX className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Label
                                htmlFor={`rol-${rol.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {rol.nombre}
                              </Label>
                            </div>
                            {rol.descripcion && (
                              <p className="text-xs text-muted-foreground">
                                {rol.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Resumen de cambios */}
            {hasChanges() && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">
                  {selectedRoles.size} rol{selectedRoles.size !== 1 ? 'es' : ''} seleccionado{selectedRoles.size !== 1 ? 's' : ''}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Cambios pendientes</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasChanges()}
          >
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
