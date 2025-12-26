-- Agregar columna para sección/módulo de referencia
ALTER TABLE seg.feedbacks
ADD COLUMN IF NOT EXISTS modulo_referencia TEXT DEFAULT NULL;