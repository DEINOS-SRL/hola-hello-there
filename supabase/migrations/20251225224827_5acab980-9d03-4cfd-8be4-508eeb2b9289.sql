-- Agregar columna preservar_scroll a preferencias_usuario
ALTER TABLE seg.preferencias_usuario 
ADD COLUMN IF NOT EXISTS preservar_scroll BOOLEAN NOT NULL DEFAULT true;