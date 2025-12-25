// Tipos para el módulo de Empleados

export interface Empleado {
  id: string;
  empresa_id: string;
  usuario_id: string | null;
  legajo: string | null;
  nombre: string;
  apellido: string;
  dni: string | null;
  fecha_nacimiento: string | null;
  fecha_ingreso: string | null;
  cargo: string | null;
  departamento: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: 'activo' | 'licencia' | 'baja';
  created_at: string;
  updated_at: string;
}

export interface EmpleadoInsert {
  empresa_id: string;
  usuario_id?: string | null;
  legajo?: string | null;
  nombre: string;
  apellido: string;
  dni?: string | null;
  fecha_nacimiento?: string | null;
  fecha_ingreso?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  estado?: 'activo' | 'licencia' | 'baja';
}

export interface EmpleadoUpdate extends Partial<EmpleadoInsert> {
  id: string;
}
