import { rrhhClient } from './rrhhClient';
import { supabase } from '@/integrations/supabase/client';

export interface ConfigParteDiario {
  id: string;
  usuario_id: string;
  empresa_id: string;
  recordatorio_activo: boolean;
  hora_recordatorio: string; // TIME format "HH:mm:ss"
  created_at: string;
  updated_at: string;
}

export interface UpsertConfigInput {
  recordatorio_activo: boolean;
  hora_recordatorio: string;
}

export async function getConfigParteDiario(): Promise<ConfigParteDiario | null> {
  const { data, error } = await rrhhClient
    .from('usuarios_config_partes')
    .select('*')
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function upsertConfigParteDiario(input: UpsertConfigInput): Promise<ConfigParteDiario> {
  // Get current user id and empresa_id
  const { data: usuarioId } = await supabase.rpc('get_current_usuario_id');
  const { data: empresaId } = await supabase.rpc('get_current_user_empresa_id');
  
  if (!usuarioId || !empresaId) {
    throw new Error('No se pudo obtener el usuario o empresa actual');
  }

  // Try to get existing config
  const existing = await getConfigParteDiario();

  if (existing) {
    // Update
    const { data, error } = await rrhhClient
      .from('usuarios_config_partes')
      .update({
        recordatorio_activo: input.recordatorio_activo,
        hora_recordatorio: input.hora_recordatorio,
      })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Insert
    const { data, error } = await rrhhClient
      .from('usuarios_config_partes')
      .insert({
        usuario_id: usuarioId,
        empresa_id: empresaId,
        recordatorio_activo: input.recordatorio_activo,
        hora_recordatorio: input.hora_recordatorio,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Check if user has submitted parte diario today
export async function hasSubmittedParteToday(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await rrhhClient
    .from('partes_diarios')
    .select('id')
    .eq('fecha', today)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
}
