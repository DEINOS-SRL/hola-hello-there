import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Loader2, 
  Building2, 
  MapPin, 
  Clock, 
  Link as LinkIcon, 
  Check,
  AlertCircle,
  Globe,
  Users,
  Calendar
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const empresaSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  direccion: z.string()
    .max(200, 'La dirección no puede superar los 200 caracteres')
    .optional(),
  horarios: z.string()
    .max(500, 'Los horarios no pueden superar los 500 caracteres')
    .optional(),
  webhook_url: z.string()
    .url('Debe ser una URL válida (ej: https://ejemplo.com/webhook)')
    .optional()
    .or(z.literal('')),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: any;
  onSuccess: () => void;
}

export function EmpresaModalPro({ open, onOpenChange, empresa, onSuccess }: EmpresaModalProps) {
  const { toast } = useToast();
  const isEditing = !!empresa;
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
    trigger,
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      direccion: '',
      horarios: '',
      webhook_url: '',
    },
  });

  const watchedValues = watch();

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
      setStep(1);
    }
  }, [empresa, reset]);

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      const payload = {
        ...data,
        direccion: data.direccion || null,
        horarios: data.horarios || null,
        webhook_url: data.webhook_url || null,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('empresas')
          .update(payload)
          .eq('id', empresa.id);

        if (error) throw error;
        toast({ 
          title: '✅ ¡Actualización exitosa!', 
          description: `La empresa "${data.nombre}" se actualizó correctamente.`,
        });
      } else {
        const { error } = await segClient
          .from('empresas')
          .insert([payload]);

        if (error) throw error;
        toast({ 
          title: '🎉 ¡Empresa creada!', 
          description: `Bienvenida "${data.nombre}" a la plataforma.`,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: '❌ Error al guardar',
        description: error.message || 'No se pudo guardar la empresa. Intenta nuevamente.',
        variant: 'destructive',
      });
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 ? ['nombre'] : [];
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default" className="max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEditing 
                  ? 'Modifica la información de tu empresa' 
                  : 'Configura una nueva empresa en la plataforma'
                }
              </DialogDescription>
            </div>
          </div>

          {/* Progress Steps */}
          {!isEditing && (
            <div className="flex items-center justify-center space-x-4">
              <div className={cn(
                "flex items-center gap-2 text-sm",
                step === 1 ? "text-blue-600 font-medium" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  step === 1 ? "bg-blue-600 text-white" : 
                  step > 1 ? "bg-green-600 text-white" : "bg-gray-200"
                )}>
                  {step > 1 ? <Check className="h-3 w-3" /> : "1"}
                </div>
                Información Básica
              </div>
              <Separator className="w-8" />
              <div className={cn(
                "flex items-center gap-2 text-sm",
                step === 2 ? "text-blue-600 font-medium" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  step === 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                )}>
                  2
                </div>
                Configuración
              </div>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="overflow-y-auto max-h-[60vh] space-y-6">
            
            {/* Step 1: Basic Information */}
            {(step === 1 || isEditing) && (
              <Card className="border-0 shadow-none bg-gray-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Información de la Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium flex items-center gap-2">
                      Nombre de la Empresa *
                      {errors.nombre && <AlertCircle className="h-3 w-3 text-red-500" />}
                    </Label>
                    <Input 
                      id="nombre" 
                      {...register('nombre')}
                      className={cn(
                        "transition-all duration-200",
                        errors.nombre 
                          ? "border-red-500 focus-visible:ring-red-500" 
                          : watchedValues.nombre 
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                      )}
                      placeholder="Ej: ACME Corporation S.A."
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.nombre.message}
                      </p>
                    )}
                    {watchedValues.nombre && !errors.nombre && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Nombre válido
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      Dirección Principal
                    </Label>
                    <Textarea 
                      id="direccion" 
                      {...register('direccion')}
                      className="resize-none"
                      rows={2}
                      placeholder="Av. Corrientes 1234, CABA, Argentina"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dirección de la oficina principal o sede central
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Configuration */}
            {(step === 2 || isEditing) && (
              <Card className="border-0 shadow-none bg-blue-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Configuración Avanzada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="horarios" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Horarios de Atención
                    </Label>
                    <Textarea 
                      id="horarios" 
                      {...register('horarios')}
                      className="resize-none"
                      rows={3}
                      placeholder="Lunes a Viernes: 9:00 - 18:00&#10;Sábados: 9:00 - 13:00&#10;Domingos: Cerrado"
                    />
                    <p className="text-xs text-muted-foreground">
                      Horarios de funcionamiento para mostrar a usuarios y clientes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_url" className="text-sm font-medium flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" />
                      Webhook URL
                      {errors.webhook_url && <AlertCircle className="h-3 w-3 text-red-500" />}
                    </Label>
                    <Input 
                      id="webhook_url" 
                      type="url" 
                      {...register('webhook_url')}
                      className={cn(
                        "font-mono text-sm",
                        errors.webhook_url 
                          ? "border-red-500 focus-visible:ring-red-500" 
                          : watchedValues.webhook_url 
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                      )}
                      placeholder="https://tu-dominio.com/webhook"
                    />
                    {errors.webhook_url && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.webhook_url.message}
                      </p>
                    )}
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-xs text-blue-700">
                        <strong>💡 Webhook:</strong> URL donde recibirás notificaciones automáticas de eventos importantes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview Card */}
            {step === 2 || isEditing ? (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                    <Check className="h-4 w-4" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {watchedValues.nombre || 'Nombre de la empresa'}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Empresa Multi-tenant
                        <Calendar className="h-3 w-3 ml-2" />
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {watchedValues.direccion && (
                    <div className="text-xs text-gray-600 flex items-start gap-2 pl-11">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      {watchedValues.direccion}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <DialogFooter className="bg-gray-50/50 -mx-6 -mb-6 px-6 py-4 mt-6">
            <div className="flex w-full justify-between">
              {!isEditing && step === 2 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                {!isEditing && step === 1 ? (
                  <Button type="button" onClick={nextStep} disabled={!watchedValues.nombre}>
                    Siguiente
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !isValid}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Guardar cambios' : 'Crear empresa'}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}