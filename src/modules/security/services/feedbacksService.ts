import { segClient } from './segClient';
import { supabase } from '@/integrations/supabase/client';

export interface Feedback {
  id: string;
  usuario_id: string;
  usuario_email: string | null;
  usuario_nombre: string | null;
  tipo: 'sugerencia' | 'mejora' | 'queja' | 'bug' | 'consulta' | 'ayuda' | 'acceso-permiso';
  mensaje: string;
  estado: 'pendiente' | 'en_revision' | 'resuelto' | 'cerrado';
  respuesta: string | null;
  respondido_por: string | null;
  respondido_at: string | null;
  empresa_id: string | null;
  archivos_adjuntos: string[] | null;
  modulo_referencia: string | null;
  asignado_a: string | null;
  asignado_at: string | null;
  asignado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsuarioAsignable {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  empresa_id: string;
}

export interface CreateFeedbackInput {
  usuario_id: string;
  usuario_email?: string;
  usuario_nombre?: string;
  tipo: Feedback['tipo'];
  mensaje: string;
  empresa_id?: string;
  archivos_adjuntos?: string[];
  modulo_referencia?: string;
}

export interface UpdateFeedbackInput {
  estado?: Feedback['estado'];
  respuesta?: string;
  respondido_por?: string;
  respondido_at?: string;
  asignado_a?: string | null;
  asignado_at?: string | null;
  asignado_por?: string | null;
}

// Función para subir archivos al bucket
export async function uploadFeedbackAttachment(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('feedback-attachments')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('feedback-attachments')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function getFeedbacks(): Promise<Feedback[]> {
  const { data, error } = await segClient
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedbacks:', error);
    throw error;
  }

  return data || [];
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
  const { data, error } = await segClient
    .from('feedbacks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }

  return data;
}

export async function createFeedback(input: CreateFeedbackInput): Promise<Feedback> {
  const { data, error } = await segClient
    .from('feedbacks')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }

  return data;
}

export async function updateFeedback(id: string, input: UpdateFeedbackInput): Promise<Feedback> {
  const { data, error } = await segClient
    .from('feedbacks')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }

  return data;
}

export async function respondToFeedback(
  id: string, 
  respuesta: string, 
  respondidoPor: string
): Promise<Feedback> {
  return updateFeedback(id, {
    respuesta,
    respondido_por: respondidoPor,
    respondido_at: new Date().toISOString(),
    estado: 'resuelto',
  });
}

export async function getMyFeedbacks(): Promise<Feedback[]> {
  const { data, error } = await segClient.rpc('get_my_feedbacks');

  if (error) {
    console.error('Error fetching my feedbacks:', error);
    throw error;
  }

  return (data as Feedback[]) || [];
}

// Obtener usuarios activos para asignar feedbacks
export async function getUsuariosAsignables(): Promise<UsuarioAsignable[]> {
  const { data, error } = await segClient
    .from('usuarios')
    .select('id, nombre, apellido, email, empresa_id')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching usuarios asignables:', error);
    throw error;
  }

  return data || [];
}

// Asignar feedback a un usuario
export async function asignarFeedback(
  feedbackId: string, 
  asignadoA: string | null, 
  asignadoPor: string
): Promise<Feedback> {
  return updateFeedback(feedbackId, {
    asignado_a: asignadoA,
    asignado_at: asignadoA ? new Date().toISOString() : null,
    asignado_por: asignadoA ? asignadoPor : null,
  });
}
