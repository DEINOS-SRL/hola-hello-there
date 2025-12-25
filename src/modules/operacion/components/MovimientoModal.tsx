import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Movimiento, MovimientoInsert, TipoMovimiento, EstadoMovimiento } from '../types';

interface MovimientoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimiento?: Movimiento | null;
  onSave: (data: MovimientoInsert) => Promise<void>;
  isLoading?: boolean;
}

const tiposMovimiento: { value: TipoMovimiento; label: string }[] = [
  { value: 'traslado', label: 'Traslado' },
  { value: 'prestamo', label: 'Préstamo' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'baja', label: 'Baja' },
  { value: 'alta', label: 'Alta' },
];

const estadosMovimiento: { value: EstadoMovimiento; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_transito', label: 'En Tránsito' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export function MovimientoModal({ open, onOpenChange, movimiento, onSave, isLoading }: MovimientoModalProps) {
  const [formData, setFormData] = useState<MovimientoInsert>({
    equipo_descripcion: '',
    tipo: 'traslado',
    origen: '',
    destino: '',
    responsable_nombre: '',
    fecha_programada: '',
    estado: 'pendiente',
    observaciones: '',
  });

  useEffect(() => {
    if (movimiento) {
      setFormData({
        equipo_descripcion: movimiento.equipo_descripcion,
        tipo: movimiento.tipo,
        origen: movimiento.origen,
        destino: movimiento.destino,
        responsable_nombre: movimiento.responsable_nombre || '',
        fecha_programada: movimiento.fecha_programada?.split('T')[0] || '',
        estado: movimiento.estado,
        observaciones: movimiento.observaciones || '',
      });
    } else {
      setFormData({
        equipo_descripcion: '',
        tipo: 'traslado',
        origen: '',
        destino: '',
        responsable_nombre: '',
        fecha_programada: '',
        estado: 'pendiente',
        observaciones: '',
      });
    }
  }, [movimiento, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      fecha_programada: formData.fecha_programada ? new Date(formData.fecha_programada).toISOString() : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="equipo">Equipo / Descripción *</Label>
              <Input
                id="equipo"
                value={formData.equipo_descripcion}
                onChange={(e) => setFormData({ ...formData, equipo_descripcion: e.target.value })}
                placeholder="Ej: Excavadora CAT 320D"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: TipoMovimiento) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMovimiento.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: EstadoMovimiento) => setFormData({ ...formData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosMovimiento.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="origen">Origen *</Label>
                <Input
                  id="origen"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  placeholder="Ubicación de origen"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destino">Destino *</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  placeholder="Ubicación de destino"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  value={formData.responsable_nombre || ''}
                  onChange={(e) => setFormData({ ...formData, responsable_nombre: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha Programada</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha_programada || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_programada: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
