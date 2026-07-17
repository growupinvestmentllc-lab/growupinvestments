
-- 1) Update lot costs per uploaded spreadsheet
UPDATE public.projects p
SET lot_cost = v.lot
FROM (VALUES
  ('472 Rajah St', 43539.63::numeric),
  ('2725 Embers Pkwy W', 45000),
  ('477 Rayford St', 25700),
  ('2130 NE 26th St', 46500),
  ('448 Rajah St', 0),
  ('2812 NW 27th Ave', 55000),
  ('2217 SW Embers Ter', 0),
  ('2446 Embers Pkwy W', 40973),
  ('2434 Embers Pkwy W', 0),
  ('621 Flamingo Ave S', 26500),
  ('1405 Cortez Ave', 0),
  ('710 Jaguar Blvd', 22000),
  ('365 Progress Ave', 28900),
  ('7305 Sun N Lake Blvd', 0),
  ('35 SW 19th Ct', 0),
  ('127 NW 24th Pl', 0),
  ('2258 Embers Pkwy W', 0),
  ('925 NW 16th Pl', 0),
  ('5963 Virtudes St', 0),
  ('14 Trout Way', 0)
) AS v(addr, lot)
WHERE p.address LIKE v.addr || '%';

-- 2) Reset draw_amount for all project stages we're about to update
WITH targets AS (
  SELECT id FROM public.projects WHERE address LIKE ANY (ARRAY[
    '472 Rajah St%','2725 Embers Pkwy W%','477 Rayford St%','2130 NE 26th St%',
    '448 Rajah St%','2812 NW 27th Ave%','2217 SW Embers Ter%','2446 Embers Pkwy W%',
    '2434 Embers Pkwy W%','621 Flamingo Ave S%','1405 Cortez Ave%','710 Jaguar Blvd%',
    '365 Progress Ave%','7305 Sun N Lake Blvd%','35 SW 19th Ct%','127 NW 24th Pl%',
    '2258 Embers Pkwy W%','925 NW 16th Pl%','5963 Virtudes St%','14 Trout Way%'
  ])
)
UPDATE public.project_stages ps SET draw_amount = 0
WHERE ps.project_id IN (SELECT id FROM targets);

