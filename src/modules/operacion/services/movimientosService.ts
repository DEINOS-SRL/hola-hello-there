import { movClient } from './movClient';
import type { Movimiento, MovimientoInsert, MovimientoUpdate } from '../types';

export const movimientosService = {
  async getAll(): Promise<Movimiento[]> {
    const { data, error } = await movClient
      .from('movimientos')
      .select('*')
      .order('fecha_solicitud', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Movimiento | null> {
    const { data, error } = await movClient
      .from('movimientos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(movimiento: MovimientoInsert): Promise<Movimiento> {
    const { data, error } = await movClient
      .from('movimientos')
      .insert(movimiento)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, movimiento: MovimientoUpdate): Promise<Movimiento> {
    const { data, error } = await movClient
      .from('movimientos')
      .update(movimiento)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await movClient
      .from('movimientos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateEstado(id: string, estado: Movimiento['estado']): Promise<Movimiento> {
    const updateData: MovimientoUpdate = { estado };
    
    if (estado === 'completado') {
      updateData.fecha_ejecucion = new Date().toISOString();
    }
    
    return this.update(id, updateData);
  }
};
