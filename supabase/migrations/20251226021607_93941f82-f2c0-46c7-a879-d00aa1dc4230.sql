-- Tabla para historial de cambios de estado de feedbacks
CREATE TABLE seg.feedback_historial_estados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES seg.feedbacks(id) ON DELETE CASCADE,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL,
  usuario_id UUID,
  usuario_email TEXT,
  usuario_nombre TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_feedback_historial_feedback_id ON seg.feedback_historial_estados(feedback_id);
CREATE INDEX idx_feedback_historial_created_at ON seg.feedback_historial_estados(created_at DESC);

-- RLS
ALTER TABLE seg.feedback_historial_estados ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados pueden ver historial de feedbacks de su empresa
CREATE POLICY "Ver historial de estados de feedbacks de empresa" 
ON seg.feedback_historial_estados 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM seg.feedbacks f 
    WHERE f.id = feedback_id 
    AND f.empresa_id = public.get_current_user_empresa_id()
  )
);

-- Política para insertar historial
CREATE POLICY "Insertar historial de estados" 
ON seg.feedback_historial_estados 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM seg.feedbacks f 
    WHERE f.id = feedback_id 
    AND f.empresa_id = public.get_current_user_empresa_id()
  )
);

-- Agregar campo es_interno a feedback_comentarios si no existe
ALTER TABLE seg.feedback_comentarios ADD COLUMN IF NOT EXISTS es_interno BOOLEAN NOT NULL DEFAULT false;