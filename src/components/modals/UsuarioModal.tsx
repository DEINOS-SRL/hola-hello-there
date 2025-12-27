import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Mail, CreditCard, Phone, MapPin, Building2, UserCheck } from 'lucide-react';
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
import { InputWithIcon, SelectWithIcon, ModalTitle } from '@/shared/components';
import { Switch } from '@/components/ui/switch';
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

const usuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  empresa_id: z.string().min(1, 'Debe seleccionar una empresa'),
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
      const { data } = await segClient.from('empresas').select('id, nombre').order('nombre');
      return data || [];
    },
  });

  const form = useForm<UsuarioFormData>({
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

  useEffect(() => {
    if (usuario) {
      form.reset({
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
      form.reset({
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
  }, [usuario, form]);

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      const payload = {
        ...data,
        empresa_id: data.empresa_id,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('usuarios')
          .update(payload)
          .eq('id', usuario.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Usuario actualizado correctamente' });
      } else {
        const { error } = await segClient
          .from('usuarios')
          .insert([{ ...payload, email: data.email }]);

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
      <DialogContent size="xl">
        <DialogHeader>
          <ModalTitle icon={User}>
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </ModalTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos personales y de acceso del usuario.' : 'Completa la ficha para dar de alta un nuevo usuario.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={User} placeholder="Nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={User} placeholder="Apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      icon={Mail}
                      placeholder="usuario@empresa.com"
                      type="email"
                      disabled={isEditing}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI / Identificación</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={CreditCard} placeholder="12.345.678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={Phone} placeholder="+54 9 11 ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <InputWithIcon icon={MapPin} placeholder="Calle 123, Ciudad" {...field} />
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
                  <FormLabel>Empresa Asignada</FormLabel>
                  <FormControl>
                    <SelectWithIcon
                      icon={Building2}
                      placeholder="Seleccionar empresa"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      {empresas?.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                      ))}
                    </SelectWithIcon>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <div>
                      <FormLabel className="text-base">Usuario Activo</FormLabel>
                      <FormDescription>
                        Permitir acceso al sistema a este usuario
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
