-- Habilitar replica identity para realtime
ALTER TABLE seg.feedbacks REPLICA IDENTITY FULL;

-- Agregar la tabla a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE seg.feedbacks;