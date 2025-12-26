import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Building2, FileText, MapPin, User, Target } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useWizardData } from '../../hooks/useMovimientos';
import type { WizardMovimientoData } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { comClient } from '@/modules/comercial/services/comClient';

interface Step1Props {
  data: WizardMovimientoData;
  updateData: (updates: Partial<WizardMovimientoData>) => void;
}

interface PresupuestoOption {
  id: string;
  numero: number;
  cliente_nombre: string;
  asunto: string;
}

export function Step1DatosGenerales({ data, updateData }: Step1Props) {
  const { clientes } = useWizardData();
  
  // Fetch presupuestos from comercial module using comClient
  const { data: presupuestos = [] } = useQuery<PresupuestoOption[]>({
    queryKey: ['presupuestos-select'],
    queryFn: async () => {
      const { data, error } = await comClient
        .from('presupuestos')
        .select('id, numero, cliente_nombre, asunto')
        .eq('estado', 'aprobado')
        .order('numero', { ascending: false });
      if (error) throw error;
      return (data || []) as PresupuestoOption[];
    },
  });

  const selectedDate = data.fecha_movimiento ? new Date(data.fecha_movimiento) : undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha del movimiento */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Fecha del Movimiento *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => updateData({ fecha_movimiento: date?.toISOString().split('T')[0] || '' })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Cliente */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Cliente
          </Label>
          <Select value={data.cliente_id} onValueChange={(v) => updateData({ cliente_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Presupuesto */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Presupuesto Asociado
          </Label>
          <Select value={data.presupuesto_id} onValueChange={(v) => updateData({ presupuesto_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar presupuesto" />
            </SelectTrigger>
            <SelectContent>
              {presupuestos.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  #{p.numero} - {p.cliente_nombre} - {p.asunto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Solicitante */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Quien Solicita
          </Label>
          <Input
            value={data.solicitante}
            onChange={(e) => updateData({ solicitante: e.target.value })}
            placeholder="Nombre del solicitante"
          />
        </div>
      </div>

      {/* Asunto */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Asunto del Movimiento *
        </Label>
        <Input
          value={data.asunto}
          onChange={(e) => updateData({ asunto: e.target.value })}
          placeholder="Descripción breve del movimiento"
          required
        />
      </div>

      {/* Ubicación */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Ubicación
        </Label>
        <Input
          value={data.ubicacion}
          onChange={(e) => updateData({ ubicacion: e.target.value })}
          placeholder="Dirección o ubicación del servicio"
        />
      </div>

      {/* Alcance */}
      <div className="space-y-2">
        <Label>Alcance del Movimiento</Label>
        <Textarea
          value={data.alcance}
          onChange={(e) => updateData({ alcance: e.target.value })}
          placeholder="Describe el alcance y objetivos del movimiento..."
          rows={4}
        />
      </div>
    </div>
  );
}
