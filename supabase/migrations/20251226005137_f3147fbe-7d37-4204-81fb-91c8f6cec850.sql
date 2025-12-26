-- Fix RLS policy for feedbacks INSERT - use auth.uid() directly
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios feedbacks" ON seg.feedbacks;

CREATE POLICY "Usuarios pueden insertar sus propios feedbacks"
ON seg.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- Also add function to get user's own feedbacks
CREATE OR REPLACE FUNCTION seg.get_my_feedbacks()
RETURNS SETOF seg.feedbacks
LANGUAGE sql
SECURITY DEFINER
SET search_path = seg
AS $$
  SELECT * FROM seg.feedbacks
  WHERE usuario_id = auth.uid()
  ORDER BY created_at DESC;
$$;