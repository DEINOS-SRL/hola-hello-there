import { segClient } from './segClient';

export interface FeedbackComentario {
  id: string;
  feedback_id: string;
  usuario_id: string;
  usuario_email: string | null;
  usuario_nombre: string | null;
  mensaje: string;
  es_interno: boolean;
  created_at: string;
}

export interface CreateComentarioInput {
  feedback_id: string;
  usuario_id: string;
  usuario_email?: string;
  usuario_nombre?: string;
  mensaje: string;
  es_interno?: boolean;
}

export async function getComentariosByFeedback(feedbackId: string): Promise<FeedbackComentario[]> {
  const { data, error } = await segClient
    .from('feedback_comentarios')
    .select('*')
    .eq('feedback_id', feedbackId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comentarios:', error);
    throw error;
  }

  return data || [];
}

export async function createComentario(input: CreateComentarioInput): Promise<FeedbackComentario> {
  const { data, error } = await segClient
    .from('feedback_comentarios')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating comentario:', error);
    throw error;
  }

  return data;
}
