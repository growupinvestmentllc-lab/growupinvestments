CREATE POLICY "users upload rent receipts" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-documents' AND name LIKE 'rent-receipts/%');
CREATE OR REPLACE FUNCTION public.set_rent_receipt(_entry_id uuid, _path text, _name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR _path NOT LIKE 'rent-receipts/%' THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF NOT EXISTS (SELECT 1 FROM rental_monthly_entries e JOIN rental_properties p ON p.id = e.property_id
     WHERE e.id = _entry_id AND (has_role(auth.uid(),'admin') OR p.investor_id = auth.uid() OR p.investor_id IS NULL)) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE rental_monthly_entries SET receipt_path = _path, receipt_name = _name WHERE id = _entry_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_rent_receipt(uuid,text,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_rent_receipt(uuid,text,text) TO authenticated;