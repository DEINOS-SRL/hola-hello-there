-- Primero eliminar las políticas problemáticas
DROP POLICY IF EXISTS "Usuarios pueden ver usuarios de su empresa" ON public.seg_usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios datos" ON public.seg_usuarios;

-- Recrear la función get_current_user_empresa_id para que sea más segura
CREATE OR REPLACE FUNCTION public.get_current_user_empresa_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_empresa_id UUID;
BEGIN
  -- Obtener el email del JWT token directamente
  user_email := auth.jwt() ->> 'email';
  
  -- Si no hay usuario autenticado, retornar null
  IF user_email IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Obtener empresa_id del usuario desde la tabla seg_usuarios
  SELECT empresa_id INTO user_empresa_id
  FROM seg_usuarios
  WHERE email = user_email AND activo = true;
  
  RETURN user_empresa_id;
END;
$$;

-- Crear nueva política de SELECT que use auth.jwt() en lugar de auth.users
CREATE POLICY "Usuarios pueden ver usuarios de su empresa" 
ON public.seg_usuarios 
FOR SELECT 
TO authenticated
USING (
  empresa_id = get_current_user_empresa_id() 
  OR email = (auth.jwt() ->> 'email')
);

-- Crear nueva política de UPDATE
CREATE POLICY "Usuarios pueden actualizar sus propios datos" 
ON public.seg_usuarios 
FOR UPDATE 
TO authenticated
USING (email = (auth.jwt() ->> 'email'))
WITH CHECK (email = (auth.jwt() ->> 'email'));