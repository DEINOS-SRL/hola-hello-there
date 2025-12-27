import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, User, Calendar, Loader2 } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { rrhhClient } from '../services/rrhhClient';
import { useAuth } from '@/contexts/AuthContext';
import type { Horario } from '../types/asistencia';
import { ModalTitle, SelectWithIcon } from '@/shared/components';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  numero_legajo: string;
}

interface AsignarHorarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AsignarHorarioModal({ open, onOpenChange }: AsignarHorarioModalProps) {
  const { toast } = useToast();
  const { empresa } = useAuth();
  const queryClient = useQueryClient();

  const [empleadoId, setEmpleadoId] = useState('');
  const [horarioId, setHorarioId] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);

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

  // Fetch horarios
  const { data: horarios = [], isLoading: loadingHorarios } = useQuery({
    queryKey: ['horarios'],
    queryFn: async () => {
      const { data, error } = await rrhhClient
        .from('horarios')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (error) {
        console.error('Error fetching horarios:', error);
        return [];
      }
      return data as Horario[];
    },
    enabled: open,
  });

  const asignarHorarioMutation = useMutation({
    mutationFn: async () => {
      if (!empresa?.id) throw new Error('No hay empresa seleccionada');

      // Desactivar asignaciones anteriores del empleado
      await rrhhClient
        .from('empleado_horarios')
        .update({ activo: false })
        .eq('empleado_id', empleadoId)
        .eq('activo', true);

      // Crear nueva asignación
      const { data, error } = await rrhhClient
        .from('empleado_horarios')
        .insert({
          empresa_id: empresa.id,
          empleado_id: empleadoId,
          horario_id: horarioId,
          fecha_inicio: format(fechaInicio, 'yyyy-MM-dd'),
          fecha_fin: fechaFin ? format(fechaFin, 'yyyy-MM-dd') : null,
          activo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Horario asignado',
        description: 'El horario se asignó correctamente al empleado.',
      });
      queryClient.invalidateQueries({ queryKey: ['empleado-horarios'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error asignando horario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar el horario.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setEmpleadoId('');
    setHorarioId('');
    setFechaInicio(new Date());
    setFechaFin(undefined);
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

    if (!horarioId) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un horario.',
        variant: 'destructive',
      });
      return;
    }

    asignarHorarioMutation.mutate();
  };

  const selectedHorario = horarios.find(h => h.id === horarioId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <ModalTitle icon={Clock}>Asignar Horario a Empleado</ModalTitle>
          <DialogDescription>
            Seleccione un empleado y asígnele un horario de trabajo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seleccionar empleado */}
          <div className="space-y-2">
            <Label>Empleado *</Label>
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

          {/* Seleccionar horario */}
          <div className="space-y-2">
            <Label>Horario *</Label>
            <SelectWithIcon icon={Clock} value={horarioId} onValueChange={setHorarioId}>
              <SelectValue placeholder="Seleccionar horario..." />
              <SelectContent>
                {loadingHorarios ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : horarios.length === 0 ? (
                  <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                    No hay horarios configurados
                  </div>
                ) : (
                  horarios.map((horario) => (
                    <SelectItem key={horario.id} value={horario.id}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{horario.nombre}</span>
                        <span className="text-muted-foreground">
                          ({horario.hora_entrada} - {horario.hora_salida})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </SelectWithIcon>
          </div>

          {/* Detalle del horario seleccionado */}
          {selectedHorario && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium">{selectedHorario.nombre}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{selectedHorario.hora_entrada} - {selectedHorario.hora_salida}</span>
                <span>• Tolerancia: {selectedHorario.tolerancia_minutos} min</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedHorario.dias_laborables.map((dia) => (
                  <Badge key={dia} variant="outline" className="text-xs capitalize">
                    {dia}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Fecha de inicio */}
          <div className="space-y-2">
            <Label>Fecha de Inicio *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaInicio && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={fechaInicio}
                  onSelect={(date) => date && setFechaInicio(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de fin (opcional) */}
          <div className="space-y-2">
            <Label>Fecha de Fin (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaFin && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Sin fecha de fin (indefinido)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={fechaFin}
                  onSelect={setFechaFin}
                  disabled={(date) => date < fechaInicio}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {fechaFin && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setFechaFin(undefined)}
              >
                Quitar fecha de fin
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={asignarHorarioMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={asignarHorarioMutation.isPending}
          >
            {asignarHorarioMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Asignar Horario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
