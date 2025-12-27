import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const perfilUsuarioSchema = z.object({
  user_id: z.string().uuid('ID de usuario inválido'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type PerfilUsuarioFormData = z.infer<typeof perfilUsuarioSchema>;

interface PerfilUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfil?: any;
  onSuccess: () => void;
}

export function PerfilUsuarioModal({ open, onOpenChange, perfil, onSuccess }: PerfilUsuarioModalProps) {
  const { toast } = useToast();
  const isEditing = !!perfil;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PerfilUsuarioFormData>({
    resolver: zodResolver(perfilUsuarioSchema),
    defaultValues: {
      user_id: '',
      nombre: '',
      email: '',
      telefono: '',
      avatar_url: '',
    },
  });

  const avatarUrl = watch('avatar_url');

  useEffect(() => {
    if (perfil) {
      reset({
        user_id: perfil.user_id,
        nombre: perfil.nombre,
        email: perfil.email,
        telefono: perfil.telefono || '',
        avatar_url: perfil.avatar_url || '',
      });
    } else {
      reset({
        user_id: '',
        nombre: '',
        email: '',
        telefono: '',
        avatar_url: '',
      });
    }
  }, [perfil, reset]);

  const onSubmit = async (data: PerfilUsuarioFormData) => {
    try {
      const payload = {
        ...data,
        telefono: data.telefono || null,
        avatar_url: data.avatar_url || null,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('perfiles_usuarios')
          .update(payload)
          .eq('user_id', perfil.user_id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Perfil de usuario actualizado correctamente' });
      } else {
        const { error } = await segClient
          .from('perfiles_usuarios')
          .insert([payload]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Perfil de usuario creado correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el perfil de usuario',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Perfil de Usuario' : 'Nuevo Perfil de Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del perfil' : 'Completa los datos para crear un nuevo perfil de usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_id">ID de Usuario *</Label>
            <Input id="user_id" {...register('user_id')} disabled={isEditing} />
            {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" type="tel" {...register('telefono')} placeholder="+54 11 1234-5678" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">URL del Avatar</Label>
            <Input id="avatar_url" type="url" {...register('avatar_url')} placeholder="https://" />
            {errors.avatar_url && <p className="text-xs text-destructive">{errors.avatar_url.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear perfil'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}