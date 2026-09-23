ALTER TABLE public.rental_monthly_entries ADD COLUMN IF NOT EXISTS receipt_path text, ADD COLUMN IF NOT EXISTS receipt_name text;
CREATE POLICY "users read rent receipts" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-documents' AND name LIKE 'rent-receipts/%' AND EXISTS (SELECT 1 FROM public.rental_monthly_entries e WHERE e.receipt_path = objects.name));