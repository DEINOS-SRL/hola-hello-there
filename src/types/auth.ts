// Types for the DNSCloud security module

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dni?: string;
  direccion?: string;
  telefono?: string;
  activo: boolean;
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  direccion?: string;
  horarios?: string;
  servicios?: Record<string, unknown>;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  empresa_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Permiso {
  id: string;
  nombre: string;
  descripcion?: string;
  modulo: string;
  created_at: string;
}

export interface Aplicacion {
  id: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  icono?: string;
  ruta?: string;
  created_at: string;
  updated_at: string;
}

export interface UsuarioRol {
  id: string;
  usuario_id: string;
  rol_id: string;
  aplicacion_id: string;
  created_at: string;
}

export interface RolPermiso {
  id: string;
  rol_id: string;
  permiso_id: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  empresa: Empresa | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

export type ViewMode = 'list' | 'cards';
