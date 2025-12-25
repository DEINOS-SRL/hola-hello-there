-- Agregar campos para documentos y PRD
ALTER TABLE public.seg_aplicaciones
ADD COLUMN link_documentos text DEFAULT NULL,
ADD COLUMN prd_documento text DEFAULT NULL;