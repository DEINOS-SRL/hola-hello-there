-- Habilitar REPLICA IDENTITY FULL para capturar datos completos en updates
ALTER TABLE seg.notificaciones REPLICA IDENTITY FULL;

-- Agregar la tabla a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE seg.notificaciones;