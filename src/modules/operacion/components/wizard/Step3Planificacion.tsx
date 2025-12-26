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
  const { equiposEqu, empleados, operarios } = useWizardData();
  
  // Supervisores del sistema (empleados con cargo supervisor o similar)
  const supervisores = empleados.filter((e: any) => 
    e.cargo?.toLowerCase().includes('supervisor') || 
    e.cargo?.toLowerCase().includes('jefe') ||
    e.cargo?.toLowerCase().includes('encargado')
  );

  // Load existing assignments if editing
  const { data: empleadosAsignados } = useQuery({
    queryKey: ['movimiento-empleados', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoEmpleados(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  const { data: equiposAsignados } = useQuery({
    queryKey: ['movimiento-equipos-equ', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoEquiposEqu(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  useEffect(() => {
    if (empleadosAsignados && empleadosAsignados.length > 0) {
      updateData({ 
        empleados_asignados: empleadosAsignados.map(e => ({
          empleado_id: e.empleado_id,
          rol_asignado: e.rol_asignado
        }))
      });
    }
    if (equiposAsignados && equiposAsignados.length > 0) {
      updateData({ equipos_asignados_equ: equiposAsignados.map(e => e.equipo_id) });
    }
  }, [empleadosAsignados, equiposAsignados]);

  const toggleEquipo = (equipoId: string) => {
    const current = data.equipos_asignados_equ || [];
    if (current.includes(equipoId)) {
      updateData({ equipos_asignados_equ: current.filter(id => id !== equipoId) });
    } else {
      updateData({ equipos_asignados_equ: [...current, equipoId] });
    }
  };

  const toggleEmpleado = (empleadoId: string) => {
    const current = data.empleados_asignados || [];
    const exists = current.find(e => e.empleado_id === empleadoId);
    if (exists) {
      updateData({ empleados_asignados: current.filter(e => e.empleado_id !== empleadoId) });
    } else {
      updateData({ 
        empleados_asignados: [...current, { empleado_id: empleadoId, rol_asignado: 'operario' }]
      });
    }
  };

  const updateEmpleadoRol = (empleadoId: string, rol: string) => {
    const current = data.empleados_asignados || [];
    updateData({
      empleados_asignados: current.map(e => 
        e.empleado_id === empleadoId ? { ...e, rol_asignado: rol } : e
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
                  {supervisores.length > 0 ? (
                    supervisores.map((sup: any) => (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.apellido}, {sup.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback: mostrar todos los empleados si no hay supervisores definidos
                    empleados.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.apellido}, {emp.nombre}
                      </SelectItem>
                    ))
                  )}
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
            {data.equipos_asignados_equ.length > 0 && (
              <Badge variant="secondary">{data.equipos_asignados_equ.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {equiposEqu.map((equipo: any) => (
              <div
                key={equipo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.equipos_asignados_equ.includes(equipo.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleEquipo(equipo.id)}
              >
                <Checkbox
                  checked={data.equipos_asignados_equ.includes(equipo.id)}
                  onCheckedChange={() => toggleEquipo(equipo.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{equipo.codigo}</p>
                  <p className="text-sm text-muted-foreground truncate">{equipo.nombre}</p>
                  {equipo.numero_interno && (
                    <p className="text-xs text-muted-foreground">Int: {equipo.numero_interno}</p>
                  )}
                </div>
              </div>
            ))}
            {equiposEqu.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">
                No hay equipos disponibles. Cargue equipos en el módulo de Equipos.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empleados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Personal Asignado
            {data.empleados_asignados.length > 0 && (
              <Badge variant="secondary">{data.empleados_asignados.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {empleados.map((empleado: any) => {
              const isSelected = data.empleados_asignados.some(e => e.empleado_id === empleado.id);
              const asignado = data.empleados_asignados.find(e => e.empleado_id === empleado.id);
              
              return (
                <div
                  key={empleado.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleEmpleado(empleado.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{empleado.apellido}, {empleado.nombre}</p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      {empleado.legajo && <span>Legajo: {empleado.legajo}</span>}
                      {empleado.cargo && <span>• {empleado.cargo}</span>}
                    </div>
                  </div>
                  {isSelected && (
                    <Select
                      value={asignado?.rol_asignado || 'operario'}
                      onValueChange={(v) => updateEmpleadoRol(empleado.id, v)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operario">Operario</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="conductor">Conductor</SelectItem>
                        <SelectItem value="ayudante">Ayudante</SelectItem>
                        <SelectItem value="apoyo">Apoyo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
            {empleados.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">
                No hay empleados disponibles. Cargue empleados en el módulo de RRHH.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
