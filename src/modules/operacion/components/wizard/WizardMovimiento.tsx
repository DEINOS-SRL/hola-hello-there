import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Step1DatosGenerales } from './Step1DatosGenerales';
import { Step2LineaServicio } from './Step2LineaServicio';
import { Step3Planificacion } from './Step3Planificacion';
import { Step4Ejecucion } from './Step4Ejecucion';
import { Step5Cierre } from './Step5Cierre';
import type { Movimiento, WizardMovimientoData, EstadoMovimiento } from '../../types';
import { movimientosService } from '../../services/movimientosService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface WizardMovimientoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimiento?: Movimiento | null;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: 'Datos Generales y Cliente', estado: 'generado' as EstadoMovimiento },
  { id: 2, title: 'Servicio', estado: 'asignacion_recursos' as EstadoMovimiento },
  { id: 3, title: 'Planificación', estado: 'planificado' as EstadoMovimiento },
  { id: 4, title: 'Ejecución', estado: 'en_ejecucion' as EstadoMovimiento },
  { id: 5, title: 'Cierre Operativo', estado: 'cierre_operativo' as EstadoMovimiento },
];

const getStepFromEstado = (estado: EstadoMovimiento): number => {
  switch (estado) {
    case 'generado': return 1;
    case 'asignacion_recursos': return 2;
    case 'planificado': return 3;
    case 'en_ejecucion': return 4;
    case 'cierre_operativo': return 5;
    case 'completado': return 5;
    default: return 1;
  }
};

const initialData: WizardMovimientoData = {
  fecha_movimiento: new Date().toISOString().split('T')[0],
  cliente_id: '',
  presupuesto_id: '',
  asunto: '',
  ubicacion: '',
  solicitante: '',
  alcance: '',
  unidad_negocio_id: '',
  tipo_movimiento_id: '',
  subtipo_movimiento_id: '',
  campos_dinamicos: {},
  hora_inicio_programada: '',
  hora_fin_programada: '',
  supervisor_id: '',
  empleados_asignados: [],
  equipos_asignados_equ: [],
  equipos_asignados: [],
  operarios_asignados: [],
  tareas: [],
  remitos_urls: [],
  observaciones_operario: '',
  kilometrajes: [],
  calificaciones: [],
  observaciones_supervisor: '',
};

