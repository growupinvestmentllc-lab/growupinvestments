ALTER TABLE public.profiles DISABLE TRIGGER profiles_prevent_llc_change;
UPDATE public.profiles SET llc_name = 'JYL733 LLC', full_name = 'jyk733' WHERE id = 'ecbaa072-1825-4b2d-931c-5e9e3b991072';
ALTER TABLE public.profiles ENABLE TRIGGER profiles_prevent_llc_change;