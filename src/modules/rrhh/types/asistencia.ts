export type TipoAsistencia = 'normal' | 'tardanza' | 'falta' | 'permiso' | 'vacaciones' | 'licencia';
export type TipoPermiso = 'permiso_personal' | 'licencia_medica' | 'vacaciones' | 'licencia_paternidad' | 'licencia_maternidad' | 'duelo' | 'otro';
export type EstadoPermiso = 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';

export interface Asistencia {
  id: string;
  empresa_id: string;
  empleado_id: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  tipo: TipoAsistencia;
  observaciones: string | null;
  registrado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permiso {
  id: string;
  empresa_id: string;
  empleado_id: string;
  tipo: TipoPermiso;
  fecha_inicio: string;
  fecha_fin: string;
  dias_totales: number;
  motivo: string;
  estado: EstadoPermiso;
  aprobado_por: string | null;
  fecha_aprobacion: string | null;
  documento_adjunto: string | null;
  created_at: string;
  updated_at: string;
}

export interface Horario {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion: string | null;
  hora_entrada: string;
  hora_salida: string;
  tolerancia_minutos: number;
  dias_laborables: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmpleadoHorario {
  id: string;
  empresa_id: string;
  empleado_id: string;
  horario_id: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
