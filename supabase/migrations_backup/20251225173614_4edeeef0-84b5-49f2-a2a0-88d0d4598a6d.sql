-- Temporalmente deshabilitar RLS para insertar datos iniciales
ALTER TABLE seg.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE seg.usuario_rol DISABLE ROW LEVEL SECURITY;

-- Insertar rol de Administrador
INSERT INTO seg.roles (nombre, descripcion)
VALUES ('Administrador', 'Rol con acceso total al sistema');

-- Asignar el rol Administrador al usuario eduardo.torres
INSERT INTO seg.usuario_rol (usuario_id, rol_id, aplicacion_id)
SELECT 
  '39c8e4fe-95f8-42ae-9869-d9b01e2998c4',
  r.id,
  'e23bf127-8c68-462d-8c4b-de6a3a79c7b8'
FROM seg.roles r
WHERE r.nombre = 'Administrador';

-- Rehabilitar RLS
ALTER TABLE seg.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seg.usuario_rol ENABLE ROW LEVEL SECURITY;