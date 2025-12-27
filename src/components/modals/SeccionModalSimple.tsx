import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, FolderTree, Code, Package, AlignLeft, Hash } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { InputWithIcon, TextareaWithIcon, ModalTitle } from '@/shared/components';

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

export function SeccionModalSimple({ open, onOpenChange, seccion, onSuccess }: SeccionModalProps) {
  const { toast } = useToast();
  const isEditing = !!seccion;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <ModalTitle icon={FolderTree}>
            {isEditing ? 'Editar Sección' : 'Nueva Sección'}
          </ModalTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la sección' : 'Completa los datos para crear una nueva sección'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <InputWithIcon
                icon={Code}
                id="codigo"
                {...register('codigo')}
                placeholder="ej: rrhh, operacion"
                className="font-mono"
              />
              {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <InputWithIcon
                icon={Package}
                id="nombre"
                {...register('nombre')}
                placeholder="ej: Recursos Humanos"
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <TextareaWithIcon
                icon={AlignLeft}
                id="descripcion"
                {...register('descripcion')}
                placeholder="Descripción opcional de la sección"
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <InputWithIcon
                icon={Hash}
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
      </DialogContent>
    </Dialog>
  );
}