import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus, Camera, Trash2, Loader2 } from 'lucide-react';
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
import { useCreateParteDiario, useUploadNovedadFoto } from '../hooks/usePartesDiarios';
import { 
  ESTADO_ANIMO_LABELS, 
  TIPO_NOVEDAD_LABELS,
  type TipoNovedad 
} from '../types/partesDiarios';
import { useAuth } from '@/contexts/AuthContext';

const novedadSchema = z.object({
  tipo: z.enum(['mejora', 'reclamo', 'incidente', 'observacion']),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  fotos: z.array(z.string()),
});

const formSchema = z.object({
  actividades_realizadas: z.string().min(10, 'Describe las actividades realizadas (mínimo 10 caracteres)'),
  estado_animo: z.number().min(1).max(5),
  observaciones_adicionales: z.string().optional(),
  novedades: z.array(novedadSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface ParteDiarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleadoId: string;
}

export function ParteDiarioModal({ open, onOpenChange, empleadoId }: ParteDiarioModalProps) {
  const { user } = useAuth();
  const createMutation = useCreateParteDiario();
  const uploadMutation = useUploadNovedadFoto();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actividades_realizadas: '',
      estado_animo: 3,
      observaciones_adicionales: '',
      novedades: [],
    },
  });

  const novedades = form.watch('novedades');

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
      actividades_realizadas: values.actividades_realizadas,
      estado_animo: values.estado_animo,
      observaciones_adicionales: values.observaciones_adicionales,
      novedades: novedadesValidas,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Parte Diario de Tareas</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Actividades realizadas */}
            <FormField
              control={form.control}
              name="actividades_realizadas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividades realizadas hoy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe todas las actividades que realizaste durante el día..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-end gap-2">
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
      </DialogContent>
    </Dialog>
  );
}
