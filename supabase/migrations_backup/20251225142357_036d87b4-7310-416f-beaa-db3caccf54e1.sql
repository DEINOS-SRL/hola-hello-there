-- Agregar campo repositorio
ALTER TABLE public.seg_aplicaciones
ADD COLUMN repositorio text DEFAULT NULL;