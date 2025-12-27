-- Crear tabla de favoritos de usuario
CREATE TABLE seg.usuario_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES seg.usuarios(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES seg.modulos(id) ON DELETE CASCADE,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, modulo_id)
);

-- Habilitar RLS
ALTER TABLE seg.usuario_favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuarios solo ven y modifican sus propios favoritos
CREATE POLICY "Usuarios pueden ver sus favoritos"
ON seg.usuario_favoritos FOR SELECT
TO authenticated
USING (
  usuario_id IN (
    SELECT id FROM seg.usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuarios pueden agregar favoritos"
ON seg.usuario_favoritos FOR INSERT
TO authenticated
WITH CHECK (
  usuario_id IN (
    SELECT id FROM seg.usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuarios pueden eliminar sus favoritos"
ON seg.usuario_favoritos FOR DELETE
TO authenticated
USING (
  usuario_id IN (
    SELECT id FROM seg.usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuarios pueden actualizar orden de favoritos"
ON seg.usuario_favoritos FOR UPDATE
TO authenticated
USING (
  usuario_id IN (
    SELECT id FROM seg.usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

-- Permisos
GRANT USAGE ON SCHEMA seg TO anon, authenticated;
GRANT ALL ON seg.usuario_favoritos TO anon, authenticated;