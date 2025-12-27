import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2, MapPin, Clock, Globe } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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

  const form = useForm<EmpresaFormData>({
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
      form.reset({
        nombre: empresa.nombre,
        direccion: empresa.direccion || '',
        horarios: empresa.horarios || '',
        webhook_url: empresa.webhook_url || '',
      });
    } else {
      form.reset({
        nombre: '',
        direccion: '',
        horarios: '',
        webhook_url: '',
      });
    }
  }, [empresa, form]);

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
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl text-primary">
            <Building2 className="h-6 w-6" />
            {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la empresa existente.' : 'Completa los datos para registrar una nueva empresa.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Oficial</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input placeholder="Ej: Tech Solutions S.A." className="pl-11" {...field} />
                    </div>
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
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input placeholder="Ej: Av. Corrientes 1234, CABA" className="pl-11" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="horarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horarios de Atención</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Textarea 
                        placeholder="Ej: Lunes a Viernes de 9:00 a 18:00hs" 
                        className="pl-11 min-h-[80px] resize-none" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL (Integración)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input placeholder="https://api.empresa.com/webhook" className="pl-11" {...field} />
                    </div>
                  </FormControl>
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
                {isEditing ? 'Guardar Cambios' : 'Crear Empresa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
