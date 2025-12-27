import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, Edit3, FolderOpen, Github } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { segClient } from '@/modules/security/services/segClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { ModalTitle, InputWithIcon, SelectWithIcon, TextareaWithIcon } from '@/shared/components';
import { LayoutGrid, Type, AlignLeft, Route, Hash, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

const iconOptions = [
  { value: 'Shield', label: 'Escudo (Seguridad)' },
  { value: 'BarChart3', label: 'Gráficos (Reportes)' },
  { value: 'FileText', label: 'Documento (Documentos)' },
  { value: 'Calendar', label: 'Calendario' },
  { value: 'MessageSquare', label: 'Mensaje (Mensajería)' },
  { value: 'ClipboardList', label: 'Lista (Partes)' },
  { value: 'LayoutGrid', label: 'Módulo (Genérico)' },
  { value: 'Workflow', label: 'Operación' },
  { value: 'Users', label: 'Empleados' },
  { value: 'UserCheck', label: 'Usuario Verificado' },
  { value: 'Truck', label: 'Equipos' },
  { value: 'BadgeCheck', label: 'Habilitaciones' },
  { value: 'BookOpen', label: 'Libro (Conocimiento)' },
  { value: 'FileCheck', label: 'Archivo Verificado (SGI)' },
  { value: 'FolderOpen', label: 'Carpeta' },
  { value: 'Database', label: 'Base de Datos' },
  { value: 'Settings', label: 'Configuración' },
  { value: 'Briefcase', label: 'Maletín (RRHH)' },
];

const moduloSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  ruta: z.string().optional(),
  activo: z.boolean(),
  modulo_padre_id: z.string().optional(),
  orden: z.number().optional(),
  link_documentos: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  repositorio: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  prd_documento: z.string().optional(),
});

type ModuloFormData = z.infer<typeof moduloSchema>;

interface ModuloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulo?: any;
  onSuccess: () => void;
}

export function ModuloModal({ open, onOpenChange, modulo, onSuccess }: ModuloModalProps) {
  const { toast } = useToast();
  const isEditing = !!modulo;
  const [prdTab, setPrdTab] = useState<'edit' | 'preview'>('edit');

  // Cargar módulos principales para selector de padre
  const { data: modulosPadre } = useQuery({
    queryKey: ['modulos-padre'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('modulos')
        .select('id, nombre')
        .is('modulo_padre_id', null)
        .order('nombre');
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ModuloFormData>({
    resolver: zodResolver(moduloSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      icono: 'LayoutGrid',
      ruta: '',
      activo: true,
      modulo_padre_id: '',
      orden: 0,
      link_documentos: '',
      repositorio: '',
      prd_documento: '',
    },
  });

  const activo = watch('activo');
  const icono = watch('icono');
  const moduloPadreId = watch('modulo_padre_id');
  const prdDocumento = watch('prd_documento');

  useEffect(() => {
    if (modulo) {
      reset({
        nombre: modulo.nombre,
        descripcion: modulo.descripcion || '',
        icono: modulo.icono || 'LayoutGrid',
        ruta: modulo.ruta || '',
        activo: modulo.activo ?? true,
        modulo_padre_id: modulo.modulo_padre_id || '',
        orden: modulo.orden || 0,
        link_documentos: modulo.link_documentos || '',
        repositorio: modulo.repositorio || '',
        prd_documento: modulo.prd_documento || '',
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        icono: 'LayoutGrid',
        ruta: '',
        activo: true,
        modulo_padre_id: '',
        orden: 0,
        link_documentos: '',
        repositorio: '',
        prd_documento: '',
      });
    }
    setPrdTab('edit');
  }, [modulo, reset]);

  const onSubmit = async (data: ModuloFormData) => {
    try {
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        icono: data.icono || 'LayoutGrid',
        ruta: data.ruta || null,
        activo: data.activo,
        modulo_padre_id: data.modulo_padre_id || null,
        orden: data.orden || 0,
        link_documentos: data.link_documentos || null,
        repositorio: data.repositorio || null,
        prd_documento: data.prd_documento || null,
      };

      if (isEditing) {
        const { error } = await segClient
          .from('modulos')
          .update(payload)
          .eq('id', modulo.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Módulo actualizado correctamente' });
      } else {
        const { error } = await segClient
          .from('modulos')
          .insert([payload]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Módulo creado correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el módulo',
        variant: 'destructive',
      });
    }
  };

  // Filtrar módulos padre para no mostrar el actual
  const filteredModulosPadre = modulosPadre?.filter((m: any) => m.id !== modulo?.id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <ModalTitle icon={LayoutGrid}>{isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}</ModalTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del módulo' : 'Completa los datos para crear un nuevo módulo'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <form id="modulo-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <InputWithIcon icon={Type} id="nombre" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <TextareaWithIcon icon={AlignLeft} id="descripcion" {...register('descripcion')} placeholder="Describe la funcionalidad del módulo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icono</Label>
                <SelectWithIcon
                  icon={LayoutGrid}
                  value={icono}
                  onValueChange={(value) => setValue('icono', value)}
                >
                  <SelectValue placeholder="Seleccionar icono" />
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithIcon>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruta">Ruta</Label>
                <InputWithIcon icon={Route} id="ruta" {...register('ruta')} placeholder="/modulo" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Módulo Padre</Label>
                <SelectWithIcon
                  icon={FolderOpen}
                  value={moduloPadreId || 'none'}
                  onValueChange={(value) => setValue('modulo_padre_id', value === 'none' ? '' : value)}
                >
                  <SelectValue placeholder="Ninguno (Principal)" />
                  <SelectContent>
                    <SelectItem value="none">Ninguno (Principal)</SelectItem>
                    {filteredModulosPadre.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithIcon>
                <p className="text-xs text-muted-foreground">Si seleccionas un padre, este será un submódulo</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orden">Orden</Label>
                <InputWithIcon
                  icon={Hash}
                  id="orden"
                  type="number"
                  {...register('orden', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activo">En producción</Label>
                <p className="text-xs text-muted-foreground">Si está desactivado, mostrará "Próximamente"</p>
              </div>
              <Switch
                id="activo"
                checked={activo}
                onCheckedChange={(checked) => setValue('activo', checked)}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-sm">Documentación</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link_documentos">Carpeta del módulo</Label>
                  <InputWithIcon
                    icon={FolderOpen}
                    id="link_documentos"
                    {...register('link_documentos')}
                    placeholder="https://drive.google.com/..."
                    type="url"
                  />
                  {errors.link_documentos && <p className="text-xs text-destructive">{errors.link_documentos.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repositorio">Repositorio</Label>
                  <InputWithIcon
                    icon={Github}
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
                        <article className="prose prose-sm dark:prose-invert prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-table:my-2 prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:p-2 max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !String(children).includes('\n');
                                return !isInline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-md text-sm !my-2"
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {prdDocumento}
                          </ReactMarkdown>
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
          <Button type="submit" form="modulo-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar cambios' : 'Crear módulo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
