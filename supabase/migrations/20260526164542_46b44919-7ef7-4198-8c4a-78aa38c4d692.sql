
-- 1) Prevent non-admin users from changing llc_name on their own profile
CREATE OR REPLACE FUNCTION public.prevent_llc_name_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.llc_name IS DISTINCT FROM OLD.llc_name
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can change llc_name';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_llc_change ON public.profiles;
CREATE TRIGGER profiles_prevent_llc_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_llc_name_change();

-- 2) Lock down project-images storage bucket to admins only for writes
DROP POLICY IF EXISTS "auth upload project-images" ON storage.objects;
DROP POLICY IF EXISTS "public read project-images" ON storage.objects;
DROP POLICY IF EXISTS "admins manage project-images" ON storage.objects;

CREATE POLICY "admins manage project-images"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- (Public viewing still works because the bucket is public; direct object URLs
--  served by the storage CDN do not require a SELECT policy.)

-- 3) Revoke EXECUTE on SECURITY DEFINER helpers from public roles.
--    RLS policies that call these functions still work because policy evaluation
--    runs in the table owner's context, not the API caller's role.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_llc() FROM PUBLIC, anon, authenticated;
