export type EstadoEquipo = 'activo' | 'inactivo' | 'mantenimiento' | 'baja';

export interface TipoEquipo {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Marca {
  id: string;
  empresa_id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Modelo {
  id: string;
  empresa_id: string;
  marca_id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  marca?: Marca;
}

export interface Equipo {
  id: string;
  empresa_id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_equipo_id?: string;
  marca_id?: string;
  modelo_id?: string;
  numero_serie?: string;
  numero_interno?: string;
  anio_fabricacion?: number;
  fecha_adquisicion?: string;
  valor_adquisicion?: number;
  estado: EstadoEquipo;
  ubicacion?: string;
  observaciones?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  tipo_equipo?: TipoEquipo;
  marca?: Marca;
  modelo?: Modelo;
}

export interface EquipoFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_equipo_id?: string;
  marca_id?: string;
  modelo_id?: string;
  numero_serie?: string;
  numero_interno?: string;
  anio_fabricacion?: number;
  fecha_adquisicion?: string;
  valor_adquisicion?: number;
  estado: EstadoEquipo;
  ubicacion?: string;
  observaciones?: string;
}

export interface TipoEquipoFormData {
  nombre: string;
  descripcion?: string;
}

export interface MarcaFormData {
  nombre: string;
}

export interface ModeloFormData {
  marca_id: string;
  nombre: string;
}
