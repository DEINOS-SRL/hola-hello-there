import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Clock, FileImage, Gauge, ClipboardList } from 'lucide-react';
import { movimientosService } from '../../services/movimientosService';
import type { WizardMovimientoData } from '../../types';
import { useQuery } from '@tanstack/react-query';

interface Step4Props {
  data: WizardMovimientoData;
  updateData: (updates: Partial<WizardMovimientoData>) => void;
  movimientoId: string | null;
}

interface TareaRow {
  descripcion: string;
  hora_inicio: string;
  hora_fin: string;
}

export function Step4Ejecucion({ data, updateData, movimientoId }: Step4Props) {
  const [tareas, setTareas] = useState<TareaRow[]>(data.tareas.length > 0 ? data.tareas : [
    { descripcion: '', hora_inicio: '', hora_fin: '' }
  ]);

  // Load existing data
  const { data: tareasGuardadas } = useQuery({
    queryKey: ['movimiento-tareas', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoTareas(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  const { data: equiposAsignados } = useQuery({
    queryKey: ['movimiento-equipos', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoEquipos(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  useEffect(() => {
    if (tareasGuardadas && tareasGuardadas.length > 0) {
      const mapped = tareasGuardadas.map(t => ({
        descripcion: t.descripcion,
        hora_inicio: t.hora_inicio ? new Date(t.hora_inicio).toTimeString().slice(0, 5) : '',
        hora_fin: t.hora_fin ? new Date(t.hora_fin).toTimeString().slice(0, 5) : '',
      }));
      setTareas(mapped);
      updateData({ tareas: mapped });
    }
  }, [tareasGuardadas]);

  useEffect(() => {
    if (equiposAsignados && equiposAsignados.length > 0) {
      const kms = equiposAsignados.map(e => ({
        equipo_id: e.equipo_id,
        kilometraje_inicio: e.kilometraje_inicio || 0,
        kilometraje_fin: e.kilometraje_fin || 0,
      }));
      updateData({ kilometrajes: kms });
    }
  }, [equiposAsignados]);

  const handleTareaChange = (index: number, field: keyof TareaRow, value: string) => {
    const newTareas = [...tareas];
    newTareas[index] = { ...newTareas[index], [field]: value };
    setTareas(newTareas);
    updateData({ tareas: newTareas });
  };

  const addTarea = () => {
    const newTareas = [...tareas, { descripcion: '', hora_inicio: '', hora_fin: '' }];
    setTareas(newTareas);
    updateData({ tareas: newTareas });
  };

  const removeTarea = (index: number) => {
    const newTareas = tareas.filter((_, i) => i !== index);
    setTareas(newTareas);
    updateData({ tareas: newTareas });
  };

  const handleKilometrajeChange = (equipoId: string, field: 'kilometraje_inicio' | 'kilometraje_fin', value: number) => {
    const current = data.kilometrajes || [];
    const exists = current.find(k => k.equipo_id === equipoId);
    if (exists) {
      updateData({
        kilometrajes: current.map(k => 
          k.equipo_id === equipoId ? { ...k, [field]: value } : k
        )
      });
    } else {
      updateData({
        kilometrajes: [...current, { 
          equipo_id: equipoId, 
          kilometraje_inicio: field === 'kilometraje_inicio' ? value : 0,
          kilometraje_fin: field === 'kilometraje_fin' ? value : 0 
        }]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tareas - Edición inline tipo Excel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              Registro de Tareas
            </span>
            <Button variant="outline" size="sm" onClick={addTarea}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tarea
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Descripción de la Tarea</TableHead>
                  <TableHead>Hora Inicio</TableHead>
                  <TableHead>Hora Fin</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tareas.map((tarea, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={tarea.descripcion}
                        onChange={(e) => handleTareaChange(index, 'descripcion', e.target.value)}
                        placeholder="Descripción de la tarea..."
                        className="border-0 focus-visible:ring-0 p-0 h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={tarea.hora_inicio}
                        onChange={(e) => handleTareaChange(index, 'hora_inicio', e.target.value)}
                        className="border-0 focus-visible:ring-0 p-0 h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={tarea.hora_fin}
                        onChange={(e) => handleTareaChange(index, 'hora_fin', e.target.value)}
                        className="border-0 focus-visible:ring-0 p-0 h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTarea(index)}
                        disabled={tareas.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Kilometraje de equipos */}
      {equiposAsignados && equiposAsignados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4 text-primary" />
              Kilometraje de Equipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equiposAsignados.map((eq) => {
                const km = data.kilometrajes.find(k => k.equipo_id === eq.equipo_id);
                return (
                  <div key={eq.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{eq.equipo?.codigo || 'Equipo'}</p>
                      <p className="text-sm text-muted-foreground">{eq.equipo?.descripcion}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Km Inicio</Label>
                        <Input
                          type="number"
                          value={km?.kilometraje_inicio || ''}
                          onChange={(e) => handleKilometrajeChange(eq.equipo_id, 'kilometraje_inicio', parseInt(e.target.value) || 0)}
                          className="w-28"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Km Fin</Label>
                        <Input
                          type="number"
                          value={km?.kilometraje_fin || ''}
                          onChange={(e) => handleKilometrajeChange(eq.equipo_id, 'kilometraje_fin', parseInt(e.target.value) || 0)}
                          className="w-28"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileImage className="h-4 w-4 text-primary" />
            Imagen del Remito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL de la imagen del remito</Label>
              <Input
                value={data.remito_url}
                onChange={(e) => updateData({ remito_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            {data.remito_url && (
              <div className="mt-4">
                <img 
                  src={data.remito_url} 
                  alt="Remito" 
                  className="max-w-xs rounded-lg border"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      <div className="space-y-2">
        <Label>Observaciones del Operario</Label>
        <Textarea
          value={data.observaciones_operario}
          onChange={(e) => updateData({ observaciones_operario: e.target.value })}
          placeholder="Notas adicionales sobre la operación..."
          rows={4}
        />
      </div>
    </div>
  );
}
