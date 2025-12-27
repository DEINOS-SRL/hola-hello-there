import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Upload, 
  Check, 
  AlertCircle, 
  Eye,
  EyeOff,
  Key,
  Shield,
  Camera
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const usuarioSchema = z.object({
  user_id: z.string().uuid('ID de usuario inválido').optional(),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo se permiten letras y espacios'),
  email: z.string()
    .email('Formato de email inválido')
    .max(255, 'Email demasiado largo'),
  telefono: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  avatar_url: z.string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface UsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: any;
  onSuccess: () => void;
}

export function UsuarioModalPro({ open, onOpenChange, usuario, onSuccess }: UsuarioModalProps) {
  const { toast } = useToast();
  const isEditing = !!usuario;
  const [step, setStep] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
    trigger,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    mode: 'onChange',
    defaultValues: {
      user_id: '',
      nombre: '',
      email: '',
      telefono: '',
      avatar_url: '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (usuario) {
      reset({
        user_id: usuario.user_id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || '',
        avatar_url: usuario.avatar_url || '',
      });
      setAvatarPreview(usuario.avatar_url || '');
    } else {
      reset({
        user_id: crypto.randomUUID(),
        nombre: '',
        email: '',
        telefono: '',
        avatar_url: '',
      });
      setStep(1);
      setAvatarPreview('');
    }
  }, [usuario, reset]);

  // Update avatar preview when URL changes
  useEffect(() => {
    if (watchedValues.avatar_url && watchedValues.avatar_url !== avatarPreview) {
      setAvatarPreview(watchedValues.avatar_url);
    }
  }, [watchedValues.avatar_url, avatarPreview]);

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      const payload = {
        user_id: data.user_id || crypto.randomUUID(),
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || null,
        avatar_url: data.avatar_url || null,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('perfiles_usuarios')
          .update(payload)
          .eq('user_id', usuario.user_id);

        if (error) throw error;
        toast({ 
          title: '✅ ¡Perfil actualizado!', 
          description: `El perfil de ${data.nombre} se actualizó correctamente.`,
        });
      } else {
        const { error } = await segClient
          .from('perfiles_usuarios')
          .insert([payload]);

        if (error) throw error;
        toast({ 
          title: '🎉 ¡Usuario creado!', 
          description: `Bienvenido ${data.nombre} a la plataforma.`,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: '❌ Error al guardar',
        description: error.message || 'No se pudo guardar el usuario. Intenta nuevamente.',
        variant: 'destructive',
      });
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 ? ['nombre', 'email'] : [];
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const generateAvatar = () => {
    const name = watchedValues.nombre || 'Usuario';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['ff6b6b', '4ecdc4', '45b7d1', '96ceb4', 'ffeaa7', 'dda0dd', 'ff9ff3'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200&font-size=0.6&rounded=true&bold=true`;
    setValue('avatar_url', avatarUrl);
  };

  const getNameInitials = () => {
    if (!watchedValues.nombre) return 'U';
    return watchedValues.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEditing 
                  ? 'Modifica la información del usuario' 
                  : 'Crea un nuevo perfil de usuario en la plataforma'
                }
              </DialogDescription>
            </div>
          </div>

          {/* Progress Steps */}
          {!isEditing && (
            <div className="flex items-center justify-center space-x-4">
              <div className={cn(
                "flex items-center gap-2 text-sm",
                step === 1 ? "text-green-600 font-medium" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  step === 1 ? "bg-green-600 text-white" : 
                  step > 1 ? "bg-green-600 text-white" : "bg-gray-200"
                )}>
                  {step > 1 ? <Check className="h-3 w-3" /> : "1"}
                </div>
                Datos Personales
              </div>
              <Separator className="w-8" />
              <div className={cn(
                "flex items-center gap-2 text-sm",
                step === 2 ? "text-green-600 font-medium" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  step === 2 ? "bg-green-600 text-white" : "bg-gray-200"
                )}>
                  2
                </div>
                Personalización
              </div>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="overflow-y-auto max-h-[60vh] space-y-6">
            
            {/* Step 1: Personal Data */}
            {(step === 1 || isEditing) && (
              <Card className="border-0 shadow-none bg-gray-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium flex items-center gap-2">
                        Nombre Completo *
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
                        placeholder="Ej: Juan Carlos Pérez"
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
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email *
                        {errors.email && <AlertCircle className="h-3 w-3 text-red-500" />}
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...register('email')}
                        className={cn(
                          "transition-all duration-200",
                          errors.email 
                            ? "border-red-500 focus-visible:ring-red-500" 
                            : watchedValues.email 
                              ? "border-green-500 focus-visible:ring-green-500"
                              : ""
                        )}
                        placeholder="usuario@empresa.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email.message}
                        </p>
                      )}
                      {watchedValues.email && !errors.email && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Email válido
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      Teléfono
                      {errors.telefono && <AlertCircle className="h-3 w-3 text-red-500" />}
                    </Label>
                    <Input 
                      id="telefono" 
                      type="tel" 
                      {...register('telefono')}
                      className={cn(
                        "transition-all duration-200",
                        errors.telefono 
                          ? "border-red-500 focus-visible:ring-red-500" 
                          : watchedValues.telefono 
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                      )}
                      placeholder="+54 11 1234-5678"
                    />
                    {errors.telefono && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.telefono.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Formato: +54 11 1234-5678 (opcional)
                    </p>
                  </div>

                  {isEditing && (
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-xs text-blue-700 flex items-center gap-2">
                        <Key className="h-3 w-3" />
                        <strong>ID:</strong> {usuario?.user_id}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Avatar and Personalization */}
            {(step === 2 || isEditing) && (
              <Card className="border-0 shadow-none bg-green-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Avatar y Personalización
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-green-400 to-blue-500 text-white">
                          {getNameInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <Badge variant="secondary" className="text-xs">
                        Vista previa
                      </Badge>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="avatar_url" className="text-sm font-medium flex items-center gap-2">
                          URL del Avatar
                          {errors.avatar_url && <AlertCircle className="h-3 w-3 text-red-500" />}
                        </Label>
                        <Input 
                          id="avatar_url" 
                          type="url" 
                          {...register('avatar_url')}
                          className={cn(
                            "font-mono text-sm",
                            errors.avatar_url 
                              ? "border-red-500 focus-visible:ring-red-500" 
                              : watchedValues.avatar_url 
                                ? "border-green-500 focus-visible:ring-green-500"
                                : ""
                          )}
                          placeholder="https://ejemplo.com/avatar.jpg"
                        />
                        {errors.avatar_url && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.avatar_url.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={generateAvatar}>
                          <Camera className="h-3 w-3 mr-1" />
                          Generar Avatar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview Card */}
            {(step === 2 || isEditing) && watchedValues.nombre && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                    <Check className="h-4 w-4" />
                    Vista Previa del Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow">
                      <AvatarImage src={avatarPreview} />
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                        {getNameInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {watchedValues.nombre}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {watchedValues.email || 'Sin email'}
                        </div>
                        {watchedValues.telefono && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {watchedValues.telefono}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Shield className="h-3 w-3" />
                      Usuario Verificado
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!watchedValues.nombre || !watchedValues.email || !!errors.nombre || !!errors.email}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !isValid}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Guardar cambios' : 'Crear usuario'}
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