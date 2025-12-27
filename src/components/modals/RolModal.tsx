import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield, Building2, AlignLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { segClient } from '@/modules/security/services/segClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputWithIcon, TextareaWithIcon, SelectWithIcon, ModalTitle } from '@/shared/components';
import { SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

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
      const { data } = await segClient.from('empresas').select('id, nombre').order('nombre');
      return data || [];
    },
  });

  const form = useForm<RolFormData>({
    resolver: zodResolver(rolSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      empresa_id: '',
    },
  });

  const empresaId = form.watch('empresa_id');

  useEffect(() => {
    if (rol) {
      form.reset({
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
        empresa_id: rol.empresa_id || '',
      });
    } else {
      form.reset({
        nombre: '',
        descripcion: '',
        empresa_id: '',
      });
    }
  }, [rol, form]);

  const onSubmit = async (data: RolFormData) => {
    try {
      const payload = {
        ...data,
        empresa_id: data.empresa_id || null,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('roles')
          .update(payload)
          .eq('id', rol.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Rol actualizado correctamente' });
      } else {
        const { error } = await segClient
          .from('roles')
          .insert([payload]);

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
      <DialogContent size="lg">
        <DialogHeader>
          <ModalTitle icon={Shield}>
            {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
          </ModalTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del rol existente.' : 'Define un nuevo rol para asignar permisos.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Rol</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      icon={Shield}
                      placeholder="Ej: Administrador, Supervisor..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <TextareaWithIcon
                      icon={AlignLeft}
                      placeholder="Descripción de las responsabilidades..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresa_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa (Opcional)</FormLabel>
                  <FormControl>
                    <SelectWithIcon
                      icon={Building2}
                      placeholder="Seleccionar alcance"
                      onValueChange={(value) => field.onChange(value === "global" ? "" : value)}
                      value={field.value || "global"}
                    >
                      <SelectItem value="global" className="font-semibold text-primary">
                        Global (Todas las empresas)
                      </SelectItem>
                      {empresas?.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                      ))}
                    </SelectWithIcon>
                  </FormControl>
                  <FormDescription>
                    Si seleccionas "Global", el rol estará disponible para todas las empresas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Rol'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
