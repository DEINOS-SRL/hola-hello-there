-- Insertar módulo Base de Conocimiento
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, permisos_requeridos)
VALUES ('Base de Conocimiento', 'Gestión del conocimiento corporativo', 'BookOpen', '/conocimiento', 8, true, NULL, '{}');

-- Insertar submódulo SGI dentro de Base de Conocimiento
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, permisos_requeridos)
VALUES ('SGI', 'Sistema de Gestión Integrada', 'FileCheck', '/conocimiento/sgi', 1, true, 
  (SELECT id FROM seg.modulos WHERE ruta = '/conocimiento'), '{}');