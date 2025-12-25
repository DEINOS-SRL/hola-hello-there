-- Agregar columnas de comportamiento a preferencias_usuario
ALTER TABLE seg.preferencias_usuario 
ADD COLUMN IF NOT EXISTS animaciones_reducidas BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmar_eliminar BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sonidos_notificacion BOOLEAN NOT NULL DEFAULT true;