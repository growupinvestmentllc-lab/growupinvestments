UPDATE public.projects
SET lot_cost = 35000,
    total_cost = 320000,
    amount_deposited = 160000
WHERE id = 'f17fd366-0e24-46ed-b5eb-84f669cbb219';

UPDATE public.investments
SET total_deposited = 160000,
    total_pending = 0
WHERE id = 'cfc1cf1e-22b8-4791-8cfa-c30ded3af2b7';

UPDATE public.investments
SET total_deposited = 0,
    total_pending = 160000
WHERE id = 'd47a9384-5084-4a4c-b139-de1660908300';