// Tipos para el módulo Comercial

export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'vencido';
export type EstadoCertificacion = 'pendiente' | 'emitida' | 'cobrada' | 'anulada';
export type TipoSeguimiento = 'llamada' | 'email' | 'reunion' | 'visita' | 'otro';

export interface Presupuesto {
  id: string;
  empresa_id: string;
  numero: string;
  cliente: string;
  descripcion?: string;
  fecha: string;
  fecha_vencimiento?: string;
  monto_total: number;
  estado: EstadoPresupuesto;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PresupuestoItem {
  id: string;
  presupuesto_id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  orden: number;
  created_at: string;
}

export interface Certificacion {
  id: string;
  empresa_id: string;
  presupuesto_id?: string;
  numero: string;
  descripcion?: string;
  fecha: string;
  periodo?: string;
  monto: number;
  estado: EstadoCertificacion;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Seguimiento {
  id: string;
  empresa_id: string;
  presupuesto_id?: string;
  tipo: TipoSeguimiento;
  cliente?: string;
  descripcion: string;
  fecha: string;
  responsable?: string;
  resultado?: string;
  proxima_accion?: string;
  fecha_proxima?: string;
  completado: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PresupuestoFormData {
  numero: string;
  cliente: string;
  descripcion?: string;
  fecha: string;
  fecha_vencimiento?: string;
  estado: EstadoPresupuesto;
  observaciones?: string;
}

export interface PresupuestoItemFormData {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  orden?: number;
}
