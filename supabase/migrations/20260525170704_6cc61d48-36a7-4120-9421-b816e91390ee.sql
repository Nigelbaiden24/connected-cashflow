DELETE FROM public.pipeline_pending_items
WHERE status = 'pending'
  AND (
    source NOT IN ('investor-research','opportunity-research')
    OR COALESCE(target_table,'') <> 'opportunity_products'
  );