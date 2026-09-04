DO $$
DECLARE
  admin_id uuid := '044c41c0-a7ee-4f4c-b886-90c9bd1d5f72';
  pid uuid;
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('568 Cypress St, Lehigh Acres, FL', 'En construcción', ARRAY['750 ST LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('708 Jaguar Blvd, Lehigh Acres, FL', 'En construcción', ARRAY['SAME LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('11224 Kimberly Ave, Englewood, FL', 'Alquilada', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'alquiler'),
      ('11226 Kimberly Ave, Englewood, FL', 'Alquilada', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'alquiler'),
      ('715 Little Rock St E, Lehigh Acres, FL', 'A la venta', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('3604 74th St W, Lehigh Acres, FL', 'A la venta', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('329 NE 13th St, Cape Coral, FL', 'A la venta', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('1401 Newton St, Lehigh Acres, FL', 'En construcción', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('7105 Princeton St, Lehigh Acres, FL', 'En construcción', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('3404 Douglas Rd, Lehigh Acres, FL', 'En construcción', ARRAY['GROWUP INVESTMENTS LLC'], ARRAY[100]::numeric[], 'construccion'),
      ('5747 Cortez Blvd, Sebring, FL', 'En construcción', ARRAY['GROWUP INVESTMENTS LLC','GRAM LLC'], ARRAY[50,50]::numeric[], 'construccion'),
      ('4309 Cortez Blvd, Sebring, FL', 'En construcción', ARRAY['GROWUP INVESTMENTS LLC','GRAM LLC'], ARRAY[50,50]::numeric[], 'construccion')
    ) AS t(address, status, llcs, pcts, stage)
  LOOP
    SELECT id INTO pid FROM public.projects WHERE address = rec.address;
    IF pid IS NULL THEN
      INSERT INTO public.projects (investor_id, address, status, total_value, amount_deposited)
      VALUES (admin_id, rec.address, rec.status, 0, 0)
      RETURNING id INTO pid;
    END IF;

    FOR i IN 1..array_length(rec.llcs, 1) LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.property_ownerships
        WHERE project_id = pid AND llc_name = rec.llcs[i] AND stage = rec.stage
      ) THEN
        INSERT INTO public.property_ownerships (project_id, llc_name, percentage, stage)
        VALUES (pid, rec.llcs[i], rec.pcts[i], rec.stage);
      END IF;
    END LOOP;
  END LOOP;

  -- 1153 Chalmer Ter: vendida por TIFEMO, hoy GrowUp la posee al 100%
  SELECT id INTO pid FROM public.projects WHERE address = '1153 Chalmer Ter, Port Charlotte, FL';
  IF pid IS NULL THEN
    INSERT INTO public.projects (investor_id, address, status, total_value, amount_deposited)
    VALUES (admin_id, '1153 Chalmer Ter, Port Charlotte, FL', 'Alquilada', 0, 0)
    RETURNING id INTO pid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.property_ownerships WHERE project_id = pid AND llc_name = 'TIFEMO LLC') THEN
    INSERT INTO public.property_ownerships (project_id, llc_name, percentage, stage, to_date)
    VALUES (pid, 'TIFEMO LLC', 100, 'venta', CURRENT_DATE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.property_ownerships WHERE project_id = pid AND llc_name = 'GROWUP INVESTMENTS LLC') THEN
    INSERT INTO public.property_ownerships (project_id, llc_name, percentage, stage)
    VALUES (pid, 'GROWUP INVESTMENTS LLC', 100, 'alquiler');
  END IF;
END $$;