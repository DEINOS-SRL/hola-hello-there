import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserCog, Truck, Users } from 'lucide-react';
import { useWizardData } from '../../hooks/useMovimientos';
import { movimientosService } from '../../services/movimientosService';
import type { WizardMovimientoData } from '../../types';
import { useQuery } from '@tanstack/react-query';

interface Step3Props {
  data: WizardMovimientoData;
  updateData: (updates: Partial<WizardMovimientoData>) => void;
  movimientoId: string | null;
}

export function Step3Planificacion({ data, updateData, movimientoId }: Step3Props) {
  const { equipos, operarios } = useWizardData();
  
  // Get supervisors
  const supervisores = operarios.filter(o => o.rol === 'supervisor');
  const operariosDisponibles = operarios.filter(o => o.rol !== 'supervisor');

  // Load existing assignments if editing
  const { data: equiposAsignados } = useQuery({
    queryKey: ['movimiento-equipos', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoEquipos(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  const { data: operariosAsignados } = useQuery({
    queryKey: ['movimiento-operarios', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoOperarios(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  useEffect(() => {
    if (equiposAsignados && equiposAsignados.length > 0) {
      updateData({ equipos_asignados: equiposAsignados.map(e => e.equipo_id) });
    }
    if (operariosAsignados && operariosAsignados.length > 0) {
      updateData({ 
        operarios_asignados: operariosAsignados.map(o => ({
          operario_id: o.operario_id,
          rol_asignado: o.rol_asignado
        }))
      });
    }
  }, [equiposAsignados, operariosAsignados]);

  const toggleEquipo = (equipoId: string) => {
    const current = data.equipos_asignados || [];
    if (current.includes(equipoId)) {
      updateData({ equipos_asignados: current.filter(id => id !== equipoId) });
    } else {
      updateData({ equipos_asignados: [...current, equipoId] });
    }
  };

  const toggleOperario = (operarioId: string) => {
    const current = data.operarios_asignados || [];
    const exists = current.find(o => o.operario_id === operarioId);
    if (exists) {
      updateData({ operarios_asignados: current.filter(o => o.operario_id !== operarioId) });
    } else {
      updateData({ 
        operarios_asignados: [...current, { operario_id: operarioId, rol_asignado: 'operario' }]
      });
    }
  };

  const updateOperarioRol = (operarioId: string, rol: string) => {
    const current = data.operarios_asignados || [];
    updateData({
      operarios_asignados: current.map(o => 
        o.operario_id === operarioId ? { ...o, rol_asignado: rol } : o
      )
    });
  };

  return (
    <div className="space-y-6">
      {/* Horario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Horario del Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Hora de Inicio</Label>
              <Input
                type="time"
                value={data.hora_inicio_programada}
                onChange={(e) => updateData({ hora_inicio_programada: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora de Fin</Label>
              <Input
                type="time"
                value={data.hora_fin_programada}
                onChange={(e) => updateData({ hora_fin_programada: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-primary" />
                Supervisor a Cargo
              </Label>
              <Select value={data.supervisor_id} onValueChange={(v) => updateData({ supervisor_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisores.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.apellido}, {sup.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-primary" />
            Equipos Asignados
            {data.equipos_asignados.length > 0 && (
              <Badge variant="secondary">{data.equipos_asignados.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.equipos_asignados.includes(equipo.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleEquipo(equipo.id)}
              >
                <Checkbox
                  checked={data.equipos_asignados.includes(equipo.id)}
                  onCheckedChange={() => toggleEquipo(equipo.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{equipo.codigo}</p>
                  <p className="text-sm text-muted-foreground truncate">{equipo.descripcion}</p>
                  {equipo.patente && (
                    <p className="text-xs text-muted-foreground">{equipo.patente}</p>
                  )}
                </div>
              </div>
            ))}
            {equipos.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">
                No hay equipos disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Operarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Operarios Asignados
            {data.operarios_asignados.length > 0 && (
              <Badge variant="secondary">{data.operarios_asignados.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {operariosDisponibles.map((operario) => {
              const isSelected = data.operarios_asignados.some(o => o.operario_id === operario.id);
              const asignado = data.operarios_asignados.find(o => o.operario_id === operario.id);
              
              return (
                <div
                  key={operario.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleOperario(operario.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{operario.apellido}, {operario.nombre}</p>
                    {operario.legajo && (
                      <p className="text-sm text-muted-foreground">Legajo: {operario.legajo}</p>
                    )}
                  </div>
                  {isSelected && (
                    <Select
                      value={asignado?.rol_asignado || 'operario'}
                      onValueChange={(v) => updateOperarioRol(operario.id, v)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operario">Operario</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="apoyo">Apoyo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
            {operariosDisponibles.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">
                No hay operarios disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
