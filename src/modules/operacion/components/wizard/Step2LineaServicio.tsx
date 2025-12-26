import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Layers, Tag } from 'lucide-react';
import { useWizardData, useTiposMovimiento, useSubtiposMovimiento } from '../../hooks/useMovimientos';
import type { WizardMovimientoData, CampoAdicional } from '../../types';

interface Step2Props {
  data: WizardMovimientoData;
  updateData: (updates: Partial<WizardMovimientoData>) => void;
}

export function Step2LineaServicio({ data, updateData }: Step2Props) {
  const { unidades } = useWizardData();
  const { data: tipos = [] } = useTiposMovimiento(data.unidad_negocio_id);
  const { data: subtipos = [] } = useSubtiposMovimiento(data.tipo_movimiento_id);

  const selectedSubtipo = subtipos.find(s => s.id === data.subtipo_movimiento_id);
  const camposAdicionales: CampoAdicional[] = selectedSubtipo?.campos_adicionales || [];

  const handleUnidadChange = (value: string) => {
    updateData({
      unidad_negocio_id: value,
      tipo_movimiento_id: '',
      subtipo_movimiento_id: '',
      campos_dinamicos: {},
    });
  };

  const handleTipoChange = (value: string) => {
    updateData({
      tipo_movimiento_id: value,
      subtipo_movimiento_id: '',
      campos_dinamicos: {},
    });
  };

  const handleSubtipoChange = (value: string) => {
    updateData({
      subtipo_movimiento_id: value,
      campos_dinamicos: {},
    });
  };

  const handleCampoDinamicoChange = (key: string, value: any) => {
    updateData({
      campos_dinamicos: {
        ...data.campos_dinamicos,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unidad de Negocio */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Unidad de Negocio
          </Label>
          <Select value={data.unidad_negocio_id} onValueChange={handleUnidadChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar unidad" />
            </SelectTrigger>
            <SelectContent>
              {unidades.map((unidad) => (
                <SelectItem key={unidad.id} value={unidad.id}>
                  {unidad.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Movimiento */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Tipo de Movimiento
          </Label>
          <Select 
            value={data.tipo_movimiento_id} 
            onValueChange={handleTipoChange}
            disabled={!data.unidad_negocio_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tipos.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subtipo de Movimiento */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Subtipo
          </Label>
          <Select 
            value={data.subtipo_movimiento_id} 
            onValueChange={handleSubtipoChange}
            disabled={!data.tipo_movimiento_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar subtipo" />
            </SelectTrigger>
            <SelectContent>
              {subtipos.map((subtipo) => (
                <SelectItem key={subtipo.id} value={subtipo.id}>
                  {subtipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campos dinámicos según el subtipo seleccionado */}
      {camposAdicionales.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Detalles del Servicio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {camposAdicionales.map((campo) => (
              <div key={campo.key} className="space-y-2">
                <Label>
                  {campo.label}
                  {campo.required && ' *'}
                </Label>
                {campo.type === 'text' && (
                  <Input
                    value={data.campos_dinamicos[campo.key] || ''}
                    onChange={(e) => handleCampoDinamicoChange(campo.key, e.target.value)}
                    placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                  />
                )}
                {campo.type === 'number' && (
                  <Input
                    type="number"
                    value={data.campos_dinamicos[campo.key] || ''}
                    onChange={(e) => handleCampoDinamicoChange(campo.key, e.target.value)}
                    placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                  />
                )}
                {campo.type === 'select' && campo.options && (
                  <Select
                    value={data.campos_dinamicos[campo.key] || ''}
                    onValueChange={(v) => handleCampoDinamicoChange(campo.key, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Seleccionar ${campo.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {campo.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {campo.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={campo.key}
                      checked={data.campos_dinamicos[campo.key] || false}
                      onCheckedChange={(checked) => handleCampoDinamicoChange(campo.key, checked)}
                    />
                    <label htmlFor={campo.key} className="text-sm text-muted-foreground">
                      {campo.label}
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!data.unidad_negocio_id && (
        <div className="text-center py-8 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Selecciona una unidad de negocio para ver los tipos disponibles</p>
        </div>
      )}
    </div>
  );
}
