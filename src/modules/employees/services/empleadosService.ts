import { createClient } from '@supabase/supabase-js';
import type { Empleado, EmpleadoInsert, EmpleadoUpdate } from '../types';

// Cliente sin tipos para el schema emp (no está en los tipos autogenerados)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const empClient = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'emp' },
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const empleadosService = {
  async getAll(): Promise<Empleado[]> {
    const { data, error } = await empClient
      .from('empleados')
      .select('*')
      .order('apellido', { ascending: true });
    
    if (error) throw error;
    return data as Empleado[];
  },

  async getById(id: string): Promise<Empleado | null> {
    const { data, error } = await empClient
      .from('empleados')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Empleado | null;
  },

  async create(empleado: EmpleadoInsert): Promise<Empleado> {
    const { data, error } = await empClient
      .from('empleados')
      .insert(empleado)
      .select()
      .single();
    
    if (error) throw error;
    return data as Empleado;
  },

  async update({ id, ...updates }: EmpleadoUpdate): Promise<Empleado> {
    const { data, error } = await empClient
      .from('empleados')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Empleado;
  },

  async delete(id: string): Promise<void> {
    const { error } = await empClient
      .from('empleados')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateEstado(id: string, estado: 'activo' | 'licencia' | 'baja'): Promise<Empleado> {
    const { data, error } = await empClient
      .from('empleados')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Empleado;
  },
};
