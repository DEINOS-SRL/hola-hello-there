import { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, CreditCard, Building2, Loader2, MessageSquare, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMyFeedbacks } from '@/modules/security/hooks/useFeedbacks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Feedback } from '@/modules/security/services/feedbacksService';
export default function Perfil() {
  const { user, empresa, updateUser } = useAuth();
  const { toast } = useToast();
  const { 
    feedbacks, 
    isLoading: feedbacksLoading, 
    getStatusBadgeVariant, 
    getTipoBadgeVariant, 
    getStatusLabel, 
    getTipoLabel 
  } = useMyFeedbacks();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    dni: user?.dni || '',
    direccion: user?.direccion || '',
    telefono: user?.telefono || '',
  });

  const initials = user 
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : 'U';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    updateUser(formData);
    setIsLoading(false);

    toast({
      title: 'Perfil actualizado',
      description: 'Los cambios se han guardado correctamente',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu información personal
        </p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">
                {user?.nombre} {user?.apellido}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{empresa?.nombre}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Actualiza tu información de contacto y datos personales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI / Documento de Identidad</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="12345678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Tu dirección completa"
                />
              </div>
            </div>

            <Separator />

            {/* Read-only fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Información de cuenta (solo lectura)</h3>
              
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={user?.email || ''}
                    className="pl-10 bg-muted"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El email no puede ser modificado. Contacta al administrador si necesitas cambiarlo.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={empresa?.nombre || ''}
                    className="pl-10 bg-muted"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mis Feedbacks
          </CardTitle>
          <CardDescription>
            Historial de sugerencias, consultas y reportes que has enviado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbacksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No has enviado ningún feedback todavía</p>
              <p className="text-sm">Usa el botón de feedback en la barra superior para enviar sugerencias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {feedback.estado === 'resuelto' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : feedback.estado === 'en_revision' ? (
                      <Clock className="h-5 w-5 text-primary" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant={getTipoBadgeVariant(feedback.tipo) as any}>
                        {getTipoLabel(feedback.tipo)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(feedback.estado) as any}>
                        {getStatusLabel(feedback.estado)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(feedback.created_at), "d 'de' MMM, yyyy", { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{feedback.mensaje}</p>
                    {feedback.respuesta && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-md border-l-2 border-primary">
                        <p className="text-xs text-muted-foreground mb-1">Respuesta:</p>
                        <p className="text-sm line-clamp-2">{feedback.respuesta}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Detalle del Feedback
            </DialogTitle>
            <DialogDescription>
              Enviado el {selectedFeedback && format(new Date(selectedFeedback.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={getTipoBadgeVariant(selectedFeedback.tipo) as any}>
                  {getTipoLabel(selectedFeedback.tipo)}
                </Badge>
                <Badge variant={getStatusBadgeVariant(selectedFeedback.estado) as any}>
                  {getStatusLabel(selectedFeedback.estado)}
                </Badge>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Tu mensaje</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedFeedback.mensaje}</p>
              </div>

              {selectedFeedback.respuesta && (
                <div className="p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                  <Label className="text-muted-foreground text-xs">Respuesta del equipo</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedFeedback.respuesta}</p>
                  {selectedFeedback.respondido_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Respondido el {format(new Date(selectedFeedback.respondido_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
