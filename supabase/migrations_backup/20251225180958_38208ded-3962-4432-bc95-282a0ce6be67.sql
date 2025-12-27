-- Insertar módulo RRHH como módulo principal
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, activo, orden)
VALUES ('RRHH', 'Gestión de Recursos Humanos', 'Users', '/rrhh', true, 1);

-- Insertar Empleados como submódulo de RRHH
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, activo, orden, modulo_padre_id)
VALUES ('Empleados', 'Gestión de empleados de la empresa', 'UserCheck', '/empleados', true, 1, 
  (SELECT id FROM seg.modulos WHERE nombre = 'RRHH' LIMIT 1)
);