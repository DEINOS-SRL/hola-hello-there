-- Insertar submódulos de Administración (antes estaban como páginas de Seguridad)
INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES 
  ('Empresas', 'Gestión de empresas', 'Building2', '/configuracion/administracion/empresas', 'e23bf127-8c68-462d-8c4b-de6a3a79c7b8', 1, true, ARRAY['security.empresas.read']),
  ('Usuarios', 'Gestión de usuarios', 'Users', '/configuracion/administracion/usuarios', 'e23bf127-8c68-462d-8c4b-de6a3a79c7b8', 2, true, ARRAY['security.usuarios.read']),
  ('Roles', 'Gestión de roles y permisos', 'Shield', '/configuracion/administracion/roles', 'e23bf127-8c68-462d-8c4b-de6a3a79c7b8', 3, true, ARRAY['security.roles.read']),
  ('Módulos', 'Gestión de módulos del sistema', 'LayoutGrid', '/configuracion/administracion/modulos', 'e23bf127-8c68-462d-8c4b-de6a3a79c7b8', 4, true, ARRAY['security.modulos.read']);