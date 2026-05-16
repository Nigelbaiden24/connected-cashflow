
WITH generic_patterns AS (
  SELECT unnest(ARRAY[
    '%photo-1560518883-ce09059eeffa%',
    '%photo-1503376780353-7e6692767b70%',
    '%photo-1518546305927-5a555bb7020d%',
    '%photo-1611974789855-9c2a0a7236a3%',
    '%photo-1523275335684-37898b6baf30%',
    '%photo-1610375461246-83df859d849d%',
    '%photo-1590283603385-17ffb3a7f29f%',
    '%photo-1559136555-9303baea8ebd%',
    '%photo-1551288049-bebda4e38f71%',
    '%photo-1486406146926-c627a92ad1ab%'
  ]) AS pat
),
op_ids AS (
  SELECT id FROM public.opportunity_products
  WHERE thumbnail_url IS NULL OR thumbnail_url = ''
     OR EXISTS (SELECT 1 FROM generic_patterns WHERE thumbnail_url LIKE pat)
),
ifo_ids AS (
  SELECT id FROM public.investor_finder_opportunities
  WHERE image_url IS NULL OR image_url = ''
     OR EXISTS (SELECT 1 FROM generic_patterns WHERE image_url LIKE pat)
),
o_ids AS (
  SELECT id FROM public.opportunities
  WHERE image_url IS NULL OR image_url = ''
     OR EXISTS (SELECT 1 FROM generic_patterns WHERE image_url LIKE pat)
),
all_promoted AS (
  SELECT id FROM op_ids
  UNION ALL SELECT id FROM ifo_ids
  UNION ALL SELECT id FROM o_ids
),
reset_pending AS (
  UPDATE public.pipeline_pending_items
  SET status = 'pending', promoted_id = NULL, reviewed_at = NULL, reviewed_by = NULL
  WHERE promoted_id IN (SELECT id FROM all_promoted)
  RETURNING 1
),
del_op AS (DELETE FROM public.opportunity_products WHERE id IN (SELECT id FROM op_ids) RETURNING 1),
del_ifo AS (DELETE FROM public.investor_finder_opportunities WHERE id IN (SELECT id FROM ifo_ids) RETURNING 1),
del_o AS (DELETE FROM public.opportunities WHERE id IN (SELECT id FROM o_ids) RETURNING 1)
SELECT
  (SELECT count(*) FROM del_op) AS deleted_opportunity_products,
  (SELECT count(*) FROM del_ifo) AS deleted_investor_finder,
  (SELECT count(*) FROM del_o) AS deleted_opportunities,
  (SELECT count(*) FROM reset_pending) AS reset_pending_items;