-- 3) Set draw totals on the first stage of each group per project
WITH draw_data(addr, grp, amount) AS (VALUES
  -- 472 Rajah St
  ('472 Rajah St','Soft Construction',49600::numeric),
  ('472 Rajah St','Hard Construction 1',37200),
  ('472 Rajah St','Hard Construction 2',49600),
  ('472 Rajah St','Hard Construction 3',49600),
  ('472 Rajah St','Hard Construction 4',49600),
  ('472 Rajah St','CO (Certificate of Occupancy)',12400),
  -- 2725 Embers Pkwy W
  ('2725 Embers Pkwy W','Soft Construction',178200),
  ('2725 Embers Pkwy W','Hard Construction 1',89100),
  ('2725 Embers Pkwy W','Hard Construction 2',44550),
  ('2725 Embers Pkwy W','Hard Construction 3',44550),
  ('2725 Embers Pkwy W','Hard Construction 4',0),
  ('2725 Embers Pkwy W','CO (Certificate of Occupancy)',0),
  -- 477 Rayford St
  ('477 Rayford St','Soft Construction',25700),
  ('477 Rayford St','Hard Construction 1',67900),
  ('477 Rayford St','Hard Construction 2',97333.33),
  ('477 Rayford St','Hard Construction 3',59833.33),
  ('477 Rayford St','Hard Construction 4',59833.33),
  ('477 Rayford St','CO (Certificate of Occupancy)',12400),
  -- 2130 NE 26th St
  ('2130 NE 26th St','Soft Construction',49600),
  ('2130 NE 26th St','Hard Construction 1',37300),
  ('2130 NE 26th St','Hard Construction 2',49600),
  ('2130 NE 26th St','Hard Construction 3',49600),
  ('2130 NE 26th St','Hard Construction 4',49600),
  ('2130 NE 26th St','CO (Certificate of Occupancy)',12400),
  -- 2812 NW 27th Ave
  ('2812 NW 27th Ave','Soft Construction',64600),
  ('2812 NW 27th Ave','Hard Construction 1',103933.33),
  ('2812 NW 27th Ave','Hard Construction 2',66433.33),
  ('2812 NW 27th Ave','Hard Construction 3',66433.33),
  ('2812 NW 27th Ave','Hard Construction 4',0),
  ('2812 NW 27th Ave','CO (Certificate of Occupancy)',0),
  -- 2217 SW Embers Ter
  ('2217 SW Embers Ter','Soft Construction',57200),
  ('2217 SW Embers Ter','Hard Construction 1',37350),
  ('2217 SW Embers Ter','Hard Construction 2',31000),
  ('2217 SW Embers Ter','Hard Construction 3',0),
  ('2217 SW Embers Ter','Hard Construction 4',0),
  ('2217 SW Embers Ter','CO (Certificate of Occupancy)',0),
  -- 2446 Embers Pkwy W
  ('2446 Embers Pkwy W','Soft Construction',61200),
  ('2446 Embers Pkwy W','Hard Construction 1',61200),
  ('2446 Embers Pkwy W','Hard Construction 2',66206),
  ('2446 Embers Pkwy W','Hard Construction 3',20000),
  ('2446 Embers Pkwy W','Hard Construction 4',61200),
  ('2446 Embers Pkwy W','CO (Certificate of Occupancy)',14300),
  -- 2434 Embers Pkwy W
  ('2434 Embers Pkwy W','Soft Construction',61200),
  ('2434 Embers Pkwy W','Hard Construction 1',76500),
  ('2434 Embers Pkwy W','Hard Construction 2',81512),
  ('2434 Embers Pkwy W','Hard Construction 3',45900),
  ('2434 Embers Pkwy W','Hard Construction 4',30600),
  ('2434 Embers Pkwy W','CO (Certificate of Occupancy)',45900),
  -- 621 Flamingo Ave S
  ('621 Flamingo Ave S','Soft Construction',58580),
  ('621 Flamingo Ave S','Hard Construction 1',55080),
  ('621 Flamingo Ave S','Hard Construction 2',55080),
  ('621 Flamingo Ave S','Hard Construction 3',55080),
  ('621 Flamingo Ave S','Hard Construction 4',39780),
  ('621 Flamingo Ave S','CO (Certificate of Occupancy)',15300),
  -- 1405 Cortez Ave
  ('1405 Cortez Ave','Soft Construction',52000),
  ('1405 Cortez Ave','Hard Construction 1',52000),
  ('1405 Cortez Ave','Hard Construction 2',52000),
  ('1405 Cortez Ave','Hard Construction 3',52000),
  ('1405 Cortez Ave','Hard Construction 4',44200),
  ('1405 Cortez Ave','CO (Certificate of Occupancy)',9900),
  -- 710 Jaguar Blvd
  ('710 Jaguar Blvd','Soft Construction',0),
  ('710 Jaguar Blvd','Hard Construction 1',0),
  ('710 Jaguar Blvd','Hard Construction 2',0),
  ('710 Jaguar Blvd','Hard Construction 3',0),
  ('710 Jaguar Blvd','Hard Construction 4',0),
  ('710 Jaguar Blvd','CO (Certificate of Occupancy)',7800),
  -- 365 Progress Ave
  ('365 Progress Ave','Soft Construction',56500),
  ('365 Progress Ave','Hard Construction 1',53000),
  ('365 Progress Ave','Hard Construction 2',53000),
  ('365 Progress Ave','Hard Construction 3',53000),
  ('365 Progress Ave','Hard Construction 4',39750),
  ('365 Progress Ave','CO (Certificate of Occupancy)',13250)
),
matched AS (
  SELECT p.id AS pid, dd.grp, dd.amount
  FROM draw_data dd
  JOIN public.projects p ON p.address LIKE dd.addr || '%'
),
first_stage AS (
  SELECT DISTINCT ON (ps.project_id, ps.stage_group) ps.id, ps.project_id, ps.stage_group
  FROM public.project_stages ps
  WHERE (ps.project_id, ps.stage_group) IN (SELECT pid, grp FROM matched)
  ORDER BY ps.project_id, ps.stage_group, ps.stage_order
)
UPDATE public.project_stages ps
SET draw_amount = m.amount
FROM first_stage fs
JOIN matched m ON m.pid = fs.project_id AND m.grp = fs.stage_group
WHERE ps.id = fs.id;
