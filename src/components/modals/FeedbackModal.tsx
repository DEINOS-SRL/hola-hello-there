import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedbacks } from '@/modules/security/hooks/useFeedbacks';

const feedbackTypes = [
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'mejora', label: 'Mejora (feature)' },
  { value: 'queja', label: 'Queja' },
  { value: 'bug', label: 'Bug' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'ayuda', label: 'Ayuda' },
  { value: 'acceso-permiso', label: 'Acceso/Permiso' },
];

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { user, empresa } = useAuth();
  const { createFeedback, isCreating } = useFeedbacks();
  const [tipo, setTipo] = useState<string>('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async () => {
    if (!tipo) {
      toast.error('Por favor selecciona un tipo de feedback');
      return;
    }
    if (!mensaje.trim()) {
      toast.error('Por favor ingresa un mensaje');
      return;
    }
    if (mensaje.trim().length < 10) {
      toast.error('El mensaje debe tener al menos 10 caracteres');
      return;
    }
    if (!user) {
      toast.error('Debes iniciar sesión para enviar feedback');
      return;
    }

    createFeedback({
      usuario_id: user.id,
      usuario_email: user.email || undefined,
      usuario_nombre: user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : undefined,
      tipo: tipo as any,
      mensaje: mensaje.trim(),
      empresa_id: empresa?.id || undefined,
    }, {
      onSuccess: () => {
        setTipo('');
        setMensaje('');
        onOpenChange(false);
      }
    });
  };

  const handleClose = () => {
    if (!isCreating) {
      setTipo('');
      setMensaje('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Tu opinión nos ayuda a mejorar la plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de feedback</Label>
            <Select value={tipo} onValueChange={setTipo} disabled={isCreating}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecciona un tipo..." />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              placeholder="Describe tu sugerencia, problema o consulta..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={isCreating}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {mensaje.length}/1000 caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
