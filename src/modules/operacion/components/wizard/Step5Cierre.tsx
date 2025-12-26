import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, User, FileText, Clock } from 'lucide-react';
import { movimientosService } from '../../services/movimientosService';
import type { WizardMovimientoData, MovimientoOperario, MovimientoTarea } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Step5Props {
  data: WizardMovimientoData;
  updateData: (updates: Partial<WizardMovimientoData>) => void;
  movimientoId: string | null;
}

export function Step5Cierre({ data, updateData, movimientoId }: Step5Props) {
  const [calificaciones, setCalificaciones] = useState<{ operario_id: string; calificacion: number; comentario: string }[]>([]);

  const { data: operariosAsignados = [] } = useQuery({
    queryKey: ['movimiento-operarios', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoOperarios(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  const { data: tareasGuardadas = [] } = useQuery({
    queryKey: ['movimiento-tareas', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoTareas(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  const { data: calificacionesGuardadas = [] } = useQuery({
    queryKey: ['movimiento-calificaciones', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getCalificaciones(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  useEffect(() => {
    if (calificacionesGuardadas.length > 0) {
      setCalificaciones(calificacionesGuardadas.map(c => ({
        operario_id: c.operario_id,
        calificacion: c.calificacion,
        comentario: c.comentario || '',
      })));
    } else if (operariosAsignados.length > 0 && calificaciones.length === 0) {
      // Initialize calificaciones for all operarios
      setCalificaciones(operariosAsignados.map(o => ({
        operario_id: o.operario_id,
        calificacion: 0,
        comentario: '',
      })));
    }
  }, [calificacionesGuardadas, operariosAsignados]);

  useEffect(() => {
    updateData({ calificaciones });
  }, [calificaciones]);

  const handleCalificacionChange = (operarioId: string, rating: number) => {
    setCalificaciones(prev => 
      prev.map(c => c.operario_id === operarioId ? { ...c, calificacion: rating } : c)
    );
  };

  const handleComentarioChange = (operarioId: string, comentario: string) => {
    setCalificaciones(prev => 
      prev.map(c => c.operario_id === operarioId ? { ...c, comentario } : c)
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumen de la operación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Resumen de la Operación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{tareasGuardadas.length}</p>
              <p className="text-sm text-muted-foreground">Tareas Registradas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{tareasGuardadas.filter(t => t.completada).length}</p>
              <p className="text-sm text-muted-foreground">Completadas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{operariosAsignados.length}</p>
              <p className="text-sm text-muted-foreground">Operarios</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{data.equipos_asignados?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Equipos</p>
            </div>
          </div>

          {/* Lista de tareas */}
          {tareasGuardadas.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Detalle de Tareas
              </h4>
              <div className="space-y-2">
                {tareasGuardadas.map((tarea, idx) => (
                  <div key={tarea.id || idx} className="flex items-center gap-3 p-2 rounded border">
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      tarea.completada ? "text-green-500" : "text-muted-foreground"
                    )} />
                    <span className="flex-1">{tarea.descripcion}</span>
                    {tarea.hora_inicio && tarea.hora_fin && (
                      <Badge variant="outline">
                        {new Date(tarea.hora_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(tarea.hora_fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calificación de operarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-primary" />
            Calificación de Operarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {operariosAsignados.map((op) => {
              const calif = calificaciones.find(c => c.operario_id === op.operario_id);
              return (
                <div key={op.id} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {op.operario?.apellido}, {op.operario?.nombre}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {op.rol_asignado}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Star rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <Label className="text-sm text-muted-foreground">Calificación:</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleCalificacionChange(op.operario_id, star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6 transition-colors",
                              (calif?.calificacion || 0) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground hover:text-yellow-400"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    {calif?.calificacion ? (
                      <span className="text-sm font-medium ml-2">{calif.calificacion}/5</span>
                    ) : null}
                  </div>

                  {/* Comentario */}
                  <Textarea
                    value={calif?.comentario || ''}
                    onChange={(e) => handleComentarioChange(op.operario_id, e.target.value)}
                    placeholder="Comentarios sobre el desempeño..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
              );
            })}

            {operariosAsignados.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay operarios asignados para calificar
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observaciones del supervisor */}
      <div className="space-y-2">
        <Label>Observaciones del Supervisor</Label>
        <Textarea
          value={data.observaciones_supervisor}
          onChange={(e) => updateData({ observaciones_supervisor: e.target.value })}
          placeholder="Notas finales y observaciones del cierre operativo..."
          rows={4}
        />
      </div>
    </div>
  );
}
