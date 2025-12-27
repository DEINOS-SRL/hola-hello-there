-- =============================================
-- CORRECCIÓN: Recursión infinita en seg.usuario_rol
-- =============================================

-- Paso 1: Eliminar políticas problemáticas existentes
DROP POLICY IF EXISTS "usuario_rol_select" ON seg.usuario_rol;
DROP POLICY IF EXISTS "usuario_rol_insert" ON seg.usuario_rol;
DROP POLICY IF EXISTS "usuario_rol_update" ON seg.usuario_rol;
DROP POLICY IF EXISTS "usuario_rol_delete" ON seg.usuario_rol;
DROP POLICY IF EXISTS "usuario_rol_modify_admin" ON seg.usuario_rol;
DROP POLICY IF EXISTS "usuario_rol_select_own" ON seg.usuario_rol;

-- Paso 2: Crear función SECURITY DEFINER para verificar si es admin
-- Esta función bypassa RLS evitando recursión
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  is_admin BOOLEAN;
BEGIN
  user_email := auth.jwt() ->> 'email';
  
  IF user_email IS NULL THEN 
    RETURN FALSE; 
  END IF;
  
  -- Consulta directa sin pasar por RLS (SECURITY DEFINER)
  SELECT EXISTS (
    SELECT 1
    FROM seg.usuarios u
    INNER JOIN seg.usuario_rol ur ON ur.usuario_id = u.id
    INNER JOIN seg.roles r ON r.id = ur.rol_id
    WHERE u.email = user_email 
    AND u.activo = true
    AND (lower(r.nombre) LIKE '%admin%' OR lower(r.codigo) LIKE '%admin%')
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$;

-- Paso 3: Crear nuevas políticas RLS sin recursión

-- SELECT: usuarios autenticados pueden ver sus propios roles O si son admin
CREATE POLICY "usuario_rol_select_v2" ON seg.usuario_rol
FOR SELECT TO authenticated
USING (
  usuario_id = public.get_current_usuario_id()
  OR public.is_admin_user()
);

-- INSERT: solo admins pueden asignar roles
CREATE POLICY "usuario_rol_insert_v2" ON seg.usuario_rol
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_user());

-- UPDATE: solo admins pueden modificar roles
CREATE POLICY "usuario_rol_update_v2" ON seg.usuario_rol
FOR UPDATE TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- DELETE: solo admins pueden eliminar roles
CREATE POLICY "usuario_rol_delete_v2" ON seg.usuario_rol
FOR DELETE TO authenticated
USING (public.is_admin_user());

-- Paso 4: Asegurar que RLS está habilitado
ALTER TABLE seg.usuario_rol ENABLE ROW LEVEL SECURITY;