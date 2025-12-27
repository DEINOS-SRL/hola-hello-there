import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus, Truck, Hash, Type, AlignLeft, Boxes, Tag, Package, Barcode, MapPin, FileText, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ModalTitle, InputWithIcon, TextareaWithIcon, SelectWithIcon } from '@/shared/components';
import {
  useCreateEquipo,
  useUpdateEquipo,
  useNextCodigoEquipo,
  useTiposEquipo,
  useMarcas,
  useModelos,
  useCreateTipoEquipo,
  useCreateMarca,
  useCreateModelo,
} from '../hooks/useEquipos';
import type { Equipo, EstadoEquipo } from '../types';

const equipoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50),
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  descripcion: z.string().max(500).optional(),
  tipo_equipo_id: z.string().optional(),
  marca_id: z.string().optional(),
  modelo_id: z.string().optional(),
  numero_serie: z.string().max(100).optional(),
  numero_interno: z.string().max(50).optional(),
  anio_fabricacion: z.coerce.number().min(1900).max(2100).optional().or(z.literal('')),
  fecha_adquisicion: z.date().optional(),
  valor_adquisicion: z.coerce.number().min(0).optional().or(z.literal('')),
  estado: z.enum(['activo', 'inactivo', 'mantenimiento', 'baja']),
  ubicacion: z.string().max(200).optional(),
  observaciones: z.string().max(1000).optional(),
});

type EquipoFormValues = z.infer<typeof equipoSchema>;

interface EquipoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipo?: Equipo | null;
}

const estadoOptions: { value: EstadoEquipo; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'mantenimiento', label: 'En Mantenimiento' },
  { value: 'baja', label: 'Baja' },
];

