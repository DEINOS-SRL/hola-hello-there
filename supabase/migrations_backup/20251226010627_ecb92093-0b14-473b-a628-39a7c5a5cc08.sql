-- Map auth.uid() -> seg.usuarios.id via email in JWT
CREATE OR REPLACE FUNCTION public.get_current_usuario_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
  usuario_uuid UUID;
BEGIN
  user_email := auth.jwt() ->> 'email';

  IF user_email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT u.id INTO usuario_uuid
  FROM seg.usuarios u
  WHERE u.email = user_email AND u.activo = true
  LIMIT 1;

  RETURN usuario_uuid;
END;
$function$;

-- Tighten INSERT policy: user can only insert as their mapped seg.usuarios.id
DROP POLICY IF EXISTS "Usuarios pueden crear feedbacks" ON seg.feedbacks;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios feedbacks" ON seg.feedbacks;

CREATE POLICY "Usuarios pueden insertar sus propios feedbacks"
ON seg.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (usuario_id = public.get_current_usuario_id());

-- Fix SELECT policy to match the same mapping
DROP POLICY IF EXISTS "Usuarios pueden ver sus feedbacks" ON seg.feedbacks;

CREATE POLICY "Usuarios pueden ver sus feedbacks"
ON seg.feedbacks
FOR SELECT
TO authenticated
USING ((usuario_id = public.get_current_usuario_id()) OR seg.is_admin(auth.uid()));

-- Keep UPDATE policy for admins as-is (already exists)

-- Fix helper RPC for profile history
CREATE OR REPLACE FUNCTION seg.get_my_feedbacks()
RETURNS SETOF seg.feedbacks
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'seg'
AS $function$
  SELECT *
  FROM seg.feedbacks
  WHERE usuario_id = public.get_current_usuario_id()
  ORDER BY created_at DESC;
$function$;