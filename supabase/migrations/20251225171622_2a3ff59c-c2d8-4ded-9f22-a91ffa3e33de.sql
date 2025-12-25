-- Crear tabla de notificaciones en schema seg
CREATE TABLE seg.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'message')),
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_notificaciones_usuario ON seg.notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_empresa ON seg.notificaciones(empresa_id);
CREATE INDEX idx_notificaciones_leida ON seg.notificaciones(leida);
CREATE INDEX idx_notificaciones_created ON seg.notificaciones(created_at DESC);

-- Habilitar RLS
ALTER TABLE seg.notificaciones ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo ven sus propias notificaciones
CREATE POLICY "Usuarios ven sus notificaciones"
ON seg.notificaciones
FOR SELECT
TO authenticated
USING (
  usuario_id IN (
    SELECT u.id FROM seg.usuarios u 
    WHERE u.email = (auth.jwt() ->> 'email')
  )
);

-- Política: usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "Usuarios actualizan sus notificaciones"
ON seg.notificaciones
FOR UPDATE
TO authenticated
USING (
  usuario_id IN (
    SELECT u.id FROM seg.usuarios u 
    WHERE u.email = (auth.jwt() ->> 'email')
  )
)
WITH CHECK (
  usuario_id IN (
    SELECT u.id FROM seg.usuarios u 
    WHERE u.email = (auth.jwt() ->> 'email')
  )
);

-- Política: el sistema puede insertar notificaciones (para admins o triggers)
CREATE POLICY "Sistema inserta notificaciones"
ON seg.notificaciones
FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.get_current_user_empresa_id()
);

-- Trigger para updated_at
CREATE TRIGGER update_notificaciones_updated_at
BEFORE UPDATE ON seg.notificaciones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunas notificaciones de ejemplo para testing
INSERT INTO seg.notificaciones (empresa_id, usuario_id, titulo, mensaje, tipo, leida, created_at)
SELECT 
  u.empresa_id,
  u.id,
  'Bienvenido a DNSCloud',
  'Tu cuenta ha sido configurada correctamente. ¡Comienza a explorar los módulos!',
  'success',
  false,
  now() - interval '5 minutes'
FROM seg.usuarios u
WHERE u.email = 'eduardo.torres@deinos.com.ar'
AND u.empresa_id IS NOT NULL;

INSERT INTO seg.notificaciones (empresa_id, usuario_id, titulo, mensaje, tipo, leida, created_at)
SELECT 
  u.empresa_id,
  u.id,
  'Nuevo módulo disponible',
  'El módulo de Empleados está listo para usar. Configura tu equipo ahora.',
  'info',
  false,
  now() - interval '1 hour'
FROM seg.usuarios u
WHERE u.email = 'eduardo.torres@deinos.com.ar'
AND u.empresa_id IS NOT NULL;

INSERT INTO seg.notificaciones (empresa_id, usuario_id, titulo, mensaje, tipo, leida, created_at)
SELECT 
  u.empresa_id,
  u.id,
  'Recordatorio de seguridad',
  'Recuerda cambiar tu contraseña periódicamente para mantener tu cuenta segura.',
  'warning',
  true,
  now() - interval '2 days'
FROM seg.usuarios u
WHERE u.email = 'eduardo.torres@deinos.com.ar'
AND u.empresa_id IS NOT NULL;