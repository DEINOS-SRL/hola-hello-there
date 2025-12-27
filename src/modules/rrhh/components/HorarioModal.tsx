import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Loader2, Type, AlignLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { rrhhClient } from '../services/rrhhClient';
import { useAuth } from '@/contexts/AuthContext';
import { ModalTitle, InputWithIcon, TextareaWithIcon } from '@/shared/components';

interface HorarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export function HorarioModal({ open, onOpenChange }: HorarioModalProps) {
  const { toast } = useToast();
  const { empresa } = useAuth();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('08:00');
  const [horaSalida, setHoraSalida] = useState('17:00');
  const [tolerancia, setTolerancia] = useState(15);
  const [diasLaborables, setDiasLaborables] = useState<string[]>([
    'lunes', 'martes', 'miercoles', 'jueves', 'viernes'
  ]);

  const toggleDia = (dia: string) => {
    setDiasLaborables(prev =>
      prev.includes(dia)
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    );
  };

  const crearHorarioMutation = useMutation({
    mutationFn: async () => {
      if (!empresa?.id) throw new Error('No hay empresa seleccionada');

      const { data, error } = await rrhhClient
        .from('horarios')
        .insert({
          empresa_id: empresa.id,
          nombre,
          descripcion: descripcion || null,
          hora_entrada: horaEntrada,
          hora_salida: horaSalida,
          tolerancia_minutos: tolerancia,
          dias_laborables: diasLaborables,
          activo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Horario creado',
        description: 'El horario de trabajo se creó correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creando horario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el horario.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setHoraEntrada('08:00');
    setHoraSalida('17:00');
    setTolerancia(15);
    setDiasLaborables(['lunes', 'martes', 'miercoles', 'jueves', 'viernes']);
  };

  const handleSubmit = () => {
    if (!nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del horario es requerido.',
        variant: 'destructive',
      });
      return;
    }

    if (diasLaborables.length === 0) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar al menos un día laborable.',
        variant: 'destructive',
      });
      return;
    }

    crearHorarioMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <ModalTitle icon={Clock}>
            Nuevo Horario de Trabajo
          </ModalTitle>
          <DialogDescription>
            Configure un nuevo horario laboral para asignar a empleados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Horario *</Label>
            <InputWithIcon
              icon={Type}
              id="nombre"
              placeholder="Ej: Horario Oficina, Turno Mañana..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <TextareaWithIcon
              icon={AlignLeft}
              id="descripcion"
              placeholder="Descripción del horario..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
            />
          </div>

          {/* Horarios de entrada y salida */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora-entrada">Hora de Entrada</Label>
              <Input
                id="hora-entrada"
                type="time"
                value={horaEntrada}
                onChange={(e) => setHoraEntrada(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora-salida">Hora de Salida</Label>
              <Input
                id="hora-salida"
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
              />
            </div>
          </div>

          {/* Tolerancia */}
          <div className="space-y-2">
            <Label htmlFor="tolerancia">Tolerancia (minutos)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="tolerancia"
                type="number"
                min={0}
                max={60}
                value={tolerancia}
                onChange={(e) => setTolerancia(parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                Tiempo de gracia para marcar entrada
              </span>
            </div>
          </div>

          {/* Días laborables */}
          <div className="space-y-3">
            <Label>Días Laborables *</Label>
            <div className="grid grid-cols-2 gap-2">
              {diasSemana.map((dia) => (
                <div key={dia.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={dia.value}
                    checked={diasLaborables.includes(dia.value)}
                    onCheckedChange={() => toggleDia(dia.value)}
                  />
                  <label
                    htmlFor={dia.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {dia.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">Resumen del horario:</p>
            <p className="text-sm text-muted-foreground">
              {horaEntrada} - {horaSalida} ({diasLaborables.length} días/semana)
            </p>
            <p className="text-sm text-muted-foreground">
              Tolerancia de {tolerancia} minutos
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={crearHorarioMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={crearHorarioMutation.isPending}
          >
            {crearHorarioMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Crear Horario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
