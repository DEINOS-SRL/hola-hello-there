-- 1. Desactivar el módulo Empleados que no debería existir como módulo padre
UPDATE seg.modulos SET activo = false WHERE ruta = '/empleados' AND modulo_padre_id IS NULL;

-- 2. Insertar módulo Operación si no existe
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, permisos_requeridos)
SELECT 'Operación', 'Gestión de operaciones y movimientos', 'Workflow', '/operacion', 5, true, NULL, '{}'
WHERE NOT EXISTS (SELECT 1 FROM seg.modulos WHERE ruta = '/operacion');

-- 3. Insertar submódulo Movimientos dentro de Operación
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, permisos_requeridos)
SELECT 'Movimientos', 'Gestión de movimientos de equipos y recursos', 'ArrowLeftRight', '/operacion/movimientos', 1, true, 
  (SELECT id FROM seg.modulos WHERE ruta = '/operacion'), '{}'
WHERE NOT EXISTS (SELECT 1 FROM seg.modulos WHERE ruta = '/operacion/movimientos');

-- 4. Insertar submódulo Empleados dentro de RRHH
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, permisos_requeridos)
SELECT 'Empleados', 'Gestión de empleados', 'UserCheck', '/rrhh/empleados', 1, true, 
  (SELECT id FROM seg.modulos WHERE ruta = '/rrhh'), '{}'
WHERE NOT EXISTS (SELECT 1 FROM seg.modulos WHERE ruta = '/rrhh/empleados');

-- 5. Insertar submódulo Asistencia dentro de RRHH
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, permisos_requeridos)
SELECT 'Asistencia', 'Control de asistencia y permisos', 'Clock', '/rrhh/asistencia', 2, true, 
  (SELECT id FROM seg.modulos WHERE ruta = '/rrhh'), '{}'
WHERE NOT EXISTS (SELECT 1 FROM seg.modulos WHERE ruta = '/rrhh/asistencia');