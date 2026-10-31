-- The legacy value bi_mensuel was ambiguous. The business has confirmed that
-- it means one visit every two weeks; use an explicit value for all new rows.
UPDATE public.quote_requests
SET frequency = 'toutes_les_deux_semaines'
WHERE frequency = 'bi_mensuel';