export function EquipoModal({ open, onOpenChange, equipo }: EquipoModalProps) {
  const { user } = useAuth();
  const empresaId = user?.empresa_id;
  
  const { data: nextCodigo } = useNextCodigoEquipo();
  const { data: tiposEquipo = [] } = useTiposEquipo();
  const { data: marcas = [] } = useMarcas();
  
  const [selectedMarcaId, setSelectedMarcaId] = useState<string | undefined>(equipo?.marca_id);
  const { data: modelos = [] } = useModelos(selectedMarcaId);

  const createEquipo = useCreateEquipo();
  const updateEquipo = useUpdateEquipo();
  const createTipoEquipo = useCreateTipoEquipo();
  const createMarca = useCreateMarca();
  const createModelo = useCreateModelo();

  const [newTipoNombre, setNewTipoNombre] = useState('');
  const [newMarcaNombre, setNewMarcaNombre] = useState('');
  const [newModeloNombre, setNewModeloNombre] = useState('');

  const form = useForm<EquipoFormValues>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo_equipo_id: '',
      marca_id: '',
      modelo_id: '',
      numero_serie: '',
      numero_interno: '',
      anio_fabricacion: '',
      fecha_adquisicion: undefined,
      valor_adquisicion: '',
      estado: 'activo',
      ubicacion: '',
      observaciones: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (equipo) {
        form.reset({
          codigo: equipo.codigo,
          nombre: equipo.nombre,
          descripcion: equipo.descripcion || '',
          tipo_equipo_id: equipo.tipo_equipo_id || '',
          marca_id: equipo.marca_id || '',
          modelo_id: equipo.modelo_id || '',
          numero_serie: equipo.numero_serie || '',
          numero_interno: equipo.numero_interno || '',
          anio_fabricacion: equipo.anio_fabricacion || '',
          fecha_adquisicion: equipo.fecha_adquisicion ? new Date(equipo.fecha_adquisicion) : undefined,
          valor_adquisicion: equipo.valor_adquisicion || '',
          estado: equipo.estado,
          ubicacion: equipo.ubicacion || '',
          observaciones: equipo.observaciones || '',
        });
        setSelectedMarcaId(equipo.marca_id);
      } else {
        form.reset({
          codigo: nextCodigo || '',
          nombre: '',
          descripcion: '',
          tipo_equipo_id: '',
          marca_id: '',
          modelo_id: '',
          numero_serie: '',
          numero_interno: '',
          anio_fabricacion: '',
          fecha_adquisicion: undefined,
          valor_adquisicion: '',
          estado: 'activo',
          ubicacion: '',
          observaciones: '',
        });
        setSelectedMarcaId(undefined);
      }
    }
  }, [open, equipo, nextCodigo, form]);

  const onSubmit = async (values: EquipoFormValues) => {
    if (!empresaId) return;

    const formData = {
      codigo: values.codigo,
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      tipo_equipo_id: values.tipo_equipo_id || undefined,
      marca_id: values.marca_id || undefined,
      modelo_id: values.modelo_id || undefined,
      numero_serie: values.numero_serie || undefined,
      numero_interno: values.numero_interno || undefined,
      anio_fabricacion: values.anio_fabricacion ? Number(values.anio_fabricacion) : undefined,
      fecha_adquisicion: values.fecha_adquisicion
        ? format(values.fecha_adquisicion, 'yyyy-MM-dd')
        : undefined,
      valor_adquisicion: values.valor_adquisicion ? Number(values.valor_adquisicion) : undefined,
      estado: values.estado,
      ubicacion: values.ubicacion || undefined,
      observaciones: values.observaciones || undefined,
    };

    try {
      if (equipo) {
        await updateEquipo.mutateAsync({ id: equipo.id, formData });
      } else {
        await createEquipo.mutateAsync({ empresaId, formData });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddTipo = async () => {
    if (!empresaId || !newTipoNombre.trim()) return;
    await createTipoEquipo.mutateAsync({
      empresaId,
      formData: { nombre: newTipoNombre.trim() },
    });
    setNewTipoNombre('');
  };

  const handleAddMarca = async () => {
    if (!empresaId || !newMarcaNombre.trim()) return;
    await createMarca.mutateAsync({
      empresaId,
      formData: { nombre: newMarcaNombre.trim() },
    });
    setNewMarcaNombre('');
  };

  const handleAddModelo = async () => {
    if (!empresaId || !selectedMarcaId || !newModeloNombre.trim()) return;
    await createModelo.mutateAsync({
      empresaId,
      formData: { marca_id: selectedMarcaId, nombre: newModeloNombre.trim() },
    });
    setNewModeloNombre('');
  };

  const handleMarcaChange = (value: string) => {
    form.setValue('marca_id', value);
    form.setValue('modelo_id', '');
    setSelectedMarcaId(value);
  };

  const isLoading = createEquipo.isPending || updateEquipo.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <ModalTitle icon={Truck}>
            {equipo ? 'Editar Equipo' : 'Nuevo Equipo'}
          </ModalTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <InputWithIcon icon={Hash} {...field} placeholder="EQ-0001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <FormControl>
                      <SelectWithIcon
                        icon={CheckCircle}
                        placeholder="Seleccionar estado"
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        {estadoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectWithIcon>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <InputWithIcon icon={Type} {...field} placeholder="Nombre del equipo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <TextareaWithIcon icon={AlignLeft} {...field} placeholder="Descripción del equipo" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_equipo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Equipo</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposEquipo.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Nuevo tipo</p>
                            <Input
                              value={newTipoNombre}
                              onChange={(e) => setNewTipoNombre(e.target.value)}
                              placeholder="Nombre del tipo"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleAddTipo}
                              disabled={!newTipoNombre.trim()}
                            >
                              Agregar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marca_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={handleMarcaChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccionar marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {marcas.map((marca) => (
                            <SelectItem key={marca.id} value={marca.id}>
                              {marca.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Nueva marca</p>
                            <Input
                              value={newMarcaNombre}
                              onChange={(e) => setNewMarcaNombre(e.target.value)}
                              placeholder="Nombre de la marca"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleAddMarca}
                              disabled={!newMarcaNombre.trim()}
                            >
                              Agregar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modelo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedMarcaId}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={selectedMarcaId ? "Seleccionar modelo" : "Primero seleccione marca"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modelos.map((modelo) => (
                            <SelectItem key={modelo.id} value={modelo.id}>
                              {modelo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={!selectedMarcaId}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Nuevo modelo</p>
                            <Input
                              value={newModeloNombre}
                              onChange={(e) => setNewModeloNombre(e.target.value)}
                              placeholder="Nombre del modelo"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleAddModelo}
                              disabled={!newModeloNombre.trim()}
                            >
                              Agregar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_serie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Serie</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="S/N" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="numero_interno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número Interno</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nro. interno" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anio_fabricacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año Fabricación</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="2024"
                        min={1900}
                        max={2100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_adquisicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Adquisición</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: es })
                            ) : (
                              <span>Seleccionar</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor_adquisicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Adquisición</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ubicación del equipo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Observaciones adicionales" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : equipo ? 'Guardar Cambios' : 'Crear Equipo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
