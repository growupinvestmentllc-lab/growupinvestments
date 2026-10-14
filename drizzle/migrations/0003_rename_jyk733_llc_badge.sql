DROP TRIGGER IF EXISTS profiles_prevent_llc_change ON public.profiles;

UPDATE public.profiles
   SET llc_name = 'jyk733'
 WHERE email = 'jyk733@llc.com'
   AND llc_name IS DISTINCT FROM 'jyk733';

CREATE TRIGGER profiles_prevent_llc_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_llc_name_change();
