-- Tabla para comentarios de seguimiento en feedbacks
CREATE TABLE seg.feedback_comentarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  usuario_email TEXT,
  usuario_nombre TEXT,
  mensaje TEXT NOT NULL,
  es_interno BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE seg.feedback_comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuarios autenticados pueden ver comentarios de feedbacks de su empresa"
ON seg.feedback_comentarios FOR SELECT
USING (
  feedback_id IN (
    SELECT id FROM seg.feedbacks 
    WHERE empresa_id = public.get_current_user_empresa_id()
    OR usuario_id = public.get_current_usuario_id()
  )
);

CREATE POLICY "Usuarios autenticados pueden crear comentarios"
ON seg.feedback_comentarios FOR INSERT
WITH CHECK (
  usuario_id = public.get_current_usuario_id()
);

-- Índice para búsquedas por feedback_id
CREATE INDEX idx_feedback_comentarios_feedback_id ON seg.feedback_comentarios(feedback_id);
CREATE INDEX idx_feedback_comentarios_created_at ON seg.feedback_comentarios(created_at);

-- Comentario descriptivo
COMMENT ON TABLE seg.feedback_comentarios IS 'Comentarios de seguimiento para feedbacks';