DROP POLICY IF EXISTS "portfolio public read" ON storage.objects;
CREATE POLICY "portfolio project members read" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'portfolio' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(objects.name))[1]
        AND (
          p.investor_id = auth.uid()
          OR (public.current_user_llc() IS NOT NULL AND (
            upper(btrim(p.owner_llc)) = upper(btrim(public.current_user_llc()))
            OR upper(btrim(p.owner_llc_2)) = upper(btrim(public.current_user_llc()))
            OR EXISTS (SELECT 1 FROM public.property_ownerships po
                       WHERE po.project_id = p.id
                         AND upper(btrim(po.llc_name)) = upper(btrim(public.current_user_llc())))
          ))
        )
    )
  )
);

DROP POLICY IF EXISTS "users read rent receipts" ON storage.objects;
CREATE POLICY "users read rent receipts" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'project-documents' AND name LIKE 'rent-receipts/%' AND EXISTS (
    SELECT 1
    FROM public.rental_monthly_entries e
    JOIN public.rental_properties rp ON rp.id = e.property_id
    LEFT JOIN public.projects p ON p.id = rp.project_id
    WHERE e.receipt_path = objects.name
      AND (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR rp.investor_id = auth.uid()
        OR (public.current_user_llc() IS NOT NULL AND (
          upper(btrim(p.owner_llc)) = upper(btrim(public.current_user_llc()))
          OR upper(btrim(p.owner_llc_2)) = upper(btrim(public.current_user_llc()))
        ))
      )
  )
);

DROP POLICY IF EXISTS "owners read own rent receipts" ON storage.objects;
CREATE POLICY "owners read own rent receipts" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'project-documents' AND name LIKE 'rent-receipts/%' AND EXISTS (
    SELECT 1 FROM public.rental_owner_payments r
    WHERE r.receipt_path = objects.name
      AND (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR (public.current_user_llc() IS NOT NULL
            AND upper(btrim(r.llc_name)) = upper(btrim(public.current_user_llc())))
      )
  )
);