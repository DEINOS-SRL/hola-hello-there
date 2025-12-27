import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, FileText, User, AlignLeft, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ModalTitle, InputWithIcon, TextareaWithIcon, SelectWithIcon } from '@/shared/components';
import type { Presupuesto, EstadoPresupuesto } from '../types';
import { useCreatePresupuesto, useUpdatePresupuesto, useNextNumeroPresupuesto } from '../hooks/usePresupuestos';

const formSchema = z.object({
  numero: z.string().min(1, 'El número es requerido').max(50),
  cliente: z.string().min(1, 'El cliente es requerido').max(255),
  descripcion: z.string().max(1000).optional(),
  fecha: z.date({ required_error: 'La fecha es requerida' }),
  fecha_vencimiento: z.date().optional().nullable(),
  estado: z.enum(['borrador', 'enviado', 'aprobado', 'rechazado', 'vencido']),
  observaciones: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const estadoOptions: { value: EstadoPresupuesto; label: string; color: string }[] = [
  { value: 'borrador', label: 'Borrador', color: 'bg-gray-500' },
  { value: 'enviado', label: 'Enviado', color: 'bg-blue-500' },
  { value: 'aprobado', label: 'Aprobado', color: 'bg-green-500' },
  { value: 'rechazado', label: 'Rechazado', color: 'bg-red-500' },
  { value: 'vencido', label: 'Vencido', color: 'bg-orange-500' },
];

interface PresupuestoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presupuesto?: Presupuesto | null;
}

export function PresupuestoModal({ open, onOpenChange, presupuesto }: PresupuestoModalProps) {
  const isEditing = !!presupuesto;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createMutation = useCreatePresupuesto();
  const updateMutation = useUpdatePresupuesto();
  const { data: nextNumero } = useNextNumeroPresupuesto();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: '',
      cliente: '',
      descripcion: '',
      estado: 'borrador',
      observaciones: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (presupuesto) {
        form.reset({
          numero: presupuesto.numero,
          cliente: presupuesto.cliente,
          descripcion: presupuesto.descripcion || '',
          fecha: new Date(presupuesto.fecha),
          fecha_vencimiento: presupuesto.fecha_vencimiento ? new Date(presupuesto.fecha_vencimiento) : null,
          estado: presupuesto.estado,
          observaciones: presupuesto.observaciones || '',
        });
      } else {
        form.reset({
          numero: nextNumero || '',
          cliente: '',
          descripcion: '',
          fecha: new Date(),
          fecha_vencimiento: null,
          estado: 'borrador',
          observaciones: '',
        });
      }
    }
  }, [open, presupuesto, nextNumero, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const formData = {
        numero: values.numero,
        cliente: values.cliente,
        descripcion: values.descripcion,
        fecha: format(values.fecha, 'yyyy-MM-dd'),
        fecha_vencimiento: values.fecha_vencimiento ? format(values.fecha_vencimiento, 'yyyy-MM-dd') : undefined,
        estado: values.estado,
        observaciones: values.observaciones,
      };

      if (isEditing && presupuesto) {
        await updateMutation.mutateAsync({ id: presupuesto.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <ModalTitle icon={FileText}>
            {isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </ModalTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del presupuesto' 
              : 'Completa los datos para crear un nuevo presupuesto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número *</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={FileText} {...field} placeholder="PRES-2025-0001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <FormControl>
                      <SelectWithIcon
                        icon={CheckCircle}
                        placeholder="Selecciona un estado"
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        {estadoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span className={cn('w-2 h-2 rounded-full', option.color)} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectWithIcon>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <FormControl>
                    <InputWithIcon icon={User} {...field} placeholder="Nombre del cliente" />
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
                      {...field} 
                      placeholder="Descripción del presupuesto"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Selecciona fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_vencimiento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Vencimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Sin vencimiento</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <TextareaWithIcon 
                      icon={AlignLeft}
                      {...field} 
                      placeholder="Observaciones adicionales"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Presupuesto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
