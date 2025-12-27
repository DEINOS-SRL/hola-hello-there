import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, LogIn, LogOut, User, Loader2, Tag, AlignLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { rrhhClient } from '../services/rrhhClient';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoAsistencia } from '../types/asistencia';
import { ModalTitle, InputWithIcon, SelectWithIcon, TextareaWithIcon } from '@/shared/components';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  numero_legajo: string;
}

interface RegistrarAsistenciaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

const tiposAsistencia: { value: TipoAsistencia; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'tardanza', label: 'Tardanza' },
  { value: 'falta', label: 'Falta' },
  { value: 'permiso', label: 'Permiso' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'licencia', label: 'Licencia' },
];

export function RegistrarAsistenciaModal({
  open,
  onOpenChange,
  selectedDate,
}: RegistrarAsistenciaModalProps) {
  const { toast } = useToast();
  const { empresa } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'entrada' | 'salida'>('entrada');
  const [empleadoId, setEmpleadoId] = useState('');
  const [horaEntrada, setHoraEntrada] = useState(format(new Date(), 'HH:mm'));
  const [horaSalida, setHoraSalida] = useState(format(new Date(), 'HH:mm'));
  const [tipo, setTipo] = useState<TipoAsistencia>('normal');
  const [observaciones, setObservaciones] = useState('');

  // Fetch empleados
  const { data: empleados = [], isLoading: loadingEmpleados } = useQuery({
    queryKey: ['empleados-select'],
    queryFn: async () => {
      const { data, error } = await rrhhClient
        .from('empleados')
        .select('id, nombre, apellido, numero_legajo')
        .eq('activo', true)
        .order('apellido');
      
      if (error) {
        console.error('Error fetching empleados:', error);
        return [];
      }
      return data as Empleado[];
    },
    enabled: open,
  });

  // Mutation para registrar entrada
  const registrarEntradaMutation = useMutation({
    mutationFn: async () => {
      if (!empresa?.id) throw new Error('No hay empresa seleccionada');
      
      const fechaStr = format(selectedDate, 'yyyy-MM-dd');
      const [hours, minutes] = horaEntrada.split(':');
      const horaEntradaDate = new Date(selectedDate);
      horaEntradaDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { data, error } = await rrhhClient
        .from('asistencias')
        .upsert({
          empresa_id: empresa.id,
          empleado_id: empleadoId,
          fecha: fechaStr,
          hora_entrada: horaEntradaDate.toISOString(),
          tipo,
          observaciones: observaciones || null,
        }, {
          onConflict: 'empleado_id,fecha'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Entrada registrada',
        description: 'La entrada del empleado se registró correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error registrando entrada:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar la entrada.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para registrar salida
  const registrarSalidaMutation = useMutation({
    mutationFn: async () => {
      if (!empresa?.id) throw new Error('No hay empresa seleccionada');
      
      const fechaStr = format(selectedDate, 'yyyy-MM-dd');
      const [hours, minutes] = horaSalida.split(':');
      const horaSalidaDate = new Date(selectedDate);
      horaSalidaDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Buscar registro existente
      const { data: existingRecord, error: findError } = await rrhhClient
        .from('asistencias')
        .select('id')
        .eq('empleado_id', empleadoId)
        .eq('fecha', fechaStr)
        .maybeSingle();

      if (findError) throw findError;

      if (existingRecord) {
        // Actualizar registro existente
        const { data, error } = await rrhhClient
          .from('asistencias')
          .update({
            hora_salida: horaSalidaDate.toISOString(),
            observaciones: observaciones || null,
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Crear nuevo registro solo con salida
        const { data, error } = await rrhhClient
          .from('asistencias')
          .insert({
            empresa_id: empresa.id,
            empleado_id: empleadoId,
            fecha: fechaStr,
            hora_salida: horaSalidaDate.toISOString(),
            tipo,
            observaciones: observaciones || null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Salida registrada',
        description: 'La salida del empleado se registró correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error registrando salida:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar la salida.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setEmpleadoId('');
    setHoraEntrada(format(new Date(), 'HH:mm'));
    setHoraSalida(format(new Date(), 'HH:mm'));
    setTipo('normal');
    setObservaciones('');
    setActiveTab('entrada');
  };

  const handleSubmit = () => {
    if (!empleadoId) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un empleado.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'entrada') {
      registrarEntradaMutation.mutate();
    } else {
      registrarSalidaMutation.mutate();
    }
  };

  const isLoading = registrarEntradaMutation.isPending || registrarSalidaMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <ModalTitle icon={Clock}>Registrar Asistencia</ModalTitle>
          <DialogDescription>
            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'entrada' | 'salida')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrada" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Entrada
            </TabsTrigger>
            <TabsTrigger value="salida" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Salida
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* Seleccionar empleado */}
            <div className="space-y-2">
              <Label htmlFor="empleado">Empleado</Label>
              <SelectWithIcon icon={User} value={empleadoId} onValueChange={setEmpleadoId}>
                <SelectValue placeholder="Seleccionar empleado..." />
                <SelectContent>
                  {loadingEmpleados ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : empleados.length === 0 ? (
                    <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                      No hay empleados registrados
                    </div>
                  ) : (
                    empleados.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{emp.apellido}, {emp.nombre}</span>
                          <span className="text-muted-foreground">({emp.numero_legajo})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </SelectWithIcon>
            </div>

            <TabsContent value="entrada" className="mt-0 space-y-4">
              {/* Hora de entrada */}
              <div className="space-y-2">
                <Label htmlFor="hora-entrada">Hora de Entrada</Label>
                <InputWithIcon
                  icon={Clock}
                  id="hora-entrada"
                  type="time"
                  value={horaEntrada}
                  onChange={(e) => setHoraEntrada(e.target.value)}
                />
              </div>

              {/* Tipo de asistencia */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Registro</Label>
                <SelectWithIcon icon={Tag} value={tipo} onValueChange={(v) => setTipo(v as TipoAsistencia)}>
                  <SelectValue />
                  <SelectContent>
                    {tiposAsistencia.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithIcon>
              </div>
            </TabsContent>

            <TabsContent value="salida" className="mt-0 space-y-4">
              {/* Hora de salida */}
              <div className="space-y-2">
                <Label htmlFor="hora-salida">Hora de Salida</Label>
                <InputWithIcon
                  icon={Clock}
                  id="hora-salida"
                  type="time"
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <TextareaWithIcon
                icon={AlignLeft}
                id="observaciones"
                placeholder="Agregar observaciones..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {activeTab === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
