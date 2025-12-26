import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus, Camera, Trash2, Loader2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// Helper to get current time rounded to nearest 15 min
function getCurrentTime(): string {
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / 15) * 15;
  return `${String(now.getHours()).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function ParteDiarioModal({ open, onOpenChange, empleadoId }: ParteDiarioModalProps) {
  const { user } = useAuth();
  const createMutation = useCreateParteDiario();
  const uploadMutation = useUploadNovedadFoto();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
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

  const handleAddActividad = () => {
    if (!newActividad.descripcion.trim()) return;
    
    appendActividad({
      descripcion: newActividad.descripcion.trim(),
      hora_desde: newActividad.hora_desde,
      hora_hasta: newActividad.hora_hasta,
    });
    
    // Reset with hora_hasta as new hora_desde
    setNewActividad({
      descripcion: '',
      hora_desde: newActividad.hora_hasta,
      hora_hasta: newActividad.hora_hasta,
    });
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
      estado_animo: values.estado_animo,
      observaciones_adicionales: values.observaciones_adicionales,
      actividades: values.actividades.map(a => ({
        descripcion: a.descripcion,
        hora_desde: a.hora_desde + ':00',
        hora_hasta: a.hora_hasta + ':00',
      })),
      novedades: novedadesValidas,
    });
    form.reset();
    setNewActividad({ descripcion: '', hora_desde: getCurrentTime(), hora_hasta: getCurrentTime() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Parte Diario de Tareas</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
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
                
                {/* Lista de actividades agregadas */}
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

                {/* Input para nueva actividad */}
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
                    <Input
                      placeholder="¿Qué actividad realizaste?"
                      value={newActividad.descripcion}
                      onChange={(e) => setNewActividad({ ...newActividad, descripcion: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddActividad();
                        }
                      }}
                      className="flex-1"
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TIPO_NOVEDAD_LABELS).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                        <Textarea
                          placeholder="Describe la novedad..."
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      )}
                    />

                    {/* Fotos */}
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
                      <Textarea
                        placeholder="Algo más que quieras agregar..."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Enviar Parte
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
