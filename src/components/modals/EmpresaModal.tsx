import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

const empresaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  direccion: z.string().optional(),
  horarios: z.string().optional(),
  webhook_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: any;
  onSuccess: () => void;
}

export function EmpresaModal({ open, onOpenChange, empresa, onSuccess }: EmpresaModalProps) {
  const { toast } = useToast();
  const isEditing = !!empresa;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      horarios: '',
      webhook_url: '',
    },
  });

  useEffect(() => {
    if (empresa) {
      reset({
        nombre: empresa.nombre,
        direccion: empresa.direccion || '',
        horarios: empresa.horarios || '',
        webhook_url: empresa.webhook_url || '',
      });
    } else {
      reset({
        nombre: '',
        direccion: '',
        horarios: '',
        webhook_url: '',
      });
    }
  }, [empresa, reset]);

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      const payload = {
        ...data,
        webhook_url: data.webhook_url || null,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('empresas')
          .update(payload)
          .eq('id', empresa.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Empresa actualizada correctamente' });
      } else {
        const { error } = await segClient
          .from('empresas')
          .insert([payload]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Empresa creada correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la empresa',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nueva Empresa'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la empresa' : 'Completa los datos para crear una nueva empresa'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register('direccion')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horarios">Horarios</Label>
            <Textarea id="horarios" {...register('horarios')} placeholder="Ej: Lun-Vie 9:00-18:00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input id="webhook_url" type="url" {...register('webhook_url')} placeholder="https://" />
            {errors.webhook_url && <p className="text-xs text-destructive">{errors.webhook_url.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
