BEGIN;

-- Hard Construction 3: set all to 0 first
UPDATE project_stages
SET draw_amount = 0
WHERE project_id = 'f6705699-6576-4ecf-99eb-8d54b41d382e'
  AND stage_group = 'Hard Construction 3';

-- Set the first stage in Hard Construction 3 to 61,200
UPDATE project_stages
SET draw_amount = 61200
WHERE id = (
  SELECT id FROM project_stages
  WHERE project_id = 'f6705699-6576-4ecf-99eb-8d54b41d382e'
    AND stage_group = 'Hard Construction 3'
  ORDER BY stage_order ASC
  LIMIT 1
);

-- CO (Certificate of Occupancy): set all to 0 first
UPDATE project_stages
SET draw_amount = 0
WHERE project_id = 'f6705699-6576-4ecf-99eb-8d54b41d382e'
  AND stage_group = 'CO (Certificate of Occupancy)';

-- Set the first stage in CO to 15,300
UPDATE project_stages
SET draw_amount = 15300
WHERE id = (
  SELECT id FROM project_stages
  WHERE project_id = 'f6705699-6576-4ecf-99eb-8d54b41d382e'
    AND stage_group = 'CO (Certificate of Occupancy)'
  ORDER BY stage_order ASC
  LIMIT 1
);

COMMIT;