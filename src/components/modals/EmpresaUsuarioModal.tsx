import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2, User } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const empresaUsuarioSchema = z.object({
  empresa_id: z.string().uuid('Seleccione una empresa'),
  user_id: z.string().uuid('Seleccione un usuario'),
  estado: z.enum(['activo', 'inactivo', 'suspendido']),
});

type EmpresaUsuarioFormData = z.infer<typeof empresaUsuarioSchema>;

interface EmpresaUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaUsuario?: any;
  onSuccess: () => void;
}

export function EmpresaUsuarioModal({ open, onOpenChange, empresaUsuario, onSuccess }: EmpresaUsuarioModalProps) {
  const { toast } = useToast();
  const isEditing = !!empresaUsuario;
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaUsuarioFormData>({
    resolver: zodResolver(empresaUsuarioSchema),
    defaultValues: {
      empresa_id: '',
      user_id: '',
      estado: 'activo',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadData = async () => {
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

    if (open) {
      loadData();
    }
  }, [open, toast]);

  useEffect(() => {
    if (empresaUsuario) {
      reset({
        empresa_id: empresaUsuario.empresa_id,
        user_id: empresaUsuario.user_id,
        estado: empresaUsuario.estado || 'activo',
      });
    } else {
      reset({
        empresa_id: '',
        user_id: '',
        estado: 'activo',
      });
    }
  }, [empresaUsuario, reset]);

  const onSubmit = async (data: EmpresaUsuarioFormData) => {
    try {
      if (isEditing) {
        const { error } = await segClient
          .from('empresa_usuarios')
          .update({ estado: data.estado })
          .eq('id', empresaUsuario.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Relación empresa-usuario actualizada correctamente' });
      } else {
        const { error } = await segClient
          .from('empresa_usuarios')
          .insert([data]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Usuario asignado a la empresa correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la relación empresa-usuario',
        variant: 'destructive',
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge variant="default">Activo</Badge>;
      case 'inactivo':
        return <Badge variant="secondary">Inactivo</Badge>;
      case 'suspendido':
        return <Badge variant="destructive">Suspendido</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {isEditing ? 'Editar Asignación' : 'Asignar Usuario a Empresa'}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica el estado de la asignación usuario-empresa' 
              : 'Selecciona la empresa y el usuario para crear la relación'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa_id">Empresa *</Label>
            <Select
              value={watchedValues.empresa_id}
              onValueChange={(value) => setValue('empresa_id', value)}
              disabled={isEditing}
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

          <div className="space-y-2">
            <Label htmlFor="user_id">Usuario *</Label>
            <Select
              value={watchedValues.user_id}
              onValueChange={(value) => setValue('user_id', value)}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un usuario" />
              </SelectTrigger>
              <SelectContent>
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
              </SelectContent>
            </Select>
            {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado *</Label>
            <Select
              value={watchedValues.estado}
              onValueChange={(value) => setValue('estado', value as 'activo' | 'inactivo' | 'suspendido')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">
                  <div className="flex items-center gap-2">
                    {getEstadoBadge('activo')}
                    <span>Activo</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactivo">
                  <div className="flex items-center gap-2">
                    {getEstadoBadge('inactivo')}
                    <span>Inactivo</span>
                  </div>
                </SelectItem>
                <SelectItem value="suspendido">
                  <div className="flex items-center gap-2">
                    {getEstadoBadge('suspendido')}
                    <span>Suspendido</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.estado && <p className="text-xs text-destructive">{errors.estado.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Asignar usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}