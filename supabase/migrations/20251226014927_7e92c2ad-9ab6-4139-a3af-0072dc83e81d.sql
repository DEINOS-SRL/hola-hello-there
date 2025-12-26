-- Crear bucket para attachments de feedback si no existe (como público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-attachments', 
  'feedback-attachments', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];

-- Política para permitir lectura pública de archivos
CREATE POLICY "feedback_attachments_public_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'feedback-attachments');

-- Política para permitir que usuarios autenticados suban archivos a su carpeta
CREATE POLICY "feedback_attachments_auth_upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'feedback-attachments' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuarios autenticados actualicen sus propios archivos
CREATE POLICY "feedback_attachments_auth_update" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'feedback-attachments' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuarios autenticados eliminen sus propios archivos
CREATE POLICY "feedback_attachments_auth_delete" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'feedback-attachments' 
  AND auth.role() = 'authenticated'
);