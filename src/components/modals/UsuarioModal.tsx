import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const usuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  empresa_id: z.string().optional(),
  activo: z.boolean(),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface UsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: any;
  onSuccess: () => void;
}

export function UsuarioModal({ open, onOpenChange, usuario, onSuccess }: UsuarioModalProps) {
  const { toast } = useToast();
  const isEditing = !!usuario;

  const { data: empresas } = useQuery({
    queryKey: ['empresas-select'],
    queryFn: async () => {
      const { data } = await supabase.from('seg_empresas').select('id, nombre').order('nombre');
      return data || [];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      dni: '',
      telefono: '',
      direccion: '',
      empresa_id: '',
      activo: true,
    },
  });

  const activo = watch('activo');
  const empresaId = watch('empresa_id');

  useEffect(() => {
    if (usuario) {
      reset({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email,
        dni: usuario.dni || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        empresa_id: usuario.empresa_id || '',
        activo: usuario.activo ?? true,
      });
    } else {
      reset({
        nombre: '',
        apellido: '',
        email: '',
        dni: '',
        telefono: '',
        direccion: '',
        empresa_id: '',
        activo: true,
      });
    }
  }, [usuario, reset]);

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      const payload = {
        ...data,
        empresa_id: data.empresa_id || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('seg_usuarios')
          .update(payload)
          .eq('id', usuario.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Usuario actualizado correctamente' });
      } else {
        const { error } = await supabase
          .from('seg_usuarios')
          .insert([{ ...payload, email: data.email }] as any);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Usuario creado correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el usuario',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del usuario' : 'Completa los datos para crear un nuevo usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input id="apellido" {...register('apellido')} />
              {errors.apellido && <p className="text-xs text-destructive">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} disabled={isEditing} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" {...register('dni')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register('telefono')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register('direccion')} />
          </div>

          <div className="space-y-2">
            <Label>Empresa</Label>
            <Select value={empresaId} onValueChange={(value) => setValue('empresa_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin empresa</SelectItem>
                {empresas?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="activo">Usuario activo</Label>
            <Switch
              id="activo"
              checked={activo}
              onCheckedChange={(checked) => setValue('activo', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
