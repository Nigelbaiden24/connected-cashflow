
CREATE OR REPLACE FUNCTION public.approve_pending_item(_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  itm RECORD;
  new_id uuid;
  ref text;
  enriched jsonb;
  v_industry text;
  v_location text;
  v_short text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Admin role required');
  END IF;

  SELECT * INTO itm FROM public.pipeline_pending_items WHERE id = _item_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Item not found');
  END IF;
  IF itm.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Item is not pending (status=' || itm.status || ')');
  END IF;

  enriched := COALESCE(itm.enriched_payload, itm.raw_payload, '{}'::jsonb);

  IF itm.target_table = 'opportunities' THEN
    ref := 'AUTO-' || upper(substring(replace(itm.id::text, '-', '') from 1 for 8));
    v_industry := COALESCE(NULLIF(enriched->>'industry',''), NULLIF(enriched->>'sector',''), NULLIF(itm.category,''), 'General');
    v_location := COALESCE(NULLIF(enriched->>'location',''), NULLIF(enriched->>'country',''), NULLIF(enriched->>'region',''), 'Global');
    v_short := COALESCE(NULLIF(itm.summary,''), NULLIF(enriched->>'description',''), NULLIF(enriched->>'thesis',''), itm.title);

    INSERT INTO public.opportunities (
      ref_number, title, short_description, industry, location,
      business_description, industry_overview, business_highlights,
      financial_summary, team_overview, image_url, status
    ) VALUES (
      ref, itm.title, left(v_short, 500), v_industry, v_location,
      COALESCE(enriched->>'business_description', enriched->>'description', v_short),
      enriched->>'industry_overview',
      CASE WHEN jsonb_typeof(enriched->'highlights') = 'array'
           THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'highlights'))
           WHEN itm.ai_tags IS NOT NULL THEN itm.ai_tags
           ELSE NULL END,
      enriched->>'financial_summary',
      enriched->>'team_overview',
      enriched->>'image_url',
      'draft'
    ) RETURNING id INTO new_id;

  ELSIF itm.target_table = 'intel_events' THEN
    INSERT INTO public.intel_events (
      event_type, event_subtype, title, summary, source_url,
      signal_tier, confidence, confidence_score,
      raw_data, structured_data, status
    ) VALUES (
      COALESCE(enriched->>'event_type', itm.source, 'auto'),
      enriched->>'event_subtype',
      itm.title,
      itm.summary,
      itm.source_url,
      COALESCE(enriched->>'signal_tier', 'medium'),
      COALESCE(enriched->>'confidence', 'medium'),
      COALESCE(itm.ai_score, 3.0),
      enriched,
      enriched,
      'verified'
    ) RETURNING id INTO new_id;

  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'Unsupported target_table: ' || COALESCE(itm.target_table,'NULL'));
  END IF;

  UPDATE public.pipeline_pending_items
  SET status = 'promoted',
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      promoted_id = new_id
  WHERE id = _item_id;

  RETURN jsonb_build_object('ok', true, 'promoted_id', new_id, 'target_table', itm.target_table);
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_pending_item(uuid) TO authenticated;
