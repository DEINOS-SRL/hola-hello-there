// Estados del wizard de movimientos
export type EstadoMovimiento = 
  | 'generado' 
  | 'asignacion_recursos' 
  | 'planificado' 
  | 'en_ejecucion' 
  | 'cierre_operativo' 
  | 'completado' 
  | 'cancelado';

// Entidades principales
export interface Cliente {
  id: string;
  empresa_id: string;
  nombre: string;
  razon_social: string | null;
  cuit: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnidadNegocio {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface TipoMovimiento {
  id: string;
  empresa_id: string;
  unidad_negocio_id: string | null;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface CampoAdicional {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'number';
  options?: string[];
  required?: boolean;
}

export interface SubtipoMovimiento {
  id: string;
  empresa_id: string;
  tipo_movimiento_id: string | null;
  nombre: string;
  descripcion: string | null;
  campos_adicionales: CampoAdicional[];
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface RecursoEquipo {
  id: string;
  empresa_id: string;
  codigo: string;
  descripcion: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  patente: string | null;
  kilometraje_actual: number;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecursoOperario {
  id: string;
  empresa_id: string;
  legajo: string | null;
  nombre: string;
  apellido: string;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  rol: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Movimiento principal
export interface Movimiento {
  id: string;
  empresa_id: string;
  numero_movimiento: number;
  
  // Step 1: Datos Generales
  fecha_movimiento: string;
  cliente_id: string | null;
  presupuesto_id: string | null;
  asunto: string;
  ubicacion: string | null;
  solicitante: string | null;
  alcance: string | null;
  
  // Step 2: Línea de Servicio
  unidad_negocio_id: string | null;
  tipo_movimiento_id: string | null;
  subtipo_movimiento_id: string | null;
  campos_dinamicos: Record<string, any>;
  
  // Step 3: Planificación
  hora_inicio_programada: string | null;
  hora_fin_programada: string | null;
  supervisor_id: string | null;
  
  // Step 4: Ejecución
  remito_url: string | null;
  observaciones_operario: string | null;
  fecha_envio_supervisor: string | null;
  
  // Step 5: Cierre
  validado_por: string | null;
  fecha_validacion: string | null;
  observaciones_supervisor: string | null;
  
  estado: EstadoMovimiento;
  created_at: string;
  updated_at: string;
}

export interface MovimientoInsert {
  fecha_movimiento?: string;
  cliente_id?: string | null;
  presupuesto_id?: string | null;
  asunto: string;
  ubicacion?: string | null;
  solicitante?: string | null;
  alcance?: string | null;
  unidad_negocio_id?: string | null;
  tipo_movimiento_id?: string | null;
  subtipo_movimiento_id?: string | null;
  campos_dinamicos?: Record<string, any>;
  hora_inicio_programada?: string | null;
  hora_fin_programada?: string | null;
  supervisor_id?: string | null;
  estado?: EstadoMovimiento;
  empresa_id?: string | null;
}

export interface MovimientoUpdate {
  fecha_movimiento?: string;
  cliente_id?: string | null;
  presupuesto_id?: string | null;
  asunto?: string;
  ubicacion?: string | null;
  solicitante?: string | null;
  alcance?: string | null;
  unidad_negocio_id?: string | null;
  tipo_movimiento_id?: string | null;
  subtipo_movimiento_id?: string | null;
  campos_dinamicos?: Record<string, any>;
  hora_inicio_programada?: string | null;
  hora_fin_programada?: string | null;
  supervisor_id?: string | null;
  remito_url?: string | null;
  observaciones_operario?: string | null;
  fecha_envio_supervisor?: string | null;
  validado_por?: string | null;
  fecha_validacion?: string | null;
  observaciones_supervisor?: string | null;
  estado?: EstadoMovimiento;
}

// Relaciones
export interface MovimientoEquipo {
  id: string;
  movimiento_id: string;
  equipo_id: string;
  kilometraje_inicio: number | null;
  kilometraje_fin: number | null;
  observaciones: string | null;
  created_at: string;
  equipo?: RecursoEquipo;
}

export interface MovimientoOperario {
  id: string;
  movimiento_id: string;
  operario_id: string;
  rol_asignado: string;
  created_at: string;
  operario?: RecursoOperario;
}

export interface MovimientoTarea {
  id: string;
  movimiento_id: string;
  descripcion: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  orden: number;
  completada: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalificacionOperario {
  id: string;
  movimiento_id: string;
  operario_id: string;
  calificacion: number;
  comentario: string | null;
  calificado_por: string | null;
  fecha_calificacion: string;
  created_at: string;
  operario?: RecursoOperario;
}

// Wizard state
export interface WizardMovimientoData {
  // Step 1
  fecha_movimiento: string;
  cliente_id: string;
  presupuesto_id: string;
  asunto: string;
  ubicacion: string;
  solicitante: string;
  alcance: string;
  
  // Step 2
  unidad_negocio_id: string;
  tipo_movimiento_id: string;
  subtipo_movimiento_id: string;
  campos_dinamicos: Record<string, any>;
  
  // Step 3
  hora_inicio_programada: string;
  hora_fin_programada: string;
  supervisor_id: string;
  equipos_asignados: string[];
  operarios_asignados: { operario_id: string; rol_asignado: string }[];
  
  // Step 4
  tareas: { descripcion: string; hora_inicio: string; hora_fin: string }[];
  remito_url: string;
  observaciones_operario: string;
  kilometrajes: { equipo_id: string; kilometraje_inicio: number; kilometraje_fin: number }[];
  
  // Step 5
  calificaciones: { operario_id: string; calificacion: number; comentario: string }[];
  observaciones_supervisor: string;
}
