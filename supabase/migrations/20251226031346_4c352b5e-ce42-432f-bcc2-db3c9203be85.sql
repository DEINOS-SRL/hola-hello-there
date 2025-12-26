-- Fix RLS policies for feedback_historial_estados table
DROP POLICY IF EXISTS "feedback_historial_insert" ON seg.feedback_historial_estados;
DROP POLICY IF EXISTS "feedback_historial_select" ON seg.feedback_historial_estados;
DROP POLICY IF EXISTS "Usuarios pueden insertar historial" ON seg.feedback_historial_estados;
DROP POLICY IF EXISTS "Usuarios pueden ver historial" ON seg.feedback_historial_estados;

-- Allow authenticated users to insert historial
CREATE POLICY "Usuarios autenticados pueden insertar historial"
ON seg.feedback_historial_estados
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to view historial
CREATE POLICY "Usuarios autenticados pueden ver historial"
ON seg.feedback_historial_estados
FOR SELECT
TO authenticated
USING (true);

-- Also fix feedbacks update policy if needed
DROP POLICY IF EXISTS "feedbacks_update" ON seg.feedbacks;
DROP POLICY IF EXISTS "Usuarios pueden actualizar feedbacks" ON seg.feedbacks;

CREATE POLICY "Usuarios autenticados pueden actualizar feedbacks"
ON seg.feedbacks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);