import { rrhhClient } from './rrhhClient';
import { supabase } from '@/integrations/supabase/client';
import type { 
  ParteDiario, 
  ParteNovedad, 
  ParteActividad,
  ParteDiarioConNovedades,
  CreateParteDiarioInput,
  UpdateParteDiarioInput,
  EstadoNovedad
} from '../types/partesDiarios';

export async function getPartesDiarios(): Promise<ParteDiario[]> {
  const { data, error } = await rrhhClient
    .from('partes_diarios')
    .select('*')
    .order('fecha', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getParteDiarioById(id: string): Promise<ParteDiarioConNovedades | null> {
  const { data: parte, error: parteError } = await rrhhClient
    .from('partes_diarios')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (parteError) throw parteError;
  if (!parte) return null;

  // Get actividades
  const { data: actividades, error: actividadesError } = await rrhhClient
    .from('partes_actividades')
    .select('*')
    .eq('parte_id', id)
    .order('orden', { ascending: true });
  
  if (actividadesError) throw actividadesError;

  // Get novedades
  const { data: novedades, error: novedadesError } = await rrhhClient
    .from('partes_novedades')
    .select('*')
    .eq('parte_id', id)
    .order('created_at', { ascending: true });
  
  if (novedadesError) throw novedadesError;

  return {
    ...parte,
    actividades: actividades || [],
    novedades: novedades || []
  };
}

export async function getParteDiarioByFecha(empleadoId: string, fecha: string): Promise<ParteDiarioConNovedades | null> {
  const { data: parte, error: parteError } = await rrhhClient
    .from('partes_diarios')
    .select('*')
    .eq('empleado_id', empleadoId)
    .eq('fecha', fecha)
    .maybeSingle();
  
  if (parteError) throw parteError;
  if (!parte) return null;

  const { data: actividades, error: actividadesError } = await rrhhClient
    .from('partes_actividades')
    .select('*')
    .eq('parte_id', parte.id)
    .order('orden', { ascending: true });
  
  if (actividadesError) throw actividadesError;

  const { data: novedades, error: novedadesError } = await rrhhClient
    .from('partes_novedades')
    .select('*')
    .eq('parte_id', parte.id)
    .order('created_at', { ascending: true });
  
  if (novedadesError) throw novedadesError;

  return {
    ...parte,
    actividades: actividades || [],
    novedades: novedades || []
  };
}

export async function createParteDiario(input: CreateParteDiarioInput): Promise<ParteDiario> {
  // Get empresa_id from current user
  const { data: empresaId, error: empresaError } = await supabase
    .rpc('get_current_user_empresa_id');
  
  if (empresaError) throw empresaError;
  if (!empresaId) throw new Error('No se pudo obtener la empresa del usuario');

  // Generate actividades_realizadas from list
  const actividadesTexto = input.actividades?.map(a => 
    `${a.hora_desde.slice(0,5)} - ${a.hora_hasta.slice(0,5)}: ${a.descripcion}`
  ).join('\n') || '';

  const { data: parte, error: parteError } = await rrhhClient
    .from('partes_diarios')
    .insert({
      empresa_id: empresaId,
      empleado_id: input.empleado_id,
      actividades_realizadas: actividadesTexto,
      estado_animo: input.estado_animo,
      observaciones_adicionales: input.observaciones_adicionales || null,
    })
    .select()
    .single();
  
  if (parteError) throw parteError;

  // Insert actividades if any
  if (input.actividades && input.actividades.length > 0) {
    const actividadesData = input.actividades.map((a, index) => ({
      parte_id: parte.id,
      descripcion: a.descripcion,
      hora_desde: a.hora_desde,
      hora_hasta: a.hora_hasta,
      orden: index,
    }));

    const { error: actividadesError } = await rrhhClient
      .from('partes_actividades')
      .insert(actividadesData);
    
    if (actividadesError) throw actividadesError;
  }

  // Insert novedades if any
  if (input.novedades && input.novedades.length > 0) {
    const novedadesData = input.novedades.map(n => ({
      parte_id: parte.id,
      tipo: n.tipo,
      descripcion: n.descripcion,
      fotos: n.fotos,
    }));

    const { error: novedadesError } = await rrhhClient
      .from('partes_novedades')
      .insert(novedadesData);
    
    if (novedadesError) throw novedadesError;
  }

  return parte;
}

export async function updateParteDiario(id: string, input: UpdateParteDiarioInput): Promise<ParteDiario> {
  const { data, error } = await rrhhClient
    .from('partes_diarios')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteParteDiario(id: string): Promise<void> {
  const { error } = await rrhhClient
    .from('partes_diarios')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Novedades
export async function addNovedad(parteId: string, novedad: Omit<ParteNovedad, 'id' | 'parte_id' | 'estado' | 'respuesta_supervisor' | 'created_at' | 'updated_at'>): Promise<ParteNovedad> {
  const { data, error } = await rrhhClient
    .from('partes_novedades')
    .insert({
      parte_id: parteId,
      tipo: novedad.tipo,
      descripcion: novedad.descripcion,
      fotos: novedad.fotos,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateNovedadEstado(id: string, estado: EstadoNovedad, respuesta?: string): Promise<ParteNovedad> {
  const { data, error } = await rrhhClient
    .from('partes_novedades')
    .update({ 
      estado,
      respuesta_supervisor: respuesta || null
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteNovedad(id: string): Promise<void> {
  const { error } = await rrhhClient
    .from('partes_novedades')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Upload photo
export async function uploadNovedadFoto(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from('partes-novedades')
    .upload(fileName, file);
  
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('partes-novedades')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Statistics
export async function getNovedadesStats(): Promise<{
  total: number;
  porTipo: Record<string, number>;
  porEstado: Record<string, number>;
}> {
  const { data, error } = await rrhhClient
    .from('partes_novedades')
    .select('tipo, estado');
  
  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    porTipo: {} as Record<string, number>,
    porEstado: {} as Record<string, number>,
  };

  data?.forEach(n => {
    stats.porTipo[n.tipo] = (stats.porTipo[n.tipo] || 0) + 1;
    stats.porEstado[n.estado] = (stats.porEstado[n.estado] || 0) + 1;
  });

  return stats;
}
