-- Agregar columna para múltiples remitos
ALTER TABLE mov.movimientos 
ADD COLUMN IF NOT EXISTS remitos_urls TEXT[] DEFAULT '{}';

-- Migrar datos existentes de remito_url a remitos_urls
UPDATE mov.movimientos 
SET remitos_urls = ARRAY[remito_url] 
WHERE remito_url IS NOT NULL AND remito_url != '' AND (remitos_urls IS NULL OR remitos_urls = '{}');