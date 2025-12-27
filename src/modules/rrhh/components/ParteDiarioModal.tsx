import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus, Camera, Loader2, Clock, CheckCircle2, Circle, Save, AlertTriangle, ClipboardList, AlignLeft, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { ModalTitle, TextareaWithIcon, SelectWithIcon, InputWithIcon } from '@/shared/components';
import { useCreateParteDiario, useUploadNovedadFoto } from '../hooks/usePartesDiarios';
import { 
  ESTADO_ANIMO_LABELS, 
  TIPO_NOVEDAD_LABELS,
  type TipoNovedad 
} from '../types/partesDiarios';
import { useAuth } from '@/contexts/AuthContext';

const actividadSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  hora_desde: z.string().min(1, 'Hora inicio requerida'),
  hora_hasta: z.string().min(1, 'Hora fin requerida'),
});

const novedadSchema = z.object({
  tipo: z.enum(['mejora', 'reclamo', 'incidente', 'observacion']),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  fotos: z.array(z.string()),
});

const formSchema = z.object({
  estado_animo: z.number().min(1).max(5),
  actividades: z.array(actividadSchema).min(1, 'Agrega al menos una actividad'),
  observaciones_adicionales: z.string().optional(),
  novedades: z.array(novedadSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface ParteDiarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleadoId: string;
}

const DRAFT_KEY = 'parte-diario-draft';

function getCurrentTime(): string {
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / 15) * 15;
  return `${String(now.getHours()).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

interface DraftData {
  date: string;
  formValues: Partial<FormValues>;
  newActividad: {
    descripcion: string;
    hora_desde: string;
    hora_hasta: string;
  };
  savedAt: string;
}

export function ParteDiarioModal({ open, onOpenChange, empleadoId }: ParteDiarioModalProps) {
  const { user, empresa } = useAuth();
  const createMutation = useCreateParteDiario();
  const uploadMutation = useUploadNovedadFoto();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [newActividad, setNewActividad] = useState({
    descripcion: '',
    hora_desde: getCurrentTime(),
    hora_hasta: getCurrentTime(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estado_animo: 3,
      actividades: [],
      observaciones_adicionales: '',
      novedades: [],
    },
  });

  const { fields: actividadFields, append: appendActividad, remove: removeActividad } = useFieldArray({
    control: form.control,
    name: 'actividades',
  });

  const novedades = form.watch('novedades');
  const actividades = form.watch('actividades');
  const observaciones = form.watch('observaciones_adicionales');
  const estadoAnimo = form.watch('estado_animo');

  // Progress calculation
  const progress = {
    animo: estadoAnimo >= 1 && estadoAnimo <= 5,
    actividades: actividades.length > 0,
    novedades: true, // Optional, always "complete"
  };
  const completedSteps = Object.values(progress).filter(Boolean).length;
  const totalSteps = 2; // Only animo and actividades are required
  const requiredCompleted = (progress.animo ? 1 : 0) + (progress.actividades ? 1 : 0);
  const progressPercent = (requiredCompleted / totalSteps) * 100;

  const hasUnsavedData = actividades.length > 0 || novedades.length > 0 || (observaciones && observaciones.trim().length > 0) || newActividad.descripcion.trim().length > 0;

  // Load draft on open
  useEffect(() => {
    if (open) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft: DraftData = JSON.parse(savedDraft);
          // Only restore if it's from today
          if (draft.date === getTodayKey()) {
            form.reset({
              estado_animo: draft.formValues.estado_animo || 3,
              actividades: draft.formValues.actividades || [],
              observaciones_adicionales: draft.formValues.observaciones_adicionales || '',
              novedades: draft.formValues.novedades || [],
            });
            setNewActividad(draft.newActividad || {
              descripcion: '',
              hora_desde: getCurrentTime(),
              hora_hasta: getCurrentTime(),
            });
            setLastSaved(draft.savedAt);
            toast.info('Borrador restaurado', {
              description: 'Continúa donde lo dejaste',
            });
          } else {
            // Clear old draft
            localStorage.removeItem(DRAFT_KEY);
          }
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [open]);

  // Auto-save draft
  const saveDraft = useCallback(() => {
    const formValues = form.getValues();
    const draft: DraftData = {
      date: getTodayKey(),
      formValues,
      newActividad,
      savedAt: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setLastSaved(draft.savedAt);
  }, [form, newActividad]);

  // Auto-save every 30 seconds if there's data
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      if (hasUnsavedData) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [open, hasUnsavedData, saveDraft]);

  // Save on blur/tab change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && open && hasUnsavedData) {
        saveDraft();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [open, hasUnsavedData, saveDraft]);

  const handleManualSave = () => {
    saveDraft();
    toast.success('Borrador guardado');
  };

  const handleClose = (shouldClose: boolean) => {
    if (!shouldClose) return;
    
    if (hasUnsavedData) {
      saveDraft(); // Save before asking
      setShowConfirmClose(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    form.reset();
    setNewActividad({ descripcion: '', hora_desde: getCurrentTime(), hora_hasta: getCurrentTime() });
    setLastSaved(null);
    onOpenChange(false);
  };

  const clearDraftAndClose = () => {
    localStorage.removeItem(DRAFT_KEY);
    resetAndClose();
  };

  const handleAddActividad = () => {
    if (!newActividad.descripcion.trim()) return;
    
    appendActividad({
      descripcion: newActividad.descripcion.trim(),
      hora_desde: newActividad.hora_desde,
      hora_hasta: newActividad.hora_hasta,
    });
    
    setNewActividad({
      descripcion: '',
      hora_desde: newActividad.hora_hasta,
      hora_hasta: newActividad.hora_hasta,
    });

    // Auto-save after adding activity
    setTimeout(() => saveDraft(), 100);
  };

  const handleAddNovedad = () => {
    const current = form.getValues('novedades');
    form.setValue('novedades', [
      ...current,
      { tipo: 'observacion', descripcion: '', fotos: [] },
    ]);
  };

  const handleRemoveNovedad = (index: number) => {
    const current = form.getValues('novedades');
    form.setValue('novedades', current.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const url = await uploadMutation.mutateAsync(file);
      const current = form.getValues('novedades');
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        fotos: [...updated[index].fotos, url],
      };
      form.setValue('novedades', updated);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemovePhoto = (novedadIndex: number, photoIndex: number) => {
    const current = form.getValues('novedades');
    const updated = [...current];
    updated[novedadIndex] = {
      ...updated[novedadIndex],
      fotos: updated[novedadIndex].fotos.filter((_, i) => i !== photoIndex),
    };
    form.setValue('novedades', updated);
  };

  const onSubmit = async (values: FormValues) => {
    const novedadesValidas = values.novedades
      .filter(n => n.descripcion.trim())
      .map(n => ({
        tipo: n.tipo,
        descripcion: n.descripcion,
        fotos: n.fotos,
      }));
    
    await createMutation.mutateAsync({
      empleado_id: empleadoId,
      empresa_id: empresa?.id,
      estado_animo: values.estado_animo,
      observaciones_adicionales: values.observaciones_adicionales,
      actividades: values.actividades.map(a => ({
        descripcion: a.descripcion,
        hora_desde: a.hora_desde + ':00',
        hora_hasta: a.hora_hasta + ':00',
      })),
      novedades: novedadesValidas,
    });
    
    // Clear draft on successful submit
    localStorage.removeItem(DRAFT_KEY);
    resetAndClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose(true);
        }
      }}>
        <DialogContent 
          className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Alerta si no tiene empresa */}
          {!empresa && (
            <div className="px-6 pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Sin empresa asignada</AlertTitle>
                <AlertDescription>
                  No tienes una empresa asignada a tu cuenta. Contacta al administrador para poder registrar partes diarios.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Header fijo con progreso */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <ModalTitle icon={ClipboardList}>Parte Diario de Tareas</ModalTitle>
              {lastSaved && (
                <Badge variant="outline" className="text-xs font-normal gap-1">
                  <Save className="h-3 w-3" />
                  Guardado {lastSaved}
                </Badge>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {progress.animo ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={progress.animo ? 'text-foreground' : 'text-muted-foreground'}>
                      Ánimo
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {progress.actividades ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={progress.actividades ? 'text-foreground' : 'text-muted-foreground'}>
                      Actividades
                      {actividades.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                          {actividades.length}
                        </Badge>
                      )}
                    </span>
                  </div>
                  {novedades.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span className="text-foreground">
                        Novedades
                        <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                          {novedades.length}
                        </Badge>
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {requiredCompleted}/{totalSteps} requeridos
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          </DialogHeader>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto scrollbar-hide animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Form {...form}>
              <form id="parte-diario-form" onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
                {/* Estado de ánimo */}
                <FormField
                  control={form.control}
                  name="estado_animo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Cómo te sentiste hoy?</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 justify-center">
                          {Object.entries(ESTADO_ANIMO_LABELS).map(([value, { emoji, label }]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(Number(value))}
                              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                                field.value === Number(value)
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <span className="text-2xl">{emoji}</span>
                              <span className="text-xs mt-1 text-muted-foreground">{label}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actividades con horarios */}
                <div className="space-y-4">
                  <FormLabel className="text-base">Actividades realizadas</FormLabel>
                  
                  {actividadFields.length > 0 && (
                    <div className="space-y-2">
                      {actividadFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg group"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium text-primary shrink-0">
                            {form.watch(`actividades.${index}.hora_desde`)} - {form.watch(`actividades.${index}.hora_hasta`)}
                          </span>
                          <span className="text-sm flex-1 truncate">
                            {form.watch(`actividades.${index}.descripcion`)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeActividad(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 border rounded-lg space-y-3 bg-background">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={newActividad.hora_desde}
                          onChange={(e) => setNewActividad({ ...newActividad, hora_desde: e.target.value })}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">a</span>
                        <Input
                          type="time"
                          value={newActividad.hora_hasta}
                          onChange={(e) => setNewActividad({ ...newActividad, hora_hasta: e.target.value })}
                          className="w-28"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <InputWithIcon
                        icon={AlignLeft}
                        placeholder="¿Qué actividad realizaste?"
                        value={newActividad.descripcion}
                        onChange={(e) => setNewActividad({ ...newActividad, descripcion: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddActividad();
                          }
                        }}
                        containerClassName="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddActividad}
                        disabled={!newActividad.descripcion.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {form.formState.errors.actividades && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.actividades.message}
                    </p>
                  )}
                </div>

                {/* Novedades */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base">Novedades (opcional)</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddNovedad}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>

                  {novedades.map((novedad, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name={`novedades.${index}.tipo`}
                          render={({ field }) => (
                            <SelectWithIcon
                              icon={Tag}
                              value={field.value}
                              onValueChange={field.onChange}
                              containerClassName="w-48"
                            >
                              {Object.entries(TIPO_NOVEDAD_LABELS).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectWithIcon>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveNovedad(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`novedades.${index}.descripcion`}
                        render={({ field }) => (
                          <TextareaWithIcon
                            icon={AlignLeft}
                            placeholder="Describe la novedad..."
                            className="min-h-[80px] resize-none"
                            {...field}
                          />
                        )}
                      />

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {novedad.fotos.map((foto, photoIndex) => (
                            <div key={photoIndex} className="relative group">
                              <img
                                src={foto}
                                alt={`Foto ${photoIndex + 1}`}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index, photoIndex)}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}

                          <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                            {uploadingIndex === index ? (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                              <Camera className="h-5 w-5 text-muted-foreground" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(index, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Observaciones adicionales */}
                <FormField
                  control={form.control}
                  name="observaciones_adicionales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones adicionales (opcional)</FormLabel>
                      <FormControl>
                        <TextareaWithIcon
                          icon={AlignLeft}
                          placeholder="Algo más que quieras agregar..."
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* Footer fijo */}
          <div className="flex items-center justify-between gap-2 p-4 border-t shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={!hasUnsavedData}
              className="text-muted-foreground"
            >
              <Save className="h-4 w-4 mr-1" />
              Guardar borrador
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(true)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                form="parte-diario-form"
                disabled={createMutation.isPending || !progress.actividades || !empresa}
                title={!empresa ? 'Necesitas una empresa asignada' : undefined}
              >
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Enviar Parte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación al cerrar */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Qué deseas hacer?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu borrador ha sido guardado automáticamente. Puedes continuar más tarde o descartarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Continuar editando</AlertDialogCancel>
            <Button variant="outline" onClick={resetAndClose}>
              Guardar y salir
            </Button>
            <AlertDialogAction onClick={clearDraftAndClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
