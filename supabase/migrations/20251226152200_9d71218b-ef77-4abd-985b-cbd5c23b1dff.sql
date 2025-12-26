-- Crear bucket para remitos de operaciones
INSERT INTO storage.buckets (id, name, public) 
VALUES ('remitos-operacion', 'remitos-operacion', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para el bucket de remitos
CREATE POLICY "remitos_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'remitos-operacion');

CREATE POLICY "remitos_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'remitos-operacion');

CREATE POLICY "remitos_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'remitos-operacion');

CREATE POLICY "remitos_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'remitos-operacion');