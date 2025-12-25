import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, Edit3, FolderOpen, Github } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconOptions = [
  { value: 'Shield', label: 'Escudo (Seguridad)' },
  { value: 'BarChart3', label: 'Gráficos (Reportes)' },
  { value: 'FileText', label: 'Documento (Documentos)' },
  { value: 'Calendar', label: 'Calendario' },
  { value: 'MessageSquare', label: 'Mensaje (Mensajería)' },
  { value: 'ClipboardList', label: 'Lista (Partes)' },
  { value: 'AppWindow', label: 'Aplicación (Genérico)' },
];

const aplicacionSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  ruta: z.string().optional(),
  activa: z.boolean(),
  link_documentos: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  repositorio: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  prd_documento: z.string().optional(),
});

type AplicacionFormData = z.infer<typeof aplicacionSchema>;

interface AplicacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aplicacion?: any;
  onSuccess: () => void;
}

export function AplicacionModal({ open, onOpenChange, aplicacion, onSuccess }: AplicacionModalProps) {
  const { toast } = useToast();
  const isEditing = !!aplicacion;
  const [prdTab, setPrdTab] = useState<'edit' | 'preview'>('edit');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AplicacionFormData>({
    resolver: zodResolver(aplicacionSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      icono: 'AppWindow',
      ruta: '',
      activa: true,
      link_documentos: '',
      repositorio: '',
      prd_documento: '',
    },
  });

  const activa = watch('activa');
  const icono = watch('icono');
  const prdDocumento = watch('prd_documento');

  useEffect(() => {
    if (aplicacion) {
      reset({
        nombre: aplicacion.nombre,
        descripcion: aplicacion.descripcion || '',
        icono: aplicacion.icono || 'AppWindow',
        ruta: aplicacion.ruta || '',
        activa: aplicacion.activa ?? true,
        link_documentos: aplicacion.link_documentos || '',
        repositorio: aplicacion.repositorio || '',
        prd_documento: aplicacion.prd_documento || '',
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        icono: 'AppWindow',
        ruta: '',
        activa: true,
        link_documentos: '',
        repositorio: '',
        prd_documento: '',
      });
    }
    setPrdTab('edit');
  }, [aplicacion, reset]);

  const onSubmit = async (data: AplicacionFormData) => {
    try {
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        icono: data.icono || 'AppWindow',
        ruta: data.ruta || null,
        activa: data.activa,
        link_documentos: data.link_documentos || null,
        repositorio: data.repositorio || null,
        prd_documento: data.prd_documento || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('seg_aplicaciones')
          .update(payload)
          .eq('id', aplicacion.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Aplicación actualizada correctamente' });
      } else {
        const { error } = await supabase
          .from('seg_aplicaciones')
          .insert([payload] as any);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Aplicación creada correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la aplicación',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? 'Editar Aplicación' : 'Nueva Aplicación'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la aplicación' : 'Completa los datos para crear una nueva aplicación'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <form id="aplicacion-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" {...register('descripcion')} placeholder="Describe la funcionalidad de la aplicación" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icono</Label>
                <Select value={icono} onValueChange={(value) => setValue('icono', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar icono" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruta">Ruta</Label>
                <Input id="ruta" {...register('ruta')} placeholder="/modulo" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activa">En producción</Label>
                <p className="text-xs text-muted-foreground">Si está desactivada, mostrará "Próximamente"</p>
              </div>
              <Switch
                id="activa"
                checked={activa}
                onCheckedChange={(checked) => setValue('activa', checked)}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-sm">Documentación</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link_documentos" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Carpeta del módulo
                  </Label>
                  <Input 
                    id="link_documentos" 
                    {...register('link_documentos')} 
                    placeholder="https://drive.google.com/..." 
                    type="url"
                  />
                  {errors.link_documentos && <p className="text-xs text-destructive">{errors.link_documentos.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repositorio" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    Repositorio
                  </Label>
                  <Input 
                    id="repositorio" 
                    {...register('repositorio')} 
                    placeholder="https://github.com/..." 
                    type="url"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Documento PRD
                  <span className="text-xs text-muted-foreground">(Markdown)</span>
                </Label>
                
                <Tabs value={prdTab} onValueChange={(v) => setPrdTab(v as 'edit' | 'preview')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit" className="flex items-center gap-2">
                      <Edit3 className="h-3 w-3" />
                      Editar
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      Vista previa
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="edit" className="mt-2">
                    <Textarea 
                      {...register('prd_documento')} 
                      placeholder="# Título del PRD&#10;&#10;## Descripción&#10;&#10;Escribe aquí el documento PRD en formato Markdown..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-2">
                    <div className="min-h-[200px] max-h-[300px] overflow-auto rounded-md border bg-muted/30 p-4">
                      {prdDocumento ? (
                        <article className="prose prose-sm dark:prose-invert prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 max-w-none">
                          <ReactMarkdown>{prdDocumento}</ReactMarkdown>
                        </article>
                      ) : (
                        <p className="text-muted-foreground italic">Sin contenido para mostrar</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="aplicacion-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar cambios' : 'Crear aplicación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}