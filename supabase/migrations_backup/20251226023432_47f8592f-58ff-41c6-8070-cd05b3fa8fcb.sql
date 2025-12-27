-- Política para permitir que usuarios asignados puedan actualizar feedbacks asignados a ellos
CREATE POLICY "Usuarios asignados pueden actualizar feedbacks asignados" 
ON seg.feedbacks 
FOR UPDATE 
TO authenticated
USING (
  asignado_a = public.get_current_usuario_id()
)
WITH CHECK (
  asignado_a = public.get_current_usuario_id()
);