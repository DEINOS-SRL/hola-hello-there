-- Agregar módulo Equipos
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES 
  ('Equipos', 'Gestión de equipos y maquinaria', 'Truck', '/equipos', NULL, 4, true, ARRAY['equipos.read']);

-- Agregar submódulos de Equipos
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES 
  ('Listado de Equipos', 'Ver todos los equipos', 'List', '/equipos/listado', 
    (SELECT id FROM seg.modulos WHERE ruta = '/equipos'), 1, true, ARRAY['equipos.read']),
  ('Mantenimientos', 'Historial de mantenimientos', 'Wrench', '/equipos/mantenimientos', 
    (SELECT id FROM seg.modulos WHERE ruta = '/equipos'), 2, true, ARRAY['equipos.read']);

-- Agregar módulo Habilitaciones
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES 
  ('Habilitaciones', 'Gestión de habilitaciones y certificaciones', 'BadgeCheck', '/habilitaciones', NULL, 6, true, ARRAY['habilitaciones.read']);

-- Agregar submódulos de Habilitaciones
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES 
  ('Certificaciones', 'Certificaciones de empleados', 'Award', '/habilitaciones/certificaciones', 
    (SELECT id FROM seg.modulos WHERE ruta = '/habilitaciones'), 1, true, ARRAY['habilitaciones.read']),
  ('Vencimientos', 'Control de vencimientos', 'CalendarClock', '/habilitaciones/vencimientos', 
    (SELECT id FROM seg.modulos WHERE ruta = '/habilitaciones'), 2, true, ARRAY['habilitaciones.read']);

-- Agregar submódulo de Partes Diarios
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES 
  ('Registro de Partes', 'Registro diario de partes', 'FileEdit', '/partes-diarios/registro', 
    (SELECT id FROM seg.modulos WHERE ruta = '/partes-diarios'), 1, true, ARRAY['partes.read']),
  ('Historial', 'Historial de partes diarios', 'History', '/partes-diarios/historial', 
    (SELECT id FROM seg.modulos WHERE ruta = '/partes-diarios'), 2, true, ARRAY['partes.read']);