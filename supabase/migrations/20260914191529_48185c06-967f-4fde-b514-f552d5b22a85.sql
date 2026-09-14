UPDATE public.projects
SET construction_cost = 285000,
    total_cost = 285000,
    amount_deposited = 142500
WHERE id = 'f17fd366-0e24-46ed-b5eb-84f669cbb219';

UPDATE public.investments
SET total_deposited = 142500,
    total_pending = 0
WHERE id = 'cfc1cf1e-22b8-4791-8cfa-c30ded3af2b7';

UPDATE public.investments
SET total_deposited = 0,
    total_pending = 142500
WHERE id = 'd47a9384-5084-4a4c-b139-de1660908300';

INSERT INTO public.property_ownerships (
    id, project_id, llc_name, percentage, stage, from_date, notes, created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    'f17fd366-0e24-46ed-b5eb-84f669cbb219',
    'JYL733 LLC',
    50,
    'construccion',
    CURRENT_DATE,
    'Titularidad 50% - JYL733 LLC',
    now(),
    now()
);