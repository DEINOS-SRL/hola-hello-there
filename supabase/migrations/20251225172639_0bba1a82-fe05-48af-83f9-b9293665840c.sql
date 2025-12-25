-- Asignar el rol Administrador al usuario eduardo.torres con la aplicación de Seguridad
INSERT INTO seg.usuario_rol (usuario_id, rol_id, aplicacion_id)
SELECT 
  '39c8e4fe-95f8-42ae-9869-d9b01e2998c4',
  r.id,
  'e23bf127-8c68-462d-8c4b-de6a3a79c7b8'
FROM seg.roles r
WHERE r.nombre = 'Administrador'
ON CONFLICT DO NOTHING;