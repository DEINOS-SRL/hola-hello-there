import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, CreditCard, Hash, Mail, Phone, Briefcase, Building, CalendarDays, MapPin, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { SelectItem } from '@/components/ui/select';
import { ModalTitle, InputWithIcon, TextareaWithIcon, SelectWithIcon } from '@/shared/components';
import type { Empleado } from '../types';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  dni: z.string().optional(),
  legajo: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  fecha_ingreso: z.string().optional(),
  direccion: z.string().optional(),
  estado: z.enum(['activo', 'licencia', 'baja']),
});

type FormValues = z.infer<typeof formSchema>;

interface EmpleadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleado: Empleado | null;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function EmpleadoModal({
  open,
  onOpenChange,
  empleado,
  onSubmit,
  isSubmitting,
}: EmpleadoModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      legajo: '',
      email: '',
      telefono: '',
      cargo: '',
      departamento: '',
      fecha_nacimiento: '',
      fecha_ingreso: '',
      direccion: '',
      estado: 'activo',
    },
  });

  useEffect(() => {
    if (empleado) {
      form.reset({
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        dni: empleado.dni || '',
        legajo: empleado.legajo || '',
        email: empleado.email || '',
        telefono: empleado.telefono || '',
        cargo: empleado.cargo || '',
        departamento: empleado.departamento || '',
        fecha_nacimiento: empleado.fecha_nacimiento || '',
        fecha_ingreso: empleado.fecha_ingreso || '',
        direccion: empleado.direccion || '',
        estado: empleado.estado,
      });
    } else {
      form.reset({
        nombre: '',
        apellido: '',
        dni: '',
        legajo: '',
        email: '',
        telefono: '',
        cargo: '',
        departamento: '',
        fecha_nacimiento: '',
        fecha_ingreso: '',
        direccion: '',
        estado: 'activo',
      });
    }
  }, [empleado, form]);

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <ModalTitle icon={User}>
            {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
          </ModalTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={User} placeholder="Juan" {...field} />
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
                    <FormLabel>Apellido *</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={User} placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={CreditCard} placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legajo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legajo</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={Hash} placeholder="EMP-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={Mail} type="email" placeholder="juan@empresa.com" {...field} />
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
                      <InputWithIcon icon={Phone} placeholder="+54 11 1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={Briefcase} placeholder="Desarrollador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={Building} placeholder="Tecnología" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha_nacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={CalendarDays} type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fecha_ingreso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Ingreso</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={CalendarDays} type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <SelectWithIcon
                      icon={UserCheck}
                      placeholder="Seleccionar estado"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="licencia">En Licencia</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectWithIcon>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <TextareaWithIcon icon={MapPin} placeholder="Calle 123, Ciudad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {empleado ? 'Guardar Cambios' : 'Crear Empleado'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
