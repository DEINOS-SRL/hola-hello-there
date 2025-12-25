import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const iconOptions = [
  { value: 'Shield', label: 'Escudo (Seguridad)' },
  { value: 'BarChart3', label: 'Gráficos (Reportes)' },
  { value: 'FileText', label: 'Documento (Documentos)' },
  { value: 'Calendar', label: 'Calendario' },
  { value: 'MessageSquare', label: 'Mensaje (Mensajería)' },
  { value: 'ClipboardList', label: 'Lista (Partes)' },
  { value: 'AppWindow', label: 'Aplicación (Genérico)' },
];

const aplicacionSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  ruta: z.string().optional(),
  activa: z.boolean(),
});

type AplicacionFormData = z.infer<typeof aplicacionSchema>;

interface AplicacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aplicacion?: any;
  onSuccess: () => void;
}

export function AplicacionModal({ open, onOpenChange, aplicacion, onSuccess }: AplicacionModalProps) {
  const { toast } = useToast();
  const isEditing = !!aplicacion;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AplicacionFormData>({
    resolver: zodResolver(aplicacionSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      icono: 'AppWindow',
      ruta: '',
      activa: true,
    },
  });

  const activa = watch('activa');
  const icono = watch('icono');

  useEffect(() => {
    if (aplicacion) {
      reset({
        nombre: aplicacion.nombre,
        descripcion: aplicacion.descripcion || '',
        icono: aplicacion.icono || 'AppWindow',
        ruta: aplicacion.ruta || '',
        activa: aplicacion.activa ?? true,
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        icono: 'AppWindow',
        ruta: '',
        activa: true,
      });
    }
  }, [aplicacion, reset]);

  const onSubmit = async (data: AplicacionFormData) => {
    try {
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        icono: data.icono || 'AppWindow',
        ruta: data.ruta || null,
        activa: data.activa,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('seg_aplicaciones')
          .update(payload)
          .eq('id', aplicacion.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Aplicación actualizada correctamente' });
      } else {
        const { error } = await supabase
          .from('seg_aplicaciones')
          .insert([payload] as any);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Aplicación creada correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la aplicación',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Aplicación' : 'Nueva Aplicación'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la aplicación' : 'Completa los datos para crear una nueva aplicación'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" {...register('descripcion')} placeholder="Describe la funcionalidad de la aplicación" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icono</Label>
              <Select value={icono} onValueChange={(value) => setValue('icono', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar icono" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruta">Ruta</Label>
              <Input id="ruta" {...register('ruta')} placeholder="/modulo" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="activa">En producción</Label>
              <p className="text-xs text-muted-foreground">Si está desactivada, mostrará "Próximamente"</p>
            </div>
            <Switch
              id="activa"
              checked={activa}
              onCheckedChange={(checked) => setValue('activa', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear aplicación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
