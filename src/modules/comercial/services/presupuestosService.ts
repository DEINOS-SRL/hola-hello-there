import { comClient } from './comClient';
import type { Presupuesto, PresupuestoFormData, PresupuestoItem, PresupuestoItemFormData } from '../types';

// Obtener empresa_id del usuario actual
async function getEmpresaId(): Promise<string> {
  const { data, error } = await comClient.rpc('get_current_user_empresa_id');
  if (error) throw new Error('No se pudo obtener la empresa del usuario');
  if (!data) throw new Error('Usuario sin empresa asignada');
  return data;
}

// =============== PRESUPUESTOS ===============

export async function getPresupuestos(): Promise<Presupuesto[]> {
  const { data, error } = await comClient
    .from('presupuestos')
    .select('*')
    .order('fecha', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getPresupuestoById(id: string): Promise<Presupuesto | null> {
  const { data, error } = await comClient
    .from('presupuestos')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function createPresupuesto(formData: PresupuestoFormData): Promise<Presupuesto> {
  const empresaId = await getEmpresaId();
  
  const { data, error } = await comClient
    .from('presupuestos')
    .insert({
      ...formData,
      empresa_id: empresaId,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePresupuesto(id: string, formData: Partial<PresupuestoFormData>): Promise<Presupuesto> {
  const { data, error } = await comClient
    .from('presupuestos')
    .update(formData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePresupuesto(id: string): Promise<void> {
  const { error } = await comClient
    .from('presupuestos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Generar siguiente número de presupuesto
export async function getNextNumeroPresupuesto(): Promise<string> {
  const empresaId = await getEmpresaId();
  const year = new Date().getFullYear();
  const prefix = `PRES-${year}-`;
  
  const { data } = await comClient
    .from('presupuestos')
    .select('numero')
    .eq('empresa_id', empresaId)
    .like('numero', `${prefix}%`)
    .order('numero', { ascending: false })
    .limit(1);
  
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].numero.replace(prefix, ''), 10);
    return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
  }
  
  return `${prefix}0001`;
}

// =============== ITEMS DE PRESUPUESTO ===============

export async function getPresupuestoItems(presupuestoId: string): Promise<PresupuestoItem[]> {
  const { data, error } = await comClient
    .from('presupuesto_items')
    .select('*')
    .eq('presupuesto_id', presupuestoId)
    .order('orden', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createPresupuestoItem(
  presupuestoId: string, 
  formData: PresupuestoItemFormData
): Promise<PresupuestoItem> {
  const { data, error } = await comClient
    .from('presupuesto_items')
    .insert({
      presupuesto_id: presupuestoId,
      ...formData,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePresupuestoItem(
  id: string, 
  formData: Partial<PresupuestoItemFormData>
): Promise<PresupuestoItem> {
  const { data, error } = await comClient
    .from('presupuesto_items')
    .update(formData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePresupuestoItem(id: string): Promise<void> {
  const { error } = await comClient
    .from('presupuesto_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
