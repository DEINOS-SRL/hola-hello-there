export type TipoNovedad = 'mejora' | 'reclamo' | 'incidente' | 'observacion';
export type EstadoNovedad = 'pendiente' | 'en_revision' | 'resuelto' | 'descartado';

export interface ParteDiario {
  id: string;
  empresa_id: string;
  empleado_id: string;
  fecha: string;
  actividades_realizadas: string;
  estado_animo: number;
  observaciones_adicionales: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParteActividad {
  id: string;
  parte_id: string;
  descripcion: string;
  hora_desde: string; // TIME format "HH:mm:ss"
  hora_hasta: string;
  orden: number;
  created_at: string;
}

export interface ParteNovedad {
  id: string;
  parte_id: string;
  tipo: TipoNovedad;
  descripcion: string;
  fotos: string[];
  estado: EstadoNovedad;
  respuesta_supervisor: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParteDiarioConNovedades extends ParteDiario {
  novedades: ParteNovedad[];
  actividades: ParteActividad[];
}

export interface CreateActividadInput {
  descripcion: string;
  hora_desde: string;
  hora_hasta: string;
}

export interface CreateParteDiarioInput {
  empleado_id: string;
  estado_animo: number;
  observaciones_adicionales?: string;
  actividades?: CreateActividadInput[];
  novedades?: Omit<ParteNovedad, 'id' | 'parte_id' | 'estado' | 'respuesta_supervisor' | 'created_at' | 'updated_at'>[];
}

export interface UpdateParteDiarioInput {
  actividades_realizadas?: string;
  estado_animo?: number;
  observaciones_adicionales?: string;
}

export const ESTADO_ANIMO_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '😔', label: 'Muy mal' },
  2: { emoji: '😕', label: 'Mal' },
  3: { emoji: '😐', label: 'Normal' },
  4: { emoji: '🙂', label: 'Bien' },
  5: { emoji: '😄', label: 'Excelente' },
};

export const TIPO_NOVEDAD_LABELS: Record<TipoNovedad, { label: string; color: string }> = {
  mejora: { label: 'Mejora', color: 'bg-green-500/10 text-green-600' },
  reclamo: { label: 'Reclamo', color: 'bg-yellow-500/10 text-yellow-600' },
  incidente: { label: 'Incidente', color: 'bg-red-500/10 text-red-600' },
  observacion: { label: 'Observación', color: 'bg-blue-500/10 text-blue-600' },
};

export const ESTADO_NOVEDAD_LABELS: Record<EstadoNovedad, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-600' },
  en_revision: { label: 'En Revisión', color: 'bg-blue-500/10 text-blue-600' },
  resuelto: { label: 'Resuelto', color: 'bg-green-500/10 text-green-600' },
  descartado: { label: 'Descartado', color: 'bg-muted text-muted-foreground' },
};
