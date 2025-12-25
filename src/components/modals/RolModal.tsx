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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const rolSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  empresa_id: z.string().optional(),
});

type RolFormData = z.infer<typeof rolSchema>;

interface RolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol?: any;
  onSuccess: () => void;
}

export function RolModal({ open, onOpenChange, rol, onSuccess }: RolModalProps) {
  const { toast } = useToast();
  const isEditing = !!rol;

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
  } = useForm<RolFormData>({
    resolver: zodResolver(rolSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      empresa_id: '',
    },
  });

  const empresaId = watch('empresa_id');

  useEffect(() => {
    if (rol) {
      reset({
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
        empresa_id: rol.empresa_id || '',
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        empresa_id: '',
      });
    }
  }, [rol, reset]);

  const onSubmit = async (data: RolFormData) => {
    try {
      const payload = {
        ...data,
        empresa_id: data.empresa_id || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('seg_roles')
          .update(payload)
          .eq('id', rol.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Rol actualizado correctamente' });
      } else {
        const { error } = await supabase
          .from('seg_roles')
          .insert([payload] as any);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Rol creado correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el rol',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del rol' : 'Completa los datos para crear un nuevo rol'}
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
            <Textarea id="descripcion" {...register('descripcion')} placeholder="Describe las funciones del rol" />
          </div>

          <div className="space-y-2">
            <Label>Empresa (opcional)</Label>
            <Select 
              value={empresaId || "global"} 
              onValueChange={(value) => setValue('empresa_id', value === "global" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Global (todas las empresas)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                {empresas?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Si no seleccionas empresa, el rol será global
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear rol'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
