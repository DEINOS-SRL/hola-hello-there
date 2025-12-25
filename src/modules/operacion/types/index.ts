export type EstadoMovimiento = 'pendiente' | 'en_transito' | 'completado' | 'cancelado';
export type TipoMovimiento = 'traslado' | 'prestamo' | 'mantenimiento' | 'baja' | 'alta';

export interface Movimiento {
  id: string;
  empresa_id: string | null;
  equipo_descripcion: string;
  tipo: TipoMovimiento;
  origen: string;
  destino: string;
  responsable_id: string | null;
  responsable_nombre: string | null;
  fecha_solicitud: string;
  fecha_programada: string | null;
  fecha_ejecucion: string | null;
  estado: EstadoMovimiento;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovimientoInsert {
  equipo_descripcion: string;
  tipo?: TipoMovimiento;
  origen: string;
  destino: string;
  responsable_id?: string | null;
  responsable_nombre?: string | null;
  fecha_programada?: string | null;
  estado?: EstadoMovimiento;
  observaciones?: string | null;
  empresa_id?: string | null;
}

export interface MovimientoUpdate {
  equipo_descripcion?: string;
  tipo?: TipoMovimiento;
  origen?: string;
  destino?: string;
  responsable_id?: string | null;
  responsable_nombre?: string | null;
  fecha_programada?: string | null;
  fecha_ejecucion?: string | null;
  estado?: EstadoMovimiento;
  observaciones?: string | null;
}
