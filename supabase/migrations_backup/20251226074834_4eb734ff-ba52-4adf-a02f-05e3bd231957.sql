-- Insertar módulo Partes Diarios como hijo de RRHH
INSERT INTO seg.modulos (
  nombre, 
  descripcion, 
  ruta, 
  icono, 
  orden, 
  modulo_padre_id, 
  activo, 
  permisos_requeridos
)
VALUES (
  'Partes Diarios',
  'Registro diario de actividades y novedades del equipo',
  '/rrhh/partes-diarios',
  'ClipboardList',
  3,
  '39bedda1-bb48-4770-a02c-ba5dba05a00f',
  true,
  ARRAY[]::text[]
);