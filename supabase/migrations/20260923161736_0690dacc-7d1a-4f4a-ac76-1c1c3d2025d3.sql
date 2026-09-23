DROP POLICY IF EXISTS "users upload rent receipts" ON storage.objects;
DROP FUNCTION IF EXISTS public.set_rent_receipt(uuid,text,text);