export function WizardMovimiento({ open, onOpenChange, movimiento, onComplete }: WizardMovimientoProps) {
  const { empresa } = useAuth();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardMovimientoData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [movimientoId, setMovimientoId] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const initialDataRef = useRef<string>('');

  // Track if data has changed
  const hasChanges = () => {
    return JSON.stringify(data) !== initialDataRef.current;
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges()) {
      setPendingClose(true);
      setShowExitConfirm(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    setPendingClose(false);
    onOpenChange(false);
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
    setPendingClose(false);
  };

  useEffect(() => {
    if (movimiento) {
      setMovimientoId(movimiento.id);
      setCurrentStep(getStepFromEstado(movimiento.estado));
      const loadedData = {
        fecha_movimiento: movimiento.fecha_movimiento || new Date().toISOString().split('T')[0],
        cliente_id: movimiento.cliente_id || '',
        presupuesto_id: movimiento.presupuesto_id || '',
        asunto: movimiento.asunto || '',
        ubicacion: movimiento.ubicacion || '',
        solicitante: movimiento.solicitante || '',
        alcance: movimiento.alcance || '',
        unidad_negocio_id: movimiento.unidad_negocio_id || '',
        tipo_movimiento_id: movimiento.tipo_movimiento_id || '',
        subtipo_movimiento_id: movimiento.subtipo_movimiento_id || '',
        campos_dinamicos: movimiento.campos_dinamicos || {},
        hora_inicio_programada: movimiento.hora_inicio_programada || '',
        hora_fin_programada: movimiento.hora_fin_programada || '',
        supervisor_id: movimiento.supervisor_id || '',
        empleados_asignados: [],
        equipos_asignados_equ: [],
        equipos_asignados: [],
        operarios_asignados: [],
        tareas: [],
        remitos_urls: movimiento.remitos_urls || [],
        observaciones_operario: movimiento.observaciones_operario || '',
        kilometrajes: [],
        calificaciones: [],
        observaciones_supervisor: movimiento.observaciones_supervisor || '',
      };
      setData(loadedData);
      initialDataRef.current = JSON.stringify(loadedData);
    } else {
      setMovimientoId(null);
      setCurrentStep(1);
      setData(initialData);
      initialDataRef.current = JSON.stringify(initialData);
    }
  }, [movimiento, open]);

  const updateData = (updates: Partial<WizardMovimientoData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const stepConfig = STEPS[currentStep - 1];
      
      if (currentStep === 1) {
        // Validar empresa_id antes de crear
        if (!movimientoId && !empresa?.id) {
          throw new Error('No tiene una empresa asignada. Contacte al administrador.');
        }
        
        // Crear o actualizar movimiento en Step 1
        if (movimientoId) {
          await movimientosService.update(movimientoId, {
            fecha_movimiento: data.fecha_movimiento,
            cliente_id: data.cliente_id || null,
            presupuesto_id: data.presupuesto_id || null,
            asunto: data.asunto,
            ubicacion: data.ubicacion || null,
            solicitante: data.solicitante || null,
            alcance: data.alcance || null,
            estado: 'generado',
          });
        } else {
          const newMov = await movimientosService.create({
            empresa_id: empresa!.id,
            fecha_movimiento: data.fecha_movimiento,
            cliente_id: data.cliente_id || null,
            presupuesto_id: data.presupuesto_id || null,
            asunto: data.asunto,
            ubicacion: data.ubicacion || null,
            solicitante: data.solicitante || null,
            alcance: data.alcance || null,
            estado: 'generado',
          });
          setMovimientoId(newMov.id);
        }
      } else if (currentStep === 2 && movimientoId) {
        await movimientosService.update(movimientoId, {
          unidad_negocio_id: data.unidad_negocio_id || null,
          tipo_movimiento_id: data.tipo_movimiento_id || null,
          subtipo_movimiento_id: data.subtipo_movimiento_id || null,
          campos_dinamicos: data.campos_dinamicos,
          estado: 'asignacion_recursos',
        });
      } else if (currentStep === 3 && movimientoId) {
        // Extract time only from datetime-local value (format: "2025-12-26T06:00" -> "06:00")
        const horaInicio = data.hora_inicio_programada?.includes('T') 
          ? data.hora_inicio_programada.split('T')[1] 
          : data.hora_inicio_programada;
        const horaFin = data.hora_fin_programada?.includes('T') 
          ? data.hora_fin_programada.split('T')[1] 
          : data.hora_fin_programada;
        
        await movimientosService.update(movimientoId, {
          hora_inicio_programada: horaInicio || null,
          hora_fin_programada: horaFin || null,
          supervisor_id: data.supervisor_id || null,
          estado: 'planificado',
        });
        // Nuevas asignaciones con módulos externos
        await movimientosService.assignEmpleados(movimientoId, data.empleados_asignados);
        await movimientosService.assignEquiposEqu(movimientoId, data.equipos_asignados_equ);
        // Legacy (mantener compatibilidad)
        await movimientosService.assignEquipos(movimientoId, data.equipos_asignados);
        await movimientosService.assignOperarios(movimientoId, data.operarios_asignados);
      } else if (currentStep === 4 && movimientoId) {
        await movimientosService.update(movimientoId, {
          remitos_urls: data.remitos_urls,
          observaciones_operario: data.observaciones_operario || null,
          fecha_envio_supervisor: new Date().toISOString(),
          estado: 'en_ejecucion',
        });
        // Guardar tareas - solo enviar hora como string "HH:mm", no como timestamp
        await movimientosService.saveTareas(movimientoId, data.tareas.map(t => ({
          descripcion: t.descripcion,
          hora_inicio: t.hora_inicio ? `${data.fecha_movimiento}T${t.hora_inicio}:00` : null,
          hora_fin: t.hora_fin ? `${data.fecha_movimiento}T${t.hora_fin}:00` : null,
        })));
        // Actualizar kilometrajes
        for (const km of data.kilometrajes) {
          const equipos = await movimientosService.getMovimientoEquipos(movimientoId);
          const equipo = equipos.find(e => e.equipo_id === km.equipo_id);
          if (equipo) {
            await movimientosService.updateMovimientoEquipo(equipo.id, {
              kilometraje_inicio: km.kilometraje_inicio,
              kilometraje_fin: km.kilometraje_fin,
            });
          }
        }
      }

      toast.success(`Paso ${currentStep} guardado`);
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!movimientoId) return;
    
    setIsLoading(true);
    try {
      await movimientosService.update(movimientoId, {
        observaciones_supervisor: data.observaciones_supervisor || null,
        validado_por: data.supervisor_id || null,
        fecha_validacion: new Date().toISOString(),
        estado: 'completado',
      });
      await movimientosService.saveCalificaciones(
        movimientoId,
        data.calificaciones.map(c => ({
          operario_id: c.operario_id,
          calificacion: c.calificacion,
          comentario: c.comentario,
        })),
        data.supervisor_id || undefined
      );
      toast.success('Movimiento completado exitosamente');
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progress = (currentStep / 5) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.asunto.trim() !== '';
      default:
        return true;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          className={cn(
            "overflow-hidden flex flex-col p-6",
            isMobile 
              ? "w-full h-full max-w-full max-h-full rounded-none" 
              : "!w-[80vw] !max-w-[80vw] h-[85vh] max-h-[85vh]"
          )}
          style={!isMobile ? { width: '80vw', maxWidth: '80vw' } : undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {movimiento ? `Editar Movimiento #${movimiento.numero_movimiento}` : 'Nuevo Movimiento'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Wizard para crear o editar un movimiento
            </DialogDescription>
          </DialogHeader>

        {/* Steps indicator */}
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center gap-1',
                  currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2',
                    currentStep > step.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : currentStep === step.id
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className={cn(
          "flex-1 py-4",
          isMobile ? "overflow-x-auto px-4 -mx-6" : "overflow-y-auto"
        )}>
          {currentStep === 1 && <Step1DatosGenerales data={data} updateData={updateData} />}
          {currentStep === 2 && <Step2LineaServicio data={data} updateData={updateData} />}
          {currentStep === 3 && <Step3Planificacion data={data} updateData={updateData} movimientoId={movimientoId} />}
          {currentStep === 4 && <Step4Ejecucion data={data} updateData={updateData} movimientoId={movimientoId} />}
          {currentStep === 5 && <Step5Cierre data={data} updateData={updateData} movimientoId={movimientoId} />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Completar Movimiento
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. Si sales ahora, perderás los datos ingresados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelExit}>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
