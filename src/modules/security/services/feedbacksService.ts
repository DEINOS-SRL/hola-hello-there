import { segClient } from './segClient';

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
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackInput {
  usuario_id: string;
  usuario_email?: string;
  usuario_nombre?: string;
  tipo: Feedback['tipo'];
  mensaje: string;
  empresa_id?: string;
}

export interface UpdateFeedbackInput {
  estado?: Feedback['estado'];
  respuesta?: string;
  respondido_por?: string;
  respondido_at?: string;
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
