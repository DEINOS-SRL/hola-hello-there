-- Agregar columna destacado a la tabla feedbacks
ALTER TABLE seg.feedbacks 
ADD COLUMN destacado BOOLEAN NOT NULL DEFAULT false;

-- Crear índice para filtrar rápidamente los destacados
CREATE INDEX idx_feedbacks_destacado ON seg.feedbacks(destacado) WHERE destacado = true;