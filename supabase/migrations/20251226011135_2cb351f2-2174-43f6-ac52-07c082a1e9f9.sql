-- Crear bucket para archivos de feedback
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-attachments', 'feedback-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para el bucket
CREATE POLICY "Usuarios autenticados pueden subir archivos de feedback"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-attachments');

CREATE POLICY "Cualquiera puede ver archivos de feedback"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feedback-attachments');

CREATE POLICY "Admins pueden eliminar archivos de feedback"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'feedback-attachments' AND seg.is_admin(auth.uid()));

-- Agregar columna para URLs de archivos adjuntos
ALTER TABLE seg.feedbacks
ADD COLUMN IF NOT EXISTS archivos_adjuntos TEXT[] DEFAULT '{}';