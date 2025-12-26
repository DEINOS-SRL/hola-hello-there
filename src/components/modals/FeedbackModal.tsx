import { useState, useRef, useCallback } from 'react';
import { MessageSquare, Send, Loader2, Paperclip, X, FileIcon, ImageIcon, Upload } from 'lucide-react';
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
import { uploadFeedbackAttachment } from '@/modules/security/services/feedbacksService';
import { cn } from '@/lib/utils';

const feedbackTypes = [
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'mejora', label: 'Mejora (feature)' },
  { value: 'queja', label: 'Queja' },
  { value: 'bug', label: 'Bug' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'ayuda', label: 'Ayuda' },
  { value: 'acceso-permiso', label: 'Acceso/Permiso' },
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
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
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = useCallback((selectedFiles: File[]) => {
    // Validar cantidad
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} archivos permitidos`);
      return;
    }

    // Validar cada archivo
    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} excede el tamaño máximo de 10MB`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} no es un tipo de archivo permitido`);
        continue;
      }
      validFiles.push(file);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    validateAndAddFiles(selectedFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting && files.length < MAX_FILES) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isSubmitting || files.length >= MAX_FILES) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isImage = (file: File) => file.type.startsWith('image/');

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

    try {
      setIsUploading(true);
      
      // Subir archivos si hay
      let archivosUrls: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(file => 
          uploadFeedbackAttachment(file, user.id)
        );
        archivosUrls = await Promise.all(uploadPromises);
      }

      createFeedback({
        usuario_id: user.id,
        usuario_email: user.email || undefined,
        usuario_nombre: user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : undefined,
        tipo: tipo as any,
        mensaje: mensaje.trim(),
        empresa_id: empresa?.id || undefined,
        archivos_adjuntos: archivosUrls.length > 0 ? archivosUrls : undefined,
      }, {
        onSuccess: () => {
          setTipo('');
          setMensaje('');
          setFiles([]);
          onOpenChange(false);
        }
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error al subir los archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isCreating && !isUploading) {
      setTipo('');
      setMensaje('');
      setFiles([]);
      onOpenChange(false);
    }
  };

  const isSubmitting = isCreating || isUploading;

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
            <Select value={tipo} onValueChange={setTipo} disabled={isSubmitting}>
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
              disabled={isSubmitting}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {mensaje.length}/1000 caracteres
            </p>
          </div>

          {/* Archivos adjuntos con Drag & Drop */}
          <div className="space-y-2">
            <Label>Archivos adjuntos (opcional)</Label>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting || files.length >= MAX_FILES}
              />
              
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isSubmitting && files.length < MAX_FILES && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all",
                  isDragOver 
                    ? "border-primary bg-primary/10" 
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                  (isSubmitting || files.length >= MAX_FILES) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload className={cn(
                  "h-8 w-8 mx-auto mb-2 transition-colors",
                  isDragOver ? "text-primary" : "text-muted-foreground"
                )} />
                <p className="text-sm text-muted-foreground">
                  {isDragOver ? (
                    <span className="text-primary font-medium">Suelta los archivos aquí</span>
                  ) : (
                    <>
                      <span className="font-medium">Arrastra archivos aquí</span> o haz clic para seleccionar
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {files.length}/{MAX_FILES} archivos
                </p>
              </div>
              
              {/* Lista de archivos */}
              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md animate-fade-in"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {isImage(file) ? (
                          <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Formatos: imágenes, PDF, Word, Excel. Máx 10MB por archivo.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? 'Subiendo...' : 'Enviando...'}
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