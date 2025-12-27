-- Insertar "Partes de Equipos" como submódulo de Operación
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES (
  'Partes de Equipos',
  'Gestión de partes diarios de equipos y maquinaria',
  'ClipboardList',
  '/operacion/partes-equipos',
  '03be0b7d-dd07-4b0d-955c-010f3f91a874', -- ID de Operación
  2,
  true,
  ARRAY[]::text[]
);

-- Desactivar el módulo "Partes Diarios" obsoleto (estaba como módulo raíz)
UPDATE seg.modulos 
SET activo = false 
WHERE id = '0ae11348-be28-4d3b-8ad8-ed0d18dee925';